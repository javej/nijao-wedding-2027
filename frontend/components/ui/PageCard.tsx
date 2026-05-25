import Image from 'next/image';
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

interface PageCardProps {
  /** Which patterned paper this page renders on. */
  bg: PageBg;
  /**
   * Prioritize loading the PNG (eager + fetchpriority high). True for
   * the first story chapter to avoid LCP regression; false otherwise.
   */
  priority?: boolean;
  /** Optional class override. */
  className?: string;
  children: React.ReactNode;
}

/**
 * PageCard — Server Component
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
export function PageCard({ bg, priority = false, className, children }: PageCardProps) {
  return (
    <div
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
