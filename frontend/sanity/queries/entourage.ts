import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { sortEntourage } from "@/sanity/queries/entourage-order";

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder" &&
  !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

/** Roles that belong to the Padrino Wall. Everything else is Wedding Party. */
const PADRINO_ROLES = '["Ninong", "Ninang"]';

/**
 * Padrinos — ninongs and ninangs for the Padrino Wall. Names only; the
 * section/group split and ordering are derived from `role` in the component.
 * Ordered by the Studio drag rank so each role group reads in the order the
 * couple arranged it (see `sortEntourage` for the last-name tiebreak).
 */
export const PADRINOS_QUERY = groq`
  *[_type == "entourageMember" && role in ${PADRINO_ROLES}] | order(orderRank asc) {
    _id, name, role, orderRank
  }
`;

/** Wedding Party — every entourage member whose role is not a padrino role. */
export const WEDDING_PARTY_QUERY = groq`
  *[_type == "entourageMember" && defined(role) && !(role in ${PADRINO_ROLES})] | order(orderRank asc) {
    _id, name, role, orderRank
  }
`;

/** Shape of an entourage member entry (names only). */
export type EntourageMemberResult = {
  _id: string;
  name: string;
  role: string;
  orderRank?: string | null;
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

  return sortEntourage((data ?? []) as PadrinoResult[]);
}

/** Fetch all non-padrino wedding party members. */
export async function getWeddingParty(): Promise<WeddingPartyResult[]> {
  if (!isSanityConfigured) return [];

  const { data } = await sanityFetch({
    query: WEDDING_PARTY_QUERY,
    tags: ["sanity"],
  });

  return sortEntourage((data ?? []) as WeddingPartyResult[]);
}
