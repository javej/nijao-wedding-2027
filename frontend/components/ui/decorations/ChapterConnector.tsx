import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * The connector variants in active rotation. Variant 4 (lace cord with bead
 * tassel) was generated but excluded — chartreuse green didn't sit inside
 * the matcha palette, and the bead tips read disconnected from the rest of
 * the decoration system. Regen and re-add if needed.
 */
export const CONNECTOR_VARIANTS = [1, 2, 3, 5] as const;
export type ConnectorVariant = (typeof CONNECTOR_VARIANTS)[number];

/**
 * Rotation pattern for connectors across the story chapters. Weighted so
 * the lightest variant (#2 matcha vine) appears most often, the saturated
 * pink one (#3) only appears in a single slot, and identical variants are
 * never adjacent.
 *
 * Indexed by `chapterIndex - 1` (the first chapter has no connector above
 * it — nothing came before to tie it to). Cycles modulo length for
 * chapter lists longer than the explicit sequence.
 */
const ROTATION: ReadonlyArray<ConnectorVariant> = [2, 1, 5, 2, 1, 3, 2, 5, 1];

/**
 * Pick the connector variant for a given chapter index (0-based). Returns
 * `null` for index 0 — the first chapter has nothing to be tied to.
 */
export function connectorVariantForChapter(chapterIndex: number): ConnectorVariant | null {
  if (chapterIndex <= 0) return null;
  return ROTATION[(chapterIndex - 1) % ROTATION.length];
}

interface ChapterConnectorProps {
  variant: ConnectorVariant;
  /**
   * Deterministic offset (in seconds) for the sway animation, so adjacent
   * chapters don't pendulum in lockstep. Pass the chapter index — the
   * component derives a stable per-chapter phase from it.
   */
  swayOffset?: number;
  className?: string;
}

/**
 * ChapterConnector — a watercolor cord, vine, or ribbon anchored to the
 * top edge of a story chapter. The tie/knot at the top of the PNG lands
 * at the chapter ceiling; the charm at the bottom dangles toward the
 * year heading, and a thin watercolor-toned continuation thread fades
 * from the charm down toward the year so the visual flow closes the
 * remaining gap without redrawing the PNG.
 *
 * Sway: a 6s ease-in-out pendulum (±1.5°) pivoting from the top of the
 * cord so the charm + thread drift a few pixels each way as one unit.
 * Each chapter offsets the animation start so adjacent connectors don't
 * sway in lockstep. Disabled automatically via the global
 * `prefers-reduced-motion` reset in globals.css.
 *
 * Source PNGs are ~1024px tall with transparent background. next/image
 * handles WebP conversion + responsive sizing at request time, matching
 * the existing SectionDivider convention.
 */
export function ChapterConnector({ variant, swayOffset = 0, className }: ChapterConnectorProps) {
  // Stagger sway across chapters: each chapter offsets the animation by
  // ~0.7s × index, so the cycle is fully desynced after a few chapters
  // without ever lining up identically again.
  const animationDelay = `${-((swayOffset * 0.7) % 6)}s`;

  return (
    <div
      aria-hidden="true"
      style={{
        transformOrigin: 'top center',
        animation: 'var(--animate-connector-sway)',
        animationDelay,
      }}
      className={cn(
        // Anchored to the top of the section, centered horizontally. The
        // tie/knot painted at the top of each PNG lands at the section's
        // top edge, so the cord reads as actually tied to the chapter
        // ceiling, not floating mid-air.
        'pointer-events-none absolute top-0 left-1/2 z-10 -translate-x-1/2',
        // Flex column lets the continuation thread sit directly under the
        // cord PNG without absolute math, and both transform together
        // under the sway animation above.
        'flex flex-col items-center',
        'opacity-90',
        className,
      )}
    >
      <Image
        src={`/decorations/connector-${variant}.png`}
        alt=""
        width={400}
        height={600}
        sizes="(max-width: 768px) 144px, 176px"
        className="w-36 md:w-44"
      />
      {/* Continuation thread — a thin watercolor-toned line that fades from
          the charm down toward the year heading, closing the remaining
          gap without redrawing the PNG. The faint sage gradient eases
          into transparency so it dissolves into the section background
          rather than terminating with a hard edge. */}
      <div className="h-24 w-px bg-linear-to-b from-deep-matcha/35 to-transparent md:h-32" />
    </div>
  );
}
