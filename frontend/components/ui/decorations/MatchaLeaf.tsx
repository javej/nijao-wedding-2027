import type { SVGProps } from 'react';

/**
 * MatchaLeaf — single-path SVG, fills with currentColor for CSS theming.
 *
 * Pointed-oval tea leaf, slightly asymmetric for an organic feel.
 * Designed for ornamental use at 20-56px sizes.
 *
 * v0 hand-coded asset. Swap freely later.
 */
export function MatchaLeaf(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 40 64"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M20 4
           C 8 12, 4 28, 6 42
           C 8 52, 14 58, 20 60
           C 26 58, 32 52, 34 42
           C 36 28, 32 12, 20 4 Z"
      />
    </svg>
  );
}
