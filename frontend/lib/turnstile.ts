const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
if (!TURNSTILE_SECRET_KEY) throw new Error("TURNSTILE_SECRET_KEY is not set");

export const turnstileSecretKey = TURNSTILE_SECRET_KEY;
