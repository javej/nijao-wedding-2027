import { DressCodeCategoryCard } from "./dress-code/DressCodeCategoryCard";
import { MakeupPalettePan } from "./dress-code/MakeupPalettePan";
import type { DressCodeResult } from "@/sanity/queries/dressCode";

interface DressCodeSectionProps {
  dressCode: NonNullable<DressCodeResult>;
}

/**
 * Three category cards for a Filipino wedding, in seniority order:
 *   1. Principal Sponsors (Ninongs & Ninangs) — the most formal tier.
 *   2. Entourage — bridesmaids, groomsmen, secondary sponsors.
 *   3. Guests — broadest latitude, formal attire from the palette.
 *
 * Illustrations live in /public/decorations/ — they are static brand
 * assets, not Sanity-managed. The natural intrinsic size of each PNG is
 * declared so next/image can lay it out without runtime probing.
 */
const CATEGORIES = [
  {
    label: "Principal Sponsors",
    attire: "Suits & Dresses",
    imageSrc: "/decorations/dress-principal-sponsors.png",
    imageAlt: "Principal Sponsors dress code: women in deep matcha gowns, men in dark suits with green ties",
  },
  {
    label: "Entourage",
    attire: "Suits & Dresses",
    imageSrc: "/decorations/dress-entourage.png",
    imageAlt: "Entourage dress code: bridesmaids in blush gowns, groomsmen in dark suits with pink ties",
  },
  {
    label: "Guests",
    attire: "Formal Attire",
    imageSrc: "/decorations/dress-guests.png",
    imageAlt: "Guests dress code: a crowd in the full palette — greens, pinks, and earth tones",
  },
] as const;

// All three illustrations share the same intrinsic size (~3:2 landscape).
// next/image needs explicit dimensions to reserve layout space at SSR.
const ILLUSTRATION_WIDTH = 600;
const ILLUSTRATION_HEIGHT = 400;

/**
 * DressCodeSection — Server Component
 *
 * Three category cards stacked vertically (Sponsors → Entourage → Guests),
 * each linking to a full-size lightbox preview, with a single shared
 * makeup-palette pan beneath. Section is free-flow scroll — content
 * may exceed the viewport on mobile and the guest scrolls naturally.
 *
 * Strawberry Milk is filtered out of the rendered pan by
 * `MakeupPalettePan` — bridesmaids learn that colour off-site.
 */
export function DressCodeSection({ dressCode }: DressCodeSectionProps) {
  const { paletteColors } = dressCode;

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-(--chapter-padding-x) py-(--chapter-padding-y) gap-6">
      <h2 className="font-body font-normal text-display-md text-text-on-light tracking-wide">
        Dress Code
      </h2>

      <div className="flex flex-col gap-4 w-full">
        {CATEGORIES.map((category) => (
          <DressCodeCategoryCard
            key={category.label}
            label={category.label}
            attire={category.attire}
            imageSrc={category.imageSrc}
            imageAlt={category.imageAlt}
            imageWidth={ILLUSTRATION_WIDTH}
            imageHeight={ILLUSTRATION_HEIGHT}
          />
        ))}
      </div>

      {paletteColors && paletteColors.length > 0 && (
        <div className="w-full mt-1">
          <MakeupPalettePan palette={paletteColors} />
        </div>
      )}
    </div>
  );
}
