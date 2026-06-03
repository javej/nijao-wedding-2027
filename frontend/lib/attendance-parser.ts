/**
 * Natural-language attendance parsing for the RSVP chat's free-text replies.
 *
 * Pure + dependency-free so it can be unit-tested in isolation (the RSVP chat
 * component drags in server actions and motion, which a parser test shouldn't
 * need).
 */

// Strong leading words — an unambiguous yes/no when the response opens with one.
const AFFIRMATIVE_START =
  /^(yes|yeah|yep|yup|oo|of\s*course|sure|absolutely|sige|opo|definitely|let'?s\s*go)/i;
const NEGATIVE_START = /^(no|nah|nope|hindi\s*po|hindi|can'?t|cannot|won'?t|unable)/i;

// Weak lead-in — "ok" is only a yes when nothing stronger contradicts it, so it
// must NOT override a negative phrase like "ok, I can't make it".
const WEAK_AFFIRMATIVE_START = /^(ok|okay|k)\b/i;

// Keyword phrases — intent expressed mid-sentence ("I will attend", "count me in").
const AFFIRMATIVE_KEYWORDS =
  /\b(attend|coming|be\s*there|count\s*me\s*in|join|present|pumunta|punta)/i;
// Negation constructions. These are specifically "negator + verb" and so take
// precedence over a bare affirmative keyword they contain (e.g. "not coming"
// trips AFFIRMATIVE's "coming", but the negation is the real intent).
const NEGATIVE_KEYWORDS =
  /\b((can'?t|cannot|won'?t|will\s*not)\s*(make|attend|come|go)|not\s*(coming|attending|going|able)|unable|decline|regret|sorry.{0,10}(can'?t|cannot|won'?t|unable))/i;

/**
 * Classify a free-text RSVP reply. Specific keyword phrases are the strongest
 * signal and win over a leading word, which fixes first-word-wins misreads like
 * "ok I can't make it" (→ no) and "no problem, I'll be there" (→ yes). A
 * negation phrase wins over a bare affirmative it contains ("not coming" → no).
 * A reply with neither signal (and no decisive leading word) returns null so
 * the chat asks to clarify.
 */
export function classifyResponse(input: string): 'yes' | 'no' | null {
  const t = input.trim();

  // Negation phrases are the most specific signal — check them first so a
  // "not <affirmative>" / "can't <affirmative>" reads as a decline.
  if (NEGATIVE_KEYWORDS.test(t)) return 'no';
  if (AFFIRMATIVE_KEYWORDS.test(t)) return 'yes';

  const affStart = AFFIRMATIVE_START.test(t);
  const negStart = NEGATIVE_START.test(t);
  if (affStart && !negStart) return 'yes';
  if (negStart && !affStart) return 'no';
  if (affStart && negStart) return null;

  // Nothing stronger present — a bare "ok"/"okay" counts as yes.
  if (WEAK_AFFIRMATIVE_START.test(t)) return 'yes';
  return null;
}

export function isAffirmative(input: string): boolean {
  return classifyResponse(input) === 'yes';
}

export function isNegative(input: string): boolean {
  return classifyResponse(input) === 'no';
}
