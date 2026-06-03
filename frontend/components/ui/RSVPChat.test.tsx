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
