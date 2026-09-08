import { describe, it, expect } from 'vitest';
import { deriveConfirmedNames, deriveDetailLine, contextFromGuest } from './rsvp-view-state';
import type { GuestResult } from '@/sanity/queries/guests';

type Guest = NonNullable<GuestResult>;

function guest(overrides: Partial<Guest> = {}): Guest {
  return {
    firstName: 'Test Main',
    nickname: null,
    slug: 'abcd1234',
    email: null,
    mobile: null,
    plusOneEligible: null,
    plusOneType: null,
    plusOneLinkedGuest: null,
    rsvpStatus: null,
    rsvpUpdatedAt: null,
    openPlusOne: null,
    parking: null,
    ...overrides,
  };
}

describe('deriveConfirmedNames', () => {
  it('is empty when the guest has not answered', () => {
    expect(deriveConfirmedNames(guest({ rsvpStatus: 'pending' }))).toEqual([]);
    expect(deriveConfirmedNames(guest({ rsvpStatus: null }))).toEqual([]);
  });

  it('is empty when the guest declined', () => {
    expect(deriveConfirmedNames(guest({ rsvpStatus: 'declined' }))).toEqual([]);
  });

  it('lists only the guest when attending alone', () => {
    expect(deriveConfirmedNames(guest({ rsvpStatus: 'attending' }))).toEqual(['Test Main']);
  });

  it('greets by nickname when one is set, matching the welcome line', () => {
    expect(
      deriveConfirmedNames(guest({ rsvpStatus: 'attending', nickname: 'Tess' })),
    ).toEqual(['Tess']);
  });

  it('adds a linked partner who is also attending', () => {
    const g = guest({
      rsvpStatus: 'attending',
      plusOneEligible: true,
      plusOneType: 'linked',
      plusOneLinkedGuest: { firstName: 'Jane Doe', slug: 'efgh5678', rsvpStatus: 'attending' },
    });
    expect(deriveConfirmedNames(g)).toEqual(['Test Main', 'Jane Doe']);
  });

  it('omits a linked partner who declined or has not answered', () => {
    const declined = guest({
      rsvpStatus: 'attending',
      plusOneEligible: true,
      plusOneType: 'linked',
      plusOneLinkedGuest: { firstName: 'Jane Doe', slug: 'efgh5678', rsvpStatus: 'declined' },
    });
    const pending = guest({
      rsvpStatus: 'attending',
      plusOneEligible: true,
      plusOneType: 'linked',
      plusOneLinkedGuest: { firstName: 'Jane Doe', slug: 'efgh5678', rsvpStatus: null },
    });
    expect(deriveConfirmedNames(declined)).toEqual(['Test Main']);
    expect(deriveConfirmedNames(pending)).toEqual(['Test Main']);
  });

  it('adds an attending open plus-one by first name, like the guest', () => {
    const g = guest({
      rsvpStatus: 'attending',
      plusOneEligible: true,
      plusOneType: 'open',
      openPlusOne: { attending: true, firstName: 'Jane', lastName: 'Doe' },
    });
    expect(deriveConfirmedNames(g)).toEqual(['Test Main', 'Jane']);
  });

  it('omits an open plus-one who is not attending or has no name', () => {
    const notAttending = guest({
      rsvpStatus: 'attending',
      plusOneEligible: true,
      plusOneType: 'open',
      openPlusOne: { attending: false, firstName: 'Jane', lastName: 'Doe' },
    });
    const unnamed = guest({
      rsvpStatus: 'attending',
      plusOneEligible: true,
      plusOneType: 'open',
      openPlusOne: { attending: true, firstName: null, lastName: null },
    });
    expect(deriveConfirmedNames(notAttending)).toEqual(['Test Main']);
    expect(deriveConfirmedNames(unnamed)).toEqual(['Test Main']);
  });

  it('ignores companion data when the guest is not plus-one eligible', () => {
    const g = guest({
      rsvpStatus: 'attending',
      plusOneEligible: false,
      plusOneType: 'linked',
      plusOneLinkedGuest: { firstName: 'Jane Doe', slug: 'efgh5678', rsvpStatus: 'attending' },
    });
    expect(deriveConfirmedNames(g)).toEqual(['Test Main']);
  });
});

describe('deriveDetailLine with an open plus-one', () => {
  function openPlusOneGuest(openPlusOne: Guest['openPlusOne']): Guest {
    return guest({
      rsvpStatus: 'attending',
      plusOneEligible: true,
      plusOneType: 'open',
      openPlusOne,
    });
  }

  it("names the plus-one by first name on the summary card", () => {
    const g = openPlusOneGuest({ attending: true, firstName: 'Jane', lastName: 'Doe' });
    expect(deriveDetailLine('attending', contextFromGuest(g))).toBe('Attending — with Jane.');
  });

  it('falls back to plain "Attending." when the plus-one is unnamed', () => {
    const g = openPlusOneGuest({ attending: true, firstName: null, lastName: null });
    expect(deriveDetailLine('attending', contextFromGuest(g))).toBe('Attending.');
  });
});
