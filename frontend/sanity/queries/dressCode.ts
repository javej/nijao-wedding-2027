import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder" &&
  !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export const DRESS_CODE_QUERY = groq`
  *[_type == "dressCode"][0] {
    label,
    description,
    paletteColors[] {
      _key,
      colorKey,
      colorLabel
    },
    inspirationImages[] {
      ...,
      asset->{
        _id,
        url,
        mimeType,
        metadata {
          lqip,
          dimensions {
            width,
            height
          }
        }
      }
    },
    additionalNotes
  }
`;

/** Shape of each palette color entry. */
export type PaletteColorEntry = {
  _key: string;
  colorKey: string;
  colorLabel: string;
};

/** Shape of each inspiration image entry. */
export type InspirationImage = {
  _key: string;
  asset: {
    _id: string;
    url: string;
    mimeType: string;
    metadata: {
      lqip: string;
      dimensions: { width: number; height: number };
    };
  };
  hotspot?: { x: number; y: number; width: number; height: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  alt: string;
  _type: "image";
};

/** Shape returned by DRESS_CODE_QUERY. */
export type DressCodeResult = {
  label: string;
  description?: Array<{ _type: string; [key: string]: unknown }>;
  paletteColors?: PaletteColorEntry[];
  inspirationImages?: InspirationImage[];
  additionalNotes?: string;
} | null;

/** Fetch the singleton dress code document. Returns null if none exists. */
export async function getDressCode(): Promise<DressCodeResult> {
  if (!isSanityConfigured) return null;

  const { data } = await sanityFetch({
    query: DRESS_CODE_QUERY,
  });

  return (data ?? null) as DressCodeResult;
}
