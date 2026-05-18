import { isRsvpClosed } from "@/lib/rsvp-cutoff";
import type { GuestResult, RsvpStatus } from "@/sanity/queries/guests";

export type RsvpViewMode = "summary" | "chat" | "closed";

export interface RsvpViewState {
  status: RsvpStatus;
  hasAnswered: boolean;
  isClosed: boolean;
  initialMode: RsvpViewMode;
  summaryHeadline: string;
  detailLine: string | null;
}

export interface RsvpDetailContext {
  plusOneEligible: boolean | null;
  plusOneType: "linked" | "open" | null;
  linkedPartner: { firstName: string; rsvpStatus: RsvpStatus | null } | null;
  openPlusOneAttending: boolean;
  openPlusOneName: string | null;
}

function normalizeStatus(value: RsvpStatus | null | undefined): RsvpStatus {
  return value ?? "pending";
}

export function deriveRsvpViewState(
  guest: NonNullable<GuestResult>,
  now: number = Date.now(),
): RsvpViewState {
  const status = normalizeStatus(guest.rsvpStatus);
  const hasAnswered = status !== "pending";
  const isClosed = isRsvpClosed(now);

  const initialMode: RsvpViewMode = hasAnswered
    ? "summary"
    : isClosed
      ? "closed"
      : "chat";

  return {
    status,
    hasAnswered,
    isClosed,
    initialMode,
    summaryHeadline: deriveSummaryHeadline(status),
    detailLine: deriveDetailLine(status, contextFromGuest(guest)),
  };
}

export function deriveSummaryHeadline(status: RsvpStatus): string {
  if (status === "attending") return "We have you down for January 8 ✓";
  if (status === "declined")
    return "You let us know you can't make it. We'll miss you.";
  return "";
}

/**
 * Derive the one-line attendance detail shown on the summary card per AC 5.
 * Both the server (post-revalidation) and the client (optimistic post-edit)
 * call this with the same rule — kept here so it can't drift between them.
 */
export function deriveDetailLine(
  status: RsvpStatus,
  context: RsvpDetailContext,
): string | null {
  if (status !== "attending") return null;
  if (!context.plusOneEligible) return "Attending.";

  if (context.plusOneType === "linked") {
    const partner = context.linkedPartner;
    if (!partner) return "Attending.";
    const partnerStatus = normalizeStatus(partner.rsvpStatus);
    if (partnerStatus === "attending") {
      return `Attending — with ${partner.firstName}.`;
    }
    if (partnerStatus === "declined") {
      return `Attending — ${partner.firstName} can't make it.`;
    }
    return "Attending.";
  }

  if (context.plusOneType === "open") {
    if (context.openPlusOneAttending && context.openPlusOneName) {
      return `Attending — with ${context.openPlusOneName}.`;
    }
    return "Attending.";
  }

  return "Attending.";
}

export function contextFromGuest(
  guest: NonNullable<GuestResult>,
): RsvpDetailContext {
  return {
    plusOneEligible: guest.plusOneEligible,
    plusOneType: guest.plusOneType,
    linkedPartner: guest.plusOneLinkedGuest
      ? {
          firstName: guest.plusOneLinkedGuest.firstName,
          rsvpStatus: guest.plusOneLinkedGuest.rsvpStatus,
        }
      : null,
    openPlusOneAttending: guest.openPlusOne?.attending === true,
    openPlusOneName: guest.openPlusOne?.name ?? null,
  };
}
