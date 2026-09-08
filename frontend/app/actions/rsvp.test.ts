import { describe, it, expect, vi, beforeEach } from 'vitest';

// The action module pulls in googleapis/resend, which throw at import when their
// env vars are unset, and talks to Sanity. Mock the edges and drive the Sanity
// write client with chainable fakes so we can assert on the patches it builds.
const { fakes } = vi.hoisted(() => {
  type FakePatch = {
    set: ReturnType<typeof vi.fn>;
    unset: ReturnType<typeof vi.fn>;
    commit: ReturnType<typeof vi.fn>;
  };
  const patches: FakePatch[] = [];
  const makePatch = (): FakePatch => {
    const p: FakePatch = {
      set: vi.fn(() => p),
      unset: vi.fn(() => p),
      commit: vi.fn(async () => ({})),
    };
    patches.push(p);
    return p;
  };
  const transactionCommit = vi.fn(async () => ({}));
  const fetch = vi.fn();
  const writeClient = {
    fetch,
    patch: vi.fn(() => makePatch()),
    transaction: vi.fn(() => {
      const tx = { patch: vi.fn(() => tx), commit: transactionCommit };
      return tx;
    }),
  };
  return { fakes: { patches, writeClient, fetch, transactionCommit } };
});

vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));
vi.mock('@/lib/sheets', () => ({ appendRsvpRows: vi.fn(async () => undefined) }));
vi.mock('@/lib/resend', () => ({ sendRsvpConfirmation: vi.fn() }));
vi.mock('@/lib/rsvp-cutoff', () => ({ isRsvpClosed: () => false }));
vi.mock('@/sanity/lib/write', () => ({ writeClient: fakes.writeClient }));

import { revalidateTag } from 'next/cache';
import { appendRsvpRows } from '@/lib/sheets';
import { submitRsvp, submitGuestParking, type RSVPPayload } from './rsvp';

const basePayload: RSVPPayload = {
  guestSlug: 'sharky',
  guestName: 'Sharky',
  attending: true,
  turnstileToken: '',
  plusOneType: null,
  plusOneAttending: false,
};

beforeEach(() => {
  fakes.patches.length = 0;
  fakes.fetch.mockResolvedValue({ _id: 'guest-1', _rev: 'rev-1', rsvpStatus: 'pending' });
});

function submitterPatch() {
  const [patch] = fakes.patches;
  if (!patch) throw new Error('no patch was built');
  return patch;
}

function parkingSetCalls(patch: ReturnType<typeof submitterPatch>) {
  return patch.set.mock.calls.filter(([arg]) => 'parking' in (arg as object));
}

describe('submitRsvp parking (ADR-0008)', () => {
  it('writes a normalized plate onto the guest doc', async () => {
    const result = await submitRsvp({
      ...basePayload,
      parking: { status: 'plate', plate: 'abc-1234' },
    });

    expect(result).toEqual({ success: true });
    expect(submitterPatch().set).toHaveBeenCalledWith({
      parking: { status: 'plate', plate: 'ABC 1234' },
    });
  });

  it('writes "unsure" as a bare status so any old plate is replaced', async () => {
    await submitRsvp({ ...basePayload, parking: { status: 'unsure' } });

    expect(submitterPatch().set).toHaveBeenCalledWith({ parking: { status: 'unsure' } });
  });

  it('writes "none" for guests who are not driving', async () => {
    await submitRsvp({ ...basePayload, parking: { status: 'none' } });

    expect(submitterPatch().set).toHaveBeenCalledWith({ parking: { status: 'none' } });
  });

  it('leaves parking untouched when the payload carries none (decline)', async () => {
    await submitRsvp({ ...basePayload, attending: false });

    expect(parkingSetCalls(submitterPatch())).toHaveLength(0);
    expect(submitterPatch().unset).not.toHaveBeenCalledWith(
      expect.arrayContaining(['parking']),
    );
  });

  it('drops a plate the server cannot normalize instead of storing garbage', async () => {
    await submitRsvp({ ...basePayload, parking: { status: 'plate', plate: '!!' } });

    expect(parkingSetCalls(submitterPatch())).toHaveLength(0);
  });
});

describe('submitGuestParking (summary-card plate form)', () => {
  it('patches only the parking field and revalidates the guest page', async () => {
    const result = await submitGuestParking({
      guestSlug: 'sharky',
      parking: { status: 'plate', plate: 'nbc 1234' },
    });

    expect(result).toEqual({ success: true });
    expect(fakes.fetch).toHaveBeenCalledWith(expect.stringContaining('_type == "guest"'), {
      slug: 'sharky',
    });
    const patch = submitterPatch();
    expect(patch.set).toHaveBeenCalledTimes(1);
    expect(patch.set).toHaveBeenCalledWith({
      parking: { status: 'plate', plate: 'NBC 1234' },
    });
    expect(patch.commit).toHaveBeenCalledTimes(1);
    expect(revalidateTag).toHaveBeenCalledWith('guest:sharky', { expire: 0 });
  });

  it('records "not driving" without a plate', async () => {
    await submitGuestParking({ guestSlug: 'sharky', parking: { status: 'none' } });

    expect(submitterPatch().set).toHaveBeenCalledWith({ parking: { status: 'none' } });
  });

  it('rejects an unparseable plate before touching Sanity', async () => {
    const result = await submitGuestParking({
      guestSlug: 'sharky',
      parking: { status: 'plate', plate: 'x' },
    });

    expect(result).toEqual({ success: false, error: 'invalid' });
    expect(fakes.writeClient.patch).not.toHaveBeenCalled();
  });

  it('reports sanity_unavailable when the guest cannot be found', async () => {
    fakes.fetch.mockResolvedValue(null);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await submitGuestParking({
      guestSlug: 'ghost',
      parking: { status: 'unsure' },
    });

    expect(result).toEqual({ success: false, error: 'sanity_unavailable' });
  });
});

describe('submitRsvp open plus-one', () => {
  const withPlusOne: RSVPPayload = {
    ...basePayload,
    plusOneType: 'open',
    plusOneAttending: true,
    openPlusOne: { firstName: 'Jane', lastName: 'Doe' },
  };

  it('stores the plus-one as separate first and last names on the guest doc', async () => {
    await submitRsvp(withPlusOne);

    expect(submitterPatch().set).toHaveBeenCalledWith({
      openPlusOne: { attending: true, firstName: 'Jane', lastName: 'Doe' },
    });
    expect(submitterPatch().unset).not.toHaveBeenCalledWith(['openPlusOne']);
  });

  it('trims the names before storing them', async () => {
    await submitRsvp({
      ...withPlusOne,
      openPlusOne: { firstName: '  Jane ', lastName: ' Doe  ' },
    });

    expect(submitterPatch().set).toHaveBeenCalledWith({
      openPlusOne: { attending: true, firstName: 'Jane', lastName: 'Doe' },
    });
  });

  it('writes the joined full name to the Sheets audit log', async () => {
    await submitRsvp(withPlusOne);

    expect(appendRsvpRows).toHaveBeenCalledWith(
      expect.objectContaining({ guestName: 'Sharky', plusOneName: 'Jane Doe' }),
    );
  });

  it('clears a stale plus-one when the guest switches to "just me"', async () => {
    await submitRsvp({ ...basePayload, plusOneType: 'open', plusOneAttending: false });

    expect(submitterPatch().unset).toHaveBeenCalledWith(['openPlusOne']);
    expect(appendRsvpRows).toHaveBeenCalledWith(
      expect.not.objectContaining({ plusOneName: expect.anything() }),
    );
  });

  it('clears the plus-one when the guest declines', async () => {
    await submitRsvp({ ...withPlusOne, attending: false });

    expect(submitterPatch().unset).toHaveBeenCalledWith(['openPlusOne']);
  });

  it("logs a linked partner's name to Sheets when both are coming", async () => {
    await submitRsvp({
      ...basePayload,
      plusOneType: 'linked',
      plusOneAttending: true,
      linkedPartnerSlug: 'bob',
      linkedGuest: { name: 'Bob', slug: 'bob', attending: true },
    });

    expect(appendRsvpRows).toHaveBeenCalledWith(
      expect.objectContaining({ plusOneName: 'Bob' }),
    );
  });
});
