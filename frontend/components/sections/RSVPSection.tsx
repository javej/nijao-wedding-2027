'use client';

import { useState, useEffect, useCallback } from 'react';
import { RSVPChat, type RSVPSubmissionResult } from '@/components/ui/RSVPChat';
import { RSVPSummaryCard } from '@/components/ui/RSVPSummaryCard';
import { RSVPClosedPanel } from '@/components/ui/RSVPClosedPanel';
import { PetalBurst } from '@/components/ui/PetalBurst';
import type { WeddingGuest } from '@/components/WeddingExperience';
import type { RsvpStatus } from '@/sanity/queries/guests';
import {
  contextFromGuest,
  deriveDetailLine,
  deriveSummaryHeadline,
  type RsvpViewMode,
  type RsvpViewState,
} from '@/lib/rsvp-view-state';

interface RSVPSectionProps {
  guest: WeddingGuest;
  rsvpViewState: RsvpViewState;
}

// Longest petal animation: ~10.1s (delay 1.1 + duration 9.0). Cleanup buffer: 11s.
const PETAL_BURST_DURATION_MS = 11_000;

export function RSVPSection({ guest, rsvpViewState }: RSVPSectionProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [viewMode, setViewMode] = useState<RsvpViewMode>(
    rsvpViewState.initialMode,
  );
  const [optimisticStatus, setOptimisticStatus] = useState<RsvpStatus>(
    rsvpViewState.status,
  );
  const [optimisticDetail, setOptimisticDetail] = useState<string | null>(
    rsvpViewState.detailLine,
  );

  // Auto-unmount PetalBurst after the animation completes to reclaim DOM nodes
  useEffect(() => {
    if (!showConfetti) return;
    const timer = setTimeout(() => setShowConfetti(false), PETAL_BURST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showConfetti]);

  // If server-derived state changes (e.g., after revalidateTag refresh), trust it.
  useEffect(() => {
    setOptimisticStatus(rsvpViewState.status);
    setOptimisticDetail(rsvpViewState.detailLine);
    setViewMode(rsvpViewState.initialMode);
  }, [
    rsvpViewState.status,
    rsvpViewState.detailLine,
    rsvpViewState.initialMode,
  ]);

  const handleReveal = useCallback(() => {
    if (rsvpViewState.isClosed) return;
    setViewMode('chat');
  }, [rsvpViewState.isClosed]);

  // Called from RSVPChat after a successful submission so the parent can
  // optimistically swap back to the summary card. The server has revalidated
  // the page tag — the next navigation/refresh reflects the same state.
  const handleChatComplete = useCallback(
    (result: RSVPSubmissionResult) => {
      const nextStatus: RsvpStatus = result.attending ? 'attending' : 'declined';
      setOptimisticStatus(nextStatus);
      // Replay AC 5 with the submission's fresh open-plus-one values layered
      // on the rest of the guest doc; the shared helper is the single source
      // of truth for the rule.
      setOptimisticDetail(
        deriveDetailLine(nextStatus, {
          ...contextFromGuest(guest),
          openPlusOneAttending: result.plusOneAttending,
          openPlusOneName: result.plusOneName,
        }),
      );
      if (result.attending) {
        setShowConfetti(true);
      }
      // Brief delay so the chat's terminal bubble + petal burst can play before
      // we collapse back to the summary card.
      setTimeout(() => setViewMode('summary'), 2_400);
    },
    [guest],
  );

  const summaryHeadline = deriveSummaryHeadline(optimisticStatus);

  const affordanceLabel = rsvpViewState.isClosed
    ? null
    : optimisticStatus === 'attending'
      ? 'Need to change?'
      : optimisticStatus === 'declined'
        ? 'Changed your mind?'
        : null;

  return (
    <div className="relative flex flex-col items-center justify-center w-full px-(--chapter-padding-x) py-(--chapter-padding-y)">
      {showConfetti && <PetalBurst />}

      {viewMode === 'summary' && optimisticStatus !== 'pending' && (
        <div className="flex flex-col items-center gap-3">
          <RSVPSummaryCard
            headline={summaryHeadline}
            detailLine={optimisticDetail}
            affordanceLabel={affordanceLabel}
            onReveal={handleReveal}
          />
          {rsvpViewState.isClosed && (
            <p className="font-body text-body-sm text-foreground/50">
              RSVPs are now closed.
            </p>
          )}
        </div>
      )}

      {viewMode === 'closed' && <RSVPClosedPanel />}

      {viewMode === 'chat' && (
        <RSVPChat
          guestName={guest.firstName}
          guestSlug={guest.slug}
          plusOneEligible={guest.plusOneEligible ?? false}
          plusOneType={guest.plusOneType ?? null}
          plusOneLinkedGuestName={guest.plusOneLinkedGuest?.firstName ?? null}
          plusOneLinkedGuestSlug={guest.plusOneLinkedGuest?.slug ?? null}
          onConfirm={() => setShowConfetti(true)}
          onComplete={handleChatComplete}
        />
      )}
    </div>
  );
}
