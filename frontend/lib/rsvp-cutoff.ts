/**
 * RSVP cutoff — November 30, 2026 PHT, matching the deadline the "What is the
 * RSVP deadline?" FAQ in Sanity advertises.
 *
 * November 30 is the last day guests can RSVP, so the cutoff is the *end* of
 * Nov 30 PHT — i.e. midnight at the start of Dec 1. `isRsvpClosed` then keeps
 * the form open through all of Nov 30 and flips closed on Dec 1, matching the
 * "closed on November 30" copy (the 30th was the deadline).
 *
 * After this instant, the server action rejects submissions and the slug page
 * renders closed-state UI. Both sides import this constant — never inline the
 * date literal anywhere else.
 */

export const RSVP_CUTOFF_ISO = "2026-12-01T00:00:00+08:00";
export const RSVP_CUTOFF_TIMESTAMP = Date.parse(RSVP_CUTOFF_ISO);

/** Closed-state copy, shared by the summary card, closed panel, and chat. */
export const RSVP_CLOSED_HEADLINE = "RSVPs closed on November 30.";
export const RSVP_CLOSED_FOLLOW_UP = "If something has come up, please message us directly.";

export function isRsvpClosed(now: number = Date.now()): boolean {
  return now >= RSVP_CUTOFF_TIMESTAMP;
}
