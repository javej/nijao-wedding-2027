'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { WEDDING_START_MS } from '@/lib/wedding-event';

// Hardcoded copy — set once for a keepsake, alongside the hardcoded date
// (see ADR-0005). Changing wording is a deploy, by design.
const COUNTDOWN_HEADLINE = 'Until we say I do';
const WEDDING_DATE_LABEL = 'January 8, 2027';
const MARRIED_HEADLINE = "We're married";
const MARRIED_SUBLINE = 'Thank you for celebrating with us 💚';

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Break the remaining milliseconds down into whole days/hours/minutes/seconds.
 * Pure and clock-free (now is injected) so the math is trivially verifiable.
 * Clamps at zero — never returns negatives once the instant has passed.
 */
function timePartsUntil(targetMs: number, nowMs: number): TimeParts {
  const totalSeconds = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}

const UNITS = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hrs' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Sec' },
] as const;

/** A single labelled unit. Days isn't zero-padded (it can be 3 digits). */
function UnitCell({
  display,
  label,
  animate,
}: {
  display: string;
  label: string;
  animate: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[1.1em] overflow-hidden font-display tabular-nums leading-none text-text-on-light text-display-xl">
        {animate ? (
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={display}
              initial={{ y: '55%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-55%', opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
              className="block"
            >
              {display}
            </motion.span>
          </AnimatePresence>
        ) : (
          <span className="block">{display}</span>
        )}
      </div>
      <span className="mt-2 font-body text-body-sm uppercase tracking-widest text-text-on-light/70">
        {label}
      </span>
    </div>
  );
}

/**
 * Countdown — the final scroll chapter. Before the ceremony instant it is a
 * live four-unit countdown; the moment that instant passes it becomes a
 * permanent "married" celebration state.
 *
 * Client component: it renders neutral placeholders during SSR / first paint
 * and fills the real numbers on mount, so the live seconds digit can never
 * cause a hydration mismatch. Counts to an absolute instant, so the remaining
 * time is identical for every guest regardless of timezone.
 *
 * Must be wrapped in <ChapterSection> for bg tone and palette accent.
 */
export function CountdownSection() {
  const prefersReducedMotion = useReducedMotion();
  // null until mounted in the browser — the placeholder gate.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(id);
  }, []);

  const mounted = now !== null;
  const isMarried = mounted && now >= WEDDING_START_MS;
  const parts = mounted && !isMarried ? timePartsUntil(WEDDING_START_MS, now) : null;
  const animate = !prefersReducedMotion && !isMarried;

  return (
    <div className="flex flex-col items-center justify-center w-full px-(--chapter-padding-x) py-(--chapter-padding-y) text-center">
      <h2 className="sr-only">Countdown to the wedding</h2>

      {isMarried ? (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4"
        >
          <p className="font-display italic font-normal text-display-xl text-text-on-light tracking-wide">
            {MARRIED_HEADLINE}
          </p>
          <p className="font-body text-body-lg text-text-on-light/80 max-w-md">
            {MARRIED_SUBLINE}
          </p>
        </motion.div>
      ) : (
        <>
          <p className="font-display italic font-normal text-display-md text-text-on-light tracking-wide mb-10 md:mb-12">
            {COUNTDOWN_HEADLINE}
          </p>

          {/* Visual clock — hidden from assistive tech (the sr-only line below
              carries an un-spammy summary instead of a per-second live region). */}
          <div className="flex items-start gap-6 sm:gap-10 md:gap-14" aria-hidden="true">
            {UNITS.map(({ key, label }) => (
              <UnitCell
                key={key}
                label={label}
                animate={animate}
                display={parts ? String(parts[key]).padStart(key === 'days' ? 1 : 2, '0') : '——'}
              />
            ))}
          </div>

          <p className="mt-10 md:mt-12 font-body text-body-md uppercase tracking-[0.25em] text-text-on-light/70">
            {WEDDING_DATE_LABEL}
          </p>

          {parts && (
            <p className="sr-only">
              {parts.days} days, {parts.hours} hours, {parts.minutes} minutes
              until the wedding on {WEDDING_DATE_LABEL}.
            </p>
          )}
        </>
      )}
    </div>
  );
}
