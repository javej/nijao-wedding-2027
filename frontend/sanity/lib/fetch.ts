import { sanityFetch } from "@/sanity/lib/live";
import { PAGE_QUERY, PAGES_SLUGS_QUERY } from "@/sanity/queries/page";
import {
  PAGE_QUERY_RESULT,
  PAGES_SLUGS_QUERY_RESULT,
} from "@/sanity.types";

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder" &&
  !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export const fetchSanityPageBySlug = async ({
  slug,
}: {
  slug: string;
}): Promise<PAGE_QUERY_RESULT> => {
  if (!isSanityConfigured) return null;
  const { data } = await sanityFetch({
    query: PAGE_QUERY,
    params: { slug },
  });

  return data;
};

export const fetchSanityPagesStaticParams =
  async (): Promise<PAGES_SLUGS_QUERY_RESULT> => {
    if (!isSanityConfigured) return [];
    const { data } = await sanityFetch({
      query: PAGES_SLUGS_QUERY,
      perspective: "published",
      stega: false,
    });

    return data;
  };

