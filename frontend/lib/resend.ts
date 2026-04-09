const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");

export const resendApiKey = RESEND_API_KEY;
