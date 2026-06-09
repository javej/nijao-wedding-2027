import Image from "next/image";
import type { WeddingDetailsResult } from "@/sanity/queries/weddingDetails";
import { AddToCalendarMenu } from "@/components/sections/AddToCalendarMenu";

interface WeddingDetailsProps {
  details: NonNullable<WeddingDetailsResult>;
}

// Both watercolor PNGs share the same intrinsic size (3:2 landscape).
// Declaring width/height lets the browser reserve layout space before
// the lazy image loads, so it can't reflow mid-scroll (the shift that
// fed the mobile auto-scroll bug).
const ILLUSTRATION_WIDTH = 1536;
const ILLUSTRATION_HEIGHT = 1024;

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
 * Must be wrapped in <ChapterSection> for bg tone and palette accent.
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
      <h2 className="font-body font-normal text-display-md text-text-on-light tracking-wide mb-12">
        When &amp; Where
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 w-full max-w-4xl">
        {/* Ceremony Block */}
        <div className="flex flex-col items-center text-center">
          <h3 className="font-body font-medium text-display-sm text-deep-matcha tracking-widest uppercase mb-4">
            Ceremony
          </h3>

          <Image
            src="/decorations/st.therese-watercolor.png"
            alt={`Watercolor illustration of ${ceremonyVenue ?? "the ceremony venue"}`}
            loading="lazy"
            width={ILLUSTRATION_WIDTH}
            height={ILLUSTRATION_HEIGHT}
            sizes="320px"
            className="w-full max-w-[320px] h-auto mb-6 mask-[radial-gradient(ellipse_at_center,black_55%,transparent_95%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_95%)]"
          />

          {ceremonyVenue && (
            <p className="font-body text-body-lg text-text-on-light font-medium">
              {ceremonyVenue}
            </p>
          )}

          {ceremonyDate && (
            <p className="font-body text-body-md text-text-on-light/80 mt-2">
              {formatWeddingDate(ceremonyDate)}
            </p>
          )}

          {ceremonyTime && (
            <p className="font-body text-body-md text-text-on-light/80 mt-1">
              {ceremonyTime}
            </p>
          )}

          {ceremonyAddress && (
            <address className="font-body not-italic text-body-sm text-text-on-light/70 mt-4 max-w-xs leading-relaxed">
              {ceremonyAddress}
            </address>
          )}

          {ceremonyMapUrl && (
            <a
              href={ceremonyMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View ceremony venue on map"
              className="inline-block mt-4 text-body-sm text-deep-matcha underline underline-offset-4 hover:text-raspberry transition-colors focus-visible:ring-2 focus-visible:ring-raspberry focus-visible:ring-offset-2 focus-visible:outline-none rounded-sm"
            >
              View on Maps
            </a>
          )}
        </div>

        {/* Reception Block — paintings replace the mobile hairline divider that used to sit here. */}
        <div className="relative flex flex-col items-center text-center">
          {/* Divider — desktop only. Sit it in the centre of the column gutter
              (half of md:gap-16 = 2rem) rather than on the column's edge. */}
          <div className="hidden md:block absolute -left-8 top-1/2 -translate-y-1/2 h-2/3 w-px bg-matcha-chiffon" aria-hidden="true" />

          <h3 className="font-body font-medium text-display-sm text-deep-matcha tracking-widest uppercase mb-4">
            Reception
          </h3>

          <Image
            src="/decorations/1022-watercolor.png"
            alt={`Watercolor illustration of ${receptionVenue ?? "the reception venue"}`}
            loading="lazy"
            width={ILLUSTRATION_WIDTH}
            height={ILLUSTRATION_HEIGHT}
            sizes="320px"
            className="w-full max-w-[320px] h-auto mb-6 mask-[radial-gradient(ellipse_at_center,black_55%,transparent_95%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_95%)]"
          />

          {receptionVenue && (
            <p className="font-body text-body-lg text-text-on-light font-medium">
              {receptionVenue}
            </p>
          )}

          {receptionDate && (
            <p className="font-body text-body-md text-text-on-light/80 mt-2">
              {formatWeddingDate(receptionDate)}
            </p>
          )}

          {receptionTime && (
            <p className="font-body text-body-md text-text-on-light/80 mt-1">
              {receptionTime}
            </p>
          )}

          {receptionAddress && (
            <address className="font-body not-italic text-body-sm text-text-on-light/70 mt-4 max-w-xs leading-relaxed">
              {receptionAddress}
            </address>
          )}

          {receptionMapUrl && (
            <a
              href={receptionMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View reception venue on map"
              className="inline-block mt-4 text-body-sm text-deep-matcha underline underline-offset-4 hover:text-raspberry transition-colors focus-visible:ring-2 focus-visible:ring-raspberry focus-visible:ring-offset-2 focus-visible:outline-none rounded-sm"
            >
              View on Maps
            </a>
          )}
        </div>
      </div>

      {/* Single combined event for the whole wedding (ceremony→reception),
          offered per provider so each guest lands in their own calendar app.
          See ADR-0005. */}
      <div className="mt-12 md:mt-16 flex justify-center">
        <AddToCalendarMenu />
      </div>
    </div>
  );
}
