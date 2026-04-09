# Story 1.2: Design Token System

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want all 8 palette colors, typography scale, animation durations, and spacing tokens defined as CSS custom properties in `frontend/app/globals.css` via Tailwind v4's `@theme {}` block, with both fonts self-hosted via `next/font`,
so that no component ever hardcodes a hex value and the full design system is available from the first UI story.

## Acceptance Criteria

1. **Given** the `@theme {}` block in `globals.css` is populated with all palette tokens, **When** a component uses `text-deep-matcha` or `bg-raspberry` (or any of the 8 token classes), **Then** the correct color renders — no hardcoded hex values in any component file

2. **Given** the 8 palette colors are defined (`deep-matcha`, `raspberry`, `golden-matcha`, `strawberry-jam`, `matcha-chiffon`, `berry-meringue`, `matcha-latte`, `strawberry-milk`), **When** the app renders, **Then** all 8 colors are available as both CSS custom properties (`--color-deep-matcha` etc.) and as Tailwind utility classes

3. **Given** Cormorant Garamond (weights 300/400/600) and DM Sans (weights 400/500) are configured via `next/font`, **When** the app renders, **Then** both fonts load from self-hosted files — no external Google Fonts requests are made (verifiable via browser DevTools Network tab)

4. **Given** animation duration tokens are defined (`--duration-ceremony`, etc.), easing tokens (`--ease-enter`, etc.), and shadow tokens are defined, **When** any animated component references them, **Then** values are sourced from CSS custom properties — no hardcoded `ms` or `px` values for durations/shadows

5. **And** a minimal token-preview route or component exists (dev-only, can be deleted later) to visually verify all palette colors, type scale, and font rendering

## Tasks / Subtasks

- [ ] Task 1 — Replace starter theme with wedding palette in globals.css (AC: 1, 2)
  - [ ] 1.1 Open `frontend/app/globals.css`. The file currently has a `@theme` block with shadcn/ui defaults (background, foreground, primary, secondary, muted, accent, destructive, border, input, ring, chart-1 through chart-5, sidebar colors, radius). Replace the entire `@theme` block contents with the wedding design tokens
  - [ ] 1.2 Define all 8 palette colors as CSS custom properties in the `@theme {}` block:
    ```css
    --color-deep-matcha:      #676930;
    --color-raspberry:        #9c4051;
    --color-golden-matcha:    #baaf2f;
    --color-strawberry-jam:   #b55a64;
    --color-matcha-chiffon:   #b2bf93;
    --color-berry-meringue:   #c98d8e;
    --color-matcha-latte:     #9fc768;
    --color-strawberry-milk:  #e8bcbc;
    ```
  - [ ] 1.3 Define supporting colors:
    ```css
    --color-primary-dark:     #7a3040;
    --color-text-on-dark:     #ffffff;
    --color-text-on-light:    #1a1a1a;
    --color-background:       #faf9f6;
    ```
  - [ ] 1.4 Retain any shadcn/ui tokens still needed for existing UI primitives (button, card, accordion, sheet, dropdown-menu, etc.) — the starter has ~30 shadcn/ui components that reference `bg-background`, `text-foreground`, `border`, etc. Map these to wedding palette equivalents or keep them. **Decision required:** either (a) keep shadcn defaults alongside wedding tokens, or (b) remap shadcn semantic tokens to wedding palette values. Recommended: (a) keep both — shadcn components still work, wedding components use wedding tokens
  - [ ] 1.5 Remove dark mode CSS custom properties — the wedding site has no dark mode (single-theme); remove the `@media (prefers-color-scheme: dark)` block and all dark-mode overrides. Also remove `ThemeProvider` usage from layout if only light mode is needed
  - [ ] 1.6 Verify Tailwind v4 auto-generates utility classes: `bg-deep-matcha`, `text-raspberry`, `border-strawberry-jam`, etc. — test in dev server

- [ ] Task 2 — Configure self-hosted fonts via next/font (AC: 3)
  - [ ] 2.1 The current layout.tsx (`frontend/app/layout.tsx`) imports `Inter` from `next/font/google`. Replace with:
    - **Cormorant Garamond** (display): weights 300, 400, 600 — `next/font/google` with `display: 'swap'`, variable `--font-display`
    - **DM Sans** (body/UI): weights 400, 500 — `next/font/google` with `display: 'swap'`, variable `--font-body`
  - [ ] 2.2 **IMPORTANT — next/font/google vs self-hosted:** `next/font/google` in Next.js automatically downloads and self-hosts Google Fonts at build time — no runtime requests to Google. This IS the self-hosting mechanism. Do NOT manually download .woff2 files. Use `next/font/google` imports.
  - [ ] 2.3 Apply font CSS variables to `<html>` or `<body>` in layout.tsx: `className={`${cormorantGaramond.variable} ${dmSans.variable}`}`
  - [ ] 2.4 Add font family tokens to the `@theme {}` block in globals.css:
    ```css
    --font-display: var(--font-cormorant-garamond), serif;
    --font-body: var(--font-dm-sans), sans-serif;
    ```
  - [ ] 2.5 Verify in browser DevTools Network tab: zero requests to `fonts.googleapis.com` or `fonts.gstatic.com`
  - [ ] 2.6 Remove the old `Inter` font import and `--font-sans` variable from layout.tsx

- [ ] Task 3 — Define type scale tokens (AC: 4)
  - [ ] 3.1 Add responsive type scale tokens to `@theme {}` using `clamp()`:
    ```css
    --text-display-2xl: clamp(4rem, 10vw, 8rem);
    --text-display-xl:  clamp(2.5rem, 6vw, 5rem);
    --text-display-lg:  clamp(1.75rem, 4vw, 3rem);
    --text-display-md:  clamp(1.25rem, 3vw, 2rem);
    --text-body-lg:     1.25rem;
    --text-body-md:     1rem;
    --text-body-sm:     0.875rem;
    --text-ui-md:       1rem;
    --text-ui-sm:       0.875rem;
    ```
  - [ ] 3.2 Add line-height tokens:
    ```css
    --leading-display: 1.1;
    --leading-body:    1.6;
    --leading-ui:      1.4;
    ```
  - [ ] 3.3 Remove or replace the starter's heading styles in globals.css (`h1` through `h6` base layer rules) — replace with wedding type scale if needed, or remove and let components apply tokens directly

- [ ] Task 4 — Define animation, easing, shadow, and spacing tokens (AC: 4)
  - [ ] 4.1 Add animation duration tokens to `@theme {}`:
    ```css
    --duration-ceremony:  400ms;
    --duration-chapter:   600ms;
    --duration-rsvp:      300ms;
    ```
  - [ ] 4.2 Add easing tokens to `@theme {}`:
    ```css
    --ease-enter:    cubic-bezier(0.0, 0.0, 0.2, 1);
    --ease-exit:     cubic-bezier(0.4, 0.0, 1, 1);
    --ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
    ```
  - [ ] 4.3 Add shadow tokens to `@theme {}`:
    ```css
    --shadow-card:    0 2px 8px rgba(0, 0, 0, 0.1);
    --shadow-overlay: 0 4px 12px rgba(0, 0, 0, 0.15);
    --shadow-anchor:  0 1px 4px rgba(0, 0, 0, 0.08);
    ```
  - [ ] 4.4 Add spacing tokens to `@theme {}`:
    ```css
    --chapter-padding-x:     clamp(1.5rem, 5vw, 4rem);
    --chapter-padding-y:     clamp(2rem, 8vw, 5rem);
    --content-max-width:     640px;
    --content-reading-width: 540px;
    --card-padding:          1.5rem;
    --card-radius:           0.75rem;
    --gap-chapter-elements:  2rem;
    ```
  - [ ] 4.5 Keep the existing `--animate-accordion-down` and `--animate-accordion-up` tokens — they're used by the shadcn/ui Accordion component

- [ ] Task 5 — Create token-preview dev route (AC: 5)
  - [ ] 5.1 Create `frontend/app/(main)/dev/tokens/page.tsx` — a simple Server Component page that renders:
    - All 8 palette color swatches (colored div + label + hex value)
    - Supporting colors (primary-dark, text-on-dark, text-on-light, background)
    - Typography samples: each display size in Cormorant Garamond, each body size in DM Sans
    - Animation duration values listed
    - Shadow examples applied to sample cards
  - [ ] 5.2 This route is for dev verification only — it can be deleted once the design system is confirmed working. No need to gate it behind auth or env checks.

- [ ] Task 6 — Verify build and lint (AC: all)
  - [ ] 6.1 Run `pnpm lint` — zero errors
  - [ ] 6.2 Run `pnpm build` — build succeeds with no warnings about missing tokens or font loading
  - [ ] 6.3 Visually verify in browser: open `/dev/tokens` route, confirm all colors render, both fonts load, type scale is correct

## Dev Notes

### Current State of globals.css

The existing `frontend/app/globals.css` (241 lines) contains:
- A `@theme` block with shadcn/ui default tokens (okLCh color space): `--color-background`, `--color-foreground`, `--color-card`, `--color-popover`, `--color-primary`, `--color-secondary`, `--color-muted`, `--color-accent`, `--color-destructive`, `--color-border`, `--color-input`, `--color-ring`, chart colors 1-5, sidebar colors, border-radius tokens
- A `@theme inline` block mapping these to Tailwind
- Dark mode overrides via `@media (prefers-color-scheme: dark)`
- Base layer heading styles (h1–h6 with responsive sizes)
- A custom `.container` utility with responsive max-widths
- Accordion animation keyframes (`--animate-accordion-down`, `--animate-accordion-up`)
- A `--animate-fade-up` animation

**Strategy:** Replace shadcn color values with wedding palette mappings where possible, ADD all wedding-specific tokens. Keep the structural CSS (container, accordion animations) intact.

### Current State of layout.tsx

`frontend/app/layout.tsx` currently:
- Imports `Inter` from `next/font/google` (weights 400, 500, 600, 700, 800) as `FontSans` with CSS variable `--font-sans`
- Has placeholder metadata: title "Sanity Next.js Website | Schema UI", template "%s | Schema UI"
- Wraps children in `ThemeProvider` (next-themes) with `attribute="class"`, `enableSystem`, `disableTransitionOnChange`
- Has `Toaster` from sonner (top-center)

**What this story changes:** Replace Inter with Cormorant Garamond + DM Sans. Remove or simplify ThemeProvider (no dark mode needed). Font metadata stays for Story 1.4.

### Tailwind v4 Specifics

- Tailwind v4 uses `@theme {}` in CSS (not `tailwind.config.ts`) for design tokens
- Variables defined in `@theme {}` automatically become utility classes: `--color-deep-matcha` → `bg-deep-matcha`, `text-deep-matcha`, `border-deep-matcha`
- The `@theme inline` block maps CSS custom properties to Tailwind's namespace — check if this is still needed in v4.2.2 or if `@theme` alone suffices
- Tailwind v4.2.2 is installed (`frontend/package.json` devDependencies)

### shadcn/ui Component Compatibility

The starter includes ~30 shadcn/ui components that reference semantic tokens: `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `bg-card`, `border`, `bg-muted`, `bg-accent`, `bg-destructive`, etc.

**Options:**
1. **Keep shadcn semantic tokens + add wedding tokens** (recommended) — existing components keep working, new wedding sections use wedding tokens directly
2. **Remap shadcn tokens to wedding palette** — e.g., `--color-primary` → `--color-raspberry`, `--color-background` → `#faf9f6`

**Recommendation:** Option 1 — keep both token sets. Remap only `--color-background` to `#faf9f6` (warm off-white) and `--color-foreground` to `#1a1a1a` so the global page tone matches the wedding design.

### Architecture Compliance

From `architecture.md` — these rules apply to this story:
- No hardcoded hex values in any component — always use token-based Tailwind classes
- Typography: Cormorant Garamond (display, 300/400/600) + DM Sans (body/UI, 400/500), self-hosted via `next/font`
- 8 named palette colors defined as CSS custom properties in `frontend/app/globals.css` via Tailwind v4 `@theme {}` block — Tailwind v4 auto-generates utility classes
- `tailwind.config.ts` is NOT used for tokens (Tailwind v4 pattern)
- Animation durations and shadows also defined as CSS custom properties in `globals.css`
- CSS custom property naming: kebab-case (`--color-deep-matcha`, `--font-display`, `--duration-ceremony`)

### Previous Story Intelligence (Story 1.1)

From the completed Story 1.1:
- **Route group:** The app uses `(main)` route group, not `(site)` — all routes are under `frontend/app/(main)/`
- **Tailwind v4 confirmed:** v4.2.2 installed, `@theme` block pattern is correct
- **next/font approach:** Currently uses `next/font/google` for Inter — same import pattern works for Cormorant Garamond and DM Sans
- **Build command:** `pnpm build` (not `pnpm --filter frontend build`) — builds all workspaces
- **Lint command:** `pnpm lint` (filters to frontend only)
- **Dev server:** `pnpm --filter frontend dev` for Next.js at localhost:3000
- **Active versions:** Next.js 16.1.7, React 19.2.4, Tailwind CSS 4.2.2, motion 12.38.0

### Git Intelligence

Recent commits are all bootstrap work (5 commits total). The codebase is clean — no pending changes. The `story/1-1-project-bootstrap-vercel-deployment` branch is current.

### Key Technical Specifics

**Cormorant Garamond availability:** Available via `next/font/google` as `Cormorant_Garamond`. Supports weights 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold). Use 300, 400, 600 as specified.

**DM Sans availability:** Available via `next/font/google` as `DM_Sans`. Supports weights 100–1000 (variable font). Use 400, 500 as specified.

**next/font/google in Next.js 16:** The API is stable. Import pattern:
```typescript
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-cormorant-garamond',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})
```

**Tailwind v4 @theme custom property naming:** In Tailwind v4, `@theme` properties use the `--` prefix and Tailwind strips the category prefix for utility generation. For example:
- `--color-deep-matcha: #676930;` → utility `text-deep-matcha`, `bg-deep-matcha`
- `--font-display: ...` → utility `font-display`
- `--shadow-card: ...` → utility `shadow-card`

### Project Structure Notes

- Token file: `frontend/app/globals.css` (existing, to be modified)
- Font config: `frontend/app/layout.tsx` (existing, to be modified)
- Token preview: `frontend/app/(main)/dev/tokens/page.tsx` (new file)
- No conflicts with existing structure — this story only modifies 2 existing files and adds 1 new route

### References

- Architecture: Design Token Layer [Source: `_bmad-output/planning-artifacts/architecture.md` → Design Token Layer]
- Architecture: Naming Patterns → CSS custom properties kebab-case [Source: `_bmad-output/planning-artifacts/architecture.md` → Naming Patterns]
- UX Design: Color System [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Color System]
- UX Design: Typography System [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Typography]
- UX Design: Animation Tokens [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Animation & Motion]
- UX Design: Spacing Tokens [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Spacing]
- PRD: NFR-P5 — content pages ship zero client-side JS [Source: `_bmad-output/planning-artifacts/prd.md` → Non-Functional Requirements → Performance]
- PRD: NFR-A2 — 4.5:1 contrast ratio [Source: `_bmad-output/planning-artifacts/prd.md` → Non-Functional Requirements → Accessibility]
- PRD: NFR-A5 — no text below 16px on mobile [Source: `_bmad-output/planning-artifacts/prd.md` → Non-Functional Requirements → Accessibility]
- Story 1.1: Completed — Tailwind v4, next/font, globals.css @theme pattern confirmed [Source: `_bmad-output/implementation-artifacts/1-1-project-bootstrap-vercel-deployment.md`]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
