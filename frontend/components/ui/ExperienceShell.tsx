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
}

/**
 * Orchestrates the arrival sequence:
 *   MonogramLoader (z-50) → ArrivalOverlay (z-40) → scroll content (z-0)
 *
 * Body scroll is locked during loader + overlay, then unlocked when the
 * guest's first interaction dismisses the overlay.
 */
export function ExperienceShell({ children }: ExperienceShellProps) {
  const [loaderDone, setLoaderDone] = useState(false);
  const [overlayDismissed, setOverlayDismissed] = useState(false);
  const audioRef = useRef<AudioControllerHandle>(null);

  // Lock body scroll during the entire arrival sequence (loader + overlay).
  // Unlock only after the overlay is dismissed.
  useEffect(() => {
    if (!overlayDismissed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [overlayDismissed]);

  const handleOverlayDismiss = useCallback(() => {
    setOverlayDismissed(true);
    // Start audio directly within the user-gesture call stack (iOS requirement)
    audioRef.current?.play();
  }, []);

  return (
    <>
      <MonogramLoader onComplete={() => setLoaderDone(true)} />
      <ArrivalOverlay
        visible={!overlayDismissed}
        interactive={loaderDone}
        onDismiss={handleOverlayDismiss}
      />
      <AudioController ref={audioRef} visible={overlayDismissed} />
      {children}
    </>
  );
}
