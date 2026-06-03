'use client';

import { useEffect, useRef, useState } from 'react';
import { Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { quickNavAnchors, scrollToAnchor } from '@/lib/quick-nav';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useFirstScrollComplete } from '@/hooks/useFirstScrollComplete';
import type { PaletteColor } from '@/components/ui/ChapterSection';

/** Maps palette keys to Tailwind ring-color classes for the FAB accent. */
const paletteRingClass: Record<PaletteColor, string> = {
  'deep-matcha': 'ring-deep-matcha',
  'raspberry': 'ring-raspberry',
  'matcha-latte': 'ring-matcha-latte',
  'strawberry-jam': 'ring-strawberry-jam',
  'matcha-chiffon': 'ring-matcha-chiffon',
  'berry-meringue': 'ring-berry-meringue',
  'golden-matcha': 'ring-golden-matcha',
  'strawberry-milk': 'ring-strawberry-milk',
};

/** The Hero owns its own static jump-nav (HeroJumpNav); the FAB stays out of its way. */
const HERO_SECTION_ID = 'hero';

export function FloatingAnchorSet() {
  const { isComplete, markComplete } = useFirstScrollComplete();
  const [activePalette, setActivePalette] = useState<PaletteColor>('raspberry');
  // Default to the hero so the FAB starts hidden on the landing screen and
  // only appears once the guest scrolls into a content section.
  const [activeSectionId, setActiveSectionId] = useState<string>(HERO_SECTION_ID);
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const rsvpObservedRef = useRef(false);
  const navRef = useRef<HTMLElement>(null);

  // Track the active section to drive palette + hide-on-hero behavior, and
  // mark the first-scroll flag the first time RSVP comes into view (the
  // gate that unhides both this FAB and the Hero ghost pills on future
  // visits).
  //
  // We maintain a per-section ratio map and always activate the section
  // with the HIGHEST `intersectionRatio`. A single-threshold observer
  // would just hand us whichever entry crossed last, which is unstable
  // on snap-scroll layouts — the FAB would flicker on mid-transition,
  // stick to the wrong section after scrolling back to the hero, or
  // sometimes vanish entirely. Picking max ratio converges to the
  // dominant section regardless of callback order or scroll direction.
  useEffect(() => {
    const scrollRoot = document.getElementById('main-content');
    if (!scrollRoot) return;

    const sections = scrollRoot.querySelectorAll<HTMLElement>('section[data-palette]');
    if (sections.length === 0) return;

    const sectionMap = new Map<string, HTMLElement>();
    sections.forEach((section) => sectionMap.set(section.id, section));

    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.intersectionRatio);
        }

        let topId = HERO_SECTION_ID;
        let topRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > topRatio) {
            topId = id;
            topRatio = ratio;
          }
        }

        setActiveSectionId(topId);

        const palette = sectionMap.get(topId)?.getAttribute('data-palette') as
          | PaletteColor
          | null;
        if (palette) setActivePalette(palette);

        if (topId === 'rsvp' && !rsvpObservedRef.current) {
          rsvpObservedRef.current = true;
          markComplete();
        }
      },
      // Multiple thresholds so the observer re-fires as ratios change, not
      // only when a single 30 % line is crossed — the map needs frequent
      // updates to stay accurate during snap transitions.
      { root: scrollRoot, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [markComplete]);

  // Close on Escape key or click outside
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [open]);

  // Stay hidden until the guest has scrolled through to RSVP at least once,
  // and stay hidden on the hero (HeroJumpNav covers wayfinding there).
  if (!isComplete || activeSectionId === HERO_SECTION_ID) return null;

  const ringClass = paletteRingClass[activePalette] ?? '';

  return (
    <nav
      ref={navRef}
      aria-label="Quick navigation"
      className="fixed right-[calc(1rem+env(safe-area-inset-right))] bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-40"
    >
      {/* Expanded anchor options */}
      <div
        className={cn(
          'mb-2 flex flex-col gap-2 transition-all duration-200',
          open ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-2 opacity-0',
        )}
      >
        {quickNavAnchors.map(({ id, label, shortLabel, Icon }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            tabIndex={open ? 0 : -1}
            onClick={() => {
              scrollToAnchor(id, prefersReducedMotion);
              setOpen(false);
            }}
            className={cn(
              'flex h-11 items-center gap-2 self-end rounded-full pl-3 pr-4',
              'bg-white/90 text-foreground shadow-lg backdrop-blur-sm',
              'transition-colors duration-300',
              'hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground',
            )}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="text-xs font-medium">{shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Toggle FAB — palette accent via ring color */}
      <button
        type="button"
        aria-label={open ? 'Close navigation' : 'Open quick navigation'}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'ml-auto flex h-12 w-12 items-center justify-center rounded-full',
          'bg-white/90 text-foreground shadow-lg backdrop-blur-sm',
          'ring-2 transition-all duration-200',
          'hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground',
          ringClass,
        )}
      >
        <Compass
          className={cn('h-6 w-6 transition-transform duration-200', open && 'rotate-90')}
          aria-hidden="true"
        />
      </button>
    </nav>
  );
}
