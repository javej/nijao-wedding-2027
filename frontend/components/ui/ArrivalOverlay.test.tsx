import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArrivalOverlay } from './ArrivalOverlay';

// next/image needs the Next runtime; a plain <img> is enough to render the lace.
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, sizes, ...rest } = props;
    void fill; void priority; void sizes;
    // A bare <img> is the point of this mock: no Next image pipeline in jsdom.
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

function renderOverlay(confirmedNames?: string[]) {
  return render(
    <ArrivalOverlay
      visible
      interactive
      onDismiss={() => {}}
      guestName="Test Main"
      confirmedNames={confirmedNames}
    />,
  );
}

describe('ArrivalOverlay greeting', () => {
  it('shows the generic welcome when nobody has confirmed', () => {
    renderOverlay([]);
    expect(screen.getByText(/glad you.re here/i)).toBeInTheDocument();
    expect(screen.queryByText(/confirmed rsvp/i)).not.toBeInTheDocument();
  });

  it('shows the generic welcome when the prop is omitted', () => {
    renderOverlay();
    expect(screen.getByText(/glad you.re here/i)).toBeInTheDocument();
  });

  it('shows a single confirmed RSVP in place of the generic line', () => {
    renderOverlay(['Test Main']);
    expect(screen.getByText('Confirmed RSVP for:')).toBeInTheDocument();
    expect(screen.queryByText(/glad you.re here/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    // The greeting and the confirmation both carry the name.
    expect(screen.getAllByText('Test Main')).toHaveLength(2);
  });

  it('shows a numbered list when companions are confirmed too', () => {
    renderOverlay(['Test Main', 'Jane Doe']);
    expect(screen.getByText('Confirmed RSVPs for:')).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual(['Test Main', 'Jane Doe']);
  });
});
