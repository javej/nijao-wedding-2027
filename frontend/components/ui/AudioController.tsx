'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { useTextEntryFocused } from '@/hooks/useTextEntryFocused';

/** Ambient playback volume — tasteful, not jarring. */
const AMBIENT_VOLUME = 0.3;

/**
 * Events that grant user activation, so `play()` is allowed inside them.
 * Swipes (`touchmove`), wheel scrolls and Escape do NOT — and those are all
 * valid ways to dismiss the welcome screen, so a blocked first start retries
 * on the guest's next tap, click or key press. Captured on window so a
 * handler that stops propagation can't swallow it.
 */
const ACTIVATION_EVENTS = ['click', 'touchend', 'keydown'] as const;

const toggleVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
  reduced: { opacity: 1, scale: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export interface AudioControllerHandle {
  /** Attempt to start playback — must be called within a user gesture. */
  play: () => void;
}

interface AudioControllerProps {
  /** Show the mute/unmute toggle (visible after overlay dismisses). */
  visible: boolean;
}

export const AudioController = forwardRef<
  AudioControllerHandle,
  AudioControllerProps
>(function AudioController({ visible }, ref) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  // Fixed bottom-left: on Chrome Android it rides up on top of the keyboard,
  // right where the RSVP chat's Skip button sits. Hide it while typing.
  const textEntryFocused = useTextEntryFocused();

  const animationState = shouldReduceMotion ? 'reduced' : 'visible';
  const initialState = shouldReduceMotion ? 'reduced' : 'hidden';

  // Removes the pending gesture-retry listeners; null when none are armed.
  const disarmRetryRef = useRef<(() => void) | null>(null);

  const disarmRetry = useCallback(() => {
    disarmRetryRef.current?.();
    disarmRetryRef.current = null;
  }, []);

  const startPlayback = useCallback((): Promise<void> => {
    const audio = audioRef.current;
    if (!audio) return Promise.reject(new Error('Audio element is not mounted'));
    audio.volume = AMBIENT_VOLUME;
    return audio.play().then(() => {
      disarmRetry();
      setIsPlaying(true);
    });
  }, [disarmRetry]);

  const armRetry = useCallback(() => {
    if (disarmRetryRef.current) return;
    const retry = () => {
      // A refusal here just means this gesture didn't count either (e.g. the
      // touchend that ends a scroll on iOS) — stay armed for the next one.
      startPlayback().catch(() => {});
    };
    ACTIVATION_EVENTS.forEach((type) => window.addEventListener(type, retry, true));
    disarmRetryRef.current = () =>
      ACTIVATION_EVENTS.forEach((type) => window.removeEventListener(type, retry, true));
  }, [startPlayback]);

  useEffect(() => disarmRetry, [disarmRetry]);

  // Expose play() for the parent to call within the dismiss-gesture handler.
  useImperativeHandle(
    ref,
    () => ({
      play() {
        startPlayback().catch(armRetry);
      },
    }),
    [startPlayback, armRetry],
  );

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isPlaying) {
      // The toggle tap is itself a user gesture, so this start is allowed.
      startPlayback()
        .then(() => setIsMuted(false))
        .catch(() => {});
      return;
    }

    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);
  }, [isPlaying, isMuted, startPlayback]);

  // Silent until playback has actually started — not just until unmuted —
  // so a blocked start never shows a speaker icon over a quiet page.
  const audible = isPlaying && !isMuted;
  const toggleLabel = !isPlaying ? 'Play music' : isMuted ? 'Unmute music' : 'Mute music';

  return (
    <>
      {/* Audio element — preloads during monogram, never autoplays */}
      <audio ref={audioRef} src="/audio/sonican-positive-classical-music-453836.mp3" preload="auto" loop />

      {/* Mute/unmute toggle — fixed bottom-left, appears after overlay dismisses */}
      <AnimatePresence>
        {visible && !textEntryFocused && (
          <motion.button
            type="button"
            onClick={toggleMute}
            aria-label={toggleLabel}
            className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-[calc(1.5rem+env(safe-area-inset-left))] z-30 flex h-11 w-11 items-center justify-center rounded-full bg-foreground/5 text-foreground/50 backdrop-blur-sm transition-colors hover:bg-foreground/10 hover:text-foreground/70 focus-visible:ring-2 focus-visible:ring-raspberry focus-visible:ring-offset-2 focus-visible:outline-none"
            variants={toggleVariants}
            initial={initialState}
            animate={animationState}
            exit="exit"
          >
            {audible ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
});
