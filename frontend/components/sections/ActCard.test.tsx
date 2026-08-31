import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActCard } from './ActCard';

describe('ActCard', () => {
  it('renders the prologue plate as Act One', () => {
    render(<ActCard variant="prologue" />);

    expect(screen.getByText('Act One')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /the decade/i })).toBeInTheDocument();
    // Regex rather than an exact string so an en/em-dash or spacing tweak in
    // the date range doesn't fail the test — the years are the assertion.
    expect(screen.getByText(/01\.2017\s*—\s*01\.2027/)).toBeInTheDocument();
  });

  it('renders the intermission plate with the wedding date and a seat cue', () => {
    render(<ActCard variant="intermission" />);

    expect(screen.getByText('Intermission')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /act two begins/i })).toBeInTheDocument();
    expect(screen.getByText('Friday, January 8, 2027')).toBeInTheDocument();
    expect(screen.getByText('Please take your seat')).toBeInTheDocument();
  });

  it('states each plate once — the drapes never duplicate the headline for screen readers', () => {
    render(<ActCard variant="intermission" />);

    expect(screen.getAllByRole('heading', { name: /act two begins/i })).toHaveLength(1);
  });

  it('hides the decorative drapes from assistive tech', () => {
    const { container } = render(<ActCard variant="prologue" />);

    const drapes = container.querySelectorAll('[data-drape]');
    expect(drapes.length).toBeGreaterThan(0);
    drapes.forEach((drape) => expect(drape).toHaveAttribute('aria-hidden', 'true'));
  });
});
