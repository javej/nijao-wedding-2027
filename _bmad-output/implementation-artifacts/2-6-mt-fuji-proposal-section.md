# Story 2.6: Mt. Fuji Proposal Section

Status: ready-for-dev

## Story

As a **guest**,
I want to experience the Mt. Fuji proposal as a dedicated, emotionally distinct chapter in the scroll,
so that the emotional climax of the love story lands with the weight it deserves.

## Acceptance Criteria

1. **Given** the Mt. Fuji proposal section is defined as a dedicated content type or special `storyChapter` variant in Sanity, **When** it renders in the scroll sequence, **Then** it appears as a visually distinct chapter — differentiated from the year chapters by its layout, typography treatment, or palette accent — while remaining within the `<ChapterScrollContainer>` snap architecture

2. **Given** the proposal section content (photo, text) is managed in Sanity, **When** Nianne updates the text or image in Studio and publishes, **Then** the updated content appears on the static page after the next revalidation (for now: manual `pnpm build`; webhook ISR is Epic 4)

3. **Given** the guest is on a 375px viewport, **When** the proposal chapter snaps into view, **Then** the full chapter — image and text — is visible without horizontal scroll or truncated content

4. **And** the proposal chapter has a semantic heading that is accessible to screen readers and distinguishable from the year chapters in the document outline

## Tasks / Subtasks

- [ ] Task 1: Decide on Sanity content approach (AC: 1, 2)
  - [ ] 1.1 **Option A (recommended):** Use a `storyChapter` document with a special flag. Add an `isProposal` boolean field to the existing `storyChapter` schema in `studio/schemas/storyChapter.ts`. This avoids a new document type and keeps all story content in one list
  - [ ] 1.2 **Option B:** Create a separate `proposalSection` document type in Sanity. More separation but adds schema complexity
  - [ ] 1.3 Whichever approach: the proposal needs at minimum: `image` (the Mt. Fuji photo), `caption`/`text` (proposal narrative), and `publishedAt`
  - [ ] 1.4 If using Option A: update the GROQ query from Story 2.5 to differentiate proposal chapters from regular year chapters (filter by `isProposal`)

- [ ] Task 2: Create ProposalSection component (AC: 1, 3, 4)
  - [ ] 2.1 Create `frontend/components/sections/ProposalSection.tsx` as a **Server Component**
  - [ ] 2.2 Visual distinction from StoryChapter — this is the emotional climax. Differentiate through:
    - **Typography:** Larger display text, different weight (Cormorant Garamond weight 600 vs 300 for year chapters)
    - **Layout:** Consider a different image/text arrangement (e.g., full-bleed image with text overlay instead of image-above-caption)
    - **Palette accent:** Strawberry Jam (`--color-strawberry-jam`) — Chapter 4 color, distinct from Matcha Latte used by year chapters
  - [ ] 2.3 UX spec reference: "Full-screen section → blurred Fuji silhouette → 'She said yes.' + date → emotional climax; longer dwell time"
  - [ ] 2.4 Image: render via `next/image` + `urlFor()` — same pattern as StoryChapter
  - [ ] 2.5 The proposal text may be longer than a single caption — support portable text or multi-line text from Sanity
  - [ ] 2.6 Semantic: use `<h2>` for the proposal heading, distinguishable from year chapter headings (e.g., "The Proposal" or a poetic equivalent rather than a year number)

- [ ] Task 3: Create GROQ query for proposal content (AC: 2)
  - [ ] 3.1 If using the `isProposal` flag approach, add a separate query in `frontend/sanity/queries/storyChapters.ts`:
    ```groq
    *[_type == "storyChapter" && isProposal == true && defined(publishedAt)][0] {
      _id, caption, image, publishedAt
    }
    ```
  - [ ] 3.2 Update the year chapters query to exclude the proposal:
    ```groq
    *[_type == "storyChapter" && isProposal != true && defined(publishedAt)] | order(order asc)
    ```
  - [ ] 3.3 Export typed fetch function (e.g., `getProposalSection()`)

- [ ] Task 4: Update Sanity schema if needed (AC: 2)
  - [ ] 4.1 If using Option A: add `isProposal` boolean field (default: false) to `studio/schemas/storyChapter.ts`
  - [ ] 4.2 After schema change, regenerate Sanity types if the project uses type generation
  - [ ] 4.3 Verify existing storyChapter documents still work (no breaking change — new boolean defaults to false)

- [ ] Task 5: Wire into scroll sequence (AC: 1)
  - [ ] 5.1 In `frontend/app/(main)/page.tsx`, fetch proposal content alongside story chapters
  - [ ] 5.2 Position ProposalSection after the last year chapter (2027) and before Wedding Details (Story 2.7)
  - [ ] 5.3 Use `strawberry-jam` palette accent for the left-edge border
  - [ ] 5.4 Replace the "Proposal" placeholder from Story 2.1

- [ ] Task 6: Verification (AC: 1-4)
  - [ ] 6.1 Create a proposal document in Sanity Studio with image and text
  - [ ] 6.2 Verify it renders as visually distinct from year chapters
  - [ ] 6.3 Verify content updates in Studio reflect after rebuild
  - [ ] 6.4 Test 375px viewport — all content visible, no overflow
  - [ ] 6.5 Screen reader: verify `<h2>` is distinguishable from year headings
  - [ ] 6.6 Run `pnpm build` and `pnpm lint` — zero errors

## Dev Notes

### Architecture Compliance

- ProposalSection is a **Server Component** — same pattern as StoryChapter [Source: architecture.md → Component split]
- Image rendering: `next/image` + `urlFor()` [Source: architecture.md → Format Patterns]
- Sanity schema naming: camelCase fields (`isProposal`, not `is_proposal`) [Source: architecture.md → Naming Patterns]
- If modifying schema, update `studio/schemas/storyChapter.ts` — schemas live in the Studio workspace

### Key Technical Decisions

- **`isProposal` flag on storyChapter** is simpler than a new document type — keeps content management in one list for Nianne. She creates a "story chapter" and toggles isProposal for the special one
- **Visual distinction through design, not architecture** — same snap-scroll container, same rendering pipeline, but different visual treatment (typography, layout, palette)
- **Strawberry Jam accent** creates visual contrast against the Matcha Latte of regular chapters — signals "this is different" before the guest reads a word

### UX Context

- This is the **emotional climax** of the love story scroll — "guests feel the weight of the love story"
- UX spec: longer dwell time expected here — the design should invite pause, not rush
- "She said yes." is the emotional peak — the typography and negative space should give this line maximum impact
- Consider: the proposal image (Mt. Fuji) may benefit from a full-bleed treatment — edge-to-edge image with text overlay, unlike the image-then-caption pattern of year chapters

### Previous Story Dependencies

- **Story 1.3:** storyChapter Sanity schema exists
- **Story 2.1:** ChapterScrollContainer provides snap-scroll architecture
- **Story 2.5:** StoryChapter component and GROQ query established — proposal builds on this pattern but is visually distinct

### Project Structure Notes

New files:
```
frontend/components/sections/ProposalSection.tsx   (Server Component — proposal chapter)
```

Modified files:
```
frontend/sanity/queries/storyChapters.ts   (add proposal query, update year chapters query)
frontend/app/(main)/page.tsx               (fetch and render ProposalSection)
studio/schemas/storyChapter.ts             (add isProposal boolean field — if using Option A)
```

### What This Story Does NOT Do

- Does NOT implement scroll-triggered animations or parallax on the proposal image
- Does NOT implement the petal burst (that's the RSVP confirmation in Epic 3)
- Does NOT manage the proposal content — Nianne will add the photo and text via Studio

### References

- Architecture: Component split → content sections as Server Components [Source: `_bmad-output/planning-artifacts/architecture.md` → Frontend Architecture]
- Architecture: Sanity Naming → camelCase fields [Source: `_bmad-output/planning-artifacts/architecture.md` → Naming Patterns]
- UX Design: Experience Mechanics → "Full-screen section → blurred Fuji silhouette → She said yes." [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Experience Mechanics]
- UX Design: Critical Success Moments → "The Mt. Fuji chapter — emotional climax" [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Critical Success Moments]
- UX Design: Chapter Color Mapping → Proposal = Strawberry Jam [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Color System]
- Epics: Story 2.6 acceptance criteria [Source: `_bmad-output/planning-artifacts/epics.md` → Story 2.6]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
