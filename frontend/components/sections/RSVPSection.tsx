'use client';

import { useState, useEffect } from 'react';
import { RSVPChat } from '@/components/ui/RSVPChat';
import { PetalBurst } from '@/components/ui/PetalBurst';
import type { WeddingGuest } from '@/components/WeddingExperience';

interface RSVPSectionProps {
  guest: WeddingGuest;
}

// Longest petal animation: ~10.1s (delay 1.1 + duration 9.0). Cleanup buffer: 11s.
const PETAL_BURST_DURATION_MS = 11_000;

export function RSVPSection({ guest }: RSVPSectionProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  // Auto-unmount PetalBurst after the animation completes to reclaim DOM nodes
  useEffect(() => {
    if (!showConfetti) return;
    const timer = setTimeout(() => setShowConfetti(false), PETAL_BURST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showConfetti]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full px-(--chapter-padding-x) py-(--chapter-padding-y)">
      {showConfetti && <PetalBurst />}
      <RSVPChat
        guestName={guest.firstName}
        guestSlug={guest.slug}
        plusOneEligible={guest.plusOneEligible ?? false}
        plusOneType={guest.plusOneType ?? null}
        plusOneLinkedGuestName={guest.plusOneLinkedGuest?.firstName ?? null}
        onConfirm={() => setShowConfetti(true)}
      />
    </div>
  );
}
