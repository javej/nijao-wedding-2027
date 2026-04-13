import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { ProposalSectionResult } from "@/sanity/queries/storyChapters";

interface ProposalSectionProps {
  proposal: NonNullable<ProposalSectionResult>;
}

/**
 * ProposalSection — Server Component
 *
 * The emotional climax of the love story scroll: Mt. Fuji proposal.
 * Visually distinct from StoryChapter — full-bleed image with text overlay,
 * heavier typography (Cormorant Garamond semibold), strawberry-jam palette.
 *
 * Must be wrapped in <ChapterSection> for snap-scroll and palette accent.
 */
export function ProposalSection({ proposal }: ProposalSectionProps) {
  const { caption, image } = proposal;

  return (
    <div className="relative flex items-center justify-center w-full min-h-dvh">
      {/* Background: image + overlay contained together to hide blur edge artifacts */}
      <div className="absolute inset-0 overflow-hidden">
        {image?.asset ? (
          <Image
            src={urlFor(image).width(1200).url()}
            alt={image.alt || "Mt. Fuji — the proposal"}
            fill
            sizes="100vw"
            loading="lazy"
            className="object-cover blur-sm scale-105"
            placeholder={image.asset.metadata?.lqip ? "blur" : undefined}
            blurDataURL={image.asset.metadata?.lqip}
          />
        ) : (
          <div
            className="absolute inset-0 bg-strawberry-jam/20"
            role="img"
            aria-label="Mt. Fuji — the proposal"
          />
        )}

        {/* Dark overlay — 60% for WCAG AA contrast on light photos */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Text overlay — centered, generous whitespace for emotional pause */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-(--chapter-padding-x) py-(--chapter-padding-y) max-w-2xl">
        <h2 className="font-display font-semibold text-display-xl text-text-on-dark tracking-wide leading-display">
          The Proposal
        </h2>

        <p className="font-display font-light text-display-md text-text-on-dark/90 leading-relaxed mt-8 max-w-lg whitespace-pre-line">
          {caption}
        </p>
      </div>
    </div>
  );
}
