# ADR 0008 — Guest parking is a tri-state Sanity-only attribute, collected in the chat and on the summary card

- **Status:** Accepted
- **Date:** 2026-09-07
- **Depends on:** [ADR-0001](0001-sanity-as-rsvp-source-of-truth.md) — Sanity as source of truth; [ADR-0002](0002-conditional-cross-mutation-linked-plus-ones.md) — linked plus-one cross-mutation; [ADR-0006](0006-guest-contact-sanity-only-dual-surface-collection.md) — contact as a dual-surface Guest attribute

## Context

The venue needs a list of car plates for parking. We want to ask each attending guest for their plate during the RSVP chat, track the answers in Studio, and let a guest who doesn't know yet say so without losing them — and then find their way back to add it later.

Three questions shape the design:

1. **Where does the plate live?** A car is a fact about *the person*, not about a particular yes/no answer, exactly like email and mobile in ADR-0006. It belongs on the Guest, not the RSVP.

2. **What does "not sure" mean as data?** A plate field that is simply empty cannot distinguish a guest who was never asked (everyone who RSVP'd before this shipped, plus every linked partner answered-for under ADR-0002) from a guest who explicitly said "I don't know yet". The couple needs that distinction to know who to chase, and the site needs it to word the summary card honestly.

3. **How does a guest get back to it?** Under ADR-0001, a guest who has answered lands on the summary card, not the chat. If the only way to add a plate is to re-run the whole RSVP, most "not sure" answers will never be completed.

## Decision

**Parking is a durable, editable attribute on the Sanity `guest` document, and nowhere else**, stored as one object:

```
parking: { status: "plate" | "unsure" | "none", plate?: string }
```

- **Absent** means *never asked*. `unsure` means the guest explicitly doesn't know yet. `none` means the guest is not driving. `plate` carries the plate.
- **`none` exists deliberately.** Without it, guests who commute or ride with someone would have to pick "not sure yet", which would pollute the couple's chase list and leave their summary card nagging them forever.
- It is **Sanity-only**, not mirrored to the Sheets audit log, per the ADR-0006 reasoning: the Sheet records *what happened*; the plate is *who to expect at the gate*, and lives on the authoritative guest doc where the RSVP dashboard already reads.
- Studio exposes it in an editable **"Parking" fieldset**, not the read-only "RSVP (managed by site)" fieldset, so the couple can backfill when a guest texts them a plate.
- The plate is normalized to **uppercase with single-space separators** and validated loosely: 4–10 alphanumerics with at least one letter and one digit. PH plates come in several shapes and the field is optional, so rejecting a real plate is worse than accepting an odd one.
- Parking **never blocks** the attendance answer.

**Parking is collected at two surfaces**, both attending-only:

1. **In the RSVP chat**, after plus-one resolution and before the contact asks. Chips: *Not sure yet*, *Not driving*, and *Same car, ABC 1234* when a plate is already on file; free text takes a plate. Choosing *Not sure yet* replies with an explicit pointer back: "You can come back to this page anytime and add it from your RSVP summary." The answer rides the existing `submitRsvp` write. The whole object is set, so switching from a plate to *Not sure yet* drops the stale plate; a decliner's payload carries no answer and leaves any prior answer untouched.
2. **On the summary card**, a permanent parking line ("Car plate: ABC 1234", "Car plate: not sure yet", "Car plate: not added yet", or "Not driving.") with an inline *Add it* / *Update* control that opens a plate-only form. This is a **parking-only write** (`submitGuestParking`): it never touches `rsvpStatus` or the audit log, so it is not a re-RSVP. The line is always visible, so the way back is always on screen.

The summary-card surface is also the only path by which an **answered-for linked partner** (ADR-0002), who never sees the chat, can record their own car or say they're riding along. As with contact, a submitter is never asked for their partner's plate.

## Consequences

### Positive

- One authoritative place for the parking list; the dashboard's *Cars* tile, per-row badge, and CSV column read the same doc as everything else.
- "Not sure yet" is a first-class, tracked state rather than an empty field, so the couple can see exactly who still owes a plate, and pre-existing attendees show as "not added" rather than being silently conflated.
- Guests can complete a deferred answer in seconds without re-running the RSVP.
- Reuses the ADR-0006 pattern (durable attribute, two surfaces, shared normalizer), so the shape is already familiar in the codebase.

### Negative

- **Two collection UIs to maintain**, sharing one normalizer. Same intentional split as ADR-0006.
- Every attending guest who RSVP'd before this shipped now sees "Car plate: not added yet" on their summary card. Accepted: that *is* the mechanism by which existing attendees get asked.
- Coverage is best-effort. A guest who never revisits their link stays "not sure yet" until the couple backfills it in Studio.
- One plate per guest. A couple sharing a car will typically have the plate on the submitter and "not driving" (or nothing) on the partner. Acceptable for a headcount of cars; the dashboard counts plates, not people.

### Rejected alternatives

- **Plate as part of the RSVP submission.** Would re-collect it on every answer change and let it differ per submission, against the "RSVP is fully replaced" model, and would give the Studio nothing editable to backfill.
- **A plain optional `carPlate` string.** Cannot represent "not sure yet" or "not driving", collapsing the chase list into one undifferentiated blank.
- **Only "plate" and "not sure".** The originally requested pair. Rejected in favour of adding "not driving" for the chase-list and nagging reasons above.
- **Mirror the plate into the Sheets audit log.** Convenient for the venue, but duplicates a per-person fact onto a second surface that then drifts from Studio edits. The CSV export from the dashboard covers the venue's need.
- **Chat-only collection.** Structurally cannot reach answered-for linked partners, and turns "not sure yet" into a dead end.
- **Require a plate to submit.** Risks losing the attendance answer, the one thing we can't afford to lose.
