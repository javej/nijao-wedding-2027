import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RSVPChat, type RSVPChatProps } from './RSVPChat';
import { submitRsvp } from '@/app/actions/rsvp';
import { getLocalItem } from '@/lib/localStorage';

// Mock the server action module so the test never pulls in googleapis/resend
// (which throw at import when their env vars are unset) and so we can drive the
// submit result. retryRsvpAudit is used by the on-mount retry-queue hook.
vi.mock('@/app/actions/rsvp', () => ({
  submitRsvp: vi.fn(),
  retryRsvpAudit: vi.fn().mockResolvedValue({ success: true }),
}));

const baseProps: RSVPChatProps = {
  guestName: 'Sharky',
  guestSlug: 'sharky',
  plusOneEligible: false,
  plusOneType: null,
  plusOneLinkedGuestName: null,
  plusOneLinkedGuestSlug: null,
  needsEmail: false,
  needsMobile: false,
  currentPlate: null,
};

function renderChat(overrides: Partial<RSVPChatProps> = {}) {
  return render(<RSVPChat {...baseProps} {...overrides} />);
}

beforeEach(() => {
  localStorage.clear();
  vi.mocked(submitRsvp).mockResolvedValue({ success: true });
});

describe('RSVPChat', () => {
  it('opens with the attendance question and both quick-reply chips', () => {
    renderChat();
    expect(
      screen.getByText('Will you be joining us on January 8?'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: "Yes, I'll be there" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: "Sorry, I can't make it" }),
    ).toBeInTheDocument();
  });

  it('submits an attending RSVP and confirms (no plus-one, contact on file)', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderChat({ onComplete });

    await user.click(screen.getByRole('button', { name: "Yes, I'll be there" }));
    await user.click(await screen.findByRole('button', { name: 'Not driving' }));

    await waitFor(
      () => expect(submitRsvp).toHaveBeenCalledTimes(1),
      { timeout: 3000 },
    );
    expect(submitRsvp).toHaveBeenCalledWith(
      expect.objectContaining({ guestSlug: 'sharky', attending: true }),
    );
    expect(
      await screen.findByText(/Wonderful! We've saved your RSVP, Sharky/),
    ).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ attending: true }),
    );
  });

  it('submits a decline and shows the understanding message', async () => {
    const user = userEvent.setup();
    renderChat();

    await user.click(
      screen.getByRole('button', { name: "Sorry, I can't make it" }),
    );

    await waitFor(() => expect(submitRsvp).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });
    expect(submitRsvp).toHaveBeenCalledWith(
      expect.objectContaining({ attending: false }),
    );
    expect(
      await screen.findByText(/Thank you for letting us know/),
    ).toBeInTheDocument();
  });

  it('classifies a typed "ok I can\'t make it" as a decline (bug #5 path)', async () => {
    const user = userEvent.setup();
    renderChat();

    const input = screen.getByRole('textbox', { name: 'RSVP response' });
    await user.type(input, "ok I can't make it{Enter}");

    await waitFor(() => expect(submitRsvp).toHaveBeenCalledTimes(1), {
      timeout: 3000,
    });
    expect(submitRsvp).toHaveBeenCalledWith(
      expect.objectContaining({ attending: false }),
    );
  });

  it('queues an audit-only retry payload when the Sheets append fails', async () => {
    const user = userEvent.setup();
    const retryAudit = {
      guestName: 'Sharky',
      guestSlug: 'sharky',
      attending: true,
    };
    vi.mocked(submitRsvp).mockResolvedValue({
      success: false,
      error: 'sheets_unavailable',
      retryAudit,
    });

    renderChat();
    await user.click(screen.getByRole('button', { name: "Yes, I'll be there" }));
    await user.click(await screen.findByRole('button', { name: 'Not driving' }));

    // Still confirms to the guest (Sanity already wrote)...
    expect(
      await screen.findByText(/Wonderful! We've saved your RSVP, Sharky/),
    ).toBeInTheDocument();
    // ...and parks ONLY the audit payload for retry (not the full RSVP payload).
    await waitFor(() =>
      expect(getLocalItem('rsvpQueue', null)).toEqual(retryAudit),
    );
  });

  it('keeps the free-text input available after a single unrecognized reply (bug #6)', async () => {
    const user = userEvent.setup();
    renderChat();

    const input = screen.getByRole('textbox', { name: 'RSVP response' });
    await user.type(input, 'hmm{Enter}');

    expect(
      await screen.findByText(/I didn't quite catch that/),
    ).toBeInTheDocument();
    // After one miss the input is still there for a retry.
    expect(
      screen.getByRole('textbox', { name: 'RSVP response' }),
    ).toBeInTheDocument();
    expect(submitRsvp).not.toHaveBeenCalled();
  });
});

describe('RSVPChat parking question (ADR-0008)', () => {
  async function answerYes(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: "Yes, I'll be there" }));
    expect(await screen.findByText(/plate number/i)).toBeInTheDocument();
  }

  it('asks attending guests for their plate before submitting', async () => {
    const user = userEvent.setup();
    renderChat();

    await answerYes(user);

    expect(screen.getByRole('button', { name: 'Not sure yet' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Not driving' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Car plate number' })).toBeInTheDocument();
    expect(submitRsvp).not.toHaveBeenCalled();
  });

  it('submits a typed plate, normalized', async () => {
    const user = userEvent.setup();
    renderChat();

    await answerYes(user);
    await user.type(screen.getByRole('textbox', { name: 'Car plate number' }), 'abc 1234{Enter}');

    await waitFor(() => expect(submitRsvp).toHaveBeenCalledTimes(1), { timeout: 3000 });
    expect(submitRsvp).toHaveBeenCalledWith(
      expect.objectContaining({
        attending: true,
        parking: { status: 'plate', plate: 'ABC 1234' },
      }),
    );
  });

  it('records "Not sure yet" and tells the guest how to come back', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    renderChat({ onComplete });

    await answerYes(user);
    await user.click(screen.getByRole('button', { name: 'Not sure yet' }));

    expect(
      await screen.findByText(/come back to this page anytime/i),
    ).toBeInTheDocument();
    await waitFor(() => expect(submitRsvp).toHaveBeenCalledTimes(1), { timeout: 3000 });
    expect(submitRsvp).toHaveBeenCalledWith(
      expect.objectContaining({ parking: { status: 'unsure' } }),
    );
    await waitFor(() =>
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({ parking: { status: 'unsure' } }),
      ),
    );
  });

  it('records "Not driving"', async () => {
    const user = userEvent.setup();
    renderChat();

    await answerYes(user);
    await user.click(screen.getByRole('button', { name: 'Not driving' }));

    await waitFor(() => expect(submitRsvp).toHaveBeenCalledTimes(1), { timeout: 3000 });
    expect(submitRsvp).toHaveBeenCalledWith(
      expect.objectContaining({ parking: { status: 'none' } }),
    );
  });

  it('offers to keep the plate already on file when re-RSVPing', async () => {
    const user = userEvent.setup();
    renderChat({ currentPlate: 'ABC 1234' });

    await answerYes(user);
    await user.click(screen.getByRole('button', { name: 'Same car, ABC 1234' }));

    await waitFor(() => expect(submitRsvp).toHaveBeenCalledTimes(1), { timeout: 3000 });
    expect(submitRsvp).toHaveBeenCalledWith(
      expect.objectContaining({ parking: { status: 'plate', plate: 'ABC 1234' } }),
    );
  });

  it('rejects text that is not a plate and keeps asking', async () => {
    const user = userEvent.setup();
    renderChat();

    await answerYes(user);
    await user.type(screen.getByRole('textbox', { name: 'Car plate number' }), 'xx{Enter}');

    expect(await screen.findByText(/doesn't look like a plate/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Not sure yet' })).toBeInTheDocument();
    expect(submitRsvp).not.toHaveBeenCalled();
  });

  it('asks for the plate before the contact questions', async () => {
    const user = userEvent.setup();
    renderChat({ needsEmail: true });

    await answerYes(user);
    expect(screen.queryByText(/emailed/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Not driving' }));

    expect(await screen.findByText(/emailed/i)).toBeInTheDocument();
    expect(submitRsvp).not.toHaveBeenCalled();
  });

  it('never asks decliners about parking', async () => {
    const user = userEvent.setup();
    renderChat();

    await user.click(screen.getByRole('button', { name: "Sorry, I can't make it" }));

    await waitFor(() => expect(submitRsvp).toHaveBeenCalledTimes(1), { timeout: 3000 });
    expect(screen.queryByText(/plate number/i)).not.toBeInTheDocument();
    expect(vi.mocked(submitRsvp).mock.calls[0][0].parking).toBeUndefined();
  });
});
