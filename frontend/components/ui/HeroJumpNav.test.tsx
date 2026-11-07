import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { HeroJumpNav } from './HeroJumpNav';
import { fabAnchors, quickNavAnchors, storyAnchor } from '@/lib/quick-nav';

beforeEach(() => {
  // A brand-new device: nothing remembered from an earlier visit.
  localStorage.clear();
});

describe('HeroJumpNav', () => {
  it('shows every jump destination on a first visit', () => {
    render(<HeroJumpNav />);

    const nav = screen.getByRole('navigation', { name: 'Wedding sections' });
    expect(nav).toBeInTheDocument();
    for (const anchor of quickNavAnchors) {
      expect(screen.getByRole('button', { name: anchor.label })).toBeInTheDocument();
    }
  });

  // Entourage lives in the compass only. A fifth Hero pill would break the
  // balanced 2×2 grid on phones and leave one pill alone on the last row.
  it('keeps Entourage out of the Hero shortcuts', () => {
    render(<HeroJumpNav />);
    expect(screen.queryByRole('button', { name: 'Jump to Entourage' })).not.toBeInTheDocument();
  });

  // Guests were tapping straight into the logistics shortcuts and never
  // seeing the story, so the story is the lead action, ahead of the pills.
  it('leads with a Begin our story button that opens the story at Act One', () => {
    const target = document.createElement('section');
    target.id = storyAnchor.id;
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    render(<HeroJumpNav />);
    const nav = screen.getByRole('navigation', { name: 'Wedding sections' });
    const buttons = within(nav).getAllByRole('button');

    expect(buttons[0]).toHaveAccessibleName('Begin our story');
    fireEvent.click(buttons[0]);
    expect(target.scrollIntoView).toHaveBeenCalledTimes(1);

    target.remove();
  });

  it('includes each visible pill label in its accessible name', () => {
    // WCAG 2.5.3 — voice-control users say the word they see on the pill.
    // fabAnchors is the superset: the Hero pills plus Home and Our Story.
    for (const anchor of fabAnchors) {
      expect(anchor.label).toContain(anchor.shortLabel);
    }
  });

  it('does not depend on a remembered first-scroll flag', () => {
    localStorage.setItem('firstScrollComplete', 'true');
    const { unmount } = render(<HeroJumpNav />);
    const withFlag = screen.getAllByRole('button').length;
    unmount();

    localStorage.clear();
    render(<HeroJumpNav />);

    expect(screen.getAllByRole('button')).toHaveLength(withFlag);
    // The story button plus one pill per logistics shortcut.
    expect(withFlag).toBe(quickNavAnchors.length + 1);
  });
});
