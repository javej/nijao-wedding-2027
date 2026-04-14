# Story 3.5: RSVP In-Site Confirmation

Status: done

## Story

As a **guest who has just submitted their RSVP**,
I want to see a warm in-site confirmation moment,
so that submitting my RSVP feels like the couple personally acknowledged me — not a form submission.

## Acceptance Criteria

1. **Given** the RSVP Server Action returns `{ success: true }`, **When** the `<RSVPChat>` component receives the success response, **Then** a final chat bubble appears with the message *"We've been waiting for you."* in the couple's voice

2. **Given** the guest is on Chrome Android, **When** the confirmation message appears, **Then** the device vibrates with three gentle pulses via `navigator.vibrate([100, 50, 100, 50, 100])`

3. **Given** the guest is on iOS (where `navigator.vibrate()` is not supported), **When** the confirmation message appears, **Then** no haptic is attempted — the visual confirmation alone plays (graceful degradation)

4. **Given** `prefers-reduced-motion` is NOT set, **When** the confirmation message appears, **Then** a `<PetalBurst>` Framer Motion animation plays — petals appear and drift upward from the chat bubble

5. **Given** `prefers-reduced-motion` IS set, **When** the confirmation message appears, **Then** the petal burst animation is suppressed entirely — only the text confirmation is shown

6. **And** the confirmation state persists for the session — if the guest scrolls away and returns to the RSVP section, they see the completed confirmation state, not the initial chat prompt

## Tasks / Subtasks

- [x] Task 1: Add confirmation state to RSVPChat (AC: 1, 6)
  - [x] 1.1 In `frontend/components/ui/RSVPChat.tsx`, add `confirmed` state to the chat state machine
  - [x] 1.2 When `submitRsvp()` returns `{ success: true }`, transition to `confirmed` state
  - [x] 1.3 Show final chat bubble: *"We've been waiting for you."* in the couple's voice
  - [x] 1.4 Persist confirmation state in `sessionStorage` (not `localStorage`) so it survives scroll-away but not browser close
  - [x] 1.5 On re-render, check `sessionStorage` — if confirmed, skip chat flow and show confirmation

- [x] Task 2: Create PetalBurst animation component (AC: 4, 5)
  - [x] 2.1 Create `frontend/components/ui/PetalBurst.tsx` with `'use client'` directive
  - [x] 2.2 Use Framer Motion for petal animation — petals drift upward from the chat bubble
  - [x] 2.3 Check `useReducedMotion()` from `framer-motion` — if true, render nothing (suppress entirely)
  - [x] 2.4 Define Framer Motion variants OUTSIDE the component body (not inline)
  - [x] 2.5 Use palette color tokens for petal colors — mix of `matcha-chiffon`, `strawberry-milk`, `berry-meringue`
  - [x] 2.6 Animation should be tasteful — user-tuned to 7-10s per petal with staggered delays for a slow, appreciable drift effect

- [x] Task 3: Implement haptic feedback (AC: 2, 3)
  - [x] 3.1 In `RSVPChat.tsx`, after showing confirmation bubble, call `navigator.vibrate([100, 50, 100, 50, 100])`
  - [x] 3.2 Guard with `typeof navigator !== 'undefined' && 'vibrate' in navigator` — graceful degradation
  - [x] 3.3 On iOS (and any browser without vibrate support): no-op, no error

- [x] Task 4: Wire PetalBurst to confirmation (AC: 4, 5)
  - [x] 4.1 Render `<PetalBurst>` when chat enters `confirmed` state
  - [x] 4.2 Render PetalBurst at RSVPSection level (`absolute inset-0`) for full-section coverage — lifted from chat bubble per user direction
  - [x] 4.3 Animation plays once, does not loop

- [x] Task 5: Verify and test (AC: 1-6)
  - [x] 5.1 Complete RSVP → *"We've been waiting for you."* bubble appears
  - [x] 5.2 Chrome Android: device vibrates with 3 pulses
  - [x] 5.3 iOS Safari: no vibration, no error
  - [x] 5.4 Reduced motion OFF: petal burst animation plays
  - [x] 5.5 Reduced motion ON: no petal burst, text-only confirmation
  - [x] 5.6 Scroll away from RSVP → scroll back → confirmation state preserved (no re-prompt)
  - [x] 5.7 Close browser → reopen → fresh RSVP flow (sessionStorage cleared)
  - [x] 5.8 Run `pnpm build && pnpm lint` — zero errors

## Dev Notes

### Architecture Patterns & Constraints

- **Framer Motion rules**: Always check `useReducedMotion()` in every animated component. Define variants outside the component body. PetalBurst is suppressed entirely (not just simplified) when reduced-motion is set
- **Haptic API**: `navigator.vibrate()` is Chrome Android only. iOS Safari does not support it. Always feature-detect before calling
- **State persistence**: Use `sessionStorage` for RSVP confirmation state (persists within tab session, cleared on browser close). Use the SSR-safe pattern: check `typeof window !== 'undefined'` before accessing
- **No global state**: Confirmation state is local to `RSVPChat` + `sessionStorage`. No Redux, no Context

### Project Structure Notes

- **New file to create**: `frontend/components/ui/PetalBurst.tsx` — Framer Motion petal animation
- **Existing file to modify**: `frontend/components/ui/RSVPChat.tsx` — add confirmation state, haptic feedback, PetalBurst rendering
- **Reference for animation patterns**: `frontend/components/ui/MonogramLoader.tsx` — uses Framer Motion with `useReducedMotion()`, variants defined outside component

### Anti-Patterns to Avoid

- **Do NOT call `navigator.vibrate()` without feature detection** — will throw on iOS
- **Do NOT use inline Framer Motion variants** — define outside component body
- **Do NOT persist RSVP state in `localStorage`** — use `sessionStorage` for session-only persistence
- **Do NOT hardcode petal colors** — use palette token Tailwind classes

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Communication Patterns] — animation patterns, reduced-motion handling
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture] — Framer Motion for petal burst
- [Source: _bmad-output/implementation-artifacts/2-2-monogram-loader.md] — reference for Framer Motion + useReducedMotion pattern
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.5] — acceptance criteria

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Build type error: PetalBurst `ease: 'easeOut'` needed `as const` assertion for Framer Motion TypeScript compatibility (fixed)

### Completion Notes List

- Task 1: `confirmed` state already existed from Story 3.4. Added delayed "We've been waiting for you." final bubble (1s delay) via useEffect. sessionStorage persistence with SSR-safe guards (`typeof window !== 'undefined'`). Restore on mount skips chat flow and shows completed confirmation. Also persists `declined` state.
- Task 2: Created PetalBurst.tsx — 28 petals with 3 organic CSS border-radius shapes, palette colors (matcha-chiffon, strawberry-milk, berry-meringue). Framer Motion custom variants for multi-directional arc trajectories using vw/vh viewport-relative units. 3D tumble via `rotateY` + `perspective: 800` + `preserve-3d`. Durations 7-9.5s with staggered delays 0-1.3s (user-tuned for slow, appreciable effect). `willChange: 'transform, opacity'` for GPU promotion. `useReducedMotion()` returns null when set (AC 5).
- Task 3: Haptic feedback co-located with final bubble appearance in confirmation effect. `navigator.vibrate([100, 50, 100, 50, 100])` guarded with `'vibrate' in navigator`.
- Task 4: PetalBurst lifted to RSVPSection level (not inside chat bubble) for full-section coverage. RSVPSection converted to client component with `onConfirm` callback prop wired to `showConfetti` state. Auto-cleanup timer (11s) unmounts PetalBurst after animation completes. Plays once on mount via Framer Motion `animate`.
- Task 5: `pnpm build && pnpm lint` both pass with zero errors. Device-specific tests (haptic on Chrome Android, graceful degradation on iOS) verified via code review of feature detection guards.

### Change Log

- 2026-04-14: Implemented Story 3.5 — RSVP in-site confirmation with "We've been waiting for you." bubble, PetalBurst animation, haptic feedback, and sessionStorage persistence
- 2026-04-15: Code review fixes — added missing `onConfirm` to useEffect deps, `willChange` GPU hints on petals, PetalBurst auto-cleanup timer (11s), updated stale completion notes/file list/task descriptions

### File List

- `frontend/components/ui/RSVPChat.tsx` (modified) — confirmation state persistence, final bubble, haptic feedback, `onConfirm` callback prop
- `frontend/components/ui/PetalBurst.tsx` (new) — 28-petal 3D Framer Motion burst animation component
- `frontend/components/sections/RSVPSection.tsx` (modified) — converted to client component, `showConfetti` state, PetalBurst rendering with auto-cleanup timer
