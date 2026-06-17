'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

/**
 * Framer Motion variants defined OUTSIDE the component to prevent re-renders.
 * Architecture mandate: variants must not be inline objects.
 */

// Overlay fade-out after the monogram video finishes
const overlayVariants = {
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

// Reduced-motion overlay exits instantly (no fade)
const overlayReducedVariants = {
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0 } },
};

// Monogram videos. The `&` in the filenames is percent-encoded so the path is
// a valid URL. Portrait fills phones; landscape fills desktops. No poster: both
// clips fade in from blank white, so the warm-white loader background already
// matches the clip's opening while it buffers — a poster of the finished mark
// would flash the completed monogram, then jump back to blank when playback
// starts. The loader background (matching --background, near-white) is what
// covers the buffering gap and any object-cover crop edge.
const PORTRAIT_VIDEO = '/video/Nianne%26Jave_Monogram_1080x1920_8s.mp4';
const LANDSCAPE_VIDEO = '/video/Nianne%26Jave_Monogram_1920x1080_8s.mp4';

/**
 * Maximum time before the loader force-exits, preventing a permanent page lock
 * if the video stalls or autoplay is blocked without firing onError. The clips
 * are 8s, so this sits comfortably past their natural end.
 */
const SAFETY_TIMEOUT_MS = 9500;

interface MonogramLoaderProps {
  /** Called after the exit animation completes and the loader fully unmounts. */
  onComplete?: () => void;
}

export function MonogramLoader({ onComplete }: MonogramLoaderProps) {
  const [isComplete, setIsComplete] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const hasExited = useRef(false);

  function exitLoader() {
    if (hasExited.current) return;
    hasExited.current = true;
    setIsComplete(true);
  }

  // Pick the orientation-matched clip on the client only (avoids a hydration
  // mismatch — the server can't know the viewport orientation). matchMedia is
  // more reliable cross-browser than <source media> for choosing the source.
  useEffect(() => {
    const portrait = window.matchMedia('(orientation: portrait)').matches;
    setVideoSrc(portrait ? PORTRAIT_VIDEO : LANDSCAPE_VIDEO);
  }, []);

  // Safety timeout — force-exit if the video never reaches its end
  useEffect(() => {
    const timer = setTimeout(exitLoader, SAFETY_TIMEOUT_MS);
    return () => clearTimeout(timer);

  }, []);

  // Reduced motion: skip the motion video and exit immediately
  useEffect(() => {
    if (shouldReduceMotion) {
      exitLoader();
    }

  }, [shouldReduceMotion]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!isComplete && (
        <motion.div
          role="status"
          aria-label="Loading"
          className="fixed inset-0 z-60 flex items-center justify-center overflow-hidden bg-background"
          variants={shouldReduceMotion ? overlayReducedVariants : overlayVariants}
          initial="visible"
          exit="exit"
        >
          {videoSrc && !shouldReduceMotion && (
            <video
              key={videoSrc}
              className="h-full w-full object-cover"
              autoPlay
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              onEnded={exitLoader}
              onError={exitLoader}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
