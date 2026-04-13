import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder" &&
  !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export const WEDDING_DETAILS_QUERY = groq`
  *[_type == "weddingDetails"][0] {
    ceremonyVenue,
    ceremonyDate,
    ceremonyTime,
    ceremonyAddress,
    ceremonyMapUrl,
    receptionVenue,
    receptionDate,
    receptionTime,
    receptionAddress,
    receptionMapUrl
  }
`;

/** Shape returned by WEDDING_DETAILS_QUERY. */
export type WeddingDetailsResult = {
  ceremonyVenue: string;
  ceremonyDate: string;
  ceremonyTime: string;
  ceremonyAddress?: string;
  ceremonyMapUrl?: string;
  receptionVenue: string;
  receptionDate: string;
  receptionTime: string;
  receptionAddress: string;
  receptionMapUrl?: string;
} | null;

/** Fetch the singleton wedding details document. Returns null if none exists. */
export async function getWeddingDetails(): Promise<WeddingDetailsResult> {
  if (!isSanityConfigured) return null;

  const { data } = await sanityFetch({
    query: WEDDING_DETAILS_QUERY,
  });

  return (data ?? null) as WeddingDetailsResult;
}
