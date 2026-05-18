# ADR 0002 — Linked plus-one cross-mutation is conditional, not last-write-wins

- **Status:** Accepted
- **Date:** 2026-05-17
- **Depends on:** [ADR-0001](0001-sanity-as-rsvp-source-of-truth.md) — Sanity as source of truth for RSVP state

## Context

The `guest` schema allows two guests to be configured as a couple via `plusOneType: 'linked'` + `plusOneLinkedGuest`. When Alice (linked to Bob) walks through the RSVP chat and selects *"Yes, we'll both be there,"* she is implicitly answering for two people in one submission. The existing Sheets implementation reflects this: a single "yes both" submission writes two rows ([frontend/lib/sheets.ts:59–67](../../frontend/lib/sheets.ts#L59)).

Under [ADR-0001](0001-sanity-as-rsvp-source-of-truth.md), Sanity becomes authoritative for RSVP state. We therefore have to decide what Alice's "yes both" submission does to **Bob's** `rsvpStatus` field on his own guest document.

The rest of the RSVP system follows a **last-write-wins** contract: concurrent edits don't lock, the most recent timestamp wins, and the Sheets audit log preserves the full chronology for reconciliation. Applying that same rule here is the simplest extension — Alice's "yes both" unconditionally writes `rsvpStatus: 'attending'` to Bob's doc, overriding whatever Bob had previously set.

There is one scenario where that simple rule produces a bad outcome:

> Bob explicitly RSVPed *"Sorry, I can't make it"* two weeks ago. Alice later, optimistically or by mistake, submits *"Yes, we'll both be there."* Under unconditional LWW, Bob's doc silently flips from `declined` to `attending`. Bob visits his slug, sees *"Attending — with Alice,"* and is confused — or worse, doesn't visit again and the couple has a no-show.

The asymmetry matters because:

1. The cross-mutation exists as a **convenience** — saving Bob a redundant tap when Alice happens to RSVP first. It is not, and was never intended to be, a mechanism for one partner to authoritatively answer on the other's behalf when that other has already spoken.
2. An explicit decline is **a deliberate act**. A mistaken "yes both" by a partner is **a guess**. The system should not let a guess silently override an explicit act.
3. The Sheets audit log records Bob's prior decline, but it is only consulted reactively. By the time the couple notices a discrepancy, Bob may already have been counted in the headcount sent to the caterer.

## Decision

When the server action processes a submission from Alice that includes a cross-mutation effect on Bob's doc, it **reads Bob's current `rsvpStatus` inside the same Sanity transaction** and applies the cross-mutation **only when Bob is still `'pending'`**. If Bob has already submitted an explicit answer (`'attending'` or `'declined'`), the cross-mutation is skipped. Alice's own doc is patched unconditionally.

Concretely:

```
transaction
  read  Bob.rsvpStatus
  patch Alice (always)
  patch Bob   (only if Bob.rsvpStatus === 'pending')
commit
```

The rule is symmetric: if Bob later submits *"yes, we'll both be there"* and Alice has already declined, Alice's doc is not touched.

## Consequences

### Positive

- **Explicit acts are protected.** A guest's deliberate decline cannot be silently overridden by a partner's optimistic submission.
- The convenience case — Alice answers before Bob has touched his link — continues to work exactly as before: Bob's status is `'pending'`, Alice's "yes both" updates both docs, Bob's next visit shows the summary card with no re-prompt.
- The data model remains internally consistent. Each guest's `rsvpStatus` reflects either their own explicit submission or their partner's first-mover convenience-write, never a stale silent override.
- The Sheets audit log is unchanged in shape — both rows are still appended on a "yes both" submission. The fact that Bob's Sanity doc may not have been written is a Sanity-level decision; Sheets remains a faithful log of what each submission *claimed*.

### Negative

- **The "yes both" chip can produce a stale assertion on Alice's summary card.** If Alice submits "yes both" while Bob has already declined, Alice's doc says `attending`, Bob's doc still says `declined`. Alice's summary card needs to render the truthful state — *"Attending — Bob can't make it"* — by reading Bob's `rsvpStatus` at render time. This is mandatory wiring; without it, Alice sees *"Attending — with Bob"* on her own card while the couple's dashboard shows Bob as declined.
- **One more read inside the transaction.** Sanity's `transaction.execute()` supports reading the current state of a document as part of the transaction; we use that to inspect Bob's `rsvpStatus` before deciding whether to include the patch. This is a marginal complexity bump over an unconditional patch.
- **One asymmetric rule in an otherwise uniform LWW system.** Future readers will reasonably wonder why this one corner deviates. This ADR is the answer; it should be referenced in the server action's code.

### Rejected alternatives

- **Unconditional last-write-wins.** Strictly simpler, uniform with the rest of the system. Rejected because the failure mode — silently flipping an explicit decline — is worse than the complexity it saves. The cost of the alternative is one extra read in the transaction; the cost of getting this wrong is a guest showing up to a wedding they declined, or being counted in a headcount they should not be in.
- **Warn Alice in the chat: "Bob has already declined. Confirming for yourself only?"** Stronger UX, but adds a new chat branch with its own copy, animation, and accessibility surface for a rare case. The conditional cross-mutation gives us the same data-integrity guarantee without any UI work; if a future iteration wants the warning copy on top, it can be added without changing this decision.
- **Cap edits to the partner only when they originated from the *other* partner's submission.** Conceptually similar but harder to express: it requires tracking provenance ("Alice wrote this") on each field. Conditional-on-pending is a clean state-based rule with no provenance tracking needed.
