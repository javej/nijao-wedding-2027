import { MetadataRoute } from "next";
import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const VIEWABLE_TYPES = ["page"] as const;

const urlQuery = `
  'url': select(
    slug.current == "index" => $baseUrl + "/",
    $baseUrl + "/" + slug.current
  )
`;

const SITEMAP_QUERY = groq`
  *[
    _type in $viewableTypes
    && meta.noindex != true
    && defined(slug)
  ] {
    ${urlQuery},
    "lastModified": _updatedAt,
    "changeFrequency": select(_type == "page" => "daily", "weekly"),
    "priority": select(
      _type == "page" && slug.current == "index" => 1,
      _type == "page" => 0.5,
      0.7
    )
  } | order(priority desc, url asc)
`;

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder" &&
  !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isSanityConfigured) return [];

  const { data } = await sanityFetch({
    query: SITEMAP_QUERY,
    params: {
      baseUrl: process.env.NEXT_PUBLIC_SITE_URL!,
      viewableTypes: [...VIEWABLE_TYPES],
    },
  });

  return data || [];
}
