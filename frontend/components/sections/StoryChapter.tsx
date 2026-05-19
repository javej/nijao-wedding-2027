import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { ProposalScrapbook } from "@/components/sections/ProposalScrapbook";
import { ScallopedMat } from "@/components/ui/decorations/ScallopedMat";
import type { StoryChapterResult } from "@/sanity/queries/storyChapters";

interface StoryChapterProps {
  chapter: StoryChapterResult;
  /**
   * True when this chapter sits on a deep-matcha (sage / even-position)
   * section. Drives the frame swap from the cream `wedding-paper.png` mat
   * to the `lace-vector.png` lace frame, and adjusts the photo wrapper
   * aspect from portrait (3:4) to landscape (3:2) so the lace renders at
   * its natural aspect without distortion.
   */
  isOnDarkBg: boolean;
}

/**
 * StoryChapter — Server Component
 *
 * Renders a single year of the love story. For most years that's one image
 * + one caption — restraint over density. The photo is framed by a
 * `ScallopedMat` so every chapter shares the lace-print treatment that
 * anchors the proposal scrapbook, just upright and centered rather than
 * scattered.
 *
 * The proposal year (`isProposal === true`) branches into
 * `ProposalScrapbook`, which trades the single print for a small scatter
 * of mats but keeps the same outer rhythm (year, caption, one snap point).
 *
 * Must be wrapped in <ChapterSection> for snap-scroll and palette accent.
 */
export function StoryChapter({ chapter, isOnDarkBg }: StoryChapterProps) {
  if (chapter.isProposal) {
    return <ProposalScrapbook chapter={chapter} isOnDarkBg={isOnDarkBg} />;
  }

  const { year, caption, image } = chapter;

  const photo = image?.asset ? (
    <Image
      src={urlFor(image).width(800).url()}
      alt={image.alt || `Jave and Nianne, ${year}`}
      fill
      sizes="(max-width: 768px) 18rem, 24rem"
      loading="lazy"
      className="object-cover"
      placeholder={image.asset.metadata?.lqip ? "blur" : undefined}
      blurDataURL={image.asset.metadata?.lqip}
    />
  ) : (
    <div
      className="absolute inset-0 flex items-center justify-center bg-matcha-latte/20"
      role="img"
      aria-label={`Placeholder for ${year}`}
    >
      <span className="font-body font-normal text-display-lg text-matcha-latte/30 select-none">
        {year}
      </span>
    </div>
  );

  return (
    <div className="relative flex flex-col items-center justify-center text-center px-(--chapter-padding-x) py-(--chapter-padding-y)">
      <h2 className="font-body font-normal text-display-sm text-text-on-light/70 tracking-widest mb-5">
        {year}
      </h2>

      {isOnDarkBg ? (
        // Deep-matcha bg: portrait lace-vector frame matching the photo's
        // 3:4 aspect. The lace edges are painted into the asset itself so
        // no inner LaceCorner motifs needed; the photo sits inside the
        // lace's transparent center at the same wrapper size as the cream
        // variant so the two layouts read as siblings, not different
        // photo presentations.
        <ScallopedMat
          frameSrc="/decorations/lace-vector.png"
          withLaceCorners={false}
          className="aspect-3/4 w-72 drop-shadow-md md:w-96"
          contentClassName="absolute inset-[6%] overflow-hidden rounded-[2px]"
        >
          {photo}
        </ScallopedMat>
      ) : (
        // Cream bg: wedding-paper mat with inner lace corners (existing
        // scrapbook treatment).
        <ScallopedMat
          className="aspect-3/4 w-72 drop-shadow-md md:w-96"
          contentClassName="absolute inset-[6%] overflow-hidden rounded-[2px] bg-section-cream"
        >
          {photo}
        </ScallopedMat>
      )}

      <p className="font-body font-normal text-body-md text-text-on-light leading-relaxed mt-5 max-w-sm">
        {caption}
      </p>
    </div>
  );
}
