'use client';

import { useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

/**
 * Framer Motion variants defined OUTSIDE the component (architecture mandate).
 */
const overlayVariants = {
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const overlayReducedVariants = {
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0 } },
};

const textVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.3, ease: 'easeOut' as const },
  },
  reduced: { opacity: 1, y: 0 },
};

const hintVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, delay: 1.0, ease: 'easeOut' as const },
  },
  reduced: { opacity: 1 },
};

/** Minimum touch movement (px) to count as a deliberate scroll gesture. */
const TOUCH_THRESHOLD = 10;

interface ArrivalOverlayProps {
  visible: boolean;
  /** Dismiss gestures are ignored until interactive is true (loader must finish first). */
  interactive: boolean;
  onDismiss: () => void;
  /** Fires after the overlay's fade-out exit animation completes. Used by the shell to release the scroll lock only AFTER the fade, not at gesture time. See ADR-0003. */
  onExitComplete?: () => void;
  guestName?: string;
}

export function ArrivalOverlay({ visible, interactive, onDismiss, onExitComplete, guestName }: ArrivalOverlayProps) {
  const shouldReduceMotion = useReducedMotion();
  const hasDismissed = useRef(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const dismiss = useCallback(() => {
    if (!interactive || hasDismissed.current) return;
    hasDismissed.current = true;
    onDismiss();
  }, [interactive, onDismiss]);

  // Focus the overlay when it becomes interactive (accessibility)
  useEffect(() => {
    if (interactive && overlayRef.current) {
      overlayRef.current.focus();
    }
  }, [interactive]);

  // Listen for scroll/keyboard gestures to dismiss — only when interactive
  useEffect(() => {
    if (!visible || !interactive) return;

    let touchStartY = 0;

    function handleTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0].clientY;
    }

    function handleTouchMove(e: TouchEvent) {
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
      if (deltaY > TOUCH_THRESHOLD) dismiss();
    }

    function handleWheel(e: WheelEvent) {
      // Non-passive so we can block the wheel from also scrolling <main>
      // underneath the overlay. See ADR-0003.
      e.preventDefault();
      dismiss();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'Escape') {
        e.preventDefault();
        dismiss();
      }
    }

    function handleMouseDown(e: MouseEvent) {
      // Middle mouse button (button === 1) opens the browser's native
      // auto-scroll mode (the dual-arrow cursor), which scrolls <main>
      // even when its overflow is locked. Block it before the browser
      // engages auto-scroll, and treat it as a valid dismiss gesture.
      if (e.button === 1) {
        e.preventDefault();
        dismiss();
      }
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [visible, interactive, dismiss]);

  // Text animations wait for `interactive` so they play AFTER the loader exits
  const animationState = shouldReduceMotion
    ? 'reduced'
    : interactive
      ? 'visible'
      : 'hidden';
  const initialTextState = shouldReduceMotion ? 'reduced' : 'hidden';

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {visible && (
        <motion.div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={guestName ? `Welcome, ${guestName}` : 'Welcome'}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background outline-none"
          variants={shouldReduceMotion ? overlayReducedVariants : overlayVariants}
          initial="visible"
          exit="exit"
          onClick={dismiss}
        >
          {/* Greeting — radical negative space, pure typography */}
          <motion.p
            className="font-display text-display-lg font-light text-foreground px-8 text-center max-w-2xl leading-relaxed"
            variants={textVariants}
            initial={initialTextState}
            animate={animationState}
          >
            {guestName ? <>Welcome, <span className="italic text-raspberry">{guestName}</span>.</> : 'Welcome.'}
            <br />
            We&rsquo;re so glad you&rsquo;re here.
          </motion.p>

          {/* Tap-to-begin affordance — ceremonial, not utilitarian */}
          <motion.p
            className="absolute bottom-16 font-display text-body-sm font-light text-foreground/40 tracking-widest uppercase"
            variants={hintVariants}
            initial={initialTextState}
            animate={animationState}
            aria-hidden="true"
          >
            &#9835; tap to begin
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
