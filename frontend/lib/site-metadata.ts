import type { Metadata } from "next";

/**
 * The link-preview card every page shares. Kept in one place because Next.js
 * replaces a route's whole `openGraph` / `twitter` object instead of merging it
 * with the layout's, so any route that needs to override one field (the guest
 * page overrides `url`) has to re-supply the rest.
 *
 * `url` is deliberately absent: each route sets its own. Facebook treats
 * `og:url` as the canonical resource for a shared link and Messenger's preview
 * card opens that canonical URL, so a guest page must never advertise the root.
 */
export const sharedOpenGraph = {
  title: "Dearest Gentle Reader, ✨",
  description:
    "A decade of courtship leads to a wedding. Tap to uncover the details.",
  type: "website",
  locale: "en_PH",
  siteName: "Jave & Nianne Wedding",
  images: [
    {
      url: "/decorations/preview-og.jpg",
      width: 1200,
      height: 630,
      alt: "Jave & Nianne — January 8, 2027",
    },
  ],
} satisfies NonNullable<Metadata["openGraph"]>;

export const sharedTwitter = {
  card: "summary_large_image",
  title: sharedOpenGraph.title,
  description: sharedOpenGraph.description,
  images: ["/decorations/preview-og.jpg"],
} satisfies NonNullable<Metadata["twitter"]>;
