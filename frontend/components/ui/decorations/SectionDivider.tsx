import Image from 'next/image';

type SectionDividerProps = {
  className?: string;
};

/**
 * SectionDivider — a watercolor "ribbon of botanicals" sitting centered
 * at the bottom of decorated sections, acting as a chapter-closing
 * flourish.
 *
 * Asset: frontend/public/decorations/divider.png — generated to be
 * 1792×1024 (16:9 landscape) with the painting concentrated in the
 * horizontal middle band and transparent surround. If you regenerate
 * at a different aspect ratio, update the width/height props below
 * so next/image reserves the correct space.
 *
 * Why bottom (not top)? Top of each section is already framed by the
 * two-calla pair. Bottom is the empty band on mobile (where corner
 * ornaments are hidden) and the under-content area on tablet+ — both
 * benefit from a centered horizontal flourish, neither has any other
 * decoration competing for that horizontal axis.
 */
export function SectionDivider({ className }: SectionDividerProps) {
  return (
    <Image
      src="/decorations/divider.png"
      alt=""
      aria-hidden="true"
      width={1792}
      height={1024}
      className={className}
    />
  );
}
