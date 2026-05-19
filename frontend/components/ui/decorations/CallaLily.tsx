import type { SVGProps } from 'react';

/**
 * CallaLily — single-path SVG, fills with currentColor for CSS theming.
 *
 * Stylised trumpet form on a thin stem. Designed for ornamental use
 * at 24-96px sizes. The path is intentionally simple — a curling
 * spathe wrapping a central spadix — so it stays readable when small.
 *
 * v0 hand-coded asset. Swap freely for a curated hand-drawn version
 * later without touching layout code.
 */
export function CallaLily(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 96"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Spathe — the curling trumpet petal */}
      <path
        d="M32 6
           C 18 8, 10 22, 12 38
           C 13 48, 20 54, 28 54
           C 30 54, 32 52, 32 49
           L 32 16
           C 32 16, 38 18, 42 24
           C 47 32, 48 42, 44 50
           C 41 56, 35 58, 32 56
           C 31 55, 31 54, 32 53
           C 38 50, 44 42, 44 32
           C 44 18, 38 7, 32 6 Z"
      />
      {/* Spadix — the inner column */}
      <path d="M30 22 L30 50 C30 51 31 52 32 52 C33 52 34 51 34 50 L34 22 Z" />
      {/* Stem */}
      <path d="M30 54 C29 70, 30 82, 31 94 L33 94 C34 82, 35 70, 34 54 Z" />
    </svg>
  );
}
