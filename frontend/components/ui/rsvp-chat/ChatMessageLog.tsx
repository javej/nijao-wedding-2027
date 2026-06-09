'use client';

import { type RefObject } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { bubbleVariants } from './variants';
import type { AnimState, ChatMessage } from './types';

interface ChatMessageLogProps {
  messages: ChatMessage[];
  animInitial: AnimState;
  animAnimate: AnimState;
  /** Disable Framer `layout` (it still runs FLIP measurements) under reduced motion. */
  shouldReduceMotion: boolean;
  /** Sentinel at the end of the log used for auto-scroll. */
  endRef: RefObject<HTMLDivElement | null>;
}

/** The scrolling conversation log: animated system/guest message bubbles. */
export function ChatMessageLog({
  messages,
  animInitial,
  animAnimate,
  shouldReduceMotion,
  endRef,
}: ChatMessageLogProps) {
  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="RSVP conversation"
      className="flex flex-col gap-3 pb-4"
    >
      <AnimatePresence mode="popLayout">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            variants={bubbleVariants}
            initial={animInitial}
            animate={animAnimate}
            layout={!shouldReduceMotion}
            className={cn(
              'max-w-[85%] px-4 py-3 font-body text-body-md',
              msg.sender === 'system'
                ? 'self-start rounded-[16px_16px_16px_4px] bg-background border border-foreground/10 text-foreground'
                : 'self-end rounded-[16px_16px_4px_16px] bg-golden-matcha text-text-on-light',
            )}
          >
            {msg.text}
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={endRef} />
    </div>
  );
}
