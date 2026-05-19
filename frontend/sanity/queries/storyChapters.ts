import { groq } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder" &&
  !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

/**
 * All story chapters in order, including the proposal one. The proposal chapter
 * is identified by `isProposal: true` and rendered with the scrapbook gallery
 * layout — but it lives in the same year-ordered sequence as every other
 * chapter (it represents the year the couple got engaged).
 *
 * Each chapter carries the single `image` for the regular year layout; the
 * proposal chapter additionally carries `images` (a gallery) for the
 * scrapbook layout.
 */
export const STORY_CHAPTERS_QUERY = groq`
  *[_type == "storyChapter"] | order(order asc) {
    _id,
    year,
    caption,
    isProposal,
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
    images[] {
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

/** Shape of an asset-expanded image as returned by STORY_CHAPTERS_QUERY. */
export type StoryChapterImage = {
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

/** Shape returned by STORY_CHAPTERS_QUERY for each chapter. */
export type StoryChapterResult = {
  _id: string;
  year: number;
  caption: string;
  isProposal?: boolean;
  image: StoryChapterImage | null;
  /** Populated only when `isProposal === true` — drives the scrapbook layout. */
  images?: StoryChapterImage[] | null;
  order?: number;
  publishedAt?: string;
};

/** Fetch all published story chapters ordered by the `order` field (proposal included). */
export async function getStoryChapters(): Promise<StoryChapterResult[]> {
  if (!isSanityConfigured) return [];

  const { data } = await sanityFetch({
    query: STORY_CHAPTERS_QUERY,
    tags: ["sanity"],
  });

  return (data ?? []) as StoryChapterResult[];
}
