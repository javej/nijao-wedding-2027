import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroJumpNav } from './HeroJumpNav';
import { quickNavAnchors } from '@/lib/quick-nav';

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

  it('does not depend on a remembered first-scroll flag', () => {
    localStorage.setItem('firstScrollComplete', 'true');
    const { unmount } = render(<HeroJumpNav />);
    const withFlag = screen.getAllByRole('button').length;
    unmount();

    localStorage.clear();
    render(<HeroJumpNav />);

    expect(screen.getAllByRole('button')).toHaveLength(withFlag);
    expect(withFlag).toBe(quickNavAnchors.length);
  });
});
