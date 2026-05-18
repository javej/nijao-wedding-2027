# Context — Domain Language

This file is the glossary for the wedding website project. Terms here are canonical — use them exactly. Implementation details belong in code or ADRs, not here.

## Guests & Personalization

- **Guest** — A person invited to the wedding, represented as a `guest` document in Sanity with a unique non-guessable slug. Each guest has their own personalized URL (`/[slug]`).
- **Linked plus-one** — A guest whose `plusOneType = "linked"` has a partner who is *also* a separate `guest` document. The partner has their own slug and own page.
- **Open plus-one** — A guest whose `plusOneType = "open"` may bring an unnamed companion. The companion's name is collected as free text during RSVP and is *not* a separate `guest` document.

## RSVP

- **RSVP** — The guest's current commitment state, stored on the Sanity `guest` document. Comprises `{attending, plusOneAttending, plusOneName}`. There is exactly one current RSVP per guest at any time.
- **RSVP submission** — A single user action that produces a new RSVP. Each submission *fully replaces* the prior RSVP — there is no piecewise editing of individual fields. A guest who wants to change anything re-runs the full chat flow.
- **RSVP audit log** — The append-only record of every RSVP submission, stored in Google Sheets. Sheets is *not* authoritative for "is this guest coming"; Sanity is. Sheets exists for chronological history and CSV export.
- **Answer** *(informal)* — Synonym for **RSVP** in conversation. Prefer "RSVP" in code and docs.

## Source of Truth

When state could live in either Sanity or Sheets:

- **Sanity is authoritative** for the current state of a guest (including their RSVP).
- **Sheets is derived/historical** — every submission appends; nothing is updated in place.
