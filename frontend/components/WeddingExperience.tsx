import { ChapterScrollContainer } from '@/components/ui/ChapterScrollContainer';
import { ChapterSection } from '@/components/ui/ChapterSection';
import { ExperienceShell } from '@/components/ui/ExperienceShell';
import { FloatingAnchorSet } from '@/components/ui/FloatingAnchorSet';
import { HeroSection } from '@/components/sections/HeroSection';
import { StoryChapter } from '@/components/sections/StoryChapter';
import { WeddingDetails } from '@/components/sections/WeddingDetails';
import { DressCodeSection } from '@/components/sections/DressCodeSection';
import { EntourageSection } from '@/components/sections/EntourageSection';
import { RSVPSection } from '@/components/sections/RSVPSection';
import { getStoryChapters } from '@/sanity/queries/storyChapters';
import { getWeddingDetails } from '@/sanity/queries/weddingDetails';
import { getDressCode } from '@/sanity/queries/dressCode';
import { getPadrinos, getWeddingParty } from '@/sanity/queries/entourage';
import type { GuestResult } from '@/sanity/queries/guests';
import { deriveRsvpViewState } from '@/lib/rsvp-view-state';

export type WeddingGuest = NonNullable<GuestResult>;

interface WeddingExperienceProps {
  guest: WeddingGuest | null;
}

export async function WeddingExperience({ guest }: WeddingExperienceProps) {
  const [chapters, weddingDetails, dressCode, padrinos, weddingParty] = await Promise.all([
    getStoryChapters(),
    getWeddingDetails(),
    getDressCode(),
    getPadrinos(),
    getWeddingParty(),
  ]);

  return (
    <ExperienceShell guestName={guest?.firstName}>
      <FloatingAnchorSet />
      <ChapterScrollContainer>
        <ChapterSection id="hero" palette="raspberry" label="Jave and Nianne" decorate>
          <HeroSection />
        </ChapterSection>

        {chapters.map((chapter) => (
          <ChapterSection
            key={chapter._id}
            id={`story-${chapter.year}`}
            palette={chapter.isProposal ? 'strawberry-jam' : 'matcha-latte'}
            label={
              chapter.isProposal
                ? `The proposal — ${chapter.year}`
                : `Our story — ${chapter.year}`
            }
            decorate
          >
            <StoryChapter chapter={chapter} />
          </ChapterSection>
        ))}

        <ChapterSection id="wedding-details" palette="matcha-chiffon" label="Wedding Details">
          {weddingDetails ? (
            <WeddingDetails details={weddingDetails} />
          ) : (
            <p className="font-display text-display-md">Wedding Details</p>
          )}
        </ChapterSection>

        <ChapterSection id="dress-code" palette="matcha-chiffon" label="Dress Code">
          {dressCode ? (
            <DressCodeSection dressCode={dressCode} />
          ) : (
            <p className="font-display text-display-md">Dress Code</p>
          )}
        </ChapterSection>

        <ChapterSection id="entourage" palette="berry-meringue" label="Entourage">
          {padrinos.length > 0 || weddingParty.length > 0 ? (
            <EntourageSection padrinos={padrinos} weddingParty={weddingParty} />
          ) : (
            <p className="font-display text-display-md">Entourage</p>
          )}
        </ChapterSection>

        <ChapterSection id="rsvp" palette="golden-matcha" label="RSVP">
          {guest ? (
            <RSVPSection
              guest={guest}
              rsvpViewState={deriveRsvpViewState(guest)}
            />
          ) : (
            <p className="font-display text-display-md">RSVP</p>
          )}
        </ChapterSection>

        <ChapterSection id="completion" palette="strawberry-milk" label="Completion">
          <p className="font-display text-display-md">Completion</p>
        </ChapterSection>
      </ChapterScrollContainer>
    </ExperienceShell>
  );
}
