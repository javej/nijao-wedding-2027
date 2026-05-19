import type { SVGProps } from 'react';

/**
 * Strawberry — single-element SVG, fills with currentColor for CSS theming.
 *
 * Classic teardrop body with a five-point leafy calyx on top. A few
 * tiny dots suggest seeds without painting realism. Designed for
 * ornamental use at 16-48px sizes.
 *
 * v0 hand-coded asset. Swap freely later.
 */
export function Strawberry(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 56"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {/* Body — teardrop */}
      <path
        d="M24 18
           C 12 18, 6 26, 6 34
           C 6 46, 16 54, 24 54
           C 32 54, 42 46, 42 34
           C 42 26, 36 18, 24 18 Z"
      />
      {/* Calyx — five pointed leaves */}
      <path
        d="M24 4
           L 18 14
           L 10 12
           L 14 20
           L 8 24
           L 16 24
           L 14 18
           L 22 20
           L 24 12
           L 26 20
           L 34 18
           L 32 24
           L 40 24
           L 34 20
           L 38 12
           L 30 14 Z"
      />
      {/* Seeds — tiny dots scattered on the body, drawn as small ellipses */}
      <ellipse cx="16" cy="30" rx="1" ry="1.5" opacity="0.45" />
      <ellipse cx="22" cy="36" rx="1" ry="1.5" opacity="0.45" />
      <ellipse cx="30" cy="28" rx="1" ry="1.5" opacity="0.45" />
      <ellipse cx="28" cy="42" rx="1" ry="1.5" opacity="0.45" />
      <ellipse cx="18" cy="42" rx="1" ry="1.5" opacity="0.45" />
    </svg>
  );
}
