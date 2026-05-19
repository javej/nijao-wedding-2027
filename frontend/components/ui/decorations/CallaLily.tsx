import Image from 'next/image';

type CallaLilyProps = {
  className?: string;
  /**
   * Which watercolor variant to render. Two illustrations live in
   * `public/decorations/` — `calla-lily.png` (variant 1, default) and
   * `calla-lily-2.png` (variant 2). Used by SectionDecorations to
   * alternate the top-corner pair without repeating the same image.
   */
  variant?: 1 | 2;
};

/**
 * "Calla lily" slot — watercolor illustration rendered via next/image.
 *
 * Was previously an inline SVG (Lucide flower stand-in) that inherited
 * stroke color from `currentColor`. The current asset is a raster
 * watercolor, so:
 *   - `text-*` color classes from callers are no-ops (raster keeps its
 *     own colors). The white-petals/green-leaves palette reads neutral
 *     on both the cream and sage section backgrounds.
 *   - SVG-only props (`strokeWidth` etc.) are not accepted. Sizing
 *     comes from `className` (`w-24`, `w-36`, …) — the next/image
 *     `width`/`height` only reserve the aspect ratio.
 *
 * Assets must have transparent backgrounds — otherwise the rectangular
 * image bounds show up on the section background.
 */
export function CallaLily({ className, variant = 1 }: CallaLilyProps) {
  const src =
    variant === 2 ? '/decorations/calla-lily-2.png' : '/decorations/calla-lily.png';

  return (
    <Image
      src={src}
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      className={className}
    />
  );
}
