import Image from 'next/image';

type SiameseMatchaProps = {
  className?: string;
};

/**
 * SiameseMatcha — whimsical character mascot. Siamese cat paired with a
 * matcha element. Used as a top-corner accent for decorated sections,
 * giving each chapter a playful character instead of pure floral motifs.
 *
 * Asset: frontend/public/decorations/siamese-matcha.png — needs a
 * transparent background.
 */
export function SiameseMatcha({ className }: SiameseMatchaProps) {
  return (
    <Image
      src="/decorations/siamese-matcha.png"
      alt=""
      aria-hidden="true"
      width={512}
      height={512}
      className={className}
    />
  );
}
