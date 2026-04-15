import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder" &&
  !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

/** Padrinos/Madrinas — ninongs and ninangs for the Digital Padrino Wall. */
export const PADRINOS_QUERY = groq`
  *[_type == "entourageMember" && isPadrino == true] | order(orderRank asc, name asc) {
    _id, name, role, colorAssignment,
    photo {
      ...,
      asset->{
        _id,
        url,
        mimeType,
        metadata {
          lqip,
          dimensions { width, height }
        }
      }
    }
  }
`;

/** Wedding Party — non-padrino entourage members (best man, maid of honor, etc.). */
export const WEDDING_PARTY_QUERY = groq`
  *[_type == "entourageMember" && isPadrino != true] | order(orderRank asc, role asc, name asc) {
    _id, name, role, colorAssignment
  }
`;

/** Shape of a padrino/madrina entry. */
export type PadrinoResult = {
  _id: string;
  name: string;
  role: string;
  colorAssignment?:
    | "deep-matcha"
    | "raspberry"
    | "golden-matcha"
    | "strawberry-jam"
    | "matcha-chiffon"
    | "berry-meringue"
    | "matcha-latte"
    | "strawberry-milk";
  photo: {
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
    _type: "image";
  } | null;
};

/** Shape of a wedding party member entry. */
export type WeddingPartyResult = {
  _id: string;
  name: string;
  role: string;
  colorAssignment?:
    | "deep-matcha"
    | "raspberry"
    | "golden-matcha"
    | "strawberry-jam"
    | "matcha-chiffon"
    | "berry-meringue"
    | "matcha-latte"
    | "strawberry-milk";
};

/** Fetch all padrinos/madrinas for the Digital Padrino Wall. */
export async function getPadrinos(): Promise<PadrinoResult[]> {
  if (!isSanityConfigured) return [];

  const { data } = await sanityFetch({
    query: PADRINOS_QUERY,
    tags: ["sanity"],
  });

  return (data ?? []) as PadrinoResult[];
}

/** Fetch all non-padrino wedding party members. */
export async function getWeddingParty(): Promise<WeddingPartyResult[]> {
  if (!isSanityConfigured) return [];

  const { data } = await sanityFetch({
    query: WEDDING_PARTY_QUERY,
    tags: ["sanity"],
  });

  return (data ?? []) as WeddingPartyResult[];
}
