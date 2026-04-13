import Image from "next/image";
import {
  Crown,
  Flame,
  Ribbon,
  Infinity,
  Flower2,
  Gem,
  BookOpen,
  User,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils";
import type { PadrinoResult, WeddingPartyResult } from "@/sanity/queries/entourage";

interface EntourageSectionProps {
  padrinos: PadrinoResult[];
  weddingParty: WeddingPartyResult[];
}

/**
 * Static mapping of palette color keys to Tailwind border-top classes.
 * CRITICAL: Tailwind purges dynamic classes — every class must be present
 * verbatim in source for the scanner.
 */
const paletteBorderTopMap: Record<string, string> = {
  "deep-matcha": "border-t-deep-matcha",
  raspberry: "border-t-raspberry",
  "golden-matcha": "border-t-golden-matcha",
  "strawberry-jam": "border-t-strawberry-jam",
  "matcha-chiffon": "border-t-matcha-chiffon",
  "berry-meringue": "border-t-berry-meringue",
  "matcha-latte": "border-t-matcha-latte",
  "strawberry-milk": "border-t-strawberry-milk",
};

const DEFAULT_PALETTE_KEY = "matcha-chiffon";

/**
 * Maps Filipino wedding role keywords to Lucide icons.
 * Matched case-insensitively against the role string from Sanity.
 */
const roleIconMap: [RegExp, LucideIcon][] = [
  [/best\s*man|maid\s*of\s*honor|matron\s*of\s*honor/i, Crown],
  [/candle|kandila/i, Flame],
  [/veil|velo/i, Ribbon],
  [/cord/i, Infinity],
  [/flower\s*girl/i, Flower2],
  [/ring\s*bearer/i, Gem],
  [/bible|arrhae/i, BookOpen],
  [/groomsman|groomsmen/i, User],
  [/bridesmaid|bridesmaids/i, UserRound],
];

function getRoleIcon(role: string): LucideIcon | null {
  for (const [pattern, icon] of roleIconMap) {
    if (pattern.test(role)) return icon;
  }
  return null;
}

/* ──────────────────────────────────────────────────────────
 * PadrinoCard — premium "place card" for ninongs/ninangs.
 *
 * Uses palette color as a bold top-border accent on a light card body.
 * This guarantees WCAG AA contrast for all text regardless of
 * which palette color is assigned (some mid-tones like strawberry-jam
 * fail 4.5:1 for both white and dark text on a full bg).
 * ────────────────────────────────────────────────────────── */

interface PadrinoCardProps {
  padrino: PadrinoResult;
}

function PadrinoCard({ padrino }: PadrinoCardProps) {
  const { name, role, colorAssignment, photo } = padrino;
  const colorKey = colorAssignment ?? DEFAULT_PALETTE_KEY;
  const borderClass = paletteBorderTopMap[colorKey] ?? paletteBorderTopMap[DEFAULT_PALETTE_KEY];

  return (
    <article
      className={cn(
        "flex flex-col items-center text-center",
        "rounded-(--card-radius) bg-background shadow-(--shadow-card)",
        "border-t-4",
        borderClass,
        "p-(--card-padding)",
      )}
    >
      {photo?.asset ? (
        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-3">
          <Image
            src={urlFor(photo).width(160).height(160).url()}
            alt=""
            fill
            sizes="(max-width: 768px) 4rem, 5rem"
            loading="lazy"
            className="object-cover"
            placeholder={photo.asset.metadata?.lqip ? "blur" : undefined}
            blurDataURL={photo.asset.metadata?.lqip}
          />
        </div>
      ) : (
        <div
          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-berry-meringue/15 flex items-center justify-center mb-3"
          aria-hidden="true"
        >
          <span className="font-display font-light text-display-sm text-berry-meringue/60 select-none">
            {name.charAt(0)}
          </span>
        </div>
      )}

      <p className="font-display font-medium text-body-lg text-text-on-light leading-snug">
        {name}
      </p>
      <p className="font-body text-body-sm text-text-on-light/70 mt-1">
        {role}
      </p>
    </article>
  );
}

/**
 * Static mapping of palette color keys to Tailwind background classes at
 * low opacity — used for the icon/initial circle on wedding party cards.
 */
const paletteBgLightMap: Record<string, string> = {
  "deep-matcha": "bg-deep-matcha/15",
  raspberry: "bg-raspberry/15",
  "golden-matcha": "bg-golden-matcha/15",
  "strawberry-jam": "bg-strawberry-jam/15",
  "matcha-chiffon": "bg-matcha-chiffon/15",
  "berry-meringue": "bg-berry-meringue/15",
  "matcha-latte": "bg-matcha-latte/15",
  "strawberry-milk": "bg-strawberry-milk/15",
};

const paletteTextMap: Record<string, string> = {
  "deep-matcha": "text-deep-matcha/70",
  raspberry: "text-raspberry/70",
  "golden-matcha": "text-golden-matcha/70",
  "strawberry-jam": "text-strawberry-jam/70",
  "matcha-chiffon": "text-matcha-chiffon/70",
  "berry-meringue": "text-berry-meringue/70",
  "matcha-latte": "text-matcha-latte/70",
  "strawberry-milk": "text-strawberry-milk/70",
};

const WEDDING_PARTY_DEFAULT = "berry-meringue";

/* ──────────────────────────────────────────────────────────
 * WeddingPartyCard — card for non-padrino entourage members.
 *
 * Accent color is set per-member via colorAssignment in Sanity,
 * falling back to berry-meringue (the chapter color).
 * Shows a Lucide icon for recognised Filipino wedding roles
 * (candle, veil, cord, groomsman, bridesmaid, etc.)
 * or falls back to an initial-letter circle.
 * ────────────────────────────────────────────────────────── */

interface WeddingPartyCardProps {
  member: WeddingPartyResult;
}

function WeddingPartyCard({ member }: WeddingPartyCardProps) {
  const { name, role, colorAssignment } = member;
  const colorKey = colorAssignment ?? WEDDING_PARTY_DEFAULT;
  const borderClass = paletteBorderTopMap[colorKey] ?? paletteBorderTopMap[WEDDING_PARTY_DEFAULT];
  const circleBg = paletteBgLightMap[colorKey] ?? paletteBgLightMap[WEDDING_PARTY_DEFAULT];
  const circleText = paletteTextMap[colorKey] ?? paletteTextMap[WEDDING_PARTY_DEFAULT];
  const Icon = getRoleIcon(role);

  return (
    <article
      className={cn(
        "flex flex-col items-center text-center",
        "rounded-(--card-radius) bg-background shadow-(--shadow-card)",
        "border-t-4",
        borderClass,
        "p-(--card-padding)",
      )}
    >
      <div
        className={cn(
          "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3",
          circleBg,
        )}
        aria-hidden="true"
      >
        {Icon ? (
          <Icon className={cn("w-6 h-6 md:w-7 md:h-7", circleText)} strokeWidth={1.5} />
        ) : (
          <span className={cn("font-display font-light text-display-sm select-none", circleText)}>
            {name.charAt(0)}
          </span>
        )}
      </div>

      <p className="font-display font-medium text-body-md text-text-on-light leading-snug">
        {name}
      </p>
      <p className="font-body text-body-sm text-text-on-light/70 mt-1">
        {role}
      </p>
    </article>
  );
}

/* ──────────────────────────────────────────────────────────
 * EntourageSection — Server Component
 *
 * Renders two sub-sections in one scroll chapter:
 *   1. Padrino Wall — palette-colored cards for ninongs/ninangs
 *   2. Wedding Party — berry-meringue cards with role icons
 *
 * Berry Meringue accent via ChapterSection wrapper in page.tsx.
 * Must be wrapped in <ChapterSection> for snap-scroll and palette accent.
 * ────────────────────────────────────────────────────────── */

export function EntourageSection({ padrinos, weddingParty }: EntourageSectionProps) {
  const hasPadrinos = padrinos.length > 0;
  const hasWeddingParty = weddingParty.length > 0;

  return (
    <div className="flex flex-col items-center w-full px-(--chapter-padding-x) py-(--chapter-padding-y)">
      <h2 className="sr-only">Entourage</h2>

      {/* ── Padrino Wall ── */}
      {hasPadrinos && (
        <div className="w-full max-w-4xl mb-12">
          <h3 className="font-display font-light text-display-md text-text-on-light tracking-wide text-center mb-2">
            The Padrino Wall
          </h3>
          <p className="font-body text-body-sm text-text-on-light/70 text-center mb-8 tracking-widest uppercase">
            Mga Ninong at Ninang
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {padrinos.map((padrino) => (
              <PadrinoCard key={padrino._id} padrino={padrino} />
            ))}
          </div>
        </div>
      )}

      {/* ── Divider ── */}
      {hasPadrinos && hasWeddingParty && (
        <div className="w-16 h-px bg-berry-meringue/40 mb-12" aria-hidden="true" />
      )}

      {/* ── Wedding Party ── */}
      {hasWeddingParty && (
        <div className="w-full max-w-4xl">
          <h3 className="font-display font-light text-display-sm text-text-on-light tracking-wide text-center mb-8">
            Wedding Party
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {weddingParty.map((member) => (
              <WeddingPartyCard key={member._id} member={member} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasPadrinos && !hasWeddingParty && (
        <p className="font-display text-display-md text-text-on-light/40">
          Entourage
        </p>
      )}
    </div>
  );
}
