'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
// import Script from 'next/script';
import { motion, useReducedMotion } from 'motion/react';
import { submitRsvp } from '@/app/actions/rsvp';
import type { RSVPPayload } from '@/app/actions/rsvp';
import { setLocalItem } from '@/lib/localStorage';
import { useVisualViewportOffset } from '@/hooks/useVisualViewportOffset';
import { useRsvpRetryQueue } from '@/hooks/useRsvpRetryQueue';
import { isValidEmail, normalizeEmail, normalizePhMobile } from '@/lib/contact';
import { isAffirmative, isNegative } from '@/lib/attendance-parser';
import { ChatMessageLog } from '@/components/ui/rsvp-chat/ChatMessageLog';
import { ChatChips } from '@/components/ui/rsvp-chat/ChatChips';
import { ChatInputBar } from '@/components/ui/rsvp-chat/ChatInputBar';
import { bubbleVariants } from '@/components/ui/rsvp-chat/variants';
import type { ChatMessage, Chip } from '@/components/ui/rsvp-chat/types';

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
  | 'asked-email'
  | 'asked-phone'
  | 'submitting'
  | 'confirmed'
  | 'declined'
  | 'closed';

export interface RSVPSubmissionResult {
  attending: boolean;
  plusOneName: string | null;
  plusOneAttending: boolean;
}

export interface RSVPChatProps {
  guestName: string;
  guestSlug: string;
  plusOneEligible: boolean;
  plusOneType: 'linked' | 'open' | null;
  plusOneLinkedGuestName: string | null;
  plusOneLinkedGuestSlug: string | null;
  /** Ask for the guest's email during the flow (attending only) when absent. */
  needsEmail: boolean;
  /** Ask for the guest's mobile during the flow (attending only) when absent. */
  needsMobile: boolean;
  /** Called when the final confirmation moment fires (petal burst, haptic) */
  onConfirm?: () => void;
  /** Called once a submission has been accepted by the server (success). */
  onComplete?: (result: RSVPSubmissionResult) => void;
}

// --- Confirmation Constants ---

const CONFIRMATION_MESSAGE = "We've been waiting for you.";
const CLOSED_MESSAGE =
  "RSVPs have closed on November 8. If you'd still like to reach us, please contact Jave & Nianne directly.";

// --- Component ---

export function RSVPChat({
  guestName,
  guestSlug,
  plusOneEligible,
  plusOneType,
  plusOneLinkedGuestName,
  plusOneLinkedGuestSlug,
  needsEmail,
  needsMobile,
  onConfirm,
  onComplete,
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

  // Turnstile — temporarily disabled
  // const turnstileContainerRef = useRef<HTMLDivElement>(null);
  // const turnstileTokenRef = useRef<string | null>(null);
  // const turnstileWidgetIdRef = useRef<string | null>(null);

  // Message ID counter (avoids Date.now() collisions)
  const msgIdCounter = useRef(1);

  // Contact collected mid-flow (attending only). Held in refs so the final
  // handleSubmit reads them without an extra render/state-timing hop. The
  // pending attendance answer parks here while we ask for contact.
  const collectedEmailRef = useRef<string | null>(null);
  const collectedMobileRef = useRef<string | null>(null);
  const pendingSubmissionRef = useRef<{
    attending: boolean;
    plusOneName: string | null;
    plusOneAttending: boolean;
  } | null>(null);

  // Outer container ref for mobile keyboard offset
  const containerRef = useRef<HTMLDivElement>(null);

  // Tracks the "We've been waiting for you." closing bubble so it only fires once
  const finalBubbleShown = useRef(false);

  const animInitial = shouldReduceMotion ? 'reduced' : 'hidden';
  const animAnimate = shouldReduceMotion ? 'reduced' : 'visible';

  // Mobile keyboard handling via the visualViewport API.
  useVisualViewportOffset(containerRef);

  // Turnstile initialization — temporarily disabled
  // const handleTurnstileLoad = useCallback(() => { /* ... */ }, []);

  // Track whether the user has interacted (to avoid scrolling the page on mount)
  const hasInteracted = useRef(false);

  // Auto-scroll chat to bottom when messages change — but only after the first interaction
  useEffect(() => {
    if (!hasInteracted.current) return;
    chatEndRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  }, [messages, showChips, showInput, shouldReduceMotion]);

  // Focus management: when new chips appear after interaction, focus the first chip button.
  // Skipped on initial mount so the page doesn't auto-scroll to RSVP before
  // the guest has chosen to engage with the chat.
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

  // localStorage retry queue for Sheets failures (drains on mount + reconnect).
  useRsvpRetryQueue();

  // --- Confirmation closing bubble (fresh confirmation only) ---

  useEffect(() => {
    if (chatState !== 'confirmed' || finalBubbleShown.current) return;
    finalBubbleShown.current = true;

    const timer = setTimeout(() => {
      addSystemMessage(CONFIRMATION_MESSAGE);
      onConfirm?.();
      // Haptic feedback — graceful degradation on iOS
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [chatState, addSystemMessage, onConfirm]);

  // --- Submission ---

  const handleSubmit = useCallback(
    async (data: { attending: boolean; plusOneName: string | null; plusOneAttending: boolean }) => {
      setChatState('submitting');
      setShowChips(false);
      setShowInput(false);

      // Turnstile temporarily disabled — pass empty token; server-side verification is also bypassed.
      const turnstileToken = '';

      const payload: RSVPPayload = {
        guestSlug,
        guestName,
        attending: data.attending,
        turnstileToken,
        plusOneType,
        plusOneAttending: data.plusOneAttending,
        ...(data.plusOneName && { plusOneName: data.plusOneName }),
        ...(plusOneType === 'linked' && plusOneLinkedGuestSlug && {
          linkedPartnerSlug: plusOneLinkedGuestSlug,
        }),
        ...(data.plusOneAttending && plusOneType === 'linked' && plusOneLinkedGuestName && {
          linkedGuest: {
            name: plusOneLinkedGuestName,
            slug: plusOneLinkedGuestSlug ?? undefined,
            attending: true,
          },
        }),
        ...(collectedEmailRef.current && { guestEmail: collectedEmailRef.current }),
        ...(collectedMobileRef.current && { guestMobile: collectedMobileRef.current }),
      };

      const completion: RSVPSubmissionResult = {
        attending: data.attending,
        plusOneName: data.plusOneName,
        plusOneAttending: data.plusOneAttending,
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
            addSystemMessage('We understand. Thank you for letting us know.');
          }
          onComplete?.(completion);
        } else if (result.error === 'rsvp_closed') {
          setChatState('closed');
          addSystemMessage(CLOSED_MESSAGE);
        } else if (result.error === 'sheets_unavailable') {
          // Sanity already wrote — queue the audit-only payload (built server
          // side, partner row already reconciled) for a Sheets-only retry.
          if (result.retryAudit) {
            setLocalItem('rsvpQueue', result.retryAudit);
          }
          if (data.attending) {
            setChatState('confirmed');
            addSystemMessage(
              `Wonderful! We've saved your RSVP, ${guestName}. We can't wait to celebrate with you! 🎉`,
            );
          } else {
            setChatState('declined');
            addSystemMessage('We understand. Thank you for letting us know.');
          }
          onComplete?.(completion);
        } else {
          // sanity_unavailable, turnstile, or unexpected — allow retry
          setChatState('asked-attendance');
          setShowChips(true);
          addSystemMessage(
            'Something went wrong saving your RSVP. Please try again.',
          );
        }
      } catch {
        // Server Action failed at the network level
        setChatState('asked-attendance');
        setShowChips(true);
        addSystemMessage(
          'Something went wrong saving your RSVP. Please try again.',
        );
      }
    },
    [
      guestSlug,
      guestName,
      plusOneType,
      plusOneLinkedGuestName,
      plusOneLinkedGuestSlug,
      addSystemMessage,
      onComplete,
    ],
  );

  // --- Flow: Contact collection (attending only, when missing) ---

  const finishContact = useCallback(() => {
    const data = pendingSubmissionRef.current;
    if (!data) return;
    pendingSubmissionRef.current = null;
    handleSubmit(data);
  }, [handleSubmit]);

  const askPhone = useCallback(() => {
    setChatState('asked-phone');
    setShowInput(true);
    addSystemMessage(
      'And a mobile number for day-of updates? Type it, or tap Skip.',
    );
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [addSystemMessage]);

  const advanceFromEmail = useCallback(() => {
    if (needsMobile) {
      askPhone();
    } else {
      finishContact();
    }
  }, [needsMobile, askPhone, finishContact]);

  const askEmail = useCallback(() => {
    setChatState('asked-email');
    setShowInput(true);
    addSystemMessage(
      'Want your confirmation emailed? Drop your email, or tap Skip.',
    );
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [addSystemMessage]);

  const beginContactOrSubmit = useCallback(
    (data: { attending: boolean; plusOneName: string | null; plusOneAttending: boolean }) => {
      // Decliners and guests who already have contact on file submit straight away.
      if (!data.attending || (!needsEmail && !needsMobile)) {
        handleSubmit(data);
        return;
      }
      pendingSubmissionRef.current = data;
      if (needsEmail) {
        askEmail();
      } else {
        askPhone();
      }
    },
    [needsEmail, needsMobile, handleSubmit, askEmail, askPhone],
  );

  const handleContactSkip = useCallback(() => {
    if (chatState === 'asked-email') {
      addGuestMessage('Skip');
      advanceFromEmail();
    } else if (chatState === 'asked-phone') {
      addGuestMessage('Skip');
      finishContact();
    }
  }, [chatState, addGuestMessage, advanceFromEmail, finishContact]);

  // --- Flow: Advance to plus-one or submission ---

  const advanceAfterAttendance = useCallback(() => {
    if (!plusOneEligible) {
      // No plus-one — go to contact collection or straight to submission
      beginContactOrSubmit({ attending: true, plusOneName: null, plusOneAttending: false });
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
      beginContactOrSubmit({ attending: true, plusOneName: null, plusOneAttending: false });
    }
  }, [plusOneEligible, plusOneType, plusOneLinkedGuestName, addSystemMessage, beginContactOrSubmit]);

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
          beginContactOrSubmit({
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
  }, [selectChipAndHide, plusOneType, plusOneLinkedGuestName, addGuestMessage, addSystemMessage, beginContactOrSubmit]);

  const handlePlusOneNo = useCallback(() => {
    selectChipAndHide('Just me', () => {
      addGuestMessage('Just me');
      setTimeout(() => {
        beginContactOrSubmit({ attending: true, plusOneName: null, plusOneAttending: false });
      }, 400);
    });
  }, [selectChipAndHide, addGuestMessage, beginContactOrSubmit]);

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
        beginContactOrSubmit({ attending: true, plusOneName: name, plusOneAttending: true });
      }, 400);
      return;
    }

    if (chatState === 'asked-email') {
      if (!isValidEmail(name)) {
        addSystemMessage("That doesn't look like an email. Check it, or tap Skip.");
        setInputValue('');
        return;
      }
      collectedEmailRef.current = normalizeEmail(name);
      addGuestMessage(name);
      setInputValue('');
      setShowInput(false);
      advanceFromEmail();
      return;
    }

    if (chatState === 'asked-phone') {
      const mobile = normalizePhMobile(name);
      if (!mobile) {
        addSystemMessage(
          "That doesn't look like a PH mobile. Try 0917 123 4567, or tap Skip.",
        );
        setInputValue('');
        return;
      }
      collectedMobileRef.current = mobile;
      addGuestMessage(name);
      setInputValue('');
      setShowInput(false);
      finishContact();
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
        // Allow one retry; only fall back to chips-only after a second miss.
        if (unrecognizedCount.current >= 2) {
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
        // Allow one retry; only fall back to chips-only after a second miss.
        if (unrecognizedCount.current >= 2) {
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
    beginContactOrSubmit,
    advanceFromEmail,
    finishContact,
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

  const getChips = (): Chip[] => {
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
  const isTerminal =
    chatState === 'confirmed' ||
    chatState === 'declined' ||
    chatState === 'closed';
  // showInput is explicitly false only after the second miss; until then keep
  // the free-text box available for the chat states that accept typed answers.
  const showFreeTextInput =
    showInput || (unrecognizedCount.current < 2 && (chatState === 'asked-attendance' || chatState === 'asked-plusone'));

  const isContactStep = chatState === 'asked-email' || chatState === 'asked-phone';
  const inputType =
    chatState === 'asked-email' ? 'email' : chatState === 'asked-phone' ? 'tel' : 'text';
  const inputPlaceholder =
    chatState === 'asked-plusone-name'
      ? "Enter your plus-one's name..."
      : chatState === 'asked-email'
        ? 'you@example.com'
        : chatState === 'asked-phone'
          ? '0917 123 4567'
          : 'Type your response...';
  const inputAriaLabel =
    chatState === 'asked-plusone-name'
      ? "Plus-one's name"
      : chatState === 'asked-email'
        ? 'Email address'
        : chatState === 'asked-phone'
          ? 'Mobile number'
          : 'RSVP response';

  return (
    <div ref={containerRef} className="relative flex w-full max-w-lg flex-col mx-auto transition-transform duration-150">
      <ChatMessageLog
        messages={messages}
        animInitial={animInitial}
        animAnimate={animAnimate}
        shouldReduceMotion={Boolean(shouldReduceMotion)}
        endRef={chatEndRef}
      />

      {showChips && !isTerminal && (
        <ChatChips
          chips={chips}
          selectedChip={selectedChip}
          animInitial={animInitial}
          animAnimate={animAnimate}
          containerRef={chipContainerRef}
        />
      )}

      {showFreeTextInput && !isTerminal && (
        <ChatInputBar
          inputRef={inputRef}
          value={inputValue}
          onChange={setInputValue}
          onKeyDown={handleKeyDown}
          onSubmit={handleInputSubmit}
          inputType={inputType}
          inputMode={chatState === 'asked-phone' ? 'tel' : undefined}
          autoComplete={
            chatState === 'asked-email'
              ? 'email'
              : chatState === 'asked-phone'
                ? 'tel'
                : undefined
          }
          placeholder={inputPlaceholder}
          ariaLabel={inputAriaLabel}
          showSkip={isContactStep}
          onSkip={handleContactSkip}
        />
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

      {/* Cloudflare Turnstile — temporarily disabled */}
      {/* <div ref={turnstileContainerRef} aria-hidden="true" />
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
        strategy="lazyOnload"
        onReady={handleTurnstileLoad}
      /> */}
    </div>
  );
}
