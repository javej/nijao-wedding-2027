import Image from 'next/image';

type StrawberryProps = {
  className?: string;
};

/**
 * Strawberry — watercolor strawberry illustration, rendered via next/image.
 *
 * Was previously a Lucide Lab line-art strawberry icon inheriting
 * `currentColor`. Now a raster watercolor — `text-*` classes from
 * callers are no-ops.
 *
 * Asset: frontend/public/decorations/strawberry.png — needs a
 * transparent background.
 */
export function Strawberry({ className }: StrawberryProps) {
  return (
    <Image
      src="/decorations/strawberry.png"
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      className={className}
    />
  );
}
