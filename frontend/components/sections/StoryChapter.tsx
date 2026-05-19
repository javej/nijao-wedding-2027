import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { ProposalScrapbook } from "@/components/sections/ProposalScrapbook";
import { ScallopedMat } from "@/components/ui/decorations/ScallopedMat";
import type { StoryChapterResult } from "@/sanity/queries/storyChapters";

interface StoryChapterProps {
  chapter: StoryChapterResult;
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
export function StoryChapter({ chapter }: StoryChapterProps) {
  if (chapter.isProposal) {
    return <ProposalScrapbook chapter={chapter} />;
  }

  const { year, caption, image } = chapter;

  return (
    <div className="relative flex flex-col items-center justify-center text-center px-(--chapter-padding-x) py-(--chapter-padding-y)">
      <h2 className="font-body font-normal text-display-sm text-text-on-light/70 tracking-widest mb-5">
        {year}
      </h2>

      <ScallopedMat
        scallops={14}
        className="aspect-3/4 w-72 text-strawberry-milk drop-shadow-md md:w-96"
        contentClassName="absolute inset-[6%] overflow-hidden rounded-[2px] bg-section-cream"
      >
        {image?.asset ? (
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
        )}
      </ScallopedMat>

      <p className="font-body font-normal text-body-md text-text-on-light leading-relaxed mt-5 max-w-sm">
        {caption}
      </p>
    </div>
  );
}
