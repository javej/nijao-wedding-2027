import { CallaLily } from '@/components/ui/decorations/CallaLily';
import { MatchaLeaf } from '@/components/ui/decorations/MatchaLeaf';
import { Strawberry } from '@/components/ui/decorations/Strawberry';

/**
 * SectionDecorations — sparse ornamental layer for every ChapterSection.
 *
 * Renders BOTH variants (sage + cream) as direct children of the parent
 * <section>. CSS in globals.css uses `:nth-child(odd|even)` on the
 * parent section to show only the matching variant — same selector
 * scheme that drives `odd:bg-section-sage even:bg-section-cream` in
 * ChapterSection. So the visible variant always matches the section bg.
 *
 * Sage sections (odd): deep-matcha calla + strawberry-milk berries.
 * Cream sections (even): strawberry-milk calla + deep-matcha leaves.
 *
 * Calla lily is the feature flower (~64-80px); strawberries and
 * leaves are the supporting motif (~24-40px). All elements are
 * pointer-events-none and aria-hidden — purely decorative.
 */
export function SectionDecorations() {
  return (
    <>
      {/* ── Sage variant (odd sections: Hero, Story 2017, 2019, etc.) ── */}
      <div
        className="section-decor-sage pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Feature flower — upper-left, deep-matcha tint */}
        <CallaLily className="absolute top-8 left-6 w-14 rotate-12 text-deep-matcha opacity-50 md:top-12 md:left-10 md:w-20" />

        {/* Supporting strawberries — scattered */}
        <Strawberry className="absolute top-16 right-12 w-7 -rotate-12 text-strawberry-milk opacity-60 md:top-20 md:right-20 md:w-10" />
        <Strawberry className="absolute right-6 bottom-40 w-6 rotate-45 text-strawberry-milk opacity-45 md:right-10 md:w-8" />
        <Strawberry className="absolute bottom-16 left-24 w-5 -rotate-6 text-strawberry-milk opacity-55 md:bottom-20 md:left-32 md:w-7" />
      </div>

      {/* ── Cream variant (even sections: Story 2018, 2020, Wedding Details, etc.) ── */}
      <div
        className="section-decor-cream pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Feature flower — lower-right, strawberry-milk tint */}
        <CallaLily className="absolute right-6 bottom-12 w-14 -rotate-12 text-strawberry-milk opacity-65 md:right-10 md:bottom-16 md:w-20" />

        {/* Supporting matcha leaves — scattered */}
        <MatchaLeaf className="absolute top-12 left-8 w-7 rotate-12 text-deep-matcha opacity-40 md:top-16 md:left-12 md:w-10" />
        <MatchaLeaf className="absolute top-32 right-16 w-6 -rotate-45 text-deep-matcha opacity-50 md:top-40 md:right-24 md:w-9" />
        <MatchaLeaf className="absolute bottom-24 left-16 w-5 rotate-45 text-deep-matcha opacity-45 md:bottom-32 md:left-24 md:w-7" />
      </div>
    </>
  );
}
