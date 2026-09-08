import { describe, expect, it } from "vitest";
import { buildCsv, plusOneDisplay, type GuestRow } from "./csv";

function guest(overrides: Partial<GuestRow> = {}): GuestRow {
  return {
    _id: "guest-1",
    firstName: "Alice",
    lastName: "Reyes",
    slug: "abcd1234",
    description: null,
    plusOneEligible: null,
    plusOneType: null,
    rsvpStatus: null,
    rsvpUpdatedAt: null,
    openPlusOne: null,
    parking: null,
    linkedPartner: null,
    plusOneOf: null,
    ...overrides,
  };
}

const BOM = "\uFEFF";

function csvLines(rows: GuestRow[]): string[] {
  return buildCsv(rows).replace(BOM, "").split("\n");
}

describe("buildCsv", () => {
  it("labels the relationship column 'plus-one of'", () => {
    expect(csvLines([])[0]).toBe(
      "guest name,attending,plus-one of,car plate,timestamp,description",
    );
  });

  it("leaves 'plus-one of' empty for a guest nobody lists as their plus-one", () => {
    const [, row] = csvLines([guest({ rsvpStatus: "attending" })]);
    expect(row).toBe("Alice Reyes,yes,,not added,,");
  });

  it("names the guest who lists this guest as their linked plus-one", () => {
    const [, row] = csvLines([
      guest({
        rsvpStatus: "pending",
        plusOneEligible: true,
        plusOneType: "linked",
        linkedPartner: { firstName: "Bob", rsvpStatus: "attending" },
        plusOneOf: { firstName: "Bob", lastName: "Santos" },
      }),
    ]);
    expect(row).toBe("Alice Reyes,,Plus-one of Bob Santos,,,");
  });

  it("does not fill 'plus-one of' from the guest's own linked partner", () => {
    // Alice points at Bob, but nobody points at Alice: Alice is not anyone's plus-one.
    const [, row] = csvLines([
      guest({
        rsvpStatus: "attending",
        plusOneEligible: true,
        plusOneType: "linked",
        linkedPartner: { firstName: "Bob", rsvpStatus: "attending" },
        plusOneOf: null,
      }),
    ]);
    expect(row).toBe("Alice Reyes,yes,,not added,,");
  });

  it("adds a row for an attending open plus-one right after their host", () => {
    const lines = csvLines([
      guest({
        rsvpStatus: "attending",
        rsvpUpdatedAt: "2026-09-01T10:00:00Z",
        description: "College friend",
        plusOneEligible: true,
        plusOneType: "open",
        openPlusOne: { attending: true, firstName: "Jane", lastName: "Doe" },
        parking: { status: "plate", plate: "ABC 1234" },
      }),
      guest({ _id: "guest-2", firstName: "Carlo", lastName: "Cruz", rsvpStatus: "declined" }),
    ]);
    expect(lines).toEqual([
      "guest name,attending,plus-one of,car plate,timestamp,description",
      "Alice Reyes,yes,,ABC 1234,2026-09-01T10:00:00Z,College friend",
      "Jane Doe,yes,Plus-one of Alice Reyes,,2026-09-01T10:00:00Z,",
      "Carlo Cruz,no,,,,",
    ]);
  });

  it("omits the open plus-one row when the host is not attending", () => {
    const lines = csvLines([
      guest({
        rsvpStatus: "declined",
        plusOneEligible: true,
        plusOneType: "open",
        openPlusOne: { attending: true, firstName: "Jane", lastName: "Doe" },
      }),
    ]);
    expect(lines).toHaveLength(2);
  });

  it("omits the open plus-one row when the plus-one is not attending or unnamed", () => {
    const notAttending = guest({
      rsvpStatus: "attending",
      plusOneEligible: true,
      plusOneType: "open",
      openPlusOne: { attending: false, firstName: "Jane", lastName: "Doe" },
    });
    const unnamed = guest({
      rsvpStatus: "attending",
      plusOneEligible: true,
      plusOneType: "open",
      openPlusOne: { attending: true, firstName: null, lastName: null },
    });
    expect(csvLines([notAttending])).toHaveLength(2);
    expect(csvLines([unnamed])).toHaveLength(2);
  });

  it("quotes cells containing commas or quotes", () => {
    const [, row] = csvLines([
      guest({ firstName: 'Ana "Annie"', lastName: "Dela Cruz, Jr.", rsvpStatus: "attending" }),
    ]);
    expect(row).toBe('"Ana ""Annie"" Dela Cruz, Jr.",yes,,not added,,');
  });
});

describe("plusOneDisplay (dashboard badge)", () => {
  it("shows the open plus-one's full name", () => {
    expect(
      plusOneDisplay(
        guest({
          rsvpStatus: "attending",
          plusOneEligible: true,
          plusOneType: "open",
          openPlusOne: { attending: true, firstName: "Jane", lastName: "Doe" },
        }),
      ),
    ).toBe("Jane Doe");
  });

  it("shows an attending linked partner's first name", () => {
    expect(
      plusOneDisplay(
        guest({
          rsvpStatus: "attending",
          plusOneEligible: true,
          plusOneType: "linked",
          linkedPartner: { firstName: "Bob", rsvpStatus: "attending" },
        }),
      ),
    ).toBe("Bob");
  });

  it("is empty when the guest is not attending", () => {
    expect(
      plusOneDisplay(
        guest({
          rsvpStatus: "declined",
          plusOneType: "open",
          openPlusOne: { attending: true, firstName: "Jane", lastName: "Doe" },
        }),
      ),
    ).toBe("");
  });
});
