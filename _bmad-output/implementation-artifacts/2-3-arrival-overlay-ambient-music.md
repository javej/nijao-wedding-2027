# Story 2.3: Arrival Overlay & Ambient Music

Status: ready-for-dev

## Story

As a **guest**,
I want to be greeted by a full-screen arrival message and hear ambient orchestral music begin when I first interact with the site,
so that the emotional register is set before I read a single word.

## Acceptance Criteria

1. **Given** the monogram loader exits (Story 2.2), **When** the arrival overlay appears, **Then** a full-screen overlay shows the greeting *"Welcome. We're so glad you're here."* in the display typeface (Cormorant Garamond), centered, with appropriate negative space

2. **Given** the guest is on iOS Safari (which blocks audio autoplay), **When** the arrival overlay is visible, **Then** a subtle tap-to-unmute affordance is displayed — styled as part of the ceremony, not a browser permission prompt — and music begins on first tap or scroll

3. **Given** the guest is on Chrome Android or Desktop, **When** the guest performs their first scroll or tap, **Then** ambient orchestral music begins playing at a tasteful volume (not jarring); an `<AudioController>` client component manages playback state

4. **Given** `prefers-reduced-motion` is enabled, **When** the overlay appears and exits, **Then** no fade or slide animation plays — the overlay appears and disappears without motion transitions

5. **And** audio does not auto-play on page load under any browser — it always requires a user gesture first (NFR-A7)

## Tasks / Subtasks

- [ ] Task 1: Create ArrivalOverlay component (AC: 1, 4)
  - [ ] 1.1 Create `frontend/components/ui/ArrivalOverlay.tsx` as a `'use client'` component (needs to manage dismiss state and respond to user gestures)
  - [ ] 1.2 Full-screen overlay: `fixed inset-0 z-40` (below MonogramLoader's z-50, above scroll content)
  - [ ] 1.3 Background: warm off-white (`bg-background` / `#faf9f6`) or a palette-appropriate treatment — NOT the dark monogram background
  - [ ] 1.4 Center the greeting text: *"Welcome. We're so glad you're here."* using `font-display` (Cormorant Garamond), size `--text-display-lg` or `--text-display-md`, weight 300 (light)
  - [ ] 1.5 Use generous negative space — the UX spec mandates "radical negative space" and the greeting should breathe. No decorative elements, no images — pure typography
  - [ ] 1.6 Overlay dismisses on first scroll gesture or tap — the guest's first interaction advances them to the hero section
  - [ ] 1.7 After dismiss, overlay fades out (Framer Motion `AnimatePresence`) and unmounts
  - [ ] 1.8 **Reduced motion:** When `useReducedMotion()` returns true, overlay appears and disappears instantly — no fade/slide transitions

- [ ] Task 2: Create AudioController client component (AC: 2, 3, 5)
  - [ ] 2.1 Create `frontend/components/ui/AudioController.tsx` with `'use client'` directive
  - [ ] 2.2 Manage audio playback state: `isPlaying`, `isMuted`, `hasUserInteracted`
  - [ ] 2.3 Use the Web Audio API or a simple `<audio>` element — keep it simple. An `<audio>` element with `preload="auto"` and no `autoplay` attribute is sufficient
  - [ ] 2.4 **Critical: audio must NEVER auto-play.** Only start playback after a user gesture event (click, tap, scroll). This is both a UX requirement and a browser policy requirement (NFR-A7)
  - [ ] 2.5 Audio source: an ambient orchestral loop file. Store in `frontend/public/audio/` (e.g., `ambient.mp3`). File must be lightweight — target < 500KB for the loop segment
  - [ ] 2.6 Playback volume: start at a tasteful level (0.3–0.5 range) — not jarring. The UX says "ambient", not "announcement"
  - [ ] 2.7 Loop the audio continuously — it's ambient background for the entire scroll experience
  - [ ] 2.8 Provide a minimal mute/unmute toggle — positioned unobtrusively (e.g., bottom-left, small icon). The toggle should use palette colors and feel designed, not utilitarian

- [ ] Task 3: iOS Safari tap-to-unmute affordance (AC: 2)
  - [ ] 3.1 Detect iOS Safari context (or more broadly: detect when audio playback requires a user gesture — which is all browsers, but iOS is the most restrictive)
  - [ ] 3.2 On the arrival overlay, show a subtle tap-to-unmute affordance — a small icon or text hint like a musical note icon + "tap to begin" styled in the display typeface
  - [ ] 3.3 **Critical:** This must feel ceremonial, NOT like a browser permission prompt. It's part of the experience design, not a technical workaround
  - [ ] 3.4 On first tap: start audio playback AND dismiss the overlay simultaneously — one gesture does both
  - [ ] 3.5 On first scroll (if guest scrolls instead of tapping): start audio playback AND dismiss overlay — scroll is also a valid first gesture

- [ ] Task 4: Wire overlay and audio into page sequence (AC: 1, 3)
  - [ ] 4.1 The page render sequence is: MonogramLoader (z-50) → ArrivalOverlay (z-40) → ChapterScrollContainer (z-0)
  - [ ] 4.2 ArrivalOverlay appears after MonogramLoader exits — use a state flag passed from MonogramLoader's `onComplete` callback
  - [ ] 4.3 AudioController renders persistently (not inside the overlay) so music continues after the overlay dismisses. Position the mute toggle as a fixed element
  - [ ] 4.4 After overlay dismisses, the scroll experience starts — body scroll is unlocked (if it was locked during monogram + overlay sequence)
  - [ ] 4.5 Coordinate the body scroll lock: locked during monogram (Story 2.2) → locked during overlay → unlocked when overlay dismisses

- [ ] Task 5: Audio file placeholder (AC: 3)
  - [ ] 5.1 Source or create a placeholder ambient orchestral audio file. If the final audio isn't available, use a royalty-free ambient loop that demonstrates the feature
  - [ ] 5.2 Store at `frontend/public/audio/ambient.mp3`
  - [ ] 5.3 Keep file size reasonable — compress to ~300-500KB for the loop. The audio loads after the monogram, so it has time to preload
  - [ ] 5.4 Flag for later: replace with the final audio file when available

- [ ] Task 6: Verification (AC: 1-5)
  - [ ] 6.1 Test on iOS Safari: overlay shows, tap-to-unmute visible, music starts on tap, overlay dismisses
  - [ ] 6.2 Test on Chrome Android: overlay shows, music starts on first scroll/tap
  - [ ] 6.3 Test on Chrome Desktop: overlay shows, music starts on first scroll/click
  - [ ] 6.4 Verify audio never auto-plays on any browser — load page, wait, confirm silence
  - [ ] 6.5 Test with `prefers-reduced-motion`: overlay appears/disappears instantly, no transitions
  - [ ] 6.6 Run `pnpm build` and `pnpm lint` — zero errors

## Dev Notes

### Architecture Compliance

- Both `ArrivalOverlay` and `AudioController` are **Client Components** — they manage user interaction state and browser APIs
- `AudioController` is listed explicitly in the architecture component split [Source: architecture.md → Component split]
- Animation: use Framer Motion for overlay fade-in/out; use `useReducedMotion()` for reduced-motion check
- Framer Motion variants defined outside component (architecture pattern)
- State: local `useState` only — no global state manager needed
- Props to client components must be serializable

### Key Technical Decisions

- **`<audio>` element over Web Audio API** — simpler, sufficient for ambient playback. Web Audio API adds complexity without benefit for a single ambient loop
- **User gesture requirement is universal** — all modern browsers require a user gesture for audio. The iOS affordance is the most visible case, but the code should handle all browsers uniformly
- **Single gesture for overlay + audio** — the first tap/scroll does two things: starts music AND dismisses overlay. Don't require two separate interactions
- **Audio preloading** — use `preload="auto"` on the `<audio>` element so the file loads during the monogram animation. By the time the overlay appears, audio should be ready
- **Mute toggle persists** — the toggle stays visible after the overlay dismisses, allowing guests to mute/unmute at any point during the scroll

### UX Context

- The overlay greeting is the **digital lobby** — Aman hospitality north star. It must feel like arriving at a venue, not opening an app
- "Welcome. We're so glad you're here." — this exact copy. No variations, no dynamic text in this story. Personalized greeting ("Welcome, Karen") is Story 3.2
- The tap-to-unmute must feel **ceremonial** — think of it as the usher inviting you to sit, not a cookie banner
- Music volume must be **ambient** — guests should barely notice it starting. Jarring volume is a trust-breaker
- UX spec: "single cello note begins" during monogram → full ambient orchestral begins on overlay interaction. The exact audio treatment should match this vision

### Previous Story Dependencies

- **Story 2.1 (Scroll Architecture):** ChapterScrollContainer must be in place — the overlay sits above it
- **Story 2.2 (Monogram Loader):** MonogramLoader must complete before overlay appears — sequence coordination required. The MonogramLoader should expose an `onComplete` callback or the page should manage the sequence state

### Project Structure Notes

New files:
```
frontend/components/ui/ArrivalOverlay.tsx    (client component — greeting overlay)
frontend/components/ui/AudioController.tsx   (client component — ambient music)
frontend/public/audio/ambient.mp3            (placeholder audio file)
```

Modified files:
```
frontend/app/(main)/page.tsx   (add ArrivalOverlay + AudioController, manage sequence state)
```

### What This Story Does NOT Do

- Does NOT implement the personalized name greeting ("Welcome, Karen") — that's Story 3.2
- Does NOT implement the hero section content — that's Story 2.4
- Does NOT implement petal burst animation — that's Story 3.x (RSVP confirmation)
- Does NOT implement the floating anchor set — that's Story 3.x

### References

- Architecture: Component split → AudioController as client island [Source: `_bmad-output/planning-artifacts/architecture.md` → Frontend Architecture]
- Architecture: Communication Patterns → useReducedMotion, variants outside component [Source: `_bmad-output/planning-artifacts/architecture.md` → Communication Patterns]
- UX Design: Experience Mechanics → "arrival overlay: Welcome. We're so glad you're here." [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Experience Mechanics]
- UX Design: Critical Success Moments → "First 10 seconds sets entire emotional register" [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Critical Success Moments]
- UX Design: Anti-Patterns → "Auto-playing music without consent signal" [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Anti-Patterns]
- UX Design: iOS tap-to-unmute → "must feel ceremonial — not a browser permission prompt" [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Key Design Challenges]
- NFR-A7: iOS Safari audio autoplay handled gracefully [Source: `_bmad-output/planning-artifacts/epics.md` → NFR-A7]
- Epics: Story 2.3 acceptance criteria [Source: `_bmad-output/planning-artifacts/epics.md` → Story 2.3]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
