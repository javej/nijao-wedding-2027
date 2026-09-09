import { describe, it, expect, vi, beforeEach } from 'vitest';

// The page module pulls in the whole Sanity fetch layer (server-only token,
// live client) and the WeddingExperience tree. Mock both edges so we can
// exercise `generateMetadata` on its own.
vi.mock('@/sanity/queries/guests', () => ({
  getGuestBySlug: vi.fn(),
  getAllGuestSlugs: vi.fn(async () => []),
}));
vi.mock('@/components/WeddingExperience', () => ({
  WeddingExperience: () => null,
}));
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

import { getGuestBySlug } from '@/sanity/queries/guests';
import { sharedOpenGraph } from '@/lib/site-metadata';
import { generateMetadata } from './page';

const guest = {
  firstName: 'Marivic',
  nickname: null,
  slug: 'hwyrp90d',
  email: null,
  mobile: null,
  plusOneEligible: false,
  plusOneType: null,
  plusOneLinkedGuest: null,
  rsvpStatus: 'pending' as const,
  rsvpUpdatedAt: null,
  openPlusOne: null,
  parking: null,
};

function metadataFor(slug: string) {
  return generateMetadata({ params: Promise.resolve({ slug }) });
}

beforeEach(() => {
  vi.mocked(getGuestBySlug).mockResolvedValue(guest);
});

describe('guest page metadata', () => {
  // Facebook treats og:url as the canonical resource for a shared link, and
  // Messenger's preview card opens that canonical URL rather than the text the
  // sender pasted. Inheriting the root layout's `url: "/"` therefore sent
  // first-time guests to the anonymous home page, where the RSVP section is
  // only a heading. Each guest page must advertise its own URL.
  it('points og:url and the canonical link at the guest URL itself', async () => {
    const metadata = await metadataFor('hwyrp90d');

    expect(metadata.openGraph?.url).toBe('/hwyrp90d');
    expect(metadata.alternates?.canonical).toBe('/hwyrp90d');
  });

  // Next.js replaces the whole `openGraph` object rather than deep-merging it
  // with the layout's, so overriding `url` must not drop the shared card.
  it('keeps the shared Open Graph card alongside the guest URL', async () => {
    const metadata = await metadataFor('hwyrp90d');

    expect(metadata.openGraph).toMatchObject({
      title: sharedOpenGraph.title,
      description: sharedOpenGraph.description,
      images: sharedOpenGraph.images,
      siteName: sharedOpenGraph.siteName,
    });
  });

  it('keeps the personalised title', async () => {
    const metadata = await metadataFor('hwyrp90d');

    expect(metadata.title).toBe('Marivic — Jave & Nianne, January 8, 2027');
  });

  it('returns no metadata for a malformed slug without querying Sanity', async () => {
    const metadata = await metadataFor('not-a-slug');

    expect(metadata).toEqual({});
    expect(getGuestBySlug).not.toHaveBeenCalled();
  });

  it('returns no metadata for an unknown guest', async () => {
    vi.mocked(getGuestBySlug).mockResolvedValue(null);

    const metadata = await metadataFor('zzzzzzzz');

    expect(metadata).toEqual({});
  });
});
