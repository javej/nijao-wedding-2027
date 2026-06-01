'use client';

import { cn } from '@/lib/utils';
import { quickNavAnchors, scrollToAnchor } from '@/lib/quick-nav';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

/**
 * Always-visible wayfinding under the Hero names. Static ghost pills that
 * belong to the invitation's aesthetic (thin outline, raspberry icon accent)
 * rather than floating above it like the FAB. The FAB takes over once the
 * guest scrolls past the Hero.
 */
export function HeroJumpNav() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <nav
      aria-label="Wedding sections"
      className="mt-12 flex flex-wrap items-center justify-center gap-3"
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
