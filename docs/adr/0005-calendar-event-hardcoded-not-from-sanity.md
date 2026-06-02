# ADR 0005 — "Add to Calendar" event is hardcoded in code, not derived from Sanity

- **Status:** Accepted
- **Date:** 2026-06-02
- **Relates to:** ADR-0001 (Sanity as source of truth) — this is a deliberate, scoped exception

## Context

The "When & Where" chapter gained an **Add to Calendar** menu offering the wedding (one combined event — see CONTEXT.md → "Calendar event") per provider: a Google Calendar deep link and an Apple/`.ics` download. Both a valid `.ics` `VEVENT` and the Google `dates` param need a **precise machine-readable start**, an **end**, and an **unambiguous timezone**.

ADR-0001 established **Sanity as the source of truth** for wedding content, and the `weddingDetails` document already holds the ceremony/reception details the section renders. The obvious path would be to derive the calendar event from that document. But the document, as shaped today, cannot produce a valid event:

- `ceremonyDate` is a Sanity `date` (no time component).
- `ceremonyTime` / `receptionTime` are **free-text strings** (`"2:00 PM"`) — not parseable into a reliable instant. Variants like `"2 PM"`, `"2:00pm"`, `"2:00 PM onwards"` all validate in Studio but break a parser.
- There is **no end time** and **no timezone** field anywhere on the document.

We considered three options:

| Option | Produces valid `.ics`? | Cost | Source-of-truth alignment |
|---|---|---|---|
| Add machine datetime + end + TZ fields to `weddingDetails`, derive from those | yes | schema change + Studio re-entry + render-time build, for data that never changes | keeps Sanity authoritative |
| Parse the existing free-text `*Time` fields at render | fragile | low code, high breakage risk | reuses Sanity |
| **Hardcode a typed event constant in code** | **yes** | **lowest** | **deviates from ADR-0001** |

## Decision

The calendar event is a **single typed constant in code**, serving the `.ics` from a route handler at `frontend/app/wedding.ics/route.ts` (`Content-Type: text/calendar`, `Content-Disposition: attachment`). The constant holds title, start, end, location, description, and a stable `UID`/`PRODID`. Datetimes are emitted in **UTC** (`20270108T060000Z` = 2:00 PM Asia/Manila; Manila is UTC+8 with no DST, so UTC is unambiguous and needs no `VTIMEZONE` block — consistent with TIMEZONE.md).

The human-visible venue/date/time text in the section continues to render from Sanity as before. **Only the calendar event's machine datetimes are hardcoded.**

## Consequences

### Positive

- The `.ics` is valid and stable on every guest device with zero parsing risk.
- No schema migration, no Studio re-entry, no client-side JS — `WeddingDetails` stays a Server Component and the button is a plain `<a href="/wedding.ics">`.
- A stable `UID` means a guest who re-downloads gets an *update* to the existing calendar entry, not a duplicate.

### Negative

- **Deviates from ADR-0001.** A future reader sees a `weddingDetails` Sanity doc and a hardcoded date and will rightly ask why. This ADR is the answer: the wedding datetime is immutable and Sanity could not express it validly. If the date/time ever changes, **both** the Sanity document **and** the constant must be updated — they are not linked.
- If the couple later wants the calendar event editable from Studio, the proper fix is the rejected option 1 (add structured datetime fields and derive from them), at which point this ADR is superseded.

### Rejected alternatives

- **Parse free-text `*Time` at render** — too brittle; one stray Studio edit (`"2 PM onwards"`) silently breaks every guest's download.
- **Static `public/wedding.ics`** — works, but the event data becomes an untyped checked-in artifact edited by hand; the route handler keeps a single typed source in code.
