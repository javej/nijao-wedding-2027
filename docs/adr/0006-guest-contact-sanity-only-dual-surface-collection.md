# ADR 0006 — Guest contact is a Sanity-only durable attribute, collected at two surfaces

- **Status:** Accepted
- **Date:** 2026-06-03
- **Depends on:** [ADR-0001](0001-sanity-as-rsvp-source-of-truth.md) — Sanity as source of truth; [ADR-0002](0002-conditional-cross-mutation-linked-plus-ones.md) — linked plus-one cross-mutation

## Context

We want to collect each guest's **email** and **PH mobile number** during the RSVP flow, to support email RSVP confirmation (already half-wired but inert — `RSVPPayload.guestEmail` is never populated by the chat) and a future SMS blast.

Two questions shape the design:

1. **Where does contact live?** An email and a mobile number are facts about *the person*, not about a particular yes/no answer. Per the domain language, the **RSVP** is fully replaced on each submission, while the **Guest** is the durable identity. Contact therefore belongs with the Guest, not the RSVP.

2. **Where do we collect it?** The obvious answer is "in the RSVP chat." But under [ADR-0002](0002-conditional-cross-mutation-linked-plus-ones.md), a submitter who selects *"Yes, we'll both be there"* cross-mutates their **linked partner's** `rsvpStatus` to `attending`. Per [ADR-0001](0001-sanity-as-rsvp-source-of-truth.md) + `rsvp-view-state.ts`, a guest whose status is no longer `pending` lands on the **summary card**, *not* the chat. So a linked partner who was answered-for **never sees the chat** — the chat alone can never collect their contact.

We also had to decide whether contact is mirrored into the Google Sheets audit log alongside the existing columns (name, attending, plusOneName, timestamp, slug).

## Decision

**Contact (`email`, `mobile`) is a durable, editable attribute on the Sanity `guest` document, and nowhere else.**

- It is **Sanity-only** — *not* written to the Sheets audit log. The Sheet remains a record of *what happened*; contact is *who to reach*, and lives on the authoritative guest doc. A future blast queries Sanity (where the RSVP dashboard already reads).
- Studio exposes it in an **editable "Contact" fieldset** with the identity fields — *not* the read-only "RSVP (managed by site)" fieldset — so the couple can backfill and correct.
- Both fields are **optional**: contact never blocks the attendance RSVP. Mobile is validated structurally as a PH mobile (`9`+9 national digits; accepts `09…`, `+639…`, `639…`, `9…`) and stored canonical as **E.164 `+639XXXXXXXXX`**. Email is trimmed + lowercased with a pragmatic regex. Validation applies only when a value is entered.

**Contact is collected at two surfaces**, both attending-only and both only when contact is missing:

1. **In the RSVP chat** — after plus-one resolution, before submit: two sequential, skippable asks. The write rides the existing `submitRsvp` patch on the submitter's doc.
2. **On the summary card** — a dismissible inline mini-form for an attending guest who lands there with no contact on file. This is a **contact-only write** — it `set`s `email`/`mobile` and never touches `rsvpStatus` or the audit log, so it is not a re-RSVP.

The second surface exists **specifically to close the linked-partner gap created by ADR-0002**: it is the only path by which an answered-for partner (who never sees the chat) can supply their own contact through the site. It also gives first-time skippers a gentle second chance.

Contact is collected for the **submitting guest only** — a submitter is never asked for a partner's contact. Remaining gaps are backfilled by the couple in Studio.

## Consequences

### Positive

- Contact sits on the same authoritative doc as the rest of guest identity (ADR-0001) — the future blast reads one source, no dedup.
- PII stays on the single gated surface (authenticated Studio + server-side read token). The loosely-shared audit Sheet gains no emails or phone numbers.
- The summary-card surface makes contact coverage reachable for linked partners despite ADR-0002, without re-running the RSVP or disturbing RSVP state.
- Activates the previously-inert confirmation email path.

### Negative

- **Two collection UIs to maintain** with shared validation/normalization — the chat asks and the summary mini-form. This split is intentional but is the kind of thing that looks redundant without this ADR.
- Coverage is still **best-effort**: a linked partner who never opens their own link, and any guest who skips both prompts, will have no contact until the couple backfills it manually.
- Contact is both site-written and couple-editable, so a guest re-RSVPing sees (and may overwrite) the current stored value, including a couple's correction. Accepted — last-write-wins, contact changes are rare.

### Rejected alternatives

- **Contact as part of the RSVP submission.** Would re-collect it on every answer change and let it differ per submission — wrong for a stable per-guest contact list, and noisy against the "RSVP is fully replaced" model.
- **Mirror contact into the Sheets audit log.** Convenient for a manual mail-merge, but duplicates PII onto a second, less-controlled surface and creates two places to keep correct — against the ADR-0001 framing.
- **Chat-only collection.** Simplest, but structurally cannot reach linked partners who were answered-for (ADR-0002), leaving a permanent hole in blast coverage for exactly the couples the site goes out of its way to support.
- **Collect the partner's contact from the submitter.** Closes the gap at the source, but asks one guest for another's phone/email — invasive and often unknown.
- **Require contact to submit.** Best coverage, but risks losing the *attendance* answer (the one thing we can't afford to lose) when a guest won't share a number or has no email.
