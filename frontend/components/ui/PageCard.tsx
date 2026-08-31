'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Page background colors. Each maps to a 1024×1536 patterned PNG —
 * embossed floral edge frame on the named paper color. The four assets
 * share the same ornament composition, differing only in paper hue, so
 * the album reads as a single set of sister pages.
 */
export type PageBg = 'cream' | 'matcha' | 'raspberry' | 'strawberry-milk';

const pageBgSrc: Record<PageBg, string> = {
  'cream': '/decorations/patterned-bg-cream.png',
  'matcha': '/decorations/patterned-bg-matcha.png',
  'raspberry': '/decorations/patterned-bg-raspberry.png',
  'strawberry-milk': '/decorations/patterned-bg-strawberry-milk.png',
};

/**
 * How much of the card must be on screen before it settles. Below the
 * crossfade's `OPEN_RATIO` on purpose: the paper should be down before the
 * photo inside it starts moving, not at the same moment.
 */
const SETTLE_RATIO = 0.4;

interface PageCardProps {
  /** Which patterned paper this page renders on. */
  bg: PageBg;
  /**
   * Prioritize loading the PNG (eager + fetchpriority high). True for
   * the first story chapter to avoid LCP regression; false otherwise.
   */
  priority?: boolean;
  /**
   * Play the one-shot `page-settle` animation the first time this card is
   * scrolled into view — the page easing up to full size, so it reads as
   * paper being laid down rather than as having always been there.
   *
   * Opt-in, and off by default: the proposal already earns its own motion
   * from the stacking mechanic, and the ActCard plates have the curtain, so
   * only the year chapters want this.
   */
  settle?: boolean;
  /** Optional class override. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * PageCard — Client Component
 *
 * (It was a Server Component until the `settle` animation arrived. The
 * trigger has to be "this card entered the viewport", which needs an
 * IntersectionObserver on the card's own root element — and the root is
 * the element being animated, so no wrapper can stand in for it without
 * taking over the orientation positioning below. The cost is near zero:
 * the markup is small, next/image is already in the client bundle via
 * ChapterPhotoCrossfade, and ProposalStack already rendered this
 * component on the client anyway.)
 *
 * Renders one of the four patterned-bg pages with orientation-aware
 * sizing — the PNG is portrait-aspect (1024×1536), so we render it
 * differently depending on viewport orientation:
 *
 *   • Portrait viewports (mobile, tall windows): full-bleed inside
 *     the parent section. The PNG fills naturally, ornament reads as
 *     a full frame, no wing color shows. This is what mobile users see.
 *
 *   • Landscape viewports (desktop, wide windows): centered portrait
 *     page-card at the PNG's native 2:3 aspect, height-clamped to
 *     90dvh, soft drop shadow, with the parent section's bg color
 *     filling the wings on either side. Honors the PNG's authored
 *     composition (no ornament cropping) at the cost of showing
 *     wing color on either side.
 *
 * Children render in the same inner safe area (12% inset) in both
 * modes — clear of the embossed floral corner ornaments.
 *
 * The parent (`ChapterSection` for year chapters, the sticky inner
 * div for the proposal) already has `flex items-center justify-center`,
 * so the landscape variant's `relative` positioning gets flex-centered
 * automatically. The portrait variant's `absolute inset-0` opts out of
 * flex layout entirely and fills the section.
 */
export function PageCard({
  bg,
  priority = false,
  settle = false,
  className,
  children,
}: PageCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasSettled, setHasSettled] = useState(false);

  useEffect(() => {
    if (!settle) return;
    const el = cardRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.intersectionRatio >= SETTLE_RATIO) {
          setHasSettled(true);
          // One-shot. A page gets laid down once and then stays put;
          // replaying it on every scroll-back would fight the Ken Burns
          // restart happening inside it at the same moment. Drop the
          // disconnect to make it replay per visit instead.
          obs.disconnect();
        }
      },
      { threshold: [0, SETTLE_RATIO, 1] },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [settle]);

  return (
    <div
      ref={cardRef}
      className={cn(
        // Portrait: full-bleed — fills the parent section.
        'portrait:absolute portrait:inset-0',
        // Landscape: centered portrait card at native 2:3 aspect.
        // Height clamps to min(90dvh, 95vw*3/2) so it never crowds the
        // viewport edges. Width auto-derives from the aspect lock.
        'landscape:relative landscape:aspect-2/3 landscape:w-auto landscape:h-[min(90dvh,calc(95vw*3/2))]',
        // Landscape gets a soft drop shadow lifting the page off the
        // wing color so it reads as a physical card on a tabletop.
        // Portrait has no edge to shadow (the page IS the section).
        'landscape:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)]',
        className,
      )}
      // `both` holds the end state, so the card stays at scale(1) after
      // the settle. Under `prefers-reduced-motion` the global block in
      // globals.css collapses the duration to 0.01ms, which lands the
      // same end state immediately — hence no hook needed here.
      style={hasSettled ? { animation: 'var(--animate-page-settle)' } : undefined}
    >
      <Image
        src={pageBgSrc[bg]}
        alt=""
        fill
        priority={priority}
        sizes="(orientation: portrait) 100vw, 60vh"
        className="object-cover"
        aria-hidden="true"
      />
      {/* Inner safe area — children sit clear of the embossed ornament
          which lives in the outer 12–15% of the page on each side. */}
      <div className="absolute inset-[12%] z-10 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
