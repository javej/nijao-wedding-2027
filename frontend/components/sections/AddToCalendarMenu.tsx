"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, ChevronDown, Info } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { WEDDING_ICS_PATH, buildGoogleCalendarUrl } from "@/lib/wedding-event";

/**
 * AddToCalendarMenu — Client Component
 *
 * The single combined wedding event, offered per provider so each guest lands
 * in their OWN calendar app pre-filled rather than downloading a file they
 * have to figure out:
 *  - Google  → parametric deep link, opens an editable event (Android/Gmail).
 *  - Apple   → the /wedding.ics file, opens the native add-to-calendar sheet
 *              on iOS/macOS (also works for Outlook desktop).
 *
 * Only this menu is interactive; the parent WeddingDetails stays a Server
 * Component. See ADR-0005 for why the event data is a hardcoded constant.
 */
const itemClassName =
  "cursor-pointer gap-3 px-3 py-2.5 font-body text-body-sm text-deep-matcha focus:bg-matcha-chiffon/40 focus:text-deep-matcha";

/**
 * iOS in-app webviews (Messenger, Facebook, Instagram, etc.) frequently fail
 * to hand a .ics to the Calendar app, so the Apple option breaks there. We
 * detect those guests to show a Safari hint — Google still works in-webview.
 *
 * The token list catches the apps that dominate link-sharing here; the
 * `!Safari` fallback catches generic WKWebViews (real iOS browsers — Safari,
 * Chrome/CriOS, Firefox/FxiOS — all carry a "Safari" token, in-app webviews
 * usually don't). Android is excluded: "open in Safari" is meaningless there.
 */
function isIosInAppBrowser(ua: string): boolean {
  if (!/iPhone|iPad|iPod/i.test(ua)) return false;
  const inAppTokens =
    /(FBAN|FBAV|FB_IAB|Instagram|Messenger|Line|MicroMessenger|Twitter|GSA)/i;
  const looksLikeWebView = !/Safari/i.test(ua);
  return inAppTokens.test(ua) || looksLikeWebView;
}

export function AddToCalendarMenu() {
  const googleUrl = buildGoogleCalendarUrl();

  // Starts false so server and first client render match (navigator is
  // client-only); flips on after mount if the guest is in an iOS webview.
  const [showSafariHint, setShowSafariHint] = useState(false);
  useEffect(() => {
    setShowSafariHint(isIosInAppBrowser(navigator.userAgent));
  }, []);

  return (
    <div className="flex flex-col items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 min-h-11 rounded-full border border-deep-matcha px-6 py-2.5 font-body text-body-sm font-medium tracking-wide text-deep-matcha transition-colors hover:bg-deep-matcha hover:text-text-on-dark focus-visible:ring-2 focus-visible:ring-raspberry focus-visible:ring-offset-2 focus-visible:outline-none data-[state=open]:bg-deep-matcha data-[state=open]:text-text-on-dark"
          >
            <CalendarPlus className="size-4" aria-hidden="true" />
            Add to Calendar
            <ChevronDown className="size-4" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="center"
          className="min-w-48 rounded-(--card-radius) border-deep-matcha/20"
        >
          <DropdownMenuItem asChild className={itemClassName}>
            <a href={googleUrl} target="_blank" rel="noopener noreferrer">
              <CalendarPlus className="size-4" aria-hidden="true" />
              Google Calendar
            </a>
          </DropdownMenuItem>
          {/* No `download` attr: lets iOS Safari hand the .ics to Calendar
              (native "Add Event" sheet) rather than save it to Files. */}
          <DropdownMenuItem asChild className={itemClassName}>
            <a href={WEDDING_ICS_PATH}>
              <CalendarPlus className="size-4" aria-hidden="true" />
              Apple Calendar
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showSafariHint && (
        <p className="mt-3 flex max-w-xs items-start gap-1.5 text-center font-body text-body-sm text-text-on-light/70 leading-relaxed">
          <Info className="mt-0.5 size-4 shrink-0 text-deep-matcha" aria-hidden="true" />
          <span>
            Google Calendar works here. For Apple Calendar, open this page in
            Safari first (tap the &#8943; menu &rarr; &ldquo;Open in Safari&rdquo;).
          </span>
        </p>
      )}
    </div>
  );
}
