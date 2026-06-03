'use client';

import { type RefObject } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { chipContainerVariants, chipVariants } from './variants';
import type { AnimState, Chip } from './types';

interface ChatChipsProps {
  chips: Chip[];
  selectedChip: string | null;
  animInitial: AnimState;
  animAnimate: AnimState;
  containerRef: RefObject<HTMLDivElement | null>;
}

/** Quick-reply chip row. Renders nothing when there are no chips for the step. */
export function ChatChips({
  chips,
  selectedChip,
  animInitial,
  animAnimate,
  containerRef,
}: ChatChipsProps) {
  if (chips.length === 0) return null;

  return (
    <motion.div
      ref={containerRef}
      role="group"
      aria-label="Quick reply options"
      variants={chipContainerVariants}
      initial={animInitial}
      animate={animAnimate}
      className="flex flex-wrap gap-2 pb-3"
    >
      {chips.map((chip) => (
        <motion.button
          key={chip.label}
          variants={chipVariants}
          type="button"
          onClick={chip.onClick}
          className={cn(
            'min-h-11 min-w-11 rounded-full border border-raspberry px-5 py-2.5',
            'font-body text-body-md',
            'transition-colors duration-150 hover:bg-raspberry hover:text-text-on-dark',
            'focus-visible:ring-4 focus-visible:ring-raspberry/30 focus-visible:outline-1 focus-visible:outline-raspberry',
            selectedChip === chip.label
              ? 'bg-raspberry text-text-on-dark'
              : 'text-raspberry',
          )}
        >
          {chip.label}
        </motion.button>
      ))}
    </motion.div>
  );
}
