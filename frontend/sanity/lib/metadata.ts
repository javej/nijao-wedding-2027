import type { Metadata } from "next";
import { urlFor } from "@/sanity/lib/image";
import { PAGE_QUERY_RESULT } from "@/sanity.types";

export function generatePageMetadata({
  page,
  slug,
}: {
  page: PAGE_QUERY_RESULT;
  slug: string;
}): Metadata {
  const openGraph: Metadata["openGraph"] = {
    locale: "en_PH",
    type: "website",
    siteName: "Jave & Nianne Wedding",
  };

  if (page?.meta?.image) {
    openGraph.images = [
      {
        url: urlFor(page.meta.image).quality(100).url(),
        width: page.meta.image.asset?.metadata?.dimensions?.width || 1200,
        height: page.meta.image.asset?.metadata?.dimensions?.height || 630,
      },
    ];
  }

  const metadata: Metadata = {
    openGraph,
    alternates: {
      canonical:
        process.env.NEXT_PUBLIC_SITE_URL + `/${slug === "index" ? "" : slug}`,
    },
  };

  if (page?.meta?.title) metadata.title = page.meta.title;
  if (page?.meta?.description) metadata.description = page.meta.description;

  return metadata;
}
