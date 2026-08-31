/**
 * Entourage display order — pure, no Sanity client. Kept out of
 * `entourage.ts` so it can be unit-tested without the env-backed fetch
 * module being imported.
 */

/** The minimum a member needs for ordering. */
export interface OrderableEntourageMember {
  name: string;
  orderRank?: string | null;
}

/** Last whitespace-delimited word of a name, e.g. "Maria Clara Santos" -> "Santos". */
function lastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] ?? "";
}

/**
 * Studio drag order first, last name as the backup.
 *
 * `orderRank` is a lexicographically sortable rank string written by the
 * Studio's orderable list, so a plain string compare reproduces the
 * arrangement. Members that have never been ranked (added outside the
 * orderable list) sort last, alphabetically by last name — falling back to
 * the full name so two Santoses stay in a stable, predictable order.
 */
function compareEntourage(
  a: OrderableEntourageMember,
  b: OrderableEntourageMember,
): number {
  const rankA = a.orderRank ?? "";
  const rankB = b.orderRank ?? "";

  if (rankA !== rankB) {
    if (!rankA) return 1;
    if (!rankB) return -1;
    return rankA < rankB ? -1 : 1;
  }

  const byLastName = lastName(a.name).localeCompare(lastName(b.name));
  return byLastName !== 0 ? byLastName : a.name.localeCompare(b.name);
}

/** Apply the drag-order-then-last-name sort. Returns a new array. */
export function sortEntourage<T extends OrderableEntourageMember>(members: T[]): T[] {
  return [...members].sort(compareEntourage);
}
