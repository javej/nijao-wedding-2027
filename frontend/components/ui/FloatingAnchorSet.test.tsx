import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
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
