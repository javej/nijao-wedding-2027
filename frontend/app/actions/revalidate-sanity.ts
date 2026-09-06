"use server";

import type { SyncTag } from "@sanity/client";
import { revalidateSyncTags } from "next-sanity/live/server-actions";

/**
 * What `<SanityLive />` runs when the Live Content API reports changed
 * documents.
 *
 * The default action only expires the matching `sanity:<syncTag>` cache tags
 * and returns nothing. Next then re-renders the page as part of the Server
 * Action response — but `revalidateTag` has no read-your-own-writes guarantee,
 * so that render can still be served from the entry it just expired, and the
 * guest keeps looking at the old content until they reload by hand.
 *
 * Returning `"refresh"` makes the client call `router.refresh()` once the tags
 * are already expired, so the follow-up render is forced to re-fetch from
 * Sanity. That second pass is what actually swaps the new content into an open
 * tab.
 */
export async function revalidateSanityTags(
  tags: SyncTag[],
): Promise<"refresh"> {
  await revalidateSyncTags(tags);
  return "refresh";
}
