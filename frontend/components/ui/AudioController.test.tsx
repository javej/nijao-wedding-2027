import { createRef } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AudioController, type AudioControllerHandle } from './AudioController';

function blocked() {
  return Promise.reject(new DOMException('play() needs a user gesture', 'NotAllowedError'));
}

function renderController() {
  const ref = createRef<AudioControllerHandle>();
  render(<AudioController ref={ref} visible />);
  return ref;
}

describe('AudioController', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // A swipe or wheel dismissal of the welcome screen is not a user activation,
  // so iOS Safari / Chrome Android / desktop Safari + Firefox reject play().
  it('retries playback on the next tap when the first start was blocked', async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockImplementationOnce(blocked)
      .mockImplementation(() => Promise.resolve());
    const ref = renderController();

    await act(async () => {
      ref.current?.play();
    });
    expect(play).toHaveBeenCalledTimes(1);

    fireEvent.click(document.body);

    await waitFor(() => expect(play).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Mute music' })).toBeInTheDocument(),
    );
  });

  it('stops listening for taps once music is playing', async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockImplementationOnce(blocked)
      .mockImplementation(() => Promise.resolve());
    const ref = renderController();

    await act(async () => {
      ref.current?.play();
    });
    fireEvent.click(document.body);
    await waitFor(() => expect(play).toHaveBeenCalledTimes(2));

    fireEvent.click(document.body);
    fireEvent.keyDown(document.body, { key: 'a' });

    expect(play).toHaveBeenCalledTimes(2);
  });

  it('keeps retrying while gestures are still refused', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(blocked);
    const ref = renderController();

    await act(async () => {
      ref.current?.play();
    });
    await act(async () => {
      fireEvent.click(document.body);
    });
    await act(async () => {
      fireEvent.click(document.body);
    });

    expect(play).toHaveBeenCalledTimes(3);
  });

  // The toggle used to read "Mute music" with a speaker icon while the page
  // was silent, because it only tracked mute — not whether anything played.
  it('offers to play music, not mute it, while nothing is playing', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(blocked);
    const ref = renderController();

    await act(async () => {
      ref.current?.play();
    });

    expect(screen.getByRole('button', { name: 'Play music' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mute music' })).not.toBeInTheDocument();
  });

  it('labels the toggle "Mute music" once playback starts', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    const ref = renderController();

    await act(async () => {
      ref.current?.play();
    });

    expect(screen.getByRole('button', { name: 'Mute music' })).toBeInTheDocument();
  });
});
