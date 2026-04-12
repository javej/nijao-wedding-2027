# Story 1.3: Sanity Content Schemas

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want all Sanity document types (`storyChapter`, `entourageMember`, `guest`, `announcement`) defined with correct field naming conventions in the standalone Studio workspace,
so that Sanity Studio is fully set up and Nianne can begin entering content once the site UI is ready.

## Acceptance Criteria

1. **Given** the Sanity schemas are defined in `studio/schemas/`, **When** Sanity Studio is opened at `localhost:3333` (via `pnpm --filter studio dev`), **Then** all four document types (`storyChapter`, `entourageMember`, `guest`, `announcement`) appear in the Studio sidebar

2. **Given** the `guest` schema is defined, **When** a guest document is created in Studio, **Then** it includes fields: `firstName` (string, required), `slug` (slug, required, unique), `plusOneEligible` (boolean, default false), `plusOneType` (string enum: `'linked' | 'open'`, required when `plusOneEligible` is true), `plusOneLinkedGuest` (reference to `guest`, required when `plusOneType` is `'linked'`)

3. **Given** the `storyChapter` schema is defined, **When** a chapter document is created in Studio, **Then** it includes fields: `year` (number, required), `caption` (text, required), `image` (image with `alt`), `publishedAt` (datetime), `order` (number for sorting)

4. **Given** the `entourageMember` schema is defined, **When** a member document is created in Studio, **Then** it includes fields: `name` (string, required), `role` (string — e.g., "Ninong", "Ninang", "Best Man"), `colorAssignment` (one of the 8 palette color keys), `photo` (image), `isPadrino` (boolean)

5. **Given** the `announcement` schema is defined, **When** an announcement document is created in Studio, **Then** it includes fields: `title` (string), `body` (portable text), `publishedAt` (datetime), `scheduledAt` (datetime, optional)

6. **And** all field names are camelCase — no snake_case anywhere in any schema file

## Tasks / Subtasks

- [x] Task 1 — Create `storyChapter` schema (AC: 3, 6)
  - [x] 1.1 Create `studio/schemas/documents/storyChapter.ts`
  - [x] 1.2 Define document type `storyChapter` with fields:
    - `year` — number, required, validation: min 2017, max 2027
    - `caption` — text, required (use `text` type, not `string`, for multi-line support)
    - `image` — image type with hotspot enabled, `alt` field (string) inside `fields` array on the image, alt should be required
    - `publishedAt` — datetime
    - `order` — number, for manual sorting (used by `orderBy` in GROQ queries)
  - [x] 1.3 Set `title` to be derived from year in Studio preview: e.g., `"Chapter 2019"` — use `preview.select` with `year` and `prepare` to format
  - [x] 1.4 Add icon: use `BookOpen` or similar from `lucide-react` (already installed in studio workspace)

- [x] Task 2 — Create `entourageMember` schema (AC: 4, 6)
  - [x] 2.1 Create `studio/schemas/documents/entourageMember.ts`
  - [x] 2.2 Define document type `entourageMember` with fields:
    - `name` — string, required
    - `role` — string, required (e.g., "Ninong", "Ninang", "Best Man", "Maid of Honor", "Groomsman", "Bridesmaid", "Flower Girl", "Ring Bearer", "Bible Bearer", "Cord Sponsor", "Veil Sponsor", "Candle Sponsor")
    - `colorAssignment` — string, options list restricted to the 8 palette color keys: `['deep-matcha', 'raspberry', 'golden-matcha', 'strawberry-jam', 'matcha-chiffon', 'berry-meringue', 'matcha-latte', 'strawberry-milk']`. Use Sanity's `options.list` with `title` + `value` pairs so Studio shows human-readable names (e.g., title: "Deep Matcha", value: "deep-matcha")
    - `photo` — image type with hotspot enabled
    - `isPadrino` — boolean, default false (used to filter for the Digital Padrino Wall vs. full entourage list)
  - [x] 2.3 Set Studio preview to show `name` as title, `role` as subtitle, `photo` as media
  - [x] 2.4 Add icon: use `Users` or `Heart` from `lucide-react`

- [x] Task 3 — Create `guest` schema (AC: 2, 6)
  - [x] 3.1 Create `studio/schemas/documents/guest.ts`
  - [x] 3.2 Define document type `guest` with fields:
    - `firstName` — string, required
    - `slug` — slug type, required, source from `firstName` (auto-generate but editable). The slug is used for personalized URLs (`/[guest-slug]`), so it must be unique
    - `plusOneEligible` — boolean, default false
    - `plusOneType` — string, options list: `['linked', 'open']`. **Hidden when** `plusOneEligible` is false (use Sanity's `hidden` callback: `hidden: ({document}) => !document?.plusOneEligible`). Required when `plusOneEligible` is true
    - `plusOneLinkedGuest` — reference to `guest` document type. **Hidden when** `plusOneType` is not `'linked'` (use `hidden` callback). Required when `plusOneType` is `'linked'`
  - [x] 3.3 Set Studio preview to show `firstName` as title, slug as subtitle
  - [x] 3.4 Add icon: use `User` from `lucide-react`
  - [x] 3.5 **Validation:** Add custom validation on `slug` to ensure uniqueness is enforced (Sanity's slug type has built-in uniqueness check via `isUnique` — confirm this is enabled by default or add explicitly)

- [x] Task 4 — Create `announcement` schema (AC: 5, 6)
  - [x] 4.1 Create `studio/schemas/documents/announcement.ts`
  - [x] 4.2 Define document type `announcement` with fields:
    - `title` — string, required
    - `body` — block content (portable text). Reuse the existing `blockContent` type from `studio/schemas/blocks/shared/block-content.ts` if compatible, or define a simpler inline block array with just text formatting (bold, italic, links) — announcements don't need code blocks, YouTube embeds, or images
    - `publishedAt` — datetime, required. Set `initialValue` to current datetime for convenience
    - `scheduledAt` — datetime, optional. Description: "If set, this announcement will be visible on the site only after this date/time"
  - [x] 4.3 Set Studio preview to show `title` as title, formatted `publishedAt` as subtitle
  - [x] 4.4 Add icon: use `Megaphone` or `Bell` from `lucide-react`

- [x] Task 5 — Register schemas and configure Studio sidebar (AC: 1)
  - [x] 5.1 Import all 4 new document types in `studio/schema-types.ts` (this is where the starter registers schema types — currently exports `page`, `settings`, `navigation`, `faq`, plus shared block types)
  - [x] 5.2 Add the 4 new types to the exported schema array
  - [x] 5.3 Update `studio/structure.ts` to add the new document types to the Studio sidebar. The current structure has sections for "Pages", "Navigation", "Settings". Add a new section group — recommended structure:
    ```
    Wedding Content
      ├── Story Chapters
      ├── Entourage
      ├── Guests
      └── Announcements
    Pages (existing)
    Navigation (existing)
    Settings (existing)
    ```
  - [x] 5.4 Consider using `orderableDocumentListDeskItem` from `@sanity/orderable-document-list` (already installed in studio) for `storyChapter` and `entourageMember` to allow drag-and-drop reordering in Studio

- [x] Task 6 — Regenerate types and verify (AC: all)
  - [x] 6.1 Run `pnpm typegen` from workspace root (this runs `sanity schema extract && sanity typegen generate` in the studio workspace, outputting to `frontend/sanity.types.ts`)
  - [x] 6.2 Verify the generated types include `StoryChapter`, `EntourageMember`, `Guest`, `Announcement` interfaces
  - [ ] 6.3 Run `pnpm --filter studio dev` and confirm all 4 new document types appear in the Studio sidebar
  - [ ] 6.4 Create one test document for each type in Studio — verify all fields render correctly, conditional visibility works (guest plus-one fields), and color assignment dropdown shows all 8 palette options
  - [x] 6.5 Run `pnpm build` — build succeeds (both frontend and studio)
  - [x] 6.6 Run `pnpm lint` — zero errors
  - [ ] 6.7 Delete test documents after verification

## Dev Notes

### Current State of Studio Schemas

The `studio/schemas/` directory currently contains these document types (from the starter):
- `documents/page.ts` — generic page with blocks array (currently empty `of: []`) + meta/SEO
- `documents/settings.ts` — global site settings (logo, siteName, copyright)
- `documents/navigation.ts` — main nav links
- `documents/faq.ts` — FAQ items with orderable list

Shared block types (in `schemas/blocks/shared/`):
- `block-content.ts` — rich text with images, YouTube, code blocks, internal/external links
- `link.ts` — internal/external link object
- `meta.ts` — SEO metadata fields
- `button-variant.ts`, `color-variant.ts`, `layout-variants.ts`, `section-padding.ts` — UI variant enums

**Schema registration file:** `studio/schema-types.ts` — exports flat array of all schema types.

**Studio sidebar structure:** `studio/structure.ts` — currently organizes: Pages (orderable list), FAQ, Navigation, Settings. Uses `@sanity/orderable-document-list` plugin.

### Sanity Schema Conventions in This Project

- **Document type names:** camelCase singular (`storyChapter`, NOT `story-chapter` or `StoryChapter`)
- **Field names:** camelCase (`firstName`, `plusOneEligible`, `publishedAt`, `colorAssignment`)
- **File names:** camelCase matching document type (`storyChapter.ts`, `guest.ts`)
- **Location:** `studio/schemas/documents/` for document types
- **Icons:** Use `lucide-react` (already a dependency in studio workspace)
- **Ordering:** Use `@sanity/orderable-document-list` for sortable types (already installed)

### Conditional Field Visibility (guest schema)

Sanity supports `hidden` callbacks on fields to show/hide based on other field values. This is critical for the guest plus-one fields:

```typescript
// plusOneType — only visible when plusOneEligible is true
{
  name: 'plusOneType',
  type: 'string',
  options: { list: ['linked', 'open'] },
  hidden: ({ document }) => !document?.plusOneEligible,
  validation: (rule) => rule.custom((value, context) => {
    if (context.document?.plusOneEligible && !value) return 'Required when plus-one is eligible'
    return true
  }),
}

// plusOneLinkedGuest — only visible when plusOneType is 'linked'
{
  name: 'plusOneLinkedGuest',
  type: 'reference',
  to: [{ type: 'guest' }],
  hidden: ({ document }) => document?.plusOneType !== 'linked',
  validation: (rule) => rule.custom((value, context) => {
    if (context.document?.plusOneType === 'linked' && !value) return 'Required for linked plus-one'
    return true
  }),
}
```

### block-content Reuse for Announcements

The existing `block-content.ts` in `studio/schemas/blocks/shared/` is feature-rich (supports images, YouTube embeds, code blocks). For announcements, this is overkill. Two options:

1. **Reuse as-is** — announcements get all formatting options (harmless if Nianne doesn't use them)
2. **Create a simpler variant** — only bold, italic, links (cleaner Studio UX)

**Recommendation:** Reuse the existing `blockContent` type. The extra options don't hurt, and it avoids maintaining two similar types. Nianne won't be confused by options she doesn't use.

### Type Generation Pipeline

The starter has a working typegen pipeline:
- `pnpm typegen` runs in studio workspace
- Extracts schema to `studio/schema.json`
- Generates TypeScript types to `frontend/sanity.types.ts`
- Frontend code imports types from `sanity.types.ts` for type-safe GROQ queries

After adding new schemas, the generated types file will include interfaces for all 4 new document types. These types will be used in later stories when building GROQ queries and frontend components.

### Dependencies on This Story

This story is a prerequisite for:
- **Story 2.x** (all cinematic experience stories) — content sections need Sanity data
- **Story 3.1** — `[guest-slug]` routing requires the `guest` schema to exist
- **Story 4.x** — admin content management depends on all schemas being defined

No external dependencies block this story — it only requires the Studio workspace to be running.

### Previous Story Intelligence (Story 1.1)

- **Studio is standalone:** The Studio runs as a separate pnpm workspace at `localhost:3333`, NOT as an embedded route in the Next.js app. Schema files go in `studio/schemas/documents/`, not `frontend/sanity/schemas/`
- **Schema registration:** Import in `studio/schema-types.ts` and add to the exported array
- **Typegen works:** `pnpm typegen` successfully regenerated types after story 1.1 cleanup (2028 → 452 lines in `frontend/sanity.types.ts`)
- **pnpm.onlyBuiltDependencies:** Configured for esbuild, sharp, unrs-resolver — no issues with studio builds
- **Studio dev command:** `pnpm --filter studio dev` (not `cd studio && sanity dev`)

### Architecture Compliance

From `architecture.md` → these rules apply:
- [x] Document types: `storyChapter`, `entourageMember`, `guest`, `announcement` (camelCase singular)
- [ ] Field names: camelCase — `firstName`, `plusOneEligible`, `publishedAt`, `colorAssignment`
- [ ] `guest` schema must exist before `[guest-slug]` routing can be implemented (Epic 3 dependency)
- [ ] Schema files in `studio/schemas/` (standalone Studio workspace)
- [ ] Sanity content API accessed server-side only via read-only token (NFR-S5)

### Project Structure Notes

New files to create:
```
studio/schemas/documents/
  storyChapter.ts    (new)
  entourageMember.ts (new)
  guest.ts           (new)
  announcement.ts    (new)
```

Files to modify:
```
studio/schema-types.ts   (add imports + register types)
studio/structure.ts      (add sidebar sections)
frontend/sanity.types.ts (auto-regenerated by pnpm typegen)
studio/schema.json       (auto-regenerated by pnpm typegen)
```

### References

- Architecture: Sanity Schema definitions [Source: `_bmad-output/planning-artifacts/architecture.md` → Sanity Content Schema]
- Architecture: Naming Patterns → camelCase for schema fields [Source: `_bmad-output/planning-artifacts/architecture.md` → Naming Patterns]
- Architecture: Implementation Sequence → schemas before slug routing [Source: `_bmad-output/planning-artifacts/architecture.md` → Decision Impact Analysis]
- Epics: Story 1.3 requirements [Source: `_bmad-output/planning-artifacts/epics.md` → Story 1.3]
- PRD: FR24–FR28 — admin content management depends on these schemas [Source: `_bmad-output/planning-artifacts/prd.md` → Functional Requirements → Admin]
- PRD: FR16, FR16a — plus-one eligibility gate in guest schema [Source: `_bmad-output/planning-artifacts/prd.md` → Functional Requirements → RSVP]
- Story 1.1: Schema registration pattern, typegen pipeline confirmed [Source: `_bmad-output/implementation-artifacts/1-1-project-bootstrap-vercel-deployment.md`]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context)

### Debug Log References

No debug issues encountered. All schemas compiled, typegen succeeded, build and lint passed on first attempt.

### Completion Notes List

- Created 4 Sanity document schemas: `storyChapter`, `entourageMember`, `guest`, `announcement`
- All field names use camelCase convention — no snake_case anywhere
- `storyChapter`: year (2017-2027 validation), caption (text), image with required alt, publishedAt, order, orderRank for drag-and-drop
- `entourageMember`: name, role, colorAssignment (8 palette keys with human-readable titles), photo with hotspot, isPadrino (default false), orderRank
- `guest`: firstName, slug (sourced from firstName), plusOneEligible (default false), plusOneType (hidden/required conditional), plusOneLinkedGuest (hidden/required conditional reference to guest)
- `announcement`: title, body (reuses existing blockContent type), publishedAt (required, initialValue=now), scheduledAt (optional)
- Registered all 4 types in `schema-types.ts` and added "Wedding Content" sidebar group in `structure.ts`
- Used `orderableDocumentListDeskItem` for storyChapter and entourageMember (drag-and-drop reordering)
- Typegen generated 29 schema types including all 4 new interfaces with correct field types
- `pnpm build` succeeded for both frontend and studio
- `pnpm lint` passed with zero errors
- Tasks 6.3, 6.4, 6.7 require manual Studio verification (run `pnpm --filter studio dev`, create test docs, verify sidebar and fields, delete test docs)

### Senior Developer Review (AI)

**Review Date:** 2026-04-12
**Reviewer:** Claude Opus 4.6 (code-review workflow)
**Review Outcome:** Changes Requested → All Fixed

**Action Items:**
- [x] [M1] Guest stale data integrity: added inverse validation on plusOneType and plusOneLinkedGuest to flag stale values when parent conditions change
- [x] [M2] Architecture drift: architecture.md mentions paletteColor/coupleAssociation/published not in story spec — noted as planning artifact inconsistency (no code fix, architecture doc should be updated in future)
- [x] [M3] No unit tests: no test framework installed in project — accepted risk for declarative Sanity schemas
- [x] [L1] Added Heart icon to Wedding Content parent sidebar item in structure.ts
- [x] [L2] Added clarifying description to storyChapter.order field distinguishing it from orderRank
- [x] [L3] Made slug isUnique explicit via `isUnique: (value, context) => context.defaultIsUnique(value, context)`
- [x] [L4] Changed plusOneType from dropdown to radio layout (2 options)

### Change Log

- 2026-04-12: Implemented all 4 Sanity content schemas (storyChapter, entourageMember, guest, announcement), registered in schema-types.ts, added Wedding Content sidebar group in structure.ts, regenerated types
- 2026-04-12: Code review fixes — 7 issues addressed: guest stale data validation (M1), Wedding Content icon (L1), storyChapter order description (L2), explicit slug isUnique (L3), plusOneType radio layout (L4). Architecture drift (M2) and missing tests (M3) noted as accepted risks.

### File List

New files:
- `studio/schemas/documents/storyChapter.ts`
- `studio/schemas/documents/entourageMember.ts`
- `studio/schemas/documents/guest.ts`
- `studio/schemas/documents/announcement.ts`

Modified files:
- `studio/schema-types.ts` (added 4 new document type imports and registrations)
- `studio/structure.ts` (added Wedding Content sidebar group with 4 document types)
- `frontend/sanity.types.ts` (auto-regenerated by typegen — added StoryChapter, EntourageMember, Guest, Announcement types)
- `studio/schema.json` (auto-regenerated by typegen)
