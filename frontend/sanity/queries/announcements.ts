import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder" &&
  !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

// Drafts are excluded globally by the client's `perspective: "published"` —
// no `!(_id in path("drafts.**"))` clause is needed here.
// The `scheduledAt` clause hides announcements whose scheduled time is still
// in the future (admin-controlled scheduled publishing, per Story 4.2 AC 5).
export const ANNOUNCEMENTS_QUERY = groq`
  *[_type == "announcement" && (scheduledAt == null || scheduledAt <= now())]
    | order(publishedAt desc) {
      _id,
      title,
      body,
      publishedAt,
      scheduledAt
    }
`;

/** Diagnostic: every announcement regardless of scheduledAt. Dev-only — use to
 *  verify the scheduled filter is doing what you expect. */
export const ALL_ANNOUNCEMENTS_QUERY = groq`
  *[_type == "announcement"] | order(publishedAt desc) {
    _id,
    title,
    publishedAt,
    scheduledAt
  }
`;

export type AnnouncementResult = {
  _id: string;
  title: string;
  body?: Array<{ _type: string; [key: string]: unknown }>;
  publishedAt: string;
  scheduledAt?: string;
};

export type AnnouncementSummary = {
  _id: string;
  title: string;
  publishedAt: string;
  scheduledAt?: string;
};

// These go through `sanityFetch` like every other query so they ride the same
// two refresh mechanisms as the rest of the site: the Live Content API (which
// only ever revalidates `sanity:<syncTag>` tags that `sanityFetch` attaches —
// a raw `client.fetch` is invisible to it) and the `/api/revalidate` webhook
// via the shared "sanity" tag.
//
// The time-based fallback that makes scheduled announcements appear on time now
// lives on `defineLive` itself (`fetchOptions.revalidate` in
// `sanity/lib/live.ts`): Sanity writes no document when `scheduledAt` passes,
// so nothing pushes, and without a periodic re-fetch `now()` in the GROQ would
// stay frozen at whatever it was on the first fetch.

/** Fetch all currently-visible announcements, newest first. */
export async function getAnnouncements(): Promise<AnnouncementResult[]> {
  if (!isSanityConfigured) return [];

  const { data } = await sanityFetch({
    query: ANNOUNCEMENTS_QUERY,
    tags: ["sanity"],
  });

  return (data ?? []) as AnnouncementResult[];
}

/** Dev-only: fetch every announcement (no scheduledAt filter). */
export async function getAllAnnouncementsForDebug(): Promise<
  AnnouncementSummary[]
> {
  if (!isSanityConfigured) return [];

  const { data } = await sanityFetch({
    query: ALL_ANNOUNCEMENTS_QUERY,
    tags: ["sanity"],
  });

  return (data ?? []) as AnnouncementSummary[];
}
