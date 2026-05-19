# ADR 0003 — Arrival scroll lock targets the scroll container, not `<body>`

- **Status:** Accepted
- **Date:** 2026-05-19
- **Related:** UI/UX improvements round (scroll fixes phase)

## Context

The site renders as a snap-scroll experience: `<main id="main-content">` in [ChapterScrollContainer.tsx](../../frontend/components/ui/ChapterScrollContainer.tsx) is the actual scroll container (`h-dvh overflow-y-scroll snap-y snap-mandatory`), with each `ChapterSection` ([ChapterSection.tsx](../../frontend/components/ui/ChapterSection.tsx)) sized to `min-h-dvh snap-start`. The page `<body>` itself does not scroll.

On guest arrival, [ExperienceShell.tsx](../../frontend/components/ui/ExperienceShell.tsx) overlays a `MonogramLoader` (z-50), then an `ArrivalOverlay` (z-40) carrying the "Welcome / tap to begin" message. The user dismisses the overlay with a tap, wheel, touchmove, or keypress; only then does the scroll content underneath become reachable. To prevent premature scrolling during this ceremony, `ExperienceShell` sets `document.body.style.overflow = 'hidden'`.

Two symptoms surfaced in real testing:

1. **The page is already scrollable while the overlay is up.** Wheel/touchmove events nudge `<main>` underneath the overlay before — and during — dismissal.
2. **The first dismissal gesture feels laggy / "double-fired."** A single wheel event both triggers `onDismiss()` and scrolls the underlying `<main>` by some amount, so the user lands on the experience mid-scroll instead of at the hero.

The root cause is twofold:

- `body { overflow: hidden }` only stops scrolling on the body's own scroll container. It does **not** block scrolling on a descendant element that has `overflow-y: scroll` and its own scroll axis. The inner `<main>` continues to handle wheel and touch events independently.
- The overlay's wheel listener is attached with `{ passive: true }`, which means it cannot call `event.preventDefault()`. The wheel event therefore propagates and reaches `<main>`, which scrolls.

We considered four ways to actually prevent scroll until dismissal:

| Option | Mechanism | Risk |
|---|---|---|
| Lock `<body>` (status quo) | `body.overflow = 'hidden'` | Doesn't stop inner scroll container. Broken. |
| `pointer-events: none` on `<main>` | Disable mouse/touch on the underlying content | Doesn't affect wheel; doesn't affect keyboard. Partial. |
| `position: fixed; inset: 0` on `<main>` | Remove `<main>` from the scroll flow entirely | Triggers a layout shift on dismiss; can break browser scroll-restoration. |
| **Lock `<main>` directly + non-passive wheel guard** | `main.style.overflow = 'hidden'` while overlay is up; overlay wheel listener uses `{ passive: false }` and calls `preventDefault()` | Solves both symptoms. Small care needed to clean up on unmount. |

## Decision

During the arrival sequence (loader + overlay), the **scroll container itself** is locked:

- `ExperienceShell` sets `document.getElementById('main-content').style.overflow = 'hidden'` while `overlayDismissed === false`, and restores it to `''` after dismiss.
- `ArrivalOverlay` registers its `wheel` listener with `{ passive: false }` and calls `event.preventDefault()` before invoking `dismiss()`. Touchmove and keydown handlers continue to work as today.
- `document.body.style.overflow = 'hidden'` is **also** kept, as a belt-and-braces guard for any browser quirks and for the case where a future redesign moves scroll back to `<body>`.

The `<main>` element receives `id="main-content"` (already present) so `ExperienceShell` can look it up by ID. We do not introduce a ref or a shared context — the existing single-`<main>` invariant on this site makes the document.getElementById lookup acceptable, and it avoids coupling `ChapterScrollContainer` to the arrival ceremony.

## Consequences

### Positive

- The overlay is genuinely modal during arrival. No premature scrolling, no laggy first gesture.
- The fix is local to two files (`ExperienceShell.tsx`, `ArrivalOverlay.tsx`). No props plumbing, no new context, no new state.
- Honors `prefers-reduced-motion`: the lock applies regardless of animation preferences; behavior is consistent.

### Negative

- The `document.getElementById('main-content')` lookup is a stringly-typed coupling between `ExperienceShell` and `ChapterScrollContainer`. If the `id` ever changes, the lock silently breaks. Mitigation: a comment on both sides referencing this ADR.
- Changing the wheel listener to `{ passive: false }` means the browser cannot optimistically pre-scroll for that event. The cost is negligible because the listener exists only while the overlay is mounted, but it is a small concession on the scroll-perf budget.

### Rejected alternatives

- **`position: fixed` on `<main>`.** Solves the lock but creates a one-frame layout shift on dismiss as `<main>` re-enters the flow. The shift is visible against the alternating-background scheme we are about to introduce.
- **`pointer-events: none` on `<main>`.** Does not block wheel events on most browsers and does nothing for keyboard. Partial fix.
- **Unmount `<main>` until dismiss.** Most aggressive, but causes a flash of unstyled content on dismiss and discards any SSR'd HTML, which negates the point of having `<main>` server-rendered with the chapters.
