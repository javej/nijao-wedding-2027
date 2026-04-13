import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { cn } from "@/lib/utils";
import PortableTextRenderer from "@/components/portable-text-renderer";
import type { DressCodeResult } from "@/sanity/queries/dressCode";

interface DressCodeSectionProps {
  dressCode: NonNullable<DressCodeResult>;
}

/**
 * Static mapping of palette color keys to Tailwind bg classes.
 * CRITICAL: Tailwind purges dynamic classes — `bg-${colorKey}` will NOT work
 * in production. Every class must be present verbatim in source for the scanner.
 */
const paletteBgMap: Record<string, string> = {
  "deep-matcha": "bg-deep-matcha",
  raspberry: "bg-raspberry",
  "golden-matcha": "bg-golden-matcha",
  "strawberry-jam": "bg-strawberry-jam",
  "matcha-chiffon": "bg-matcha-chiffon",
  "berry-meringue": "bg-berry-meringue",
  "matcha-latte": "bg-matcha-latte",
  "strawberry-milk": "bg-strawberry-milk",
};

/**
 * DressCodeSection — Server Component
 *
 * Renders dress code instructions with palette color swatches so guests
 * know what to wear without messaging the couple.
 *
 * Every color swatch includes a text label for guests with color vision
 * differences (WCAG compliance). Labels come from Sanity so Nianne can
 * customise descriptions without a code change.
 *
 * Must be wrapped in <ChapterSection> for snap-scroll and palette accent.
 */
export function DressCodeSection({ dressCode }: DressCodeSectionProps) {
  const {
    label,
    description,
    paletteColors,
    inspirationImages,
    additionalNotes,
  } = dressCode;

  return (
    <div className="flex flex-col items-center justify-center w-full px-(--chapter-padding-x) py-(--chapter-padding-y)">
      <h2 className="font-body font-normal text-display-md text-text-on-light tracking-wide mb-4">
        Dress Code
      </h2>

      <p className="font-body font-medium text-display-sm text-deep-matcha tracking-widest uppercase mb-8">
        {label}
      </p>

      {description && (
        <div className="font-body text-body-md text-text-on-light/80 text-center max-w-xl mb-12 leading-relaxed">
          {Array.isArray(description) ? (
            <PortableTextRenderer value={description} />
          ) : (
            <p className="whitespace-pre-line">{description}</p>
          )}
        </div>
      )}

      {/* Palette color swatches */}
      {paletteColors && paletteColors.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 w-full max-w-3xl mb-12">
          {paletteColors.map((color) => (
            <div
              key={color._key}
              className="flex flex-col items-center gap-3"
              role="group"
              aria-label={color.colorLabel}
            >
              <div
                className={cn(
                  "w-full aspect-square rounded-lg shadow-sm",
                  paletteBgMap[color.colorKey],
                )}
              />
              <span className="font-body text-body-sm text-text-on-light/70 text-center leading-snug">
                {color.colorLabel}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Inspiration images — only rendered if array is non-empty */}
      {inspirationImages && inspirationImages.length > 0 && (
        <div className="w-full max-w-4xl mb-12">
          <h3 className="font-body font-normal text-display-sm text-text-on-light tracking-wide text-center mb-8">
            Inspiration
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {inspirationImages.map((img) => (
              <div
                key={img._key}
                className="relative aspect-3/4 rounded-lg overflow-hidden"
              >
                <Image
                  src={urlFor(img).width(600).url()}
                  alt={img.alt || "Dress inspiration"}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  loading="lazy"
                  className="object-cover"
                  placeholder={img.asset.metadata?.lqip ? "blur" : undefined}
                  blurDataURL={img.asset.metadata?.lqip}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {additionalNotes && (
        <p className="font-body text-body-md text-text-on-light/80 text-center max-w-lg leading-relaxed whitespace-pre-line">
          {additionalNotes}
        </p>
      )}
    </div>
  );
}
