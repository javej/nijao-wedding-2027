import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder" &&
  !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

// Only paletteColors is rendered. label/description/inspirationImages/additionalNotes
// remain on the schema for backward-compat but are no longer queried.
export const DRESS_CODE_QUERY = groq`
  *[_type == "dressCode"][0] {
    paletteColors[] {
      _key,
      colorKey,
      colorLabel
    }
  }
`;

/** Shape of each palette color entry. */
export type PaletteColorEntry = {
  _key: string;
  colorKey: string;
  colorLabel: string;
};

/** Shape returned by DRESS_CODE_QUERY. */
export type DressCodeResult = {
  paletteColors?: PaletteColorEntry[];
} | null;

/** Fetch the singleton dress code document. Returns null if none exists. */
export async function getDressCode(): Promise<DressCodeResult> {
  if (!isSanityConfigured) return null;

  const { data } = await sanityFetch({
    query: DRESS_CODE_QUERY,
    tags: ["sanity"],
  });

  return (data ?? null) as DressCodeResult;
}
