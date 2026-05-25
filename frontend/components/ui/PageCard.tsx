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
   * the first story chapter to avoid LCP regression; false otherwise
   * so subsequent pages lazy-load as the user scrolls.
   */
  priority?: boolean;
  /** Optional class override. */
  className?: string;
  children: React.ReactNode;
}

/**
 * PageCard — Server Component
 *
 * Renders one of the four patterned-bg pages as a full-bleed
 * background filling its parent. Children render in an inner safe
 * area inset 12% from each side, clear of the embossed floral
 * corner ornaments.
 *
 * Sizing model:
 *   - Wrapper is `absolute inset-0` — fills the parent (`ChapterSection`
 *     in the year-chapter case, the sticky inner div in the proposal
 *     case). The parent already establishes the right scroll/layout
 *     box; PageCard just paints inside it.
 *   - The PNG fills via `next/image` `fill` + `object-cover`. On
 *     portrait viewports (mobile) the PNG fills naturally and the
 *     ornament reads as a full frame. On landscape viewports the
 *     PNG is wider-cropped: the central vertical line and partial
 *     top-left + bottom-right ornament still show; the edge florals
 *     run off-screen. Trade-off accepted in exchange for full-bleed
 *     pattern coverage with no wing color showing.
 *   - No drop shadow — when the PNG IS the section bg, there's no
 *     edge to lift the page off of. The page is the section.
 */
export function PageCard({ bg, priority = false, className, children }: PageCardProps) {
  return (
    <div className={cn('absolute inset-0', className)}>
      <Image
        src={pageBgSrc[bg]}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
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
