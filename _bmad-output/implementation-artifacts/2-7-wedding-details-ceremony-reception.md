# Story 2.7: Wedding Details — Ceremony & Reception

Status: ready-for-dev

## Story

As a **guest**,
I want to read clear ceremony and reception details in their own scroll chapter,
so that I know exactly when to be where, without asking the couple.

## Acceptance Criteria

1. **Given** ceremony details (church name: St. Therese Parish, date: January 8 2027, time, location) are defined in Sanity, **When** the Wedding Details chapter renders, **Then** all ceremony details are displayed clearly in the scroll chapter

2. **Given** reception details (venue: Casa 10 22, Lipa Batangas, date, time, address) are defined in Sanity, **When** the Wedding Details chapter renders, **Then** all reception details are displayed in the same chapter, visually distinct from the ceremony block

3. **Given** the content is managed in Sanity, **When** Nianne updates any detail field and publishes, **Then** the change is reflected on the next build/revalidation — no code change required

4. **Given** the guest is on a 375px viewport, **When** the Wedding Details chapter snaps into view, **Then** all details are fully readable with no truncation or horizontal scroll

5. **And** the chapter has a semantic structure (`<h2>` for section, `<h3>` for ceremony/reception sub-sections) navigable by screen readers and keyboard

## Tasks / Subtasks

- [ ] Task 1: Create Sanity schema for wedding details (AC: 1, 2, 3)
  - [ ] 1.1 Create `studio/schemas/weddingDetails.ts` — a **singleton** document type (only one instance needed)
  - [ ] 1.2 Schema fields:
    ```
    weddingDetails {
      // Ceremony
      ceremonyVenue: string (required) — e.g., "St. Therese Parish"
      ceremonyDate: date (required) — January 8, 2027
      ceremonyTime: string (required) — e.g., "2:00 PM"
      ceremonyAddress: text — full address
      ceremonyMapUrl: url — optional Google Maps link

      // Reception
      receptionVenue: string (required) — e.g., "Casa 10 22"
      receptionDate: date (required)
      receptionTime: string (required)
      receptionAddress: text (required) — "Lipa, Batangas" + full address
      receptionMapUrl: url — optional Google Maps link

      // General
      publishedAt: datetime
    }
    ```
  - [ ] 1.3 All field names camelCase — no snake_case [Source: architecture.md → Naming Patterns]
  - [ ] 1.4 Register the schema in the Studio schema index (e.g., `studio/schemas/index.ts`)
  - [ ] 1.5 Configure as a singleton in Studio — only one weddingDetails document should exist. Use Sanity's `structure` builder to pin it in the sidebar

- [ ] Task 2: Create GROQ query for wedding details (AC: 1, 2)
  - [ ] 2.1 Create `frontend/sanity/queries/weddingDetails.ts`:
    ```groq
    *[_type == "weddingDetails"][0] {
      ceremonyVenue, ceremonyDate, ceremonyTime, ceremonyAddress, ceremonyMapUrl,
      receptionVenue, receptionDate, receptionTime, receptionAddress, receptionMapUrl
    }
    ```
  - [ ] 2.2 Export typed fetch function (e.g., `getWeddingDetails()`)
  - [ ] 2.3 Server-side only — read-only Sanity token

- [ ] Task 3: Create WeddingDetails section component (AC: 1, 2, 4, 5)
  - [ ] 3.1 Create `frontend/components/sections/WeddingDetails.tsx` as a **Server Component**
  - [ ] 3.2 Two visually distinct blocks within the chapter:
    - **Ceremony block:** church name, date, time, address
    - **Reception block:** venue name, date, time, address
  - [ ] 3.3 Typography: use `font-display` (Cormorant Garamond) for venue names and headings; `font-body` (DM Sans) for date/time/address details
  - [ ] 3.4 Date formatting: use `Intl.DateTimeFormat('en-PH', { dateStyle: 'long' })` — never `.toString()` [Source: architecture.md → Format Patterns]
  - [ ] 3.5 Layout: both blocks within the same scroll chapter (`min-h-dvh`). Stack vertically on mobile, can be side-by-side on desktop (768px+)
  - [ ] 3.6 Palette accent: **Matcha Chiffon** (`--color-matcha-chiffon`) — Chapter 5 color
  - [ ] 3.7 Visual distinction between blocks: use subtle divider, different background tint, or spacing to clearly separate ceremony from reception

- [ ] Task 4: Semantic structure and accessibility (AC: 5)
  - [ ] 4.1 Wrapper: `<section aria-label="Wedding Details">`
  - [ ] 4.2 Section heading: `<h2>` — "Wedding Details" or equivalent
  - [ ] 4.3 Sub-headings: `<h3>` for "Ceremony" and `<h3>` for "Reception"
  - [ ] 4.4 Address text: wrap in `<address>` element for semantic correctness
  - [ ] 4.5 All text meets 4.5:1 contrast against background

- [ ] Task 5: Wire into scroll sequence (AC: 1)
  - [ ] 5.1 In `frontend/app/(main)/page.tsx`, fetch wedding details and render `<WeddingDetails>` inside ChapterScrollContainer
  - [ ] 5.2 Position after ProposalSection (Story 2.6) and before Dress Code (Story 2.8)
  - [ ] 5.3 Use `matcha-chiffon` palette accent for the left-edge border
  - [ ] 5.4 Replace the "Wedding Details" placeholder from Story 2.1

- [ ] Task 6: Handle missing content gracefully (AC: 3)
  - [ ] 6.1 If the weddingDetails document doesn't exist in Sanity yet, render a tasteful placeholder or skip the section — no error, no crash
  - [ ] 6.2 If individual fields are empty, omit them gracefully (e.g., if no map URL, don't render a broken link)

- [ ] Task 7: Verification (AC: 1-5)
  - [ ] 7.1 Create a weddingDetails document in Sanity Studio with ceremony and reception details
  - [ ] 7.2 Verify both blocks render with correct content
  - [ ] 7.3 Update a field in Studio, rebuild — verify change reflected
  - [ ] 7.4 Test 375px viewport — all details readable, no overflow
  - [ ] 7.5 Screen reader: verify heading hierarchy (h2 → h3)
  - [ ] 7.6 Run `pnpm build` and `pnpm lint` — zero errors

## Dev Notes

### Architecture Compliance

- WeddingDetails is a **Server Component** — GROQ fetch, SSG [Source: architecture.md → Component split]
- New Sanity schema required: `weddingDetails` — singleton document type [Source: not in original Story 1.3 schemas — new for this story]
- Schema field names: camelCase [Source: architecture.md → Naming Patterns]
- Date formatting: `Intl.DateTimeFormat('en-PH')` [Source: architecture.md → Format Patterns]
- Image/format patterns apply if venue images are added later

### Key Technical Decisions

- **Singleton Sanity document** — only one weddingDetails document, pinned in Studio sidebar. Nianne sees it as a dedicated section, not a list
- **New schema type needed** — Story 1.3 created storyChapter, entourageMember, guest, announcement. Wedding details was not included. This story adds the weddingDetails type
- **Both blocks in one scroll chapter** — ceremony and reception are on the same screen (stacked). They're logically one "chapter" in the scroll. If content is too long for one viewport, allow internal scroll within the chapter or split across two snap sections
- **No map embed** — just a link to Google Maps if provided. Embedding a map adds complexity and third-party dependencies. A clean link is sufficient

### UX Context

- UX spec: "Ceremony block → reception block → dress code → floating anchor set activates"
- Guest persona Kuya Mark: "Logistics clarity (venue, hotel, itinerary)" — this section must be **unambiguous**. No creative copy that obscures the facts
- The tone shifts here from emotional (love story) to informational (logistics) — typography and layout should reflect this: still beautiful, but prioritizing clarity
- Matcha Chiffon is a softer, neutral green — appropriate for an informational section that should feel calm and clear

### Previous Story Dependencies

- **Story 2.1:** ChapterScrollContainer for snap-scroll
- **Story 2.6:** ProposalSection precedes this in scroll order
- **Story 1.3:** Sanity schema infrastructure in place (but weddingDetails type needs to be added)

### Project Structure Notes

New files:
```
studio/schemas/weddingDetails.ts                      (Sanity singleton schema)
frontend/sanity/queries/weddingDetails.ts             (GROQ query + typed fetch)
frontend/components/sections/WeddingDetails.tsx       (Server Component)
```

Modified files:
```
studio/schemas/index.ts          (register weddingDetails schema)
frontend/app/(main)/page.tsx     (fetch and render WeddingDetails)
```

### What This Story Does NOT Do

- Does NOT embed Google Maps — optional link only
- Does NOT include hotel/accommodation information (not in PRD scope)
- Does NOT implement the dress code section (Story 2.8 — separate chapter)
- Does NOT implement webhook ISR for live updates (Epic 4)

### References

- Architecture: Data Architecture → Sanity GROQ, server-side only [Source: `_bmad-output/planning-artifacts/architecture.md` → Data Architecture]
- Architecture: Format Patterns → Intl.DateTimeFormat for dates [Source: `_bmad-output/planning-artifacts/architecture.md` → Format Patterns]
- Architecture: Naming Patterns → camelCase Sanity fields [Source: `_bmad-output/planning-artifacts/architecture.md` → Naming Patterns]
- UX Design: Experience Mechanics → "Ceremony block → reception block" [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Experience Mechanics]
- UX Design: Chapter Color Mapping → Wedding Details = Matcha Chiffon [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Color System]
- UX Design: User Personas → Kuya Mark needs logistics clarity [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Target Users]
- Epics: Story 2.7 acceptance criteria [Source: `_bmad-output/planning-artifacts/epics.md` → Story 2.7]
- Epics: FR10 (ceremony details), FR11 (reception details) [Source: `_bmad-output/planning-artifacts/epics.md` → FR Coverage Map]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
