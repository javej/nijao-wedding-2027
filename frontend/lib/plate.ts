/**
 * Car plate normalization for the RSVP parking question.
 *
 * Parking is a durable Guest attribute (see ADR-0008). This is the single
 * source of truth for what counts as a plate and how it is canonicalized before
 * being written to the Sanity guest doc. Used by the RSVP chat, the summary
 * card parking nudge, and the server action.
 *
 * Deliberately loose: PH plates come in several shapes (ABC 123, ABC 1234,
 * 123 ABC, conduction stickers) and the field is optional, so rejecting a real
 * plate is worse than accepting an odd one. We only insist on 4–10
 * alphanumerics containing at least one letter and one digit.
 */

const SEPARATOR_RE = /[\s\-.]+/g;
const MIN_PLATE_CHARS = 4;
const MAX_PLATE_CHARS = 10;

/**
 * Uppercase, collapse separators (space, dash, dot) to a single space, trim.
 * Returns null when the input doesn't look like a plate.
 */
export function normalizePlate(raw: string): string | null {
  const normalized = raw.trim().toUpperCase().replace(SEPARATOR_RE, " ").trim();
  const compact = normalized.replace(/ /g, "");

  if (!/^[A-Z0-9]+$/.test(compact)) return null;
  if (compact.length < MIN_PLATE_CHARS || compact.length > MAX_PLATE_CHARS) {
    return null;
  }
  if (!/[A-Z]/.test(compact) || !/[0-9]/.test(compact)) return null;

  return normalized;
}
