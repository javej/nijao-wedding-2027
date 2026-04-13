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
      <h2 className="font-body font-normal text-display-sm text-text-on-light/70 tracking-widest mb-5">
        {year}
      </h2>

      <div className="relative w-72 md:w-96 aspect-3/4">
        {image?.asset ? (
          <Image
            src={urlFor(image).width(800).url()}
            alt={image.alt || `Jave and Nianne, ${year}`}
            fill
            sizes="(max-width: 768px) 18rem, 24rem"
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
            <span className="font-body font-normal text-display-lg text-matcha-latte/30 select-none">
              {year}
            </span>
          </div>
        )}
      </div>

      <p className="font-body font-normal text-body-md text-text-on-light leading-relaxed mt-5 max-w-sm">
        {caption}
      </p>
    </div>
  );
}
