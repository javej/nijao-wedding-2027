---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-epic1, step-03-epic2, step-03-epic3, step-03-epic4, step-04-final-validation]
status: complete
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# nijao-wedding-2027 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for nijao-wedding-2027, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Guest Experience & Navigation**

- FR1: A guest can experience a full-screen monogram draw-on animation as the first interaction upon site load
- FR2: A guest can hear ambient orchestral music that begins on first user interaction (scroll or tap)
- FR3: A guest can see a full-screen arrival overlay greeting them upon entering the site
- FR4: A guest can navigate the site exclusively by vertical scrolling, with chapters locking into place sequentially
- FR5: A guest can identify their current position in the site via section-specific palette color accents, without a navigation menu
- FR6: A guest can access a minimal floating anchor set (Wedding Details, Dress Code, RSVP) after completing their first full scroll-through
- FR7: A guest with a personalized link is greeted by name upon arrival

**Love Story & Content**

- FR8: A guest can read the 10-year love story presented as scroll-locked chapters (one image, one caption per year, 2017–2027)
- FR9: A guest can experience the Mt. Fuji proposal as a dedicated story section
- FR10: A guest can view ceremony details (church, date, time, location)
- FR11: A guest can view reception details (venue name, address, date, time)
- FR12: A guest can view dress code guidance presented in the wedding palette
- FR13: A guest can view the Digital Padrino Wall — ninongs and ninangs listed with their assigned palette color cards
- FR14: A guest can view the full wedding party / entourage list

**RSVP & Guest Hospitality**

- FR15: A guest can submit an RSVP through a conversational chat-bubble interface
- FR16: A guest can specify a plus-one within the RSVP flow only if their personalized link is pre-designated as plus-one eligible — guests without eligibility do not see the plus-one prompt
- FR16a: An admin can designate plus-one eligibility per guest when managing the guest list
- FR18: A guest receives an in-site confirmation message upon RSVP submission
- FR19: A guest receives a confirmation email upon RSVP submission
- FR20: A guest's RSVP submission is recorded in real time to a shared Google Sheet

**Personalization & Links**

- FR21: An admin can generate a unique personalized URL for each guest
- FR22: The system can identify a guest by their unique URL and display their name in the arrival greeting
- FR23: A guest's first-visit completion status is stored locally so return visits surface the floating anchor set

**Admin — Content Management**

- FR24: An admin can create, edit, and publish all site content sections (hero, story chapters, wedding details, entourage, announcements) without writing code
- FR25: An admin can upload and manage photos and images for all content sections
- FR26: An admin can toggle individual content sections between draft and published states
- FR27: An admin can publish a new announcement and have it appear on the site within 10 seconds
- FR28: An admin can schedule content to publish at a future date and time

**Admin — RSVP & Guest Management**

- FR29: An admin can view a live RSVP dashboard showing current headcount and individual responses
- FR30: An admin can export the complete RSVP list (guest name, attending, plus-one, timestamp) for the caterer
- FR31: An admin can view and manage the full guest list and their personalized link assignments

**Accessibility & Inclusive Design**

- FR32: A guest using keyboard-only navigation can traverse all chapters and complete the RSVP
- FR33: A guest using a screen reader can access all content sections with appropriate semantic structure and labels
- FR34: A guest with motion sensitivity can experience the site with animations disabled, respecting their OS preference
- FR35: A guest on a small screen (375px+) can access the full site experience without horizontal scrolling or truncated content

**System & Integration**

- FR36: The system sends a transactional confirmation email to the guest within 60 seconds of RSVP submission
- FR37: The system appends an RSVP response row to Google Sheets within 5 seconds of submission
- FR38: The system revalidates and republishes affected pages within 10 seconds of a Sanity content publish event
- FR39: The system protects the RSVP form from automated spam submissions
- FR40: The system serves a messaging app link preview (title, description) when the URL is shared on Viber or WhatsApp

### NonFunctional Requirements

**Performance**

- NFR-P1: LCP < 2.5s on simulated Philippine LTE, mid-range Android (Lighthouse throttled mobile)
- NFR-P2: CLS < 0.1 across all sections, including snap-scroll transitions
- NFR-P3: INP < 200ms for all RSVP chat interactions
- NFR-P4: Lighthouse mobile performance score ≥ 90 on production build
- NFR-P5: Initial JS bundle < 300KB; content pages ship zero client-side JS via React Server Components
- NFR-P6: Monogram draw-on animation begins within 1.5s of page load on target network
- NFR-P7: Total page weight (HTML + CSS + critical JS) < 100KB before images

**Security**

- NFR-S1: All secrets (Sanity token, Google Service Account credentials, Resend API key) stored as environment variables — never committed to the repository
- NFR-S2: Sanity webhook payloads validated via HMAC-SHA256 signature before triggering page revalidation
- NFR-S3: RSVP form protected against automated spam (Cloudflare Turnstile or honeypot field)
- NFR-S4: All traffic served over HTTPS — enforced by Vercel on all deployments including previews
- NFR-S5: Sanity content API accessed server-side only via read-only token — no API credentials exposed to the browser
- NFR-S6: Admin Sanity Studio access requires authenticated login — not publicly accessible without credentials
- NFR-S7: Guest personal data (name, RSVP response) stored only in Google Sheets — no persistent database exposed to the internet

**Accessibility**

- NFR-A1: WCAG 2.1 AA compliance across all guest-facing sections
- NFR-A2: All text meets minimum 4.5:1 contrast ratio against its background across all 8 palette colors
- NFR-A3: All interactive elements have a minimum touch target of 44×44px
- NFR-A4: All animations and scroll effects respect `prefers-reduced-motion` — disabled when user OS preference is set
- NFR-A5: No text below 16px on mobile; layout does not break when system font size is increased
- NFR-A6: Full site navigable via keyboard; focus order follows visual reading order through chapters
- NFR-A7: iOS Safari audio autoplay restriction handled gracefully — music never auto-plays without user gesture

**Integration**

- NFR-I1: RSVP submission → Google Sheets row appears within 5 seconds under normal network conditions
- NFR-I2: RSVP submission → confirmation email delivered to guest within 60 seconds
- NFR-I3: Sanity content publish → site revalidation and updated page live within 10 seconds via webhook + ISR
- NFR-I4: Google Sheets integration handles API failures gracefully — RSVP submission must not silently fail; guest receives error feedback if the row cannot be written
- NFR-I5: Resend email failures are logged and retried — guest submission is not blocked by email delivery failure

**Reliability**

- NFR-R1: Site uptime ≥ 99.99% on wedding day, January 8, 2027 (Vercel SLA)
- NFR-R2: Static content pages served from CDN edge — no origin server dependency for guest-facing reads
- NFR-R3: RSVP form remains functional during Sanity outages — form submission does not depend on CMS availability
- NFR-R4: Site functions correctly under simultaneous access by all ~100 invited guests

### Additional Requirements

**From Architecture — Starter Template:**

- Project must be initialized from `serge-0v/next-js-sanity-starter` v2.0.0 (Next.js 16 + Tailwind v4 + shadcn/ui + Sanity pre-wired as pnpm monorepo). This is Epic 1, Story 1.
- Initialization command: `git clone https://github.com/serge-0v/next-js-sanity-starter nijao-wedding-2027 && pnpm install`
- Monorepo structure: `frontend/` (Next.js 16) + `studio/` (Sanity Studio) as separate pnpm workspaces — Studio is NOT embedded in the Next.js app
- Run commands: `pnpm --filter frontend dev` (Next.js), `pnpm --filter studio dev` (Studio)
- Package manager is **pnpm** throughout — never commit `package-lock.json` or `yarn.lock`

**From Architecture — Design Token Layer:**

- 8 named palette colors defined as CSS custom properties in `frontend/app/globals.css` via Tailwind v4 `@theme {}` block before any component is built (`--color-deep-matcha`, `--color-raspberry`, `--color-golden-matcha`, `--color-strawberry-jam`, `--color-matcha-chiffon`, `--color-berry-meringue`, `--color-matcha-latte`, `--color-strawberry-milk`) — Tailwind v4 auto-generates utility classes from `@theme` variables; `tailwind.config.ts` is NOT used for tokens
- Animation durations and shadows also defined as CSS custom properties in `globals.css`
- No hardcoded hex values in any component — always use token-based Tailwind classes
- Typography: Cormorant Garamond (display, 300/400/600) + DM Sans (body/UI, 400/500), self-hosted via `next/font`

**From Architecture — Component & Rendering Strategy:**

- RSC-first: all content sections are Server Components; only interactive islands are Client Components
- Client Component islands: `<MonogramLoader>`, `<ChapterScrollContainer>`, `<RSVPChat>`, `<FloatingAnchorSet>`, `<AudioController>`, `<PetalBurst>`
- Animation library: **Framer Motion** (not GSAP) — used only for monogram, petal burst, and chat bubble reveals; CSS-first for all scroll and chapter transitions
- `<ChapterScrollContainer>` must be built and cross-browser tested before any other section is built

**From Architecture — Sanity Schema:**

- Document types: `storyChapter`, `entourageMember`, `guest`, `announcement` (camelCase singular, no snake_case)
- Field names: camelCase — `firstName`, `plusOneEligible`, `publishedAt`, `colorAssignment`
- `guest` schema must exist before `[guest-slug]` routing can be implemented

**From Architecture — RSVP & Integrations:**

- RSVP submitted via Next.js Server Action (`app/actions/submitRsvp.ts`)
- Flow: Turnstile token validation → Google Sheets write → Resend email dispatch → return `{ success: boolean; error?: string }`
- Google Sheets failure: queue payload in `localStorage`, retry silently on reconnect; guest always sees confirmation
- Resend failure: log server-side (Vercel logs); do not block guest submission
- Sanity webhook at `POST /api/revalidate`: HMAC-SHA256 signature validation before calling `revalidatePath()`

**From Architecture — Infrastructure:**

- Hosting: Vercel Hobby (free, non-commercial)
- CI/CD: GitHub → Vercel auto-deploy on `main`; preview deployments on every branch for device testing
- Custom domain configured in Vercel project settings
- Environment variables: `SANITY_API_READ_TOKEN`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `RESEND_API_KEY`, `SANITY_WEBHOOK_SECRET`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

**From UX Design — Interaction & Tone:**

- No navigation menu at any time on first visit — scroll-only experience is the architecture
- Floating anchor set (Wedding Details, Dress Code, RSVP) revealed only after guest reaches RSVP for the first time; state stored in `localStorage` (`firstScrollComplete: boolean`)
- RSVP chat prompts must use plain language, warm but not saccharine tone; accepts natural language (e.g., "oo" = yes in Filipino)
- iOS tap-to-unmute affordance must feel ceremonial — not a browser permission prompt
- Monogram draw-on must complete in < 2 seconds
- `prefers-reduced-motion`: all animations (monogram, scroll, petal burst, floating anchor) disabled when OS preference is set

**From UX Design — Responsive Design:**

- Mobile-first designed at 390px; minimum supported width 375px
- Breakpoints: 375px (iPhone SE), 390px (primary), 412px (mid-range Android), 768px (tablet), 1024px (desktop)
- Floating anchors positioned bottom-right; never overlap content; use palette color of current section

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 2 | Monogram draw-on animation |
| FR2 | Epic 2 | Ambient music, tap-to-unmute |
| FR3 | Epic 2 | Arrival overlay |
| FR4 | Epic 2 | Scroll-locked chapter architecture |
| FR5 | Epic 2 | Palette-as-wayfinding |
| FR6 | Epic 3 | Floating anchor set (post first-scroll) |
| FR7 | Epic 3 | Personalized name greeting |
| FR8 | Epic 2 | 10-year love story chapters |
| FR9 | Epic 2 | Mt. Fuji proposal section |
| FR10 | Epic 2 | Ceremony details |
| FR11 | Epic 2 | Reception details |
| FR12 | Epic 2 | Dress code section |
| FR13 | Epic 2 | Digital Padrino Wall |
| FR14 | Epic 2 | Full wedding party / entourage list |
| FR15 | Epic 3 | Conversational RSVP |
| FR16 | Epic 3 | Plus-one eligibility gate |
| FR16a | Epic 4 | Admin sets plus-one eligibility |
| FR18 | Epic 3 | In-site RSVP confirmation |
| FR19 | Epic 3 | Confirmation email via Resend |
| FR20 | Epic 3 | RSVP → Google Sheets |
| FR21 | Epic 3 | Admin generates personalized URLs |
| FR22 | Epic 3 | Guest identity resolution from slug |
| FR23 | Epic 3 | First-visit state in localStorage |
| FR24 | Epic 4 | Content CRUD in Sanity Studio |
| FR25 | Epic 4 | Photo/image management |
| FR26 | Epic 4 | Draft/published toggle |
| FR27 | Epic 4 | Publish announcement < 10s |
| FR28 | Epic 4 | Scheduled content |
| FR29 | Epic 4 | RSVP dashboard (live headcount) |
| FR30 | Epic 4 | RSVP list export for caterer |
| FR31 | Epic 4 | Guest list & link management |
| FR32 | Epic 2 | Keyboard navigation |
| FR33 | Epic 2 | Screen reader support |
| FR34 | Epic 2 | prefers-reduced-motion |
| FR35 | Epic 2 | 375px+ full experience |
| FR36 | Epic 3 | Email delivery within 60s |
| FR37 | Epic 3 | Google Sheets row within 5s |
| FR38 | Epic 4 | Webhook + ISR < 10s |
| FR39 | Epic 3 | Spam protection (Turnstile) |
| FR40 | Epic 3 | Messaging app link preview |

## Epic List

### Epic 1: Foundation — Live Deployable Shell
The project is bootstrapped from the starter template, deployed to Vercel at a custom domain, with the design system (8 palette colors + typography), Sanity schemas, and CI/CD pipeline all in place. Every subsequent commit produces a preview URL testable on real devices.
**FRs covered:** None directly — satisfies NFR-S1, NFR-S4, NFR-R1, NFR-R2, NFR-R4
**Additional requirements:** Starter template init, design token layer, Sanity schema definitions, env var structure, pnpm, CI/CD via GitHub → Vercel, custom domain

### Epic 2: The Cinematic Guest Experience
Any guest opening the site can experience the full scroll-locked cinematic journey — from the `.jn` monogram, through ambient music and arrival overlay, across all 10 story years, Mt. Fuji proposal, wedding details, dress code, and the Padrino Wall/entourage. Fully accessible on all target devices.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR32, FR33, FR34, FR35

### Epic 3: Guest Personalization & RSVP
A guest with a personalized link is greeted by name, submits an RSVP through the conversational interface (with eligibility-gated plus-one), receives an in-site confirmation and email within 60 seconds, and their response lands in Google Sheets in real time. Floating anchors appear on return visits. Sharing the URL on Viber/WhatsApp shows a proper preview card.
**FRs covered:** FR6, FR7, FR15, FR16, FR18, FR19, FR20, FR21, FR22, FR23, FR36, FR37, FR39, FR40

### Epic 4: Admin — Content & Guest Management
Nianne can manage all site content through Sanity Studio — editing, publishing, scheduling — with updates live within 10 seconds. She can view the RSVP dashboard, export the guest list for the caterer, and manage personalized link assignments. Jave does not need to touch code.
**FRs covered:** FR16a, FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR31, FR38

---

## Epic 1: Foundation — Live Deployable Shell

The project is bootstrapped from the starter template, deployed to Vercel, with the design system (8 palette colors + typography), Sanity schemas, and CI/CD pipeline all in place. Every commit produces a preview URL testable on real devices.

### Story 1.1: Project Bootstrap & Vercel Deployment

As a **developer**,
I want the project initialized from the `serge-0v/next-js-sanity-starter` and connected to Vercel with CI/CD running,
So that every push to `main` produces a live preview URL testable on real devices.

**Acceptance Criteria:**

**Given** the starter repo is cloned via `git clone https://github.com/serge-0v/next-js-sanity-starter nijao-wedding-2027`
**When** `pnpm install` and `pnpm dev` are run locally
**Then** the Next.js dev server starts without errors (`pnpm --filter frontend dev`) and the default starter UI renders at `localhost:3000`; the Sanity Studio also starts (`pnpm --filter studio dev`), typically at `localhost:3333`

**Given** the repo is pushed to GitHub
**When** it is connected to a Vercel project
**Then** Vercel auto-deploys on every push to `main` and generates a unique preview URL for every branch push

**Given** the Vercel project is configured
**When** environment variable placeholders are added (`SANITY_API_READ_TOKEN`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `RESEND_API_KEY`, `SANITY_WEBHOOK_SECRET`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`) with empty or dummy values
**Then** the build succeeds without missing-env errors and the placeholder structure is documented in `.env.local.example`

**And** no `package-lock.json` or `yarn.lock` file exists — only `pnpm-lock.yaml` is committed

---

### Story 1.2: Design Token System

As a **developer**,
I want all 8 palette colors, typography scale, and animation durations defined as CSS custom properties in `frontend/app/globals.css` via Tailwind v4's `@theme {}` block,
So that no component ever hardcodes a hex value and the full design system is available from the first UI story.

**Acceptance Criteria:**

**Given** the `@theme {}` block in `globals.css` is populated with all palette tokens
**When** a component uses `text-deep-matcha` or `bg-raspberry` (or any of the 8 token classes)
**Then** the correct color renders — no hardcoded hex values in any component file

**Given** the 8 palette colors are defined (`deep-matcha`, `raspberry`, `golden-matcha`, `strawberry-jam`, `matcha-chiffon`, `berry-meringue`, `matcha-latte`, `strawberry-milk`)
**When** the app renders
**Then** all 8 colors are available as both CSS custom properties (`--color-deep-matcha` etc.) and as Tailwind utility classes

**Given** Cormorant Garamond (weights 300/400/600) and DM Sans (weights 400/500) are configured via `next/font`
**When** the app renders
**Then** both fonts load from self-hosted files — no external Google Fonts requests are made (verifiable via browser DevTools Network tab)

**Given** animation duration tokens are defined (`--duration-ceremony`, etc.) and shadow tokens are defined
**When** any animated component references them
**Then** values are sourced from CSS custom properties — no hardcoded `ms` or `px` values for durations/shadows

**And** a minimal token-preview route or component exists (dev-only, can be deleted later) to visually verify all palette colors and type scale render correctly

---

### Story 1.3: Sanity Content Schemas

As a **developer**,
I want all Sanity document types (`storyChapter`, `entourageMember`, `guest`, `announcement`) defined with correct field naming conventions,
So that Sanity Studio is fully set up and Nianne can begin entering content once the site UI is ready.

**Acceptance Criteria:**

**Given** the Sanity schemas are defined in `studio/schemas/` (the standalone Studio pnpm workspace)
**When** Sanity Studio is opened at `localhost:3333` (via `pnpm --filter studio dev`)
**Then** all four document types (`storyChapter`, `entourageMember`, `guest`, `announcement`) appear in the Studio sidebar

**Given** the `guest` schema is defined
**When** a guest document is created in Studio
**Then** it includes fields: `firstName` (string, required), `slug` (slug, required, unique), `plusOneEligible` (boolean, default false), `plusOneType` (string enum: `'linked' | 'open'`, required when `plusOneEligible` is true), `plusOneLinkedGuest` (reference → `guest`, required when `plusOneType` is `'linked'`)

**Given** the `storyChapter` schema is defined
**When** a chapter document is created in Studio
**Then** it includes fields: `year` (number, required), `caption` (text, required), `image` (image with `alt`), `publishedAt` (datetime), `order` (number for sorting)

**Given** the `entourageMember` schema is defined
**When** a member document is created in Studio
**Then** it includes fields: `name` (string, required), `role` (string — e.g., "Ninong", "Ninang", "Best Man"), `colorAssignment` (one of the 8 palette color keys), `photo` (image), `isPadrino` (boolean)

**Given** the `announcement` schema is defined
**When** an announcement document is created in Studio
**Then** it includes fields: `title` (string), `body` (portable text), `publishedAt` (datetime), `scheduledAt` (datetime, optional)

**And** all field names are camelCase — no snake_case anywhere in any schema file

---

### Story 1.4: Production Configuration & Hardening

As a **developer**,
I want all production environment variables configured in Vercel and basic security hardening in place,
So that the site is live at the Vercel-provided URL, ready to receive real guest traffic, without any secrets exposed.

**Acceptance Criteria:**

**Given** all production environment variables are configured in Vercel project settings
**When** the production build runs
**Then** the build succeeds with no missing-env warnings and no secrets appear in the browser bundle (verifiable via `pnpm build` output)

**Given** HTTPS is enforced by Vercel on all deployments
**When** the production URL is accessed
**Then** the connection is always served over HTTPS — no insecure connections possible

**Given** a `robots.txt` file is added to the project
**When** a search engine crawler accesses `/robots.txt`
**Then** it returns `User-agent: * / Disallow: /` — the site is invite-only, not indexed

**And** basic Open Graph meta tags (title, description, wedding date) are present in the root layout so that sharing the Vercel URL on Viber or WhatsApp produces a readable preview card rather than a blank one (supports FR40)

---

## Epic 2: The Cinematic Guest Experience

Any guest opening the site walks the full scroll-locked cinematic journey — monogram, music, arrival overlay, 10-year love story, Mt. Fuji proposal, wedding details, dress code, and entourage. Fully accessible on all target devices. Content served from Sanity.

### Story 2.1: Scroll Architecture & Palette Wayfinding

As a **guest**,
I want to navigate the site by scrolling vertically with chapters snapping into place,
So that the site feels like walking down an aisle — one chapter at a time, effortlessly.

**Acceptance Criteria:**

**Given** the `<ChapterScrollContainer>` client component is implemented with CSS `scroll-snap-type: y mandatory`
**When** a guest scrolls vertically on Chrome Android and Safari iOS (latest 2)
**Then** each chapter snaps cleanly into place — no partial chapters visible, no jank between sections

**Given** each chapter section has a left-edge accent using its assigned palette color token
**When** a guest is viewing any chapter
**Then** the section accent color is visible and correctly maps to that section's palette token (no hardcoded hex values)

**Given** the guest is on a 375px-wide viewport (iPhone SE)
**When** the scroll container renders
**Then** all chapters fit within the viewport width with no horizontal scrolling and no content truncated

**Given** `prefers-reduced-motion` is enabled in the OS
**When** the guest scrolls between chapters
**Then** snap-scroll still functions but any CSS transition/animation on chapter entry is disabled

**And** the scroll container is tested and confirmed working on: Chrome Android (Galaxy mid-range), Safari iOS (iPhone SE + iPhone 14), Chrome Desktop, Safari macOS — with a manual cross-browser test note in the PR before merge

---

### Story 2.2: Monogram Loader

As a **guest**,
I want to see the `.jn` monogram drawing itself on screen as the very first thing I experience,
So that the site opens like a ceremony — not a web page.

**Acceptance Criteria:**

**Given** a guest opens the site
**When** the page loads
**Then** a full-screen monogram loader appears with the `.jn` SVG drawing itself via Framer Motion `pathLength` animation, completing within 2 seconds on a simulated Philippine LTE connection

**Given** the monogram animation completes
**When** the draw-on finishes
**Then** the loader fades out and the main scroll experience is revealed beneath it

**Given** the monogram loader is a `'use client'` component
**When** the page's Server Components render
**Then** no monogram animation code is included in the server-rendered HTML — it hydrates as a client island only

**Given** `prefers-reduced-motion` is enabled
**When** the page loads
**Then** the monogram appears instantly (no draw-on animation) and the loader exits immediately — the guest still sees the `.jn` mark but with no motion

**And** the monogram SVG path is the correct `.jn` ligature as designed — not a placeholder

---

### Story 2.3: Arrival Overlay & Ambient Music

As a **guest**,
I want to be greeted by a full-screen arrival message and hear ambient orchestral music begin when I first interact with the site,
So that the emotional register is set before I read a single word.

**Acceptance Criteria:**

**Given** the monogram loader exits
**When** the arrival overlay appears
**Then** a full-screen overlay shows the greeting *"Welcome. We're so glad you're here."* in the display typeface, centered, with appropriate negative space

**Given** the guest is on iOS Safari (which blocks audio autoplay)
**When** the arrival overlay is visible
**Then** a subtle tap-to-unmute affordance is displayed — styled as part of the ceremony, not a browser permission prompt — and music begins on first tap or scroll

**Given** the guest is on Chrome Android or Desktop
**When** the guest performs their first scroll or tap
**Then** ambient orchestral music begins playing at a tasteful volume (not jarring); an `<AudioController>` client component manages playback state

**Given** `prefers-reduced-motion` is enabled
**When** the overlay appears and exits
**Then** no fade or slide animation plays — the overlay appears and disappears without motion transitions

**And** audio does not auto-play on page load under any browser — it always requires a user gesture first (NFR-A7)

---

### Story 2.4: Hero Section

As a **guest**,
I want to see the hero section with the "Ten years. One more day." tagline as the first content chapter after the arrival overlay,
So that the emotional core of the story is anchored before anything else.

**Acceptance Criteria:**

**Given** the arrival overlay has been dismissed
**When** the first chapter snaps into view
**Then** the hero section displays the couple's names, the tagline *"Ten years. One more day."*, and the wedding date in the display typeface

**Given** the hero section is a Server Component
**When** the page is statically generated
**Then** hero content is rendered in the initial HTML — no client-side fetch required for this section

**Given** the guest is on a 375px viewport
**When** the hero section renders
**Then** all text fits within the viewport, is legible (minimum 16px body, larger for display text), and no content is clipped

**And** all hero text meets WCAG 2.1 AA contrast ratio (4.5:1 minimum) against its background using the defined palette tokens

---

### Story 2.5: 10-Year Love Story Chapters

As a **guest**,
I want to scroll through 10 story chapters — one per year from 2017 to 2027 — each with a photo and a single caption,
So that I feel the weight of a decade of love before I reach the wedding details.

**Acceptance Criteria:**

**Given** story chapters are defined as `storyChapter` documents in Sanity
**When** the page is statically generated
**Then** all published chapters are fetched server-side via GROQ and rendered as Server Components — no client-side Sanity fetch

**Given** chapters are ordered by the `order` field in Sanity
**When** the guest scrolls through the story
**Then** chapters appear in chronological order (2017 → 2027), each snapping into place within `<ChapterScrollContainer>`

**Given** each chapter has an image and a caption
**When** the chapter renders
**Then** the image is served via `next/image` (WebP, lazily loaded, correctly sized per breakpoint) and the caption displays in the display typeface

**Given** a chapter has no published image
**When** it renders
**Then** a palette-colored placeholder fills the image area gracefully — no broken image icon, no layout shift

**Given** the guest is on a 375px viewport
**When** scrolling through chapters
**Then** each chapter fills the full viewport with image and caption visible — no horizontal scroll, no truncated text

**And** each chapter heading (`<h2>` or semantic equivalent) is readable by screen readers and functions as a landmark for keyboard navigation

---

### Story 2.6: Mt. Fuji Proposal Section

As a **guest**,
I want to experience the Mt. Fuji proposal as a dedicated, emotionally distinct chapter in the scroll,
So that the emotional climax of the love story lands with the weight it deserves.

**Acceptance Criteria:**

**Given** the Mt. Fuji proposal section is defined as a dedicated content type or special `storyChapter` variant in Sanity
**When** it renders in the scroll sequence
**Then** it appears as a visually distinct chapter — differentiated from the year chapters by its layout, typography treatment, or palette accent — while remaining within the `<ChapterScrollContainer>` snap architecture

**Given** the proposal section content (photo, text) is managed in Sanity
**When** Nianne updates the text or image in Studio and publishes
**Then** the updated content appears on the static page after the next revalidation (for now: manual `pnpm build`; webhook ISR is Epic 4)

**Given** the guest is on a 375px viewport
**When** the proposal chapter snaps into view
**Then** the full chapter — image and text — is visible without horizontal scroll or truncated content

**And** the proposal chapter has a semantic heading that is accessible to screen readers and distinguishable from the year chapters in the document outline

---

### Story 2.7: Wedding Details — Ceremony & Reception

As a **guest**,
I want to read clear ceremony and reception details in their own scroll chapter,
So that I know exactly when to be where, without asking the couple.

**Acceptance Criteria:**

**Given** ceremony details (church name: St. Therese Parish, date: January 8 2027, time, location) are defined in Sanity
**When** the Wedding Details chapter renders
**Then** all ceremony details are displayed clearly in the scroll chapter

**Given** reception details (venue: Casa 10 22, Lipa Batangas, date, time, address) are defined in Sanity
**When** the Wedding Details chapter renders
**Then** all reception details are displayed in the same chapter, visually distinct from the ceremony block

**Given** the content is managed in Sanity
**When** Nianne updates any detail field and publishes
**Then** the change is reflected on the next build/revalidation — no code change required

**Given** the guest is on a 375px viewport
**When** the Wedding Details chapter snaps into view
**Then** all details are fully readable with no truncation or horizontal scroll

**And** the chapter has a semantic structure (`<h2>` for section, `<h3>` for ceremony/reception sub-sections) navigable by screen readers and keyboard

---

### Story 2.8: Dress Code Section

As a **guest**,
I want to see the dress code presented using the wedding palette,
So that I know what to wear and feel confident about it — without sending the couple a message.

**Acceptance Criteria:**

**Given** dress code content (dress code label, palette guidance, any specific notes) is defined in Sanity
**When** the Dress Code chapter renders
**Then** the dress code instruction is displayed with the relevant palette color swatches or cards as visual references

**Given** the dress code uses palette color tokens
**When** the palette card renders
**Then** colors are rendered via Tailwind token classes — no hardcoded hex values

**Given** the guest is on a 375px viewport
**When** the Dress Code chapter snaps into view
**Then** all palette cards and text are fully visible with no horizontal scroll

**Given** the Sanity dress code content schema includes an optional `inspirationImages` array field (image type with `alt`)
**When** Nianne adds curated dress inspiration photos through Studio
**Then** the UI renders them if present, gracefully omits them if the array is empty — no code change required when she populates it

**And** color-dependent dress code guidance includes a text label alongside any color swatch (e.g., *"Deep Matcha — a dark green"*) so guests with color vision differences are not excluded

---

### Story 2.9: Entourage — Padrino Wall & Wedding Party

As a **guest**,
I want to see the Digital Padrino Wall (ninongs and ninangs with their palette color cards) and the full wedding party list,
So that I know and can celebrate the people standing up for Jave and Nianne.

**Acceptance Criteria:**

**Given** `entourageMember` documents are published in Sanity with `isPadrino: true`
**When** the Padrino Wall section renders
**Then** all published padrinos/madrinas are displayed as palette-colored cards showing their name and role

**Given** each padrino/madrina has a `colorAssignment` field set to one of the 8 palette keys
**When** their card renders
**Then** their card background or accent uses that palette token class — no hardcoded hex

**Given** `entourageMember` documents are published with `isPadrino: false`
**When** the Wedding Party section renders
**Then** all non-padrino entourage members (best man, maid of honor, groomsmen, bridesmaids, etc.) are listed with their name and role

**Given** a new entourage member is published in Sanity
**When** the next build/revalidation occurs
**Then** the new member appears on the live site — Nianne does not need to contact Jave

**Given** the guest is on a 375px viewport
**When** scrolling through the entourage sections
**Then** all cards and list items are fully visible, properly sized, with no horizontal scroll

---

### Story 2.10: Accessibility Verification

As a **guest with accessibility needs**,
I want the full site experience to be navigable via keyboard and readable by a screen reader,
So that no guest is excluded from experiencing the site regardless of how they access the web.

**Acceptance Criteria:**

**Given** the full site is rendered (all Epic 2 stories complete)
**When** a keyboard-only user tabs through the page
**Then** focus moves in logical reading order through all chapters; each interactive element has a visible focus indicator; no focus traps exist outside the RSVP flow

**Given** a screen reader (VoiceOver iOS or TalkBack Android) navigates the page
**When** reading through all content chapters
**Then** all sections have semantic headings (`<h1>` for site title, `<h2>` per chapter), all images have descriptive `alt` text, and all content is announced in logical order

**Given** `prefers-reduced-motion` is enabled at the OS level
**When** the full site renders and the guest scrolls through all chapters
**Then** no chapter entry animations play — snap-scroll still functions, but all Framer Motion and CSS transition effects are suppressed

**Given** the guest is on a 375px wide viewport (iPhone SE)
**When** navigating all Epic 2 sections
**Then** no section requires horizontal scrolling, no text is below 16px, and all content is fully legible

**And** all text in all sections meets WCAG 2.1 AA 4.5:1 contrast ratio against its background across all used palette color combinations — verified manually or with a contrast checker

---

## Epic 3: Guest Personalization & RSVP

A guest with a personalized link is greeted by name, walks the experience, submits an RSVP through the conversational interface (with eligibility-gated plus-one), receives an in-site confirmation and email within 60 seconds, and their response lands in Google Sheets in real time. Floating anchors appear on return visits.

### Story 3.1: Personalized Guest Routing

As a **guest with a personalized link**,
I want to be identified by name when I open my unique URL,
So that my arrival feels personal — not like a mass invitation.

**Acceptance Criteria:**

**Given** a `guest` document exists in Sanity with `firstName`, `slug`, `plusOneEligible`, `plusOneType`, and `plusOneLinkedGuest` fields
**When** the page at `/[guest-slug]` is statically generated via `generateStaticParams`
**Then** a unique page is pre-rendered for every published guest slug

**Given** a guest opens their personalized URL (e.g., `/karen-reyes`)
**When** the page renders server-side
**Then** the guest's `firstName`, `plusOneEligible`, `plusOneType`, and `plusOneLinkedGuest` are resolved from Sanity and passed to the page — no client-side fetch, no guest data exposed in the browser bundle (NFR-S5)

**Given** a guest opens an unknown or invalid slug
**When** the page attempts to render
**Then** a graceful 404 page is shown — no error stack trace, no crash

**And** the root `/` route (no slug) renders the same experience without a personalized greeting — for guests who share the base URL rather than their personalized link

---

### Story 3.2: Personalized Arrival Greeting

As a **guest with a personalized link**,
I want to be greeted by my name in the arrival overlay,
So that I feel the wedding is expecting *me* specifically.

**Acceptance Criteria:**

**Given** a guest opens their personalized URL
**When** the arrival overlay appears (as built in Story 2.3)
**Then** the greeting reads *"Welcome, [firstName]. We're so glad you're here."* — using the guest's actual first name from Sanity

**Given** a guest opens the base `/` route (no personalized slug)
**When** the arrival overlay appears
**Then** the generic greeting *"Welcome. We're so glad you're here."* is displayed — no name substitution, no error

**Given** the guest's name is resolved server-side at request time
**When** the page hydrates on the client
**Then** the name is already present in the initial HTML — no visible flash or layout shift as the name loads

**And** the name greeting respects the display typeface and palette treatment established in Story 2.3 — no styling deviation for the personalized variant

---

### Story 3.3: Conversational RSVP Interface

As a **guest**,
I want to submit my RSVP through a chat-bubble interface with ready-made response chips,
So that confirming my attendance feels warm and personal — and I never have to wonder what to type.

**Acceptance Criteria:**

**Given** the guest reaches the RSVP section
**When** the `<RSVPChat>` client component renders
**Then** the opening prompt appears: *"Will you be joining us on January 8?"* with two quick-reply chips: **Yes, I'll be there** and **Sorry, I can't make it**

**Given** the guest taps a chip or types any affirmative response ("yes", "oo", "of course", etc.)
**When** the chat processes the input
**Then** it is recognized as a positive RSVP and the flow advances to the plus-one step (if eligible) or directly to submission

**Given** the guest taps a chip or types any negative response
**When** the chat processes the input
**Then** the chat thanks the guest warmly and ends the flow — no further prompts, no submission to Sheets

**Given** the guest is plus-one eligible with `plusOneType: 'linked'` (partner is a known guest)
**When** the attendance confirmation is received
**Then** the chat asks *"Will [partner name] be joining you?"* with chips **Yes, we'll both be there** and **Just me** — no open-ended name collection needed

**Given** the guest confirms the linked plus-one is attending
**When** the Server Action runs
**Then** two separate rows are written to Google Sheets — one for the guest, one for the linked partner — each with their own name and attending: yes

**Given** the guest is plus-one eligible with `plusOneType: 'open'` (unnamed plus-one slot)
**When** the attendance confirmation is received
**Then** the chat asks *"Will you be bringing a plus-one?"* with chips **Yes, bringing someone** and **Just me**

**Given** the guest selects **Yes, bringing someone** on an open plus-one
**When** the chat advances
**Then** it asks for the plus-one's name as a free-text input (no chips) and records it in the Sheets row

**Given** the guest has NO plus-one eligibility
**When** the RSVP flow runs
**Then** no plus-one prompt of any kind appears — not greyed out, not visible

**Given** the guest is on a 375px viewport with a soft keyboard open
**When** typing in the RSVP chat input
**Then** the input remains visible above the keyboard and the chat history does not scroll out of view

**And** all chat inputs and chips have a minimum touch target of 44×44px and are reachable via keyboard tab navigation (NFR-A3, FR32)

**And** meal preference is explicitly out of scope for the RSVP flow — the PRD journey description is superseded by this story

---

### Story 3.4: RSVP Submission — Google Sheets & Email

As a **guest who has completed the RSVP chat**,
I want my response recorded and a confirmation email sent to me,
So that I know my RSVP was received and have the wedding details in my inbox.

**Acceptance Criteria:**

**Given** the guest completes the RSVP chat flow
**When** the Server Action (`app/actions/submitRsvp.ts`) is called
**Then** it validates the Cloudflare Turnstile token server-side before processing anything — invalid token returns an error without writing any data (NFR-S3)

**Given** Turnstile validation passes
**When** the Server Action writes to Google Sheets
**Then** a new row is appended with: guest name, attending (yes/no), plus-one name if applicable, timestamp — and the row appears in the Sheet within 5 seconds (FR37, NFR-I1)

**Given** the guest has a `linked` plus-one who is confirmed attending
**When** the Server Action writes to Google Sheets
**Then** two separate rows are written — one for the guest, one for the linked partner — each with their own name and attending: yes

**Given** the Google Sheets write succeeds
**When** Resend dispatches the confirmation email
**Then** the guest receives an email with subject *"We've been waiting for you"* containing the wedding date, church, venue, and a personal note from Jave and Nianne — delivered within 60 seconds (FR36, NFR-I2)

**Given** the Google Sheets API is unavailable at submission time
**When** the Server Action fails to write
**Then** the RSVP payload is queued in `localStorage` (`rsvpQueue`) and retried silently on reconnect — the guest always sees the in-site confirmation, never a raw error (NFR-I4)

**Given** Resend fails to deliver the email
**When** the email dispatch errors
**Then** the failure is logged server-side (Vercel logs) but does not block the guest's confirmation — the RSVP is still accepted (NFR-I5)

**And** the Server Action returns a typed `{ success: boolean; error?: string }` — it never throws an unhandled error to the client

---

### Story 3.5: RSVP In-Site Confirmation

As a **guest who has just submitted their RSVP**,
I want to see a warm in-site confirmation moment,
So that submitting my RSVP feels like the couple personally acknowledged me — not a form submission.

**Acceptance Criteria:**

**Given** the RSVP Server Action returns `{ success: true }`
**When** the `<RSVPChat>` component receives the success response
**Then** a final chat bubble appears with the message *"We've been waiting for you."* in the couple's voice

**Given** the guest is on Chrome Android
**When** the confirmation message appears
**Then** the device vibrates with three gentle pulses via `navigator.vibrate([100, 50, 100, 50, 100])`

**Given** the guest is on iOS (where `navigator.vibrate()` is not supported)
**When** the confirmation message appears
**Then** no haptic is attempted — the visual confirmation alone plays (graceful degradation)

**Given** `prefers-reduced-motion` is NOT set
**When** the confirmation message appears
**Then** a `<PetalBurst>` Framer Motion animation plays — petals appear and drift upward from the chat bubble

**Given** `prefers-reduced-motion` IS set
**When** the confirmation message appears
**Then** the petal burst animation is suppressed entirely — only the text confirmation is shown

**And** the confirmation state persists for the session — if the guest scrolls away and returns to the RSVP section, they see the completed confirmation state, not the initial chat prompt

---

### Story 3.6: Floating Anchor Set & Return Visit Navigation

As a **returning guest**,
I want quick access to Wedding Details, Dress Code, and RSVP without scrolling through the entire experience again,
So that I can find what I need on my second or third visit without frustration.

**Acceptance Criteria:**

**Given** a guest reaches the RSVP section for the first time
**When** that scroll position is detected
**Then** `firstScrollComplete: true` is written to `localStorage` and the `<FloatingAnchorSet>` client component becomes visible for all future visits

**Given** `firstScrollComplete` is `true` in `localStorage`
**When** the guest opens the site on a return visit
**Then** three floating anchor icons appear (calendar glyph → Wedding Details, palette swatch → Dress Code, envelope/heart → RSVP), positioned bottom-right, not overlapping content

**Given** a floating anchor is tapped or clicked
**When** the anchor activates
**Then** the scroll container jumps to the target section smoothly (or instantly if `prefers-reduced-motion` is set)

**Given** the guest is viewing a section with a specific palette color
**When** the floating anchors are visible
**Then** the anchor icons use the palette color of the current section — consistent with the palette-as-wayfinding system (FR5)

**Given** `firstScrollComplete` is `false` or absent (first visit)
**When** the site renders
**Then** no floating anchors are visible at any point before the guest reaches the RSVP section for the first time

**And** `localStorage` access is SSR-safe — the component only reads `localStorage` after hydration on the client; no server-side access attempted

---

## Epic 4: Admin — Content & Guest Management

Nianne can manage all site content through Sanity Studio — editing, publishing, scheduling — with updates live within 10 seconds. She can view the RSVP dashboard, export the guest list for the caterer, and manage personalized link assignments. Jave does not need to touch code.

### Story 4.1: Webhook + ISR — Live Content Publishing

As a **content admin**,
I want content I publish in Sanity Studio to appear on the live site within 10 seconds,
So that I don't have to wait for a manual deploy or ask Jave to trigger a build.

**Acceptance Criteria:**

**Given** the `POST /api/revalidate` API route is implemented
**When** Sanity sends a webhook payload on publish
**Then** the route validates the HMAC-SHA256 signature using `SANITY_WEBHOOK_SECRET` before doing anything — invalid signatures return `401` with no revalidation triggered (NFR-S2)

**Given** the signature is valid
**When** `revalidatePath()` is called for the affected route
**Then** the CDN-cached page is purged and the next request receives fresh statically generated content — the end-to-end time from Sanity publish to live page is under 10 seconds (FR27, NFR-I3)

**Given** the Sanity webhook is misconfigured or Sanity is temporarily unavailable
**When** no webhook arrives
**Then** the site continues serving the last cached version — no crash, no downtime (NFR-R3)

**And** the webhook handler is configured in Sanity project settings to fire on `publish` events for all document types (`storyChapter`, `entourageMember`, `guest`, `announcement`)

---

### Story 4.2: Content Management — All Sections

As a **content admin (Nianne)**,
I want to create, edit, publish, and draft all site content sections through Sanity Studio,
So that I can manage the site's story, entourage, and announcements independently without writing code.

**Acceptance Criteria:**

**Given** Nianne is logged into Sanity Studio (standalone Studio workspace, accessed via its own URL — not `/studio` within the Next.js app)
**When** she navigates to any document type (`storyChapter`, `entourageMember`, `announcement`)
**Then** she can create a new document, fill in all fields, and save as draft — without the draft appearing on the live site

**Given** a document is in draft state
**When** Nianne clicks Publish
**Then** the document becomes live on the site within 10 seconds via the webhook + ISR pipeline (Story 4.1)

**Given** a published document needs to be updated
**When** Nianne edits and republishes it
**Then** the updated content is live on the site within 10 seconds — no code change, no deploy required (FR24, FR26)

**Given** Nianne uploads a photo or image to any content section
**When** the image is saved in Sanity
**Then** it is served via `next/image` on the site (WebP, sized per breakpoint) — Nianne does not need to optimize images manually (FR25)

**Given** an announcement is created with a `scheduledAt` datetime
**When** that datetime arrives
**Then** the announcement goes live automatically — Nianne does not need to manually publish it at that time (FR28)

**And** Nianne can toggle any document between draft and published states at any time — a published document can be unpublished without deleting it (FR26)

---

### Story 4.3: Guest List & Personalized Link Management

As a **content admin (Jave)**,
I want to manage the full guest list and their personalized link settings through Sanity Studio,
So that every guest gets the correct personalized URL and plus-one configuration without touching code.

**Acceptance Criteria:**

**Given** the `guest` schema includes `firstName`, `slug`, `plusOneEligible`, `plusOneType`, and `plusOneLinkedGuest` fields
**When** Jave creates a guest document in Studio
**Then** he can set all fields and Sanity auto-generates the slug from `firstName` (editable) — the personalized URL is immediately available as `/[slug]` (FR21, FR31)

**Given** a guest document has `plusOneEligible: true` and `plusOneType: 'linked'`
**When** Jave sets `plusOneLinkedGuest` to another guest document
**Then** the RSVP flow for that guest will use the linked partner's name in the *"Will [partner name] be joining you?"* prompt (FR16a)

**Given** a guest document has `plusOneEligible: true` and `plusOneType: 'open'`
**When** the guest RSVPs
**Then** the *"Will you be bringing a plus-one?"* flow is used instead

**Given** all guest documents are published
**When** the site build/revalidation runs
**Then** all guest slugs are pre-rendered via `generateStaticParams` — no guest gets a 404 on their personalized link

**And** Jave can view all guest documents in a list view in Studio, sortable by name — no external spreadsheet needed to manage the guest list

---

### Story 4.4: RSVP Dashboard & Export

As a **content admin (Nianne or Jave)**,
I want to view a live RSVP dashboard showing current headcount and export the full list for the caterer,
So that I always know how many guests are coming and can hand off the list without manual compilation.

**Acceptance Criteria:**

**Given** RSVP responses are being written to Google Sheets in real time
**When** Nianne opens the RSVP dashboard (implemented as a custom Sanity Studio plugin)
**Then** she sees a live headcount — total attending, total declined, total pending (no response yet from published guests)

**Given** the dashboard shows individual responses
**When** Nianne views the response list
**Then** each entry shows: guest name, attending (yes/no), plus-one name if applicable, timestamp — matching what is in Google Sheets (FR29)

**Given** the caterer needs the final headcount
**When** Jave or Nianne clicks Export
**Then** a CSV file downloads containing: guest name, attending, plus-one name, timestamp — for all responses in the Sheet (FR30)

**Given** the Google Sheet is shared directly with Nianne and the caterer
**When** either party opens the Sheet
**Then** they have read access to the full live response data — no additional export step required for day-to-day monitoring

**And** the RSVP dashboard reads directly from Google Sheets via the Sheets API — it does not store RSVP data in Sanity, keeping guest personal data out of the CMS (NFR-S7)
