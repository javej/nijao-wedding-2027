'use client';

import { motion, useReducedMotion } from 'motion/react';

const panelVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  reduced: { opacity: 1, y: 0 },
};

export function RSVPClosedPanel() {
  const shouldReduceMotion = useReducedMotion();
  const animInitial = shouldReduceMotion ? 'reduced' : 'hidden';
  const animAnimate = shouldReduceMotion ? 'reduced' : 'visible';

  return (
    <motion.div
      variants={panelVariants}
      initial={animInitial}
      animate={animAnimate}
      className="flex w-full max-w-lg flex-col items-center text-center mx-auto gap-3"
    >
      <p className="font-display text-display-md text-foreground">
        RSVPs have closed on November 8.
      </p>
      <p className="font-body text-body-md text-foreground/70">
        If you&apos;d still like to reach us, please contact Jave &amp; Nianne directly.
      </p>
    </motion.div>
  );
}
