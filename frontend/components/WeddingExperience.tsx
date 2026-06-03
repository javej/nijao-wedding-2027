import { ChapterScrollContainer } from '@/components/ui/ChapterScrollContainer';
import { ChapterSection, type BgTone } from '@/components/ui/ChapterSection';
import { ExperienceShell } from '@/components/ui/ExperienceShell';
import { FloatingAnchorSet } from '@/components/ui/FloatingAnchorSet';
import { HeroSection } from '@/components/sections/HeroSection';
import { StoryChapter } from '@/components/sections/StoryChapter';
import { WeddingDetails } from '@/components/sections/WeddingDetails';
import { DressCodeSection } from '@/components/sections/DressCodeSection';
import { EntourageSection } from '@/components/sections/EntourageSection';
import { RSVPSection } from '@/components/sections/RSVPSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { CountdownSection } from '@/components/sections/CountdownSection';
import { getStoryChapters } from '@/sanity/queries/storyChapters';
import { getWeddingDetails } from '@/sanity/queries/weddingDetails';
import { getDressCode } from '@/sanity/queries/dressCode';
import { getPadrinos, getWeddingParty } from '@/sanity/queries/entourage';
import { getFaqs } from '@/sanity/queries/faqs';
import type { GuestResult } from '@/sanity/queries/guests';
import type { PageBg } from '@/components/ui/PageCard';
import { deriveRsvpViewState } from '@/lib/rsvp-view-state';

export type WeddingGuest = NonNullable<GuestResult>;

interface WeddingExperienceProps {
  guest: WeddingGuest | null;
}

/**
 * 2-way bg rotation across year chapters. Alternates matcha ↔
 * raspberry — every chapter lands on a deep, saturated page,
 * trading deep-green and deep-wine in lockstep. The proposal is
 * locked to strawberry-milk for tonal contrast at the climax and
 * never participates in this cycle — see `bgForChapter` below.
 */
const YEAR_PAGE_ROTATION: ReadonlyArray<PageBg> = ['matcha', 'raspberry'];

/**
 * Map each story chapter to its patterned page bg. Proposal chapters
 * always land on strawberry-milk regardless of position in the
 * sequence — the climax color is reserved for the climax moment.
 */
function bgForChapter(chapter: { isProposal?: boolean }, yearIndex: number): PageBg {
  if (chapter.isProposal) return 'strawberry-milk';
  return YEAR_PAGE_ROTATION[yearIndex % YEAR_PAGE_ROTATION.length]!;
}

/**
 * Lift the `PageBg` value to the `BgTone` ChapterSection expects.
 * One-to-one mapping; the `page-*` tones set the section's wing
 * color and text/mat tokens to match each patterned PNG.
 */
function bgToneForPage(bg: PageBg): BgTone {
  switch (bg) {
    case 'cream':
      return 'page-cream';
    case 'matcha':
      return 'page-matcha';
    case 'raspberry':
      return 'page-raspberry';
    case 'strawberry-milk':
      return 'page-strawberry-milk';
  }
}

export async function WeddingExperience({ guest }: WeddingExperienceProps) {
  const [chapters, weddingDetails, dressCode, padrinos, weddingParty, faqs] = await Promise.all([
    getStoryChapters(),
    getWeddingDetails(),
    getDressCode(),
    getPadrinos(),
    getWeddingParty(),
    getFaqs(),
  ]);

  // Year-only counter for the rotation — proposal chapters skip the
  // counter so they don't shift the cream/matcha/raspberry cadence.
  let yearIndex = 0;

  return (
    <ExperienceShell guestName={guest?.nickname || guest?.firstName}>
      <FloatingAnchorSet />
      <ChapterScrollContainer>
        <ChapterSection id="hero" palette="raspberry" label="Jave and Nianne" decorate hero>
          <HeroSection />
        </ChapterSection>

        {chapters.map((chapter) => {
          const pageBg = bgForChapter(chapter, yearIndex);
          if (!chapter.isProposal) yearIndex += 1;

          return (
            <ChapterSection
              key={chapter._id}
              // Append `-proposal` when this chapter is the engagement —
              // lets a same-year anniversary chapter coexist with the
              // proposal chapter without colliding on the HTML id.
              id={`story-${chapter.year}${chapter.isProposal ? '-proposal' : ''}`}
              palette={chapter.isProposal ? 'strawberry-jam' : 'matcha-latte'}
              label={
                chapter.isProposal
                  ? `The proposal — ${chapter.year}`
                  : `Our story — ${chapter.year}`
              }
              bg={bgToneForPage(pageBg)}
              story
            >
              <StoryChapter chapter={chapter} pageBg={pageBg} />
            </ChapterSection>
          );
        })}

        <ChapterSection id="wedding-details" palette="matcha-chiffon" label="When & Where">
          {weddingDetails ? (
            <WeddingDetails details={weddingDetails} />
          ) : (
            <p className="font-display text-display-md">When &amp; Where</p>
          )}
        </ChapterSection>

        <ChapterSection id="dress-code" palette="deep-matcha" label="Dress Code">
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

        <ChapterSection id="faq" palette="berry-meringue" label="FAQ">
          <FAQSection faqs={faqs} />
        </ChapterSection>

        <ChapterSection
          id="countdown"
          palette="strawberry-milk"
          label="Countdown to the wedding"
          decorate
        >
          <CountdownSection />
        </ChapterSection>
      </ChapterScrollContainer>
    </ExperienceShell>
  );
}
