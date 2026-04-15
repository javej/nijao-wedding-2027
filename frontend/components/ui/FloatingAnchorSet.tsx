'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar, Palette, Heart, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
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

const anchors = [
  { id: 'wedding-details', label: 'Jump to Wedding Details', shortLabel: 'Details', Icon: Calendar },
  { id: 'dress-code', label: 'Jump to Dress Code', shortLabel: 'Attire', Icon: Palette },
  { id: 'rsvp', label: 'Jump to RSVP', shortLabel: 'RSVP', Icon: Heart },
] as const;

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

export function FloatingAnchorSet() {
  const { isComplete, markComplete } = useFirstScrollComplete();
  const [activePalette, setActivePalette] = useState<PaletteColor>('raspberry');
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const rsvpObservedRef = useRef(false);
  const navRef = useRef<HTMLElement>(null);

  // Observe sections for palette tracking + RSVP first-scroll detection
  useEffect(() => {
    const scrollRoot = document.getElementById('main-content');
    if (!scrollRoot) return;

    const sections = scrollRoot.querySelectorAll<HTMLElement>('section[data-palette]');
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const palette = entry.target.getAttribute('data-palette') as PaletteColor | null;
          if (palette) setActivePalette(palette);

          if (entry.target.id === 'rsvp' && !rsvpObservedRef.current) {
            rsvpObservedRef.current = true;
            markComplete();
          }
        }
      },
      { root: scrollRoot, threshold: 0.3 },
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

  if (!isComplete) return null;

  const scrollBehavior = prefersReducedMotion ? 'instant' : 'smooth';
  const ringClass = paletteRingClass[activePalette] ?? '';

  return (
    <nav ref={navRef} aria-label="Quick navigation" className="fixed bottom-6 right-4 z-40">
      {/* Expanded anchor options */}
      <div
        className={cn(
          'mb-2 flex flex-col gap-2 transition-all duration-200',
          open ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-2 opacity-0',
        )}
      >
        {anchors.map(({ id, label, shortLabel, Icon }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            tabIndex={open ? 0 : -1}
            onClick={() => {
              const target = document.getElementById(id);
              target?.scrollIntoView({ behavior: scrollBehavior });
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
