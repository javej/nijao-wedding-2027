/**
 * Live updates for the RSVP dashboard: watches the guest documents with
 * `client.listen()` and asks the caller to refetch when any of them change.
 *
 * Kept free of React so the debounce and lifecycle can be unit tested with a
 * fake client (see `live.test.ts`), the same way `csv.ts` holds the export
 * logic.
 */

export const GUEST_LISTEN_QUERY = `*[_type == "guest"]`;

/**
 * A linked-partner RSVP patches two guest documents in one transaction, which
 * the listener delivers as two mutation events a few milliseconds apart. Waiting
 * this long after the last event collapses the burst into one refetch.
 */
export const LIVE_RELOAD_DEBOUNCE_MS = 300;

export interface GuestListenEvent {
  type: string;
}

interface GuestListenSubscription {
  unsubscribe(): void;
}

interface GuestListenObservable {
  subscribe(observer: {
    next: (event: GuestListenEvent) => void;
    error: (err: unknown) => void;
  }): GuestListenSubscription;
}

/** The slice of `SanityClient` this module needs; `useClient()` satisfies it. */
export interface GuestListenClient {
  listen(
    query: string,
    params: Record<string, never>,
    options: {
      events: Array<"mutation" | "reconnect">;
      includeResult: false;
      includePreviousRevision: false;
      visibility: "query";
    },
  ): GuestListenObservable;
}

/**
 * Start watching guest documents. Returns a cleanup function that stops the
 * listener and cancels any reload still waiting in the debounce window.
 *
 * `reconnect` triggers a reload too: mutations that happened while the channel
 * was down are never replayed, so the table has to catch up by refetching.
 * `visibility: "query"` delays each event until the change is visible to
 * queries, so the refetch it schedules cannot read the pre-mutation state.
 */
export function watchGuestChanges(
  client: GuestListenClient,
  onChange: () => void,
  onError: (err: unknown) => void = () => {},
  debounceMs: number = LIVE_RELOAD_DEBOUNCE_MS,
): () => void {
  let pending: ReturnType<typeof setTimeout> | null = null;

  const scheduleReload = () => {
    if (pending !== null) clearTimeout(pending);
    pending = setTimeout(() => {
      pending = null;
      onChange();
    }, debounceMs);
  };

  const subscription = client
    .listen(
      GUEST_LISTEN_QUERY,
      {},
      {
        events: ["mutation", "reconnect"],
        includeResult: false,
        includePreviousRevision: false,
        visibility: "query",
      },
    )
    .subscribe({
      next: (event) => {
        if (event.type === "mutation" || event.type === "reconnect") {
          scheduleReload();
        }
      },
      error: onError,
    });

  return () => {
    if (pending !== null) {
      clearTimeout(pending);
      pending = null;
    }
    subscription.unsubscribe();
  };
}
