'use client';

import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { quickNavAnchors, scrollToAnchor, storyAnchor } from '@/lib/quick-nav';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Wayfinding under the Hero names, shown on every visit. Styled to echo the
 * names line — part of the invitation, not bolted-on app chrome. The floating
 * FAB takes over once the guest scrolls past the Hero.
 *
 * The story leads as the one filled button. Four equal shortcuts made the
 * logistics the most tempting thing on screen, and guests skipped the story
 * entirely. The pills stay for guests who only need the venue.
 */
export function HeroJumpNav() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <nav aria-label="Wedding sections" className="mt-12 flex flex-col items-center gap-5">
      <button
        type="button"
        onClick={() => scrollToAnchor(storyAnchor.id, prefersReducedMotion)}
        className={cn(
          'flex h-12 items-center justify-center gap-2 rounded-full px-8',
          'bg-raspberry text-text-on-dark shadow-md',
          'font-display text-sm uppercase tracking-widest',
          'transition-colors duration-300 hover:bg-raspberry/90',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground',
        )}
      >
        Begin our story
        <ArrowDown className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Mobile: balanced 2×2 grid (all four pills don't fit one row at phone
          widths, and a 3+1 wrap orphans the last pill). sm+ has room for a
          single centered row. */}
      <div className="mx-auto grid w-fit grid-cols-2 place-items-center gap-3 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-center">
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
      </div>
    </nav>
  );
}
