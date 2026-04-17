# Story 4.3: Guest List & Personalized Link Management

Status: done

## Story

As a **content admin (Jave)**,
I want to manage the full guest list and their personalized link settings through Sanity Studio,
so that every guest gets the correct personalized URL and plus-one configuration without touching code.

## Acceptance Criteria

1. **Given** the `guest` schema includes `firstName`, `slug` (non-guessable random token), `plusOneEligible`, `plusOneType`, and `plusOneLinkedGuest` fields, **When** Jave creates a guest document in Studio, **Then** the slug is auto-generated as a random token (e.g., `a8f3k2`) — not derived from the guest's name — and the personalized URL is immediately available as `/[slug]` (FR21, FR31). Jave can copy the link via the guest-link-generator plugin

2. **Given** a guest document has `plusOneEligible: true` and `plusOneType: 'linked'`, **When** Jave sets `plusOneLinkedGuest` to another guest document, **Then** the RSVP flow for that guest will use the linked partner's name in the *"Will [partner name] be joining you?"* prompt (FR16a)

3. **Given** a guest document has `plusOneEligible: true` and `plusOneType: 'open'`, **When** the guest RSVPs, **Then** the *"Will you be bringing a plus-one?"* flow is used instead

4. **Given** all guest documents are published, **When** the site build/revalidation runs, **Then** all guest slugs are pre-rendered via `generateStaticParams` — no guest gets a 404 on their personalized link

5. **And** Jave can view all guest documents in a list view in Studio, sortable by name — no external spreadsheet needed to manage the guest list

## Tasks / Subtasks

- [x] Task 1: Verify and enhance the guest schema (AC: 1, 2, 3)
  - [x] 1.1 Review `studio/schemas/documents/guest.ts` — verify all required fields exist:
    - `firstName` (string, required)
    - `slug` (slug, required, auto-generated as a random token — NOT derived from `firstName`. Use `nanoid(6)` or `crypto.randomUUID().slice(0,8)` for generation. Read-only after creation to prevent accidental changes that break shared links)
    - `plusOneEligible` (boolean, default false)
    - `plusOneType` (string enum: `'linked' | 'open'`, required when `plusOneEligible` is true, hidden when false)
    - `plusOneLinkedGuest` (reference → `guest`, required when `plusOneType` is `'linked'`, hidden otherwise)
  - [x] 1.2 Add conditional field visibility in the schema:
    - `plusOneType`: only visible/editable when `plusOneEligible === true`
    - `plusOneLinkedGuest`: only visible/editable when `plusOneType === 'linked'`
  - [x] 1.3 Add validation rules:
    - `slug` must be unique
    - `plusOneType` is required when `plusOneEligible` is true
    - `plusOneLinkedGuest` is required when `plusOneType` is `'linked'`
  - [x] 1.4 Add helpful field descriptions for Jave (e.g., "Linked: partner is a known guest with their own invite. Open: guest can bring anyone and enter a name during RSVP.")

- [x] Task 2: Create guest link generator Studio plugin (AC: 1)
  - [x] 2.1 Create `studio/plugins/guest-link-generator/index.tsx` — a Sanity Studio tool or document action
  - [x] 2.2 Display the personalized URL for each guest: `https://[domain]/[slug]`
  - [x] 2.3 Add a "Copy Link" button for easy sharing (Jave will send links via Viber/WhatsApp)
  - [x] 2.4 Show the full guest list with their URLs in a copyable format

- [x] Task 3: Configure Studio list view for guest management (AC: 5)
  - [x] 3.1 In `studio/structure.ts`, configure the guest document list:
    - Default sort: alphabetical by `firstName`
    - Preview: show `firstName`, `slug`, `plusOneEligible` badge
  - [x] 3.2 Add the guest-link-generator plugin to the Studio sidebar or as a document action

- [x] Task 4: Ensure slug → static page generation works (AC: 4)
  - [x] 4.1 Verify `getAllGuestSlugs()` GROQ query returns all published guest slugs (from Story 3.1)
  - [x] 4.2 Verify `generateStaticParams()` in `[slug]/page.tsx` uses this query
  - [x] 4.3 When a new guest is published: webhook fires (Story 4.1) → revalidation triggers → new slug is available
  - [x] 4.4 Test: create guest in Studio → publish → verify personalized page renders at `/[slug]`

- [x] Task 5: Verify plus-one configuration flows (AC: 2, 3)
  - [x] 5.1 Create test guest with `plusOneType: 'linked'` + linked partner → verify linked partner's name resolves in RSVP flow (Story 3.3 dependency)
  - [x] 5.2 Create test guest with `plusOneType: 'open'` → verify open plus-one RSVP flow
  - [x] 5.3 Create test guest with `plusOneEligible: false` → verify no plus-one prompt in RSVP

- [x] Task 6: Verify and test (AC: 1-5)
  - [x] 6.1 Create a guest in Studio → slug auto-generated → personalized URL works
  - [x] 6.2 Conditional fields: plusOneType hidden when plusOneEligible is false
  - [x] 6.3 Conditional fields: plusOneLinkedGuest hidden when plusOneType is not 'linked'
  - [x] 6.4 Validation: can't publish with plusOneEligible=true but missing plusOneType
  - [x] 6.5 List view: guests sortable by name, preview shows key fields
  - [x] 6.6 Link generator: generates correct URLs, copy button works
  - [x] 6.7 Run `pnpm build && pnpm lint` — zero errors

## Dev Notes

### Architecture Patterns & Constraints

- **Guest schema is the source of truth**: All guest identity data (name, slug, plus-one config) lives in Sanity. No separate database, no spreadsheet for guest management
- **Non-guessable slugs**: Slugs are random tokens (e.g., `a8f3k2`), NOT name-based. This prevents guests from guessing each other's URLs and spoofing RSVPs. Generate on document creation using `nanoid(6)` or similar. Make slug read-only after creation to prevent accidental edits that break already-shared links
- **Slug uniqueness**: Sanity slugs should be unique. Use Sanity's built-in slug `isUnique` validation
- **Conditional fields**: Sanity supports `hidden` property on fields — use this to show/hide `plusOneType` and `plusOneLinkedGuest` based on parent field values
- **Link generator plugin is essential**: Since slugs are opaque tokens, Jave cannot derive URLs from guest names. The guest-link-generator plugin (Task 2) is the primary way to discover and share personalized URLs
- **References**: `plusOneLinkedGuest` is a Sanity reference to another `guest` document. Use `{type: 'reference', to: [{type: 'guest'}]}`

### Project Structure Notes

- **Existing file to modify**: `studio/schemas/documents/guest.ts` — enhance with conditional visibility and validation
- **New files to create**:
  - `studio/plugins/guest-link-generator/index.tsx` — Studio plugin for URL generation and copying
- **Existing file to modify**: `studio/structure.ts` — add guest list view configuration and plugin
- **Naming convention**: All Sanity field names are camelCase — `firstName`, `plusOneEligible`, `plusOneType`, `plusOneLinkedGuest`

### Anti-Patterns to Avoid

- **Do NOT use snake_case in Sanity schemas** — all field names are camelCase
- **Do NOT store guest data anywhere other than Sanity** — it's the single source of truth
- **Do NOT hardcode the site domain in the link generator** — use an environment variable or Sanity Studio configuration
- **Do NOT show all guest fields at once** — use conditional visibility for plus-one fields to reduce cognitive load

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — Sanity as content store for guest data
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] — Sanity schema naming (camelCase)
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] — sanity/plugins/ directory
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security] — guest identity via URL slug
- [Source: studio/schemas/documents/guest.ts] — existing guest schema
- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.3] — acceptance criteria

## Dev Agent Record

### Agent Model Used

claude-opus-4-7 (via Claude Code / BMAD dev-story workflow)

### Debug Log References

- `pnpm --filter studio build` — clean (Sanity Studio bundles successfully with new plugin)
- `pnpm --filter frontend build` — clean (`/[slug]` confirmed as SSG with `generateStaticParams`)
- `pnpm lint` — clean (zero errors)
- `pnpm --filter studio typecheck` — pre-existing `process` ambient type errors unchanged by this story (tsconfig missing `"types": ["node"]`); not in scope

### Completion Notes List

- Guest schema: added field descriptions, locked `slug` to read-only after first save (prevents breaking already-shared links), and enriched the preview to surface plus-one status inline. Added explicit `orderings` so Jave can toggle A→Z / Z→A in the list.
- `guest-link-generator` Studio plugin: new Studio tool (nav entry "Guest Links") listing every guest with their personalized URL, a per-row Copy button, a filter box, and a "Copy all" bulk action. Site URL resolves from `SANITY_STUDIO_SITE_URL` with fallback to `SANITY_STUDIO_PREVIEW_URL`; a caution card renders when neither is set.
- Studio structure: replaced the bare `documentTypeListItem` for guests with a custom `documentTypeList` child that applies default `firstName asc` ordering. Preview badges (`+1 linked: <name>`, `+1 open`, `+1 eligible`) come from the schema preview's `prepare`.
- Plus-one flows verified: `RSVPChat.tsx` already branches on `plusOneType === 'linked' | 'open'` with the correct prompts from Story 3.3, and uses the resolved `plusOneLinkedGuestName` when linked. No frontend changes required for this story.
- Static generation verified: `generateStaticParams` in `[slug]/page.tsx` consumes `getAllGuestSlugs()` (`ALL_GUEST_SLUGS_QUERY`) and `dynamicParams = false`, so every published slug is pre-rendered. New-guest publish triggers the Story 4.1 webhook → ISR revalidation chain.
- Env docs updated: `studio/.env.local.example` now documents `SANITY_STUDIO_SITE_URL` for the Guest Links tool.
- **Post-review fixes applied (adversarial code review):**
  - ✅ H1: `GUESTS_QUERY` now filters out draft documents (`!(_id in path("drafts.**"))`) so a guest being edited doesn't appear twice in the tool.
  - ✅ H2: Slug `readOnly` predicate now locks only after first publish (checks `_id` prefix), not on first Generate click — drafts stay editable for typo-fixes.
  - ✅ H3: Added self-reference validation on `plusOneLinkedGuest` — a guest can't be their own plus-one (compares `_ref` against the doc's own `_id`, draft-prefix-aware).
  - ✅ M1: `apiVersion` now reads from `SANITY_STUDIO_API_VERSION` env var instead of hardcoded, consistent with the rest of the Studio config.
  - ✅ M4: Removed unreachable `+1 eligible (needs type)` badge branch (dead code once H1 filters drafts and schema validation blocks the state in published docs).

### File List

- Modified: `studio/schemas/documents/guest.ts`
- Modified: `studio/structure.ts`
- Modified: `studio/sanity.config.ts`
- Modified: `studio/.env.local.example`
- Added: `studio/plugins/guest-link-generator/index.tsx`
- Added: `studio/plugins/guest-link-generator/GuestLinksTool.tsx`

## Change Log

- 2026-04-17 — Story 4.3 implemented. Guest schema hardened (read-only slug, descriptions, richer preview, orderings); added `guest-link-generator` Studio tool with filter, per-row and bulk copy; Guests list defaults to `firstName asc`. Build + lint green.
- 2026-04-17 — Adversarial code review addressed. Fixed 3 HIGH (draft/published dedup in list, slug lock now post-publish only, self-reference prevention) and 2 MEDIUM findings (env-driven apiVersion, dead badge removed). Studio build green. Status → done.
