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
  /**
   * Apply the alternating cream / deep-matcha bg "heartbeat" via the
   * odd/even nth-child Tailwind utilities. Opt-in (defaults false) so
   * functional sections (wedding details, dress code, entourage, RSVP,
   * completion) stay on a single fixed cream bg regardless of where they
   * land in the section sequence. Story chapters pass `true`.
   */
  alternating?: boolean;
  /**
   * When true, use the hero variant of the decoration layout — the
   * middle callas grow much larger to fill the empty vertical space
   * around the centered headline. Story chapters keep small middle
   * callas because they have a photo in the side-strip zone.
   * No effect when `decorate` is false.
   */
  hero?: boolean;
  children: React.ReactNode;
}

export function ChapterSection({
  id,
  palette,
  label,
  decorate = false,
  alternating = false,
  hero = false,
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
        // Alternating two-tone heartbeat — opt-in via `alternating`.
        // Story chapters use it (cream / deep-matcha rhythm); functional
        // sections opt out and stay on a fixed cream bg so the visual
        // flow shifts gears once the love-story concludes.
        alternating
          ? 'odd:bg-section-cream even:bg-section-sage odd:[--mat-color:var(--color-deep-matcha)] even:[--mat-color:var(--color-strawberry-milk)]'
          : 'bg-section-cream [--mat-color:var(--color-deep-matcha)]',
        'border-l-4',
        paletteBorderClass[palette],
        // `relative overflow-hidden` only when decorated, so undecorated
        // sections don't accidentally clip overflowing content.
        decorate && 'relative overflow-hidden',
      )}
    >
      {decorate && <SectionDecorations hero={hero} />}
      {children}
    </section>
  );
}
