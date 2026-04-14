import { RSVPChat } from '@/components/ui/RSVPChat';
import type { WeddingGuest } from '@/components/WeddingExperience';

interface RSVPSectionProps {
  guest: WeddingGuest;
}

/**
 * Server Component shell for the RSVP section.
 * Receives guest context from the page and passes serializable props
 * to the RSVPChat client island.
 */
export function RSVPSection({ guest }: RSVPSectionProps) {
  return (
    <RSVPChat
      guestName={guest.firstName}
      guestSlug={guest.slug}
      plusOneEligible={guest.plusOneEligible ?? false}
      plusOneType={guest.plusOneType ?? null}
      plusOneLinkedGuestName={guest.plusOneLinkedGuest?.firstName ?? null}
    />
  );
}
