import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder" &&
  !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

/** Roles that belong to the Padrino Wall. Everything else is Wedding Party. */
const PADRINO_ROLES = '["Ninong", "Ninang"]';

/**
 * Padrinos — ninongs and ninangs for the Padrino Wall. Names only; the
 * section/group split and ordering are derived from `role` in the component.
 * Sorted by name here so each role group reads alphabetically.
 */
export const PADRINOS_QUERY = groq`
  *[_type == "entourageMember" && role in ${PADRINO_ROLES}] | order(name asc) {
    _id, name, role
  }
`;

/** Wedding Party — every entourage member whose role is not a padrino role. */
export const WEDDING_PARTY_QUERY = groq`
  *[_type == "entourageMember" && defined(role) && !(role in ${PADRINO_ROLES})] | order(name asc) {
    _id, name, role
  }
`;

/** Shape of an entourage member entry (names only). */
export type EntourageMemberResult = {
  _id: string;
  name: string;
  role: string;
};

export type PadrinoResult = EntourageMemberResult;
export type WeddingPartyResult = EntourageMemberResult;

/** Fetch all padrinos/madrinas for the Padrino Wall. */
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
