import Image from 'next/image';

type LaceCornerProps = {
  className?: string;
};

/**
 * LaceCorner — a delicate corner motif, rendered via next/image.
 *
 * The image's intrinsic orientation anchors at the TOP-LEFT. Rotate via
 * Tailwind (`rotate-90`, `rotate-180`, `-rotate-90`) to place at the
 * other three corners — rotation classes work on any element.
 *
 * Was previously a custom SVG (dots + arcs) tinted via `currentColor`.
 * Now a raster — color comes from the PNG itself, `text-*` classes
 * from callers are no-ops.
 *
 * Asset: frontend/public/decorations/lace.png — needs a transparent
 * background.
 */
export function LaceCorner({ className }: LaceCornerProps) {
  return (
    <Image
      src="/decorations/lace.png"
      alt=""
      aria-hidden="true"
      width={256}
      height={256}
      className={className}
    />
  );
}
