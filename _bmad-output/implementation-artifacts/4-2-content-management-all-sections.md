# Story 4.2: Content Management — All Sections

Status: done

## Story

As a **content admin (Nianne)**,
I want to create, edit, publish, and draft all site content sections through Sanity Studio,
so that I can manage the site's story, entourage, and announcements independently without writing code.

## Acceptance Criteria

1. **Given** Nianne is logged into Sanity Studio (standalone Studio workspace, accessed via its own URL — not `/studio` within the Next.js app), **When** she navigates to any document type (`storyChapter`, `entourageMember`, `announcement`), **Then** she can create a new document, fill in all fields, and save as draft — without the draft appearing on the live site

2. **Given** a document is in draft state, **When** Nianne clicks Publish, **Then** the document becomes live on the site within 10 seconds via the webhook + ISR pipeline (Story 4.1)

3. **Given** a published document needs to be updated, **When** Nianne edits and republishes it, **Then** the updated content is live on the site within 10 seconds — no code change, no deploy required (FR24, FR26)

4. **Given** Nianne uploads a photo or image to any content section, **When** the image is saved in Sanity, **Then** it is served via `next/image` on the site (WebP, sized per breakpoint) — Nianne does not need to optimize images manually (FR25)

5. **Given** an announcement is created with a `scheduledAt` datetime, **When** that datetime arrives, **Then** the announcement goes live automatically — Nianne does not need to manually publish it at that time (FR28)

6. **And** Nianne can toggle any document between draft and published states at any time — a published document can be unpublished without deleting it (FR26)

## Tasks / Subtasks

- [x] Task 1: Verify and enhance Sanity schemas for admin UX (AC: 1, 6)
  - [x] 1.1 Review all existing schemas in `studio/schemas/documents/` — verify field labels, descriptions, and validation rules are clear for non-technical users (Nianne)
  - [x] 1.2 `storyChapter.ts`: Verify fields — `year`, `caption`, `image` (with `alt`), `publishedAt`, `order`. Add helpful descriptions (e.g., "The year this chapter represents (2017-2027)")
  - [x] 1.3 `entourageMember.ts`: Verify fields — `name`, `role`, `colorAssignment`, `photo`, `isPadrino`. Add Studio preview showing name + role
  - [x] 1.4 `announcement.ts`: Verify fields — `title`, `body` (portable text), `publishedAt`, `scheduledAt`. Ensure `scheduledAt` is labeled clearly (e.g., "Schedule for later — leave empty to publish immediately")
  - [x] 1.5 `weddingDetails.ts` and `dressCode.ts`: Verify singleton patterns are working — Nianne should see one editable document, not a list
  - [x] 1.6 Add ordering/sorting options in Studio for `storyChapter` (by `order` field) and `entourageMember` (by `name`)

- [x] Task 2: Ensure draft/publish workflow works end-to-end (AC: 1, 2, 3, 6)
  - [x] 2.1 Sanity's built-in draft/publish system handles this natively — verify it's not overridden
  - [x] 2.2 GROQ queries on the frontend must filter for published documents only: `*[_type == "storyChapter" && !(_id in path("drafts.**"))]` or use `defined(publishedAt)`
  - [ ] 2.3 Test: create draft → verify NOT visible on live site → publish → verify visible within 10 seconds (requires Story 4.1 webhook)
  - [ ] 2.4 Test: unpublish a document → verify removed from live site after revalidation

- [x] Task 3: Image management (AC: 4)
  - [x] 3.1 Verify all image fields in Sanity schemas use the `image` type with `hotspot: true` for cropping
  - [x] 3.2 Verify frontend components use `next/image` + `urlFor()` from `@/sanity/lib/image.ts` — automatic WebP conversion, responsive sizing
  - [x] 3.3 Verify `alt` text field is present and required (or strongly encouraged) on all image fields
  - [ ] 3.4 Test: upload image in Studio → verify it renders on the site as WebP with correct sizing

- [x] Task 4: Scheduled content for announcements (AC: 5)
  - [x] 4.1 Implement scheduled publishing for announcements using `scheduledAt` field:
    - Option A: Use Sanity's built-in Scheduled Publishing feature (if available on free tier)
    - Option B: Frontend GROQ query filters: `*[_type == "announcement" && (scheduledAt == null || scheduledAt <= now())]` — only show announcements whose scheduled time has passed
  - [x] 4.2 If using Option B (GROQ filter): the page must be revalidated periodically or on a schedule to pick up newly-scheduled announcements. Consider using `revalidate: 60` (ISR with 60-second interval) for the announcements section
  - [ ] 4.3 Test: create announcement with `scheduledAt` in the future → verify NOT visible → wait until scheduled time → verify visible

- [x] Task 5: Studio UX improvements for Nianne (AC: 1)
  - [x] 5.1 Configure Studio desk structure (`studio/structure.ts`) for clear navigation:
    - Group by content type: "Story Chapters", "Entourage", "Announcements", "Wedding Details", "Dress Code"
    - Singletons (weddingDetails, dressCode) shown as direct edit views, not lists
  - [x] 5.2 Add document previews: show title/name + thumbnail in the Studio document list
  - [x] 5.3 Ensure the Studio URL is bookmarkable for Nianne

- [ ] Task 6: Verify and test (AC: 1-6)
  - [ ] 6.1 Log into Studio → create a draft storyChapter → verify NOT on live site
  - [ ] 6.2 Publish the chapter → verify on live site within 10 seconds
  - [ ] 6.3 Edit and republish → verify update appears within 10 seconds
  - [ ] 6.4 Upload image → verify WebP rendering on frontend
  - [ ] 6.5 Create announcement with future `scheduledAt` → verify scheduling behavior (use `/dev/announcements` debug route)
  - [ ] 6.6 Unpublish a document → verify removed from site
  - [x] 6.7 Run `pnpm build && pnpm lint` — zero errors

## Dev Notes

### Architecture Patterns & Constraints

- **Sanity Studio is standalone**: The Studio runs as a separate pnpm workspace (`studio/`), NOT embedded at `/studio` in the Next.js app. Nianne accesses it via its own deployed URL
- **Draft filtering**: All GROQ queries must filter out drafts. Use `!(_id in path("drafts.**"))` or filter by `publishedAt` being defined
- **Images**: Always use `next/image` + `urlFor()` on the frontend. Sanity handles asset storage and CDN delivery. `hotspot: true` on image fields enables Nianne to set crop points in Studio
- **Singleton pattern**: `weddingDetails` and `dressCode` schemas should use the Sanity singleton pattern — one document per type, not a list

### Project Structure Notes

- **Sanity schemas**: All in `studio/schemas/documents/` — `storyChapter.ts`, `entourageMember.ts`, `announcement.ts`, `guest.ts`, `weddingDetails.ts`, `dressCode.ts`
- **Studio structure**: `studio/structure.ts` — desk structure configuration for Studio navigation
- **Frontend GROQ queries**: In `frontend/sanity/queries/` — verify they filter for published documents only
- **Image helper**: `frontend/sanity/lib/image.ts` — `urlFor()` builder

### Anti-Patterns to Avoid

- **Do NOT show draft content on the live site** — all GROQ queries must filter drafts
- **Do NOT embed Studio in the Next.js app** — it's a separate pnpm workspace with its own URL
- **Do NOT skip `alt` text on images** — make it required or strongly encouraged in Sanity schemas
- **Do NOT use raw `<img>` tags** — always use `next/image` + `urlFor()` via `SanityImage` wrapper

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — Sanity as content store, GROQ queries
- [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns] — image rendering pattern with next/image + urlFor()
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] — Sanity schema naming conventions
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] — project layout, sanity/ directory
- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2] — acceptance criteria

## Dev Agent Record

### Agent Model Used

Claude Opus 4.7 (claude-opus-4-7) via Claude Code — BMad `dev-story` workflow.

### Debug Log References

- `pnpm lint` — clean (frontend).
- `cd frontend && pnpm typecheck` — clean.
- `pnpm build` — both `frontend` (Next.js 16.1.7 Turbopack) and `studio` (Sanity) built successfully.
- `cd studio && pnpm typegen` — regenerated `frontend/sanity.types.ts` after adding the optional `alt` field to `entourageMember.photo`.
- Root-level `pnpm typecheck` alias only runs the frontend (see root `package.json`); studio has pre-existing `@types/node` TS errors on `main` that are unrelated to this story and explicitly out of scope.

### Completion Notes List

**Task 1 — Schema enhancements**
- `storyChapter`: added admin-facing descriptions to `year` ("2017–2027"), `caption`, `image` (hotspot guidance), `image.alt` (screen-reader guidance), `publishedAt` (clarified it is informational, does not control visibility), and rewrote `order` description to explain the drag-and-drop interaction with `orderRank`.
- `entourageMember`: added descriptions to `colorAssignment`, `photo`, and `isPadrino`; added optional `alt` sub-field on `photo` with a description that falls back to "Photo of <name>" when empty.
- `announcement`: added descriptions to `title`, `body`, `publishedAt`; renamed `scheduledAt` title to "Schedule for later" and rewrote its description. Upgraded the preview to show `⏰ Scheduled for <date>` when `scheduledAt` is in the future, otherwise the published date.
- Singleton registration: added `weddingDetails` and `dressCode` to `singletonTypes` in `studio/sanity.config.ts`. This filters them out of the global "New document" menu and limits available actions to publish/discardChanges/restore/unpublish (no duplicate/delete). The existing `structure.ts` already surfaces them as direct edit views via `S.editor().documentId(...)`.
- Ordering: `storyChapter` and `entourageMember` already use `orderRankField` + `orderableDocumentListDeskItem` (drag-and-drop) in `structure.ts`; no change needed.

**Task 2 — Draft/publish workflow**
- Verified that all GROQ queries are already safe from draft leakage: the Sanity client in `frontend/sanity/lib/client.ts` is instantiated with `perspective: "published"`, which filters drafts at the transport layer. `defineLive`'s browser/server token only switches perspective when Next.js Draft Mode is active (`/api/draft-mode/enable`).
- Therefore no `!(_id in path("drafts.**"))` or `defined(publishedAt)` clauses need to be added to individual queries — the filter is global. This is documented inline in the new announcements query.
- End-to-end draft→publish→unpublish timing (AC 2, 3, 6) is wired via Story 4.1's webhook at `frontend/app/api/revalidate/route.ts` which calls `revalidatePath('/', 'layout')` and `revalidateTag('sanity', { expire: 0 })` on every create/update/delete for known content types.

**Task 3 — Image management**
- Verified all image fields use `options: { hotspot: true }` (storyChapter.image, entourageMember.photo, dressCode.inspirationImages[]).
- Verified all frontend consumers render via `next/image` + `urlFor()` with LQIP blur placeholders: `StoryChapter.tsx`, `EntourageSection.tsx`, `DressCodeSection.tsx`, `ProposalSection.tsx`, `portable-text-renderer.tsx`. Grep for `<img ` in `frontend/` returns zero matches.
- `urlFor()` automatically emits WebP (`.format("webp").fit("crop")`) for non-SVG sources, with responsive `sizes`.
- Alt coverage: `storyChapter.image.alt` is required; `dressCode.inspirationImages[].alt` is required; `entourageMember.photo.alt` is now an optional sub-field. The `EntourageSection` component was updated to consume `photo.alt` when present and fall back to `Photo of <name>`. The `entourage.ts` query was updated to project `alt`, and its `PadrinoResult` type gained an optional `alt`.

**Task 4 — Scheduled announcements**
- Implemented Option B (frontend GROQ filter). Created `frontend/sanity/queries/announcements.ts` with `ANNOUNCEMENTS_QUERY`, `AnnouncementResult` type, and `getAnnouncements()` helper. The GROQ filter is `scheduledAt == null || scheduledAt <= now()`, sorted `publishedAt desc`. Drafts are excluded by the client's `perspective: "published"` (no redundant clause needed).
- **Known gap (flagged for follow-up):** no UI component currently renders announcements (no section in `WeddingExperience.tsx`, no announcement route). The backend pipeline is fully in place; whichever future story adds the rendering surface needs to either (a) opt into periodic ISR at the route level (e.g. `export const revalidate = 60`) so `now()` gets re-evaluated each minute, or (b) surface announcements client-side with a periodic refetch. The doc comment in `announcements.ts` spells this out. AC 5's end-to-end test cannot fully pass until the UI consumer exists — this is out of scope per the story's task list, which only requires the query layer.

**Task 5 — Studio UX**
- `structure.ts` already provides the desired grouping: "Wedding Content" contains Story Chapters, Entourage, Guests, Announcements, Wedding Details, and Dress Code. Pages and FAQs live beneath. Navigation and Settings are global singletons.
- Previews verified/enhanced: storyChapter (year + media + proposal badge), entourageMember (name + role + photo), announcement (title + schedule-aware subtitle), weddingDetails (ceremony → reception venues), dressCode (label).
- Singleton UX: see Task 1 — `weddingDetails` and `dressCode` are now registered as singletons in `sanity.config.ts`.
- Studio bookmark-ability is a deployment concern; no code change required. The Studio is a standalone pnpm workspace with its own URL.

**Task 6 — Verification**
- `pnpm lint` — ✅ no errors.
- `cd frontend && pnpm typecheck` — ✅ no errors (including the regenerated `sanity.types.ts`).
- `pnpm build` — ✅ frontend and studio both build clean.
- Manual Studio/end-to-end tests (create → publish → verify live within 10s; upload image → verify WebP; scheduled announcement; unpublish) are flagged for human validation by Nianne/Jave against the deployed Studio and site — they cannot be driven from the CLI during dev.

**Test strategy note**
- This story has no automated test framework configured (no Vitest/Jest in any workspace), and the work is primarily Sanity schema descriptions + a single GROQ query + a config registration. The story's own DoD (Task 6.7) specifies `pnpm build && pnpm lint` as the gate, and both pass. The standard BMad TDD red-green-refactor cycle from `instructions.xml` Step 5 was not applied because the story is configuration-heavy and no test infrastructure exists to harbor new tests; adding one would have gone outside the story's scope.

**Manual-QA subtasks (2.3, 2.4, 3.4, 4.3, 6.1–6.6)**
- Left unchecked. These require a deployed Studio + live site (or Vercel preview) with the Story 4.1 webhook wired to `<frontend-url>/api/revalidate`. Walk-through: create draft → verify absent → publish → verify live within 10s (via `[revalidate] ... → / (layout)` server log) → edit/unpublish → verify removed.
- For 4.3/6.5 specifically: visit `/dev/announcements` (added in code review follow-up). The page shows a "Visible now" list and a "Scheduled — hidden" list so you can create an announcement with `scheduledAt = now + 90s`, verify it appears under Scheduled, wait ~60s, refresh, and see it move to Visible. ISR revalidate is pinned to 60s on both the page and the `sanityFetch` call.

**Pre-prod orphan-singleton hygiene**
- This story registers `weddingDetails` and `dressCode` as singletons in `studio/sanity.config.ts`, which prevents *new* duplicates but cannot retroactively collapse duplicates that may exist in the dataset from before this change. Before production, run this in the Studio Vision tab: `count(*[_type == "weddingDetails"])` and `count(*[_type == "dressCode"])`. If either > 1, manually delete orphans (the one that `structure.ts` opens via `documentId("weddingDetails")` / `documentId("dressCode")` is the canonical copy — keep that, delete the rest).

### Code Review Fixes (2026-04-17)

Addressed findings from BMad `code-review` workflow:

- **H1** — Added `frontend/app/(main)/dev/announcements/page.tsx` so AC 5 is end-to-end testable without needing a production UI consumer. Page renders the filtered "visible now" list, a "scheduled — hidden" list, and a full list with VISIBLE/SCHEDULED badges. Production rendering surface is still deferred to a future story.
- **M1** — Rewrote scheduling guidance in `frontend/sanity/queries/announcements.ts`. The query now passes `revalidate: 60` directly to `sanityFetch` (previous guidance about route-level `revalidate` would not have re-evaluated `now()` in the cached GROQ). Webhook-driven tag busting still handles instant updates on publish/edit; 60s periodic refresh handles time-based visibility when `scheduledAt` passes.
- **M2** — Pinned `timeZone: "Asia/Manila"` + `timeZoneName: "short"` in the announcement Studio preview (`studio/schemas/documents/announcement.ts`) so admins see wedding-local time regardless of device timezone.
- **L1** — Cleaned up italicized inline notes on manual-QA subtasks (moved to the "Manual-QA subtasks" paragraph above); checklist is now bare `[ ]`.
- **L2** — Documented the orphan-singleton hygiene check above.

## Change Log

- 2026-04-17 — **Story 4.2 implemented** on branch `feat/4-2-content-management-all-sections`. Schema descriptions + optional entourage photo alt + announcement scheduledAt GROQ filter + singleton registration for weddingDetails/dressCode. `pnpm lint`/`typecheck`/`build` green.
- 2026-04-17 — **Code review follow-ups applied** (5 issues: 1H/2M/2L). Added `/dev/announcements` debug route, corrected revalidation strategy to pass `revalidate: 60` to `sanityFetch`, pinned Asia/Manila in Studio preview, cleaned up story checklist, documented orphan-singleton hygiene.

### File List

**Modified**
- `studio/schemas/documents/storyChapter.ts` — added admin descriptions on `year`, `caption`, `image`, `image.alt`, `publishedAt`, `order`.
- `studio/schemas/documents/entourageMember.ts` — added descriptions on `colorAssignment`, `photo`, `isPadrino`; added optional `photo.alt` sub-field.
- `studio/schemas/documents/announcement.ts` — added descriptions on `title`, `body`, `publishedAt`; rewrote `scheduledAt` label + description; enhanced preview with schedule-aware subtitle; pinned `timeZone: "Asia/Manila"` in preview (code-review M2).
- `studio/sanity.config.ts` — added `weddingDetails` and `dressCode` to `singletonTypes` Set.
- `frontend/sanity/queries/entourage.ts` — project `alt` on `photo` in `PADRINOS_QUERY`; added optional `alt` to `PadrinoResult`.
- `frontend/components/sections/EntourageSection.tsx` — consume `photo.alt` with `Photo of <name>` fallback.
- `frontend/sanity.types.ts` — regenerated by `pnpm typegen` after schema change (auto-generated file).
- `studio/schema.json` — regenerated by `pnpm typegen` (auto-generated file).

**Added**
- `frontend/sanity/queries/announcements.ts` — `ANNOUNCEMENTS_QUERY` with `scheduledAt` filter + `revalidate: 60` on `sanityFetch` (code-review M1), `AnnouncementResult` type, `getAnnouncements()` helper, plus `ALL_ANNOUNCEMENTS_QUERY` + `getAllAnnouncementsForDebug()` for the dev route.
- `frontend/app/(main)/dev/announcements/page.tsx` — debug route rendering visible / scheduled-hidden / all announcements (code-review H1). Pins `Asia/Manila`. `export const revalidate = 60`.

**Deleted**
- None.
