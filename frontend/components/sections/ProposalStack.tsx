'use client';

import Image from 'next/image';
import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import { urlFor } from '@/sanity/lib/image';
import { PageCard } from '@/components/ui/PageCard';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import {
  computeCaptionOpacity,
  computePhotoStyle,
  STACK_SLOTS,
} from '@/components/sections/proposal-stack-geometry';
import { cn } from '@/lib/utils';
import type {
  StoryChapterImage,
  StoryChapterResult,
} from '@/sanity/queries/storyChapters';

interface ProposalStackProps {
  chapter: StoryChapterResult;
}

/**
 * Pixel travel per photo. Larger value = taller outer container =
 * more scroll input required to progress one photo's animation =
 * slower perceived animation at the same scroll velocity.
 *
 * Total outer container height = `(N * PER_PHOTO_VH + TAIL_VH) * 100dvh`.
 * TAIL_VH covers caption fade + minimum post-stack dwell. See Q13.
 *
 * Per-photo / caption geometry lives in proposal-stack-geometry.ts.
 */
const PER_PHOTO_VH = 0.9;
const TAIL_VH = 0.8;

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
