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
 * Functional sections (RSVP, details, dress code, etc.) come in two
 * flavors:
 *  - `cream` → full-bleed `bg-paper-white.png` paper texture (watermark
 *    suppressed via `data-paper-white="solid"`).
 *  - `sage` / `strawberry-milk` → flat fill + pattern-watermark overlay.
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
  // ── Functional section tones ──
  // `cream` wears the paper-white textured PNG; sage/strawberry-milk keep
  // the flat fill + watermark stationery combo.
  'cream':
    'bg-paper-white [--text-on-light:#1a1a1a] [--mat-color:var(--color-deep-matcha)] [--text-backdrop:rgba(255,255,255,0.45)]',
  'sage':
    'bg-section-sage [--text-on-light:#ffffff] [--mat-color:var(--color-strawberry-milk)] [--text-backdrop:rgba(0,0,0,0.3)]',
  'strawberry-milk':
    'bg-strawberry-milk [--text-on-light:#1a1a1a] [--mat-color:var(--color-deep-matcha)] [--text-backdrop:rgba(255,255,255,0.45)]',
  // ── Story chapter page-wing tones (PageCard renders pattern on top) ──
  // Wing color matches each patterned PNG's paper base so the page-card
  // edge seams cleanly into the section on landscape viewports.
  // `--text-backdrop` is a CONTRASTING semi-opaque overlay (lighter
  // than light bgs, darker than dark bgs), paired with backdrop-blur
  // on text wrappers to lift text off the embossed ornament and keep
  // captions readable.
  'page-cream':
    'bg-section-cream [--text-on-light:#1a1a1a] [--mat-color:var(--color-deep-matcha)] [--text-backdrop:rgba(255,255,255,0.45)]',
  'page-matcha':
    'bg-deep-matcha [--text-on-light:#ffffff] [--mat-color:var(--color-strawberry-milk)] [--text-backdrop:rgba(0,0,0,0.3)]',
  'page-raspberry':
    'bg-raspberry [--text-on-light:#ffffff] [--mat-color:var(--color-strawberry-milk)] [--text-backdrop:rgba(0,0,0,0.3)]',
  'page-strawberry-milk':
    'bg-strawberry-milk [--text-on-light:#1a1a1a] [--mat-color:var(--color-deep-matcha)] [--text-backdrop:rgba(255,255,255,0.45)]',
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
   *  - drops `border-l-4` palette accent stripe
   *  - sets `data-story-chapter` (CSS hook that suppresses the watermark)
   * Functional sections leave this false to keep the accent stripe and
   * watermark intact. Scroll behavior is independent — see the `snap`
   * prop below.
   */
  story?: boolean;
  /**
   * Opt this section into scroll-snap as a snap target. Default is
   * false (free-flow scroll). Only the hero opts in today — its
   * snap-start gives the landing a stable resting position on first
   * load and on scroll-to-top. Long content-rich sections must stay
   * free-flow so the bottom of the section remains reachable on
   * mobile viewports that can't contain a full section.
   */
  snap?: boolean;
  children: React.ReactNode;
}

// Alternating two-tone heartbeat — used by functional sections only.
// Odd rows wear `bg-paper-white` (the textured PNG replaces the previous
// cream-fill + watermark combo); even rows keep the flat sage fill with
// the floral watermark intact.
const alternatingClasses =
  'odd:bg-paper-white odd:[--text-on-light:#1a1a1a] odd:[--mat-color:var(--color-deep-matcha)] ' +
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
  snap = false,
  children,
}: ChapterSectionProps) {
  const bgClasses = bg
    ? bgToneClass[bg]
    : alternating
      ? alternatingClasses
      : bgToneClass['cream'];

  // Tag sections wearing `bg-paper-white` so the global watermark
  // `::before` skips them. `solid` = always, `alt` = only on :nth-child(odd).
  // `bg` undefined + no alternating defaults to cream (above), which is also
  // a solid paper-white section.
  const paperWhiteMode =
    bg === 'cream' || (!bg && !alternating)
      ? 'solid'
      : !bg && alternating
        ? 'alt'
        : undefined;

  return (
    <section
      id={id}
      aria-label={label}
      data-palette={palette}
      data-story-chapter={story ? '' : undefined}
      data-paper-white={paperWhiteMode}
      className={cn(
        'min-h-dvh flex items-center justify-center',
        // Snap is opt-in. Only sections that pass `snap` declare
        // themselves as snap targets inside the snap-proximity
        // container. Today that's just the hero — its landing benefits
        // from a stable resting position on first load and on
        // scroll-to-top. Every other section free-flows so content
        // that exceeds the viewport remains reachable on mobile.
        snap && 'snap-start snap-always',
        bgClasses,
        // Accent stripe lives on functional sections only.
        !story && cn('border-l-4', paletteBorderClass[palette]),
        // `relative` for any section that needs absolute-positioned
        // children (PageCard on story chapters, SectionDecorations on
        // decorated sections).
        (decorate || story) && 'relative',
        // `overflow-hidden` ONLY on decorated sections (the hero with
        // its corner-anchor CallaLily bleeds). NEVER on story sections —
        // the proposal uses `position: sticky` inside, and sticky breaks
        // when ANY ancestor has overflow:hidden. PageCard's contents are
        // already self-contained via inset-0 / inset-[12%], so clipping
        // at the section level isn't needed for story chapters.
        decorate && 'overflow-hidden',
      )}
    >
      {decorate && <SectionDecorations hero={hero} />}
      {children}
    </section>
  );
}
