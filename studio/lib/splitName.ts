// Splits a free-text full name on its last space. Used by the 0003 migration
// to backfill open plus-ones captured before the chat asked for first and last
// name separately. Multi-word first names ("Maria Cristina") are common here,
// so the LAST space is the boundary, not the first.
export function splitName(name: string): { firstName: string; lastName: string | null } {
  const trimmed = name.trim().replace(/\s+/g, " ");
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace < 0) return { firstName: trimmed, lastName: null };
  return {
    firstName: trimmed.slice(0, lastSpace),
    lastName: trimmed.slice(lastSpace + 1),
  };
}
