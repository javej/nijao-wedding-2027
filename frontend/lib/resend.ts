import { Resend } from "resend";
import { RsvpConfirmation } from "@/emails/RsvpConfirmation";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");

const RESEND_FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS as string;
if (!RESEND_FROM_ADDRESS) throw new Error("RESEND_FROM_ADDRESS is not set");

const resend = new Resend(RESEND_API_KEY);

interface SendConfirmationData {
  guestName: string;
  guestEmail: string;
}

/**
 * Send an RSVP confirmation email via Resend.
 * Best-effort: logs errors but never throws.
 */
export async function sendRsvpConfirmation(
  data: SendConfirmationData,
): Promise<void> {
  try {
    await resend.emails.send({
      from: RESEND_FROM_ADDRESS,
      to: data.guestEmail,
      subject: "We've been waiting for you",
      react: RsvpConfirmation({ guestName: data.guestName }),
    });
  } catch (error) {
    console.error("[sendRsvpConfirmation]", error);
    // Best-effort — do NOT throw. RSVP succeeds regardless.
  }
}
