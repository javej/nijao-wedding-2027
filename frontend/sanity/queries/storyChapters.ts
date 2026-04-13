import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder" &&
  !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export const STORY_CHAPTERS_QUERY = groq`
  *[_type == "storyChapter" && isProposal != true] | order(order asc) {
    _id,
    year,
    caption,
    image {
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
    order,
    publishedAt
  }
`;

export const PROPOSAL_SECTION_QUERY = groq`
  *[_type == "storyChapter" && isProposal == true][0] {
    _id,
    caption,
    image {
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
    publishedAt
  }
`;

/** Shape returned by STORY_CHAPTERS_QUERY for each chapter. */
export type StoryChapterResult = {
  _id: string;
  year: number;
  caption: string;
  image: {
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
  } | null;
  order?: number;
  publishedAt?: string;
};

/** Shape returned by PROPOSAL_SECTION_QUERY. */
export type ProposalSectionResult = {
  _id: string;
  caption: string;
  image: {
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
  } | null;
  publishedAt?: string;
} | null;

/** Fetch the proposal chapter (Mt. Fuji proposal). Returns null if none exists. */
export async function getProposalSection(): Promise<ProposalSectionResult> {
  if (!isSanityConfigured) return null;

  const { data } = await sanityFetch({
    query: PROPOSAL_SECTION_QUERY,
  });

  return (data ?? null) as ProposalSectionResult;
}

/** Fetch all published story chapters ordered by the `order` field (excludes proposal). */
export async function getStoryChapters(): Promise<StoryChapterResult[]> {
  if (!isSanityConfigured) return [];

  const { data } = await sanityFetch({
    query: STORY_CHAPTERS_QUERY,
  });

  return (data ?? []) as StoryChapterResult[];
}
