import type { Metadata } from 'next';
import { ChapterScrollContainer } from '@/components/ui/ChapterScrollContainer';
import { ChapterSection } from '@/components/ui/ChapterSection';
import { ExperienceShell } from '@/components/ui/ExperienceShell';
import { HeroSection } from '@/components/sections/HeroSection';

export const metadata: Metadata = {
  title: 'Jave & Nianne — January 8, 2027',
  description:
    'You are cordially invited to the wedding of Jave and Nianne. January 8, 2027 — Lipa, Batangas.',
};

export default function IndexPage() {
  return (
    <ExperienceShell>
      <ChapterScrollContainer>
        <ChapterSection id="hero" palette="raspberry" label="Jave and Nianne">
          <HeroSection />
        </ChapterSection>

        <ChapterSection id="story-scroll" palette="matcha-latte" label="Story Scroll">
          <p className="font-display text-display-md">Story Scroll</p>
        </ChapterSection>

        <ChapterSection id="proposal" palette="strawberry-jam" label="Proposal">
          <p className="font-display text-display-md">Proposal</p>
        </ChapterSection>

        <ChapterSection id="wedding-details" palette="matcha-chiffon" label="Wedding Details">
          <p className="font-display text-display-md">Wedding Details</p>
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
