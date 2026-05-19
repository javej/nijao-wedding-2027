import { SectionDecorations } from '@/components/ui/SectionDecorations';
import { cn } from '@/lib/utils';

/**
 * Palette color keys for the 8 wedding chapters.
 * Maps to Tailwind utility classes generated from @theme tokens in globals.css.
 */
export type PaletteColor =
  | 'deep-matcha'
  | 'raspberry'
  | 'matcha-latte'
  | 'strawberry-jam'
  | 'matcha-chiffon'
  | 'berry-meringue'
  | 'golden-matcha'
  | 'strawberry-milk';

/**
 * Maps palette color keys to their Tailwind border-left color classes.
 * Uses design token utility classes — no hardcoded hex values.
 */
const paletteBorderClass: Record<PaletteColor, string> = {
  'deep-matcha': 'border-l-deep-matcha',
  'raspberry': 'border-l-raspberry',
  'matcha-latte': 'border-l-matcha-latte',
  'strawberry-jam': 'border-l-strawberry-jam',
  'matcha-chiffon': 'border-l-matcha-chiffon',
  'berry-meringue': 'border-l-berry-meringue',
  'golden-matcha': 'border-l-golden-matcha',
  'strawberry-milk': 'border-l-strawberry-milk',
};

interface ChapterSectionProps {
  /** Unique identifier for the chapter section */
  id: string;
  /** Palette color token for the left-edge accent */
  palette: PaletteColor;
  /** Accessible label for the section */
  label: string;
  /**
   * Render the floral/cat decoration layer in this section.
   * Opt-in (defaults false) — currently only Hero and story chapters
   * decorate; the functional sections (wedding details, dress code,
   * entourage, RSVP, completion) and the proposal stay clean.
   */
  decorate?: boolean;
  children: React.ReactNode;
}

export function ChapterSection({
  id,
  palette,
  label,
  decorate = false,
  children,
}: ChapterSectionProps) {
  return (
    <section
      id={id}
      aria-label={label}
      data-palette={palette}
      className={cn(
        'min-h-dvh snap-start snap-always',
        'flex items-center justify-center',
        // Alternating two-tone heartbeat across sections. nth-child(odd)
        // is the first, third, fifth section — starts with cream so the
        // Hero (first section after arrival) lands on the lighter tone.
        'odd:bg-section-cream even:bg-section-sage',
        // Mat color for any `ScallopedMat` rendered inside this section
        // tracks the bg alternation: deep-matcha (green) prints on cream,
        // strawberry-milk (pink) prints on sage. Single source of truth —
        // children read it via `text-(--mat-color)`.
        'odd:[--mat-color:var(--color-deep-matcha)] even:[--mat-color:var(--color-strawberry-milk)]',
        'border-l-4',
        paletteBorderClass[palette],
        // `relative overflow-hidden` only when decorated, so undecorated
        // sections don't accidentally clip overflowing content.
        decorate && 'relative overflow-hidden',
      )}
    >
      {decorate && <SectionDecorations />}
      {children}
    </section>
  );
}
