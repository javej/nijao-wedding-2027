# Story 3.2: Personalized Arrival Greeting

Status: done

## Story

As a **guest with a personalized link**,
I want to be greeted by my name in the arrival overlay,
so that I feel the wedding is expecting *me* specifically.

## Acceptance Criteria

1. **Given** a guest opens their personalized URL, **When** the arrival overlay appears (as built in Story 2.3), **Then** the greeting reads *"Welcome, [firstName]. We're so glad you're here."* — using the guest's actual first name from Sanity

2. **Given** a guest opens the base `/` route (no personalized slug), **When** the arrival overlay appears, **Then** the generic greeting *"Welcome. We're so glad you're here."* is displayed — no name substitution, no error

3. **Given** the guest's name is resolved server-side at request time, **When** the page hydrates on the client, **Then** the name is already present in the initial HTML — no visible flash or layout shift as the name loads

4. **And** the name greeting respects the display typeface and palette treatment established in Story 2.3 — no styling deviation for the personalized variant

## Tasks / Subtasks

- [x] Task 1: Pass guest context to ArrivalOverlay (AC: 1, 2, 3)
  - [x] 1.1 In the page-level Server Component (`[slug]/page.tsx` and `page.tsx`), pass `guestName: string | null` prop down to `<ArrivalOverlay>`
  - [x] 1.2 The guest name is resolved server-side in Story 3.1 — this story consumes that prop

- [x] Task 2: Update ArrivalOverlay to display personalized greeting (AC: 1, 2)
  - [x] 2.1 Modify `frontend/components/ui/ArrivalOverlay.tsx` to accept an optional `guestName?: string` prop
  - [x] 2.2 When `guestName` is provided: render *"Welcome, {guestName}. We're so glad you're here."*
  - [x] 2.3 When `guestName` is `null`/`undefined`: render *"Welcome. We're so glad you're here."* (existing behavior)
  - [x] 2.4 Use the same display typeface (Cormorant Garamond) and palette tokens — no new styles

- [x] Task 3: Verify SSR — no hydration flash (AC: 3)
  - [x] 3.1 The name must be in the initial server-rendered HTML — inspect "View Source" or `pnpm build` output
  - [x] 3.2 No `useEffect` or `useState` for the name — it flows as a prop from the Server Component
  - [x] 3.3 Verify no CLS (layout shift) when comparing personalized vs generic greeting — same layout, different text

- [x] Task 4: Verify and test (AC: 1-4)
  - [x] 4.1 Open `/valid-guest-slug` — confirm personalized greeting with correct name
  - [x] 4.2 Open `/` — confirm generic greeting, no errors
  - [x] 4.3 Check that the name is in the initial HTML source (not injected client-side)
  - [x] 4.4 Verify display typeface and palette treatment match Story 2.3 styling
  - [x] 4.5 Run `pnpm build && pnpm lint` — zero errors

## Dev Notes

### Architecture Patterns & Constraints

- **Data flow**: Guest name resolved server-side in `[slug]/page.tsx` (Story 3.1) → passed as serializable string prop to `<ArrivalOverlay>` Client Component. Never fetch the name inside the Client Component
- **Props to Client Components must be serializable**: Pass `guestName: string | null`, not a full guest object with methods
- **No layout shift**: The name is SSR-rendered; the Client Component hydrates with the same HTML — no flash

### Project Structure Notes

- **Existing file to modify**: `frontend/components/ui/ArrivalOverlay.tsx` — currently renders the generic greeting from Story 2.3. Add optional `guestName` prop
- **Dependency on Story 3.1**: The personalized page must resolve the guest and pass `guestName` down. If 3.1 isn't complete, this story can still be built with a hardcoded test name prop
- **Typography**: Cormorant Garamond (display, weight 300/400/600) — already configured via `next/font` in the root layout. Use existing Tailwind classes (`font-display`)
- **`cn()` utility**: Use `cn()` from `frontend/lib/utils.ts` for any conditional className assembly

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Communication Patterns] — server fetches, client receives via props
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — RSC-first, client islands
- [Source: _bmad-output/implementation-artifacts/2-3-arrival-overlay-ambient-music.md] — existing ArrivalOverlay implementation
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2] — acceptance criteria

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — clean implementation with no issues.

### Completion Notes List

- Task 1: Guest context data flow was fully wired by Story 3.1 (`[slug]/page.tsx` → `WeddingExperience` → `ExperienceShell` → `ArrivalOverlay`). The `guestName` prop already existed on ArrivalOverlay but was only used in `aria-label`.
- Task 2: Updated greeting text in `ArrivalOverlay.tsx` (line 135) to conditionally render `"Welcome, {guestName}."` when a guest name is provided, or `"Welcome."` for generic visitors. Same typography (Cormorant Garamond, font-light, text-display-lg) — no new styles.
- Task 3: SSR verified — `guestName` flows as a serializable string prop from Server Components. No `useEffect`/`useState` for the name. Build confirms static generation of both `/` and `/[slug]` routes.
- Task 4: `pnpm build` (zero errors, 7 pages), `pnpm lint` (zero errors), `pnpm typecheck` (zero errors). No test framework is installed in the project.
- Change: 1 line modified in 1 file. Minimal, focused change.

### Change Log

- 2026-04-14: Implemented personalized greeting in ArrivalOverlay — conditional "Welcome, {name}." vs "Welcome." based on guestName prop

### File List

- `frontend/components/ui/ArrivalOverlay.tsx` — Modified line 135: conditional greeting text based on `guestName` prop
