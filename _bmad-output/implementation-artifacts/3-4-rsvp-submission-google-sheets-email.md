# Story 3.4: RSVP Submission — Google Sheets & Email

Status: review

## Story

As a **guest who has completed the RSVP chat**,
I want my response recorded and a confirmation email sent to me,
so that I know my RSVP was received and have the wedding details in my inbox.

## Acceptance Criteria

1. **Given** the guest completes the RSVP chat flow, **When** the Server Action (`app/actions/rsvp.ts`) is called, **Then** it validates the Cloudflare Turnstile token server-side before processing anything — invalid token returns an error without writing any data (NFR-S3)

2. **Given** Turnstile validation passes, **When** the Server Action writes to Google Sheets, **Then** a new row is appended with: guest name, attending (yes/no), plus-one name if applicable, timestamp — and the row appears in the Sheet within 5 seconds (FR37, NFR-I1)

3. **Given** the guest has a `linked` plus-one who is confirmed attending, **When** the Server Action writes to Google Sheets, **Then** two separate rows are written — one for the guest, one for the linked partner — each with their own name and attending: yes

4. **Given** the Google Sheets write succeeds, **When** Resend dispatches the confirmation email, **Then** the guest receives an email with subject *"We've been waiting for you"* containing the wedding date, church, venue, and a personal note from Jave and Nianne — delivered within 60 seconds (FR36, NFR-I2)

5. **Given** the Google Sheets API is unavailable at submission time, **When** the Server Action fails to write, **Then** the RSVP payload is queued in `localStorage` (`rsvpQueue`) and retried silently on reconnect — the guest always sees the in-site confirmation, never a raw error (NFR-I4)

6. **Given** Resend fails to deliver the email, **When** the email dispatch errors, **Then** the failure is logged server-side (Vercel logs) but does not block the guest's confirmation — the RSVP is still accepted (NFR-I5)

7. **And** the Server Action returns a typed `{ success: boolean; error?: string }` — it never throws an unhandled error to the client

## Tasks / Subtasks

- [x] Task 1: Implement the `submitRsvp` Server Action (AC: 1, 7)
  - [x] 1.1 Update `frontend/app/actions/rsvp.ts` (file already exists from starter scaffolding — check current content first)
  - [x] 1.2 Define the `RSVPPayload` type: `{ guestName: string; attending: boolean; plusOneName?: string; turnstileToken: string; linkedGuest?: { name: string; attending: boolean } }`
  - [x] 1.3 Define the `ActionResult` type: `{ success: true } | { success: false; error: string }`
  - [x] 1.4 Server Action flow: validate Turnstile → write Sheets → send email → return result
  - [x] 1.5 Wrap entire flow in try/catch — never throw to client, always return `ActionResult`

- [x] Task 2: Turnstile server-side validation (AC: 1)
  - [x] 2.1 Use `frontend/lib/turnstile.ts` (already scaffolded) for server-side token verification
  - [x] 2.2 POST to `https://challenges.cloudflare.com/turnstile/v0/siteverify` with `TURNSTILE_SECRET_KEY` and the client token
  - [x] 2.3 If validation fails: return `{ success: false, error: 'Verification failed' }` — do not write any data

- [x] Task 3: Google Sheets integration (AC: 2, 3, 5)
  - [x] 3.1 Update `frontend/lib/sheets.ts` (already scaffolded) to implement `appendRsvpRow(data)`:
    - Parse `GOOGLE_SERVICE_ACCOUNT_JSON` from env var — assert at module load
    - Use `googleapis` package: `google.sheets('v4').spreadsheets.values.append()`
    - Row format: `[guestName, attending, plusOneName, timestamp]`
  - [x] 3.2 For linked plus-one: write two rows — one for guest, one for partner with `attending: 'yes'`
  - [x] 3.3 Target: row appears in Sheet within 5 seconds of submission
  - [x] 3.4 On Sheets API failure: return `{ success: false, error: 'sheets_unavailable' }` — the client-side `RSVPChat` handles localStorage queuing (Story 3.3)

- [x] Task 4: Resend email integration (AC: 4, 6)
  - [x] 4.1 Update `frontend/lib/resend.ts` (already scaffolded) to implement `sendRsvpConfirmation(data)`:
    - Use `RESEND_API_KEY` from env var — assert at module load
    - From address: configured Resend domain (e.g., `hello@yourdomain.com`)
    - Subject: *"We've been waiting for you"*
    - Body: wedding date (January 8, 2027), church (St. Therese Parish), venue (Casa 10 22, Lipa Batangas), personal note
  - [x] 4.2 On Resend failure: `console.error('[sendRsvpConfirmation]', error)` — log server-side, do NOT throw, do NOT block guest confirmation
  - [x] 4.3 Email is a best-effort enhancement — RSVP submission succeeds regardless of email delivery

- [x] Task 5: localStorage retry queue (AC: 5)
  - [x] 5.1 In `RSVPChat.tsx` (client side): if `submitRsvp` returns `{ success: false, error: 'sheets_unavailable' }`
  - [x] 5.2 Queue the RSVP payload in localStorage key `rsvpQueue` using `setLocalItem()` from `@/lib/localStorage.ts`
  - [x] 5.3 On subsequent page loads or reconnect events, check for queued payloads and retry silently
  - [x] 5.4 Guest always sees the in-site confirmation regardless of Sheets status — the failure is invisible to them

- [x] Task 6: Verify and test (AC: 1-7)
  - [x] 6.1 Test full submission flow: valid Turnstile → Sheets row written → email sent → ActionResult returned
  - [x] 6.2 Test with invalid Turnstile token — returns error, no data written
  - [x] 6.3 Test linked plus-one: two rows written to Sheets
  - [x] 6.4 Simulate Sheets failure: verify localStorage queue populated, guest sees confirmation
  - [x] 6.5 Simulate Resend failure: verify RSVP still succeeds, error logged
  - [x] 6.6 Verify ActionResult type — never throws, always returns typed result
  - [x] 6.7 Run `pnpm build && pnpm lint` — zero errors

## Dev Notes

### Architecture Patterns & Constraints

- **Server Action pattern**: Server Actions return typed `ActionResult` — NEVER throw unhandled errors to the client. Use try/catch and return `{ success: false, error: '...' }`
- **Env var assertion**: Assert all env vars at module load in `lib/` files — `GOOGLE_SERVICE_ACCOUNT_JSON`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`. Never inline optional-chain
- **Integration failure decoupling**: Sheets failure → queue + retry; Resend failure → log only. Guest ALWAYS sees confirmation
- **RSVP does NOT depend on Sanity**: Form submission is CMS-independent (NFR-R3). Guest data comes from page props, not from a CMS fetch at submission time
- **No `meal` field**: Meal preference is explicitly out of scope per epics

### Project Structure Notes

- **Existing files to update** (all scaffolded, check current content before modifying):
  - `frontend/app/actions/rsvp.ts` — Server Action (may exist from starter)
  - `frontend/lib/sheets.ts` — Google Sheets integration
  - `frontend/lib/resend.ts` — Resend email integration
  - `frontend/lib/turnstile.ts` — Turnstile verification
- **Types**: Define `RSVPPayload` and `ActionResult` in `frontend/types/index.ts` if they'll be used in 3+ files; otherwise keep inline in the action file
- **Environment variables** (must be set in Vercel):
  - `GOOGLE_SERVICE_ACCOUNT_JSON` — stringified JSON service account credentials
  - `RESEND_API_KEY` — Resend API key
  - `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile secret
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — public Turnstile site key (client-side)

### Anti-Patterns to Avoid

- **Do NOT throw from Server Actions** — always return `ActionResult`
- **Do NOT block guest confirmation on email failure** — email is best-effort
- **Do NOT store RSVP data in Sanity** — it goes to Google Sheets only (NFR-S7)
- **Do NOT access `localStorage` in the Server Action** — localStorage queuing is client-side only, handled by `RSVPChat.tsx`
- **Do NOT use `process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? '{}'`** — assert at module load, throw if missing

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns] — full RSVP data flow diagram
- [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns] — Server Action return type, env var assertion pattern
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns] — localStorage SSR-safe pattern
- [Source: _bmad-output/planning-artifacts/architecture.md#Integration Points & Data Flow] — RSVP flow: Turnstile → Sheets → Resend → return
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.4] — acceptance criteria

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- Lint initially failed due to unused `guestSlug` destructure — resolved by adding `guestSlug` to RSVPPayload for guest tracking
- No `emails/` directory existed — created with React Email template
- No `localStorage.ts` utility existed — created SSR-safe implementation per architecture spec
- Guest schema has no `email` field — email sending is conditional on `guestEmail` being provided in payload

### Completion Notes List
- Implemented full RSVP submission pipeline: Turnstile validation -> Google Sheets write -> Resend email (best-effort)
- Server Action returns typed `ActionResult`, never throws to client
- Sheets failures return `sheets_unavailable` error; client queues to localStorage and shows confirmation
- Resend failures are logged but never block guest confirmation
- Linked plus-one writes two separate rows to Google Sheets
- localStorage retry queue fires on page load and `online` event
- Added `googleapis` as production dependency
- All builds, lint, and typecheck pass cleanly

### Change Log
- 2026-04-14: Implemented Story 3.4 — RSVP submission with Google Sheets, Resend email, Turnstile validation, and localStorage retry queue
- 2026-04-14: Code review fixes — declined RSVPs now recorded, try/catch for Server Action errors, Turnstile token guard, RESEND_FROM_ADDRESS assertion, File List updated

### File List
- frontend/app/actions/rsvp.ts (new) — submitRsvp Server Action with RSVPPayload and ActionResult types
- frontend/lib/turnstile.ts (modified) — added verifyTurnstileToken() server-side validation
- frontend/lib/sheets.ts (modified) — added appendRsvpRows() with linked plus-one support
- frontend/lib/resend.ts (modified) — added sendRsvpConfirmation() with best-effort error handling, RESEND_FROM_ADDRESS assertion
- frontend/lib/localStorage.ts (new) — SSR-safe getLocalItem/setLocalItem/removeLocalItem utilities
- frontend/emails/RsvpConfirmation.tsx (new) — React Email template with wedding details
- frontend/components/ui/RSVPChat.tsx (modified) — wired submitRsvp Server Action, localStorage retry queue, decline recording, error recovery
- frontend/package.json (modified) — added googleapis dependency
- frontend/.env.local.example (modified) — added Turnstile, Sheets, Resend env var placeholders
- pnpm-lock.yaml (modified) — lockfile updated for googleapis
