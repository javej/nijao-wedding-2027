import { CallaLily } from '@/components/ui/decorations/CallaLily';
import { Cat } from '@/components/ui/decorations/Cat';
import { MatchaLeaf } from '@/components/ui/decorations/MatchaLeaf';
import { Strawberry } from '@/components/ui/decorations/Strawberry';

/**
 * SectionDecorations — corner-anchored ornamental layer for decorated sections.
 *
 * Rendered only when the parent ChapterSection passes `decorate`. Today
 * that means the Hero and every story chapter; the functional sections
 * (wedding details, dress code, entourage, RSVP, completion) and the
 * proposal stay clean.
 *
 * Composition pattern — "4-corner anchored, diagonal axis":
 *
 *   ┌────────────────────────────┐
 *   │  ◇                  [calla]│   TOP band: 1 small motif + calla
 *   │                            │
 *   │                            │
 *   │         ●●●●●●●            │   MIDDLE band: KEPT CLEAR — the
 *   │         ●●●●●●●            │     centered photo or text never
 *   │         ●●●●●●●            │     collides with any decoration
 *   │                            │
 *   │  [cat]                  ◇  │   BOTTOM band: cat (with adjacent
 *   │   ◇                        │     motif so it's not isolated) + 1
 *   └────────────────────────────┘     small motif in opposite corner
 *
 * Cream variant: calla top-right, cat-pair bottom-left, single motifs
 *   in the other two corners. Decorations all in deep-matcha (greens)
 *   to contrast with cream bg.
 * Sage variant: mirror — calla top-left, cat-pair bottom-right, single
 *   motifs in the other two corners. Calla + cat in raspberry, vine
 *   accents in strawberry-milk.
 *
 * Why corners (not vine)? The previous vine-down-one-edge pattern got
 * visually swallowed by the centered photo on chapter sections — the
 * narrow side strips left by a w-72 photo were the worst place to put
 * 4 stacked elements. Spreading to corners pushes everything OUT of
 * the side-strip danger zone and balances the composition: no side
 * feels heavy, no side feels empty.
 *
 * The calla → cat DIAGONAL provides the visual axis without crowding
 * any single edge.
 *
 * Bottom-corner FAB safe zones are respected: cat lives at `bottom-32`
 * mobile / `bottom-40` desktop (~128-160px from the bottom), well
 * above the audio/compass FABs at `bottom-6`.
 *
 * All elements are pointer-events-none and aria-hidden — purely decorative.
 */
export function SectionDecorations() {
  return (
    <>
      {/* ── Cream variant (odd sections: Hero, every other story chapter) ── */}
      <div
        className="section-decor-cream pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* TOP-RIGHT — feature calla */}
        <CallaLily
          strokeWidth={1.5}
          className="absolute top-10 right-10 w-16 -rotate-6 text-deep-matcha opacity-50 md:top-16 md:right-16 md:w-24"
        />

        {/* TOP-LEFT — single small leaf, balances the calla diagonally */}
        <MatchaLeaf className="absolute top-12 left-10 w-6 rotate-12 text-deep-matcha opacity-55 md:top-16 md:left-16 md:w-9" />

        {/* BOTTOM-RIGHT — single small leaf, balances the cat diagonally */}
        <MatchaLeaf className="absolute right-12 bottom-32 w-5 -rotate-12 text-deep-matcha opacity-45 md:right-16 md:bottom-40 md:w-8" />

        {/* BOTTOM-LEFT — cat-pair: cat + small leaf companion (so cat isn't isolated) */}
        <Cat className="absolute bottom-32 left-10 w-8 rotate-6 text-deep-matcha opacity-55 md:bottom-40 md:left-16 md:w-12" />
        <MatchaLeaf className="absolute bottom-48 left-24 w-5 -rotate-30 text-deep-matcha opacity-45 md:bottom-56 md:left-32 md:w-7" />
      </div>

      {/* ── Sage variant (even sections: alternating story chapters) ── */}
      <div
        className="section-decor-sage pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* TOP-LEFT — feature calla */}
        <CallaLily
          strokeWidth={1.5}
          className="absolute top-10 left-10 w-16 rotate-6 text-raspberry opacity-50 md:top-16 md:left-16 md:w-24"
        />

        {/* TOP-RIGHT — single small strawberry, balances the calla diagonally */}
        <Strawberry className="absolute top-12 right-10 w-6 -rotate-12 text-strawberry-milk opacity-60 md:top-16 md:right-16 md:w-9" />

        {/* BOTTOM-LEFT — single small strawberry, balances the cat diagonally */}
        <Strawberry className="absolute bottom-32 left-12 w-5 rotate-12 text-strawberry-milk opacity-50 md:bottom-40 md:left-16 md:w-8" />

        {/* BOTTOM-RIGHT — cat-pair: cat + small strawberry companion */}
        <Cat className="absolute right-10 bottom-32 w-8 -rotate-6 text-raspberry opacity-50 md:right-16 md:bottom-40 md:w-12" />
        <Strawberry className="absolute right-24 bottom-48 w-5 rotate-30 text-strawberry-milk opacity-50 md:right-32 md:bottom-56 md:w-7" />
      </div>
    </>
  );
}
