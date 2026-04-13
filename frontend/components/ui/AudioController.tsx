'use client';

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';

/** Ambient playback volume — tasteful, not jarring. */
const AMBIENT_VOLUME = 0.3;

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

  const animationState = shouldReduceMotion ? 'reduced' : 'visible';
  const initialState = shouldReduceMotion ? 'reduced' : 'hidden';

  // Expose play() for the parent to call within a user-gesture handler
  useImperativeHandle(ref, () => ({
    play() {
      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = AMBIENT_VOLUME;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Browser blocked autoplay — mute toggle remains available
        });
    },
  }));

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isPlaying) {
      // First interaction with toggle — attempt to start playback
      audio.volume = AMBIENT_VOLUME;
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsMuted(false);
        })
        .catch(() => {});
      return;
    }

    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);
  }, [isPlaying, isMuted]);

  return (
    <>
      {/* Audio element — preloads during monogram, never autoplays */}
      <audio ref={audioRef} src="/audio/ambient.mp3" preload="auto" loop />

      {/* Mute/unmute toggle — fixed bottom-left, appears after overlay dismisses */}
      <AnimatePresence>
        {visible && (
          <motion.button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute music' : 'Mute music'}
            className="fixed bottom-6 left-6 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5 text-foreground/50 backdrop-blur-sm transition-colors hover:bg-foreground/10 hover:text-foreground/70"
            variants={toggleVariants}
            initial={initialState}
            animate={animationState}
            exit="exit"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
});
