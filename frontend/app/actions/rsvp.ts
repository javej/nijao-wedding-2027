"use server";

// import { verifyTurnstileToken } from "@/lib/turnstile";
import { revalidateTag } from "next/cache";
import { appendRsvpRows } from "@/lib/sheets";
import { sendRsvpConfirmation } from "@/lib/resend";
import { writeClient } from "@/sanity/lib/write";
import { isRsvpClosed } from "@/lib/rsvp-cutoff";
import { normalizeEmail, normalizePhMobile } from "@/lib/contact";

// --- Types ---

export interface RSVPPayload {
  guestSlug: string;
  guestName: string;
  attending: boolean;
  plusOneName?: string;
  turnstileToken: string;
  linkedGuest?: { name: string; slug?: string; attending: boolean };
  plusOneType?: "linked" | "open" | null;
  plusOneAttending?: boolean;
  linkedPartnerSlug?: string;
  guestEmail?: string;
  guestMobile?: string;
}

export type RSVPErrorCode =
  | "rsvp_closed"
  | "sanity_unavailable"
  | "sheets_unavailable"
  | "unexpected";

/**
 * The audit-log subset of an RSVP. This — not the full {@link RSVPPayload} — is
 * what the client queues for retry when the Sheets append fails, so a replay
 * only re-appends the row(s); it never re-writes Sanity or re-sends the email.
 * `linkedGuest` is present only when the partner cross-mutation actually landed
 * (see {@link writeSanityRsvp}), keeping the sheet consistent with Sanity.
 */
export interface RsvpAuditPayload {
  guestName: string;
  guestSlug: string;
  attending: boolean;
  plusOneName?: string;
  linkedGuest?: { name: string; slug?: string; attending: boolean };
}

export type ActionResult =
  | { success: true }
  | { success: false; error: RSVPErrorCode; retryAudit?: RsvpAuditPayload };

interface GuestLookup {
  _id: string;
  _rev: string;
  rsvpStatus?: "pending" | "attending" | "declined";
}

// --- Server Action ---

export async function submitRsvp(payload: RSVPPayload): Promise<ActionResult> {
  // 1. Cutoff guard — same constant as the page renderer
  if (isRsvpClosed()) {
    return { success: false, error: "rsvp_closed" };
  }

  // 2. Validate Turnstile token — temporarily disabled
  // const turnstileValid = await verifyTurnstileToken(payload.turnstileToken);
  // if (!turnstileValid) {
  //   return { success: false, error: "Verification failed" };
  // }

  // 3. Write to Sanity (authoritative). Sheets append + email follow.
  let partnerWritten = false;
  try {
    ({ partnerWritten } = await writeSanityRsvp(payload));
  } catch (error) {
    console.error("[submitRsvp] Sanity write failed:", error);
    return { success: false, error: "sanity_unavailable" };
  }

  // The audit row mirrors Sanity: include the linked partner's row only when
  // their cross-mutation actually committed, so the sheet never claims a "yes"
  // the guest doc doesn't reflect.
  const auditPayload: RsvpAuditPayload = {
    guestName: payload.guestName,
    guestSlug: payload.guestSlug,
    attending: payload.attending,
    ...(payload.plusOneName && { plusOneName: payload.plusOneName }),
    ...(partnerWritten && payload.linkedGuest && { linkedGuest: payload.linkedGuest }),
  };

  // 4. Append the audit log row(s). Best-effort — Sanity already committed, so a
  // Sheets failure returns the audit payload for the client to queue. The retry
  // (`retryRsvpAudit`) re-appends ONLY; it never re-writes Sanity or re-emails.
  try {
    await appendRsvpRows(auditPayload);
  } catch (error) {
    console.error("[submitRsvp] Sheets write failed:", error);
    return { success: false, error: "sheets_unavailable", retryAudit: auditPayload };
  }

  // 5. Send confirmation email (best-effort — never blocks success).
  if (payload.attending && payload.guestEmail) {
    void sendRsvpConfirmation({
      guestName: payload.guestName,
      guestEmail: payload.guestEmail,
    });
  }

  return { success: true };
}

/**
 * Retry a failed audit-log append in isolation. Called by the client's
 * localStorage retry queue after a {@link submitRsvp} `sheets_unavailable`.
 * Idempotent w.r.t. Sanity and email: it touches neither. A duplicate row is
 * still possible if the original append partially succeeded, but that is far
 * cheaper to reconcile than a duplicate guest mutation or confirmation email.
 */
export async function retryRsvpAudit(
  payload: RsvpAuditPayload,
): Promise<ActionResult> {
  try {
    await appendRsvpRows(payload);
  } catch (error) {
    console.error("[retryRsvpAudit] Sheets write failed:", error);
    return { success: false, error: "sheets_unavailable" };
  }
  return { success: true };
}

// --- Contact-only update (summary-card nudge) ---

export interface GuestContactPayload {
  guestSlug: string;
  guestEmail?: string;
  guestMobile?: string;
}

export type ContactResult =
  | { success: true }
  | { success: false; error: "invalid" | "sanity_unavailable" };

/**
 * Backfill a guest's contact without touching their RSVP. Used by the
 * summary-card nudge (ADR-0006) for attending guests who have no contact on
 * file — notably a linked partner answered-for by their submitter, who never
 * sees the chat. Sets only the provided fields; never unsets, never mutates
 * rsvpStatus or the audit log.
 */
export async function submitGuestContact(
  payload: GuestContactPayload,
): Promise<ContactResult> {
  const email = payload.guestEmail ? normalizeEmail(payload.guestEmail) : null;
  const mobile = payload.guestMobile
    ? normalizePhMobile(payload.guestMobile)
    : null;

  if (!email && !mobile) {
    return { success: false, error: "invalid" };
  }

  let status: GuestLookup["rsvpStatus"];
  let guestName = "";
  let hadEmailBefore = false;
  try {
    const guest = await writeClient.fetch<
      (GuestLookup & { firstName?: string; email?: string }) | null
    >(
      `*[_type == "guest" && slug.current == $slug][0]{ _id, _rev, rsvpStatus, firstName, email }`,
      { slug: payload.guestSlug },
    );

    if (!guest) {
      throw new Error(`Guest with slug ${payload.guestSlug} not found`);
    }

    const patch = writeClient.patch(guest._id);
    if (email) patch.set({ email });
    if (mobile) patch.set({ mobile });
    await patch.commit();

    status = guest.rsvpStatus;
    guestName = guest.firstName ?? "";
    hadEmailBefore = Boolean(guest.email);
  } catch (error) {
    console.error("[submitGuestContact] Sanity write failed:", error);
    return { success: false, error: "sanity_unavailable" };
  }

  revalidateTag(`guest:${payload.guestSlug}`, { expire: 0 });

  // Send the confirmation only the FIRST time an email lands on file — a guest
  // re-saving the nudge to fix a typo'd mobile must not trigger a second email.
  if (email && !hadEmailBefore && status === "attending") {
    void sendRsvpConfirmation({ guestName, guestEmail: email });
  }

  return { success: true };
}

// ADR-0002: Linked plus-one cross-mutation is conditional on the partner
// still being `pending`. An explicit decline must not be silently overridden
// by a partner's optimistic "yes both" submission.
//
// The Sanity JS client doesn't support reads inside transactions, so the
// partner's `_rev` from the lookup is replayed as an `ifRevisionId`
// precondition on the partner patch. If the partner submitted concurrently
// between our read and our commit, their revision changes and the
// precondition fails — we then drop the partner patch and only commit the
// submitter's. Bob's explicit act wins, per ADR-0002.
async function writeSanityRsvp(
  payload: RSVPPayload,
): Promise<{ partnerWritten: boolean }> {
  const submitter = await writeClient.fetch<GuestLookup | null>(
    `*[_type == "guest" && slug.current == $slug][0]{ _id, _rev, rsvpStatus }`,
    { slug: payload.guestSlug },
  );

  if (!submitter) {
    throw new Error(`Guest with slug ${payload.guestSlug} not found`);
  }

  const now = new Date().toISOString();
  const submitterStatus: "attending" | "declined" = payload.attending
    ? "attending"
    : "declined";

  const submitterPatch = writeClient
    .patch(submitter._id)
    .set({ rsvpStatus: submitterStatus, rsvpUpdatedAt: now });

  // Contact is a durable Guest attribute (ADR-0006): set only the fields the
  // guest actually provided, normalized canonical. Never unset — a skipped
  // field must not wipe a value already on file (e.g. a couple's backfill).
  if (payload.guestEmail) {
    submitterPatch.set({ email: normalizeEmail(payload.guestEmail) });
  }
  if (payload.guestMobile) {
    const mobile = normalizePhMobile(payload.guestMobile);
    if (mobile) submitterPatch.set({ mobile });
  }

  // openPlusOne: set when attending with an open plus-one name; unset
  // otherwise so the summary card stops showing a stale plus-one name when
  // an editing guest switches from "with someone" to "just me".
  if (
    payload.plusOneType === "open" &&
    payload.attending &&
    payload.plusOneName
  ) {
    submitterPatch.set({
      openPlusOne: { attending: true, name: payload.plusOneName },
    });
  } else {
    submitterPatch.unset(["openPlusOne"]);
  }

  // Resolve the partner's revision while we're still pre-commit, so we can
  // attach `ifRevisionId` to the cross-mutation patch.
  let partnerSlugForRevalidation: string | null = null;
  let partnerPatchAttached = false;
  const transaction = writeClient.transaction().patch(submitterPatch);

  if (
    payload.plusOneType === "linked" &&
    payload.plusOneAttending &&
    payload.linkedPartnerSlug
  ) {
    const partner = await writeClient.fetch<GuestLookup | null>(
      `*[_type == "guest" && slug.current == $slug][0]{ _id, _rev, rsvpStatus }`,
      { slug: payload.linkedPartnerSlug },
    );

    if (
      partner &&
      (partner.rsvpStatus === undefined || partner.rsvpStatus === "pending")
    ) {
      transaction.patch(
        writeClient
          .patch(partner._id, { ifRevisionID: partner._rev })
          .set({ rsvpStatus: "attending", rsvpUpdatedAt: now }),
      );
      partnerSlugForRevalidation = payload.linkedPartnerSlug;
      partnerPatchAttached = true;
    }
  }

  try {
    await transaction.commit();
  } catch (err) {
    if (partnerPatchAttached && isRevisionConflict(err)) {
      // Partner submitted concurrently between our read and our commit. Per
      // ADR-0002, drop the partner patch and retry with submitter only.
      console.warn(
        `[submitRsvp] partner cross-mutation skipped due to concurrent edit (slug=${payload.linkedPartnerSlug})`,
      );
      partnerSlugForRevalidation = null;
      await writeClient.transaction().patch(submitterPatch).commit();
    } else {
      throw err;
    }
  }

  revalidateTag(`guest:${payload.guestSlug}`, { expire: 0 });
  if (partnerSlugForRevalidation) {
    revalidateTag(`guest:${partnerSlugForRevalidation}`, { expire: 0 });
  }

  // partnerSlugForRevalidation survives only when the partner patch was both
  // attached and committed (it's nulled on the revision-conflict fallback).
  return { partnerWritten: partnerSlugForRevalidation !== null };
}

function isRevisionConflict(err: unknown): boolean {
  // Sanity returns 409 for `ifRevisionID` precondition failures.
  if (typeof err !== "object" || err === null) return false;
  const statusCode = (err as { statusCode?: unknown }).statusCode;
  return statusCode === 409;
}
