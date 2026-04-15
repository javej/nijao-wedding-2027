import { useCallback, useEffect, useState } from 'react';
import { getLocalItem, setLocalItem } from '@/lib/localStorage';

const STORAGE_KEY = 'firstScrollComplete';

/**
 * Tracks whether the guest has scrolled to the RSVP section at least once.
 * SSR-safe: reads localStorage only after hydration via useEffect.
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
