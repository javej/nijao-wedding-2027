'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * Framer Motion variants defined OUTSIDE the component (architecture mandate).
 *
 * The panels are each 51% of the stage wide and animate `x` (a compositor
 * property) rather than `width`, so the sweep never triggers layout. At
 * `x: 0%` the pair meets in the middle with 2% of overlap — enough that the
 * seam reads as two cloths touching rather than a hairline gap. Retracted,
 * they slide out to leave ~9% of the stage veiled on each side, so the
 * proscenium never fully disappears.
 */
const RETRACTED_X = 82;
const SWEEP = { duration: 1.6, ease: [0.4, 0, 0.2, 1] as const };
const INSTANT = { duration: 0 };

const leftDrapeVariants = {
  drawn: { x: '0%', transition: SWEEP },
  retracted: { x: `-${RETRACTED_X}%`, transition: SWEEP },
};

const rightDrapeVariants = {
  drawn: { x: '0%', transition: SWEEP },
  retracted: { x: `${RETRACTED_X}%`, transition: SWEEP },
};

const leftDrapeReducedVariants = {
  drawn: { x: '0%', transition: INSTANT },
  retracted: { x: `-${RETRACTED_X}%`, transition: INSTANT },
};

const rightDrapeReducedVariants = {
  drawn: { x: '0%', transition: INSTANT },
  retracted: { x: `${RETRACTED_X}%`, transition: INSTANT },
};

/**
 * The overlay caption rides in only after the drapes have met, so the
 * text never appears to float over a moving cloth. Delay is tuned to
 * SWEEP.duration minus a small overlap.
 */
const captionVariants = {
  hidden: { opacity: 0, y: 10 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 1.3, ease: [0, 0, 0.2, 1] as const },
  },
};

const captionReducedVariants = {
  hidden: { opacity: 1, y: 0 },
  shown: { opacity: 1, y: 0 },
};

/**
 * Enter/exit ratios for the replay gate. A single threshold would flip
 * the drapes back and forth on scroll jitter, so the section has to be
 * mostly on screen to trigger and mostly gone to re-arm.
 */
const ENTER_RATIO = 0.6;
const EXIT_RATIO = 0.1;

interface CurtainDrapesProps {
  /**
   * `open` starts drawn and sweeps apart — the act beginning.
   * `close` starts retracted and sweeps shut — the act ending.
   */
  mode: 'open' | 'close';
  /**
   * Text to ride above the closed drapes. Only meaningful for `close`,
   * where the cloth becomes the surface the intermission card is printed on.
   */
  children?: React.ReactNode;
}

/**
 * CurtainDrapes — Client Component
 *
 * A velvet proscenium laid over a chapter section: a scalloped valance
 * pinned to the top and two drapes that sweep on scroll. Sized to the
 * whole section rather than the PageCard so that on landscape the page's
 * wings are part of the stage, which is what makes it read as a theatre
 * and not as a card with two red bars on it.
 *
 * Replays each time the section is scrolled back into view — a curtain
 * that only ever rises once is a screenshot, not an effect. Reduced-motion
 * users get the end state immediately, with no sweep and no caption delay.
 *
 * Must be rendered as a sibling AFTER the section's PageCard so it paints
 * above it, inside a `relative` parent (`ChapterSection` sets this).
 */
export function CurtainDrapes({ mode, children }: CurtainDrapesProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.intersectionRatio >= ENTER_RATIO) {
          setActive(true);
        } else if (entry.intersectionRatio < EXIT_RATIO) {
          setActive(false);
        }
      },
      { threshold: [EXIT_RATIO, ENTER_RATIO] },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // `open` ends retracted, `close` ends drawn. Before the section is on
  // screen each mode sits in the opposite state, ready to play.
  const drapeState = mode === 'open' ? (active ? 'retracted' : 'drawn') : active ? 'drawn' : 'retracted';

  const leftVariants = prefersReducedMotion ? leftDrapeReducedVariants : leftDrapeVariants;
  const rightVariants = prefersReducedMotion ? rightDrapeReducedVariants : rightDrapeVariants;

  return (
    <div ref={stageRef} className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <motion.div
        data-drape="left"
        aria-hidden="true"
        className={cn(
          'velvet-drape absolute inset-y-0 left-0 w-[51%]',
          // Crease on the inner edge so the leading edge of the cloth
          // catches shadow instead of ending on a flat vertical cut.
          'shadow-[10px_0_26px_-8px_rgba(0,0,0,0.55)]',
        )}
        variants={leftVariants}
        initial={false}
        animate={drapeState}
      />
      <motion.div
        data-drape="right"
        aria-hidden="true"
        className={cn(
          'velvet-drape absolute inset-y-0 right-0 w-[51%]',
          'shadow-[-10px_0_26px_-8px_rgba(0,0,0,0.55)]',
        )}
        variants={rightVariants}
        initial={false}
        animate={drapeState}
      />

      {/* Valance — pinned, never sweeps. It's the pelmet the drapes hang
          from, and it's what stops the retracted state from reading as two
          stray bars at the edges. */}
      <div
        data-drape="valance"
        aria-hidden="true"
        className="velvet-valance absolute inset-x-0 top-0 h-[9%] min-h-14"
      />

      {children ? (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-(--chapter-padding-x) text-center"
          variants={prefersReducedMotion ? captionReducedVariants : captionVariants}
          initial={false}
          animate={active ? 'shown' : 'hidden'}
        >
          {children}
        </motion.div>
      ) : null}
    </div>
  );
}
