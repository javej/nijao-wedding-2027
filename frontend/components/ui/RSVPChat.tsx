'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Script from 'next/script';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { submitRsvp } from '@/app/actions/rsvp';
import type { RSVPPayload } from '@/app/actions/rsvp';
import { getLocalItem, setLocalItem, removeLocalItem } from '@/lib/localStorage';

// --- Turnstile global type ---

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          appearance?: 'always' | 'execute' | 'interaction-only';
          size?: 'normal' | 'compact' | 'flexible';
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

// --- Types ---

type ChatState =
  | 'idle'
  | 'asked-attendance'
  | 'asked-plusone'
  | 'asked-plusone-name'
  | 'submitting'
  | 'confirmed'
  | 'declined';

interface ChatMessage {
  id: string;
  sender: 'system' | 'guest';
  text: string;
}

export interface RSVPChatProps {
  guestName: string;
  guestSlug: string;
  plusOneEligible: boolean;
  plusOneType: 'linked' | 'open' | null;
  plusOneLinkedGuestName: string | null;
}

// --- Framer Motion Variants (outside component body) ---

const bubbleVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  reduced: { opacity: 1, y: 0, scale: 1 },
};

const chipContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
  reduced: { opacity: 1 },
};

const chipVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
  reduced: { opacity: 1, y: 0 },
};

// --- Natural Language Recognition ---

// Leading-word patterns — high confidence when the response starts with these
const AFFIRMATIVE_START = /^(yes|yeah|yep|yup|oo|of\s*course|sure|absolutely|sige|opo|definitely|ok|okay|let'?s\s*go)/i;
const NEGATIVE_START = /^(no|nah|nope|hindi\s*po|hindi|can'?t|cannot|won'?t|unable)/i;

// Keyword patterns — catch intent expressed mid-sentence ("I will attend", "count me in")
const AFFIRMATIVE_KEYWORDS = /\b(attend|coming|be\s*there|count\s*me\s*in|join|present|pumunta|punta)/i;
const NEGATIVE_KEYWORDS = /\b(can'?t\s*(make|attend|come|go)|won'?t\s*(make|attend|come|go)|not\s*(coming|attending|going)|decline|regret|sorry.{0,10}(can'?t|cannot|won'?t|unable))/i;

function isAffirmative(input: string): boolean {
  const trimmed = input.trim();
  if (NEGATIVE_START.test(trimmed)) return false; // "no" at start takes priority
  return AFFIRMATIVE_START.test(trimmed) || AFFIRMATIVE_KEYWORDS.test(trimmed);
}

function isNegative(input: string): boolean {
  const trimmed = input.trim();
  if (AFFIRMATIVE_START.test(trimmed)) return false; // "yes" at start takes priority
  return NEGATIVE_START.test(trimmed) || NEGATIVE_KEYWORDS.test(trimmed);
}

// --- Component ---

export function RSVPChat({
  guestName,
  guestSlug,
  plusOneEligible,
  plusOneType,
  plusOneLinkedGuestName,
}: RSVPChatProps) {
  const shouldReduceMotion = useReducedMotion();
  const [chatState, setChatState] = useState<ChatState>('asked-attendance');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'opening',
      sender: 'system',
      text: 'Will you be joining us on January 8?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showChips, setShowChips] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const isProcessing = useRef(false);
  const unrecognizedCount = useRef(0);

  // Refs for scroll and focus management
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chipContainerRef = useRef<HTMLDivElement>(null);

  // Turnstile
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileTokenRef = useRef<string | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  // Message ID counter (avoids Date.now() collisions)
  const msgIdCounter = useRef(1);

  // Outer container ref for mobile keyboard offset
  const containerRef = useRef<HTMLDivElement>(null);

  const animInitial = shouldReduceMotion ? 'reduced' : 'hidden';
  const animAnimate = shouldReduceMotion ? 'reduced' : 'visible';

  // Mobile keyboard handling via visualViewport API
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv || !containerRef.current) return;

    function handleResize() {
      if (!containerRef.current) return;
      // When the virtual keyboard opens, visualViewport.height shrinks.
      // Apply a negative translateY to lift the chat above the keyboard.
      const offsetFromBottom = window.innerHeight - vv!.height - vv!.offsetTop;
      if (offsetFromBottom > 0) {
        containerRef.current.style.transform = `translateY(-${offsetFromBottom}px)`;
      } else {
        containerRef.current.style.transform = '';
      }
    }

    vv.addEventListener('resize', handleResize);
    vv.addEventListener('scroll', handleResize);
    return () => {
      vv.removeEventListener('resize', handleResize);
      vv.removeEventListener('scroll', handleResize);
    };
  }, []);

  // Turnstile initialization
  const handleTurnstileLoad = useCallback(() => {
    if (!turnstileContainerRef.current || turnstileWidgetIdRef.current) return;
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey || !window.turnstile) return;

    turnstileWidgetIdRef.current = window.turnstile.render(
      turnstileContainerRef.current,
      {
        sitekey: siteKey,
        callback: (token: string) => {
          turnstileTokenRef.current = token;
        },
        'expired-callback': () => {
          turnstileTokenRef.current = null;
        },
        appearance: 'interaction-only',
        size: 'flexible',
      },
    );
  }, []);

  // Track whether the user has interacted (to avoid scrolling the page on mount)
  const hasInteracted = useRef(false);

  // Auto-scroll chat to bottom when messages change — but only after the first interaction
  useEffect(() => {
    if (!hasInteracted.current) return;
    chatEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  }, [messages, showChips, showInput, shouldReduceMotion]);

  // Focus management: when new chips appear after interaction, focus the first chip button.
  // Skipped on initial mount to prevent the snap-scroll container from jumping to RSVP.
  useEffect(() => {
    if (!hasInteracted.current) return;
    if (!showChips || !chipContainerRef.current) return;
    const timer = setTimeout(() => {
      const firstChip = chipContainerRef.current?.querySelector('button');
      firstChip?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, [showChips, chatState]);

  // --- Message Helpers ---

  const addSystemMessage = useCallback((text: string) => {
    const id = `sys-${msgIdCounter.current++}`;
    setMessages((prev) => [...prev, { id, sender: 'system', text }]);
  }, []);

  const addGuestMessage = useCallback((text: string) => {
    const id = `guest-${msgIdCounter.current++}`;
    setMessages((prev) => [...prev, { id, sender: 'guest', text }]);
  }, []);

  // --- localStorage retry queue for Sheets failures ---

  useEffect(() => {
    function retryQueued() {
      const queued = getLocalItem<RSVPPayload | null>('rsvpQueue', null);
      if (!queued) return;

      submitRsvp(queued)
        .then((result) => {
          if (result.success) {
            removeLocalItem('rsvpQueue');
          }
          // If still failing, leave in queue for next retry
        })
        .catch(() => {
          // Silently ignore — will retry on next reconnect
        });
    }

    // Retry on page load
    retryQueued();

    // Retry when coming back online
    window.addEventListener('online', retryQueued);
    return () => window.removeEventListener('online', retryQueued);
  }, []);

  // --- Submission ---

  const handleSubmit = useCallback(
    async (data: { attending: boolean; plusOneName: string | null; plusOneAttending: boolean }) => {
      setChatState('submitting');
      setShowChips(false);
      setShowInput(false);

      const turnstileToken = turnstileTokenRef.current;

      // Turnstile hasn't loaded yet — let the guest retry rather than sending an empty token
      if (!turnstileToken) {
        setChatState('asked-attendance');
        setShowChips(true);
        addSystemMessage(
          "Still verifying — please try again in a moment.",
        );
        return;
      }

      const payload: RSVPPayload = {
        guestSlug,
        guestName,
        attending: data.attending,
        turnstileToken,
        ...(data.plusOneName && { plusOneName: data.plusOneName }),
        ...(data.plusOneAttending && plusOneType === 'linked' && plusOneLinkedGuestName && {
          linkedGuest: { name: plusOneLinkedGuestName, attending: true },
        }),
      };

      try {
        const result = await submitRsvp(payload);

        if (result.success) {
          if (data.attending) {
            setChatState('confirmed');
            addSystemMessage(
              `Wonderful! We've saved your RSVP, ${guestName}. We can't wait to celebrate with you! 🎉`,
            );
          } else {
            setChatState('declined');
            addSystemMessage(
              'We understand. Thank you for letting us know.',
            );
          }
        } else if (result.error === 'sheets_unavailable') {
          // Queue for retry — guest still sees confirmation/decline
          setLocalItem('rsvpQueue', payload);
          if (data.attending) {
            setChatState('confirmed');
            addSystemMessage(
              `Wonderful! We've saved your RSVP, ${guestName}. We can't wait to celebrate with you! 🎉`,
            );
          } else {
            setChatState('declined');
            addSystemMessage(
              'We understand. Thank you for letting us know.',
            );
          }
        } else {
          // Turnstile or unexpected error — show generic message, reset to allow retry
          setChatState('asked-attendance');
          setShowChips(true);
          addSystemMessage(
            "Something went wrong saving your RSVP. Please try again.",
          );
        }
      } catch {
        // Server Action failed at the network level (e.g., 500 from module load failure)
        setChatState('asked-attendance');
        setShowChips(true);
        addSystemMessage(
          "Something went wrong saving your RSVP. Please try again.",
        );
      }
    },
    [guestSlug, guestName, plusOneType, plusOneLinkedGuestName, addSystemMessage],
  );

  // --- Flow: Advance to plus-one or submission ---

  const advanceAfterAttendance = useCallback(() => {
    if (!plusOneEligible) {
      // No plus-one — go straight to submission
      handleSubmit({ attending: true, plusOneName: null, plusOneAttending: false });
      return;
    }

    if (plusOneType === 'linked' && plusOneLinkedGuestName) {
      setChatState('asked-plusone');
      setShowChips(true);
      addSystemMessage(`Will ${plusOneLinkedGuestName} be joining you?`);
    } else if (plusOneType === 'open') {
      setChatState('asked-plusone');
      setShowChips(true);
      addSystemMessage('Will you be bringing a plus-one?');
    } else {
      // Fallback: no plus-one config
      handleSubmit({ attending: true, plusOneName: null, plusOneAttending: false });
    }
  }, [plusOneEligible, plusOneType, plusOneLinkedGuestName, addSystemMessage, handleSubmit]);

  // --- Chip Handlers ---

  // Helper: select a chip (fill animation) then hide all chips after a short delay
  const selectChipAndHide = useCallback((chipLabel: string, afterHide: () => void) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    hasInteracted.current = true;
    setSelectedChip(chipLabel);
    // Let the fill animation render (150ms), then hide chips and proceed
    setTimeout(() => {
      setShowChips(false);
      setSelectedChip(null);
      afterHide();
      // Re-enable processing after the flow advances
      setTimeout(() => { isProcessing.current = false; }, 200);
    }, 200);
  }, []);

  const handleAttendanceYes = useCallback(() => {
    selectChipAndHide("Yes, I'll be there", () => {
      addGuestMessage("Yes, I'll be there");
      setTimeout(() => advanceAfterAttendance(), 400);
    });
  }, [selectChipAndHide, addGuestMessage, advanceAfterAttendance]);

  const handleAttendanceNo = useCallback(() => {
    selectChipAndHide("Sorry, I can't make it", () => {
      addGuestMessage("Sorry, I can't make it");
      setTimeout(() => {
        handleSubmit({ attending: false, plusOneName: null, plusOneAttending: false });
      }, 400);
    });
  }, [selectChipAndHide, addGuestMessage, handleSubmit]);

  const handlePlusOneYes = useCallback(() => {
    const label = plusOneType === 'linked' ? "Yes, we'll both be there" : 'Yes, bringing someone';
    selectChipAndHide(label, () => {
      if (plusOneType === 'linked') {
        addGuestMessage("Yes, we'll both be there");
        setTimeout(() => {
          handleSubmit({
            attending: true,
            plusOneName: plusOneLinkedGuestName,
            plusOneAttending: true,
          });
        }, 400);
      } else if (plusOneType === 'open') {
        addGuestMessage('Yes, bringing someone');
        setChatState('asked-plusone-name');
        setShowInput(true);
        setTimeout(() => {
          addSystemMessage("Great! What's your plus-one's name?");
          setTimeout(() => inputRef.current?.focus(), 100);
        }, 400);
      }
    });
  }, [selectChipAndHide, plusOneType, plusOneLinkedGuestName, addGuestMessage, addSystemMessage, handleSubmit]);

  const handlePlusOneNo = useCallback(() => {
    selectChipAndHide('Just me', () => {
      addGuestMessage('Just me');
      setTimeout(() => {
        handleSubmit({ attending: true, plusOneName: null, plusOneAttending: false });
      }, 400);
    });
  }, [selectChipAndHide, addGuestMessage, handleSubmit]);

  // --- Free-Text Input Handler ---

  const handleInputSubmit = useCallback(() => {
    const name = inputValue.trim();
    if (!name) return;
    hasInteracted.current = true;

    if (chatState === 'asked-plusone-name') {
      addGuestMessage(name);
      setInputValue('');
      setShowInput(false);

      setTimeout(() => {
        handleSubmit({ attending: true, plusOneName: name, plusOneAttending: true });
      }, 400);
      return;
    }

    // Free-text natural language handling for attendance
    if (chatState === 'asked-attendance') {
      if (isAffirmative(name)) {
        unrecognizedCount.current = 0;
        handleAttendanceYes();
      } else if (isNegative(name)) {
        unrecognizedCount.current = 0;
        handleAttendanceNo();
      } else {
        unrecognizedCount.current += 1;
        addSystemMessage("I didn't quite catch that. You can tap one of the options above.");
        if (unrecognizedCount.current >= 1) {
          setShowInput(false);
        }
      }
      setInputValue('');
      return;
    }

    // Free-text for plus-one question
    if (chatState === 'asked-plusone') {
      if (isAffirmative(name)) {
        unrecognizedCount.current = 0;
        handlePlusOneYes();
      } else if (isNegative(name)) {
        unrecognizedCount.current = 0;
        handlePlusOneNo();
      } else {
        unrecognizedCount.current += 1;
        addSystemMessage("I didn't quite catch that. You can tap one of the options above.");
        if (unrecognizedCount.current >= 1) {
          setShowInput(false);
        }
      }
      setInputValue('');
    }
  }, [
    inputValue,
    chatState,
    addGuestMessage,
    addSystemMessage,
    handleAttendanceYes,
    handleAttendanceNo,
    handlePlusOneYes,
    handlePlusOneNo,
    handleSubmit,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleInputSubmit();
      }
    },
    [handleInputSubmit],
  );

  // --- Chip Configuration ---

  const getChips = (): { label: string; onClick: () => void }[] => {
    if (chatState === 'asked-attendance') {
      return [
        { label: "Yes, I'll be there", onClick: handleAttendanceYes },
        { label: "Sorry, I can't make it", onClick: handleAttendanceNo },
      ];
    }
    if (chatState === 'asked-plusone') {
      if (plusOneType === 'linked') {
        return [
          { label: "Yes, we'll both be there", onClick: handlePlusOneYes },
          { label: 'Just me', onClick: handlePlusOneNo },
        ];
      }
      return [
        { label: 'Yes, bringing someone', onClick: handlePlusOneYes },
        { label: 'Just me', onClick: handlePlusOneNo },
      ];
    }
    return [];
  };

  const chips = getChips();
  const isTerminal = chatState === 'confirmed' || chatState === 'declined';
  // showInput is explicitly false after re-prompt limit; otherwise show for chat states that accept text
  const showFreeTextInput =
    showInput || (unrecognizedCount.current === 0 && (chatState === 'asked-attendance' || chatState === 'asked-plusone'));

  return (
    <div ref={containerRef} className="flex w-full max-w-lg flex-col mx-auto transition-transform duration-150">
      {/* Chat message log */}
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
              layout
              className={cn(
                'max-w-[85%] px-4 py-3 font-body text-body-md',
                msg.sender === 'system'
                  ? 'self-start rounded-[16px_16px_16px_4px] bg-background border border-foreground/10 text-foreground'
                  : 'self-end rounded-[16px_16px_4px_16px] bg-golden-matcha text-text-on-dark',
              )}
            >
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Quick-reply chips */}
      {showChips && chips.length > 0 && !isTerminal && (
        <motion.div
          ref={chipContainerRef}
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
      )}

      {/* Free-text input */}
      {showFreeTextInput && !isTerminal && (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              chatState === 'asked-plusone-name'
                ? "Enter your plus-one's name..."
                : 'Type your response...'
            }
            aria-label={
              chatState === 'asked-plusone-name'
                ? "Plus-one's name"
                : 'RSVP response'
            }
            className={cn(
              'flex-1 min-h-11 rounded-full border border-foreground/20 bg-background px-4 py-2',
              'font-body text-body-md text-foreground placeholder:text-foreground/40',
              'focus-visible:ring-4 focus-visible:ring-golden-matcha/30 focus-visible:outline-1 focus-visible:outline-golden-matcha',
            )}
          />
          <button
            type="button"
            onClick={handleInputSubmit}
            disabled={!inputValue.trim()}
            aria-label="Send"
            className={cn(
              'min-h-11 min-w-11 rounded-full bg-golden-matcha text-text-on-dark',
              'flex items-center justify-center',
              'transition-colors hover:bg-golden-matcha/90',
              'focus-visible:ring-4 focus-visible:ring-golden-matcha/30 focus-visible:outline-1 focus-visible:outline-golden-matcha',
              'disabled:opacity-40 disabled:pointer-events-none',
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5"
              aria-hidden="true"
            >
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95l15.5-6.25a.75.75 0 0 0 0-1.394l-15.5-6.25Z" />
            </svg>
          </button>
        </div>
      )}

      {/* Submitting state */}
      {chatState === 'submitting' && (
        <motion.div
          variants={bubbleVariants}
          initial={animInitial}
          animate={animAnimate}
          className="self-start text-foreground/50 font-body text-body-sm py-2"
          aria-live="polite"
        >
          Saving your RSVP…
        </motion.div>
      )}

      {/* Cloudflare Turnstile — invisible/interaction-only */}
      <div ref={turnstileContainerRef} aria-hidden="true" />
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
        strategy="lazyOnload"
        onReady={handleTurnstileLoad}
      />
    </div>
  );
}
