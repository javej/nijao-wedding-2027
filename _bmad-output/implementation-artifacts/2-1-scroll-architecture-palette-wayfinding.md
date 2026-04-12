# Story 2.1: Scroll Architecture & Palette Wayfinding

Status: ready-for-dev

## Story

As a **guest**,
I want to navigate the site by scrolling vertically with chapters snapping into place,
so that the site feels like walking down an aisle — one chapter at a time, effortlessly.

## Acceptance Criteria

1. **Given** the `<ChapterScrollContainer>` client component is implemented with CSS `scroll-snap-type: y mandatory`, **When** a guest scrolls vertically on Chrome Android and Safari iOS (latest 2), **Then** each chapter snaps cleanly into place — no partial chapters visible, no jank between sections

2. **Given** each chapter section has a left-edge accent using its assigned palette color token, **When** a guest is viewing any chapter, **Then** the section accent color is visible and correctly maps to that section's palette token (no hardcoded hex values)

3. **Given** the guest is on a 375px-wide viewport (iPhone SE), **When** the scroll container renders, **Then** all chapters fit within the viewport width with no horizontal scrolling and no content truncated

4. **Given** `prefers-reduced-motion` is enabled in the OS, **When** the guest scrolls between chapters, **Then** snap-scroll still functions but any CSS transition/animation on chapter entry is disabled

5. **And** the scroll container is tested and confirmed working on: Chrome Android (Galaxy mid-range), Safari iOS (iPhone SE + iPhone 14), Chrome Desktop, Safari macOS — with a manual cross-browser test note in the PR before merge

## Tasks / Subtasks

- [ ] Task 1: Create ChapterScrollContainer client component (AC: 1, 3)
  - [ ] 1.1 Create `frontend/components/ui/ChapterScrollContainer.tsx` as a `'use client'` component
  - [ ] 1.2 Implement outer container with CSS `scroll-snap-type: y mandatory`, `overflow-y: scroll`, `height: 100dvh` (use `dvh` for mobile browser chrome — accounts for Safari address bar)
  - [ ] 1.3 Each child chapter section must have `scroll-snap-align: start` and `min-height: 100dvh`
  - [ ] 1.4 Component accepts `children` as prop (type `React.ReactNode`) — each child is a chapter section. Wrap each child in a snap-align container div
  - [ ] 1.5 Alternatively, accept a `chapters` prop of typed chapter config objects if that gives better control over palette assignment — decide based on simplicity
  - [ ] 1.6 Hide scrollbar with CSS: `scrollbar-width: none` (Firefox) + `::-webkit-scrollbar { display: none }` (Chrome/Safari) — the scroll IS the UI, no scrollbar needed

- [ ] Task 2: Implement palette-as-wayfinding accent system (AC: 2)
  - [ ] 2.1 Each chapter section accepts a `palette` prop — one of the 8 palette color keys: `deep-matcha`, `raspberry`, `matcha-latte`, `strawberry-jam`, `matcha-chiffon`, `berry-meringue`, `golden-matcha`, `strawberry-milk`
  - [ ] 2.2 Render a left-edge accent using the palette token Tailwind class (e.g., `border-l-4 border-deep-matcha`) — **no hardcoded hex values**
  - [ ] 2.3 Use `cn()` from `@/lib/utils` for conditional className assembly
  - [ ] 2.4 Chapter-to-color mapping per UX spec (for reference when wiring sections in later stories):
    | Chapter | Section | Color Token |
    |---|---|---|
    | 1 | Monogram Loader | `deep-matcha` |
    | 2 | Hero | `raspberry` |
    | 3 | Story Scroll | `matcha-latte` |
    | 4 | Proposal | `strawberry-jam` |
    | 5 | Wedding Details | `matcha-chiffon` |
    | 6 | Entourage | `berry-meringue` |
    | 7 | RSVP | `golden-matcha` |
    | 8 | Completion | `strawberry-milk` |

- [ ] Task 3: Add prefers-reduced-motion support (AC: 4)
  - [ ] 3.1 Use `@media (prefers-reduced-motion: reduce)` in CSS to disable any `transition` or `animation` on chapter entry/visibility
  - [ ] 3.2 Snap-scroll must still function under reduced motion — only visual transitions are suppressed
  - [ ] 3.3 Do NOT use Framer Motion in this component — CSS-first for scroll behavior per architecture decision

- [ ] Task 4: Wire into main page (AC: 1)
  - [ ] 4.1 In `frontend/app/(main)/page.tsx`, import and render `<ChapterScrollContainer>` as the top-level wrapper for all chapter content
  - [ ] 4.2 Add placeholder chapter sections (simple divs with palette accents and section labels like "Hero", "Story", etc.) for each Epic 2 section — these will be replaced by real components in Stories 2.2–2.9
  - [ ] 4.3 Ensure `frontend/app/(main)/layout.tsx` does not constrain the scroll container height — no conflicting `overflow` or `max-height` rules. The ChapterScrollContainer must own the full viewport height

- [ ] Task 5: Responsive and cross-browser verification (AC: 3, 5)
  - [ ] 5.1 Test on 375px viewport (iPhone SE) — all chapters fit, no horizontal scroll, no content truncation
  - [ ] 5.2 Test on Chrome Android (Galaxy mid-range) — verify snap behavior with touch
  - [ ] 5.3 Test on Safari iOS (iPhone SE + iPhone 14) — verify snap behavior with dynamic browser chrome (address bar collapse/expand must not break snap)
  - [ ] 5.4 Test on Chrome Desktop and Safari macOS — verify snap with scroll wheel and trackpad
  - [ ] 5.5 Add cross-browser test notes to PR description before merge
  - [ ] 5.6 Run `pnpm build` and `pnpm lint` — zero errors

## Dev Notes

### Architecture Compliance

- `ChapterScrollContainer` is a **Client Component island** — must have `'use client'` directive [Source: architecture.md → Frontend Architecture → Component split]
- Architecture mandates: *"ChapterScrollContainer must be built and cross-browser tested before any other section is built"* — this is the foundational component for all of Epic 2
- **CSS-first** for scroll and chapter transitions — do NOT use Framer Motion or any JS library for scroll behavior
- All 8 palette colors are already defined as CSS custom properties in `frontend/app/globals.css` via Tailwind v4 `@theme {}` block (completed in Story 1.2)
- Use `cn()` from `@/lib/utils` for conditional className assembly — never string concatenation
- Props passed to Client Components must be serializable — no functions, no Date objects

### Key Technical Decisions

- **`100dvh` not `100vh`** — dynamic viewport height accounts for mobile browser chrome (Safari address bar collapse)
- **`scroll-snap-type: y mandatory`** not `proximity` — mandatory ensures clean chapter locks; proximity allows partial positions which breaks the aisle metaphor
- **Hide scrollbar** — the scroll interaction is the UI; visible scrollbar breaks the cinematic metaphor
- **No JS scroll listeners for snap** — CSS scroll-snap handles natively; JS listeners add complexity and jank
- Each chapter section should center its content vertically and horizontally (flex/grid) within the `100dvh` frame

### Previous Story Intelligence

**From Story 1.2 (Design Token System):**
- All 8 palette colors defined in `frontend/app/globals.css` via `@theme {}` block
- Tailwind v4 auto-generates utility classes from `@theme` variables — classes like `border-deep-matcha`, `bg-raspberry` etc. are available
- Typography (Cormorant Garamond + DM Sans) configured via `next/font` in layout.tsx
- Token preview route exists at `/tokens` (dev-only)

**From Story 1.4 (Production Configuration):**
- Header and footer removed from layout — clean empty shell ready for scroll container
- Route group is `(main)` — main page at `frontend/app/(main)/page.tsx`
- Layout is minimal: fonts + Toaster only, no conflicting wrappers
- `ThemeProvider` removed — no dark mode, single theme

### Project Structure Notes

New files:
```
frontend/components/ui/ChapterScrollContainer.tsx   (client component — scroll architecture)
```

Modified files:
```
frontend/app/(main)/page.tsx   (wire in ChapterScrollContainer with placeholder chapters)
```

### What This Story Does NOT Do

- Does NOT implement the monogram loader (Story 2.2)
- Does NOT implement arrival overlay or music (Story 2.3)
- Does NOT implement any real content sections — only placeholder divs inside the scroll container
- Does NOT implement the floating anchor set (Story 3.x)
- Does NOT add Framer Motion — this component is CSS-only
- Does NOT implement any Sanity data fetching — placeholder content only

### References

- Architecture: Frontend Architecture → Component split, ChapterScrollContainer as client island [Source: `_bmad-output/planning-artifacts/architecture.md` → Frontend Architecture]
- Architecture: Cross-component dependencies → ChapterScrollContainer must be stable first [Source: `_bmad-output/planning-artifacts/architecture.md` → Decision Impact Analysis]
- Architecture: Naming Patterns → PascalCase components, `cn()` for classNames [Source: `_bmad-output/planning-artifacts/architecture.md` → Naming Patterns]
- Architecture: Communication Patterns → CSS-first animation, no JS scroll listeners [Source: `_bmad-output/planning-artifacts/architecture.md` → Communication Patterns]
- UX Design: Chapter → Color Mapping table [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Color System]
- UX Design: Experience Mechanics → scroll-locked chapter sequence [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Experience Mechanics]
- UX Design: Experience Principles → "The scroll is the ceremony" [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Experience Principles]
- Epics: Story 2.1 acceptance criteria [Source: `_bmad-output/planning-artifacts/epics.md` → Story 2.1]
- Story 1.2: Design tokens in place [Source: `_bmad-output/implementation-artifacts/1-2-design-token-system.md`]
- Story 1.4: Header/footer removed, clean layout shell [Source: `_bmad-output/implementation-artifacts/1-4-production-configuration-hardening.md`]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
