import { urlFor } from "@/sanity/lib/image";
import { ProposalStack } from "@/components/sections/ProposalStack";
import { PageCard, type PageBg } from "@/components/ui/PageCard";
import {
  ChapterPhotoCrossfade,
  type CrossfadePhoto,
} from "@/components/ui/ChapterPhotoCrossfade";
import type {
  StoryChapterImage,
  StoryChapterResult,
} from "@/sanity/queries/storyChapters";

interface StoryChapterProps {
  chapter: StoryChapterResult;
  /**
   * Which patterned page this year sits on. Picked by the parent
   * (`WeddingExperience`) from the 3-way rotation across year chapters
   * (cream → matcha → raspberry → ...). Proposal chapters branch into
   * `ProposalStack` and never use this prop.
   */
  pageBg: PageBg;
  /**
   * Eager-load this chapter's PageCard PNG and first photo. Set true
   * for the first story chapter to avoid LCP regression; false for
   * the rest so they lazy-load as the user scrolls into them.
   */
  priority?: boolean;
}

/**
 * StoryChapter — Server Component
 *
 * Renders one year of the love story as a "page in the album":
 * a centered portrait PageCard with year (large serif italic),
 * photo crossfade (4:5 bare photo, soft shadow), and caption
 * (DM Sans body) inside the page's inner safe area.
 *
 * The proposal year (`isProposal: true`) branches into ProposalStack,
 * which trades the crossfade for the scroll-pinned accumulation
 * mechanic and locks to the strawberry-milk page.
 *
 * Must be wrapped in <ChapterSection story bg="page-..."> for the
 * page-wing color, continuous-flow scroll, and watermark suppression.
 */
export function StoryChapter({ chapter, pageBg, priority = false }: StoryChapterProps) {
  if (chapter.isProposal) {
    return <ProposalStack chapter={chapter} />;
  }

  const { year, caption } = chapter;
  const photos = toCrossfadePhotos(chapter, year);

  return (
    <PageCard bg={pageBg} priority={priority}>
      <h2
        className="font-display italic font-normal text-display-lg text-text-on-light leading-display px-5 py-1 rounded-md backdrop-blur-sm"
        style={{ backgroundColor: 'var(--text-backdrop)' }}
      >
        {year}
      </h2>

      <div className="my-(--gap-chapter-elements) flex w-full items-center justify-center">
        {photos.length > 0 ? (
          <ChapterPhotoCrossfade
            photos={photos}
            priorityFirst={priority}
            className="aspect-4/5 w-full"
          />
        ) : (
          <div
            className="aspect-4/5 w-full flex items-center justify-center bg-text-on-light/5"
            role="img"
            aria-label={`Placeholder for ${year}`}
          >
            <span className="font-display italic text-display-md text-text-on-light/30 select-none">
              {year}
            </span>
          </div>
        )}
      </div>

      <p
        className="font-body font-normal text-body-md text-text-on-light leading-relaxed max-w-sm px-5 py-2 rounded-md backdrop-blur-sm"
        style={{ backgroundColor: 'var(--text-backdrop)' }}
      >
        {caption}
      </p>
    </PageCard>
  );
}

/**
 * Build the list of photos to feed the crossfade. Prefer the gallery
 * (`images[]`) if populated; otherwise fall back to the legacy single
 * `image`. Cap at 3 — past that the slot timing makes a chapter dwell
 * too long, and most years naturally have 2–3 keeper photos anyway.
 */
function toCrossfadePhotos(
  chapter: StoryChapterResult,
  year: number,
): CrossfadePhoto[] {
  const source: StoryChapterImage[] =
    chapter.images && chapter.images.length > 0
      ? chapter.images.slice(0, 3)
      : chapter.image
        ? [chapter.image]
        : [];

  return source.map((image, i) => ({
    src: urlFor(image).width(800).url(),
    alt: image.alt || `Jave and Nianne, ${year} (${i + 1})`,
    blurDataURL: image.asset.metadata?.lqip,
  }));
}
