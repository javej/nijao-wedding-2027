/**
 * The wedding's calendar event — the single source for the "Add to Calendar"
 * .ics download served at /wedding.ics.
 *
 * This is deliberately HARDCODED rather than derived from the Sanity
 * `weddingDetails` document. The document stores the time as free text
 * ("2:00 PM") with no end time and no timezone, so it cannot produce a valid
 * VEVENT. The wedding datetime is immutable, so a typed constant is the lowest
 * risk option. See docs/adr/0005-calendar-event-hardcoded-not-from-sanity.md.
 *
 * Datetimes are UTC (`Z`): 2:00 PM Asia/Manila is 06:00 UTC, 9:00 PM is 13:00
 * UTC. Manila is UTC+8 with no DST, so UTC is unambiguous and needs no
 * VTIMEZONE block (per TIMEZONE.md — everything is UTC).
 *
 * If the date/time ever changes, update BOTH this constant AND the Sanity
 * `weddingDetails` document — they are intentionally not linked.
 */
const WEDDING_EVENT = {
  uid: "wedding-jave-nianne-2027-01-08@javeandnianne.wedding",
  title: "The Wedding of Jave & Nianne",
  // UTC. 2:00 PM and 9:00 PM Asia/Manila (UTC+8).
  startUtc: "20270108T060000Z",
  endUtc: "20270108T130000Z",
  location:
    "St. Therese of the Child Jesus and the Holy Face Parish Church, Lipa, Batangas",
  description:
    "Ceremony 2 PM at St. Therese of the Child Jesus and the Holy Face Parish Church. Reception to follow 4 PM at 10 22 Lipa (Murraya Hall), Batangas.\n\nWe can't wait to celebrate with you! 💚\n\nhttps://www.javeandnianne.wedding/",
  url: "https://www.javeandnianne.wedding/",
  // Fixed so the .ics is deterministic and cacheable. The instant this
  // iCalendar object was authored (ADR-0005 date).
  dtstamp: "20260602T000000Z",
} as const;

/** Filename guests see when they download the calendar event. */
export const WEDDING_ICS_FILENAME = "jave-and-nianne-wedding.ics";

/** Route that serves the .ics — used by the Apple Calendar menu option. */
export const WEDDING_ICS_PATH = "/wedding.ics";

/**
 * Ceremony-start instant as epoch milliseconds — the single value the
 * Countdown chapter ticks down to. Derived from the SAME instant as
 * `startUtc` above (2:00 PM Asia/Manila = 06:00 UTC, Jan 8 2027) so the
 * countdown and the calendar event can never drift apart. An absolute
 * instant, so the remaining time reads identically for every guest
 * regardless of their location. See ADR-0005.
 */
export const WEDDING_START_MS = Date.parse("2027-01-08T06:00:00Z");

/**
 * Google Calendar "create event" deep link, pre-filled from the same event
 * constant. Opens an editable event page in the guest's Google Calendar
 * (one tap to save) — the smooth path for the Android/Gmail majority.
 *
 * `dates` are the UTC instants joined by `/`; because they carry the `Z`
 * suffix Google treats them as absolute, so no `ctz` param is needed.
 */
export function buildGoogleCalendarUrl(): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: WEDDING_EVENT.title,
    dates: `${WEDDING_EVENT.startUtc}/${WEDDING_EVENT.endUtc}`,
    details: WEDDING_EVENT.description,
    location: WEDDING_EVENT.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Escape a value per RFC 5545 §3.3.11 (TEXT): backslash, semicolon, comma,
 * and newline are the reserved characters in property values.
 */
function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Build the .ics document for the wedding event.
 *
 * Lines are joined with CRLF as RFC 5545 requires. Properties are kept short
 * enough not to need line folding.
 */
export function buildWeddingIcs(): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//javeandnianne.wedding//Add to Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${WEDDING_EVENT.uid}`,
    `DTSTAMP:${WEDDING_EVENT.dtstamp}`,
    `DTSTART:${WEDDING_EVENT.startUtc}`,
    `DTEND:${WEDDING_EVENT.endUtc}`,
    `SUMMARY:${escapeIcsText(WEDDING_EVENT.title)}`,
    `LOCATION:${escapeIcsText(WEDDING_EVENT.location)}`,
    `DESCRIPTION:${escapeIcsText(WEDDING_EVENT.description)}`,
    `URL:${WEDDING_EVENT.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}
