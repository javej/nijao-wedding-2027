import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { MonogramLoader } from './MonogramLoader';

describe('MonogramLoader', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // iOS Low Power Mode refuses even muted inline autoplay, and the `autoPlay`
  // attribute reports that failure nowhere — no `error` event fires — so the
  // guest sat on a blank loader until the 9.5s safety timeout.
  it('exits right away when the browser refuses to start the video', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() =>
      Promise.reject(new DOMException('Low Power Mode', 'NotAllowedError')),
    );
    const onComplete = vi.fn();

    render(<MonogramLoader onComplete={onComplete} />);

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1), { timeout: 2000 });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('stays up while the video plays', async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockImplementation(() => Promise.resolve());
    const onComplete = vi.fn();

    render(<MonogramLoader onComplete={onComplete} />);
    await act(async () => {});

    expect(play).toHaveBeenCalled();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
