import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { bodyQuery } from "@/sanity/queries/shared/body";
import type { PortableTextProps } from "@portabletext/react";

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder" &&
  !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

/**
 * All FAQs in the order set by the Studio drag-rank (`orderRank`). Each FAQ's
 * `body` is portable text — `bodyQuery` expands image assets so the frontend
 * renderer can draw bold/italic/lists/links plus inline images and YouTube
 * embeds without a second fetch.
 */
export const FAQS_QUERY = groq`
  *[_type == "faq"] | order(orderRank asc) {
    _id,
    title,
    body[] {
      ${bodyQuery}
    }
  }
`;

/** Shape returned by FAQS_QUERY for each FAQ. */
export type FaqResult = {
  _id: string;
  title: string;
  /** Portable-text answer; null when the author left the body empty. */
  body: PortableTextProps["value"] | null;
};

/** Fetch all published FAQs ordered by the Studio drag-rank. */
export async function getFaqs(): Promise<FaqResult[]> {
  if (!isSanityConfigured) return [];

  const { data } = await sanityFetch({
    query: FAQS_QUERY,
    tags: ["sanity"],
  });

  return (data ?? []) as FaqResult[];
}
