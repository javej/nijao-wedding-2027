'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

/**
 * Framer Motion variants defined OUTSIDE the component to prevent re-renders.
 * Architecture mandate: variants must not be inline objects.
 */

// j tittle (dot above the j — deep-matcha)
const tittleVariants = {
  hidden: { pathLength: 0, fillOpacity: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    fillOpacity: 1,
    opacity: 1,
    transition: { duration: 0.3, delay: 0.35, ease: 'easeInOut' as const, fillOpacity: { duration: 0.2, delay: 0.55 } },
  },
  reduced: { pathLength: 1, fillOpacity: 1, opacity: 1 },
};

// j stem + descender (deep-matcha)
const jVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.9, delay: 0.4, ease: 'easeInOut' as const },
  },
  reduced: { pathLength: 1, opacity: 1 },
};

// n hump — draws last, triggers completion (strawberry-milk)
const nVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.9, delay: 1.3, ease: 'easeInOut' as const },
  },
  reduced: { pathLength: 1, opacity: 1 },
};

// Overlay fade-out after draw-on completes
const overlayVariants = {
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

export function MonogramLoader() {
  const [isComplete, setIsComplete] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const animationState = shouldReduceMotion ? 'reduced' : 'visible';
  const initialState = shouldReduceMotion ? 'reduced' : 'hidden';

  // Lock body scroll while loader is visible, unlock on exit
  useEffect(() => {
    if (!isComplete) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isComplete]);

  function handleDrawComplete() {
    // 500ms hold so the mark is seen before fade-out
    setTimeout(() => setIsComplete(true), 500);
  }

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          variants={overlayVariants}
          initial="visible"
          exit="exit"
        >
          <svg
            viewBox="0 0 120 150"
            className="h-48 w-48 sm:h-60 sm:w-60"
            fill="none"
            aria-label=".jn monogram"
            role="img"
          >
            {/* j tittle (large filled dot above j) */}
            <motion.circle
              cx="50"
              cy="14"
              r="6"
              stroke="var(--color-deep-matcha)"
              strokeWidth="2"
              fill="var(--color-deep-matcha)"
              initial={initialState}
              animate={animationState}
              variants={tittleVariants}
            />

            {/* j stem + descender with ball terminal */}
            <motion.path
              d="M 50 36 L 50 105 Q 50 130 32 130 Q 18 130 18 116"
              stroke="var(--color-deep-matcha)"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={initialState}
              animate={animationState}
              variants={jVariants}
            />

            {/* n: rises from j stem, bold arch, descends to baseline */}
            <motion.path
              d="M 50 72 Q 50 46 72 46 Q 98 46 98 72 L 98 105"
              stroke="var(--color-strawberry-milk)"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={initialState}
              animate={animationState}
              variants={nVariants}
              onAnimationComplete={handleDrawComplete}
            />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
