# Story 1.3: Sanity Content Schemas

Status: ready-for-dev

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

- [ ] Task 1 — Create `storyChapter` schema (AC: 3, 6)
  - [ ] 1.1 Create `studio/schemas/documents/storyChapter.ts`
  - [ ] 1.2 Define document type `storyChapter` with fields:
    - `year` — number, required, validation: min 2017, max 2027
    - `caption` — text, required (use `text` type, not `string`, for multi-line support)
    - `image` — image type with hotspot enabled, `alt` field (string) inside `fields` array on the image, alt should be required
    - `publishedAt` — datetime
    - `order` — number, for manual sorting (used by `orderBy` in GROQ queries)
  - [ ] 1.3 Set `title` to be derived from year in Studio preview: e.g., `"Chapter 2019"` — use `preview.select` with `year` and `prepare` to format
  - [ ] 1.4 Add icon: use `BookOpen` or similar from `lucide-react` (already installed in studio workspace)

- [ ] Task 2 — Create `entourageMember` schema (AC: 4, 6)
  - [ ] 2.1 Create `studio/schemas/documents/entourageMember.ts`
  - [ ] 2.2 Define document type `entourageMember` with fields:
    - `name` — string, required
    - `role` — string, required (e.g., "Ninong", "Ninang", "Best Man", "Maid of Honor", "Groomsman", "Bridesmaid", "Flower Girl", "Ring Bearer", "Bible Bearer", "Cord Sponsor", "Veil Sponsor", "Candle Sponsor")
    - `colorAssignment` — string, options list restricted to the 8 palette color keys: `['deep-matcha', 'raspberry', 'golden-matcha', 'strawberry-jam', 'matcha-chiffon', 'berry-meringue', 'matcha-latte', 'strawberry-milk']`. Use Sanity's `options.list` with `title` + `value` pairs so Studio shows human-readable names (e.g., title: "Deep Matcha", value: "deep-matcha")
    - `photo` — image type with hotspot enabled
    - `isPadrino` — boolean, default false (used to filter for the Digital Padrino Wall vs. full entourage list)
  - [ ] 2.3 Set Studio preview to show `name` as title, `role` as subtitle, `photo` as media
  - [ ] 2.4 Add icon: use `Users` or `Heart` from `lucide-react`

- [ ] Task 3 — Create `guest` schema (AC: 2, 6)
  - [ ] 3.1 Create `studio/schemas/documents/guest.ts`
  - [ ] 3.2 Define document type `guest` with fields:
    - `firstName` — string, required
    - `slug` — slug type, required, source from `firstName` (auto-generate but editable). The slug is used for personalized URLs (`/[guest-slug]`), so it must be unique
    - `plusOneEligible` — boolean, default false
    - `plusOneType` — string, options list: `['linked', 'open']`. **Hidden when** `plusOneEligible` is false (use Sanity's `hidden` callback: `hidden: ({document}) => !document?.plusOneEligible`). Required when `plusOneEligible` is true
    - `plusOneLinkedGuest` — reference to `guest` document type. **Hidden when** `plusOneType` is not `'linked'` (use `hidden` callback). Required when `plusOneType` is `'linked'`
  - [ ] 3.3 Set Studio preview to show `firstName` as title, slug as subtitle
  - [ ] 3.4 Add icon: use `User` from `lucide-react`
  - [ ] 3.5 **Validation:** Add custom validation on `slug` to ensure uniqueness is enforced (Sanity's slug type has built-in uniqueness check via `isUnique` — confirm this is enabled by default or add explicitly)

- [ ] Task 4 — Create `announcement` schema (AC: 5, 6)
  - [ ] 4.1 Create `studio/schemas/documents/announcement.ts`
  - [ ] 4.2 Define document type `announcement` with fields:
    - `title` — string, required
    - `body` — block content (portable text). Reuse the existing `blockContent` type from `studio/schemas/blocks/shared/block-content.ts` if compatible, or define a simpler inline block array with just text formatting (bold, italic, links) — announcements don't need code blocks, YouTube embeds, or images
    - `publishedAt` — datetime, required. Set `initialValue` to current datetime for convenience
    - `scheduledAt` — datetime, optional. Description: "If set, this announcement will be visible on the site only after this date/time"
  - [ ] 4.3 Set Studio preview to show `title` as title, formatted `publishedAt` as subtitle
  - [ ] 4.4 Add icon: use `Megaphone` or `Bell` from `lucide-react`

- [ ] Task 5 — Register schemas and configure Studio sidebar (AC: 1)
  - [ ] 5.1 Import all 4 new document types in `studio/schema-types.ts` (this is where the starter registers schema types — currently exports `page`, `settings`, `navigation`, `faq`, plus shared block types)
  - [ ] 5.2 Add the 4 new types to the exported schema array
  - [ ] 5.3 Update `studio/structure.ts` to add the new document types to the Studio sidebar. The current structure has sections for "Pages", "Navigation", "Settings". Add a new section group — recommended structure:
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
  - [ ] 5.4 Consider using `orderableDocumentListDeskItem` from `@sanity/orderable-document-list` (already installed in studio) for `storyChapter` and `entourageMember` to allow drag-and-drop reordering in Studio

- [ ] Task 6 — Regenerate types and verify (AC: all)
  - [ ] 6.1 Run `pnpm typegen` from workspace root (this runs `sanity schema extract && sanity typegen generate` in the studio workspace, outputting to `frontend/sanity.types.ts`)
  - [ ] 6.2 Verify the generated types include `StoryChapter`, `EntourageMember`, `Guest`, `Announcement` interfaces
  - [ ] 6.3 Run `pnpm --filter studio dev` and confirm all 4 new document types appear in the Studio sidebar
  - [ ] 6.4 Create one test document for each type in Studio — verify all fields render correctly, conditional visibility works (guest plus-one fields), and color assignment dropdown shows all 8 palette options
  - [ ] 6.5 Run `pnpm build` — build succeeds (both frontend and studio)
  - [ ] 6.6 Run `pnpm lint` — zero errors
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

### Debug Log References

### Completion Notes List

### File List
