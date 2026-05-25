'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { urlFor } from '@/sanity/lib/image';
import { PageCard } from '@/components/ui/PageCard';
import { cn } from '@/lib/utils';
import type {
  StoryChapterImage,
  StoryChapterResult,
} from '@/sanity/queries/storyChapters';

interface ProposalStackProps {
  chapter: StoryChapterResult;
}

/**
 * Scroll budget reserved for the caption reveal at the tail end of the
 * pinned travel. The first (1 - CAPTION_TAIL) fraction is split evenly
 * across photos for the accumulation; the last CAPTION_TAIL fades the
 * caption in over the fully-built stack.
 */
const CAPTION_TAIL = 0.2;

/**
 * How many extra viewport heights of scroll travel each photo costs.
 * Total outer container height = (0.5 * N + 0.8) * 100dvh — see Q13.
 */
const PER_PHOTO_VH = 0.5;
const TAIL_VH = 0.8;

/**
 * Hand-arranged final stack positions. Each photo lands at a unique
 * tilt + offset relative to the stack centre, with z-order picking
 * which ends up on top. Up to 5 photos supported; past that, the
 * cycle repeats with no harm (overlapping geometry just compounds).
 */
const STACK_SLOTS: ReadonlyArray<{
  rotate: number;
  offsetX: number; // px relative to centre
  offsetY: number;
  z: number;
}> = [
  { rotate: -6, offsetX: -14, offsetY: -10, z: 1 },
  { rotate: 5, offsetX: 12, offsetY: -4, z: 2 },
  { rotate: -3, offsetX: -4, offsetY: 6, z: 3 },
  { rotate: 7, offsetX: 10, offsetY: 14, z: 4 },
  { rotate: -2, offsetX: -10, offsetY: 18, z: 5 },
];

/**
 * Photos drop from above as the user scrolls. Pre-stack offset (in px)
 * is how far above the stack centre the photo starts. Larger feels
 * more dramatic; this value chosen to clear the page-card's inner top
 * edge so the entrance reads as "from off-page."
 */
const DROP_FROM_PX = 240;

/**
 * ProposalStack — Client Component
 *
 * Replaces the legacy scrapbook scatter with a scroll-pinned
 * accumulation: as the user scrolls into the proposal section, each
 * photo drops onto a centred stack one at a time, rotating into its
 * assigned slot tilt. After the last photo lands, the caption fades
 * in. Scrolling back up reverses the build symmetrically.
 *
 * Architecture:
 *   - Outer container is `(0.5N + 0.8) * 100dvh` tall, giving each
 *     photo a half-viewport of scroll travel plus a 0.8 viewport tail
 *     for the caption.
 *   - Inner `position: sticky; top: 0; h-dvh` pins the composition
 *     to the viewport while the outer container scrolls past.
 *   - A scroll listener on `#main-content` derives normalized
 *     progress (0..1) from the outer container's offset.
 *   - Each photo's transform interpolates from pre-stack drop to its
 *     final slot based on per-photo slot progress.
 *
 * Reduced-motion fallback: render all photos in their final stacked
 * positions, drop the sticky pin, collapse outer container to a
 * single viewport height. Same composition, no animation that built it.
 *
 * Photo treatment: thin warm-white matte (~10px) — a localised
 * deviation from Q7's bare-photo rule, justified because the stack
 * gesture only reads if each layer has a visible boundary against
 * the layers beneath it.
 */
export function ProposalStack({ chapter }: ProposalStackProps) {
  const { year, caption } = chapter;
  const photos = useMemo(() => pickGalleryImages(chapter), [chapter]);
  const N = photos.length;

  const outerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(1);
      return;
    }
    const outer = outerRef.current;
    const scroller = document.getElementById('main-content');
    if (!outer || !scroller) return;

    function update() {
      if (!outer || !scroller) return;
      const outerRect = outer.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      const offsetTop = outerRect.top - scrollerRect.top;
      const travel = outer.offsetHeight - scroller.clientHeight;
      if (travel <= 0) {
        setProgress(0);
        return;
      }
      const p = Math.min(1, Math.max(0, -offsetTop / travel));
      setProgress(p);
    }

    update();
    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      scroller.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [prefersReducedMotion]);

  const outerMinHeight = prefersReducedMotion
    ? '100dvh'
    : `${(PER_PHOTO_VH * N + TAIL_VH) * 100}dvh`;

  const accumulationEnd = 1 - CAPTION_TAIL;
  const captionOpacity =
    progress <= accumulationEnd
      ? 0
      : Math.min(1, (progress - accumulationEnd) / CAPTION_TAIL);

  return (
    <div ref={outerRef} style={{ minHeight: outerMinHeight }} className="relative w-full">
      <div className="sticky top-0 flex h-dvh w-full items-center justify-center">
        <PageCard bg="strawberry-milk">
          <h2 className="font-display italic font-normal text-display-lg text-text-on-light leading-display">
            {year}
          </h2>
          <p className="font-display italic font-normal text-display-md text-text-on-light/80 mt-1">
            The Proposal
          </p>

          <div className="relative my-(--gap-chapter-elements) flex min-h-0 flex-1 w-full items-center justify-center">
            <div className="relative aspect-4/5 w-full max-h-full">
              {photos.map((photo, i) => (
                <StackPhoto
                  key={photo.asset._id ?? `proposal-${i}`}
                  image={photo}
                  index={i}
                  total={N}
                  progress={progress}
                  year={year}
                />
              ))}
            </div>
          </div>

          <p
            className="font-body font-normal text-body-md text-text-on-light leading-relaxed max-w-sm whitespace-pre-line"
            style={{
              opacity: captionOpacity,
              transition: prefersReducedMotion ? 'none' : 'opacity 200ms linear',
            }}
          >
            {caption}
          </p>
        </PageCard>
      </div>
    </div>
  );
}

interface StackPhotoProps {
  image: StoryChapterImage;
  index: number;
  total: number;
  progress: number;
  year: number;
}

function StackPhoto({ image, index, total, progress, year }: StackPhotoProps) {
  const slot = STACK_SLOTS[index % STACK_SLOTS.length]!;

  // Each photo's slot occupies an equal share of the accumulation
  // window (everything before CAPTION_TAIL). slotProgress goes 0 → 1
  // as the user scrolls through this photo's slot.
  const accumulationEnd = 1 - CAPTION_TAIL;
  const slotStart = (index / total) * accumulationEnd;
  const slotEnd = ((index + 1) / total) * accumulationEnd;
  const slotProgress = Math.min(
    1,
    Math.max(0, (progress - slotStart) / (slotEnd - slotStart)),
  );

  // Interpolate from pre-stack drop position to final stacked slot.
  const dropY = (1 - slotProgress) * -DROP_FROM_PX;
  const rotate = slot.rotate * slotProgress;
  const tx = slot.offsetX * slotProgress;
  const ty = dropY + slot.offsetY * slotProgress;
  // Fade-in occupies the first ~30% of the slot so the photo is
  // already visible by the time it's finishing its rotation.
  const opacity = Math.min(1, slotProgress * 3.3);

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center',
        'pointer-events-none',
      )}
      style={{
        zIndex: slot.z,
        transform: `translate(${tx}px, ${ty}px) rotate(${rotate}deg)`,
        opacity,
        // No CSS transition — transform is driven directly by scroll
        // progress, so any transition would smear the response and
        // make the reverse-scroll feel rubbery.
      }}
      aria-hidden={opacity < 0.5}
    >
      <div
        className={cn(
          // Thin warm-white matte (Q9): photo print mounted on white
          // card so each stack layer's edge is legible against the
          // layers beneath.
          'relative aspect-4/5 w-full max-h-full bg-white p-2',
          'shadow-[0_10px_28px_-10px_rgba(0,0,0,0.35)]',
        )}
      >
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src={urlFor(image).width(640).url()}
            alt={image.alt || `The proposal, ${year}`}
            fill
            sizes="(max-width: 768px) 60vw, 22rem"
            loading="lazy"
            className="object-cover"
            placeholder={image.asset.metadata?.lqip ? 'blur' : undefined}
            blurDataURL={image.asset.metadata?.lqip}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Prefer the `images` gallery; fall back to the legacy single `image`
 * field if the migration hasn't been applied to the active dataset.
 * Caps at the slot-table length so geometry stays hand-tuned.
 */
function pickGalleryImages(chapter: StoryChapterResult): StoryChapterImage[] {
  if (chapter.images && chapter.images.length > 0) {
    return chapter.images.slice(0, STACK_SLOTS.length);
  }
  if (chapter.image) return [chapter.image];
  return [];
}
