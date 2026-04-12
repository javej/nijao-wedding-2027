# Story 2.5: 10-Year Love Story Chapters

Status: ready-for-dev

## Story

As a **guest**,
I want to scroll through 10 story chapters — one per year from 2017 to 2027 — each with a photo and a single caption,
so that I feel the weight of a decade of love before I reach the wedding details.

## Acceptance Criteria

1. **Given** story chapters are defined as `storyChapter` documents in Sanity, **When** the page is statically generated, **Then** all published chapters are fetched server-side via GROQ and rendered as Server Components — no client-side Sanity fetch

2. **Given** chapters are ordered by the `order` field in Sanity, **When** the guest scrolls through the story, **Then** chapters appear in chronological order (2017 → 2027), each snapping into place within `<ChapterScrollContainer>`

3. **Given** each chapter has an image and a caption, **When** the chapter renders, **Then** the image is served via `next/image` (WebP, lazily loaded, correctly sized per breakpoint) and the caption displays in the display typeface

4. **Given** a chapter has no published image, **When** it renders, **Then** a palette-colored placeholder fills the image area gracefully — no broken image icon, no layout shift

5. **Given** the guest is on a 375px viewport, **When** scrolling through chapters, **Then** each chapter fills the full viewport with image and caption visible — no horizontal scroll, no truncated text

6. **And** each chapter heading (`<h2>` or semantic equivalent) is readable by screen readers and functions as a landmark for keyboard navigation

## Tasks / Subtasks

- [ ] Task 1: Create GROQ query for story chapters (AC: 1, 2)
  - [ ] 1.1 Create `frontend/sanity/queries/storyChapters.ts` — define the GROQ query:
    ```groq
    *[_type == "storyChapter" && defined(publishedAt)] | order(order asc) {
      _id, year, caption, image, order, publishedAt
    }
    ```
  - [ ] 1.2 Export a typed fetch function (e.g., `getStoryChapters()`) that executes the query using the Sanity client
  - [ ] 1.3 Define the TypeScript return type inline or import from generated Sanity types (`@/sanity/types`)
  - [ ] 1.4 The query fetches server-side only — no API credentials in browser. Use the existing Sanity client from `frontend/sanity/lib/client.ts`

- [ ] Task 2: Create StoryChapter section component (AC: 3, 5, 6)
  - [ ] 2.1 Create `frontend/components/sections/StoryChapter.tsx` as a **Server Component**
  - [ ] 2.2 Props: `year` (number), `caption` (string), `image` (Sanity image object or null), `index` (number for key/ordering)
  - [ ] 2.3 Layout: each chapter fills the full viewport height (`min-h-dvh`) within the scroll container
  - [ ] 2.4 Image: render via `next/image` with `urlFor()` from `@/sanity/lib/image` — WebP format, lazy loading, responsive sizes per breakpoint:
    - 375px: full-width image
    - 768px+: image with controlled max-width
  - [ ] 2.5 Caption: display in `font-display` (Cormorant Garamond), weight 300–400, size `--text-display-md` or `--text-body-lg`
  - [ ] 2.6 Year indicator: show the year (2017, 2018, etc.) as a subtle label — can be part of the heading or a standalone element
  - [ ] 2.7 Semantic structure: each chapter has an `<h2>` (e.g., the year or a descriptive heading) and a `<section>` wrapper with `aria-label`

- [ ] Task 3: Handle missing images gracefully (AC: 4)
  - [ ] 3.1 If `image` is null/undefined, render a palette-colored placeholder div instead of an image
  - [ ] 3.2 Use the chapter's palette accent color (Matcha Latte for story chapters) as the placeholder background
  - [ ] 3.3 Placeholder must occupy the same space as a real image — no layout shift (CLS < 0.1 per NFR-P2)
  - [ ] 3.4 Optionally display a subtle placeholder indicator (e.g., the year in large display type on the colored background)

- [ ] Task 4: Wire chapters into the page (AC: 1, 2)
  - [ ] 4.1 In `frontend/app/(main)/page.tsx`, call `getStoryChapters()` at the top level (Server Component data fetching)
  - [ ] 4.2 Map the chapters array into `<StoryChapter>` components inside the `<ChapterScrollContainer>`
  - [ ] 4.3 Position after the HeroSection (Story 2.4) and before the Proposal section (Story 2.6)
  - [ ] 4.4 Each chapter should use the `matcha-latte` palette accent (Chapter 3 = Story Scroll color)
  - [ ] 4.5 Replace the "Story" placeholder chapters from Story 2.1 with these real components

- [ ] Task 5: Image optimization (AC: 3)
  - [ ] 5.1 Configure `next/image` with the Sanity CDN hostname in `next.config.ts` `images.remotePatterns` (if not already configured by the starter)
  - [ ] 5.2 Use `urlFor(image).width(800).format('webp').url()` pattern for image URLs
  - [ ] 5.3 Set appropriate `sizes` attribute for responsive images:
    ```
    sizes="(max-width: 768px) 100vw, 800px"
    ```
  - [ ] 5.4 Use `loading="lazy"` for all story chapter images (they're below the fold)
  - [ ] 5.5 Provide `width` and `height` (or `fill` with aspect ratio container) to prevent CLS

- [ ] Task 6: Verification (AC: 1-6)
  - [ ] 6.1 Add test content: create 2-3 `storyChapter` documents in Sanity Studio with year, caption, image, and order
  - [ ] 6.2 Verify chapters render in correct order (by `order` field)
  - [ ] 6.3 Verify images load via next/image (check Network tab for WebP format)
  - [ ] 6.4 Test missing image: create a chapter without an image — verify placeholder renders, no layout shift
  - [ ] 6.5 Test 375px viewport — each chapter fills viewport, no overflow
  - [ ] 6.6 Screen reader test: verify `<h2>` headings are announced for each chapter
  - [ ] 6.7 View page source: all chapter content in initial HTML (SSG verification)
  - [ ] 6.8 Run `pnpm build` and `pnpm lint` — zero errors

## Dev Notes

### Architecture Compliance

- StoryChapter is a **Server Component** — fetches data via GROQ at build time, renders in initial HTML [Source: architecture.md → "all content sections are Server Components"]
- Data fetching: server-side GROQ query using Sanity client with read-only token (NFR-S5) [Source: architecture.md → Communication Patterns]
- Image rendering: always `next/image` + `urlFor()` — never raw `<img>` or hardcoded CDN URLs [Source: architecture.md → Format Patterns]
- File location: `frontend/components/sections/StoryChapter.tsx` (PascalCase, sections directory) [Source: architecture.md → Structure Patterns]
- GROQ queries in `frontend/sanity/queries/` directory [Source: architecture.md → Structure Patterns]
- Sanity schema `storyChapter` already exists from Story 1.3 with fields: `year`, `caption`, `image` (with `alt`), `publishedAt`, `order`

### Key Technical Decisions

- **One component, 10 instances** — a single `StoryChapter` component rendered once per Sanity document, not 10 separate components
- **Server-side data fetch in page.tsx** — the page (Server Component) fetches all chapters and passes them as props to the StoryChapter components. Never fetch inside a client component
- **Lazy image loading** — all story images are below the fold (hero is first chapter). Use `loading="lazy"` and let the browser handle viewport-based loading
- **`urlFor()` from `@/sanity/lib/image`** — use the existing Sanity image helper, not raw URL construction
- **Sanity image CDN** — images served from Sanity's CDN at `cdn.sanity.io`. Ensure this hostname is in Next.js `images.remotePatterns` config

### UX Context

- The love story is the **emotional core** — "one image, one sentence per year — restraint lets the story breathe"
- UX spec: "Each scroll gesture advances one chapter → image + one-sentence caption appears → left-edge accent color shifts"
- The constraint of one image + one caption per chapter is deliberate — density is the enemy of luxury. Don't add extra content or decorative elements
- The Matcha Latte accent color applies to all 10 story chapters — they share a section identity
- Chapters build toward the Mt. Fuji proposal (Story 2.6) — the emotional crescendo

### Previous Story Dependencies

- **Story 1.3:** Sanity `storyChapter` schema already defined with required fields
- **Story 2.1:** ChapterScrollContainer provides the snap-scroll architecture
- **Story 2.4:** HeroSection is positioned before story chapters in the scroll sequence

### Project Structure Notes

New files:
```
frontend/sanity/queries/storyChapters.ts          (GROQ query + typed fetch function)
frontend/components/sections/StoryChapter.tsx      (Server Component — single chapter)
```

Modified files:
```
frontend/app/(main)/page.tsx     (fetch chapters, render StoryChapter components in scroll container)
frontend/next.config.ts          (add Sanity CDN to images.remotePatterns if not present)
```

### What This Story Does NOT Do

- Does NOT create the Mt. Fuji proposal section (Story 2.6 — separate, visually distinct chapter)
- Does NOT implement chapter entry animations — CSS-first transitions may be added in Story 2.10 accessibility pass
- Does NOT implement parallax or scroll-based image effects — keep it simple and performant
- Does NOT manage Sanity content — assumes chapters will be populated via Studio

### References

- Architecture: Data Architecture → Sanity GROQ, server-side only [Source: `_bmad-output/planning-artifacts/architecture.md` → Data Architecture]
- Architecture: Format Patterns → next/image + urlFor() [Source: `_bmad-output/planning-artifacts/architecture.md` → Format Patterns]
- Architecture: Communication Patterns → fetch on server, pass as props [Source: `_bmad-output/planning-artifacts/architecture.md` → Communication Patterns]
- Architecture: Structure Patterns → sections/ and sanity/queries/ directories [Source: `_bmad-output/planning-artifacts/architecture.md` → Structure Patterns]
- UX Design: "One image + one caption per unit — the constraint forces quality" [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Visual Patterns]
- UX Design: Chapter Color Mapping → Story Scroll = Matcha Latte [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Color System]
- Story 1.3: Sanity storyChapter schema [Source: `_bmad-output/implementation-artifacts/1-3-sanity-content-schemas.md`]
- NFR-P2: CLS < 0.1 [Source: `_bmad-output/planning-artifacts/epics.md` → NFR-P2]
- NFR-S5: Sanity API server-side only [Source: `_bmad-output/planning-artifacts/epics.md` → NFR-S5]
- Epics: Story 2.5 acceptance criteria [Source: `_bmad-output/planning-artifacts/epics.md` → Story 2.5]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
