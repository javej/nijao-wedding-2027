import { SectionDecorations } from '@/components/ui/SectionDecorations';
import { cn } from '@/lib/utils';

/**
 * Palette color keys for the wedding chapters.
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
 * Used only on functional sections — story chapters drop the accent
 * stripe entirely (their patterned-bg page-card encodes mood instead).
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

/**
 * Background tones a `ChapterSection` can lock to via the `bg` prop.
 *
 * Functional sections (RSVP, details, dress code, etc.) use the flat
 * `cream` / `sage` / `strawberry-milk` tones — solid color with the
 * pattern-watermark overlay providing paper texture.
 *
 * Story chapters use the `page-*` tones — these set the section's
 * underlying wing color, while the `PageCard` component renders the
 * patterned PNG on top as the centered portrait page composition.
 */
export type BgTone =
  | 'cream'
  | 'sage'
  | 'strawberry-milk'
  | 'page-cream'
  | 'page-matcha'
  | 'page-raspberry'
  | 'page-strawberry-milk';

const bgToneClass: Record<BgTone, string> = {
  // ── Functional section tones (flat fills, watermark overlay) ──
  'cream':
    'bg-section-cream [--text-on-light:#1a1a1a] [--mat-color:var(--color-deep-matcha)]',
  'sage':
    'bg-section-sage [--text-on-light:#ffffff] [--mat-color:var(--color-strawberry-milk)]',
  'strawberry-milk':
    'bg-strawberry-milk [--text-on-light:#1a1a1a] [--mat-color:var(--color-deep-matcha)]',
  // ── Story chapter page-wing tones (PageCard renders pattern on top) ──
  // Wing color matches each patterned PNG's paper base so the page-card
  // edge seams cleanly into the section on landscape viewports.
  'page-cream':
    'bg-section-cream [--text-on-light:#1a1a1a] [--mat-color:var(--color-deep-matcha)]',
  'page-matcha':
    'bg-deep-matcha [--text-on-light:#ffffff] [--mat-color:var(--color-strawberry-milk)]',
  'page-raspberry':
    'bg-raspberry [--text-on-light:#ffffff] [--mat-color:var(--color-strawberry-milk)]',
  'page-strawberry-milk':
    'bg-strawberry-milk [--text-on-light:#1a1a1a] [--mat-color:var(--color-deep-matcha)]',
};

interface ChapterSectionProps {
  /** Unique identifier for the chapter section */
  id: string;
  /** Palette color token (semantic — only renders as a stripe on non-story sections) */
  palette: PaletteColor;
  /** Accessible label for the section */
  label: string;
  /**
   * Render the floral/cat decoration layer in this section.
   * Story chapters never decorate — their patterned PageCard supplies
   * its own ornament. Functional sections opt in/out as before.
   */
  decorate?: boolean;
  /**
   * Apply the alternating cream/deep-matcha "heartbeat" via odd/even
   * nth-child utilities. Used by functional sections only — story
   * chapters pick their bg explicitly via the `bg` prop and the
   * 3-way rotation in WeddingExperience. Ignored when `bg` is set.
   */
  alternating?: boolean;
  /**
   * Lock the section to a specific bg tone. Each tone bundles bg color +
   * `--text-on-light` + `--mat-color` so the trio travels together.
   * Story chapters pass `page-*` tones; functional sections pass the
   * flat tones.
   */
  bg?: BgTone;
  /**
   * Hero variant of the decoration layout — large corner-anchor callas.
   * Only relevant when `decorate` is true. Story chapters are not heroes.
   */
  hero?: boolean;
  /**
   * Story chapter mode. When true:
   *  - drops `snap-start snap-always` (continuous flow scroll)
   *  - drops `border-l-4` palette accent stripe
   *  - sets `data-story-chapter` (CSS hook that suppresses the watermark)
   * Functional sections leave this false to keep snap-scroll, the
   * accent stripe, and the watermark intact.
   */
  story?: boolean;
  children: React.ReactNode;
}

// Alternating two-tone heartbeat — used by functional sections only.
const alternatingClasses =
  'odd:bg-section-cream odd:[--text-on-light:#1a1a1a] odd:[--mat-color:var(--color-deep-matcha)] ' +
  'even:bg-section-sage even:[--text-on-light:#ffffff] even:[--mat-color:var(--color-strawberry-milk)]';

export function ChapterSection({
  id,
  palette,
  label,
  decorate = false,
  alternating = false,
  bg,
  hero = false,
  story = false,
  children,
}: ChapterSectionProps) {
  const bgClasses = bg
    ? bgToneClass[bg]
    : alternating
      ? alternatingClasses
      : bgToneClass['cream'];

  return (
    <section
      id={id}
      aria-label={label}
      data-palette={palette}
      data-story-chapter={story ? '' : undefined}
      className={cn(
        'min-h-dvh flex items-center justify-center',
        // Snap-scroll only for non-story sections. Story chapters flow
        // continuously inside the snap-mandatory container by simply
        // not declaring themselves as snap targets.
        !story && 'snap-start snap-always',
        bgClasses,
        // Accent stripe lives on functional sections only.
        !story && cn('border-l-4', paletteBorderClass[palette]),
        // Story chapters always overflow-hidden to contain the PageCard
        // composition. Functional sections only do so when decorated.
        (decorate || story) && 'relative overflow-hidden',
      )}
    >
      {decorate && <SectionDecorations hero={hero} />}
      {children}
    </section>
  );
}
