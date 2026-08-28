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
}

/**
 * Duration each photo holds the spotlight, including the fade-in
 * overlap. With 4500ms total and FADE_MS = 1200ms, each photo is
 * fully opaque for ~3300ms before the next begins crossfading in.
 */
const SLOT_MS = 4500;
const FADE_MS = 1200;

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
}: ChapterPhotoCrossfadeProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry) isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || photos.length <= 1) return;
    const id = window.setInterval(() => {
      if (isVisibleRef.current) {
        setActiveIndex((i) => (i + 1) % photos.length);
      }
    }, SLOT_MS);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion, photos.length]);

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
                // resets the rule, so re-entry replays from scale(1.0).
                style={{
                  animation:
                    isActive && !prefersReducedMotion
                      ? 'var(--animate-ken-burns)'
                      : 'none',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
