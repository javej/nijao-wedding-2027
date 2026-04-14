"use server";

import { verifyTurnstileToken } from "@/lib/turnstile";
import { appendRsvpRows } from "@/lib/sheets";
import { sendRsvpConfirmation } from "@/lib/resend";

// --- Types ---

export interface RSVPPayload {
  guestSlug: string;
  guestName: string;
  attending: boolean;
  plusOneName?: string;
  turnstileToken: string;
  linkedGuest?: { name: string; attending: boolean };
  guestEmail?: string;
}

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

// --- Server Action ---

export async function submitRsvp(payload: RSVPPayload): Promise<ActionResult> {
  try {
    // 1. Validate Turnstile token
    const turnstileValid = await verifyTurnstileToken(payload.turnstileToken);
    if (!turnstileValid) {
      return { success: false, error: "Verification failed" };
    }

    // 2. Write to Google Sheets
    try {
      await appendRsvpRows({
        guestName: payload.guestName,
        attending: payload.attending,
        plusOneName: payload.plusOneName,
        linkedGuest: payload.linkedGuest,
      });
    } catch (error) {
      console.error("[submitRsvp] Sheets write failed:", error);
      return { success: false, error: "sheets_unavailable" };
    }

    // 3. Send confirmation email (best-effort — never blocks success)
    // sendRsvpConfirmation has internal try/catch and never throws
    if (payload.attending && payload.guestEmail) {
      void sendRsvpConfirmation({
        guestName: payload.guestName,
        guestEmail: payload.guestEmail,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("[submitRsvp] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
