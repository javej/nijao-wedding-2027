import { useCallback, useEffect, useRef } from 'react';

/**
 * setTimeout that clears any still-pending timers when the component unmounts.
 *
 * The RSVP chat advances its state machine through chained setTimeouts (chip
 * fill → hide → submit). If the component unmounts mid-chain (e.g. the section
 * swaps the chat out for the summary view), a bare setTimeout would still fire
 * and call setState on an unmounted tree. This returns a `schedule(cb, ms)`
 * with the same shape as setTimeout, but every pending timer is cancelled on
 * unmount.
 */
export function useManagedTimeouts(): (
  callback: () => void,
  delayMs: number,
) => void {
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const schedule = useCallback((callback: () => void, delayMs: number) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      callback();
    }, delayMs);
    timers.current.add(id);
  }, []);

  useEffect(() => {
    // Capture the Set (stable for the component's lifetime) for the cleanup.
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  return schedule;
}
