import { fullName } from "../../lib/guestName";

export type RsvpStatus = "pending" | "attending" | "declined";
export type ParkingStatus = "plate" | "unsure" | "none";

export type GuestRow = {
  _id: string;
  firstName: string;
  lastName: string | null;
  slug: string;
  description: string | null;
  plusOneEligible: boolean | null;
  plusOneType: "linked" | "open" | null;
  rsvpStatus: RsvpStatus | null;
  rsvpUpdatedAt: string | null;
  openPlusOne: {
    attending: boolean | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
  parking: { status: ParkingStatus | null; plate: string | null } | null;
  linkedPartner: {
    firstName: string;
    rsvpStatus: RsvpStatus | null;
  } | null;
  /** The guest who lists THIS guest as their linked plus-one (reverse reference). */
  plusOneOf: { firstName: string; lastName: string | null } | null;
};

export function normalizeStatus(value: RsvpStatus | null | undefined): RsvpStatus {
  return value ?? "pending";
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// An open plus-one only exists as a person to count when the host is attending
// and named them; a stale name on a declined host is not a headcount.
function attendingOpenPlusOne(guest: GuestRow): { firstName: string; lastName: string | null } | null {
  if (normalizeStatus(guest.rsvpStatus) !== "attending") return null;
  if (guest.plusOneType !== "open") return null;
  const plusOne = guest.openPlusOne;
  if (!plusOne?.attending || !plusOne.firstName) return null;
  return { firstName: plusOne.firstName, lastName: plusOne.lastName };
}

// Visible plus-one name for the dashboard badge: linked partner's first name
// (matching how guests are addressed), or the open plus-one's full name so
// Jave can tell two Janes apart.
export function plusOneDisplay(guest: GuestRow): string {
  if (normalizeStatus(guest.rsvpStatus) !== "attending") return "";
  if (guest.plusOneType === "linked") {
    if (guest.linkedPartner && normalizeStatus(guest.linkedPartner.rsvpStatus) === "attending") {
      return guest.linkedPartner.firstName;
    }
    return "";
  }
  const plusOne = attendingOpenPlusOne(guest);
  return plusOne ? fullName(plusOne) : "";
}

// Parking answer for an attending guest (ADR-0008), for both the row badge and
// the CSV. Null for guests who aren't attending; "not added" distinguishes a
// guest who was never asked from one who explicitly said "not sure yet".
export type ParkingDisplay =
  | { kind: "plate"; text: string }
  | { kind: "unsure"; text: string }
  | { kind: "none"; text: string }
  | { kind: "missing"; text: string }
  | null;

export function parkingDisplay(guest: GuestRow): ParkingDisplay {
  if (normalizeStatus(guest.rsvpStatus) !== "attending") return null;
  const parking = guest.parking;
  if (parking?.status === "plate" && parking.plate) {
    return { kind: "plate", text: parking.plate };
  }
  if (parking?.status === "unsure") return { kind: "unsure", text: "not sure yet" };
  if (parking?.status === "none") return { kind: "none", text: "not driving" };
  return { kind: "missing", text: "not added" };
}

function plusOneOfLabel(host: { firstName: string; lastName: string | null }): string {
  return `Plus-one of ${fullName(host)}`;
}

function attendingCell(status: RsvpStatus): string {
  if (status === "attending") return "yes";
  if (status === "declined") return "no";
  return "";
}

/**
 * One line per person the caterer should know about: every guest, plus a
 * synthesized line for each attending open plus-one directly under their host.
 * Linked partners already have their own guest row, so they are never
 * synthesized; their "plus-one of" cell comes from whoever links to them.
 */
export function buildCsv(rows: GuestRow[]): string {
  const header = [
    "guest name",
    "attending",
    "plus-one of",
    "car plate",
    "timestamp",
    "description",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        escapeCsvCell(fullName(r)),
        attendingCell(normalizeStatus(r.rsvpStatus)),
        escapeCsvCell(r.plusOneOf ? plusOneOfLabel(r.plusOneOf) : ""),
        escapeCsvCell(parkingDisplay(r)?.text ?? ""),
        escapeCsvCell(r.rsvpUpdatedAt ?? ""),
        escapeCsvCell(r.description ?? ""),
      ].join(","),
    );
    const plusOne = attendingOpenPlusOne(r);
    if (plusOne) {
      lines.push(
        [
          escapeCsvCell(fullName(plusOne)),
          "yes",
          escapeCsvCell(plusOneOfLabel(r)),
          "",
          escapeCsvCell(r.rsvpUpdatedAt ?? ""),
          "",
        ].join(","),
      );
    }
  }
  // Prepend UTF-8 BOM so Excel detects encoding correctly for accented names.
  return "\uFEFF" + lines.join("\n");
}
