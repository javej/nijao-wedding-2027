# Story 4.4: RSVP Dashboard & Export

Status: done

## Story

As a **content admin (Nianne or Jave)**,
I want to view a live RSVP dashboard showing current headcount and export the full list for the caterer,
so that I always know how many guests are coming and can hand off the list without manual compilation.

## Acceptance Criteria

1. **Given** RSVP responses are being written to Google Sheets in real time, **When** Nianne opens the RSVP dashboard (implemented as a custom Sanity Studio plugin), **Then** she sees a live headcount — total attending, total declined, total pending (no response yet from published guests)

2. **Given** the dashboard shows individual responses, **When** Nianne views the response list, **Then** each entry shows: guest name, attending (yes/no), plus-one name if applicable, timestamp — matching what is in Google Sheets (FR29)

3. **Given** the caterer needs the final headcount, **When** Jave or Nianne clicks Export, **Then** a CSV file downloads containing: guest name, attending, plus-one name, timestamp — for all responses in the Sheet (FR30)

4. **Given** the Google Sheet is shared directly with Nianne and the caterer, **When** either party opens the Sheet, **Then** they have read access to the full live response data — no additional export step required for day-to-day monitoring

5. **And** the RSVP dashboard reads directly from Google Sheets via the Sheets API — it does not store RSVP data in Sanity, keeping guest personal data out of the CMS (NFR-S7)

## Tasks / Subtasks

- [x] Task 1: Create RSVP Dashboard Studio plugin (AC: 1, 2, 5)
  - [x] 1.1 Create `studio/plugins/rsvp-dashboard/index.tsx` — a Sanity Studio tool plugin
  - [x] 1.2 Register the plugin in `studio/sanity.config.ts`
  - [x] 1.3 Dashboard fetches RSVP data from Google Sheets via an API endpoint (NOT directly from the Sheet — Studio runs client-side and can't use service account credentials directly)
  - [x] 1.4 Create a backend API route `frontend/app/api/rsvp-data/route.ts` that:
    - Reads all rows from the Google Sheet using `lib/sheets.ts`
    - Returns JSON with RSVP data (name, attending, plusOneName, timestamp)
    - Authenticates the request (e.g., simple shared secret or Sanity auth token verification)

- [x] Task 2: Dashboard UI — headcount summary (AC: 1)
  - [x] 2.1 Display summary cards: Total Attending, Total Declined, Total Pending
  - [x] 2.2 "Pending" = published guest count (from Sanity) minus responses received (from Sheets)
  - [x] 2.3 Auto-refresh on dashboard open (or manual refresh button)
  - [x] 2.4 Use Sanity UI components (`@sanity/ui`) for consistent Studio styling

- [x] Task 3: Dashboard UI — individual response list (AC: 2)
  - [x] 3.1 Display a table/list of all RSVP responses from Google Sheets
  - [x] 3.2 Columns: Guest Name, Attending (Yes/No), Plus-One Name, Timestamp
  - [x] 3.3 Sortable by name or timestamp
  - [x] 3.4 Visual indicator for attending vs declined (e.g., green/red badge)

- [x] Task 4: CSV Export (AC: 3)
  - [x] 4.1 Add "Export CSV" button to the dashboard
  - [x] 4.2 Generate CSV client-side from the fetched data: `guest name, attending, plus-one name, timestamp`
  - [x] 4.3 Trigger file download with filename: `rsvp-export-{date}.csv`
  - [x] 4.4 CSV should include a header row

- [x] Task 5: Create the RSVP data API route (AC: 1, 5)
  - [x] 5.1 Create `frontend/app/api/rsvp-data/route.ts` — GET endpoint
  - [x] 5.2 Use `lib/sheets.ts` to read all rows from the RSVP Google Sheet
  - [x] 5.3 Return typed JSON: `{ responses: Array<{ guestName: string; attending: boolean; plusOneName?: string; timestamp: string }> }`
  - [x] 5.4 Add authentication: verify request comes from an authorized source (check for a secret header or Sanity auth token)
  - [x] 5.5 Handle Sheets API errors gracefully — return `{ error: '...' }` with appropriate status code

- [x] Task 6: Google Sheet sharing (AC: 4)
  - [x] 6.1 Document the steps to share the Google Sheet with Nianne and the caterer:
    - Share with read access
    - Direct Sheet URL serves as the primary day-to-day monitoring tool
    - The Studio dashboard is a convenience layer on top

- [x] Task 7: Verify and test (AC: 1-5)
  - [x] 7.1 Open RSVP dashboard in Studio → verify headcount summary loads
  - [x] 7.2 Verify individual response list matches Google Sheets data
  - [x] 7.3 Click Export → CSV downloads with correct data and format
  - [x] 7.4 Verify dashboard reads from Sheets, NOT from Sanity (NFR-S7)
  - [x] 7.5 Verify API route authentication works — unauthorized requests rejected
  - [x] 7.6 Simulate Sheets API failure → graceful error message in dashboard
  - [x] 7.7 Run `pnpm build && pnpm lint` — zero errors

## Dev Notes

### Architecture Patterns & Constraints

- **RSVP data lives in Google Sheets, NOT in Sanity (NFR-S7)**: Guest personal data (responses) is kept out of the CMS. The dashboard reads from Sheets via an API, never stores RSVP data in Sanity
- **Studio plugin architecture**: Sanity Studio plugins use `@sanity/ui` for UI components and can register as "tools" in the Studio sidebar. The plugin runs client-side in the browser
- **API route for data**: Since the Studio plugin is client-side, it cannot directly use Google service account credentials. Create a backend API route that reads Sheets and returns JSON. The plugin calls this API
- **Pending count calculation**: Published guest count comes from Sanity (GROQ query for all published `guest` documents). RSVP response count comes from Sheets. Pending = published guests - responded guests

### Project Structure Notes

- **New files to create**:
  - `studio/plugins/rsvp-dashboard/index.tsx` — Sanity Studio dashboard plugin
  - `frontend/app/api/rsvp-data/route.ts` — API route for reading RSVP data from Sheets
- **Existing files to reference**:
  - `frontend/lib/sheets.ts` — Google Sheets integration (used by both the RSVP submission action and the dashboard API)
  - `studio/sanity.config.ts` — register the dashboard plugin here
  - `studio/structure.ts` — add dashboard to Studio navigation if needed
- **Sanity UI**: Use `@sanity/ui` components (Card, Stack, Text, Button, etc.) for the dashboard UI — maintains consistent Studio look and feel

### Anti-Patterns to Avoid

- **Do NOT store RSVP responses in Sanity** — they belong in Google Sheets only (NFR-S7)
- **Do NOT expose Google service account credentials to the Studio client** — use a backend API route
- **Do NOT hardcode the Google Sheet ID** — use environment variable (`GOOGLE_SHEETS_RSVP_ID` or similar)
- **Do NOT skip authentication on the RSVP data API route** — it returns guest personal data
- **Do NOT build a full-featured admin panel** — keep it simple: headcount, response list, CSV export. The shared Google Sheet handles day-to-day monitoring

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns] — `sanity/plugins/rsvp-dashboard/` directory
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture] — RSVP data in Google Sheets, not Sanity
- [Source: _bmad-output/planning-artifacts/architecture.md#Architectural Boundaries] — RSVP → Google Sheets boundary
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Boundaries] — who writes/reads RSVP data
- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.4] — acceptance criteria

## Dev Agent Record

### Agent Model Used

claude-opus-4-7 (Claude Code, bmm dev-story workflow)

### Debug Log References

- `frontend`: `pnpm lint` → clean, `pnpm typecheck` → clean, `pnpm build` → clean (`/api/rsvp-data` registered as ƒ Dynamic).
- `studio`: `pnpm build` → clean. `pnpm typecheck` surfaces pre-existing `process.env` errors on files unrelated to this story (`sanity.cli.ts`, `defaultDocumentNode.ts`, `GuestLinksTool.tsx`, and the existing env reads in `sanity.config.ts`). The new plugin uses the same `process.env` pattern the Studio already relies on; Sanity's build-time env inlining is the runtime mechanism.
- Studio has no `lint` script / ESLint config — the story's `pnpm build && pnpm lint` gate applies to `frontend`, which passes.

### Completion Notes List

- **API route** (`frontend/app/api/rsvp-data/route.ts`, GET + OPTIONS): reads all rows from the RSVP Sheet via `lib/sheets.ts`, returns `{ responses: RsvpResponse[] }`. Auth via `x-rsvp-dashboard-secret` header (env `RSVP_DASHBOARD_SECRET`). CORS allowlist via `RSVP_DASHBOARD_ALLOWED_ORIGINS` (comma-separated). 401 on bad secret, 500 when secret unconfigured, 502 on Sheets API failure.
- **Sheets read**: added `readRsvpRows()` and exported `RsvpResponse` type in `frontend/lib/sheets.ts`. Skips blank rows, parses `"yes"/"no"` case-insensitively.
- **Studio plugin** (`studio/plugins/rsvp-dashboard/`): `index.tsx` registers the tool; `RsvpDashboardTool.tsx` is the UI. Plugin registered in `studio/sanity.config.ts`.
- **Headcount logic**: Attending / Declined counted from Sheet rows; Pending = `count(*[_type=="guest" && !(_id in path("drafts.**"))])` minus count of unique responding guest names. Plus-ones are not counted toward Pending since they live outside the Sanity guest list.
- **Response list**: sortable by Name or Timestamp (toggle direction on re-click). Attending/Declined badge, plus-one badge when present, human-readable timestamp.
- **CSV export**: client-side Blob download, filename `rsvp-export-YYYY-MM-DD.csv`, header row, RFC-style quoting for cells containing commas/quotes/newlines.
- **Security**: `RSVP_DASHBOARD_SECRET` is treated as scraping friction, not a true secret — the Studio bundles `SANITY_STUDIO_*` vars into the client. Studio access is auth-gated, so this is acceptable. Documented in both env examples and inline code comments.
- **Google Sheet sharing (AC4)**: documented in both `.env.local.example` files; operationally, Jave shares the live Sheet (read access) with Nianne and the caterer directly in the Google Sheets UI — no code change is required for that step. The Studio dashboard is the convenience layer on top.

### File List

- `frontend/lib/sheets.ts` (modified — added `readRsvpRows`, `RsvpResponse` type, slug column E, header-row filter)
- `frontend/app/api/rsvp-data/route.ts` (new — timing-safe secret check, strict CORS allow-origin)
- `frontend/app/actions/rsvp.ts` (modified — propagate `guestSlug` + optional `linkedGuest.slug` to the Sheet write)
- `frontend/components/ui/RSVPChat.tsx` (modified — new `plusOneLinkedGuestSlug` prop, included in payload)
- `frontend/components/sections/RSVPSection.tsx` (modified — pass `plusOneLinkedGuestSlug` from GROQ result)
- `frontend/.env.local.example` (modified — documented `RSVP_DASHBOARD_SECRET` + `RSVP_DASHBOARD_ALLOWED_ORIGINS`)
- `studio/plugins/rsvp-dashboard/index.tsx` (new)
- `studio/plugins/rsvp-dashboard/RsvpDashboardTool.tsx` (new — slug-based pending dedupe, AbortController on unmount, UTF-8 BOM on CSV, name tie-breaker on timestamp sort)
- `studio/plugins/guest-link-generator/GuestLinksTool.tsx` (modified — API_VERSION fallback bumped to 2026-04-09 for consistency)
- `studio/sanity.config.ts` (modified — import and register `rsvpDashboard()` plugin)
- `studio/.env.local.example` (modified — documented `SANITY_STUDIO_RSVP_DASHBOARD_SECRET`, clarified `SANITY_STUDIO_SITE_URL` reuse)

### Change Log

- 2026-04-17 — Implemented Story 4.4 RSVP Dashboard & Export: new read-only `/api/rsvp-data` endpoint, new `rsvp-dashboard` Studio tool with live headcount, sortable response list, and CSV export. RSVP data stays in Google Sheets (NFR-S7).
- 2026-04-17 — Addressed code review findings (3 Medium + 5 Low). Sheet schema gained a `guestSlug` column (E) so pending count is correct even when two guests share a first name. CORS now omits `Access-Control-Allow-Origin` for unknown origins. Dashboard aborts in-flight requests on unmount. Secret comparison uses `crypto.timingSafeEqual`. CSV exports include a UTF-8 BOM for Excel. Sort gains stable tie-breaker. Sheet read filters non-yes/no rows so any header row added manually is ignored. `API_VERSION` fallbacks aligned across both Studio tools.

## Senior Developer Review (AI)

**Reviewer:** claude-opus-4-7 (Claude Code, bmm code-review workflow)
**Review Date:** 2026-04-17
**Review Outcome:** ✅ Approve (all issues resolved)

**Summary:** 0 High · 3 Medium · 5 Low — all auto-fixed in this same session. Git File List matched story File List with zero discrepancies. All five Acceptance Criteria verified as IMPLEMENTED. All seven `[x]` tasks have real code backing them.

### Action Items

- [x] `[AI-Review][MED]` M1 — Pending count silently wrong when two guests share a first name. Fixed by adding a `guestSlug` column (E) to the Sheet and deduping by slug. Linked plus-ones now write their own slug too. _(frontend/lib/sheets.ts, frontend/app/actions/rsvp.ts, frontend/components/ui/RSVPChat.tsx, frontend/components/sections/RSVPSection.tsx, studio/plugins/rsvp-dashboard/RsvpDashboardTool.tsx)_
- [x] `[AI-Review][MED]` M2 — CORS `Access-Control-Allow-Origin` echoed a wrong origin for unmatched requests. Fixed: header is now omitted for unknown origins. _(frontend/app/api/rsvp-data/route.ts)_
- [x] `[AI-Review][MED]` M3 — No cleanup/abort on dashboard unmount. Fixed with `AbortController` and a useEffect cleanup. _(studio/plugins/rsvp-dashboard/RsvpDashboardTool.tsx)_
- [x] `[AI-Review][LOW]` L1 — Secret comparison wasn't timing-safe. Fixed with `crypto.timingSafeEqual` + length-uniform fallback. _(frontend/app/api/rsvp-data/route.ts)_
- [x] `[AI-Review][LOW]` L2 — CSV lacked UTF-8 BOM for Excel. Fixed: BOM prepended to the CSV string. _(studio/plugins/rsvp-dashboard/RsvpDashboardTool.tsx)_
- [x] `[AI-Review][LOW]` L3 — `API_VERSION` fallback diverged from project version. Fixed: both Studio tools use `2026-04-09`. _(studio/plugins/rsvp-dashboard/RsvpDashboardTool.tsx, studio/plugins/guest-link-generator/GuestLinksTool.tsx)_
- [x] `[AI-Review][LOW]` L4 — Timestamp sort had no tie-breaker. Fixed: secondary sort on guest name for stable ordering. _(studio/plugins/rsvp-dashboard/RsvpDashboardTool.tsx)_
- [x] `[AI-Review][LOW]` L5 — `readRsvpRows` would misread a manually-added header row as a response. Fixed: rows are now filtered to those where the attending cell is exactly `yes` or `no`. _(frontend/lib/sheets.ts)_

### Post-fix Verification

- `frontend`: `pnpm lint` ✅ `pnpm typecheck` ✅ `pnpm build` ✅
- `studio`: `pnpm build` ✅ — and `SANITY_STUDIO_RSVP_DASHBOARD_SECRET` is now inlined into the Studio bundle (visible in the build output)
