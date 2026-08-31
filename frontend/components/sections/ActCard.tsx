import { PageCard } from '@/components/ui/PageCard';
import { CurtainDrapes } from '@/components/ui/CurtainDrapes';

export type ActCardVariant = 'prologue' | 'intermission';

interface ActCardProps {
  variant: ActCardVariant;
}

/**
 * ActCard — Server Component
 *
 * The theatre bookends around the love story: a playbill plate that opens
 * the ten years, and an intermission card that closes them and hands the
 * guest to the wedding logistics.
 *
 * The two variants put their type on opposite surfaces, which is what makes
 * the mechanic read in both directions:
 *
 *   • `prologue` — the headline is printed on the raspberry album page and
 *     the drapes sweep APART to uncover it. The guest reads a page.
 *   • `intermission` — the page beneath is left bare and the headline is
 *     printed on the CLOTH, fading in once the drapes have swept SHUT. The
 *     guest reads a curtain.
 *
 * Keeping the intermission's type on the cloth (rather than duplicating it
 * on the page underneath) also means each plate states its headline exactly
 * once, so a screen reader never hears it twice.
 *
 * Must be wrapped in <ChapterSection story bg="page-..."> — `story` supplies
 * the `relative` positioning the drapes absolutely position against, plus
 * the full-viewport stage height and watermark suppression.
 */
export function ActCard({ variant }: ActCardProps) {
  if (variant === 'prologue') {
    return (
      <>
        {/* Cream, not raspberry: the drapes ARE raspberry, so a raspberry
            page underneath made the curtain invisible against the page it
            was supposed to be covering. Cream also reads as playbill stock. */}
        <PageCard bg="cream">
          <p className="chapter-lift font-caption font-medium text-[clamp(0.6rem,1.5dvh,0.75rem)] uppercase tracking-[0.22em] text-text-on-light/75">
            Act One
          </p>
          <h2 className="chapter-lift mt-4 rounded-2xl px-6 py-[clamp(0.3rem,1dvh,0.55rem)] font-display font-light italic text-[clamp(1.75rem,6dvh,3rem)] leading-display text-text-on-light backdrop-blur-sm">
            The Decade
          </h2>
          <span aria-hidden="true" className="mt-5 h-px w-24 bg-text-on-light/35" />
          <p className="chapter-lift mt-5 font-caption font-medium text-[clamp(0.55rem,1.4dvh,0.7rem)] uppercase tracking-[0.18em] text-text-on-light/70">
            01.2017 — 01.2027
          </p>
        </PageCard>

        <CurtainDrapes mode="open" />
      </>
    );
  }

  return (
    <>
      {/* Bare paper. It shows for a beat before the drapes close over it —
          all of this plate's type lives on the cloth instead. */}
      <PageCard bg="matcha" />

      <CurtainDrapes mode="close">
        <p className="font-caption font-medium text-[clamp(0.6rem,1.5dvh,0.75rem)] uppercase tracking-[0.22em] text-white/70">
          Intermission
        </p>
        <h2 className="mt-4 font-display font-light italic text-[clamp(1.75rem,6dvh,3rem)] leading-display text-white">
          Act Two begins
        </h2>
        <p className="mt-3 font-display font-normal text-[clamp(1rem,2.6dvh,1.5rem)] tracking-wide text-white/85">
          Friday, January 8, 2027
        </p>
        <span aria-hidden="true" className="mt-6 h-px w-28 bg-golden-matcha/70" />
        <p className="mt-5 font-caption font-medium text-[clamp(0.55rem,1.4dvh,0.7rem)] uppercase tracking-[0.18em] text-white/65">
          Please take your seat
        </p>
      </CurtainDrapes>
    </>
  );
}
