import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { FloatingAnchorSet } from './FloatingAnchorSet';

type IOCallback = (entries: IntersectionObserverEntry[]) => void;

let observerCallback: IOCallback | null = null;

class CapturingIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  constructor(cb: IOCallback) {
    observerCallback = cb;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

/** Pretend the RSVP section fills the scroller so the FAB shows itself. */
function activateRsvpSection() {
  const section = document.getElementById('rsvp')!;
  act(() => {
    observerCallback?.([
      { target: section, intersectionRatio: 1 } as unknown as IntersectionObserverEntry,
    ]);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('IntersectionObserver', CapturingIntersectionObserver);
  // The scroll root the FAB observes, one non-hero section, and a text field
  // standing in for the RSVP chat's email input.
  const host = document.createElement('div');
  host.innerHTML = `
    <div id="main-content">
      <section id="rsvp" data-palette="golden-matcha"></section>
    </div>
    <input id="email" type="email" aria-label="Email address" />
    <button id="send" type="button">Send</button>
  `;
  document.body.appendChild(host);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  observerCallback = null;
  document.body.innerHTML = '';
});

describe('FloatingAnchorSet', () => {
  it('shows the FAB once a content section is active', () => {
    render(<FloatingAnchorSet />);
    expect(screen.queryByRole('button', { name: 'Open quick navigation' })).not.toBeInTheDocument();

    activateRsvpSection();
    expect(screen.getByRole('button', { name: 'Open quick navigation' })).toBeInTheDocument();
  });

  it('hides while a text field has focus so it cannot sit on the chat Send button', () => {
    render(<FloatingAnchorSet />);
    activateRsvpSection();

    act(() => document.getElementById('email')!.focus());
    expect(screen.queryByRole('button', { name: 'Open quick navigation' })).not.toBeInTheDocument();
  });

  // The nav wraps the hidden pill stack, so its box covers ~140×250px of the
  // bottom-right corner even while closed. It sits outside <main>, so a swipe
  // starting on it chains to the locked root and the page will not scroll
  // under a right thumb. Only the visible controls may take touches.
  it('lets swipes through its empty box so the page still scrolls under it', () => {
    render(<FloatingAnchorSet />);
    activateRsvpSection();

    expect(screen.getByRole('navigation', { name: 'Quick navigation' })).toHaveClass('pointer-events-none');
    expect(screen.getByRole('button', { name: 'Open quick navigation' })).toHaveClass('pointer-events-auto');
    for (const pill of screen.getAllByRole('button', { name: /^Jump to/, hidden: true })) {
      expect(pill).toHaveClass('pointer-events-auto');
    }
  });

  // The page scrolls inside <main>, so a phone's tap-the-status-bar shortcut
  // can't take guests back to the top. Home and Our Story lead the menu so a
  // guest who jumped to the logistics can always get back to the story.
  it('offers Home and Our Story ahead of the logistics shortcuts', () => {
    render(<FloatingAnchorSet />);
    activateRsvpSection();
    fireEvent.click(screen.getByRole('button', { name: 'Open quick navigation' }));

    const pills = within(screen.getByRole('navigation', { name: 'Quick navigation' }))
      .getAllByRole('button')
      .slice(0, -1); // the last button is the compass toggle itself
    expect(pills.map((pill) => pill.textContent)).toEqual([
      'Home',
      'Our Story',
      'Details',
      'Dress Code',
      'RSVP',
      'FAQ',
    ]);
  });

  it('scrolls back to the Hero from Home and to Act One from Our Story', () => {
    const hero = document.createElement('section');
    hero.id = 'hero';
    hero.scrollIntoView = vi.fn();
    const prologue = document.createElement('section');
    prologue.id = 'story-prologue';
    prologue.scrollIntoView = vi.fn();
    document.body.append(hero, prologue);

    render(<FloatingAnchorSet />);
    activateRsvpSection();

    fireEvent.click(screen.getByRole('button', { name: 'Open quick navigation' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to Home' }));
    expect(hero.scrollIntoView).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Open quick navigation' }));
    fireEvent.click(screen.getByRole('button', { name: 'Jump to Our Story' }));
    expect(prologue.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('stays hidden through the tap that blurs the field, then comes back', () => {
    render(<FloatingAnchorSet />);
    activateRsvpSection();
    act(() => document.getElementById('email')!.focus());

    // Tapping Send moves focus off the input on mousedown; the FAB must not
    // reappear under the finger before the click lands.
    act(() => document.getElementById('send')!.focus());
    expect(screen.queryByRole('button', { name: 'Open quick navigation' })).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(300));
    expect(screen.getByRole('button', { name: 'Open quick navigation' })).toBeInTheDocument();
  });
});
