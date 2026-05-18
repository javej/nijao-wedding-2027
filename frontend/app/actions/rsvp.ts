"use server";

// import { verifyTurnstileToken } from "@/lib/turnstile";
import { revalidateTag } from "next/cache";
import { appendRsvpRows } from "@/lib/sheets";
import { sendRsvpConfirmation } from "@/lib/resend";
import { writeClient } from "@/sanity/lib/write";
import { isRsvpClosed } from "@/lib/rsvp-cutoff";

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
}

export type RSVPErrorCode =
  | "rsvp_closed"
  | "sanity_unavailable"
  | "sheets_unavailable"
  | "unexpected";

export type ActionResult =
  | { success: true }
  | { success: false; error: RSVPErrorCode };

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
  try {
    await writeSanityRsvp(payload);
  } catch (error) {
    console.error("[submitRsvp] Sanity write failed:", error);
    return { success: false, error: "sanity_unavailable" };
  }

  // 4. Append the audit log row(s). Best-effort — Sanity already committed,
  // so a Sheets failure surfaces an error so the client can retry the append
  // without re-writing Sanity. The localStorage retry queue handles this.
  try {
    await appendRsvpRows({
      guestName: payload.guestName,
      guestSlug: payload.guestSlug,
      attending: payload.attending,
      plusOneName: payload.plusOneName,
      linkedGuest: payload.linkedGuest,
    });
  } catch (error) {
    console.error("[submitRsvp] Sheets write failed:", error);
    return { success: false, error: "sheets_unavailable" };
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
async function writeSanityRsvp(payload: RSVPPayload): Promise<void> {
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
}

function isRevisionConflict(err: unknown): boolean {
  // Sanity returns 409 for `ifRevisionID` precondition failures.
  if (typeof err !== "object" || err === null) return false;
  const statusCode = (err as { statusCode?: unknown }).statusCode;
  return statusCode === 409;
}
