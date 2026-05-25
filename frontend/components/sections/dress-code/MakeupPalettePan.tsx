import { cn } from "@/lib/utils";
import type { PaletteColorEntry } from "@/sanity/queries/dressCode";

/**
 * Static mapping of palette color keys to Tailwind bg classes.
 * Tailwind purges dynamic classes — every class must be present verbatim in source.
 */
const PALETTE_BG: Record<string, string> = {
  "deep-matcha": "bg-deep-matcha",
  raspberry: "bg-raspberry",
  "golden-matcha": "bg-golden-matcha",
  "strawberry-jam": "bg-strawberry-jam",
  "matcha-chiffon": "bg-matcha-chiffon",
  "berry-meringue": "bg-berry-meringue",
  "matcha-latte": "bg-matcha-latte",
  "strawberry-milk": "bg-strawberry-milk",
};

// Strawberry Milk is the bridesmaids-only colour; bridesmaids learn it through
// a private channel. It must never appear on the public pan even if a content
// editor adds it in Sanity.
const PUBLIC_BLOCKED_KEYS = new Set<string>(["strawberry-milk"]);

// Display order is the eyeshadow-palette convention: dark → light within each
// colour family. Top row holds greens, bottom row holds pinks (centred).
const TOP_ROW_KEYS = ["deep-matcha", "golden-matcha", "matcha-chiffon", "matcha-latte"];
const BOTTOM_ROW_KEYS = ["raspberry", "strawberry-jam", "berry-meringue"];

interface MakeupPalettePanProps {
  palette: PaletteColorEntry[];
}

/**
 * MakeupPalettePan — Server Component
 *
 * Renders the dress-code colours as a single makeup-palette object: a cream
 * tray with seven gap-less swatches inset (4 on top, 3 centred below). No
 * visible labels — each swatch carries an `aria-label` so screen readers and
 * the accessibility tree can still announce the colour name.
 *
 * Strawberry Milk is filtered out (`PUBLIC_BLOCKED_KEYS`); bridesmaids learn
 * about it off-site.
 *
 * Layout uses an 8-column grid so each swatch spans 2 columns: the top row
 * fills cols 1–8 (4 swatches × 2 cols), the bottom row leaves cols 1 and 8
 * empty so its 3 swatches centre.
 */
export function MakeupPalettePan({ palette }: MakeupPalettePanProps) {
  const byKey = new Map(
    palette
      .filter((c) => !PUBLIC_BLOCKED_KEYS.has(c.colorKey))
      .map((c) => [c.colorKey, c] as const),
  );

  const topRow = TOP_ROW_KEYS.map((key) => byKey.get(key)).filter(
    (c): c is PaletteColorEntry => c !== undefined,
  );
  const bottomRow = BOTTOM_ROW_KEYS.map((key) => byKey.get(key)).filter(
    (c): c is PaletteColorEntry => c !== undefined,
  );

  if (topRow.length === 0 && bottomRow.length === 0) return null;

  return (
    <div
      // Hairline dividers — the cream tray peeks through 1px gaps between
      // swatches without breaking the "single-object" gestalt.
      className="bg-section-cream rounded-md shadow-md p-px flex flex-col gap-px overflow-hidden"
      role="group"
      aria-label="Wedding palette colours"
    >
      <div className="grid grid-cols-8 gap-px">
        {topRow.map((swatch) => (
          <Swatch key={swatch._key} swatch={swatch} />
        ))}
      </div>
      <div className="grid grid-cols-8 gap-px">
        <div aria-hidden="true" />
        {bottomRow.map((swatch) => (
          <Swatch key={swatch._key} swatch={swatch} />
        ))}
        <div aria-hidden="true" />
      </div>
    </div>
  );
}

function Swatch({ swatch }: { swatch: PaletteColorEntry }) {
  return (
    <div
      className={cn("col-span-2 aspect-square", PALETTE_BG[swatch.colorKey])}
      role="img"
      aria-label={swatch.colorLabel}
    />
  );
}
