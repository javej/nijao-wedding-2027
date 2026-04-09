const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;
if (!SANITY_WEBHOOK_SECRET)
  throw new Error("SANITY_WEBHOOK_SECRET is not set");

export const sanityWebhookSecret = SANITY_WEBHOOK_SECRET;
