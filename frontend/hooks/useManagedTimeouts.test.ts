import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useManagedTimeouts } from './useManagedTimeouts';

afterEach(() => {
  vi.useRealTimers();
});

describe('useManagedTimeouts', () => {
  it('runs a scheduled callback after its delay', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useManagedTimeouts());
    const cb = vi.fn();

    result.current(cb, 200);
    expect(cb).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('cancels still-pending callbacks on unmount (no setState after unmount)', () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useManagedTimeouts());
    const cb = vi.fn();

    result.current(cb, 400);
    unmount();
    vi.advanceTimersByTime(1000);

    expect(cb).not.toHaveBeenCalled();
  });

  it('runs independent timers and only cancels the ones still pending', () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useManagedTimeouts());
    const early = vi.fn();
    const late = vi.fn();

    result.current(early, 100);
    result.current(late, 500);
    vi.advanceTimersByTime(100); // early fires, late still pending
    unmount();
    vi.advanceTimersByTime(1000); // late was cancelled

    expect(early).toHaveBeenCalledTimes(1);
    expect(late).not.toHaveBeenCalled();
  });
});
