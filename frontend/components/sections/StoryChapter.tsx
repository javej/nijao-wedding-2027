import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { StoryChapterResult } from "@/sanity/queries/storyChapters";

interface StoryChapterProps {
  chapter: StoryChapterResult;
}

/**
 * StoryChapter — Server Component
 *
 * Renders a single year of the love story: one image + one caption.
 * Designed for restraint — "density is the enemy of luxury."
 *
 * Must be wrapped in <ChapterSection> for snap-scroll and palette accent.
 */
export function StoryChapter({ chapter }: StoryChapterProps) {
  const { year, caption, image } = chapter;

  return (
    <div className="relative flex flex-col items-center justify-center text-center px-(--chapter-padding-x) py-(--chapter-padding-y)">
      {/* Timeline accent dot */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-matcha-latte" />

      <h2 className="font-display font-light text-display-sm text-text-on-light/40 tracking-widest mb-8">
        {year}
      </h2>

      <div className="relative w-full max-w-md md:max-w-lg aspect-3/4 max-h-[50dvh]">
        {image?.asset ? (
          <Image
            src={urlFor(image).width(800).url()}
            alt={image.alt || `Jave and Nianne, ${year}`}
            fill
            sizes="(max-width: 768px) 28rem, 32rem"
            loading="lazy"
            className="object-cover rounded-sm mix-blend-multiply"
            placeholder={image.asset.metadata?.lqip ? "blur" : undefined}
            blurDataURL={image.asset.metadata?.lqip}
          />
        ) : (
          <div
            className="absolute inset-0 bg-matcha-latte/20 rounded-sm flex items-center justify-center"
            role="img"
            aria-label={`Placeholder for ${year}`}
          >
            <span className="font-display font-light text-display-lg text-matcha-latte/30 select-none">
              {year}
            </span>
          </div>
        )}
      </div>

      <p className="font-light text-body-lg text-text-on-light leading-relaxed mt-8 max-w-150">
        {caption}
      </p>
    </div>
  );
}
