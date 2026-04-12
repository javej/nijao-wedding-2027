# Story 2.10: Accessibility Verification

Status: ready-for-dev

## Story

As a **guest with accessibility needs**,
I want the full site experience to be navigable via keyboard and readable by a screen reader,
so that no guest is excluded from experiencing the site regardless of how they access the web.

## Acceptance Criteria

1. **Given** the full site is rendered (all Epic 2 stories complete), **When** a keyboard-only user tabs through the page, **Then** focus moves in logical reading order through all chapters; each interactive element has a visible focus indicator; no focus traps exist outside the RSVP flow

2. **Given** a screen reader (VoiceOver iOS or TalkBack Android) navigates the page, **When** reading through all content chapters, **Then** all sections have semantic headings (`<h1>` for site title, `<h2>` per chapter), all images have descriptive `alt` text, and all content is announced in logical order

3. **Given** `prefers-reduced-motion` is enabled at the OS level, **When** the full site renders and the guest scrolls through all chapters, **Then** no chapter entry animations play — snap-scroll still functions, but all Framer Motion and CSS transition effects are suppressed

4. **Given** the guest is on a 375px wide viewport (iPhone SE), **When** navigating all Epic 2 sections, **Then** no section requires horizontal scrolling, no text is below 16px, and all content is fully legible

5. **And** all text in all sections meets WCAG 2.1 AA 4.5:1 contrast ratio against its background across all used palette color combinations — verified manually or with a contrast checker

## Tasks / Subtasks

- [ ] Task 1: Keyboard navigation audit (AC: 1)
  - [ ] 1.1 Navigate the entire site using only Tab, Shift+Tab, Enter, Space, and arrow keys
  - [ ] 1.2 Verify focus order follows visual reading order: Monogram → Overlay → Hero → Story chapters → Proposal → Wedding Details → Dress Code → Entourage
  - [ ] 1.3 Check every interactive element has a **visible focus indicator** — the default browser outline or a custom focus ring using palette colors. Use Tailwind's `focus-visible:ring-2 focus-visible:ring-raspberry` pattern
  - [ ] 1.4 Verify no focus traps exist — Tab should move through the entire page without getting stuck. Note: the RSVP flow (Epic 3) may intentionally trap focus, but that's out of scope for this story
  - [ ] 1.5 Check the MonogramLoader: when the loader is active, focus should be contained (or the loader should not be focusable). When it exits, focus should move to the main content
  - [ ] 1.6 Check the ArrivalOverlay: dismissible via keyboard (Enter or Escape). After dismiss, focus moves to the first chapter
  - [ ] 1.7 Check the AudioController mute toggle: focusable and operable via keyboard (Enter/Space)
  - [ ] 1.8 **Fix any issues found** — this is a remediation story, not just an audit

- [ ] Task 2: Screen reader audit (AC: 2)
  - [ ] 2.1 Test with VoiceOver on iOS Safari (or macOS Safari as proxy) and/or TalkBack on Android Chrome
  - [ ] 2.2 Verify heading hierarchy:
    - `<h1>`: site title (couple's names) — exactly one per page
    - `<h2>`: each chapter section (Hero, "2017", "2018", ..., "Proposal", "Wedding Details", "Dress Code", "Entourage")
    - `<h3>`: sub-sections (Ceremony/Reception within Wedding Details, Padrino Wall/Wedding Party within Entourage)
  - [ ] 2.3 Verify all images have descriptive `alt` text:
    - Story chapter images: alt text from Sanity `image.alt` field
    - Inspiration images (dress code): alt text from Sanity
    - Padrino photos: alt text (e.g., "Photo of [name]") or from Sanity field
    - Decorative images (if any): `alt=""` with `aria-hidden="true"`
  - [ ] 2.4 Verify content is announced in logical order — the screen reader should narrate the site in the same sequence as the visual scroll
  - [ ] 2.5 Verify `aria-label` attributes on `<section>` elements are descriptive and not redundant with headings
  - [ ] 2.6 **Fix any issues found**

- [ ] Task 3: prefers-reduced-motion audit (AC: 3)
  - [ ] 3.1 Enable `prefers-reduced-motion: reduce` in the OS or browser DevTools
  - [ ] 3.2 Load the site and verify:
    - MonogramLoader: `.jn` appears instantly, no draw-on animation, exits immediately (Story 2.2)
    - ArrivalOverlay: appears and disappears without fade/slide (Story 2.3)
    - Chapter transitions: snap-scroll still works, but no entry animations play
    - All CSS `transition` and `animation` properties are suppressed
  - [ ] 3.3 Verify Framer Motion's `useReducedMotion()` is used in all animated client components:
    - `MonogramLoader.tsx` — must check reduced motion
    - `ArrivalOverlay.tsx` — must check reduced motion
    - Any other component using Framer Motion
  - [ ] 3.4 Check CSS: any `@media (prefers-reduced-motion: reduce)` rules are correctly applied
  - [ ] 3.5 **Fix any issues found**

- [ ] Task 4: Responsive design audit at 375px (AC: 4)
  - [ ] 4.1 Set viewport to 375px width (iPhone SE) in browser DevTools
  - [ ] 4.2 Scroll through every chapter and verify:
    - No horizontal scrollbar appears on any section
    - No text is truncated or clipped
    - No content extends beyond the viewport width
    - All images fit within the viewport
  - [ ] 4.3 Verify no text is below 16px — inspect computed font sizes on all text elements
  - [ ] 4.4 Verify touch targets (mute button, any interactive elements): minimum 44x44px (NFR-A3)
  - [ ] 4.5 Test at 412px (mid-range Android) and 768px (tablet) as well
  - [ ] 4.6 **Fix any issues found**

- [ ] Task 5: Color contrast audit (AC: 5)
  - [ ] 5.1 Check every text-on-background combination used in the site against WCAG 2.1 AA requirements (4.5:1 for normal text, 3:1 for large text):
    | Combination | Verify |
    |---|---|
    | Body text on warm off-white (`#faf9f6`) | Must be ≥ 4.5:1 |
    | Display text on warm off-white | Must be ≥ 3:1 (large text) |
    | Text on Deep Matcha background | Check if used |
    | Text on Raspberry background | Check if used |
    | Text on palette card backgrounds (Padrino Wall) | Must be ≥ 4.5:1 |
    | Dress code swatch labels | Must be readable |
    | Left-edge accent borders | Not text — decorative, but verify visibility |
  - [ ] 5.2 Use a contrast checker tool (e.g., WebAIM Contrast Checker, browser DevTools accessibility panel)
  - [ ] 5.3 Pay special attention to lighter palette colors as backgrounds:
    - Matcha Chiffon (`#b2bf93`) — light green, may need dark text
    - Matcha Latte (`#9fc768`) — bright green, likely needs dark text
    - Strawberry Milk (`#e8bcbc`) — light pink, needs dark text
    - Berry Meringue (`#c98d8e`) — medium pink, check both dark and light text
    - Golden Matcha (`#baaf2f`) — yellow-green, likely needs dark text
  - [ ] 5.4 **Fix any failing combinations** — adjust text color (use `--color-text-on-light` or `--color-text-on-dark` as appropriate)

- [ ] Task 6: Final verification (AC: 1-5)
  - [ ] 6.1 After all fixes applied, run through the complete audit once more
  - [ ] 6.2 Run `pnpm build` and `pnpm lint` — zero errors
  - [ ] 6.3 Document any known limitations or areas that need future attention (e.g., "TalkBack testing deferred to device lab")
  - [ ] 6.4 Add accessibility audit notes to the PR description

## Dev Notes

### Architecture Compliance

- This is a **cross-cutting verification story** — it doesn't create new components, it audits and fixes the existing Epic 2 implementation
- All fixes must follow existing architecture patterns: CSS token classes, `cn()` for classNames, `useReducedMotion()` for Framer Motion components
- Focus management: use standard HTML focus behavior + CSS `focus-visible` pseudo-class — no custom JavaScript focus management unless absolutely necessary
- NFR-A1: WCAG 2.1 AA compliance across all guest-facing sections [Source: architecture.md → Cross-Cutting Concerns]

### Key Technical Decisions

- **`focus-visible` not `focus`** — `focus-visible` shows focus rings only for keyboard navigation, not mouse clicks. This preserves the cinematic aesthetic for mouse users while maintaining keyboard accessibility
- **Focus ring color** — use Raspberry (`ring-raspberry`) for consistency with the primary color. On dark backgrounds, use a lighter ring color
- **Heading hierarchy is critical** — screen reader users navigate by headings. If the heading hierarchy is wrong, the site is unusable for them. One `<h1>`, `<h2>` per chapter, `<h3>` for sub-sections. No skipping levels
- **alt text sourcing** — Sanity image fields include an `alt` property. The story chapter schema (Story 1.3) defined `image` as image type with `alt`. Ensure all components pass through the `alt` text from Sanity data
- **This story is blocked by Stories 2.1–2.9** — all content sections must be complete before the accessibility audit can be comprehensive

### UX Context

- Accessibility is not a post-build afterthought — the PRD explicitly requires FR32 (keyboard navigation), FR33 (screen reader), FR34 (reduced motion), FR35 (375px+ full experience)
- UX spec: "Graceful degradation, never graceless failure" — accessibility failures are ungraceful failures
- Guest persona Tita Cora: senior family member on iPhone SE — the 375px + large text requirements are for real users in the guest list
- The monogram, music, and scroll animations are the highest-risk areas for accessibility — they must have complete fallbacks

### NFR Compliance Checklist

- [ ] NFR-A1: WCAG 2.1 AA compliance across all guest-facing sections
- [ ] NFR-A2: All text meets 4.5:1 contrast ratio across all 8 palette colors
- [ ] NFR-A3: All interactive elements have minimum 44x44px touch target
- [ ] NFR-A4: All animations respect `prefers-reduced-motion`
- [ ] NFR-A5: No text below 16px on mobile; layout intact with increased system font size
- [ ] NFR-A6: Full site navigable via keyboard; focus order follows visual reading order
- [ ] NFR-A7: iOS Safari audio autoplay handled gracefully (verified in Story 2.3, reconfirmed here)

### Previous Story Dependencies

- **All of Stories 2.1–2.9 must be complete** before this story can be fully executed
- This story should be the **last story** in Epic 2 — it's the quality gate

### Project Structure Notes

No new files expected — this story modifies existing components to fix accessibility issues.

Modified files (as needed based on audit findings):
```
frontend/components/ui/ChapterScrollContainer.tsx   (focus management, reduced-motion)
frontend/components/ui/MonogramLoader.tsx            (reduced-motion, focus)
frontend/components/ui/ArrivalOverlay.tsx            (keyboard dismiss, focus)
frontend/components/ui/AudioController.tsx           (keyboard operability, touch target)
frontend/components/sections/HeroSection.tsx         (heading hierarchy, contrast)
frontend/components/sections/StoryChapter.tsx        (alt text, heading, contrast)
frontend/components/sections/ProposalSection.tsx     (heading, contrast)
frontend/components/sections/WeddingDetails.tsx      (heading hierarchy, contrast)
frontend/components/sections/DressCodeSection.tsx    (swatch contrast, labels)
frontend/components/sections/EntourageSection.tsx    (card contrast, alt text)
frontend/app/globals.css                             (focus-visible styles, reduced-motion rules)
```

### What This Story Does NOT Do

- Does NOT audit the RSVP flow (Epic 3) — that's a separate story
- Does NOT audit Sanity Studio accessibility — Studio is admin-only, not guest-facing
- Does NOT add automated accessibility testing (e.g., axe-core, jest-axe) — manual audit is sufficient for this project scope
- Does NOT implement skip-to-content links (the scroll architecture makes this less relevant, but could be added if the audit reveals a need)

### References

- Epics: FR32 (keyboard navigation), FR33 (screen reader), FR34 (reduced-motion), FR35 (375px+) [Source: `_bmad-output/planning-artifacts/epics.md` → FR Coverage Map]
- Epics: NFR-A1 through NFR-A7 [Source: `_bmad-output/planning-artifacts/epics.md` → NonFunctional Requirements → Accessibility]
- Architecture: Cross-Cutting Concerns → "WCAG 2.1 AA across animated sections" [Source: `_bmad-output/planning-artifacts/architecture.md` → Cross-Cutting Concerns]
- Architecture: Animation → "always check reduced-motion at component level" [Source: `_bmad-output/planning-artifacts/architecture.md` → Communication Patterns]
- UX Design: Experience Principles → "Graceful degradation, never graceless failure" [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Experience Principles]
- UX Design: Responsive → "Mobile-first at 390px; minimum 375px" [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Responsive Design]
- Epics: Story 2.10 acceptance criteria [Source: `_bmad-output/planning-artifacts/epics.md` → Story 2.10]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
