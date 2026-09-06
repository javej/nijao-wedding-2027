import { defineLive } from "next-sanity/live";
import { client } from "./client";
import { token } from "./token";

/**
 * Upper bound, in seconds, on how stale published content can get.
 *
 * Fresh content normally arrives by one of two push mechanisms — the Sanity
 * Live Content API (`<SanityLive />` in the (main) layout) and the
 * `/api/revalidate` webhook. Both can be silently unavailable in production:
 * the live EventSource needs the deployed origin in the project's CORS
 * allowlist and a dataset the browser may read, and the webhook needs a
 * matching `SANITY_WEBHOOK_SECRET`. Without a `revalidate` here `defineLive`
 * defaults to `false` in production, so a page cached at build time would then
 * stay frozen until the next deploy.
 *
 * Time-based revalidation is the backstop for that: worst case a guest sees
 * content up to a minute old instead of indefinitely old. It also lets GROQ's
 * `now()` move, which is what makes `scheduledAt` announcements appear on time
 * — no document is written when a scheduled time passes, so no webhook or live
 * event ever fires for it.
 */
const REVALIDATE_SECONDS = 60;

export const { sanityFetch, SanityLive } = defineLive({
  client,
  // Required for showing draft content when the Sanity Presentation Tool is used, or to enable the Vercel Toolbar Edit Mode
  serverToken: token,
  // Required for stand-alone live previews, the token is only shared to the brwoser if it's a valid Next.js Draft Mode session
  browserToken: token,
  fetchOptions: { revalidate: REVALIDATE_SECONDS },
});
