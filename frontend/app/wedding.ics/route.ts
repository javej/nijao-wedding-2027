import { buildWeddingIcs, WEDDING_ICS_FILENAME } from "@/lib/wedding-event";

/**
 * Serves the wedding's calendar event as a downloadable .ics file.
 *
 * The button in the "When & Where" section links here with a plain anchor —
 * no client JS. A universal .ics opens natively in Apple Calendar, Outlook,
 * and Google for every guest (no Google sign-in), which is why we serve a file
 * here instead of a Google-only calendar link. See ADR-0005.
 */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildWeddingIcs(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // `inline` (not `attachment`) so iOS Safari hands the file to the
      // Calendar app and shows the native "Add Event" sheet instead of saving
      // it to Files. `filename` is still advertised for browsers that download
      // anyway (desktop Chrome always does). See ADR-0005.
      "Content-Disposition": `inline; filename="${WEDDING_ICS_FILENAME}"`,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
