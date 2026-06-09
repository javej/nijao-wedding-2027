'use client';

import { cn } from '@/lib/utils';
import { quickNavAnchors, scrollToAnchor } from '@/lib/quick-nav';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useFirstScrollComplete } from '@/hooks/useFirstScrollComplete';

/**
 * Wayfinding under the Hero names, shown only after the guest has scrolled
 * through to RSVP at least once. On the first visit the invitation reads
 * as a continuous story with no jump chrome; on every visit after that
 * these ghost pills are there for quick access. Styled to echo the names
 * line — part of the invitation, not bolted-on app chrome. The floating
 * FAB takes over once the guest scrolls past the Hero.
 */
export function HeroJumpNav() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { isComplete } = useFirstScrollComplete();

  if (!isComplete) return null;

  return (
    <nav
      aria-label="Wedding sections"
      // Mobile: balanced 2×2 grid (all four pills don't fit one row at phone
      // widths, and a 3+1 wrap orphans the last pill). sm+ has room for a
      // single centered row.
      className="mt-12 mx-auto grid w-fit grid-cols-2 place-items-center gap-3 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-center"
    >
      {quickNavAnchors.map(({ id, label, shortLabel }) => (
        <button
          key={id}
          type="button"
          aria-label={label}
          onClick={() => scrollToAnchor(id, prefersReducedMotion)}
          className={cn(
            'flex h-11 items-center justify-center rounded-full px-5',
            'border border-text-on-light/25 text-text-on-light',
            // Display serif, letterspaced — echoes the names line so the nav
            // reads as part of the invitation, not bolted-on app chrome.
            'font-display text-sm uppercase tracking-widest',
            'transition-colors duration-300',
            'hover:border-text-on-light/50 hover:bg-text-on-light/5',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground',
          )}
        >
          {shortLabel}
        </button>
      ))}
    </nav>
  );
}
