'use client';

import { useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { submitGuestContact } from '@/app/actions/rsvp';
import {
  isValidEmail,
  normalizeEmail,
  normalizePhMobile,
} from '@/lib/contact';

interface RSVPContactNudgeProps {
  guestSlug: string;
  /** Show the email field — the guest has no email on file. */
  needsEmail: boolean;
  /** Show the mobile field — the guest has no mobile on file. */
  needsMobile: boolean;
  /** Fired once contact is saved so the parent can hide the nudge. */
  onSaved: () => void;
  /** Fired when the guest dismisses without saving (session-only). */
  onDismiss: () => void;
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

/**
 * Contact backfill for an attending guest who landed on the summary card with
 * no contact on file (ADR-0006) — notably a linked partner answered-for by
 * their submitter, who never sees the chat. Writes contact only; never a re-RSVP.
 */
export function RSVPContactNudge({
  guestSlug,
  needsEmail,
  needsMobile,
  onSaved,
  onDismiss,
  className,
}: RSVPContactNudgeProps) {
  const shouldReduceMotion = useReducedMotion();
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    const emailRaw = email.trim();
    const mobileRaw = mobile.trim();

    if (!emailRaw && !mobileRaw) {
      setError('Add an email or a mobile number, or tap Not now.');
      return;
    }
    if (needsEmail && emailRaw && !isValidEmail(emailRaw)) {
      setError("That doesn't look like an email. Please check it.");
      return;
    }
    const normalizedMobile = mobileRaw ? normalizePhMobile(mobileRaw) : null;
    if (needsMobile && mobileRaw && !normalizedMobile) {
      setError("That doesn't look like a PH mobile. Try 0917 123 4567.");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const result = await submitGuestContact({
        guestSlug,
        ...(emailRaw && { guestEmail: normalizeEmail(emailRaw) }),
        ...(normalizedMobile && { guestMobile: normalizedMobile }),
      });
      if (result.success) {
        onSaved();
        return;
      }
      setError('Something went wrong saving that. Please try again.');
    } catch {
      setError('Something went wrong saving that. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [email, mobile, needsEmail, needsMobile, guestSlug, onSaved]);

  const inputClass = cn(
    'w-full min-h-11 rounded-full border border-foreground/20 bg-background px-4 py-2',
    'font-body text-body-md text-foreground placeholder:text-foreground/40',
    'focus-visible:ring-4 focus-visible:ring-golden-matcha/30 focus-visible:outline-1 focus-visible:outline-golden-matcha',
  );

  return (
    <motion.div
      variants={cardVariants}
      initial={shouldReduceMotion ? 'reduced' : 'hidden'}
      animate={shouldReduceMotion ? 'reduced' : 'visible'}
      className={cn(
        'flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-foreground/10 bg-background/60 p-5',
        className,
      )}
    >
      <p className="font-body text-body-sm text-foreground/70 text-center">
        We don&apos;t have your contact yet — add it so we can send your
        confirmation and day-of updates.
      </p>

      {needsEmail && (
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Email address"
          className={inputClass}
        />
      )}

      {needsMobile && (
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="0917 123 4567"
          aria-label="Mobile number"
          className={inputClass}
        />
      )}

      {error && (
        <p className="font-body text-body-sm text-raspberry text-center" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center justify-center gap-3 pt-1">
        <button
          type="button"
          onClick={onDismiss}
          disabled={saving}
          className={cn(
            'min-h-11 rounded-full px-4 py-2 font-body text-body-sm text-foreground/60',
            'transition-colors hover:bg-foreground/5 disabled:opacity-40',
            'focus-visible:ring-4 focus-visible:ring-golden-matcha/30 focus-visible:outline-1 focus-visible:outline-golden-matcha',
          )}
        >
          Not now
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={cn(
            'min-h-11 rounded-full bg-golden-matcha px-6 py-2 font-body text-body-md text-text-on-dark',
            'transition-colors hover:bg-golden-matcha/90 disabled:opacity-40 disabled:pointer-events-none',
            'focus-visible:ring-4 focus-visible:ring-golden-matcha/30 focus-visible:outline-1 focus-visible:outline-golden-matcha',
          )}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </motion.div>
  );
}
