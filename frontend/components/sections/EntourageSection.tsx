import { cn } from "@/lib/utils";
import type { PadrinoResult, WeddingPartyResult } from "@/sanity/queries/entourage";

interface EntourageSectionProps {
  padrinos: PadrinoResult[];
  weddingParty: WeddingPartyResult[];
}

/**
 * Static palette → Tailwind class maps for the outlined-seal monogram.
 * CRITICAL: Tailwind purges dynamic classes — every class must be
 * present verbatim in source for the scanner. The same palette color
 * lives on both the 1px ring (`border-*`) and the italic initial
 * (`text-*`), so each person reads as a unified palette-color seal.
 */
const paletteBorderMap: Record<string, string> = {
  "deep-matcha": "border-deep-matcha",
  raspberry: "border-raspberry",
  "golden-matcha": "border-golden-matcha",
  "strawberry-jam": "border-strawberry-jam",
  "matcha-chiffon": "border-matcha-chiffon",
  "berry-meringue": "border-berry-meringue",
  "matcha-latte": "border-matcha-latte",
  "strawberry-milk": "border-strawberry-milk",
};

const paletteTextMap: Record<string, string> = {
  "deep-matcha": "text-deep-matcha",
  raspberry: "text-raspberry",
  "golden-matcha": "text-golden-matcha",
  "strawberry-jam": "text-strawberry-jam",
  "matcha-chiffon": "text-matcha-chiffon",
  "berry-meringue": "text-berry-meringue",
  "matcha-latte": "text-matcha-latte",
  "strawberry-milk": "text-strawberry-milk",
};

const PADRINO_DEFAULT_COLOR = "matcha-chiffon";
const WEDDING_PARTY_DEFAULT_COLOR = "berry-meringue";

/* ──────────────────────────────────────────────────────────
 * EntourageCard — frameless person cell shared by Padrinos
 * and Wedding Party. A 1px palette-color ring around an
 * italic Cormorant initial (the "seal"), Cormorant name
 * below, DM Sans uppercase-tracked role beneath.
 *
 * Palette color sits on the ring and the initial only — no
 * background fill. Names and roles use the chapter's text
 * tokens so they stay readable across light and dark
 * chapter backgrounds without per-shade contrast tuning.
 * ────────────────────────────────────────────────────────── */

interface EntourageCardProps {
  name: string;
  role: string;
  colorKey: string;
}

function EntourageCard({ name, role, colorKey }: EntourageCardProps) {
  const borderClass = paletteBorderMap[colorKey] ?? paletteBorderMap[PADRINO_DEFAULT_COLOR];
  const textClass = paletteTextMap[colorKey] ?? paletteTextMap[PADRINO_DEFAULT_COLOR];
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={cn(
          "flex items-center justify-center",
          "w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16",
          "rounded-full border",
          borderClass,
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            "font-display italic font-normal leading-none opacity-80",
            "text-2xl md:text-3xl",
            textClass,
          )}
        >
          {initial}
        </span>
      </div>

      <p className="font-display font-normal text-lg md:text-xl lg:text-2xl leading-snug text-text-on-light mt-3 md:mt-4">
        {name}
      </p>
      <p className="font-body text-body-sm text-text-on-light/60 tracking-widest uppercase mt-2">
        {role}
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
 * EntourageSection — Server Component.
 *
 * Two labeled subsections share the same outlined-seal
 * monogram treatment:
 *   1. Padrino Wall  — italic Cormorant heading + Tagalog
 *                      eyebrow + grid of seals
 *   2. Wedding Party — roman Cormorant heading + grid of seals
 *
 * A single Cormorant-italic floral-heart fleuron (❦) marks
 * the transition between groups. Berry-meringue chapter
 * accent flows from the ChapterSection wrapper in page.tsx.
 * ────────────────────────────────────────────────────────── */

export function EntourageSection({ padrinos, weddingParty }: EntourageSectionProps) {
  const hasPadrinos = padrinos.length > 0;
  const hasWeddingParty = weddingParty.length > 0;

  return (
    <div className="flex flex-col items-center w-full px-(--chapter-padding-x) py-(--chapter-padding-y)">
      <h2 className="sr-only">Entourage</h2>

      {hasPadrinos && (
        <div className="w-full max-w-6xl">
          <h3 className="font-display italic font-normal text-display-md text-text-on-light tracking-wide text-center mb-2">
            The Padrino Wall
          </h3>
          <p className="font-body text-body-sm text-text-on-light/70 text-center mb-10 md:mb-12 tracking-widest uppercase">
            Mga Ninong at Ninang
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-10 lg:gap-y-12">
            {padrinos.map((padrino) => (
              <EntourageCard
                key={padrino._id}
                name={padrino.name}
                role={padrino.role}
                colorKey={padrino.colorAssignment ?? PADRINO_DEFAULT_COLOR}
              />
            ))}
          </div>
        </div>
      )}

      {hasPadrinos && hasWeddingParty && (
        <div
          className="font-display italic text-display-lg text-text-on-light/45 my-14 md:my-16 leading-none select-none"
          aria-hidden="true"
        >
          ❦
        </div>
      )}

      {hasWeddingParty && (
        <div className="w-full max-w-6xl">
          <h3 className="font-display font-normal text-display-sm text-text-on-light tracking-wide text-center mb-10 md:mb-12">
            Wedding Party
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-10 lg:gap-y-12">
            {weddingParty.map((member) => (
              <EntourageCard
                key={member._id}
                name={member.name}
                role={member.role}
                colorKey={member.colorAssignment ?? WEDDING_PARTY_DEFAULT_COLOR}
              />
            ))}
          </div>
        </div>
      )}

      {!hasPadrinos && !hasWeddingParty && (
        <p className="font-body text-display-md text-text-on-light/40">
          Entourage
        </p>
      )}
    </div>
  );
}
