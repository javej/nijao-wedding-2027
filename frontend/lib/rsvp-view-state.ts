import { isRsvpClosed } from "@/lib/rsvp-cutoff";
import type { RsvpParkingAnswer } from "@/app/actions/rsvp";
import type {
  GuestParking,
  GuestResult,
  RsvpStatus,
} from "@/sanity/queries/guests";

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
  if (status === "declined") return "We completely understand ❤️";
  return "";
}

/**
 * Derive the one-line attendance detail shown on the summary card per AC 5.
 * Both the server (post-revalidation) and the client (optimistic post-edit)
 * call this with the same rule — kept here so it can't drift between them.
 *
 * Declined guests get a fixed reassurance line instead: the headline is kept
 * short enough for the display type, so the warmth lives down here.
 */
export function deriveDetailLine(
  status: RsvpStatus,
  context: RsvpDetailContext,
): string | null {
  if (status === "declined") {
    return "Thank you for letting us know. We'll miss celebrating with you — hope we can another time.";
  }
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

/**
 * Names the arrival overlay lists under "Confirmed RSVP(s) for:". Empty unless
 * the guest themself is attending — declined and pending guests keep the
 * generic welcome. Companions follow the same rules as {@link deriveDetailLine}
 * so the mirror and the summary card can never disagree about who is coming.
 */
export function deriveConfirmedNames(guest: NonNullable<GuestResult>): string[] {
  if (normalizeStatus(guest.rsvpStatus) !== "attending") return [];

  const names = [guest.nickname || guest.firstName];
  const context = contextFromGuest(guest);
  if (!context.plusOneEligible) return names;

  if (context.plusOneType === "linked") {
    const partner = context.linkedPartner;
    if (partner && normalizeStatus(partner.rsvpStatus) === "attending") {
      names.push(partner.firstName);
    }
  } else if (context.plusOneType === "open") {
    if (context.openPlusOneAttending && context.openPlusOneName) {
      names.push(context.openPlusOneName);
    }
  }

  return names;
}

/**
 * Second detail line on the summary card describing the guest's parking
 * answer (ADR-0008). Attending guests only. A `plate` status with no plate
 * value can only come from a hand edit in Studio; treat it as never asked so
 * the guest is invited to fill it in rather than shown an empty line.
 */
export function deriveParkingLine(
  status: RsvpStatus,
  parking: GuestParking | null,
): string | null {
  if (status !== "attending") return null;
  if (parking?.status === "plate" && parking.plate) {
    return `Car plate: ${parking.plate}`;
  }
  if (parking?.status === "unsure") return "Car plate: not sure yet";
  if (parking?.status === "none") return "Not driving.";
  return "Car plate: not added yet";
}

/**
 * Whether the summary card should offer the "Add it" plate form: the guest is
 * attending and has neither a plate on file nor told us they aren't driving.
 */
export function parkingNeedsPlate(
  status: RsvpStatus,
  parking: GuestParking | null,
): boolean {
  if (status !== "attending") return false;
  if (parking?.status === "plate" && parking.plate) return false;
  if (parking?.status === "none") return false;
  return true;
}

/**
 * Shape a just-submitted parking answer the way the guest doc will read back,
 * so the client can update its optimistic copy without a refetch.
 */
export function parkingFromAnswer(answer: RsvpParkingAnswer): GuestParking {
  return {
    status: answer.status,
    plate: answer.status === "plate" ? answer.plate : null,
  };
}
