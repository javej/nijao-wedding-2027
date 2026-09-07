import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RSVPParkingCard } from './RSVPParkingCard';
import { submitGuestParking } from '@/app/actions/rsvp';

vi.mock('@/app/actions/rsvp', () => ({
  submitGuestParking: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(submitGuestParking).mockResolvedValue({ success: true });
});

describe('RSVPParkingCard', () => {
  it('shows the not-sure line with a way back to add the plate', () => {
    render(
      <RSVPParkingCard
        guestSlug="sharky"
        parking={{ status: 'unsure', plate: null }}
        onSaved={vi.fn()}
      />,
    );

    expect(screen.getByText('Car plate: not sure yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add it' })).toBeInTheDocument();
    // The form stays tucked away until the guest asks for it.
    expect(screen.queryByRole('textbox', { name: 'Car plate number' })).not.toBeInTheDocument();
  });

  it('invites guests who were never asked', () => {
    render(<RSVPParkingCard guestSlug="sharky" parking={null} onSaved={vi.fn()} />);

    expect(screen.getByText('Car plate: not added yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add it' })).toBeInTheDocument();
  });

  it('reveals the form and saves a normalized plate', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(
      <RSVPParkingCard
        guestSlug="sharky"
        parking={{ status: 'unsure', plate: null }}
        onSaved={onSaved}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Add it' }));
    await user.type(screen.getByRole('textbox', { name: 'Car plate number' }), 'abc 1234');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(submitGuestParking).toHaveBeenCalledWith({
        guestSlug: 'sharky',
        parking: { status: 'plate', plate: 'ABC 1234' },
      }),
    );
    expect(onSaved).toHaveBeenCalledWith({ status: 'plate', plate: 'ABC 1234' });
  });

  it('rejects text that is not a plate without calling the server', async () => {
    const user = userEvent.setup();
    render(<RSVPParkingCard guestSlug="sharky" parking={null} onSaved={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Add it' }));
    await user.type(screen.getByRole('textbox', { name: 'Car plate number' }), 'xx');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/doesn't look like a plate/i);
    expect(submitGuestParking).not.toHaveBeenCalled();
  });

  it('lets the guest say they are not driving', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(<RSVPParkingCard guestSlug="sharky" parking={null} onSaved={onSaved} />);

    await user.click(screen.getByRole('button', { name: 'Add it' }));
    await user.click(screen.getByRole('button', { name: 'Not driving' }));

    await waitFor(() =>
      expect(submitGuestParking).toHaveBeenCalledWith({
        guestSlug: 'sharky',
        parking: { status: 'none' },
      }),
    );
    expect(onSaved).toHaveBeenCalledWith({ status: 'none' });
  });

  it('shows the plate on file with an Update toggle', () => {
    render(
      <RSVPParkingCard
        guestSlug="sharky"
        parking={{ status: 'plate', plate: 'ABC 1234' }}
        onSaved={vi.fn()}
      />,
    );

    expect(screen.getByText('Car plate: ABC 1234')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add it' })).not.toBeInTheDocument();
  });

  it('surfaces a save failure and keeps the form open', async () => {
    const user = userEvent.setup();
    vi.mocked(submitGuestParking).mockResolvedValue({
      success: false,
      error: 'sanity_unavailable',
    });
    const onSaved = vi.fn();
    render(<RSVPParkingCard guestSlug="sharky" parking={null} onSaved={onSaved} />);

    await user.click(screen.getByRole('button', { name: 'Add it' }));
    await user.type(screen.getByRole('textbox', { name: 'Car plate number' }), 'abc 1234');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/something went wrong/i);
    expect(screen.getByRole('textbox', { name: 'Car plate number' })).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
