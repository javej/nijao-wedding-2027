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
 * via className. The component just stacks photos at inset-0.
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
        'relative overflow-hidden',
        // Soft drop shadow lifts the photo off the page so it reads
        // as a print pinned to the page, not painted on (Q7 — bare
        // photo + shadow, no matte on year chapters).
        'shadow-[0_8px_24px_-8px_rgba(0,0,0,0.25)]',
        className,
      )}
    >
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
  );
}
