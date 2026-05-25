import { CallaLily } from '@/components/ui/decorations/CallaLily';
// import { CatStrawberry } from '@/components/ui/decorations/CatStrawberry';
// import { SectionDivider } from '@/components/ui/decorations/SectionDivider';
// import { SiameseMatcha } from '@/components/ui/decorations/SiameseMatcha';

/**
 * SectionDecorations — ornamental layer for decorated sections.
 *
 * Two compositions, switched by `hero` prop:
 *
 * ── Chapter (default) — small flanking callas ──
 *   ┌──────────────────────────────────────┐
 *   │                                      │
 *   │  [calla]   [photo]        [calla]    │   callas peek out from
 *   │            content                       behind the photo edges,
 *   │                                          gentle inward lean
 *   └──────────────────────────────────────┘
 *
 * ── Hero (when hero=true) — dramatic corner-anchor diagonal ──
 *   ┌──────────────────────────────────────┐
 *   │🌸                                    │   TL: stem trails off-corner,
 *   │ 🌸                                       bud aims at headline
 *   │                                      │
 *   │         Ten years.                   │
 *   │         One more day.                │   text remains focal
 *   │                                      │
 *   │                                 🌸   │   BR: mirrored + asymmetric
 *   │                                  🌸  │       tilt, stem off-corner
 *   └──────────────────────────────────────┘
 *
 * Why corner anchors on the hero? The hero has no photo to compete for
 * visual mass and a lot of empty space the chapter layouts don't have.
 * Big TL+BR callas bleeding off-corner (~28% off-edge desktop, ~45%
 * mobile) read as "the page is set inside a floral arrangement" without
 * crowding the centered headline — the diagonal counter-space puts the
 * text squarely in the negative-space sweet spot. Opacity drops to 0.50
 * (vs 0.70 elsewhere) because the ~9× pixel-area scale would otherwise
 * outweigh the headline.
 *
 * Stem-out anatomy: both clusters point their *buds* (focal point) at
 * the headline and trail *stems/leaves* off the corner. Clipping stems
 * looks like a natural arrangement spilling off the frame; clipping
 * buds would destroy the calla silhouette.
 *
 * Why mirror + asymmetric tilt on BR? Using variant 2 on both corners
 * keeps the line-art style coherent — mixing in variant 1 (saturated
 * watercolor) would read as two illustrators on one page. To avoid a
 * machine-perfect mirror, the BR cluster gets a horizontal flip
 * (scaleX -1) AND a different rotation magnitude (50° vs 140°), so the
 * two clusters read as hand-arranged rather than computed.
 *
 * Why callas peek out from BEHIND the photo on chapter mobile? The
 * mobile photo (`w-72` = 288px) on a 375px viewport leaves only ~43px
 * side strips. A full calla doesn't fit there, but a small calla at
 * `w-12` positioned `left-2` peeks out from behind the photo edge —
 * reads as the photo being held by floral arrangements. Tablet+ has
 * real side strips so the calla can stand alone.
 *
 * Bottom corners on chapter sections are intentionally empty — clean.
 * Hero's BR anchor sits behind the compass FAB at lower z-index; the
 * overlap is accepted (FAB is small + circular, easy to absorb).
 *
 * Tune in one place: `chapterMiddleWidth`, `heroAnchorTL`, `heroAnchorBR`,
 * `baseOpacity`, `heroOpacity` — all at the top of the file.
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

// const cornerWidth = 'w-24 md:w-36';
const chapterMiddleWidth = 'w-12 md:w-24';
const baseOpacity = 'opacity-70';
const heroOpacity = 'opacity-50';

// Hero corner-anchor classes — two dramatic callas anchored at TL and BR,
// stems trailing off-corner, buds aimed at the centered headline. The
// translate budget pulls ~28% of the cluster off-edge on desktop and ~45%
// on mobile, so the on-canvas footprint stays similar across breakpoints
// while the cluster *feels* larger on small screens (eye fills in the
// off-bezel continuation). Asymmetric rotation magnitudes (140° vs 50°)
// keep the pair from reading as a machine-perfect mirror. scaleX(-1) on
// the BR calla flips the silhouette horizontally so it doesn't repeat
// the TL silhouette outright. Pure CSS — no asset variants needed.
const heroAnchorTL =
  'absolute top-0 left-0 w-72 md:w-[32rem] ' +
  '-translate-x-[45%] -translate-y-[45%] md:-translate-x-[28%] md:-translate-y-[28%] ' +
  'rotate-[140deg]';
const heroAnchorBR =
  'absolute bottom-0 right-0 w-72 md:w-[32rem] ' +
  'translate-x-[45%] translate-y-[45%] md:translate-x-[28%] md:translate-y-[28%] ' +
  '-rotate-[50deg] scale-x-[-1]';

export function SectionDecorations({ hero = false }: SectionDecorationsProps) {
  // Two compositions:
  //  - Hero: corner-anchored diagonal pair (TL→BR), bleeding off the
  //    outer corners, stem-out, asymmetric rotation. Big and dramatic
  //    by intent — the hero has no photo to compete for visual mass,
  //    so the florals carry the page weight while staying below the
  //    headline in luminance hierarchy (opacity-50 vs 0.7 elsewhere).
  //  - Chapter: small flanking callas at vertical mid-line on both
  //    sides, gentle inward lean. Designed to peek out from behind
  //    the chapter photo on mobile and frame it on tablet+.
  const callas = hero ? (
    <>
      {/* TL anchor: stem trails up-left off corner; bud points toward headline (lower-right) */}
      <CallaLily className={`${heroAnchorTL} ${heroOpacity}`} variant={2} />
      {/* BR anchor: stem trails down-right off corner; bud points toward headline (upper-left). Horizontal flip + asymmetric tilt break exact mirror symmetry. */}
      <CallaLily className={`${heroAnchorBR} ${heroOpacity}`} variant={2} />
    </>
  ) : (
    <>
      <CallaLily
        className={`absolute left-2 top-1/2 -translate-y-1/2 rotate-12 md:left-8 ${chapterMiddleWidth} ${baseOpacity}`}
        variant={2}
      />
      <CallaLily
        className={`absolute top-1/2 right-2 -translate-y-1/2 -rotate-12 md:right-8 ${chapterMiddleWidth} ${baseOpacity}`}
        variant={2}
      />
    </>
  );

  return (
    <>
      {/* ── Cream variant (odd sections: Hero, every other story chapter) ── */}
      <div
        className="section-decor-cream pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* <SiameseMatcha
          className={`absolute top-10 left-10 rotate-6 md:top-16 md:left-16 ${cornerWidth} ${baseOpacity}`}
        />
        <CatStrawberry
          className={`absolute top-10 right-10 -rotate-6 md:top-16 md:right-16 ${cornerWidth} ${baseOpacity}`}
        /> */}
        {callas}
      </div>

      {/* ── Sage variant (even sections: alternating story chapters) ── */}
      <div
        className="section-decor-sage pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* <CatStrawberry
          className={`absolute top-10 left-10 rotate-6 md:top-16 md:left-16 ${cornerWidth} ${baseOpacity}`}
        />
        <SiameseMatcha
          className={`absolute top-10 right-10 -rotate-6 md:top-16 md:right-16 ${cornerWidth} ${baseOpacity}`}
        /> */}
        {callas}
      </div>

      {/* ── Shared divider — same on both variants, sits above the FAB zone, lifted off the bottom edge so it reads connected to the content above ── */}
      {/* Slight rightward nudge compensates for the 4px left palette
          border on ChapterSection plus any off-center painting inside
          the divider PNG canvas. Vertical position is hero-aware
          (see `dividerBottom` above). */}
      {/* <SectionDivider
        className={`pointer-events-none absolute right-0 left-0 mx-auto w-3/4 max-w-sm translate-x-2 md:max-w-lg ${dividerBottom}`}
      /> */}
    </>
  );
}
