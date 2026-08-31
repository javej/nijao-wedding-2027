import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ChapterPhotoCrossfade, type CrossfadePhoto } from './ChapterPhotoCrossfade';

const SLOT_MS = 4500;

/** Drives the IntersectionObserver callback so tests can open/close a chapter. */
let notify: ((ratio: number) => void) | null = null;

beforeEach(() => {
  vi.useFakeTimers();
  notify = null;
  class MockIO {
    constructor(private cb: IntersectionObserverCallback) {
      notify = (ratio: number) =>
        this.cb(
          [{ intersectionRatio: ratio, isIntersecting: ratio > 0 } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
    }
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = '';
    thresholds = [];
  }
  vi.stubGlobal('IntersectionObserver', MockIO);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const photos: CrossfadePhoto[] = [
  { src: '/a.jpg', alt: 'photo one' },
  { src: '/b.jpg', alt: 'photo two' },
  { src: '/c.jpg', alt: 'photo three' },
];

/** The visible photo is the only one not aria-hidden. */
function visiblePhotoAlt(): string | undefined {
  return photos
    .map((p) => screen.getByAltText(p.alt))
    .find((img) => img.parentElement?.getAttribute('aria-hidden') === 'false')
    ?.getAttribute('alt') ?? undefined;
}

function open(ratio = 1) {
  act(() => { notify?.(ratio); });
}

function advance(ms: number) {
  act(() => { vi.advanceTimersByTime(ms); });
}

describe('ChapterPhotoCrossfade', () => {
  it('opens on the first photo', () => {
    render(<ChapterPhotoCrossfade photos={photos} />);
    open();
    expect(visiblePhotoAlt()).toBe('photo one');
  });

  it('holds the first photo for a full slot before advancing', () => {
    render(<ChapterPhotoCrossfade photos={photos} />);
    open();

    advance(SLOT_MS - 100);
    expect(visiblePhotoAlt()).toBe('photo one');

    advance(200);
    expect(visiblePhotoAlt()).toBe('photo two');
  });

  it('does not advance while the chapter is closed', () => {
    render(<ChapterPhotoCrossfade photos={photos} />);
    open();
    advance(SLOT_MS + 100);
    expect(visiblePhotoAlt()).toBe('photo two');

    open(0.1); // scrolled away
    advance(SLOT_MS * 5);
    expect(visiblePhotoAlt()).toBe('photo two');
  });

  it('restarts from the first photo when the chapter is reopened', () => {
    render(<ChapterPhotoCrossfade photos={photos} />);
    open();
    advance(SLOT_MS * 2 + 100);
    expect(visiblePhotoAlt()).toBe('photo three');

    open(0.1);
    open();
    expect(visiblePhotoAlt()).toBe('photo one');
  });

  it('gives a reopened chapter a full slot before its first swap', () => {
    render(<ChapterPhotoCrossfade photos={photos} />);
    open();
    advance(SLOT_MS - 200); // leave late in a slot

    open(0.1);
    open();

    advance(300); // the old timer phase would have fired inside this window
    expect(visiblePhotoAlt()).toBe('photo one');

    advance(SLOT_MS);
    expect(visiblePhotoAlt()).toBe('photo two');
  });

  it('varies the Ken Burns move between chapters', () => {
    const { unmount } = render(<ChapterPhotoCrossfade photos={photos} seed={2017} />);
    open();
    const first = screen.getByAltText('photo one').style;
    const a = { animation: first.animation, origin: first.transformOrigin };
    unmount();

    render(<ChapterPhotoCrossfade photos={photos} seed={2018} />);
    open();
    const second = screen.getByAltText('photo one').style;
    const b = { animation: second.animation, origin: second.transformOrigin };

    expect(b).not.toEqual(a);
  });

  it('gives the same chapter the same move on every render', () => {
    const { unmount } = render(<ChapterPhotoCrossfade photos={photos} seed={2019} />);
    open();
    const a = screen.getByAltText('photo one').style.transformOrigin;
    unmount();

    render(<ChapterPhotoCrossfade photos={photos} seed={2019} />);
    open();
    expect(screen.getByAltText('photo one').style.transformOrigin).toBe(a);
  });
});

describe('Ken Burns distribution across the album', () => {
  const YEARS = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027];

  function moveFor(seed: number) {
    const { unmount } = render(<ChapterPhotoCrossfade photos={photos} seed={seed} />);
    open();
    const s = screen.getByAltText('photo one').style;
    const move = { animation: s.animation, origin: s.transformOrigin };
    unmount();
    return move;
  }

  it('never gives two neighbouring chapters the same move', () => {
    const moves = YEARS.map(moveFor);
    const collisions = moves
      .slice(1)
      .map((m, i) => (JSON.stringify(m) === JSON.stringify(moves[i]) ? YEARS[i + 1] : null))
      .filter(Boolean);

    expect(collisions).toEqual([]);
  });

  it('does not simply alternate push and pull down the album', () => {
    const directions = YEARS.map((y) => moveFor(y).animation);
    const strictlyAlternating = directions.every(
      (d, i) => i === 0 || d !== directions[i - 1],
    );

    expect(strictlyAlternating).toBe(false);
  });
});
