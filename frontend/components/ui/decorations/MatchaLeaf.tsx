import Image from 'next/image';

type MatchaLeafProps = {
  className?: string;
};

/**
 * MatchaLeaf — watercolor leaf illustration, rendered via next/image.
 *
 * Was previously a Lucide line-art leaf icon inheriting `currentColor`.
 * Now a raster watercolor — `text-*` classes from callers are no-ops.
 *
 * Asset: frontend/public/decorations/matcha-leaf.png — needs a
 * transparent background.
 */
export function MatchaLeaf({ className }: MatchaLeafProps) {
  return (
    <Image
      src="/decorations/matcha-leaf.png"
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      className={className}
    />
  );
}
