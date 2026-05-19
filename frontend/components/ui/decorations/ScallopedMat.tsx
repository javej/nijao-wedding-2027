import type { ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LaceCorner } from '@/components/ui/decorations/LaceCorner';

interface ScallopedMatProps {
  /**
   * Render the four `LaceCorner` motifs inside the mat margin. Defaults `true`
   * for the scrapbook proposal layout; pass `false` to skip and keep the mat
   * clean.
   */
  withLaceCorners?: boolean;
  /**
   * Optional CSS rotation (deg) for a hand-arranged tilt. Applied as inline
   * style so the value can be any degree, not just Tailwind's preset steps.
   */
  tilt?: number;
  /**
   * Tailwind classes for the OUTER wrapper. Accepts sizing classes
   * (width, aspect ratio). Note: `text-*` classes are no longer used to
   * paint the mat — the mat texture comes from `wedding-paper.png`.
   */
  className?: string;
  /**
   * Tailwind classes for the INNER content slot (where children render).
   * Tune padding here to control how thick the mat margin is around the
   * photo, and add `rounded-sm` if the inner image should match a print.
   */
  contentClassName?: string;
  children: ReactNode;
}

/**
 * ScallopedMat — a paper "mat" rendered from `wedding-paper.png`, framing
 * children with a vintage scrapbook print look.
 *
 * Anatomy:
 *   ┌───────────────────────────────┐
 *   │ ◇         (lace)            ◇ │  ← wedding-paper.png background
 *   │   ┌───────────────────────┐   │
 *   │   │                       │   │
 *   │   │      <children>       │   │  ← inner slot (your photo/text)
 *   │   │                       │   │
 *   │   └───────────────────────┘   │
 *   │ ◇                           ◇ │
 *   └───────────────────────────────┘
 *
 * Was previously a procedural SVG scalloped rectangle that stretched to
 * any aspect ratio with `preserveAspectRatio="none"`. Now a raster image
 * sized via `fill` + `object-fill` to keep the same stretch behaviour —
 * be aware that extreme aspect ratios will visibly distort the paper
 * texture. If you need crisp scalloped edges at arbitrary sizes, the
 * old procedural version is in git history.
 *
 * The `scallops` prop is gone — the scallop count is now baked into the
 * PNG asset.
 */
export function ScallopedMat({
  withLaceCorners = true,
  tilt,
  className,
  contentClassName,
  children,
}: ScallopedMatProps) {
  const transform = tilt !== undefined ? `rotate(${tilt}deg)` : undefined;

  return (
    <div
      className={cn('relative', className)}
      style={transform ? { transform } : undefined}
    >
      <Image
        src="/decorations/wedding-paper.png"
        alt=""
        aria-hidden="true"
        fill
        className="pointer-events-none object-fill"
      />

      {withLaceCorners && (
        <>
          <LaceCorner className="pointer-events-none absolute left-1 top-1 z-10 w-4 opacity-70 md:w-5" />
          <LaceCorner className="pointer-events-none absolute right-1 top-1 z-10 w-4 rotate-90 opacity-70 md:w-5" />
          <LaceCorner className="pointer-events-none absolute bottom-1 right-1 z-10 w-4 rotate-180 opacity-70 md:w-5" />
          <LaceCorner className="pointer-events-none absolute bottom-1 left-1 z-10 w-4 -rotate-90 opacity-70 md:w-5" />
        </>
      )}

      <div className={cn('relative z-0', contentClassName)}>{children}</div>
    </div>
  );
}
