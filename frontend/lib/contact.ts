/**
 * Guest contact validation + normalization.
 *
 * Contact is a durable Guest attribute (see CONTEXT.md, ADR-0006). These helpers
 * are the single source of truth for what counts as a valid email / PH mobile and
 * how each is normalized before being written to the Sanity guest doc. Used on
 * both the client (RSVP chat, summary nudge) and the server action.
 */

// --- Email ---

// Pragmatic structural check — non-empty local part, single @, a dotted domain.
// Deliberately NOT a full RFC 5322 regex: that rejects valid addresses, and the
// field is optional anyway. Resend bounces a genuinely bad address at send time.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(raw: string): boolean {
  return EMAIL_RE.test(raw.trim());
}

/** Trim + lowercase. Stable for dedup and a future mail-merge. */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

// --- PH mobile ---

/**
 * Normalize a Philippine mobile number to E.164 (`+639XXXXXXXXX`), or return
 * null if it isn't a valid PH mobile.
 *
 * Accepts (after stripping spaces, dashes, dots, parens):
 *   - `09XXXXXXXXX`      (local, 11 digits)
 *   - `+639XXXXXXXXX` / `639XXXXXXXXX` (international / E.164)
 *   - `9XXXXXXXXX`       (bare 10-digit national)
 *
 * Mobile-only: the 10-digit national number must start with `9`, which excludes
 * landlines (area codes 2, 32, 82, …). Structural validation only — no
 * carrier-prefix allowlist, which would churn and reject valid new ranges.
 */
export function normalizePhMobile(raw: string): string | null {
  const cleaned = raw.replace(/[\s().\-]/g, "");

  let national: string | null = null;
  if (/^\+?63\d{10}$/.test(cleaned)) {
    national = cleaned.replace(/^\+?63/, "");
  } else if (/^0\d{10}$/.test(cleaned)) {
    national = cleaned.slice(1);
  } else if (/^9\d{9}$/.test(cleaned)) {
    national = cleaned;
  }

  if (national === null || national.length !== 10 || national[0] !== "9") {
    return null;
  }

  return `+63${national}`;
}
