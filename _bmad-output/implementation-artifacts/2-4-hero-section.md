# Story 2.4: Hero Section

Status: ready-for-dev

## Story

As a **guest**,
I want to see the hero section with the "Ten years. One more day." tagline as the first content chapter after the arrival overlay,
so that the emotional core of the story is anchored before anything else.

## Acceptance Criteria

1. **Given** the arrival overlay has been dismissed, **When** the first chapter snaps into view, **Then** the hero section displays the couple's names, the tagline *"Ten years. One more day."*, and the wedding date in the display typeface

2. **Given** the hero section is a Server Component, **When** the page is statically generated, **Then** hero content is rendered in the initial HTML — no client-side fetch required for this section

3. **Given** the guest is on a 375px viewport, **When** the hero section renders, **Then** all text fits within the viewport, is legible (minimum 16px body, larger for display text), and no content is clipped

4. **And** all hero text meets WCAG 2.1 AA contrast ratio (4.5:1 minimum) against its background using the defined palette tokens

## Tasks / Subtasks

- [ ] Task 1: Create the sections directory and HeroSection component (AC: 1, 2)
  - [ ] 1.1 Create directory `frontend/components/sections/` — this is the architecture-specified location for full-viewport RSC section components
  - [ ] 1.2 Create `frontend/components/sections/HeroSection.tsx` as a **Server Component** (no `'use client'` directive)
  - [ ] 1.3 Component renders:
    - Couple's names: "Jave & Nianne" (or styled variant) in display typeface (`font-display`, Cormorant Garamond)
    - Tagline: *"Ten years. One more day."* in display typeface, prominent size (`--text-display-xl`)
    - Wedding date: "January 8, 2027" in display or body typeface
  - [ ] 1.4 Content can be hardcoded for now — these are core identity elements unlikely to change. If Sanity content is preferred, create a `heroSettings` singleton or use an existing settings document
  - [ ] 1.5 Layout: center all content vertically and horizontally within the chapter frame. Use generous negative space — the hero should breathe

- [ ] Task 2: Apply palette and typography tokens (AC: 1, 4)
  - [ ] 2.1 Hero section palette accent: **Raspberry** (`border-raspberry`) — Chapter 2 in the UX color mapping
  - [ ] 2.2 Display text: use `font-display` (Cormorant Garamond), weight 300 or 400 for the tagline, weight 600 for the couple's names
  - [ ] 2.3 Text color: use token-based classes (`text-text-on-light` or equivalent from the design token system) — verify 4.5:1 contrast against the background
  - [ ] 2.4 Background: warm off-white (`bg-background` / `#faf9f6`) or a palette-tinted treatment
  - [ ] 2.5 **No hardcoded hex values** — all colors via Tailwind token classes
  - [ ] 2.6 Verify contrast: Raspberry text on off-white background? Or off-white text on Raspberry background? Choose the combination that passes WCAG AA and feels right. Test with a contrast checker

- [ ] Task 3: Responsive design (AC: 3)
  - [ ] 3.1 Mobile-first at 390px, minimum 375px (iPhone SE)
  - [ ] 3.2 Use `clamp()`-based type scale tokens for responsive text sizing — already defined in globals.css from Story 1.2:
    - `--text-display-xl: clamp(2.5rem, 6vw, 5rem)` for the tagline
    - `--text-display-lg: clamp(1.75rem, 4vw, 3rem)` for names
  - [ ] 3.3 Ensure no text falls below 16px on mobile (NFR-A5)
  - [ ] 3.4 Test: all text visible and legible at 375px with no clipping or horizontal scroll

- [ ] Task 4: Semantic structure and accessibility (AC: 4)
  - [ ] 4.1 Use `<section>` with an appropriate `aria-label` (e.g., "Hero")
  - [ ] 4.2 The couple's names or tagline should be the `<h1>` — this is the site's primary heading. Only one `<h1>` per page
  - [ ] 4.3 Remaining hero text uses appropriate heading or paragraph elements
  - [ ] 4.4 Ensure heading hierarchy is correct: `<h1>` here, `<h2>` for subsequent chapter headings (Story 2.5+)

- [ ] Task 5: Wire into ChapterScrollContainer (AC: 1)
  - [ ] 5.1 In `frontend/app/(main)/page.tsx`, replace the "Hero" placeholder chapter (from Story 2.1) with the `<HeroSection>` component
  - [ ] 5.2 The hero section sits inside the ChapterScrollContainer as the first content chapter
  - [ ] 5.3 Ensure the hero chapter uses the `raspberry` palette prop for the left-edge accent

- [ ] Task 6: Verification (AC: 1-4)
  - [ ] 6.1 Visual check: hero displays correctly with names, tagline, date in display typeface
  - [ ] 6.2 Verify SSG: view page source — hero content should be in the initial HTML
  - [ ] 6.3 Verify 375px: all text visible, legible, no overflow
  - [ ] 6.4 Verify contrast: all text meets 4.5:1 against background
  - [ ] 6.5 Run `pnpm build` and `pnpm lint` — zero errors

## Dev Notes

### Architecture Compliance

- HeroSection is a **Server Component** — no `'use client'` directive, no useState, no useEffect [Source: architecture.md → Component split: "all content sections are Server Components"]
- File location: `frontend/components/sections/HeroSection.tsx` — PascalCase, in the `sections/` directory [Source: architecture.md → Structure Patterns]
- The `sections/` directory is for full-viewport section components rendered as RSC. This is the first section component created — establishing the pattern for Stories 2.5–2.9
- No Sanity fetch required for hero content (hardcoded is acceptable for core identity text) — but if fetching, use server-side GROQ only

### Key Technical Decisions

- **Hardcoded hero content** — the couple's names, tagline, and date are core identity. They won't change through Sanity. Hardcoding avoids unnecessary CMS dependency and ensures the hero renders even during Sanity outages (aligns with NFR-R3 spirit)
- **`<h1>` placement** — the hero gets the page's only `<h1>`. All subsequent chapters use `<h2>`. This establishes the document outline
- **Display typeface sizing** — use the `clamp()`-based tokens from Story 1.2 rather than fixed pixel values. This handles responsive sizing without media queries

### UX Context

- The hero is the **emotional anchor** — "Ten years. One more day." is the thesis statement of the entire site
- UX spec: "Full-screen venue image → tagline fades in → arrival overlay" — the hero may eventually include a background image, but the text is the priority. If no image is available, the pure typography + palette treatment is sufficient and elegant
- Raspberry is the hero's chapter color — it's also `--color-primary`, the single cross-chapter CTA color
- Negative space is critical — the hero should feel like a title card, not a busy landing page

### Previous Story Dependencies

- **Story 2.1:** ChapterScrollContainer must be in place — hero renders inside it as the first chapter
- **Story 2.2:** MonogramLoader fades out to reveal content — hero is the first thing visible after overlay
- **Story 2.3:** ArrivalOverlay sits on top initially — hero content is visible only after overlay dismisses
- **Story 1.2:** Design tokens (fonts, colors, type scale) must be in place

### Project Structure Notes

New files:
```
frontend/components/sections/HeroSection.tsx   (Server Component — hero content)
frontend/components/sections/                   (new directory — first section component)
```

Modified files:
```
frontend/app/(main)/page.tsx   (replace hero placeholder with HeroSection)
```

### What This Story Does NOT Do

- Does NOT add a hero background image — text-only for now; image can be added later
- Does NOT fetch content from Sanity — hardcoded hero text
- Does NOT implement any entry animation — hero appears statically (animations could be added but are not in the AC)
- Does NOT implement the personalized greeting — that's the arrival overlay (Story 2.3) + personalization (Story 3.2)

### References

- Architecture: Component split → content sections as Server Components [Source: `_bmad-output/planning-artifacts/architecture.md` → Frontend Architecture]
- Architecture: Structure Patterns → `components/sections/` directory [Source: `_bmad-output/planning-artifacts/architecture.md` → Structure Patterns]
- UX Design: Chapter Color Mapping → Hero = Raspberry [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Color System]
- UX Design: Experience Mechanics → hero = "Ten years. One more day." + wedding date [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Experience Mechanics]
- UX Design: Typography → Cormorant Garamond display, clamp-based scale [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Typography System]
- NFR-A2: 4.5:1 contrast ratio [Source: `_bmad-output/planning-artifacts/epics.md` → NFR-A2]
- NFR-A5: No text below 16px on mobile [Source: `_bmad-output/planning-artifacts/epics.md` → NFR-A5]
- Epics: Story 2.4 acceptance criteria [Source: `_bmad-output/planning-artifacts/epics.md` → Story 2.4]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
