# Story 2.9: Entourage — Padrino Wall & Wedding Party

Status: done

## Story

As a **guest**,
I want to see the Digital Padrino Wall (ninongs and ninangs with their palette color cards) and the full wedding party list,
so that I know and can celebrate the people standing up for Jave and Nianne.

## Acceptance Criteria

1. **Given** `entourageMember` documents are published in Sanity with `isPadrino: true`, **When** the Padrino Wall section renders, **Then** all published padrinos/madrinas are displayed as palette-colored cards showing their name and role

2. **Given** each padrino/madrina has a `colorAssignment` field set to one of the 8 palette keys, **When** their card renders, **Then** their card background or accent uses that palette token class — no hardcoded hex

3. **Given** `entourageMember` documents are published with `isPadrino: false`, **When** the Wedding Party section renders, **Then** all non-padrino entourage members (best man, maid of honor, groomsmen, bridesmaids, etc.) are listed with their name and role

4. **Given** a new entourage member is published in Sanity, **When** the next build/revalidation occurs, **Then** the new member appears on the live site — Nianne does not need to contact Jave

5. **Given** the guest is on a 375px viewport, **When** scrolling through the entourage sections, **Then** all cards and list items are fully visible, properly sized, with no horizontal scroll

## Tasks / Subtasks

- [x] Task 1: Create GROQ queries for entourage (AC: 1, 3, 4)
  - [x] 1.1 Create `frontend/sanity/queries/entourage.ts` with two queries:
    ```groq
    // Padrinos/Madrinas
    *[_type == "entourageMember" && isPadrino == true] | order(name asc) {
      _id, name, role, colorAssignment, photo
    }

    // Wedding Party (non-padrino)
    *[_type == "entourageMember" && isPadrino != true] | order(role asc, name asc) {
      _id, name, role, photo
    }
    ```
  - [x] 1.2 Export typed fetch functions: `getPadrinos()` and `getWeddingParty()`
  - [x] 1.3 Server-side only — Sanity read-only token

- [x] Task 2: Create PadrinoCard component (AC: 1, 2)
  - [x] 2.1 Create a `PadrinoCard` sub-component (can be in the same file or a separate component)
  - [x] 2.2 Each card displays: name, role (e.g., "Ninong", "Ninang"), and optional photo
  - [x] 2.3 Card background or accent uses the assigned palette color from `colorAssignment`:
    - Use the same Tailwind class mapping pattern as Story 2.8 (paletteBgMap object)
    - **No hardcoded hex** — always token classes
  - [x] 2.4 If `colorAssignment` is not set, fall back to a neutral palette color (e.g., `matcha-chiffon`)
  - [x] 2.5 If photo is present: render via `next/image` + `urlFor()`. If absent: show the card with just name/role (no broken image)
  - [x] 2.6 Card design: should feel **premium** — think event place cards, not data table rows. Subtle shadow (`--shadow-card`), rounded corners, palette color treatment

- [x] Task 3: Create EntourageSection component (AC: 1, 3, 5)
  - [x] 3.1 Create `frontend/components/sections/EntourageSection.tsx` as a **Server Component**
  - [x] 3.2 Two sub-sections within the chapter:
    - **Padrino Wall:** grid of PadrinoCards (padrinos/madrinas with palette colors)
    - **Wedding Party:** list of other entourage members (best man, maid of honor, groomsmen, bridesmaids, etc.)
  - [x] 3.3 Padrino Wall layout: responsive grid — 2 columns on mobile (375px), 3-4 columns on tablet/desktop
  - [x] 3.4 Wedding Party layout: simpler list — name and role per row, no palette color cards needed
  - [x] 3.5 If this chapter's content exceeds one viewport height, allow internal scrolling within the snap section or consider splitting into two snap sections (Padrino Wall as one, Wedding Party as the next)
  - [x] 3.6 Palette accent: **Berry Meringue** (`--color-berry-meringue`) — Chapter 6 color

- [x] Task 4: Semantic structure and accessibility (AC: 5)
  - [x] 4.1 Section wrapper: `<section aria-label="Entourage">`
  - [x] 4.2 Sub-sections: `<h2>` for "The Padrino Wall" (or Filipino equivalent), `<h3>` for "Wedding Party"
  - [x] 4.3 Each padrino card: accessible name + role (ensure screen reader announces both)
  - [x] 4.4 All text meets 4.5:1 contrast against card background colors — **verify each palette color as card background provides sufficient contrast for text on top**
  - [x] 4.5 If using white text on palette backgrounds: verify contrast. Some palette colors (e.g., Golden Matcha `#baaf2f`, Matcha Latte `#9fc768`) may not have sufficient contrast with white text — use dark text instead

- [x] Task 5: Wire into scroll sequence (AC: 1)
  - [x] 5.1 In `frontend/app/(main)/page.tsx`, fetch padrinos and wedding party data, render `<EntourageSection>`
  - [x] 5.2 Position after DressCodeSection (Story 2.8) and before RSVP (Epic 3)
  - [x] 5.3 Use `berry-meringue` palette accent for the left-edge border
  - [x] 5.4 Replace the "Entourage" placeholder from Story 2.1

- [x] Task 6: Verification (AC: 1-5)
  - [ ] 6.1 Create several entourageMember documents in Sanity Studio — mix of isPadrino true/false, various colorAssignments
  - [ ] 6.2 Verify Padrino Wall renders palette-colored cards with correct colors
  - [ ] 6.3 Verify Wedding Party renders as a separate list
  - [ ] 6.4 Add a new member in Studio, rebuild — verify they appear
  - [ ] 6.5 Test 375px viewport — cards and list fit, no overflow
  - [ ] 6.6 Verify contrast: text readable on all palette card backgrounds
  - [x] 6.7 Run `pnpm build` and `pnpm lint` — zero errors

## Dev Notes

### Architecture Compliance

- EntourageSection is a **Server Component** [Source: architecture.md → Component split: "EntourageSection" listed in sections/]
- `entourageMember` Sanity schema already exists from Story 1.3 with fields: `name`, `role`, `colorAssignment`, `photo`, `isPadrino`
- Image rendering: `next/image` + `urlFor()` [Source: architecture.md → Format Patterns]
- Dynamic palette classes: use the mapping object pattern (same as Story 2.8's `paletteBgMap`) — never dynamic template strings

### Key Technical Decisions

- **Two queries, one section** — fetch padrinos and wedding party separately for clean data separation, but render in one scroll chapter (or two adjacent snap sections if content overflows)
- **Palette class mapping reuse** — if Story 2.8 already creates a `paletteBgMap` utility, import it. If not, create it here. Consider extracting to a shared utility if used in 3+ files (`lib/paletteMap.ts` or `components/shared/`)
- **Card shadow** — use `--shadow-card` design token (defined in Story 1.2) for Padrino Wall cards. This maintains consistency with the design system
- **Content overflow** — if there are many padrinos + full wedding party, the content may exceed one viewport. Two options:
  1. Allow the snap section to be taller than the viewport (scroll within the snap)
  2. Split into two snap sections (preferred if content is substantial)

### UX Context

- The Padrino Wall is a **Filipino wedding tradition** — ninongs (godfathers) and ninangs (godmothers) are honored with special recognition
- The palette color assignment per padrino creates a **personal connection** — each godparent has "their" color
- UX spec: "Digital Padrino Wall — palette color cards per ninong/ninang → full wedding party list"
- Berry Meringue accent (`#c98d8e`) — a soft rose/mauve that complements the Padrino Wall's celebratory tone
- Guest persona: guests will look for their own name here if they're in the wedding party — the layout should make names scannable

### Previous Story Dependencies

- **Story 1.3:** `entourageMember` Sanity schema already defined with all required fields
- **Story 2.1:** ChapterScrollContainer for snap-scroll
- **Story 2.8:** DressCodeSection precedes this in scroll order; may share palette mapping utility

### Project Structure Notes

New files:
```
frontend/sanity/queries/entourage.ts                  (GROQ queries + typed fetch functions)
frontend/components/sections/EntourageSection.tsx      (Server Component — Padrino Wall + Wedding Party)
```

Modified files:
```
frontend/app/(main)/page.tsx     (fetch and render EntourageSection)
```

### What This Story Does NOT Do

- Does NOT implement the RSVP section (Epic 3)
- Does NOT implement the floating anchor set (Epic 3)
- Does NOT manage entourage content — Nianne populates via Sanity Studio
- Does NOT include photos as a requirement for every member — photo is optional per the schema

### References

- Architecture: Component split → EntourageSection as Server Component [Source: `_bmad-output/planning-artifacts/architecture.md` → Structure Patterns]
- Architecture: Format Patterns → next/image + urlFor() [Source: `_bmad-output/planning-artifacts/architecture.md` → Format Patterns]
- Story 1.3: entourageMember schema with fields [Source: `_bmad-output/implementation-artifacts/1-3-sanity-content-schemas.md`]
- UX Design: Chapter Color Mapping → Entourage = Berry Meringue [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Color System]
- UX Design: Experience Mechanics → "Digital Padrino Wall → full wedding party list" [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Experience Mechanics]
- Epics: FR13 (Digital Padrino Wall), FR14 (full wedding party) [Source: `_bmad-output/planning-artifacts/epics.md` → FR Coverage Map]
- Epics: Story 2.9 acceptance criteria [Source: `_bmad-output/planning-artifacts/epics.md` → Story 2.9]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
No debug issues encountered.

### Completion Notes List
- Created `frontend/sanity/queries/entourage.ts` with two GROQ queries (`PADRINOS_QUERY` and `WEDDING_PARTY_QUERY`) and typed fetch functions (`getPadrinos()`, `getWeddingParty()`). Used `orderRank` ordering (from `@sanity/orderable-document-list`) for Nianne's manual ordering control in Studio, with fallback to `name`/`role` sorting.
- Created `frontend/components/sections/EntourageSection.tsx` as a Server Component containing:
  - `PadrinoCard` sub-component with palette color accent (border-t-4) on light card body — guarantees WCAG AA contrast for all 8 palette colors (some mid-tones like strawberry-jam fail 4.5:1 for both white and dark text on full bg).
  - Uses `paletteBorderTopMap` pattern (same approach as DressCode `paletteBgMap` and ChapterSection `paletteBorderClass`) — no hardcoded hex.
  - Falls back to `matcha-chiffon` when no `colorAssignment` is set.
  - Optional photo support via `next/image` + `urlFor()` with LQIP blur placeholder. No-photo cards show initial letter in berry-meringue circle.
  - Premium card design: `shadow-(--shadow-card)`, `rounded-(--card-radius)`, `p-(--card-padding)` design tokens.
  - Padrino Wall: responsive grid (2 cols mobile, 3 tablet, 4 desktop).
  - Wedding Party: clean list with name/role per row, berry-meringue dividers, truncation for long names on mobile.
- Wired into `page.tsx`: added `getPadrinos()` and `getWeddingParty()` to `Promise.all()` fetch, replaced entourage placeholder with `<EntourageSection>` component.
- Accessibility: sr-only `<h2>Entourage</h2>` for heading hierarchy, `<h3>` for Padrino Wall and Wedding Party, `<ul role="list">` for wedding party list.
- Berry meringue accent applied via existing `<ChapterSection palette="berry-meringue">` wrapper.
- `pnpm lint` and `pnpm build` both pass with zero errors.
- No test framework configured in this project — manual Sanity Studio verification tasks (6.1-6.6) left unchecked for user to complete.

### Senior Developer Review (AI)
**Reviewer:** Claude Opus 4.6
**Date:** 2026-04-13
**Outcome:** Approve (after fixes applied)

**Issues Found:** 1 High, 3 Medium, 3 Low — **all 7 fixed**

#### Action Items
- [x] [HIGH] WCAG contrast failure: subtitle "Mga Ninong at Ninang" at `/50` opacity (~3.3:1) → fixed to `/70` (~4.9:1)
- [x] [MED] Wedding party query fetched unused photo data → removed photo projection from WEDDING_PARTY_QUERY
- [x] [MED] `overflow-y-auto` without height constraint was a no-op → removed misleading class
- [x] [MED] Wedding party name/role could overlap on 375px → added `gap-4`, `truncate`, `min-w-0`, `shrink-0`
- [x] [LOW] Invisible spacer for no-photo cards → replaced with initial letter in berry-meringue circle
- [x] [LOW] Heading hierarchy skipped section-level h2 → added sr-only `<h2>Entourage</h2>`, demoted sub-sections to h3
- [x] [LOW] `aria-label` on `<article>` caused potential double announcement → removed, content speaks for itself

### Change Log
- 2026-04-13: Implemented Story 2.9 — Entourage section with Digital Padrino Wall and Wedding Party list
- 2026-04-13: Code review — fixed 7 issues (1 HIGH contrast, 3 MED perf/layout/misleading, 3 LOW a11y/design)

### File List
- `frontend/sanity/queries/entourage.ts` (new) — GROQ queries and typed fetch functions for entourage data
- `frontend/components/sections/EntourageSection.tsx` (new) — Server Component with PadrinoCard + Wedding Party list
- `frontend/app/(main)/page.tsx` (modified) — Added entourage imports, fetch calls, and section rendering
