import { useEffect } from 'react';
import { retryRsvpAudit, type RsvpAuditPayload } from '@/app/actions/rsvp';
import { getLocalItem, removeLocalItem } from '@/lib/localStorage';

/**
 * Drains the localStorage RSVP audit-retry queue.
 *
 * When the Sheets append fails during submission, the server returns the
 * audit-only payload and the client parks it under `rsvpQueue`. This hook
 * replays it on mount and whenever connectivity returns. The replay re-appends
 * the row(s) ONLY — it never re-writes Sanity or re-sends the confirmation
 * email (those already happened on the original submit). See `retryRsvpAudit`.
 */
export function useRsvpRetryQueue(): void {
  useEffect(() => {
    function retryQueued() {
      const queued = getLocalItem<RsvpAuditPayload | null>('rsvpQueue', null);
      if (!queued) return;

      retryRsvpAudit(queued)
        .then((result) => {
          if (result.success) {
            removeLocalItem('rsvpQueue');
          }
          // If still failing, leave in queue for next retry.
        })
        .catch(() => {
          // Silently ignore — will retry on next reconnect.
        });
    }

    retryQueued();
    window.addEventListener('online', retryQueued);
    return () => window.removeEventListener('online', retryQueued);
  }, []);
}
