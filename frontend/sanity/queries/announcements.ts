import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";

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

// Scheduled-publishing cache strategy: we bypass `defineLive`'s `sanityFetch`
// (whose public type does not accept `revalidate`) and call `client.fetch`
// directly so we can pass Next.js fetch options `{ revalidate: 60, tags:
// ["sanity"] }`. The `tags: ["sanity"]` keeps us on the same webhook-driven
// invalidation train (Story 4.1 fires `revalidateTag("sanity")` on Sanity
// create/update/delete — instant refresh for publish/edit). The `revalidate:
// 60` adds time-based refresh, which is what makes scheduled announcements
// appear on time: Sanity's webhook does NOT fire when `scheduledAt` passes,
// so without a periodic refresh `now()` in the GROQ would be frozen at the
// first fetch. 60s is the upper bound on lag from scheduledAt → visible.
const NEXT_FETCH_OPTS = {
  next: { revalidate: 60, tags: ["sanity"] },
};

/** Fetch all currently-visible announcements, newest first. */
export async function getAnnouncements(): Promise<AnnouncementResult[]> {
  if (!isSanityConfigured) return [];
  const data = await client.fetch<AnnouncementResult[]>(
    ANNOUNCEMENTS_QUERY,
    {},
    NEXT_FETCH_OPTS,
  );
  return data ?? [];
}

/** Dev-only: fetch every announcement (no scheduledAt filter). */
export async function getAllAnnouncementsForDebug(): Promise<
  AnnouncementSummary[]
> {
  if (!isSanityConfigured) return [];
  const data = await client.fetch<AnnouncementSummary[]>(
    ALL_ANNOUNCEMENTS_QUERY,
    {},
    NEXT_FETCH_OPTS,
  );
  return data ?? [];
}
