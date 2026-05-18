# Story 5.1: RSVP Cross-Session Persistence & Editing

Status: ready-for-dev

## Story

As a **guest who has already submitted an RSVP**,
I want to see my prior answer the moment I land on my personalized link — on any device, in any browser — and be able to change it up until two months before the wedding,
so that I never get re-prompted as if I'd never answered, and I'm not locked in if my plans change.

## Acceptance Criteria

### Source of truth & schema

1. **Given** the `guest` schema is extended with three new fields, **When** the schema is regenerated, **Then** every `guest` document has `rsvpStatus` (`'pending' | 'attending' | 'declined'`, defaults to `'pending'`), `rsvpUpdatedAt` (datetime, optional), and `openPlusOne` (object with `attending: boolean` and `name: string`, optional, hidden in Studio unless `plusOneType === 'open'`) — all marked `readOnly: true` in the Studio UI (per [ADR-0001](../../docs/adr/0001-sanity-as-rsvp-source-of-truth.md))

2. **Given** any guest with no prior RSVP, **When** their slug page renders, **Then** Sanity's `rsvpStatus` is read as `'pending'` and the RSVP section renders the first-time chat exactly as it does today

### Returning guest: summary card + reveal

3. **Given** a guest with `rsvpStatus === 'attending'`, **When** their slug page renders, **Then** the RSVP section shows a minimal summary card reading *"We have you down for January 8 ✓"* with a one-line attendance detail (see derivation rule in AC 5) and a *"Need to change?"* affordance — no chat, no chips, no input

4. **Given** a guest with `rsvpStatus === 'declined'`, **When** their slug page renders, **Then** the RSVP section shows a summary card reading *"You let us know you can't make it. We'll miss you."* and a *"Changed your mind?"* affordance

5. **Given** the guest's `plusOneType`, **When** the attendance detail line on the summary card is computed, **Then** it derives from the live state of related docs (not from a duplicated field):
   - `plusOneEligible === false` → *"Attending."*
   - `plusOneType === 'linked'` and partner's `rsvpStatus === 'attending'` → *"Attending — with {partner firstName}."*
   - `plusOneType === 'linked'` and partner's `rsvpStatus === 'declined'` → *"Attending — {partner firstName} can't make it."*
   - `plusOneType === 'linked'` and partner's `rsvpStatus === 'pending'` → *"Attending."* (no partner mention)
   - `plusOneType === 'open'` and `openPlusOne.attending === true` → *"Attending — with {openPlusOne.name}."*
   - `plusOneType === 'open'` and `openPlusOne.attending !== true` → *"Attending."*

6. **Given** a returning guest views their summary card, **When** they tap *"Need to change?"* or *"Changed your mind?"*, **Then** the summary card is replaced by the existing `<RSVPChat>` opening at the first question (*"Will you be joining us on January 8?"*) — no pre-filled chips, no history threading, identical to a first-time guest's chat

7. **Given** a guest completes an edit submission, **When** the server action returns success, **Then** the section returns to the summary-card view with the new values reflected, **and** the same petal-burst + haptic confirmation moment from Story 3.5 plays for a fresh `'attending'` outcome

### Submission, persistence, and revalidation

8. **Given** a successful submission (initial or edit), **When** the server action runs, **Then** it writes the guest's `rsvpStatus`, `rsvpUpdatedAt`, and (for `plusOneType === 'open'`) `openPlusOne` fields to Sanity inside a `client.transaction()`, **and** the existing Sheets append + Resend email logic continues unchanged from Story 3.4

9. **Given** a successful Sanity mutation, **When** the server action completes, **Then** `revalidateTag(\`guest:${slug}\`)` is called so the static page re-renders with the new state on the next request — the slug page's Sanity fetch is tagged with `guest:${slug}` accordingly

10. **Given** a submission from a guest with `plusOneType === 'linked'` selecting *"Yes, we'll both be there"*, **When** the server action runs, **Then** the transaction reads the partner's current `rsvpStatus` and applies the partner-side patch **only if the partner is still `'pending'`** (per [ADR-0002](../../docs/adr/0002-conditional-cross-mutation-linked-plus-ones.md)). The submitter's own doc is always patched.

11. **Given** a submission from a guest with `plusOneType === 'open'` selecting *"Just me"* after previously bringing a plus-one, **When** the server action runs, **Then** the `openPlusOne` field on the guest's doc is unset (set to `null`) so the summary card no longer shows a plus-one name

12. **Given** any submission attempt, **When** the server action runs, **Then** it checks `Date.now() < CUTOFF_TIMESTAMP` where `CUTOFF_TIMESTAMP === Date.parse('2026-11-08T00:00:00+08:00')`. If the cutoff has passed, the action returns `{ success: false, error: 'rsvp_closed' }` without writing to Sanity, Sheets, or Resend

### Cutoff (Nov 8, 2026 PHT) UI

13. **Given** the current time is at or after the cutoff and the guest's `rsvpStatus === 'attending'`, **When** the slug page renders, **Then** the summary card displays without the *"Need to change?"* affordance, with a small caption *"RSVPs are now closed."*

14. **Given** the current time is at or after the cutoff and the guest's `rsvpStatus === 'declined'`, **When** the slug page renders, **Then** the summary card displays without the *"Changed your mind?"* affordance, with the same closed caption

15. **Given** the current time is at or after the cutoff and the guest's `rsvpStatus === 'pending'`, **When** the slug page renders, **Then** the RSVP section renders a closed-state panel: *"RSVPs have closed on November 8. If you'd still like to reach us, please contact Jave & Nianne directly."* No chat, no chips, no input

16. **Given** a guest with a stale cached page submits after the cutoff, **When** the server action rejects with `error: 'rsvp_closed'`, **Then** the chat surfaces the closed-state copy gracefully — no raw error toast

### Dashboard

17. **Given** the Sanity Studio RSVP dashboard plugin is opened, **When** it loads its data, **Then** it queries Sanity directly for current `guest` state (not `/api/rsvp-data`) — counting `attending` / `declined` / `pending` and listing each guest's current RSVP with `rsvpUpdatedAt`

18. **Given** the dashboard's CSV export is triggered, **When** the file downloads, **Then** it contains current RSVP state from Sanity (one row per guest, latest values), not the full Sheets event log

19. **Given** the migration is complete, **When** the codebase is reviewed, **Then** `/api/rsvp-data` route, `RSVP_DASHBOARD_SECRET` and `RSVP_DASHBOARD_ALLOWED_ORIGINS` env vars, and the dashboard's secret-header fetch path have been deleted

### Non-regression

20. **And** all Story 3.3 chat behaviors continue to work unchanged — natural-language recognition, free-text input, mobile keyboard offset, Turnstile placeholder, localStorage Sheets-retry queue (if Sheets fails, Sanity still wrote — the retry only re-attempts the append)

21. **And** `pnpm build && pnpm lint && pnpm typecheck` pass with zero errors across both `frontend` and `studio` workspaces

22. **And** NFR-S7 in `epics.md` is updated to reflect the new arrangement: RSVP state lives in Sanity (read server-side via authenticated token, Studio gated by auth) with Sheets as an append-only audit log

## Tasks / Subtasks

- [ ] **Task 1 — Sanity schema migration (AC: 1, 2)**
  - [ ] 1.1 Update `studio/schemas/documents/guest.ts` to add `rsvpStatus` (string with `options.list` for `pending` / `attending` / `declined`, default `pending`), `rsvpUpdatedAt` (datetime), and `openPlusOne` (object with `attending: boolean` and `name: string`)
  - [ ] 1.2 Mark all three fields `readOnly: true` and `hidden` per the rules: `openPlusOne` hidden unless `plusOneType === 'open'`; the other two visible for review but `readOnly`
  - [ ] 1.3 Group the three fields under a Sanity fieldset titled *"RSVP (managed by site — do not edit)"* so the couple understands they're auto-managed
  - [ ] 1.4 Run `pnpm typegen` from workspace root and verify the generated `Guest` interface in `frontend/sanity.types.ts` includes the new fields
  - [ ] 1.5 Existing guest documents in the dataset will not have these fields populated; the schema must treat the absence of `rsvpStatus` as semantically equivalent to `'pending'`

- [ ] **Task 2 — Server action rewrite (AC: 8, 9, 10, 11, 12, 16)**
  - [ ] 2.1 Add `SANITY_API_WRITE_TOKEN` to `.env.local.example` and as a required env var in Vercel (production + preview)
  - [ ] 2.2 Create a server-side Sanity write client in `frontend/sanity/lib/write.ts` using the write token; this is distinct from the existing read client. Assert the token at module load
  - [ ] 2.3 In `frontend/app/actions/rsvp.ts`, extend `RSVPPayload` to include `plusOneType: 'linked' | 'open' | null`, `plusOneAttending: boolean`, and `linkedPartnerSlug?: string`. The existing `linkedGuest` field can stay as-is for the Sheets payload, but the action needs structured info to make Sanity decisions
  - [ ] 2.4 At the top of `submitRsvp`, check the cutoff: `if (Date.now() >= Date.parse('2026-11-08T00:00:00+08:00')) return { success: false, error: 'rsvp_closed' }`. Export the cutoff constant from a shared module so the page can render the closed UI from the same source
  - [ ] 2.5 Compose a Sanity transaction that:
    - Looks up the submitter's `_id` by slug
    - Patches submitter with `{ rsvpStatus, rsvpUpdatedAt: now, openPlusOne: ... }` (set or unset `openPlusOne` per AC 11)
    - For `plusOneType === 'linked'` + `plusOneAttending`: fetch the partner's current `rsvpStatus` first; include a partner patch in the transaction only if it is `'pending'` or absent
    - Commit
  - [ ] 2.6 After Sanity commit, append the Sheets row(s) using existing `appendRsvpRows()` — keep the existing logic exactly. If Sheets fails, still return success (Sanity is authoritative; existing localStorage retry queue continues to handle the resend)
  - [ ] 2.7 After Sanity commit, call `revalidateTag(\`guest:${slug}\`)`. For linked cross-mutation that actually wrote to the partner, also `revalidateTag(\`guest:${partnerSlug}\`)`
  - [ ] 2.8 Email logic (`sendRsvpConfirmation`) stays identical — fires on `attending && guestEmail`, best-effort, never blocks
  - [ ] 2.9 Map server errors to `ActionResult`: Sanity write failure → `{ success: false, error: 'sanity_unavailable' }`; cutoff → `{ success: false, error: 'rsvp_closed' }`; everything else → `{ success: false, error: 'unexpected' }`. Never throw

- [ ] **Task 3 — Slug page projection and state derivation (AC: 3, 4, 5, 13, 14, 15)**
  - [ ] 3.1 Extend `getGuestBySlug` GROQ in `frontend/sanity/queries/guests.ts` to project `rsvpStatus`, `rsvpUpdatedAt`, `openPlusOne`, and `plusOneLinkedGuest->{firstName, slug, rsvpStatus}`. Tag the fetch with `{ next: { tags: [\`guest:${slug}\`] } }`
  - [ ] 3.2 In `frontend/app/(main)/[slug]/page.tsx` or its child Server Component, compute three view-state booleans for the RSVP section: `isClosed = Date.now() >= CUTOFF_TIMESTAMP`, `hasAnswered = rsvpStatus !== 'pending'`, plus the derived attendance-detail string per AC 5
  - [ ] 3.3 Pass these into `<RSVPSection>` as new props alongside the existing `guest` prop

- [ ] **Task 4 — RSVPSection summary-card + reveal toggle (AC: 3, 4, 6, 7, 13, 14, 15)**
  - [ ] 4.1 In `frontend/components/sections/RSVPSection.tsx`, accept the new props (`isClosed`, `hasAnswered`, `detailLine`, `summaryHeadline`)
  - [ ] 4.2 Manage a local `'summary' | 'chat'` UI state — initial value derived from `hasAnswered && !isClosed ? 'summary' : (isClosed && !hasAnswered ? 'closed' : 'chat')`
  - [ ] 4.3 Render a new `<RSVPSummaryCard>` component for the summary view: minimal layout matching the section's existing typography and palette. *"Need to change?"* / *"Changed your mind?"* is a simple text link (not a button) for visual restraint. Reveal animation: a Framer Motion crossfade matching existing chat bubble timings
  - [ ] 4.4 Render a new `<RSVPClosedPanel>` component for the closed-state panel (AC 15)
  - [ ] 4.5 On reveal tap, swap to `<RSVPChat>` exactly as today. After a successful submission, swap back to the summary card with updated values — the page will revalidate, but the optimistic local state should also update so the swap feels instant
  - [ ] 4.6 Delete the sessionStorage-restore branch in `RSVPChat` ([RSVPChat.tsx:279–297](../../frontend/components/ui/RSVPChat.tsx#L279)) and the associated persist effect ([:317–335](../../frontend/components/ui/RSVPChat.tsx#L317)). The Sanity-derived state from the parent is now the source of truth; sessionStorage is no longer the persistence mechanism

- [ ] **Task 5 — Cutoff enforcement, both sides (AC: 12, 13, 14, 15, 16)**
  - [ ] 5.1 Export `RSVP_CUTOFF` as an ISO string and a derived `Date.now()` comparison helper from a shared module (e.g., `frontend/lib/rsvp-cutoff.ts`). Both the server action and the page import from the same source
  - [ ] 5.2 In the page (Task 3.2), compute `isClosed` server-side and render the appropriate panel (with/without affordance, or closed-state panel for pending guests)
  - [ ] 5.3 In the action (Task 2.4), reject submissions past the cutoff
  - [ ] 5.4 In `RSVPChat`, handle `error === 'rsvp_closed'` from a submission by rendering the closed-state copy instead of the retry path

- [ ] **Task 6 — Dashboard switch from Sheets to Sanity (AC: 17, 18, 19)**
  - [ ] 6.1 In `studio/plugins/rsvp-dashboard/RsvpDashboardTool.tsx`, replace the `fetch('/api/rsvp-data', ...)` call with a Sanity client query: `*[_type == "guest"]{firstName, slug, plusOneEligible, plusOneType, openPlusOne, rsvpStatus, rsvpUpdatedAt, "linkedPartner": plusOneLinkedGuest->{firstName, rsvpStatus}}`
  - [ ] 6.2 Update headcount computation: counts derive from `rsvpStatus` enum values; "attending with plus-one" reads `openPlusOne.attending` for open and `linkedPartner.rsvpStatus === 'attending'` for linked
  - [ ] 6.3 Update CSV export to project current Sanity state (one row per guest), preserving the existing column order so the caterer's expected file shape doesn't change
  - [ ] 6.4 Delete `frontend/app/api/rsvp-data/route.ts`
  - [ ] 6.5 Remove `RSVP_DASHBOARD_SECRET` and `RSVP_DASHBOARD_ALLOWED_ORIGINS` from `.env.local.example`, `frontend/.env.local.example`, `studio/.env.local.example`, the Studio plugin code, and any Vercel project env vars (note in the PR description that the Vercel-side removal must be done manually after merge)
  - [ ] 6.6 Verify the Studio bundle no longer ships the dashboard secret to the browser

- [ ] **Task 7 — NFR-S7 amendment (AC: 22)**
  - [ ] 7.1 Update `_bmad-output/planning-artifacts/epics.md` NFR-S7 text to: *"Guest personal data (name, RSVP response) lives in Sanity (gated by authenticated Studio access and server-side read tokens) with Google Sheets as an append-only audit/export log. No public database endpoint is exposed."*
  - [ ] 7.2 Link to ADR-0001 from the NFR line for context

- [ ] **Task 8 — Verify, test, ship (AC: 20, 21)**
  - [ ] 8.1 Local: create three test guests — one un-answered, one attending with linked partner, one declined. Verify each scenario from the AC list
  - [ ] 8.2 Test the cross-mutation conditional path: set Bob's `rsvpStatus` to `declined` directly in Studio, then submit *"yes both"* from Alice's page — confirm Bob's doc is **not** flipped, and Alice's summary card renders *"Attending — Bob can't make it"*
  - [ ] 8.3 Test cutoff: temporarily override the cutoff constant to a past timestamp, verify all three cutoff-state UIs render
  - [ ] 8.4 Test edit flow end-to-end: submit, see summary card, tap *"Need to change?"*, change answer, see updated summary card, confirm email re-sent
  - [ ] 8.5 Test dashboard: counts match the guest docs; CSV export contains the current state
  - [ ] 8.6 Run `pnpm build && pnpm lint && pnpm typecheck` in both workspaces — zero errors
  - [ ] 8.7 Confirm `RSVP_DASHBOARD_SECRET` no longer present in Studio bundle (grep the build output)

## Dev Notes

### Architecture Patterns & Constraints

- **Sanity is authoritative; Sheets is an audit log.** This is the architectural pivot of the story. See [ADR-0001](../../docs/adr/0001-sanity-as-rsvp-source-of-truth.md). The server action must write Sanity *before* Sheets — if either fails, Sanity's success is what matters for the guest's experience.
- **Conditional cross-mutation for linked plus-ones.** When Alice submits *"yes both,"* the partner's patch is included in the transaction only if the partner is still `pending`. See [ADR-0002](../../docs/adr/0002-conditional-cross-mutation-linked-plus-ones.md). This is the *only* corner of the system that breaks last-write-wins; document the reason inline in the server action code.
- **Static rendering preserved.** The slug page stays statically generated; the action calls `revalidateTag(\`guest:${slug}\`)` after each mutation. Do NOT switch the page to `force-dynamic`.
- **Atomic submissions.** Every submission overwrites the full RSVP — no piecewise field editing. The chat re-runs identically for edits.
- **Cutoff is shared.** Both the server-side guard and the client-side rendered UI import the same `RSVP_CUTOFF` constant. Never duplicate the date literal.
- **No backwards-compatibility shims.** sessionStorage state for restoration is gone. There is no migration of existing Sheets rows into Sanity — the dataset has not yet seen production RSVPs (per project status), and any test rows in Sheets are not authoritative.

### Project Structure Notes

- **New files**:
  - `frontend/sanity/lib/write.ts` — Sanity write client (uses `SANITY_API_WRITE_TOKEN`)
  - `frontend/lib/rsvp-cutoff.ts` — shared `RSVP_CUTOFF` constant + `isRsvpClosed()` helper
  - `frontend/components/ui/RSVPSummaryCard.tsx` — new summary-card UI
  - `frontend/components/ui/RSVPClosedPanel.tsx` — new closed-state UI
- **Files modified**:
  - `studio/schemas/documents/guest.ts` — add 3 RSVP fields
  - `frontend/sanity/queries/guests.ts` — project the new fields, add tag
  - `frontend/app/actions/rsvp.ts` — full rewrite of action body
  - `frontend/components/sections/RSVPSection.tsx` — toggle between summary/chat/closed
  - `frontend/components/ui/RSVPChat.tsx` — delete sessionStorage branch; handle `rsvp_closed` error
  - `studio/plugins/rsvp-dashboard/RsvpDashboardTool.tsx` — read Sanity instead of `/api/rsvp-data`
- **Files deleted**:
  - `frontend/app/api/rsvp-data/route.ts`
- **Env vars added**: `SANITY_API_WRITE_TOKEN` (Vercel production + preview, both)
- **Env vars removed**: `RSVP_DASHBOARD_SECRET`, `RSVP_DASHBOARD_ALLOWED_ORIGINS`

### Anti-Patterns to Avoid

- **Do NOT keep sessionStorage as a fallback.** The Sanity-derived state is the truth; a stale sessionStorage value would cause the summary card to lie. Delete it.
- **Do NOT switch the slug page to dynamic rendering.** Static + revalidateTag is the explicit design (ADR-0001 negative consequences).
- **Do NOT write `plusOneAttending` to Alice's doc when she has a `linked` plus-one.** Linked plus-one attendance is derived from the partner's own `rsvpStatus`. Storing it would create a sync problem.
- **Do NOT unconditionally cross-mutate.** Read the partner's `rsvpStatus` first; only patch if `pending`. See ADR-0002.
- **Do NOT dedupe Sheets rows.** Sheets remains the chronological audit log. The dashboard reads Sanity for current state — never reach into Sheets to "find the latest" row.
- **Do NOT inline the cutoff date in multiple files.** Use the shared constant.
- **Do NOT change the existing chat component's flow logic.** Wrap it; don't fork it.

### References

- [Source: ../../docs/adr/0001-sanity-as-rsvp-source-of-truth.md](../../docs/adr/0001-sanity-as-rsvp-source-of-truth.md) — full rationale for Sanity as source of truth
- [Source: ../../docs/adr/0002-conditional-cross-mutation-linked-plus-ones.md](../../docs/adr/0002-conditional-cross-mutation-linked-plus-ones.md) — the conditional cross-mutation rule
- [Source: ../../CONTEXT.md](../../CONTEXT.md) — glossary (RSVP vs RSVP submission vs RSVP audit log)
- [Source: ./3-3-conversational-rsvp-interface.md](./3-3-conversational-rsvp-interface.md) — chat flow being preserved
- [Source: ./3-4-rsvp-submission-google-sheets-email.md](./3-4-rsvp-submission-google-sheets-email.md) — Sheets/Resend pipeline being layered over
- [Source: ./3-5-rsvp-in-site-confirmation.md](./3-5-rsvp-in-site-confirmation.md) — petal burst + haptic moment preserved
- [Source: ./4-1-webhook-isr-live-content-publishing.md](./4-1-webhook-isr-live-content-publishing.md) — tag revalidation pattern
- [Source: ./4-4-rsvp-dashboard-export.md](./4-4-rsvp-dashboard-export.md) — dashboard being rewired
