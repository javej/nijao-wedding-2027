# Story 2.8: Dress Code Section

Status: ready-for-dev

## Story

As a **guest**,
I want to see the dress code presented using the wedding palette,
so that I know what to wear and feel confident about it — without sending the couple a message.

## Acceptance Criteria

1. **Given** dress code content (dress code label, palette guidance, any specific notes) is defined in Sanity, **When** the Dress Code chapter renders, **Then** the dress code instruction is displayed with the relevant palette color swatches or cards as visual references

2. **Given** the dress code uses palette color tokens, **When** the palette card renders, **Then** colors are rendered via Tailwind token classes — no hardcoded hex values

3. **Given** the guest is on a 375px viewport, **When** the Dress Code chapter snaps into view, **Then** all palette cards and text are fully visible with no horizontal scroll

4. **Given** the Sanity dress code content schema includes an optional `inspirationImages` array field (image type with `alt`), **When** Nianne adds curated dress inspiration photos through Studio, **Then** the UI renders them if present, gracefully omits them if the array is empty — no code change required when she populates it

5. **And** color-dependent dress code guidance includes a text label alongside any color swatch (e.g., *"Deep Matcha — a dark green"*) so guests with color vision differences are not excluded

## Tasks / Subtasks

- [ ] Task 1: Create Sanity schema for dress code (AC: 1, 4)
  - [ ] 1.1 Create `studio/schemas/dressCode.ts` — a **singleton** document type (one instance)
  - [ ] 1.2 Schema fields:
    ```
    dressCode {
      label: string (required) — e.g., "Semi-Formal" or "Formal Filipiniana"
      description: text or portableText — dress code guidance and notes
      paletteColors: array of objects — each with:
        colorKey: string (one of 8 palette keys: deep-matcha, raspberry, etc.)
        colorLabel: string — human-readable description (e.g., "Deep Matcha — a dark green")
      inspirationImages: array of image (with alt) — optional curated inspiration photos
      additionalNotes: text — optional additional guidance
      publishedAt: datetime
    }
    ```
  - [ ] 1.3 All field names camelCase [Source: architecture.md → Naming Patterns]
  - [ ] 1.4 Register in Studio schema index
  - [ ] 1.5 Configure as singleton in Studio sidebar (same pattern as weddingDetails from Story 2.7)

- [ ] Task 2: Create GROQ query (AC: 1)
  - [ ] 2.1 Create `frontend/sanity/queries/dressCode.ts`:
    ```groq
    *[_type == "dressCode"][0] {
      label, description, paletteColors, inspirationImages, additionalNotes
    }
    ```
  - [ ] 2.2 Export typed fetch function (e.g., `getDressCode()`)

- [ ] Task 3: Create DressCodeSection component (AC: 1, 2, 3, 5)
  - [ ] 3.1 Create `frontend/components/sections/DressCodeSection.tsx` as a **Server Component**
  - [ ] 3.2 Display dress code label prominently in display typeface (Cormorant Garamond)
  - [ ] 3.3 Render palette color swatches/cards:
    - Each swatch: a colored rectangle using Tailwind token class (e.g., `bg-deep-matcha`) — **no hardcoded hex**
    - Below or beside each swatch: text label (e.g., "Deep Matcha — a dark green") for accessibility (AC: 5)
    - Use `cn()` for dynamic className based on `colorKey`
  - [ ] 3.4 Layout palette cards: grid or flex wrap. On mobile (375px): 2 columns of swatches. On desktop: 4 columns
  - [ ] 3.5 Render description/notes in body typeface (DM Sans)
  - [ ] 3.6 Palette accent: **Matcha Chiffon** (`--color-matcha-chiffon`) — same as Wedding Details (both are in the "logistics" section of the scroll)

- [ ] Task 4: Handle optional inspiration images (AC: 4)
  - [ ] 4.1 If `inspirationImages` array is non-empty: render a curated image gallery within the chapter
  - [ ] 4.2 Images via `next/image` + `urlFor()` — WebP, lazy loaded, responsive sizes
  - [ ] 4.3 If array is empty or null: gracefully omit the gallery section — no placeholder, no empty space, no error
  - [ ] 4.4 Each image must have `alt` text from Sanity for accessibility

- [ ] Task 5: Accessibility for color vision (AC: 5)
  - [ ] 5.1 Every color swatch MUST have an adjacent text label describing the color — relying on color alone violates WCAG
  - [ ] 5.2 Text labels should describe the color in plain language: "Deep Matcha — a dark green", "Raspberry — a deep rose", "Strawberry Milk — a soft pink"
  - [ ] 5.3 These labels come from Sanity (`paletteColors[].colorLabel`) so Nianne can customize them
  - [ ] 5.4 Swatch + label should be perceivable as a unit (group them visually and semantically)

- [ ] Task 6: Wire into scroll sequence (AC: 1)
  - [ ] 6.1 In `frontend/app/(main)/page.tsx`, fetch dress code content and render `<DressCodeSection>` inside ChapterScrollContainer
  - [ ] 6.2 Position after WeddingDetails (Story 2.7) and before Entourage (Story 2.9)
  - [ ] 6.3 Use `matcha-chiffon` palette accent for left-edge border
  - [ ] 6.4 Replace the "Dress Code" placeholder from Story 2.1

- [ ] Task 7: Handle missing content (AC: 1)
  - [ ] 7.1 If dressCode document doesn't exist in Sanity yet: render gracefully (skip section or show placeholder)
  - [ ] 7.2 If paletteColors array is empty: still show the label and description, just without swatches

- [ ] Task 8: Verification (AC: 1-5)
  - [ ] 8.1 Create a dressCode document in Sanity Studio with label, palette colors with labels, and optional description
  - [ ] 8.2 Verify swatches render with correct palette token classes — inspect to confirm no hardcoded hex
  - [ ] 8.3 Verify text labels alongside every swatch
  - [ ] 8.4 Add inspiration images via Studio — verify they appear. Remove them — verify graceful absence
  - [ ] 8.5 Test 375px viewport — cards and text fit, no overflow
  - [ ] 8.6 Run `pnpm build` and `pnpm lint` — zero errors

## Dev Notes

### Architecture Compliance

- DressCodeSection is a **Server Component** [Source: architecture.md → Component split]
- New Sanity schema required: `dressCode` singleton [Source: not in Story 1.3 — new for this story]
- Image rendering: `next/image` + `urlFor()` for inspiration images [Source: architecture.md → Format Patterns]
- Dynamic className from colorKey: use `cn()` with a mapping object, NOT template literals with dynamic Tailwind classes (Tailwind purges dynamic classes)

### Key Technical Decisions

- **Tailwind dynamic class mapping** — Tailwind CSS purges classes not found in source at build time. You CANNOT use `bg-${colorKey}` dynamically. Instead, create a mapping object:
  ```typescript
  const paletteBgMap: Record<string, string> = {
    'deep-matcha': 'bg-deep-matcha',
    'raspberry': 'bg-raspberry',
    'golden-matcha': 'bg-golden-matcha',
    'strawberry-jam': 'bg-strawberry-jam',
    'matcha-chiffon': 'bg-matcha-chiffon',
    'berry-meringue': 'bg-berry-meringue',
    'matcha-latte': 'bg-matcha-latte',
    'strawberry-milk': 'bg-strawberry-milk',
  }
  ```
  This ensures all classes are present in source code for Tailwind's scanner to find. **This is critical — dynamic template string classes will be purged in production builds.**
- **Singleton schema** — same pattern as weddingDetails (Story 2.7). One dress code document, pinned in Studio sidebar
- **Color labels from CMS** — not hardcoded in the component. Nianne can refine the descriptions (e.g., "think sage, not neon green") without a code change

### UX Context

- The dress code section is a **confidence builder** — guests should leave knowing exactly what to wear
- Palette cards are both informational AND aesthetic — they showcase the wedding color scheme
- The text labels are not just accessibility compliance — they help all guests understand the palette intent (not everyone knows what "Deep Matcha" looks like)
- UX spec positions this in the "logistics" sequence: ceremony → reception → dress code
- Guest persona Ate Karen: opens via Viber, commuting — the dress code must be scannable in seconds

### Previous Story Dependencies

- **Story 1.2:** Design tokens (palette colors) in place
- **Story 2.1:** ChapterScrollContainer for snap-scroll
- **Story 2.7:** WeddingDetails precedes this in scroll order and establishes the singleton Sanity schema pattern

### Project Structure Notes

New files:
```
studio/schemas/dressCode.ts                         (Sanity singleton schema)
frontend/sanity/queries/dressCode.ts                (GROQ query + typed fetch)
frontend/components/sections/DressCodeSection.tsx   (Server Component)
```

Modified files:
```
studio/schemas/index.ts          (register dressCode schema)
frontend/app/(main)/page.tsx     (fetch and render DressCodeSection)
```

### What This Story Does NOT Do

- Does NOT implement the entourage section (Story 2.9)
- Does NOT include dress code for specific roles (bridesmaids, groomsmen) — that's entourage management
- Does NOT implement webhook ISR for live updates (Epic 4)

### References

- Architecture: Naming Patterns → camelCase Sanity fields [Source: `_bmad-output/planning-artifacts/architecture.md` → Naming Patterns]
- Architecture: Format Patterns → next/image + urlFor() [Source: `_bmad-output/planning-artifacts/architecture.md` → Format Patterns]
- Architecture: CSS/Tailwind → cn(), no hardcoded hex [Source: `_bmad-output/planning-artifacts/architecture.md` → Naming Patterns]
- UX Design: Chapter Color Mapping → Wedding Details/Dress Code = Matcha Chiffon [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Color System]
- UX Design: Emotional Design → "Confidence — I know exactly what to do" [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Emotional Journey Mapping]
- NFR-A2: 4.5:1 contrast ratio [Source: `_bmad-output/planning-artifacts/epics.md` → NFR-A2]
- Epics: Story 2.8 acceptance criteria [Source: `_bmad-output/planning-artifacts/epics.md` → Story 2.8]
- Epics: FR12 (dress code guidance in wedding palette) [Source: `_bmad-output/planning-artifacts/epics.md` → FR Coverage Map]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
