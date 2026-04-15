import {
  isValidSignature,
  SIGNATURE_HEADER_NAME,
} from "@sanity/webhook";

const envSecret = process.env.SANITY_WEBHOOK_SECRET;
if (!envSecret) throw new Error("SANITY_WEBHOOK_SECRET is not set");

const SANITY_WEBHOOK_SECRET: string = envSecret;

export { SIGNATURE_HEADER_NAME };

/**
 * Validate a Sanity webhook signature using the official @sanity/webhook package.
 * Handles the `t=<ts>,v1=<base64url>` format that Sanity actually sends.
 */
export async function validateWebhookSignature(
  body: string,
  signature: string,
): Promise<boolean> {
  return isValidSignature(body, signature, SANITY_WEBHOOK_SECRET);
}
