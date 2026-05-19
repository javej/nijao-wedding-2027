import Image from 'next/image';

type CatStrawberryProps = {
  className?: string;
};

/**
 * CatStrawberry — whimsical character mascot. Cat paired with a strawberry
 * element. Used as a top-corner accent for decorated sections, mirroring
 * SiameseMatcha across the cream/sage variant pair.
 *
 * Asset: frontend/public/decorations/cat-strawberry.png — needs a
 * transparent background.
 */
export function CatStrawberry({ className }: CatStrawberryProps) {
  return (
    <Image
      src="/decorations/cat-strawberry.png"
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      className={className}
    />
  );
}
