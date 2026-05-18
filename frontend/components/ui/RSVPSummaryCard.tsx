'use client';

import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

interface RSVPSummaryCardProps {
  headline: string;
  detailLine: string | null;
  affordanceLabel: string | null;
  onReveal: () => void;
  className?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  reduced: { opacity: 1, y: 0 },
};

export function RSVPSummaryCard({
  headline,
  detailLine,
  affordanceLabel,
  onReveal,
  className,
}: RSVPSummaryCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const animInitial = shouldReduceMotion ? 'reduced' : 'hidden';
  const animAnimate = shouldReduceMotion ? 'reduced' : 'visible';

  return (
    <motion.div
      variants={cardVariants}
      initial={animInitial}
      animate={animAnimate}
      className={cn(
        'flex w-full max-w-lg flex-col items-center text-center mx-auto gap-3',
        className,
      )}
    >
      <p className="font-display text-display-md text-foreground">{headline}</p>
      {detailLine && (
        <p className="font-body text-body-md text-foreground/70">{detailLine}</p>
      )}
      {affordanceLabel && (
        <button
          type="button"
          onClick={onReveal}
          className={cn(
            'mt-1 font-body text-body-sm text-raspberry underline underline-offset-4',
            'hover:text-raspberry/80 focus-visible:outline-1 focus-visible:outline-raspberry',
            'focus-visible:ring-4 focus-visible:ring-raspberry/30',
          )}
        >
          {affordanceLabel}
        </button>
      )}
    </motion.div>
  );
}
