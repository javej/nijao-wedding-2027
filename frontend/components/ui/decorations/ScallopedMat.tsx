import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LaceCorner } from '@/components/ui/decorations/LaceCorner';

interface ScallopedMatProps {
  /**
   * Number of scallops along each edge. Higher = finer lace; lower = chunkier
   * scrapbook cardstock. Defaults to 14 — pleasant on a 3/4 portrait card.
   */
  scallops?: number;
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
   * Tailwind classes for the OUTER wrapper. The mat's color comes from
   * `text-…` (we paint the scalloped background via `currentColor`).
   * The wrapper also accepts sizing classes (width, aspect ratio).
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
 * ScallopedMat — a paper "mat" with scalloped outer edges, framing children
 * with a vintage scrapbook print look.
 *
 * Anatomy:
 *   ┌───────────────────────────────┐
 *   │ ◇         (lace)            ◇ │  ← scalloped paper (this component)
 *   │   ┌───────────────────────┐   │
 *   │   │                       │   │
 *   │   │      <children>       │   │  ← inner slot (your photo/text)
 *   │   │                       │   │
 *   │   └───────────────────────┘   │
 *   │ ◇                           ◇ │
 *   └───────────────────────────────┘
 *
 * The scalloped edge is drawn via an inline SVG with `preserveAspectRatio="none"`
 * so the mat stretches to fit any aspect ratio — at typical scrapbook sizes
 * (a few hundred px per side) the minor scallop distortion is invisible.
 *
 * The mat color comes from `currentColor`, so the calling site sets it via
 * `text-strawberry-milk`, `text-matcha-chiffon`, etc. — keeping the palette
 * in design tokens, not hardcoded values.
 */
export function ScallopedMat({
  scallops = 14,
  withLaceCorners = true,
  tilt,
  className,
  contentClassName,
  children,
}: ScallopedMatProps) {
  const pathD = buildScallopedRectPath(scallops);
  const transform = tilt !== undefined ? `rotate(${tilt}deg)` : undefined;

  return (
    <div
      className={cn('relative', className)}
      style={transform ? { transform } : undefined}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={pathD} fill="currentColor" />
      </svg>

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

/**
 * Build the SVG path for a scalloped rectangle in a 100×100 viewBox.
 *
 * `n` semicircle bumps along each of the four sides, all bumping OUTWARD,
 * traced clockwise from the top-left. The inset baseline sits 5 units in
 * from each edge so the bumps reach the 0/100 boundary cleanly.
 */
function buildScallopedRectPath(n: number): string {
  // Inset by the scallop radius so bumps just touch the viewBox edge.
  // Scallop diameter = 2r = side-length / n  ⇒  r = (100 − 2·inset) / (2n)
  // and inset == r, so r = (100 − 2r) / (2n) ⇒  r = 50 / (n + 1) is wrong;
  // simpler: hold inset = r as a constant and let the span equal 100 − 2r.
  // For a square with `n` scallops of radius `r` per side:  2·r·n = 100 − 2r
  // ⇒  r = 100 / (2n + 2). Yields a clean baseline for any `n`.
  const r = 100 / (2 * n + 2);
  const inset = r;
  const d = 2 * r;

  const arcs = (count: number, dx: number, dy: number) =>
    Array.from({ length: count }, () => `a ${r} ${r} 0 0 1 ${dx} ${dy}`).join(' ');

  return [
    `M ${inset} ${inset}`,
    arcs(n, d, 0), // top edge → right, bumps outward (up)
    arcs(n, 0, d), // right edge → down, bumps outward (right)
    arcs(n, -d, 0), // bottom edge → left, bumps outward (down)
    arcs(n, 0, -d), // left edge → up, bumps outward (left)
    'Z',
  ].join(' ');
}
