'use client';

import { useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { submitGuestParking, type RsvpParkingAnswer } from '@/app/actions/rsvp';
import { normalizePlate } from '@/lib/plate';
import { deriveParkingLine, parkingNeedsPlate } from '@/lib/rsvp-view-state';
import type { GuestParking } from '@/sanity/queries/guests';

interface RSVPParkingCardProps {
  guestSlug: string;
  /** Current parking answer on the guest doc; null when never asked. */
  parking: GuestParking | null;
  /** Fired once a new answer is saved so the parent can update its copy. */
  onSaved: (answer: RsvpParkingAnswer) => void;
  className?: string;
}

const formVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  reduced: { opacity: 1, y: 0 },
};

/**
 * Parking line on the RSVP summary card (ADR-0008), for attending guests. The
 * line itself is always visible, so a guest who answered "Not sure yet" in the
 * chat can see the way back: "Add it" opens a plate-only form that writes the
 * parking answer without re-running the RSVP.
 */
export function RSVPParkingCard({
  guestSlug,
  parking,
  onSaved,
  className,
}: RSVPParkingCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [plate, setPlate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const line = deriveParkingLine('attending', parking);
  const needsPlate = parkingNeedsPlate('attending', parking);

  const save = useCallback(
    async (answer: RsvpParkingAnswer) => {
      setError(null);
      setSaving(true);
      try {
        const result = await submitGuestParking({ guestSlug, parking: answer });
        if (result.success) {
          onSaved(answer);
          setOpen(false);
          setPlate('');
          return;
        }
        setError('Something went wrong saving that. Please try again.');
      } catch {
        setError('Something went wrong saving that. Please try again.');
      } finally {
        setSaving(false);
      }
    },
    [guestSlug, onSaved],
  );

  const handleSave = useCallback(() => {
    const normalized = normalizePlate(plate);
    if (!normalized) {
      setError("That doesn't look like a plate number. Try ABC 1234.");
      return;
    }
    void save({ status: 'plate', plate: normalized });
  }, [plate, save]);

  const handleNotDriving = useCallback(() => {
    void save({ status: 'none' });
  }, [save]);

  const buttonBase = cn(
    'min-h-11 rounded-full px-4 py-2 font-body text-body-sm transition-colors',
    'focus-visible:ring-4 focus-visible:ring-golden-matcha/30 focus-visible:outline-1 focus-visible:outline-golden-matcha',
    'disabled:opacity-40 disabled:pointer-events-none',
  );

  return (
    <div className={cn('flex w-full max-w-sm flex-col items-center gap-3', className)}>
      <p className="font-body text-body-md text-foreground/70 text-center">
        <span>{line}</span>
        {!open && (
          <>
            {' · '}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={cn(
                'text-raspberry underline underline-offset-4',
                'hover:text-raspberry/80 focus-visible:outline-1 focus-visible:outline-raspberry',
                'focus-visible:ring-4 focus-visible:ring-raspberry/30',
              )}
            >
              {needsPlate ? 'Add it' : 'Update'}
            </button>
          </>
        )}
      </p>

      {open && (
        <motion.div
          variants={formVariants}
          initial={shouldReduceMotion ? 'reduced' : 'hidden'}
          animate={shouldReduceMotion ? 'reduced' : 'visible'}
          className="flex w-full flex-col gap-3 rounded-2xl border border-foreground/10 bg-background/60 p-5"
        >
          <input
            type="text"
            autoCapitalize="characters"
            autoComplete="off"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder="ABC 1234"
            aria-label="Car plate number"
            className={cn(
              'w-full min-h-11 rounded-full border border-foreground/20 bg-background px-4 py-2',
              'font-body text-body-md text-foreground placeholder:text-foreground/40 uppercase',
              'focus-visible:ring-4 focus-visible:ring-golden-matcha/30 focus-visible:outline-1 focus-visible:outline-golden-matcha',
            )}
          />

          {error && (
            <p className="font-body text-body-sm text-raspberry text-center" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              disabled={saving}
              className={cn(buttonBase, 'text-foreground/60 hover:bg-foreground/5')}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleNotDriving}
              disabled={saving}
              className={cn(buttonBase, 'text-foreground/60 hover:bg-foreground/5')}
            >
              Not driving
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={cn(
                buttonBase,
                'bg-golden-matcha px-6 text-body-md text-text-on-light hover:bg-golden-matcha/90',
              )}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
