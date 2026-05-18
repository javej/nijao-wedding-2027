# ADR 0001 — Sanity as source of truth for RSVP state, Google Sheets demoted to audit log

- **Status:** Accepted
- **Date:** 2026-05-17
- **Supersedes:** the prior implicit decision captured in NFR-S7 ("Guest personal data stored only in Google Sheets")

## Context

Through Story 3.4 the RSVP submission path writes to Google Sheets as its only persistent store. The chat's notion of "this guest already RSVPed" is held in browser `sessionStorage`, keyed by slug. That works for the linear first-time journey the original PRD anticipated, but two new requirements break it:

1. **A guest who already RSVPed must be able to change their answer** up until the **2026-11-08** cutoff (two months before the wedding).
2. **A returning guest must see, on every visit, that they have already answered** — never re-prompted to RSVP for the first time. This must hold even on a new device, a private window, or after `sessionStorage` is cleared.

Both requirements demand a per-guest "current RSVP" lookup that is **cheap on every page render** and **survives across devices**. Google Sheets, in its current shape, cannot satisfy this:

- Sheets is append-only in our implementation. Edits would either need to update rows in place (fragile row-lookup logic, race conditions on concurrent edits, awkward handling of linked plus-one pair rows) or accumulate duplicate rows that the page render must dedupe.
- Reading Sheets on every guest visit incurs a Google API round-trip (~150–400 ms TTFB) — meaningful on Philippine LTE where 90%+ of guests are accessing the site.
- Sheets is the wrong shape for the read pattern. "What's the current state for guest with slug X" is a primary-key lookup; Sheets gives us a chronological event stream.

We considered four candidate stores:

| Option | Read latency on `/[slug]` | Cross-device | Edit ergonomics | Net cost |
|---|---|---|---|---|
| Google Sheets only | ~150–400 ms per visit (or stale cache) | yes | append-with-dedup or fragile updates | high |
| Vercel KV / Upstash Redis | ~10 ms | yes | trivial | new infra + a fourth datastore |
| Cached Sheets read (e.g., Next cache + tag invalidate) | ~10 ms warm, slow cold | yes | still needs dedup or in-place update | medium |
| **Sanity guest document** | **free — same query the page already runs** | **yes** | **mutate the doc** | **near zero** |

The page at [frontend/app/(main)/[slug]/page.tsx](../../frontend/app/(main)/[slug]/page.tsx) already calls `getGuestBySlug` to render the personalized greeting. Extending the same `guest` document with RSVP fields means the "already answered?" check piggybacks on a query we are already running — no extra round-trip on the hot path. Sanity is also already the source of truth for every other piece of guest metadata (`firstName`, `slug`, `plusOneEligible`, `plusOneType`, `plusOneLinkedGuest`); putting RSVP state anywhere else creates an unnecessary split.

## Decision

**Sanity is authoritative** for the current RSVP state of every guest. Google Sheets is demoted to an **append-only audit log** and **CSV export surface** — it continues to receive a row on every submission, but no code reads Sheets for live state.

Concretely:

- The `guest` schema gains `rsvpStatus`, `rsvpUpdatedAt`, and `openPlusOne` fields (see Story 5.1 for shape). These fields are `readOnly` in Sanity Studio and written exclusively by the server action.
- The server action `submitRsvp` writes Sanity as the primary durable write inside a `client.transaction()`, then appends a row to Sheets (best-effort), then calls `revalidateTag(\`guest:${slug}\`)`.
- The RSVP dashboard (Story 4.4) is rewritten to read directly from Sanity. The `/api/rsvp-data` route, its dashboard-secret env var, and its CORS plumbing are removed.

## Consequences

### Positive

- The "already answered" check on every page render is zero extra latency — it's a projection on a query that already runs.
- Editing is a natural Sanity patch. No append-and-dedup logic, no row-lookup, no concurrent-edit race window in Sheets.
- The dashboard reads a single authoritative source. Headcount math no longer requires deduping multiple rows per guest.
- The audit log in Sheets becomes useful again *as* an audit log: a chronological record of every submission, including edits, with the original timestamp preserved.
- Linked plus-one cross-mutations (one submission writing to two guest docs) are atomic via Sanity's `transaction()` API.

### Negative

- **NFR-S7 requires amendment.** The original wording — *"Guest personal data (name, RSVP response) stored only in Google Sheets — no persistent database exposed to the internet"* — is now contradicted. The spirit of NFR-S7 (keep guest data out of public reach) is preserved: Sanity content remains accessed server-side via read-only token (NFR-S5), and Sanity Studio is gated by authenticated login (NFR-S6). Sanity is not exposed to the internet in the sense NFR-S7 was guarding against. The NFR text is updated in the epics doc to reflect the new arrangement.
- The server action now needs a **Sanity write token** (`SANITY_API_WRITE_TOKEN`) in Vercel env. Read-only token is insufficient for mutations.
- The slug page must opt into ISR-with-tag-revalidation. We accept the small additional plumbing (a `next: { tags: [...] }` option on the fetch + a `revalidateTag` call in the server action) because it preserves static rendering on the hot path.
- A latent bug class: if the server action commits the Sanity write but then crashes before appending to Sheets, the audit log drifts from the source of truth. We accept this asymmetry — Sanity is the truth; Sheets missing a row is a recoverable nuisance, not a correctness bug.

### Rejected alternatives

- **Vercel KV / Upstash Redis.** Pristine fit for the read pattern, but introduces a fourth persistent store (Sanity + Sheets + sessionStorage + KV) that the couple would have to operate. Not worth the complexity given Sanity solves the problem natively.
- **Cached Sheets reads.** Stays "Sheets-authoritative" in the architecture diagram, but doesn't actually solve the edit problem (we still need append-with-dedup or in-place update) and adds cache-invalidation plumbing that's no simpler than Sanity revalidation.
- **Dynamic page rendering (drop `dynamicParams = false`).** Solves the read latency by giving up on static. Rejected for performance on Philippine LTE — see ADR considerations in Story 5.1 task notes.
