# Story 2.2: Monogram Loader

Status: ready-for-dev

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

- [ ] Task 1: Install Framer Motion dependency (AC: 1)
  - [ ] 1.1 Run `pnpm --filter frontend add framer-motion`
  - [ ] 1.2 Verify Framer Motion is added to `frontend/package.json` and `pnpm-lock.yaml` is updated
  - [ ] 1.3 Verify `pnpm build` still passes — no bundle size regression concerns (Framer Motion tree-shakes well)

- [ ] Task 2: Create the `.jn` monogram SVG (AC: 5)
  - [ ] 2.1 Create or source the `.jn` ligature SVG path data — this must be the actual designed monogram, not a placeholder. The monogram is a stylized lowercase `.jn` mark
  - [ ] 2.2 The SVG must use `<path>` elements (not `<text>`) so Framer Motion can animate `pathLength`
  - [ ] 2.3 Store the SVG path data inline in the component or as a separate SVG file imported into the component
  - [ ] 2.4 SVG should use `stroke` (not `fill`) for the draw-on effect — the path draws itself via stroke-dashoffset animation
  - [ ] 2.5 Stroke color: use `--color-deep-matcha` (`#676930`) — the monogram chapter color per UX spec

- [ ] Task 3: Create MonogramLoader client component (AC: 1, 2, 3)
  - [ ] 3.1 Create `frontend/components/ui/MonogramLoader.tsx` with `'use client'` directive
  - [ ] 3.2 Full-screen overlay: `fixed inset-0 z-50` with dark/black background (the UX spec says "screen goes dark" before draw-on)
  - [ ] 3.3 Center the `.jn` SVG in the viewport using flexbox
  - [ ] 3.4 Animate SVG path using Framer Motion's `motion.path` with `pathLength` property:
    ```typescript
    // Framer Motion SVG draw-on pattern
    <motion.path
      d={monogramPath}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
    ```
  - [ ] 3.5 Total animation budget: **< 2 seconds** including draw-on + any fade. Aim for 1.5s draw-on + 0.3s hold + 0.2s fade-out
  - [ ] 3.6 After animation completes, fade out the entire loader overlay to reveal the content behind it
  - [ ] 3.7 Use `onAnimationComplete` callback or `AnimatePresence` to handle the exit transition
  - [ ] 3.8 After exit, the component should unmount or become `pointer-events: none` — it must not block scroll interaction

- [ ] Task 4: Implement reduced-motion fallback (AC: 4)
  - [ ] 4.1 Import `useReducedMotion` from `framer-motion` — this is the architecture-mandated pattern for all animated client components
  - [ ] 4.2 When `shouldReduceMotion` is true: render the monogram SVG with full pathLength (fully drawn), skip the draw-on animation entirely
  - [ ] 4.3 Loader exits immediately (or after a brief 300ms hold so the mark is still seen) — no fade animation
  - [ ] 4.4 Define Framer Motion variants **outside the component** to prevent re-renders (architecture pattern):
    ```typescript
    const pathVariants = {
      hidden: { pathLength: 0 },
      visible: { pathLength: 1, transition: { duration: 1.5, ease: "easeInOut" } },
      reduced: { pathLength: 1 },
    }
    ```

- [ ] Task 5: Wire into the page and manage loading state (AC: 2, 3)
  - [ ] 5.1 Add `<MonogramLoader>` to the main page — it renders as an overlay on top of the `<ChapterScrollContainer>` (from Story 2.1)
  - [ ] 5.2 The loader must render above all other content (`z-50` or higher)
  - [ ] 5.3 Manage loader state: track whether the animation has completed. Use local `useState` — no global state
  - [ ] 5.4 After loader exits, the scroll experience starts — the guest can begin scrolling through chapters
  - [ ] 5.5 Consider: should the scroll container be scroll-locked (overflow: hidden on body) until the loader exits? This prevents premature scrolling during the ceremony. Unlock after loader animation completes

- [ ] Task 6: Performance verification (AC: 1)
  - [ ] 6.1 Verify monogram animation begins within 1.5s of page load on simulated Philippine LTE (NFR-P6) — the SVG should be inline (not fetched), so it renders with the component hydration
  - [ ] 6.2 Check that no monogram code appears in the server-rendered HTML (RSC compliance)
  - [ ] 6.3 Run `pnpm build` — verify the MonogramLoader chunk is in the client bundle, not the server bundle
  - [ ] 6.4 Run `pnpm lint` — zero errors

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

### Debug Log References

### Completion Notes List

### File List
