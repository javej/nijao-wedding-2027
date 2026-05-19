import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { ScallopedMat } from "@/components/ui/decorations/ScallopedMat";
import { cn } from "@/lib/utils";
import type { StoryChapterImage, StoryChapterResult } from "@/sanity/queries/storyChapters";

interface ProposalScrapbookProps {
  chapter: StoryChapterResult;
}

/**
 * ProposalScrapbook — Server Component
 *
 * Layout for the proposal story chapter (`isProposal: true`). Renders the
 * year + caption like every other `StoryChapter`, but replaces the single
 * centered photo with a scatter of up to 5 scalloped-mat prints — the
 * "scrapbook page" treatment for the engagement moment.
 *
 * Falls back to the legacy single `image` field if the `images` gallery is
 * empty (e.g., the migration hasn't run yet on the active dataset).
 *
 * Must be wrapped in <ChapterSection> for snap-scroll and palette accent.
 */
export function ProposalScrapbook({ chapter }: ProposalScrapbookProps) {
  const { year, caption } = chapter;
  const gallery = pickGalleryImages(chapter);

  return (
    <div className="relative flex flex-col items-center justify-center text-center px-(--chapter-padding-x) py-(--chapter-padding-y)">
      <h2 className="font-body font-normal text-display-sm text-text-on-light/70 tracking-widest mb-1">
        {year}
      </h2>

      <p className="font-display italic text-display-md text-raspberry leading-snug">
        The Proposal
      </p>

      <div
        className={cn(
          "relative my-8 w-full",
          "h-[22rem] max-w-sm",
          "md:h-[26rem] md:max-w-2xl",
        )}
        aria-hidden={gallery.length === 0}
      >
        {gallery.map((image, index) => (
          <ScrapbookPhoto
            key={image.asset._id ?? `proposal-${index}`}
            image={image}
            index={index}
            year={year}
          />
        ))}
      </div>

      <p className="font-body font-normal text-body-md text-text-on-light leading-relaxed max-w-sm whitespace-pre-line">
        {caption}
      </p>
    </div>
  );
}

interface ScrapbookPhotoProps {
  image: StoryChapterImage;
  index: number;
  year: number;
}

function ScrapbookPhoto({ image, index, year }: ScrapbookPhotoProps) {
  const slot = SCRAPBOOK_SLOTS[index % SCRAPBOOK_SLOTS.length]!;

  return (
    <div className={cn("absolute", slot.position)} style={{ zIndex: slot.z }}>
      <ScallopedMat
        tilt={slot.tilt}
        className={cn(slot.size, "drop-shadow-md")}
        contentClassName="absolute inset-[8%] overflow-hidden rounded-[2px] bg-section-cream"
      >
        <Image
          src={urlFor(image).width(560).url()}
          alt={image.alt || `The proposal, ${year}`}
          fill
          sizes="(max-width: 768px) 50vw, 24rem"
          loading="lazy"
          className="object-cover"
          placeholder={image.asset.metadata?.lqip ? "blur" : undefined}
          blurDataURL={image.asset.metadata?.lqip}
        />
      </ScallopedMat>
    </div>
  );
}

/**
 * Hand-arranged scatter for up to 5 photos. Positions, tilts, and z-order are
 * deterministic per index so the cluster reads the same on every render — no
 * Math.random() that'd hydration-mismatch between server and client.
 *
 * Every mat picks up the section's `--mat-color`, so all 5 prints share the
 * bg-alternation rule (deep-matcha on cream, strawberry-milk on sage); the
 * scatter's variety comes from position, tilt, and overlap instead of color.
 */
const SCRAPBOOK_SLOTS = [
  {
    position: "left-2 top-2 md:left-8 md:top-4",
    size: "w-32 h-40 md:w-44 md:h-56",
    tilt: -5,
    z: 3,
  },
  {
    position: "right-2 top-6 md:right-12 md:top-10",
    size: "w-28 h-36 md:w-40 md:h-52",
    tilt: 6,
    z: 2,
  },
  {
    position: "left-10 bottom-6 md:left-24 md:bottom-4",
    size: "w-32 h-40 md:w-44 md:h-56",
    tilt: -3,
    z: 4,
  },
  {
    position: "right-8 bottom-2 md:right-20 md:bottom-6",
    size: "w-28 h-36 md:w-40 md:h-52",
    tilt: 7,
    z: 1,
  },
  {
    position: "left-1/2 top-1/3 -translate-x-1/2 md:top-1/4",
    size: "w-24 h-32 md:w-36 md:h-48",
    tilt: -2,
    z: 5,
  },
] as const;

/**
 * Prefer the `images` gallery (the merged-schema field). Fall back to the
 * legacy single `image` if the migration hasn't run yet on this dataset —
 * the chapter still renders, just with one photo instead of a scatter.
 */
function pickGalleryImages(chapter: StoryChapterResult): StoryChapterImage[] {
  if (chapter.images && chapter.images.length > 0) {
    return chapter.images.slice(0, SCRAPBOOK_SLOTS.length);
  }
  if (chapter.image) return [chapter.image];
  return [];
}
