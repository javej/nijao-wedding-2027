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
  children: React.ReactNode;
}

export function ChapterSection({
  id,
  palette,
  label,
  children,
}: ChapterSectionProps) {
  return (
    <section
      id={id}
      aria-label={label}
      data-palette={palette}
      className={cn(
        'min-h-dvh snap-start',
        'flex items-center justify-center',
        'border-l-4',
        paletteBorderClass[palette],
      )}
    >
      {children}
    </section>
  );
}
