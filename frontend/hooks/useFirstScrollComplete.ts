import { useCallback, useEffect, useState } from 'react';
import { getLocalItem, setLocalItem } from '@/lib/localStorage';

const STORAGE_KEY = 'firstScrollComplete';

/**
 * Tracks whether the guest has scrolled to the RSVP section at least once.
 * Used to gate both the Hero ghost-pill nav and the floating compass FAB —
 * the invitation reads as a story on first visit, and the wayfinding aids
 * only surface on subsequent visits once the guest has been all the way
 * through. SSR-safe: reads localStorage only after hydration via useEffect.
 */
export function useFirstScrollComplete() {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setIsComplete(getLocalItem<boolean>(STORAGE_KEY, false));
  }, []);

  const markComplete = useCallback(() => {
    setLocalItem(STORAGE_KEY, true);
    setIsComplete(true);
  }, []);

  return { isComplete, markComplete };
}
