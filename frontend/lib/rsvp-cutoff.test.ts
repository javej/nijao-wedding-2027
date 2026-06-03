import { describe, it, expect } from 'vitest';
import { isRsvpClosed, RSVP_CUTOFF_TIMESTAMP } from './rsvp-cutoff';

// PHT (+08:00) has no DST, so these wall-clock instants are unambiguous.
const ts = (iso: string) => Date.parse(iso);

describe('isRsvpClosed', () => {
  it('is open well before the cutoff', () => {
    expect(isRsvpClosed(ts('2026-10-01T12:00:00+08:00'))).toBe(false);
  });

  it('stays OPEN through all of November 8 PHT (the advertised last day)', () => {
    expect(isRsvpClosed(ts('2026-11-08T00:00:00+08:00'))).toBe(false);
    expect(isRsvpClosed(ts('2026-11-08T12:00:00+08:00'))).toBe(false);
    expect(isRsvpClosed(ts('2026-11-08T23:59:59+08:00'))).toBe(false);
  });

  it('is CLOSED from the start of November 9 PHT onward', () => {
    expect(isRsvpClosed(ts('2026-11-09T00:00:00+08:00'))).toBe(true);
    expect(isRsvpClosed(ts('2027-01-08T00:00:00+08:00'))).toBe(true);
  });

  it('closes exactly at the cutoff instant (>= comparison)', () => {
    expect(isRsvpClosed(RSVP_CUTOFF_TIMESTAMP)).toBe(true);
    expect(isRsvpClosed(RSVP_CUTOFF_TIMESTAMP - 1)).toBe(false);
  });
});
