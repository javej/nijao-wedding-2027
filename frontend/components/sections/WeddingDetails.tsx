import type { WeddingDetailsResult } from "@/sanity/queries/weddingDetails";

interface WeddingDetailsProps {
  details: NonNullable<WeddingDetailsResult>;
}

/**
 * Format a date string using the Philippine English locale with long style.
 * Uses Intl.DateTimeFormat per architecture spec — never .toString().
 */
function formatWeddingDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-PH", { dateStyle: "long" }).format(
    new Date(dateString),
  );
}

/**
 * WeddingDetails — Server Component
 *
 * Renders ceremony and reception logistics in a single scroll chapter.
 * Two visually distinct blocks stacked on mobile, side-by-side on desktop.
 *
 * Tone shifts from emotional (love story) to informational (logistics):
 * still beautiful, but prioritizing clarity for guests like Kuya Mark.
 *
 * Must be wrapped in <ChapterSection> for snap-scroll and palette accent.
 */
export function WeddingDetails({ details }: WeddingDetailsProps) {
  const {
    ceremonyVenue,
    ceremonyDate,
    ceremonyTime,
    ceremonyAddress,
    ceremonyMapUrl,
    receptionVenue,
    receptionDate,
    receptionTime,
    receptionAddress,
    receptionMapUrl,
  } = details;

  return (
    <div className="flex flex-col items-center justify-center w-full px-(--chapter-padding-x) py-(--chapter-padding-y)">
      <h2 className="font-display font-light text-display-md text-text-on-light tracking-wide mb-12">
        Wedding Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 w-full max-w-4xl">
        {/* Ceremony Block */}
        <div className="flex flex-col items-center text-center">
          <h3 className="font-display font-semibold text-display-sm text-deep-matcha tracking-widest uppercase mb-6">
            Ceremony
          </h3>

          {ceremonyVenue && (
            <p className="font-display text-body-lg text-text-on-light font-medium">
              {ceremonyVenue}
            </p>
          )}

          {ceremonyDate && (
            <p className="text-body-md text-text-on-light/80 mt-2">
              {formatWeddingDate(ceremonyDate)}
            </p>
          )}

          {ceremonyTime && (
            <p className="text-body-md text-text-on-light/80 mt-1">
              {ceremonyTime}
            </p>
          )}

          {ceremonyAddress && (
            <address className="not-italic text-body-sm text-text-on-light/70 mt-4 max-w-xs leading-relaxed">
              {ceremonyAddress}
            </address>
          )}

          {ceremonyMapUrl && (
            <a
              href={ceremonyMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View ceremony venue on map"
              className="inline-block mt-4 text-body-sm text-deep-matcha underline underline-offset-4 hover:text-matcha-latte transition-colors"
            >
              View on Map
            </a>
          )}
        </div>

        {/* Divider — visible on mobile only */}
        <div className="block md:hidden w-16 h-px bg-matcha-chiffon mx-auto" />

        {/* Reception Block */}
        <div className="relative flex flex-col items-center text-center">
          {/* Divider — visible on desktop only (left border) */}
          <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 h-2/3 w-px bg-matcha-chiffon" />

          <h3 className="font-display font-semibold text-display-sm text-deep-matcha tracking-widest uppercase mb-6">
            Reception
          </h3>

          {receptionVenue && (
            <p className="font-display text-body-lg text-text-on-light font-medium">
              {receptionVenue}
            </p>
          )}

          {receptionDate && (
            <p className="text-body-md text-text-on-light/80 mt-2">
              {formatWeddingDate(receptionDate)}
            </p>
          )}

          {receptionTime && (
            <p className="text-body-md text-text-on-light/80 mt-1">
              {receptionTime}
            </p>
          )}

          {receptionAddress && (
            <address className="not-italic text-body-sm text-text-on-light/70 mt-4 max-w-xs leading-relaxed">
              {receptionAddress}
            </address>
          )}

          {receptionMapUrl && (
            <a
              href={receptionMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View reception venue on map"
              className="inline-block mt-4 text-body-sm text-deep-matcha underline underline-offset-4 hover:text-matcha-latte transition-colors"
            >
              View on Map
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
