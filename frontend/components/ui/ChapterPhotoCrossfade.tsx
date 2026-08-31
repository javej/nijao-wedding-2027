'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';

export interface CrossfadePhoto {
  src: string;
  alt: string;
  blurDataURL?: string;
}

interface ChapterPhotoCrossfadeProps {
  photos: CrossfadePhoto[];
  /**
   * Tailwind className for the wrapper — set aspect + size from the
   * parent. The component itself is size-agnostic.
   */
  className?: string;
  /**
   * Eager-load the first photo. Set true for the chapter most likely
   * to be the initial LCP candidate (e.g., the first story year if
   * Hero sits above the fold elsewhere). Default false.
   */
  priorityFirst?: boolean;
  /**
   * Stable per-chapter number (the chapter's year) used to pick this
   * chapter's Ken Burns treatment. Deterministic on purpose — a random
   * pick would differ between the server and client renders and trip
   * hydration, and would also change every reload, so a guest scrolling
   * back would find a different motion than the one they just saw.
   */
  seed?: number;
}

/**
 * Duration each photo holds the spotlight, including the fade-in
 * overlap. With 4500ms total and FADE_MS = 1200ms, each photo is
 * fully opaque for ~3300ms before the next begins crossfading in.
 */
const SLOT_MS = 4500;
const FADE_MS = 1200;

/**
 * How much of the wrapper must be on screen for this chapter to count as
 * "open". Above half means only ONE chapter can be open at a time, so
 * entering a chapter is an unambiguous event — which is what lets the
 * cycle restart cleanly (see the reset effect below). The previous 0.3
 * could hold two chapters open at once mid-scroll.
 */
const OPEN_RATIO = 0.55;

/**
 * Ken Burns treatments, cycled per chapter and per photo within a chapter.
 *
 * Every chapter used to run the identical move — `scale(1 → 1.06)` from
 * dead centre — so twelve chapters of the album drifted in exactly the same
 * direction for exactly the same duration. Varying the origin and the
 * direction costs nothing and stops the set reading as machine-generated.
 *
 * `push` zooms in, `pull` starts wide and settles back; the origin decides
 * which way the frame drifts while it does. Origins stay within ~20% of
 * centre because the scale is only 1.06 — pushing further would crop a
 * face at the frame edge.
 */
const KEN_BURNS_MOVES: ReadonlyArray<{ direction: 'push' | 'pull'; origin: string }> = [
  { direction: 'push', origin: '50% 50%' },
  { direction: 'pull', origin: '32% 34%' },
  { direction: 'push', origin: '68% 38%' },
  { direction: 'pull', origin: '38% 66%' },
  { direction: 'push', origin: '64% 64%' },
  { direction: 'pull', origin: '50% 30%' },
  { direction: 'push', origin: '34% 52%' },
];

/**
 * Coprime with the move count, so consecutive years jump across the table
 * (0 → 5 → 3 → 1 → …) instead of stepping through it in order.
 *
 * Walking the table one step at a time — which is what a plain
 * `seed + photoIndex` does, since the seeds are consecutive years — made
 * push and pull alternate perfectly down the album. Trading one machine-like
 * pattern (every chapter identical) for another (every chapter the opposite
 * of its neighbour) wasn't the point. A 7-entry table with a stride of 5
 * visits all seven before repeating, and the twelve chapters never land on
 * two neighbours that share a move.
 */
const MOVE_STRIDE = 5;

function kenBurnsMove(seed: number, photoIndex: number) {
  // `+ photoIndex` so a chapter with several photos varies within itself
  // too, rather than replaying one move N times.
  const i = Math.abs(seed * MOVE_STRIDE + photoIndex) % KEN_BURNS_MOVES.length;
  const move = KEN_BURNS_MOVES[i]!;
  return {
    animation:
      move.direction === 'push' ? 'var(--animate-ken-burns)' : 'var(--animate-ken-burns-out)',
    transformOrigin: move.origin,
  };
}

/**
 * ChapterPhotoCrossfade — Client Component
 *
 * Renders 1–N photos stacked at the same position with auto-cycle
 * crossfade and Ken Burns zoom on the active photo. No UI chrome —
 * no dots, no arrows, no progress indicator. The cycle paces itself
 * silently while the section is on screen.
 *
 * Pauses when the wrapper leaves the viewport (IntersectionObserver
 * with 30% threshold). Reduced-motion users see only the first
 * photo, no zoom, no fade.
 *
 * Sizing is the parent's job — pass `aspect-[4/5]`, a width, etc.
 * via className. The component stacks the photos inside a thin
 * warm-white matte (the album's polaroid treatment, shared with
 * ProposalStack), which sits inside the box the parent sizes — so
 * adding it never changes the photo band's footprint.
 */
export function ChapterPhotoCrossfade({
  photos,
  className,
  priorityFirst = false,
  seed = 0,
}: ChapterPhotoCrossfadeProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsOpen(entry.intersectionRatio >= OPEN_RATIO);
      },
      { threshold: [0, OPEN_RATIO, 1] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Restart the cycle every time the chapter is opened, rather than
  // letting index and timer phase persist across visits.
  //
  // Previously both survived: the interval kept its phase while the
  // chapter was off screen (it only skipped *advancing*), so arriving
  // could trigger a swap a fraction of a second later, and scrolling back
  // to a chapter showed whichever photo you happened to leave it on. An
  // album page should always open on the photo the couple put first, then
  // give it a full slot before moving.
  useEffect(() => {
    if (!isOpen) return;

    setActiveIndex(0);
    if (prefersReducedMotion || photos.length <= 1) return;

    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % photos.length);
    }, SLOT_MS);
    return () => window.clearInterval(id);
  }, [isOpen, prefersReducedMotion, photos.length]);

  if (photos.length === 0) return null;

  return (
    <div
      ref={wrapperRef}
      className={cn(
        // Thin warm-white matte — the same polaroid treatment the
        // proposal stack uses, now shared by every chapter so the album
        // reads as one set of prints. This supersedes the original
        // bare-photo rule (Q7), which kept the matte exclusive to the
        // proposal. The matte is INSIDE the sized box the parent passes
        // in, so the photo band's footprint is unchanged and the caption
        // fit below it still holds (ADR-0007).
        'relative bg-white p-2',
        // Soft drop shadow lifts the print off the page so it reads as
        // pinned to the page, not painted on.
        'shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)]',
        className,
      )}
    >
      {/* The window. `overflow-hidden` lives here, not on the matte, so
          the Ken Burns zoom is clipped by the photo's edge and never
          bleeds over the white border. */}
      <div className="relative h-full w-full overflow-hidden">
        {photos.map((photo, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={photo.src}
              className="absolute inset-0"
              style={{
                opacity: isActive ? 1 : 0,
                transition: `opacity ${FADE_MS}ms ease-in-out`,
              }}
              aria-hidden={!isActive}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 70vw, 26rem"
                loading={i === 0 && priorityFirst ? 'eager' : 'lazy'}
                priority={i === 0 && priorityFirst}
                placeholder={photo.blurDataURL ? 'blur' : undefined}
                blurDataURL={photo.blurDataURL}
                className="object-cover"
                // Ken Burns plays once per slot (5s) when this photo is
                // active. Setting animation back to 'none' when inactive
                // resets the rule, so re-entry replays from the start.
                // Origin and direction come from the chapter's seed, so
                // each chapter drifts its own way (see KEN_BURNS_MOVES).
                style={
                  isActive && !prefersReducedMotion
                    ? kenBurnsMove(seed, i)
                    : { animation: 'none' }
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
