/**
 * RSVP cutoff — two months before the wedding (Jan 8, 2027 PHT).
 *
 * After this instant, the server action rejects submissions and the slug page
 * renders closed-state UI. Both sides import this constant — never inline the
 * date literal anywhere else.
 */

export const RSVP_CUTOFF_ISO = "2026-11-08T00:00:00+08:00";
export const RSVP_CUTOFF_TIMESTAMP = Date.parse(RSVP_CUTOFF_ISO);

export function isRsvpClosed(now: number = Date.now()): boolean {
  return now >= RSVP_CUTOFF_TIMESTAMP;
}
