import type { SVGProps } from 'react';

/**
 * LaceCorner — a delicate corner motif, fanning out from one anchor.
 *
 * The default orientation anchors at the TOP-LEFT (the rosette sits near
 * coordinates (3, 3)). Rotate via Tailwind (`rotate-90`, `rotate-180`,
 * `-rotate-90`) to place at the other three corners.
 *
 * Designed for the scrapbook proposal layout — paired with `ScallopedMat`
 * to frame individual photos. Uses `currentColor` so it inherits the
 * palette accent of its parent.
 */
export function LaceCorner(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      {/* Anchor rosette at the corner */}
      <circle cx="3" cy="3" r="1.6" />

      {/* Inner fan — 3 petals along a quarter-arc at radius ~7 */}
      <circle cx="3" cy="10" r="1.1" />
      <circle cx="7" cy="7" r="1.1" />
      <circle cx="10" cy="3" r="1.1" />

      {/* Outer fan — 2 smaller petals further out, suggesting lace edging */}
      <circle cx="3" cy="15" r="0.8" />
      <circle cx="15" cy="3" r="0.8" />

      {/* Faint connecting arcs hint at the lace weave */}
      <path
        d="M 3 10 Q 6 6 10 3"
        stroke="currentColor"
        fill="none"
        strokeWidth="0.5"
        opacity="0.55"
      />
      <path
        d="M 3 15 Q 9 9 15 3"
        stroke="currentColor"
        fill="none"
        strokeWidth="0.4"
        opacity="0.4"
      />
    </svg>
  );
}
