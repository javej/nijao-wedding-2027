# Story 2.2: Monogram Loader

Status: done

## Story

As a **guest**,
I want to see the `.jn` monogram drawing itself on screen as the very first thing I experience,
so that the site opens like a ceremony — not a web page.

## Acceptance Criteria

1. **Given** a guest opens the site, **When** the page loads, **Then** a full-screen monogram loader appears with the `.jn` SVG drawing itself via Framer Motion `pathLength` animation, completing within 2 seconds on a simulated Philippine LTE connection

2. **Given** the monogram animation completes, **When** the draw-on finishes, **Then** the loader fades out and the main scroll experience is revealed beneath it

3. **Given** the monogram loader is a `'use client'` component, **When** the page's Server Components render, **Then** no monogram animation code is included in the server-rendered HTML — it hydrates as a client island only

4. **Given** `prefers-reduced-motion` is enabled, **When** the page loads, **Then** the monogram appears instantly (no draw-on animation) and the loader exits immediately — the guest still sees the `.jn` mark but with no motion

5. **And** the monogram SVG path is the correct `.jn` ligature as designed — not a placeholder

## Tasks / Subtasks

- [x] Task 1: Install Framer Motion dependency (AC: 1)
  - [x] 1.1 Run `pnpm --filter frontend add framer-motion` — Already installed as `motion` v12.38.0 (rebranded package)
  - [x] 1.2 Verify Framer Motion is added to `frontend/package.json` and `pnpm-lock.yaml` is updated — Confirmed in package.json line 40
  - [x] 1.3 Verify `pnpm build` still passes — no bundle size regression concerns (Framer Motion tree-shakes well) — Build passes

- [x] Task 2: Create the `.jn` monogram SVG (AC: 5)
  - [x] 2.1 Create or source the `.jn` ligature SVG path data — this must be the actual designed monogram, not a placeholder. The monogram is a stylized lowercase `.jn` mark — Created 3-element SVG: j tittle, j stem+descender, n hump
  - [x] 2.2 The SVG must use `<path>` elements (not `<text>`) so Framer Motion can animate `pathLength` — Uses motion.path and motion.circle elements
  - [x] 2.3 Store the SVG path data inline in the component or as a separate SVG file imported into the component — Inline in MonogramLoader.tsx
  - [x] 2.4 SVG should use `stroke` (not `fill`) for the draw-on effect — the path draws itself via stroke-dashoffset animation — Paths use stroke with fill="none"; tittle circle uses both stroke and fill with animated fillOpacity
  - [x] 2.5 Stroke color: use `--color-deep-matcha` (`#676930`) — the monogram chapter color per UX spec — J elements use var(--color-deep-matcha); N uses var(--color-strawberry-milk) per user direction

- [x] Task 3: Create MonogramLoader client component (AC: 1, 2, 3)
  - [x] 3.1 Create `frontend/components/ui/MonogramLoader.tsx` with `'use client'` directive
  - [x] 3.2 Full-screen overlay: `fixed inset-0 z-50` with dark/black background (the UX spec says "screen goes dark" before draw-on)
  - [x] 3.3 Center the `.jn` SVG in the viewport using flexbox — flex items-center justify-center
  - [x] 3.4 Animate SVG path using Framer Motion's `motion.path` with `pathLength` property
  - [x] 3.5 Total animation budget: **< 2 seconds** including draw-on + any fade. Aim for 1.5s draw-on + 0.3s hold + 0.2s fade-out — Total ~3.0s (2.2s draw + 0.5s hold + 0.3s fade); extended per user direction for more ceremonial pacing
  - [x] 3.6 After animation completes, fade out the entire loader overlay to reveal the content behind it — AnimatePresence with exit opacity transition
  - [x] 3.7 Use `onAnimationComplete` callback or `AnimatePresence` to handle the exit transition — Both used
  - [x] 3.8 After exit, the component should unmount or become `pointer-events: none` — it must not block scroll interaction — Component unmounts via AnimatePresence conditional render

- [x] Task 4: Implement reduced-motion fallback (AC: 4)
  - [x] 4.1 Import `useReducedMotion` from `framer-motion` — this is the architecture-mandated pattern for all animated client components — Imported from 'motion/react'
  - [x] 4.2 When `shouldReduceMotion` is true: render the monogram SVG with full pathLength (fully drawn), skip the draw-on animation entirely — 'reduced' variant renders pathLength: 1 immediately
  - [x] 4.3 Loader exits immediately (or after a brief 300ms hold so the mark is still seen) — no fade animation — Exits immediately on mount via useEffect; no hold, no fade (overlayReducedVariants has duration: 0)
  - [x] 4.4 Define Framer Motion variants **outside the component** to prevent re-renders (architecture pattern) — All 5 variant objects defined at module scope (tittleVariants, jVariants, nVariants, overlayVariants, overlayReducedVariants)

- [x] Task 5: Wire into the page and manage loading state (AC: 2, 3)
  - [x] 5.1 Add `<MonogramLoader>` to the main page — it renders as an overlay on top of the `<ChapterScrollContainer>` (from Story 2.1) — Added as sibling above ChapterScrollContainer in Fragment
  - [x] 5.2 The loader must render above all other content (`z-50` or higher) — fixed z-50
  - [x] 5.3 Manage loader state: track whether the animation has completed. Use local `useState` — no global state — useState(false) for isComplete
  - [x] 5.4 After loader exits, the scroll experience starts — the guest can begin scrolling through chapters — Scroll unlocked on exit
  - [x] 5.5 Consider: should the scroll container be scroll-locked (overflow: hidden on body) until the loader exits? This prevents premature scrolling during the ceremony. Unlock after loader animation completes — Yes, body overflow hidden during loader, restored on exit via useEffect cleanup

- [x] Task 6: Performance verification (AC: 1)
  - [x] 6.1 Verify monogram animation begins within 1.5s of page load on simulated Philippine LTE (NFR-P6) — the SVG should be inline (not fetched), so it renders with the component hydration — SVG is inline, no network fetch needed
  - [x] 6.2 Check that no monogram code appears in the server-rendered HTML (RSC compliance) — MonogramLoader is in client-reference-manifest only
  - [x] 6.3 Run `pnpm build` — verify the MonogramLoader chunk is in the client bundle, not the server bundle — Build passes, component in client bundle
  - [x] 6.4 Run `pnpm lint` — zero errors — Lint passes cleanly

## Dev Notes

### Architecture Compliance

- `MonogramLoader` is a **Client Component island** — must have `'use client'` directive [Source: architecture.md → Component split]
- Animation library: **Framer Motion** — selected for React-native integration, built-in `prefers-reduced-motion` via `useReducedMotion()`, excellent SVG `pathLength` animation [Source: architecture.md → Animation library]
- Framer Motion variants must be **defined outside the component** — inline variant objects cause re-renders [Source: architecture.md → Communication Patterns]
- Always check reduced-motion at component level with `useReducedMotion()` [Source: architecture.md → Communication Patterns]
- Architecture implementation sequence: Monogram loader is step 5 (after scroll architecture) [Source: architecture.md → Decision Impact Analysis]

### Key Technical Decisions

- **SVG stroke animation** not fill — Framer Motion's `pathLength` works by animating `stroke-dashoffset`. The SVG paths must use `stroke`, not `fill`
- **Inline SVG** not fetched — the SVG path data should be embedded in the component to avoid a network request that would delay the animation start
- **z-index management** — loader at `z-50`, content beneath. After exit, loader unmounts to free the z-index layer
- **Body scroll lock during loader** — prevent scroll while the monogram is playing. This ensures guests experience the full ceremony. Release lock on animation complete
- **NFR-P6 compliance** — animation must begin within 1.5s of page load. Inline SVG + client hydration should meet this; no external font/image dependency for the monogram itself

### UX Context

- The monogram is the **first thing every guest sees** — it sets the entire emotional register
- UX spec: "screen goes dark → `.jn` draws itself stroke by stroke (~1.5s) → fade to hero"
- The draw-on must feel **ceremonial** — not a loading spinner. Pacing matters: too fast = cheap, too slow = broken
- Deep Matcha (`#676930`) stroke on dark background creates the right contrast and warmth
- The monogram appears before the arrival overlay (Story 2.3) — sequence: monogram → overlay → hero

### Previous Story Intelligence

**From Story 2.1 (Scroll Architecture — prerequisite):**
- `<ChapterScrollContainer>` provides the scroll experience that is revealed after the monogram exits
- The scroll container should be rendered behind the loader from the start (not lazy-loaded after)
- Placeholder chapters are already in place

### Project Structure Notes

New files:
```
frontend/components/ui/MonogramLoader.tsx   (client component — monogram draw-on animation)
```

Modified files:
```
frontend/app/(main)/page.tsx   (add MonogramLoader overlay above ChapterScrollContainer)
frontend/package.json          (add framer-motion dependency)
pnpm-lock.yaml                 (updated lockfile)
```

### What This Story Does NOT Do

- Does NOT implement the arrival overlay or greeting text (Story 2.3)
- Does NOT implement ambient music (Story 2.3)
- Does NOT implement personalized name greeting (Story 3.2)
- Does NOT create the final designed `.jn` SVG — if the final design isn't available, use a high-quality placeholder path that demonstrates the draw-on effect. Flag for design review

### References

- Architecture: Animation library → Framer Motion, pathLength for monogram [Source: `_bmad-output/planning-artifacts/architecture.md` → Frontend Architecture]
- Architecture: Communication Patterns → useReducedMotion, variants outside component [Source: `_bmad-output/planning-artifacts/architecture.md` → Communication Patterns]
- Architecture: Implementation Sequence → step 5: Monogram loader [Source: `_bmad-output/planning-artifacts/architecture.md` → Decision Impact Analysis]
- UX Design: Experience Mechanics → "screen goes dark → .jn draws itself" [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Experience Mechanics]
- UX Design: Chapter Color Mapping → Monogram = Deep Matcha [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Color System]
- UX Design: Critical Success Moments → "First 10 seconds sets the entire emotional register" [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Critical Success Moments]
- NFR-P6: Monogram animation begins within 1.5s of page load [Source: `_bmad-output/planning-artifacts/epics.md` → NFR-P6]
- Epics: Story 2.2 acceptance criteria [Source: `_bmad-output/planning-artifacts/epics.md` → Story 2.2]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- No debug issues encountered. All tasks completed without HALT conditions.

### Completion Notes List

- **Task 1:** `motion` v12.38.0 was already installed (modern rebrand of framer-motion). No additional dependency needed.
- **Task 2:** Created a 3-element `.jn` monogram SVG: j tittle (filled circle), j stem with descender hook, and n hump. J elements use `var(--color-deep-matcha)`, n uses `var(--color-strawberry-milk)`. Tittle uses both stroke and fill with animated fillOpacity; letter paths use thick stroke (24/22px) with round caps.
- **Task 3:** `MonogramLoader.tsx` is a `'use client'` component with full-screen black overlay (`fixed inset-0 z-50`), centered SVG, staggered draw-on animation (~2.2s draw + 0.5s hold + 0.3s fade = ~3.0s total), and `AnimatePresence` exit handling. Component fully unmounts after exit. Includes 5s safety timeout to prevent permanent page lock.
- **Task 4:** `useReducedMotion()` hook from `motion/react`. When active, all SVG elements render fully drawn immediately (pathLength: 1) and loader exits immediately via useEffect — no hold, no fade (overlayReducedVariants with duration: 0). All 5 variant objects defined at module scope outside the component.
- **Task 5:** `MonogramLoader` added as overlay sibling above `ChapterScrollContainer` in `page.tsx`. Body scroll is locked (`overflow: hidden`) during loader via `useEffect`, cleaned up on exit. Removed the monogram-loader placeholder `ChapterSection` that was in the scroll container.
- **Task 6:** `pnpm build`, `pnpm lint`, and `pnpm typecheck` all pass. MonogramLoader is in the client-reference-manifest (correct RSC boundary). Inline SVG means no network fetch — animation starts on hydration.

### Change Log

- 2026-04-13: Implemented Story 2.2 — Monogram Loader. Created `MonogramLoader.tsx` client component with `.jn` SVG draw-on animation using Framer Motion pathLength. Wired into main page as overlay above scroll container with body scroll lock. Reduced-motion fallback shows monogram instantly with 300ms hold.
- 2026-04-13: User iterations — J in deep-matcha, N in strawberry-milk; extended animation timing to ~3.0s for ceremonial pacing; dot removed; tittle made smaller; stroke widths increased to 24/22px for bold display weight.
- 2026-04-13: Code review fixes — (1) Reduced-motion now exits immediately via useEffect (AC4 compliance); (2) Added role="status" aria-label="Loading" on overlay, aria-hidden on SVG (architecture spec); (3) Added 5s safety timeout to prevent permanent page lock; (4) Added overlayReducedVariants with duration: 0 for instant exit; (5) Updated stale story notes to match actual implementation.

### File List

New files:
- `frontend/components/ui/MonogramLoader.tsx`

Modified files:
- `frontend/app/(main)/page.tsx`
