import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    // Stay out of search engines (private wedding site), but allow the
    // social-preview scrapers so shared links render a rich card.
    rules: [
      {
        userAgent: "*",
        disallow: "/",
      },
      {
        userAgent: ["facebookexternalhit", "meta-externalagent", "Twitterbot"],
        allow: "/",
      },
    ],
  };
}
