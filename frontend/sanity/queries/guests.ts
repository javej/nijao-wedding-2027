import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder" &&
  !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

// --- GROQ Queries ---

export const GUEST_BY_SLUG_QUERY = groq`
  *[_type == "guest" && slug.current == $slug][0] {
    firstName,
    "slug": slug.current,
    plusOneEligible,
    plusOneType,
    plusOneLinkedGuest->{
      firstName,
      "slug": slug.current
    }
  }
`;

export const ALL_GUEST_SLUGS_QUERY = groq`
  *[_type == "guest" && defined(slug.current)] {
    "slug": slug.current
  }
`;

// --- Types ---

export type GuestResult = {
  firstName: string;
  slug: string;
  plusOneEligible: boolean | null;
  plusOneType: "linked" | "open" | null;
  plusOneLinkedGuest: {
    firstName: string;
    slug: string;
  } | null;
} | null;

export type GuestSlugResult = {
  slug: string;
}[];

// --- Fetch Functions ---

/** Resolve a guest by their unique slug token. Returns null if not found. */
export async function getGuestBySlug(
  slug: string,
): Promise<GuestResult> {
  if (!isSanityConfigured) return null;

  const { data } = await sanityFetch({
    query: GUEST_BY_SLUG_QUERY,
    params: { slug },
    tags: ["sanity"],
  });

  return (data ?? null) as GuestResult;
}

/** Fetch all published guest slugs for generateStaticParams. */
export async function getAllGuestSlugs(): Promise<GuestSlugResult> {
  if (!isSanityConfigured) return [];

  const { data } = await sanityFetch({
    query: ALL_GUEST_SLUGS_QUERY,
    perspective: "published",
    stega: false,
    tags: ["sanity"],
  });

  return (data ?? []) as GuestSlugResult;
}
