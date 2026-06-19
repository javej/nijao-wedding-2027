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

  // Three fixed-height zones that sum to the page-card's inner area
  // (see ADR-0007). The photo band is the anchor: a height-driven 4:5
  // print at the same size + position in every chapter, so caption
  // length never resizes or shifts it. The caption band is reserved
  // and top-aligned — a short caption leaves space at the BOTTOM of
  // its band rather than re-centering and dragging the photo up.
  return (
    <PageCard bg={pageBg} priority={priority}>
      {/* Year band — fixed top zone, prominent serif title. */}
      <div className="flex h-[14%] w-full shrink-0 items-center justify-center">
        <h2 className="chapter-lift flex items-center justify-center rounded-2xl bg-[var(--text-backdrop)] backdrop-blur-sm font-display italic font-normal text-[clamp(1.375rem,4.5dvh,2.25rem)] text-text-on-light leading-none px-6 py-[clamp(0.3rem,1dvh,0.55rem)]">
          {year}
        </h2>
      </div>

      {/* Photo band — the anchor. `h-full w-auto` sizes the 4:5 print by
          the band height; `max-w-full` caps it so on portrait it widens
          toward the frame and on landscape it floats with side margin.
          48% is tuned so the photo is as large as possible while a
          full-length (~280-char) caption still clears the band below it on
          the worst case — a narrow-and-tall phone, where the caption wraps
          to the most lines. */}
      <div className="flex h-[48%] w-full shrink-0 items-center justify-center">
        {photos.length > 0 ? (
          <ChapterPhotoCrossfade
            photos={photos}
            priorityFirst={priority}
            className="aspect-4/5 h-full w-auto max-w-full"
          />
        ) : (
          <div
            className="aspect-4/5 h-full w-auto max-w-full flex items-center justify-center bg-text-on-light/5"
            role="img"
            aria-label={`Placeholder for ${year}`}
          >
            <span className="font-display italic text-display-md text-text-on-light/30 select-none">
              {year}
            </span>
          </div>
        )}
      </div>

      {/* Caption band — absorbs the remaining space below the fixed photo
          (text top-aligned, so a short caption leaves room beneath it and
          the photo above never moves). `flex-1` gives captions maximum
          room on short windows; `overflow-hidden` is a clean-edge backstop
          for a legacy >280-char caption (never an ellipsis) — the real cap
          lives in the Sanity schema. */}
      <div className="flex w-full min-h-0 flex-1 items-start justify-center overflow-hidden pt-4 md:pt-3">
        <p className="chapter-lift rounded-2xl bg-[var(--text-backdrop)] backdrop-blur-sm font-caption font-normal text-[clamp(0.75rem,1.85dvh,0.9375rem)] text-text-on-light leading-snug max-w-sm px-6 py-2">
          {caption}
        </p>
      </div>
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
