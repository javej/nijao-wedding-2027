'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MonogramLoader } from '@/components/ui/MonogramLoader';
import { ArrivalOverlay } from '@/components/ui/ArrivalOverlay';
import {
  AudioController,
  type AudioControllerHandle,
} from '@/components/ui/AudioController';

interface ExperienceShellProps {
  children: React.ReactNode;
  guestName?: string;
}

/**
 * Orchestrates the arrival sequence:
 *   MonogramLoader (z-50) → ArrivalOverlay (z-40) → scroll content (z-0)
 *
 * Body scroll is locked during loader + overlay, then unlocked when the
 * guest's first interaction dismisses the overlay.
 */
/** Belt-and-braces fallback for the scroll-lock release in case the overlay's exit animation is ever interrupted and onExitComplete never fires. Comfortably longer than the 500ms fade. */
const ARRIVAL_FALLBACK_MS = 1000;

export function ExperienceShell({ children, guestName }: ExperienceShellProps) {
  const [loaderDone, setLoaderDone] = useState(false);
  const [overlayDismissed, setOverlayDismissed] = useState(false);
  const [arrivalComplete, setArrivalComplete] = useState(false);
  const audioRef = useRef<AudioControllerHandle>(null);

  // Lock scroll until the overlay has FULLY faded out — not just until the
  // dismiss gesture fires. Releasing on overlayDismissed alone leaves a 500ms
  // window during fade-out where the wheel listener has detached and main is
  // unlocked; a fast wheel scroll leaks through and scrolls the page mid-fade.
  //
  // The real scroll container is <main id="main-content">, not <body> — a body
  // overflow:hidden does not block an inner overflow-y-scroll container from
  // scrolling. See ADR-0003 for full reasoning.
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (!arrivalComplete) {
      document.body.style.overflow = 'hidden';
      if (main) {
        main.style.overflow = 'hidden';
        // Defeat browser scroll restoration and any prior leak — the guest
        // must always land on the Hero, framed correctly, when the overlay
        // fades. See ADR-0003.
        main.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = '';
      if (main) {
        main.style.overflow = '';
        main.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
      const m = document.getElementById('main-content');
      if (m) m.style.overflow = '';
    };
  }, [arrivalComplete]);

  // Fallback in case onExitComplete never fires (animation interrupted, etc.)
  useEffect(() => {
    if (!overlayDismissed) return;
    const t = setTimeout(() => setArrivalComplete(true), ARRIVAL_FALLBACK_MS);
    return () => clearTimeout(t);
  }, [overlayDismissed]);

  const handleOverlayDismiss = useCallback(() => {
    setOverlayDismissed(true);
    // Start audio directly within the user-gesture call stack (iOS requirement)
    audioRef.current?.play();
  }, []);

  const handleOverlayExitComplete = useCallback(() => {
    setArrivalComplete(true);
  }, []);

  return (
    <>
      <MonogramLoader onComplete={() => setLoaderDone(true)} />
      <ArrivalOverlay
        visible={!overlayDismissed}
        interactive={loaderDone}
        onDismiss={handleOverlayDismiss}
        onExitComplete={handleOverlayExitComplete}
        guestName={guestName}
      />
      <AudioController ref={audioRef} visible={overlayDismissed} />
      {children}
    </>
  );
}
