import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GUEST_LISTEN_QUERY,
  LIVE_RELOAD_DEBOUNCE_MS,
  watchGuestChanges,
  type GuestListenClient,
  type GuestListenEvent,
} from "./live";

type Observer = {
  next: (event: GuestListenEvent) => void;
  error: (err: unknown) => void;
};

/** A stand-in for `client.listen()` that lets the test push events by hand. */
function fakeClient() {
  const observers: Observer[] = [];
  const unsubscribe = vi.fn();
  const listen = vi.fn(() => ({
    subscribe(observer: Observer) {
      observers.push(observer);
      return { unsubscribe };
    },
  }));
  const client = { listen } as unknown as GuestListenClient;
  const emit = (event: GuestListenEvent) =>
    observers.forEach((o) => o.next(event));
  const fail = (err: unknown) => observers.forEach((o) => o.error(err));
  return { client, listen, unsubscribe, emit, fail };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("watchGuestChanges", () => {
  it("listens to guest documents only, without shipping document bodies", () => {
    const { client, listen } = fakeClient();
    watchGuestChanges(client, () => {});

    expect(listen).toHaveBeenCalledWith(
      GUEST_LISTEN_QUERY,
      {},
      expect.objectContaining({
        includeResult: false,
        includePreviousRevision: false,
        visibility: "query",
      }),
    );
  });

  it("reloads once the debounce window closes after a mutation", () => {
    const { client, emit } = fakeClient();
    const onChange = vi.fn();
    watchGuestChanges(client, onChange);

    emit({ type: "mutation" });
    expect(onChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(LIVE_RELOAD_DEBOUNCE_MS);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  // A linked-partner RSVP patches two guest documents in one transaction, which
  // arrives as two mutation events. The dashboard should refetch once, not twice.
  it("collapses a burst of mutations into a single reload", () => {
    const { client, emit } = fakeClient();
    const onChange = vi.fn();
    watchGuestChanges(client, onChange);

    emit({ type: "mutation" });
    vi.advanceTimersByTime(LIVE_RELOAD_DEBOUNCE_MS / 2);
    emit({ type: "mutation" });
    vi.advanceTimersByTime(LIVE_RELOAD_DEBOUNCE_MS / 2);
    expect(onChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(LIVE_RELOAD_DEBOUNCE_MS / 2);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  // Events can be missed while the connection was down; a reconnect is the cue
  // to refetch so the table catches up.
  it("reloads after the connection is re-established", () => {
    const { client, emit } = fakeClient();
    const onChange = vi.fn();
    watchGuestChanges(client, onChange);

    emit({ type: "reconnect" });
    vi.advanceTimersByTime(LIVE_RELOAD_DEBOUNCE_MS);

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("ignores the welcome handshake", () => {
    const { client, emit } = fakeClient();
    const onChange = vi.fn();
    watchGuestChanges(client, onChange);

    emit({ type: "welcome" });
    vi.advanceTimersByTime(LIVE_RELOAD_DEBOUNCE_MS * 2);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("reports listener failures to the caller", () => {
    const { client, fail } = fakeClient();
    const onError = vi.fn();
    watchGuestChanges(client, () => {}, onError);

    const boom = new Error("channel closed");
    fail(boom);

    expect(onError).toHaveBeenCalledWith(boom);
  });

  it("stops listening and drops a pending reload when cleaned up", () => {
    const { client, emit, unsubscribe } = fakeClient();
    const onChange = vi.fn();
    const stop = watchGuestChanges(client, onChange);

    emit({ type: "mutation" });
    stop();
    vi.advanceTimersByTime(LIVE_RELOAD_DEBOUNCE_MS * 2);

    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
  });
});
