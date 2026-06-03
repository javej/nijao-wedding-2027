/**
 * RSVP cutoff — two months before the wedding (Jan 8, 2027 PHT).
 *
 * November 8 is the last day guests can RSVP, so the cutoff is the *end* of
 * Nov 8 PHT — i.e. midnight at the start of Nov 9. `isRsvpClosed` then keeps
 * the form open through all of Nov 8 and flips closed on Nov 9, matching the
 * "closed on November 8" copy (the 8th was the deadline).
 *
 * After this instant, the server action rejects submissions and the slug page
 * renders closed-state UI. Both sides import this constant — never inline the
 * date literal anywhere else.
 */

export const RSVP_CUTOFF_ISO = "2026-11-09T00:00:00+08:00";
export const RSVP_CUTOFF_TIMESTAMP = Date.parse(RSVP_CUTOFF_ISO);

export function isRsvpClosed(now: number = Date.now()): boolean {
  return now >= RSVP_CUTOFF_TIMESTAMP;
}
