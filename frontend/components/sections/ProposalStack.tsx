'use client';

import Image from 'next/image';
import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import { urlFor } from '@/sanity/lib/image';
import { PageCard } from '@/components/ui/PageCard';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
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
 * pinned travel. The accumulation phase ends at (1 - CAPTION_TAIL);
 * the last CAPTION_TAIL fades the caption in over the fully-built stack.
 */
const CAPTION_TAIL = 0.2;

/**
 * Max fraction of total scroll progress dedicated to ONE photo's drop
 * animation. With few photos this prevents the slot from stretching
 * across most of the scroll (which made the first photo feel "stuck
 * mid-flight" instead of landing). With many photos the slot shortens
 * proportionally so all drops still fit within the accumulation phase.
 */
const MAX_SLOT_FRACTION = 0.25;

/**
 * Pixel travel per photo. Larger value = taller outer container =
 * more scroll input required to progress one photo's animation =
 * slower perceived animation at the same scroll velocity.
 *
 * Total outer container height = `(N * PER_PHOTO_VH + TAIL_VH) * 100dvh`.
 * TAIL_VH covers caption fade + minimum post-stack dwell. See Q13.
 */
const PER_PHOTO_VH = 0.9;
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
 * Photos rise from below the stack as the user scrolls. Pre-stack
 * offset (in px) is how far BELOW the stack centre the photo starts.
 * Positive value = enters from below, matching the scroll direction —
 * as the user scrolls downward, photos emerge from the bottom of the
 * viewport into their landed slot positions. Larger value feels more
 * dramatic; this value chosen to clear the page-card's inner bottom
 * edge so the entrance reads as "from off-page."
 */
const RISE_FROM_PX = 240;

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

  const prefersReducedMotion = usePrefersReducedMotion();

  const outerRef = useRef<HTMLDivElement>(null);
  // Photo + caption nodes are driven imperatively from the scroll handler so a
  // scroll frame writes transforms directly to the DOM instead of triggering a
  // React re-render of every StackPhoto. This is the hot path on mobile.
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRef = useRef<HTMLParagraphElement>(null);

  const applyProgress = useCallback(
    (p: number) => {
      for (let i = 0; i < photoRefs.current.length; i++) {
        const el = photoRefs.current[i];
        if (!el) continue;
        const { transform, opacity, zIndex } = computePhotoStyle(i, N, p);
        el.style.transform = transform;
        el.style.opacity = String(opacity);
        el.style.zIndex = String(zIndex);
        el.setAttribute('aria-hidden', opacity < 0.5 ? 'true' : 'false');
      }
      const cap = captionRef.current;
      if (cap) cap.style.opacity = String(computeCaptionOpacity(p));
    },
    [N],
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      applyProgress(1);
      return;
    }
    const outer = outerRef.current;
    const scroller = document.getElementById('main-content');
    if (!outer || !scroller) return;

    // Cache the layout reads that only change on resize; the per-frame work is
    // then a single getBoundingClientRect (outer.top) plus arithmetic.
    let travel = 0;
    let scrollerTop = 0;
    let rafId: number | null = null;

    function measure() {
      travel = outer!.offsetHeight - scroller!.clientHeight;
      scrollerTop = scroller!.getBoundingClientRect().top;
    }

    function compute() {
      rafId = null;
      if (travel <= 0) {
        applyProgress(0);
        return;
      }
      const offsetTop = outer!.getBoundingClientRect().top - scrollerTop;
      const p = Math.min(1, Math.max(0, -offsetTop / travel));
      applyProgress(p);
    }

    // Coalesce bursts of scroll events into one update per animation frame.
    function onScroll() {
      if (rafId === null) rafId = requestAnimationFrame(compute);
    }
    function onResize() {
      measure();
      onScroll();
    }

    measure();
    compute();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [prefersReducedMotion, applyProgress]);

  const outerMinHeight = prefersReducedMotion
    ? '100dvh'
    : `${(PER_PHOTO_VH * N + TAIL_VH) * 100}dvh`;

  return (
    <div ref={outerRef} style={{ minHeight: outerMinHeight }} className="relative w-full">
      <div className="sticky top-0 flex h-dvh w-full items-center justify-center">
        <PageCard bg="strawberry-milk">
          <div
            className="flex flex-col items-center px-5 py-2 rounded-md backdrop-blur-sm"
            style={{ backgroundColor: 'var(--text-backdrop)' }}
          >
            <h2 className="font-display italic font-normal text-display-lg text-text-on-light leading-display">
              {year}
            </h2>
            <p className="font-display italic font-normal text-display-md text-text-on-light/80 mt-1">
              The Proposal
            </p>
          </div>

          <div className="relative my-(--gap-chapter-elements) flex w-full items-center justify-center">
            <div className="relative aspect-4/5 w-full">
              {photos.map((photo, i) => (
                <StackPhoto
                  // Index is part of the key — the same Sanity asset can
                  // legitimately appear in the gallery more than once
                  // (e.g., before a fresh upload during content editing),
                  // so the asset _id alone is not guaranteed unique.
                  key={`${photo.asset._id ?? 'proposal'}-${i}`}
                  ref={(el) => {
                    photoRefs.current[i] = el;
                  }}
                  image={photo}
                  index={i}
                  total={N}
                  year={year}
                />
              ))}
            </div>
          </div>

          <p
            ref={captionRef}
            className="font-body font-normal text-body-md text-text-on-light leading-relaxed max-w-sm whitespace-pre-line px-5 py-2 rounded-md backdrop-blur-sm"
            style={{
              opacity: 0,
              transition: prefersReducedMotion ? 'none' : 'opacity 200ms linear',
              backgroundColor: 'var(--text-backdrop)',
            }}
          >
            {caption}
          </p>
        </PageCard>
      </div>
    </div>
  );
}

/**
 * Pure geometry for one photo at a given scroll progress (0..1). Shared by the
 * initial render (p=0) and the imperative scroll updates so both stay in sync.
 *
 * Each photo's drop slot is the SMALLER of MAX_SLOT_FRACTION and an even share
 * of the accumulation phase. With few photos this caps the slot length so the
 * photo lands quickly and then dwells, rather than stretching its drop across
 * most of the scroll. With many photos the slot shrinks proportionally so every
 * photo still fits before the caption-tail fade-in begins.
 */
function computePhotoStyle(
  index: number,
  total: number,
  progress: number,
): { transform: string; opacity: number; zIndex: number } {
  const slot = STACK_SLOTS[index % STACK_SLOTS.length]!;

  const accumulationEnd = 1 - CAPTION_TAIL;
  const evenShare = accumulationEnd / total;
  const slotFraction = Math.min(MAX_SLOT_FRACTION, evenShare);
  const slotStart = index * slotFraction;
  const slotEnd = slotStart + slotFraction;
  const slotProgress = Math.min(
    1,
    Math.max(0, (progress - slotStart) / (slotEnd - slotStart)),
  );

  // Interpolate from pre-stack position (below the stack) to final stacked
  // slot. `riseY` starts positive (below centre) and decays toward 0 as
  // slotProgress → 1, so the photo rises into place.
  const riseY = (1 - slotProgress) * RISE_FROM_PX;
  const rotate = slot.rotate * slotProgress;
  const tx = slot.offsetX * slotProgress;
  const ty = riseY + slot.offsetY * slotProgress;
  // Fade-in occupies the first ~30% of the slot so the photo is already
  // visible by the time it's finishing its rotation.
  const opacity = Math.min(1, slotProgress * 3.3);

  return {
    transform: `translate(${tx}px, ${ty}px) rotate(${rotate}deg)`,
    opacity,
    zIndex: slot.z,
  };
}

function computeCaptionOpacity(progress: number): number {
  const accumulationEnd = 1 - CAPTION_TAIL;
  return progress <= accumulationEnd
    ? 0
    : Math.min(1, (progress - accumulationEnd) / CAPTION_TAIL);
}

interface StackPhotoProps {
  image: StoryChapterImage;
  index: number;
  total: number;
  year: number;
}

const StackPhoto = forwardRef<HTMLDivElement, StackPhotoProps>(function StackPhoto(
  { image, index, total, year },
  ref,
) {
  // Initial paint at progress 0; the parent's scroll handler drives every
  // subsequent transform/opacity update imperatively via this ref.
  const initial = computePhotoStyle(index, total, 0);

  return (
    <div
      ref={ref}
      className={cn(
        'absolute inset-0 flex items-center justify-center',
        'pointer-events-none',
      )}
      style={{
        zIndex: initial.zIndex,
        transform: initial.transform,
        opacity: initial.opacity,
        // No CSS transition — transform is driven directly by scroll
        // progress, so any transition would smear the response and
        // make the reverse-scroll feel rubbery.
      }}
      aria-hidden={initial.opacity < 0.5}
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
});

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
