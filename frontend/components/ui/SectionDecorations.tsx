import { CallaLily } from '@/components/ui/decorations/CallaLily';
import { CatStrawberry } from '@/components/ui/decorations/CatStrawberry';
import { SectionDivider } from '@/components/ui/decorations/SectionDivider';
import { SiameseMatcha } from '@/components/ui/decorations/SiameseMatcha';

/**
 * SectionDecorations — three-band ornamental layer for decorated sections.
 *
 * Layout (both mobile and tablet+):
 *
 *   ┌──────────────────────────────────────┐
 *   │ [siamese-matcha]    [cat-strawberry] │   TOP: whimsical mascot pair
 *   │                                      │
 *   │  [calla]    Content       [calla]    │   MIDDLE: callas flank content,
 *   │                                          tilted inward (wrapping)
 *   │                                      │
 *   │           ── divider ──              │   BOTTOM: watercolor flourish
 *   └──────────────────────────────────────┘
 *
 * Variants flip the mascot pair so each section feels distinct:
 *   - Cream: siamese-matcha TL, cat-strawberry TR
 *   - Sage:  cat-strawberry TL, siamese-matcha TR
 *
 * Why mascots TOP and callas MIDDLE? The mascots have character (cat
 * faces, food pairings) — they read as "guests welcoming you" at the
 * top of each chapter. The callas are formal and floral — they read
 * as "framing" the content. Reversed would feel top-heavy with formal
 * decoration and bury the mascots' personality.
 *
 * Why callas peek out from BEHIND the content on mobile? The mobile
 * photo (`w-72` = 288px) on a 375px viewport leaves only ~43px side
 * strips. A full calla doesn't fit there, but a small calla at `w-12`
 * positioned `left-2` peeks out from behind the photo edge — reads as
 * the photo being held by floral arrangements. Tablet+ has real side
 * strips so the calla can stand alone.
 *
 * Why both callas use variant 1? Until calla-lily-2.png is regenerated
 * at a matching scale, mixing the two reads as asymmetric size, not
 * intentional alternation. Single-variant for now.
 *
 * Bottom corners are intentionally empty — the cat already appears in
 * both mascots at the top, so repeating it at the bottom (the previous
 * design) would feel redundant. The divider handles the bottom band.
 *
 * Tune in one place: `cornerWidth` for mascots, `middleWidth` for
 * callas, divider classes inline below.
 *
 * All elements are pointer-events-none and aria-hidden — purely decorative.
 */

type SectionDecorationsProps = {
  /**
   * Hero layout uses much larger middle callas (no photo competing
   * for the side strips, lots of empty vertical space to fill).
   * Chapter layout (the default) uses small middle callas that peek
   * out from behind the photo edges on mobile.
   */
  hero?: boolean;
};

const cornerWidth = 'w-24 md:w-36';
const chapterMiddleWidth = 'w-12 md:w-24';
const heroMiddleWidth = 'w-24 md:w-40';
const baseOpacity = 'opacity-70';

export function SectionDecorations({ hero = false }: SectionDecorationsProps) {
  const middleWidth = hero ? heroMiddleWidth : chapterMiddleWidth;
  // Hero only: left calla sits slightly above the vertical center for a
  // hand-arranged asymmetric look. Chapter sections keep both callas
  // centered so the photo (the focal point) stays visually balanced.
  const middleLeftTop = hero ? 'top-[40%]' : 'top-1/2';
  // Hero has a big empty bottom band so the divider sits higher to feel
  // "centered" between content and bottom edge. Chapter sections have a
  // dense photo + caption stack that fills most of the section, so the
  // divider hugs the bottom edge to clear the caption.
  const dividerBottom = hero ? 'bottom-32 md:bottom-40' : 'bottom-6 md:bottom-8';
  return (
    <>
      {/* ── Cream variant (odd sections: Hero, every other story chapter) ── */}
      <div
        className="section-decor-cream pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <SiameseMatcha
          className={`absolute top-10 left-10 rotate-6 md:top-16 md:left-16 ${cornerWidth} ${baseOpacity}`}
        />
        <CatStrawberry
          className={`absolute top-10 right-10 -rotate-6 md:top-16 md:right-16 ${cornerWidth} ${baseOpacity}`}
        />
        <CallaLily
          className={`absolute left-2 -translate-y-1/2 rotate-12 md:left-8 ${middleLeftTop} ${middleWidth} ${baseOpacity}`}
        />
        <CallaLily
          className={`absolute top-1/2 right-2 -translate-y-1/2 -rotate-12 md:right-8 ${middleWidth} ${baseOpacity}`}
        />
      </div>

      {/* ── Sage variant (even sections: alternating story chapters) ── */}
      <div
        className="section-decor-sage pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <CatStrawberry
          className={`absolute top-10 left-10 rotate-6 md:top-16 md:left-16 ${cornerWidth} ${baseOpacity}`}
        />
        <SiameseMatcha
          className={`absolute top-10 right-10 -rotate-6 md:top-16 md:right-16 ${cornerWidth} ${baseOpacity}`}
        />
        <CallaLily
          className={`absolute left-2 -translate-y-1/2 rotate-12 md:left-8 ${middleLeftTop} ${middleWidth} ${baseOpacity}`}
        />
        <CallaLily
          className={`absolute top-1/2 right-2 -translate-y-1/2 -rotate-12 md:right-8 ${middleWidth} ${baseOpacity}`}
        />
      </div>

      {/* ── Shared divider — same on both variants, sits above the FAB zone, lifted off the bottom edge so it reads connected to the content above ── */}
      {/* Slight rightward nudge compensates for the 4px left palette
          border on ChapterSection plus any off-center painting inside
          the divider PNG canvas. Vertical position is hero-aware
          (see `dividerBottom` above). */}
      <SectionDivider
        className={`pointer-events-none absolute right-0 left-0 mx-auto w-3/4 max-w-sm translate-x-2 md:max-w-lg ${dividerBottom}`}
      />
    </>
  );
}
