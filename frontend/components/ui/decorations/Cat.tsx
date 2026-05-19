import Image from 'next/image';

type CatProps = {
  className?: string;
};

/**
 * Cat — watercolor siamese illustration, rendered via next/image.
 *
 * Was previously a Lucide line-art cat icon that inherited stroke color from
 * `currentColor`. The current asset is a raster watercolor, so:
 *   - `text-*` color classes from callers are no-ops (raster keeps its
 *     own colors). The siamese palette reads warm on both cream and sage.
 *   - SVG-only props (`strokeWidth` etc.) are no longer accepted.
 *
 * Asset: frontend/public/decorations/siamese.png — needs a transparent
 * background, otherwise the image bounds show up on the section.
 */
export function Cat({ className }: CatProps) {
  return (
    <Image
      src="/decorations/siamese.png"
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      className={className}
    />
  );
}
