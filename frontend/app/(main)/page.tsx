import type { Metadata } from 'next';
import { ChapterScrollContainer } from '@/components/ui/ChapterScrollContainer';
import { ChapterSection } from '@/components/ui/ChapterSection';
import { ExperienceShell } from '@/components/ui/ExperienceShell';
import { HeroSection } from '@/components/sections/HeroSection';
import { ProposalSection } from '@/components/sections/ProposalSection';
import { StoryChapter } from '@/components/sections/StoryChapter';
import { WeddingDetails } from '@/components/sections/WeddingDetails';
import { getProposalSection, getStoryChapters } from '@/sanity/queries/storyChapters';
import { getWeddingDetails } from '@/sanity/queries/weddingDetails';

export const metadata: Metadata = {
  title: 'Jave & Nianne — January 8, 2027',
  description:
    'You are cordially invited to the wedding of Jave and Nianne. January 8, 2027 — Lipa, Batangas.',
};

export default async function IndexPage() {
  const [chapters, proposal, weddingDetails] = await Promise.all([
    getStoryChapters(),
    getProposalSection(),
    getWeddingDetails(),
  ]);

  return (
    <ExperienceShell>
      <ChapterScrollContainer>
        <ChapterSection id="hero" palette="raspberry" label="Jave and Nianne">
          <HeroSection />
        </ChapterSection>

        {chapters.map((chapter) => (
          <ChapterSection
            key={chapter._id}
            id={`story-${chapter.year}`}
            palette="matcha-latte"
            label={`Our story — ${chapter.year}`}
          >
            <StoryChapter chapter={chapter} />
          </ChapterSection>
        ))}

        <ChapterSection id="proposal" palette="strawberry-jam" label="The Proposal">
          {proposal ? (
            <ProposalSection proposal={proposal} />
          ) : (
            <p className="font-display text-display-md">The Proposal</p>
          )}
        </ChapterSection>

        <ChapterSection id="wedding-details" palette="matcha-chiffon" label="Wedding Details">
          {weddingDetails ? (
            <WeddingDetails details={weddingDetails} />
          ) : (
            <p className="font-display text-display-md">Wedding Details</p>
          )}
        </ChapterSection>

        <ChapterSection id="entourage" palette="berry-meringue" label="Entourage">
          <p className="font-display text-display-md">Entourage</p>
        </ChapterSection>

        <ChapterSection id="rsvp" palette="golden-matcha" label="RSVP">
          <p className="font-display text-display-md">RSVP</p>
        </ChapterSection>

        <ChapterSection id="completion" palette="strawberry-milk" label="Completion">
          <p className="font-display text-display-md">Completion</p>
        </ChapterSection>
      </ChapterScrollContainer>
    </ExperienceShell>
  );
}
