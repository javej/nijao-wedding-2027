const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
if (!TURNSTILE_SECRET_KEY) throw new Error("TURNSTILE_SECRET_KEY is not set");

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

/**
 * Verify a Turnstile token server-side.
 * Returns true if valid, false otherwise.
 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const res = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: TURNSTILE_SECRET_KEY!,
      response: token,
    }),
  });

  const data: TurnstileVerifyResponse = await res.json();
  return data.success;
}
