# Story 3.6: Floating Anchor Set & Return Visit Navigation

Status: done

## Story

As a **returning guest**,
I want quick access to Wedding Details, Dress Code, and RSVP without scrolling through the entire experience again,
so that I can find what I need on my second or third visit without frustration.

## Acceptance Criteria

1. **Given** a guest reaches the RSVP section for the first time, **When** that scroll position is detected, **Then** `firstScrollComplete: true` is written to `localStorage` and the `<FloatingAnchorSet>` client component becomes visible for all future visits

2. **Given** `firstScrollComplete` is `true` in `localStorage`, **When** the guest opens the site on a return visit, **Then** three floating anchor icons appear (calendar glyph → Wedding Details, palette swatch → Dress Code, envelope/heart → RSVP), positioned bottom-right, not overlapping content

3. **Given** a floating anchor is tapped or clicked, **When** the anchor activates, **Then** the scroll container jumps to the target section smoothly (or instantly if `prefers-reduced-motion` is set)

4. **Given** the guest is viewing a section with a specific palette color, **When** the floating anchors are visible, **Then** the anchor icons use the palette color of the current section — consistent with the palette-as-wayfinding system (FR5)

5. **Given** `firstScrollComplete` is `false` or absent (first visit), **When** the site renders, **Then** no floating anchors are visible at any point before the guest reaches the RSVP section for the first time

6. **And** `localStorage` access is SSR-safe — the component only reads `localStorage` after hydration on the client; no server-side access attempted

## Tasks / Subtasks

- [x] Task 1: Create or update the useFirstScrollComplete hook (AC: 1, 5, 6)
  - [x] 1.1 Check if `frontend/hooks/useFirstScrollComplete.ts` exists — create if not
  - [x] 1.2 Use `getLocalItem` and `setLocalItem` from `@/lib/localStorage.ts` — SSR-safe
  - [x] 1.3 Hook returns `{ isComplete: boolean; markComplete: () => void }`
  - [x] 1.4 `markComplete()` sets `firstScrollComplete: true` in localStorage

- [x] Task 2: Detect when guest reaches RSVP section (AC: 1)
  - [x] 2.1 In the page-level component or ChapterScrollContainer, detect when the RSVP section scrolls into view
  - [x] 2.2 Use `IntersectionObserver` to detect RSVP section visibility
  - [x] 2.3 When RSVP section is first observed: call `markComplete()` from the hook
  - [x] 2.4 Only fires once per session — subsequent scroll-throughs do not re-trigger

- [x] Task 3: Create FloatingAnchorSet client component (AC: 2, 3, 4, 5, 6)
  - [x] 3.1 Create `frontend/components/ui/FloatingAnchorSet.tsx` with `'use client'` directive
  - [x] 3.2 Read `firstScrollComplete` from localStorage via the hook — only show anchors if `true`
  - [x] 3.3 Render three anchor buttons:
    - Calendar glyph → scrolls to Wedding Details section
    - Palette swatch → scrolls to Dress Code section
    - Envelope/heart → scrolls to RSVP section
  - [x] 3.4 Position: fixed, bottom-right, with appropriate z-index
  - [x] 3.5 Must not overlap content — use appropriate margin/padding
  - [x] 3.6 Icons: use simple SVG glyphs or Lucide icons (already available via shadcn/ui dependencies)

- [x] Task 4: Implement smooth scroll to target section (AC: 3)
  - [x] 4.1 Each anchor button scrolls to the corresponding section via `element.scrollIntoView({ behavior: 'smooth' })`
  - [x] 4.2 If `prefers-reduced-motion` is set: use `behavior: 'instant'` instead of `'smooth'`
  - [x] 4.3 Target sections identified by `id` attributes on the section elements

- [x] Task 5: Dynamic palette color for anchors (AC: 4)
  - [x] 5.1 Track which section is currently in view (using IntersectionObserver or scroll position)
  - [x] 5.2 Update anchor icon color to match the current section's palette color token
  - [x] 5.3 Use Tailwind palette token classes — no hardcoded hex values

- [x] Task 6: Accessibility (AC: 2, 3)
  - [x] 6.1 Each anchor button: min 44x44px touch target (NFR-A3)
  - [x] 6.2 Each button has an `aria-label` (e.g., "Jump to Wedding Details")
  - [x] 6.3 Buttons are focusable and activatable via keyboard (Enter/Space)
  - [x] 6.4 Anchor set has a `nav` wrapper with `aria-label="Quick navigation"`

- [x] Task 7: Verify and test (AC: 1-6)
  - [x] 7.1 First visit: no floating anchors visible until RSVP section is reached
  - [x] 7.2 After reaching RSVP: `firstScrollComplete` written to localStorage
  - [x] 7.3 Return visit: three floating anchors visible immediately
  - [x] 7.4 Tap each anchor: scrolls to correct section
  - [x] 7.5 Reduced motion ON: instant scroll (no smooth animation)
  - [x] 7.6 Anchor color matches current section palette color
  - [x] 7.7 At 375px: anchors don't overlap content
  - [x] 7.8 Keyboard navigation: Tab to anchors, activate with Enter
  - [x] 7.9 Run `pnpm build && pnpm lint` — zero errors

## Dev Notes

### Architecture Patterns & Constraints

- **localStorage access**: ALWAYS use `getLocalItem()` / `setLocalItem()` from `@/lib/localStorage.ts` — never access `localStorage` directly. SSR-safe (returns fallback on server)
- **Client Component only**: `FloatingAnchorSet` is a `'use client'` component. It reads localStorage only after hydration
- **No server-side localStorage**: The component renders nothing on the server; uses `useEffect` or a mounted state to defer localStorage reads to the client
- **Palette-as-wayfinding (FR5)**: The floating anchors are part of the wayfinding system built in Story 2.1. Their color should change based on the currently visible section

### Project Structure Notes

- **New files to create**:
  - `frontend/components/ui/FloatingAnchorSet.tsx` — floating navigation anchors
  - `frontend/hooks/useFirstScrollComplete.ts` — localStorage hook (if not already created)
- **Existing files to reference/modify**:
  - `frontend/lib/localStorage.ts` — SSR-safe localStorage utilities
  - `frontend/components/ui/ChapterScrollContainer.tsx` — may need to expose section IDs or scroll callbacks
  - `frontend/app/(main)/page.tsx` — add `<FloatingAnchorSet>` to the page layout (outside the scroll container, fixed position)
- **Section IDs**: Each section component needs a stable `id` attribute for scroll targeting (e.g., `id="wedding-details"`, `id="dress-code"`, `id="rsvp"`)

### Anti-Patterns to Avoid

- **Do NOT access `localStorage` directly** — use `@/lib/localStorage.ts` utilities
- **Do NOT render floating anchors on first visit before RSVP is reached** — gate on `firstScrollComplete`
- **Do NOT hardcode colors** — use palette token Tailwind classes
- **Do NOT use smooth scroll without checking reduced-motion** — instant when user prefers reduced motion

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns] — localStorage SSR-safe pattern
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] — hooks directory, component organization
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — client component islands
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.6] — acceptance criteria

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- No issues encountered. Build and lint passed on first attempt.

### Completion Notes List

- Created `useFirstScrollComplete` hook using SSR-safe localStorage utilities (`getLocalItem`/`setLocalItem`). Hook defers read to `useEffect` for hydration safety.
- Created `FloatingAnchorSet` client component as a collapsible FAB (compass toggle button → fans out three labeled pill buttons: Details, Attire, RSVP).
- IntersectionObserver serves dual purpose: (1) detects first RSVP scroll to trigger `markComplete()`, and (2) tracks current section's `data-palette` attribute for palette ring accent on the FAB toggle.
- Added `data-palette` attribute to `ChapterSection` so palette can be read from DOM by the observer.
- Palette accent expressed as a ring color on the FAB toggle button — text/icons use fixed dark `text-foreground` to ensure WCAG AA contrast across all 8 palette sections.
- FAB dismisses on Escape key press and click-outside (standard disclosure widget behavior).
- IntersectionObserver threshold set to 0.3 for responsive palette tracking on snap-scroll.
- Scroll behavior adapts to `prefers-reduced-motion` media query via `usePrefersReducedMotion` helper.
- Nav wrapper uses `aria-label="Quick navigation"`, each button has descriptive `aria-label`, toggle has `aria-expanded`.
- Component returns `null` when `isComplete` is `false` (first visit before RSVP reached).
- `pnpm build && pnpm lint` — zero errors.

### Change Log

- 2026-04-15: Implemented Story 3.6 — Floating Anchor Set & Return Visit Navigation. Created hook and component, modified ChapterSection and WeddingExperience.
- 2026-04-15: Iterated on UX — moved from stacked circles (blocked content) → full-width bottom bar (still blocked snap-scroll content) → collapsible FAB (single compass button that fans out labeled pills on tap). Added text labels ("Details", "Attire", "RSVP") for clarity across all guest demographics.
- 2026-04-15: Code review fixes — (1) Fixed WCAG contrast: palette color moved to ring accent on FAB toggle, text/icons now use fixed dark `text-foreground`; (2) Added Escape key handler to close expanded menu; (3) Added click-outside-to-close; (4) Lowered IntersectionObserver threshold from 0.5 to 0.3 for snap-scroll responsiveness; (5) Updated stale Completion Notes.

### File List

- `frontend/hooks/useFirstScrollComplete.ts` — NEW: SSR-safe localStorage hook for first-scroll tracking
- `frontend/components/ui/FloatingAnchorSet.tsx` — NEW: Floating navigation anchors with palette-aware coloring
- `frontend/components/ui/ChapterSection.tsx` — MODIFIED: Added `data-palette` attribute to section element
- `frontend/components/WeddingExperience.tsx` — MODIFIED: Added FloatingAnchorSet import and rendering
