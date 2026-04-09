---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-nijao-wedding-2027-2026-04-03.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/research/technical-wedding-website-tech-stack-research-2026-04-03.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-04-05'
project_name: 'nijao-wedding-2027'
user_name: 'Javej'
date: '2026-04-05'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
40 FRs across 8 categories — Guest Experience & Navigation (FR1–7), Love Story & Content (FR8–14), RSVP & Guest Hospitality (FR15–20), Personalization & Links (FR21–23), Admin Content Management (FR24–28), Admin RSVP & Guest Management (FR29–31), Accessibility & Inclusive Design (FR32–35), System & Integration (FR36–40).

Core architectural FRs that drive the most decisions:
- FR4 (scroll-locked chapters) — defines the primary interaction model and component architecture
- FR7 + FR22 (personalized links + name greeting) — drives dynamic routing and Sanity guest schema
- FR15–20 (conversational RSVP) — the most complex client component; drives Server Actions + two external integrations
- FR27–28 (< 10s publish, scheduled content) — drives Sanity webhook + on-demand ISR architecture
- FR38–39 (revalidation < 10s, spam protection) — drives webhook security and Turnstile integration

**Non-Functional Requirements:**
30 NFRs. Architecturally decisive ones:
- NFR-P5: Initial JS bundle < 300KB; content pages ship zero client JS → mandates RSC-first component split; client components are islands, not the default
- NFR-P1/P6: LCP < 2.5s, monogram animation begins < 1.5s on Philippine LTE → drives image sizing strategy, font self-hosting, and animation library choice (CSS-first, GSAP/Framer Motion only where CSS cannot do it)
- NFR-S2: Sanity webhook HMAC-SHA256 validation → dedicated API route with signature verification middleware
- NFR-S5: Sanity API accessed server-side only → no content API keys in browser bundles
- NFR-R3: RSVP form functional during Sanity outages → RSVP submission must not depend on CMS

**Scale & Complexity:**
- Primary domain: Web SPA, content-driven, mobile-first
- Complexity level: Low-Medium
- Guest scale: ~100 invited guests; no concurrency or throughput engineering needed
- Content scale: < 500 Sanity documents (well within free tier)
- Estimated architectural components: ~12 distinct components (monogram loader, hero, chapter scroll container, story chapter, proposal section, wedding details, dress code, padrino wall, RSVP chat, floating anchor set, confirmation overlay, admin RSVP dashboard)

### Technical Constraints & Dependencies

**Hard constraints (non-negotiable):**
- Next.js 15 App Router — confirmed in PRD tech stack
- Sanity CMS — confirmed; free tier sufficient (< 500 docs, 10 GB asset limit is the only risk)
- Vercel Hobby — personal/non-commercial use confirmed; 126 CDN edge nodes
- Mobile-first design at 390px; minimum supported width 375px
- iOS Safari: audio autoplay blocked — tap-to-unmute pattern mandatory
- `navigator.vibrate()` (haptic) — Chrome Android only; graceful visual degradation on iOS

**External dependencies and their failure modes:**
- Google Sheets API — RSVP data; must handle API failure gracefully (FR37 + NFR-I4)
- Resend API — confirmation email; failure must not block RSVP submission (NFR-I5)
- Sanity webhook — ISR revalidation; CMS outage must not affect RSVP form (NFR-R3)
- Cloudflare Turnstile — spam protection on RSVP form (NFR-S3)

**Timeline constraint:** Hard deadline January 8, 2027. MVP by mid-2026.

### Cross-Cutting Concerns Identified

1. **Animation performance and reduced-motion** — Monogram draw-on, chapter transitions, petal burst, and floating anchor animations must all respect `prefers-reduced-motion`. Animation library choice (CSS vs GSAP vs Framer Motion) affects bundle size (NFR-P5) and must be audited per component.

2. **iOS vs Android platform divergence** — Audio autoplay (iOS blocked), haptic API (Android only), scroll-snap behavior variance — each interaction in the primary journey has a platform-specific branch that must be designed and tested independently.

3. **WCAG 2.1 AA across animated sections** — Keyboard traversal through snap-locked chapters, focus management in RSVP chat, semantic chapter headings as landmarks, minimum 4.5:1 contrast across all 8 palette colors — accessibility is not a post-build audit but a component-level constraint.

4. **Guest identity resolution** — Personalized slug (`/[guest-slug]`) must resolve name and plus-one eligibility from Sanity at request time without exposing the full guest list. Server-side only.

5. **Sanity ISR chain reliability** — Webhook → signature validation → `revalidatePath()` → CDN purge must complete in < 10 seconds end-to-end. Failure modes (invalid signature, Sanity outage) need explicit handling.

6. **Environment variable and secrets management** — Sanity token, Google Service Account JSON, Resend API key, Turnstile secret — all server-side only, none exposed to browser bundles.

## Starter Template Evaluation

### Primary Technology Domain

Web application (SPA, content-driven, mobile-first) — Next.js 15 App Router with JAMstack headless architecture. Tech stack fully confirmed in PRD: TypeScript, Tailwind CSS, shadcn/ui, Sanity CMS, Vercel, Google Sheets API, Resend.

### Starter Options Considered

| Starter | Next.js | Tailwind | shadcn/ui | Status |
|---|---|---|---|---|
| `nuotsu/sanitypress` | 16 | 4 | ❌ | Actively maintained; upgraded to Next.js 16 |
| `sanity-io/template-nextjs-personal-website` | 15 | ❌ | ❌ | Official Sanity template; minimal styling |
| `serge-0v/next-js-sanity-starter` | 15 | ✅ | ✅ | Closest to project design system |
| Vercel CMS-Kit (Sanity) | 15 | ❌ | Radix UI | Multi-CMS oriented; more complex than needed |

### Selected Starter: `serge-0v/next-js-sanity-starter`

**Rationale for Selection:**
The project's UX spec defines a custom design system built on Tailwind CSS + shadcn/ui primitives. This starter is the only option that includes both out of the box, aligned with Next.js 15 (the PRD-specified version). The site requires heavy customization regardless of starter — what matters is avoiding the need to manually wire Tailwind, shadcn/ui, and Sanity together from scratch.

Next.js 15 is preferred over `sanitypress`'s Next.js 16 for deadline stability — the wedding date is a hard constraint and a major framework upgrade mid-build is unnecessary risk.

**Initialization Command:**

```bash
git clone https://github.com/serge-0v/next-js-sanity-starter nijao-wedding-2027
cd nijao-wedding-2027 && pnpm install
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript — strict mode; type-safe Sanity schema via `@sanity/types`

**Styling Solution:**
Tailwind CSS + shadcn/ui — design tokens defined as CSS custom properties in `tailwind.config.ts`; 8 palette colors added as custom tokens (`--color-deep-matcha`, etc.)

**Build Tooling:**
Next.js 15 App Router with Turbopack for local dev; Vercel for production builds; `next/image` for automatic WebP conversion and lazy-loading

**Testing Framework:**
None included — appropriate for this project scope; TypeScript + Vercel preview deployments provide sufficient quality gates (as confirmed in research)

**Code Organization:**
App Router file-based routing (`app/` directory); `components/` for UI; `sanity/` for schemas and queries; `lib/` for server utilities (Sheets API, Resend, webhook validation)

**Package Manager:** pnpm — faster installs, shared package store, auto-detected by Vercel via `pnpm-lock.yaml`. Use `pnpm install`, `pnpm dev`, `pnpm build` throughout. Never commit `package-lock.json` or `yarn.lock`.

**Development Experience:**
Hot reloading via Turbopack; Sanity Studio embedded at `/studio`; Vercel preview deployments on every branch push; environment variables via `.env.local` → Vercel project settings

**Note:** Project initialization using this starter should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Data storage: Sanity (content) + Google Sheets (RSVP operational data) — no traditional DB
- Component rendering split: RSC-first; client islands for interactive components only
- Animation library: Framer Motion (React-native, reduced-motion built-in, MIT license)
- RSVP integration failure handling: localStorage queue + silent retry; guest always sees confirmation
- Admin dashboard: Sanity Studio custom plugin (no separate auth system)

**Important Decisions (Shape Architecture):**
- Image CDN: Sanity built-in for MVP; Cloudinary plugin added post-wedding if gallery exceeds 10 GB
- Font strategy: Cormorant Garamond (display) + DM Sans (body/UI), self-hosted via `next/font`
- Guest identity: URL slug resolved server-side from Sanity guest schema; no session, no login

**Deferred Decisions (Post-MVP):**
- Cloudinary integration — only if post-wedding gallery exceeds Sanity's 10 GB asset limit
- Vercel Analytics / monitoring — add post-launch if needed; not required for MVP

### Data Architecture

**Content store:** Sanity CMS (source of truth for all site content)
- Document types: `page` (hero, story chapters, wedding details, entourage, announcements), `guest` (slug, name, plusOneEligible), `rsvpResponse` (not stored in Sanity — Google Sheets only)
- All Sanity queries via GROQ, server-side only using read-only API token (NFR-S5)
- Caching: Next.js Full Route Cache for static pages; on-demand `revalidatePath()` via Sanity webhook

**Operational data:** Google Sheets (RSVP responses — name, attending, meal, plusOne, timestamp)
- Written via Next.js Server Action → Google Sheets API v4 (service account credentials in Vercel env vars)
- Google Sheet shared with Nianne and caterer directly — no admin UI needed for data export

**Session/visit state:** `localStorage` only
- `firstScrollComplete: boolean` — reveals floating anchor set after first full scroll-through
- `rsvpQueue: object` — RSVP payload queued if Google Sheets API is unavailable; retried silently on reconnect

**Image CDN:** Sanity's built-in CDN via `next-sanity-image` for MVP (< 200 photos). Cloudinary plugin added post-wedding only if asset storage approaches 10 GB limit.

**No traditional database.** Vercel serverless functions are stateless; all persistent data lives in Sanity or Google Sheets.

### Authentication & Security

**Guest access:** No authentication. Personalized URLs (`/[guest-slug]`) resolved server-side from Sanity `guest` document — name and plus-one eligibility loaded at request time, never exposed in client bundles.

**Admin access:** Sanity Studio built-in authentication (`/studio` route). Nianne logs in once; all content management and RSVP dashboard (custom Studio plugin) accessible under one login. No separate admin auth system.

**Secrets management:** All credentials in Vercel environment variables — never committed to git.
- `SANITY_API_READ_TOKEN` — server-side only
- `GOOGLE_SERVICE_ACCOUNT_JSON` — server-side only
- `RESEND_API_KEY` — server-side only
- `SANITY_WEBHOOK_SECRET` — used for HMAC-SHA256 validation
- `TURNSTILE_SECRET_KEY` — server-side only; public site key in `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

**Webhook security:** Sanity webhook payloads validated via HMAC-SHA256 signature in the API route before `revalidatePath()` is called (NFR-S2).

**Spam protection:** Cloudflare Turnstile on the RSVP form (free tier). Server-side token verification before processing submission.

**HTTPS:** Enforced by Vercel on all deployments including preview URLs.

### API & Communication Patterns

**RSVP submission:** Next.js Server Action (`app/actions/rsvp.ts`). Validates Turnstile token → writes to Google Sheets → dispatches Resend email → returns success to client. Integration failures are decoupled from guest-facing confirmation.

**Integration failure handling:**
- Google Sheets unavailable: RSVP payload queued in `localStorage`; retried silently on reconnect; guest always sees confirmation
- Resend failure: logged server-side (Vercel logs); guest submission not blocked; email delivery failure is operationally recoverable
- Sanity outage: RSVP form remains fully functional — no CMS dependency at submission time (NFR-R3)

**Sanity webhook → ISR:** `POST /api/revalidate` — validates HMAC-SHA256 signature, calls `revalidatePath()` for affected routes. Target: < 10 seconds end-to-end from Sanity publish to live CDN update.

**Error format:** Server Actions return typed `{ success: boolean; error?: string }` — never throw unhandled errors to the client.

### Frontend Architecture

**Rendering strategy:**

| Route | Strategy | Rationale |
|---|---|---|
| `/` (main SPA experience) | SSG | Static content; revalidated on Sanity webhook |
| `/[guest-slug]` | SSG with `generateStaticParams` | Pre-generate all guest slugs at build; revalidate on guest list change |
| `/api/revalidate` | API Route (serverless) | Webhook handler |
| `/studio` | Client (embedded Sanity Studio) | CMS interface |

**Component split (RSC-first):**
- Server Components: all content sections (hero, story chapters, wedding details, entourage, Padrino Wall)
- Client Components (islands): `<MonogramLoader>`, `<ChapterScrollContainer>`, `<RSVPChat>`, `<FloatingAnchorSet>`, `<AudioController>`, `<PetalBurst>`

**Animation library:** Framer Motion — React-native integration, built-in `prefers-reduced-motion` support via `useReducedMotion()`, excellent SVG `pathLength` animation for monogram draw-on. CSS-first for scroll-snap and chapter transitions; Framer Motion only for monogram, petal burst, and chat bubble reveals.

**State management:** No global state manager. RSVP form state in a single `<RSVPChat>` client component via `useState`. `localStorage` for first-visit state. No Redux, Zustand, or Context needed.

**Typography:** Cormorant Garamond (display, weights 300/400/600) + DM Sans (body/UI, weights 400/500), both self-hosted via `next/font`. Full `clamp()`-based type scale defined as CSS custom properties per UX spec.

**Design tokens:** 8 named palette colors + animation durations + shadows defined as CSS custom properties in `tailwind.config.ts`. No hardcoded hex values in components.

### Infrastructure & Deployment

**Hosting:** Vercel Hobby (free, non-commercial personal use confirmed). 126 global CDN edge nodes; 99.99% SLA; auto-provisions HTTPS.

**CI/CD:** GitHub → Vercel auto-deploy on every push to `main`. Preview deployments on every branch — used for real-device mobile testing before merge.

**Content pipeline:** Sanity publish → HMAC-validated webhook → `revalidatePath()` → CDN purge → new static page live in < 10 seconds.

**Monitoring:** Vercel build logs + function logs for integration failure visibility. No additional monitoring tooling for MVP; add Vercel Analytics post-launch if needed.

**Domain:** Custom domain registered separately (~$12–15/year); configured in Vercel project settings.

### Decision Impact Analysis

**Implementation Sequence (order matters):**
1. Repo setup from `serge-0v/next-js-sanity-starter` → configure Vercel + custom domain
2. Design token layer — palette colors, typography, animation durations in `tailwind.config.ts`
3. Sanity schema — `guest`, `page`, `storyChapter`, `entourageMember`, `announcement` document types
4. Scroll architecture — `<ChapterScrollContainer>` with scroll-snap; cross-browser tested before other components
5. Monogram loader — SVG draw-on via Framer Motion `pathLength`; reduced-motion fallback
6. Content sections — hero, story chapters, wedding details, entourage (RSC; data from Sanity)
7. RSVP flow — `<RSVPChat>` client component + Server Action + Google Sheets + Resend + Turnstile
8. Admin dashboard — Sanity Studio custom plugin for headcount view + CSV export
9. Guest slug system — `generateStaticParams` from Sanity guest list; personalized name greeting

**Cross-component dependencies:**
- `<ChapterScrollContainer>` must be stable before any story chapter or RSVP chapter is built
- Design tokens must be finalized before any styled component is built
- Sanity `guest` schema must exist before `[guest-slug]` routing can be implemented
- Turnstile public site key must be in env before `<RSVPChat>` can render

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

7 areas where AI agents could make incompatible choices without explicit rules:
1. Sanity schema field naming (camelCase vs snake_case)
2. File naming (PascalCase vs kebab-case vs lowercase)
3. Project structure (feature-first vs type-first)
4. Server Action return format (throw vs return)
5. localStorage access pattern (SSR safety)
6. Client/server component data flow (fetch in client vs receive as props)
7. Tailwind class authoring (hardcoded hex vs token classes)

---

### Naming Patterns

**Sanity Schema Naming:**
- Document types: camelCase singular — `storyChapter`, `entourageMember`, `guest`, `announcement`
- Field names: camelCase — `firstName`, `plusOneEligible`, `publishedAt`, `colorAssignment`
- No snake_case anywhere in Sanity schemas

**File Naming:**
- Next.js reserved files: lowercase (`page.tsx`, `layout.tsx`, `loading.tsx`, `route.ts`)
- React components: PascalCase (`MonogramLoader.tsx`, `RSVPChat.tsx`, `StoryChapter.tsx`)
- Hooks: camelCase with `use` prefix (`useLocalStorage.ts`, `useScrollState.ts`)
- Utility/lib files: camelCase (`formatDate.ts`, `validateRsvp.ts`)
- Sanity schema files: camelCase (`storyChapter.ts`, `guest.ts`)
- Server Action files: camelCase verb-first (`submitRsvp.ts`, `revalidatePage.ts`)

**Component & Type Naming:**
- All React components: PascalCase
- TypeScript types/interfaces: PascalCase (`Guest`, `StoryChapter`, `RSVPPayload`, `ActionResult`)
- No `I` prefix on interfaces — `Guest` not `IGuest`
- `type` for unions and primitives; `interface` for object shapes
- All Sanity-generated types imported from `@/sanity/types` — never re-declared

**CSS/Tailwind Naming:**
- CSS custom properties: kebab-case (`--color-deep-matcha`, `--font-display`, `--duration-ceremony`)
- Never hardcode hex values in `className` — always use the token-based Tailwind class
- `cn()` from `@/lib/utils` for all conditional className assembly — never string concatenation

---

### Structure Patterns

**Project layout (feature-first within `app/`, type-first for shared):**

```
app/
  (site)/                     # Route group: guest experience
    page.tsx                  # SSG main SPA page
    [guest-slug]/
      page.tsx                # SSG personalized guest page
  api/
    revalidate/
      route.ts                # Sanity webhook → revalidatePath()
  studio/
    [[...tool]]/
      page.tsx                # Embedded Sanity Studio
  actions/
    rsvp.ts                   # Server Action: RSVP submission
components/
  sections/                   # Full-viewport section components (RSC)
    HeroSection.tsx
    StoryChapter.tsx
    WeddingDetails.tsx
    EntourageSection.tsx
    RSVPSection.tsx
  ui/                         # Interactive client islands
    MonogramLoader.tsx
    ChapterScrollContainer.tsx
    RSVPChat.tsx
    FloatingAnchorSet.tsx
    PetalBurst.tsx
    AudioController.tsx
  shared/                     # Layout wrappers, shared RSC primitives
sanity/
  schemas/                    # Document type schema definitions
  queries/                    # GROQ query strings + TypeScript return types
  lib/
    client.ts                 # Sanity client configuration
    image.ts                  # urlFor() helper
lib/
  sheets.ts                   # Google Sheets API integration
  resend.ts                   # Resend email integration
  webhook.ts                  # HMAC-SHA256 validation utility
  localStorage.ts             # SSR-safe localStorage utility
types/
  index.ts                    # Shared types used across 3+ files
```

**Co-location rule:** Types live inline in the owning file if used in ≤ 2 files; move to `types/index.ts` if used in 3 or more.

---

### Format Patterns

**Server Action return type — always typed, never throw:**

```typescript
type ActionResult = { success: true } | { success: false; error: string }

// ✅ Correct
export async function submitRsvp(payload: RSVPPayload): Promise<ActionResult> {
  try {
    // ...
    return { success: true }
  } catch (e) {
    console.error('[submitRsvp]', e)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

// ❌ Wrong — never throw from a Server Action
export async function submitRsvp(payload: RSVPPayload) {
  throw new Error('...')
}
```

**Image rendering — always `next/image` + `urlFor()`:**

```typescript
// ✅ Correct
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
<Image src={urlFor(photo).width(800).url()} alt={caption} ... />

// ❌ Wrong — never raw <img> or hardcoded Sanity CDN URLs
<img src={photo.asset.url} />
```

**Date formatting — always `Intl.DateTimeFormat`, never `.toString()`:**

```typescript
// ✅ Correct
new Intl.DateTimeFormat('en-PH', { dateStyle: 'long' }).format(new Date(dateString))

// ❌ Wrong
new Date(dateString).toString()
```

**Environment variables — assert at module load, never inline optional-chain:**

```typescript
// ✅ Correct — in lib/sheets.ts
const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
if (!serviceAccount) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set')

// ❌ Wrong — silently undefined at runtime
const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? '{}')
```

---

### Communication Patterns

**Client/Server component data flow — fetch on server, receive as props:**

```typescript
// ✅ Correct — server fetches, client receives
// app/(site)/page.tsx (Server Component)
const chapters = await getStoryChapters() // GROQ query
return <ChapterScrollContainer chapters={chapters} />

// ❌ Wrong — never fetch inside a Client Component
'use client'
export function ChapterScrollContainer() {
  const [chapters, setChapters] = useState([])
  useEffect(() => { fetch('/api/chapters').then(...) }, []) // ❌
}
```

**Props passed to Client Components: serializable only** — no functions, no class instances, no `Date` objects (pass ISO strings instead).

**Animation — always check reduced-motion at component level:**

```typescript
// ✅ Correct — in every animated client component
import { useReducedMotion } from 'framer-motion'

export function MonogramLoader() {
  const shouldReduce = useReducedMotion()
  // Use shouldReduce to disable or simplify animation
}
```

**Framer Motion variants — defined outside the component:**

```typescript
// ✅ Correct
const chapterVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}
export function StoryChapterClient({ ... }) { ... }

// ❌ Wrong — inline variant objects cause re-renders
<motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
```

---

### Process Patterns

**`localStorage` — always SSR-safe via `@/lib/localStorage.ts`:**

```typescript
// lib/localStorage.ts — the ONLY way to access localStorage
export function getLocalItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const item = localStorage.getItem(key)
    return item !== null ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

// ✅ Correct — use the utility
const complete = getLocalItem('firstScrollComplete', false)

// ❌ Wrong — direct localStorage access in components
localStorage.getItem('firstScrollComplete') // breaks SSR
```

**Loading states — local `useState`, never global:**

```typescript
// ✅ Correct — loading state owned by the component that needs it
const [isSubmitting, setIsSubmitting] = useState(false)

// ❌ Wrong — no global loading context or store
```

**TypeScript strictness — no `any`:**
- Use `unknown` when the type is genuinely unknown, then narrow with a type guard
- All Sanity query results typed via generated types or explicit `infer` — never cast with `as any`

---

### Enforcement Guidelines

**All AI Agents MUST:**
- Use `cn()` for all className assembly — never string concatenation or template literals for classes
- Return `ActionResult` from all Server Actions — never throw
- Check `useReducedMotion()` in every Framer Motion component
- Access `localStorage` only via `@/lib/localStorage.ts` utilities
- Fetch Sanity data in Server Components only — never in Client Components
- Assert env vars at module load in `lib/` files — never inline optional-chain
- Use `next/image` + `urlFor()` for all images — never raw `<img>`
- Define Framer Motion `variants` outside the component body

**TypeScript enforcement:** Strict mode is on. `no-explicit-any` ESLint rule active. PR fails to merge if TypeScript errors exist.

**Pattern verification:** Vercel preview deployment on each branch. Visual regression checked manually on real devices (Chrome Android + Safari iOS) before merge to `main`.

## Project Structure & Boundaries

### Requirements to Structure Mapping

| FR Category | Primary Location |
|---|---|
| FR1–5: Monogram, music, overlay, scroll, palette-wayfinding | `components/ui/` |
| FR6, FR23: Floating anchors, first-visit state | `components/ui/FloatingAnchorSet.tsx`, `lib/localStorage.ts` |
| FR7, FR22: Personalized links + name greeting | `app/(site)/[guest-slug]/`, `sanity/queries/guests.ts` |
| FR8–9: Story chapters + proposal | `components/sections/StoryChapter.tsx`, `ProposalSection.tsx` |
| FR10–12: Wedding details, dress code | `components/sections/WeddingDetails.tsx`, `DressCodeSection.tsx` |
| FR13–14: Entourage, Padrino Wall | `components/sections/EntourageSection.tsx`, `components/ui/EntourageCard.tsx` |
| FR15–18: Conversational RSVP, confirmation | `components/ui/RSVPChat.tsx`, `PetalBurst.tsx` |
| FR19–20, FR36–37: Email + Sheets integration | `lib/resend.ts`, `lib/sheets.ts` |
| FR21, FR31: Guest link generator | `sanity/plugins/guest-link-generator/` |
| FR24–28: Content management + ISR | `app/studio/`, `sanity/schemas/`, `app/api/revalidate/` |
| FR29–30: RSVP dashboard, export | `sanity/plugins/rsvp-dashboard/` |
| FR32–35: Accessibility | Distributed — `useReducedMotion()` in all `components/ui/`, semantic HTML in all `components/sections/` |
| FR38–39: Webhook revalidation, spam | `app/api/revalidate/route.ts`, `lib/webhook.ts`, Turnstile in `RSVPChat.tsx` |
| FR40: Messaging app link preview | `app/layout.tsx` metadata |

---

### Complete Project Directory Structure

```
nijao-wedding-2027/
├── .env.example                          # Committed: lists all required env var keys (no values)
├── .env.local                            # gitignored: actual secrets for local dev
├── .eslintrc.json                        # Strict TS + no-explicit-any rules
├── .gitignore
├── next.config.ts                        # Image domains, strict mode, Turbopack
├── package.json
├── postcss.config.mjs
├── sanity.config.ts                      # Sanity Studio config: schemas + plugins
├── tailwind.config.ts                    # Palette tokens, type scale, animation durations
├── tsconfig.json                         # strict: true
│
├── public/
│   ├── audio/
│   │   └── ambient.mp3                   # Orchestral loop (self-hosted, served statically)
│   └── images/
│       └── og-preview.jpg                # Messaging app link preview (FR40)
│
├── app/
│   ├── globals.css                       # CSS custom properties: palette, type scale, shadows, durations
│   ├── layout.tsx                        # Root layout: next/font, metadata (FR40), Turnstile script
│   ├── (site)/
│   │   ├── page.tsx                      # SSG: main guest experience (no personalization)
│   │   └── [guest-slug]/
│   │       ├── page.tsx                  # SSG: personalized guest page; generateStaticParams()
│   │       └── not-found.tsx             # Graceful error for expired/invalid slug
│   ├── actions/
│   │   └── rsvp.ts                       # Server Action: submitRsvp() → Sheets + Resend
│   ├── api/
│   │   └── revalidate/
│   │       └── route.ts                  # POST: Sanity webhook → HMAC validate → revalidatePath()
│   └── studio/
│       └── [[...tool]]/
│           └── page.tsx                  # Embedded Sanity Studio
│
├── components/
│   ├── sections/                         # Server Components — no 'use client'
│   │   ├── HeroSection.tsx               # FR3, FR7: "Ten years. One more day." + arrival overlay shell
│   │   ├── StoryChapter.tsx              # FR8: single year chapter (image + caption + year number)
│   │   ├── ProposalSection.tsx           # FR9: Mt. Fuji — "She said yes."
│   │   ├── WeddingDetails.tsx            # FR10–11: ceremony block + reception block
│   │   ├── DressCodeSection.tsx          # FR12: palette-coded dress code card
│   │   ├── EntourageSection.tsx          # FR13–14: Padrino Wall grid + wedding party list
│   │   └── RSVPSection.tsx               # FR15: RSC shell that renders <RSVPChat> client island
│   │
│   ├── ui/                               # Client Components — 'use client' at top of each
│   │   ├── MonogramLoader.tsx            # FR1: .jn SVG stroke draw-on via Framer Motion pathLength
│   │   ├── ChapterScrollContainer.tsx    # FR4–5: scroll-snap-type:y mandatory wrapper; palette accent
│   │   ├── AudioController.tsx           # FR2: Web Audio API; tap-to-unmute affordance (iOS)
│   │   ├── ArrivalOverlay.tsx            # FR3, FR7: "Welcome. We're so glad you're here." + guest name
│   │   ├── RSVPChat.tsx                  # FR15–16, FR18: chat-bubble flow; Turnstile; submitRsvp()
│   │   ├── PetalBurst.tsx                # FR18: petal animation overlay + navigator.vibrate() (Android)
│   │   ├── FloatingAnchorSet.tsx         # FR6: appears after firstScrollComplete; localStorage-gated
│   │   └── EntourageCard.tsx             # FR13: avatar + name + role badge + palette color
│   │
│   └── shared/
│       ├── PageShell.tsx                 # Root scroll container; overflow-hidden during monogram load
│       └── SanityImage.tsx               # next/image + urlFor() wrapper — enforces image pattern
│
├── sanity/
│   ├── schemas/
│   │   ├── index.ts                      # Barrel export: all schema types for sanity.config.ts
│   │   ├── guest.ts                      # FR22: slug, firstName, plusOneEligible, colorAssignment
│   │   ├── storyChapter.ts               # FR8: year, image, caption, paletteColor
│   │   ├── weddingDetails.ts             # FR10–12: ceremony, reception, dressCode
│   │   ├── entourageMember.ts            # FR13–14: name, role, photo, paletteColor, coupleAssociation, published
│   │   └── announcement.ts              # FR27–28: title, body, publishedAt, scheduledAt
│   │
│   ├── queries/
│   │   ├── guests.ts                     # getGuestBySlug(slug), getAllGuestSlugs()
│   │   ├── story.ts                      # getStoryChapters(), getHeroContent()
│   │   ├── weddingDetails.ts             # getWeddingDetails()
│   │   ├── entourage.ts                  # getPadrinos(), getWeddingParty()
│   │   └── announcements.ts             # getAnnouncements()
│   │
│   ├── lib/
│   │   ├── client.ts                     # createClient(); asserts SANITY_API_READ_TOKEN at load
│   │   └── image.ts                      # urlFor() builder from @sanity/image-url
│   │
│   └── plugins/
│       ├── rsvp-dashboard/
│       │   └── index.tsx                 # FR29–30: Studio dashboard plugin; headcount + CSV export
│       └── guest-link-generator/
│           └── index.tsx                 # FR21, FR31: Studio tool; generate + copy personalized URLs
│
├── lib/
│   ├── sheets.ts                         # FR20, FR37: googleapis → Sheets API v4 row append
│   ├── resend.ts                         # FR19, FR36: Resend transactional email
│   ├── webhook.ts                        # NFR-S2: HMAC-SHA256 validation for /api/revalidate
│   └── localStorage.ts                   # FR23: getLocalItem<T>(), setLocalItem() — SSR-safe
│
├── hooks/
│   └── useFirstScrollComplete.ts         # FR6: reads/writes firstScrollComplete via localStorage.ts
│
└── types/
    └── index.ts                          # ActionResult, RSVPPayload, GuestContext — shared types
```

---

### Architectural Boundaries

**API Boundaries:**

| Boundary | Direction | Handler | Security |
|---|---|---|---|
| Sanity webhook → ISR | Inbound | `app/api/revalidate/route.ts` | HMAC-SHA256 (NFR-S2) |
| RSVP → Google Sheets | Outbound | `lib/sheets.ts` via Server Action | Service account (env var) |
| RSVP → Resend email | Outbound | `lib/resend.ts` via Server Action | API key (env var) |
| Guest → Turnstile verify | Outbound | Server Action (inline) | Secret key (env var) |
| Sanity GROQ → content | Outbound | `sanity/lib/client.ts` (server only) | Read-only token (env var) |

**Component Boundaries:**

The RSC/client boundary is the primary architectural divide. Data flows server → client via props only; never re-fetched client-side:

```
Server Components (sections/)          Client Components (ui/)
─────────────────────────────          ──────────────────────────────
Fetch from Sanity via GROQ    →props→  Receive data; never re-fetch
Render HTML at build time              Handle interaction, animation
Zero JS shipped to browser             Minimal JS — scoped to island
```

**Data Boundaries:**

| Data | Lives In | Who Writes | Who Reads |
|---|---|---|---|
| Site content | Sanity CMS | Nianne (Studio) | Server Components (GROQ) |
| Guest list + slugs | Sanity CMS | Jave (Studio plugin) | Server Components (GROQ) |
| RSVP responses | Google Sheets | `lib/sheets.ts` | Nianne + caterer (shared Sheet) |
| Visit state | `localStorage` | `lib/localStorage.ts` | Client Components only |
| Secrets | Vercel env vars | Jave (Vercel dashboard) | `lib/` modules (server only) |

---

### Integration Points & Data Flow

**Full RSVP data flow:**
```
Guest types answer in <RSVPChat>
  → Collects full payload (name, attending, meal, plusOne)
  → Validates Turnstile token (FR39)
  → Calls submitRsvp() Server Action (app/actions/rsvp.ts)
    → lib/sheets.ts: appends row to Google Sheet (FR20, FR37)
    → lib/resend.ts: sends guest confirmation + admin notification (FR19, FR36)
    → Returns ActionResult { success: true }
  → <RSVPChat> shows "We've been waiting for you."
  → <PetalBurst> fires; navigator.vibrate() on Android
  → localStorage queues payload if Sheets failed; retries on reconnect
```

**Content publish pipeline:**
```
Nianne publishes in Sanity Studio
  → Sanity fires signed webhook → POST /api/revalidate
  → lib/webhook.ts validates HMAC-SHA256 signature
  → revalidatePath('/') and revalidatePath('/[guest-slug]')
  → Vercel CDN purges affected routes
  → New static page live within 10 seconds (FR27, FR38)
```

**Personalized guest page flow:**
```
Build time: getAllGuestSlugs() → generateStaticParams()
  → Pre-renders one static page per guest slug

Guest opens /[their-slug]:
  → Served from CDN (no origin hit)
  → getGuestBySlug(slug) result embedded at build time
  → firstName + plusOneEligible passed as props to <ArrivalOverlay> + <RSVPChat>
```

---

### File Organization Notes

**Configuration files:** All at root — `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `sanity.config.ts`, `.eslintrc.json`. Never nested.

**Environment files:** `.env.example` committed (key names, no values). `.env.local` gitignored. Vercel env vars set via Vercel dashboard for preview + production.

**No test directory:** TypeScript strict mode + Vercel preview deployments are the quality gates for MVP.

**Static audio:** `public/audio/ambient.mp3` referenced in `<AudioController>` as `/audio/ambient.mp3`. Never imported — served statically.

**Fonts:** Never in `public/fonts/`. `next/font` self-hosts at build time. Declared once in `app/layout.tsx`, consumed as CSS variables via `tailwind.config.ts`.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are mutually compatible: Next.js 15 App Router, Sanity (next-sanity v9+), Tailwind CSS, shadcn/ui, Framer Motion, and TypeScript strict mode operate without conflicts in a Vercel deployment. Server Actions + googleapis + Resend all run in the Node.js serverless runtime. `generateStaticParams()` for `[guest-slug]` integrates cleanly with on-demand ISR revalidation.

**Pattern Consistency:**
RSC-first pattern directly enforces NFR-P5 (zero client JS for static pages). The "fetch on server, props to client" rule eliminates all client-side data fetching conflicts. TypeScript strict mode + no-explicit-any enforces the `ActionResult` pattern and Sanity query typing. All localStorage access via `lib/localStorage.ts` eliminates SSR hydration mismatches.

**Structure Alignment:**
Every architectural decision has a corresponding location in the project structure. The `sections/`/`ui/` split directly mirrors the RSC/client component boundary. `lib/` contains all server-only integration code; no `lib/` module is ever imported in a client component. `sanity/queries/` isolates all GROQ from component logic.

### Requirements Coverage Validation ✅

**Functional Requirements — 40/40 covered:**
All FR categories (Guest Experience, Story/Content, RSVP, Personalization, Admin Content, Admin Guest, Accessibility, System/Integration) have named files and components in the project structure. Each FR was explicitly mapped in the Requirements to Structure Mapping table.

**Non-Functional Requirements — 30/30 addressed:**
- Performance (7 NFRs): SSG + RSC-first + `next/image` + `next/font` + Framer Motion reduced-motion
- Security (7 NFRs): HMAC-SHA256 webhook, env var assertions at load, server-side GROQ, Turnstile, Vercel HTTPS
- Accessibility (7 NFRs): `useReducedMotion()` in all client islands, semantic section HTML, 44px touch targets, 16px minimum text
- Integration (5 NFRs): localStorage queue for Sheets failure, Resend failure non-blocking, ISR < 10s pipeline, typed error handling
- Reliability (4 NFRs): Vercel 99.99% SLA, CDN-first static serving, RSVP independent of Sanity, ~100 guest scale

### Implementation Readiness Validation ✅

**Decision Completeness:** All critical decisions documented with technology names, versions, rationale, and code-level implications. No open decisions remain that would block the first implementation story.

**Structure Completeness:** Every file named, every directory explained, every component mapped to its FR. Agents have no ambiguity about where new code belongs.

**Pattern Completeness:** 7 conflict points identified and resolved with ✅/❌ code examples. Naming, structure, format, communication, and process patterns are all specified.

### Gap Analysis Results

**Critical Gaps:** None.

**Important Gaps Identified and Resolved:**

1. **Missing `emails/` directory** — React Email templates for Resend were not in the original structure. Added:
   - `emails/GuestConfirmation.tsx` — "We've been waiting for you" HTML email template
   - `emails/AdminNotification.tsx` — new RSVP alert email to Jave + Nianne

2. **Missing `public/robots.txt`** — PRD specifies no public indexing (invite-only site). Added `public/robots.txt` disallowing all crawlers.

3. **Sanity Studio Next.js config requirement** — Embedded Studio requires explicit configuration:

```typescript
// next.config.ts
const nextConfig = {
  transpilePackages: ['@sanity/ui', '@sanity/icons'],
}
// app/studio/[[...tool]]/page.tsx must export:
export const dynamic = 'force-dynamic'
```

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed (40 FRs, 30 NFRs, 4 user journeys)
- [x] Scale and complexity assessed (Low-Medium; ~100 guests; no compliance)
- [x] Technical constraints identified (iOS audio, haptics, scroll-snap, free tier limits)
- [x] Cross-cutting concerns mapped (animation/reduced-motion, platform divergence, WCAG AA, guest identity, ISR chain, secrets)

**✅ Architectural Decisions**
- [x] Technology stack fully specified (Next.js 15, Sanity, Vercel, Resend, Google Sheets, Turnstile, Framer Motion)
- [x] Rendering strategy per route (SSG, generateStaticParams, API Route, client Studio)
- [x] Integration patterns defined (Server Actions, GROQ server-only, webhook HMAC, localStorage queue)
- [x] All NFRs architecturally addressed

**✅ Implementation Patterns**
- [x] 7 conflict points identified and resolved
- [x] Naming conventions: Sanity schemas, files, components, TypeScript, CSS tokens
- [x] Format patterns: ActionResult, image rendering, date formatting, env var assertion
- [x] Communication patterns: RSC→client props, reduced-motion, Framer Motion variants
- [x] Process patterns: localStorage SSR-safe, loading states, no `any`

**✅ Project Structure**
- [x] Complete directory tree with all files named and FR-mapped
- [x] Component boundaries: `sections/` (RSC) vs `ui/` (client islands)
- [x] Integration points: API boundaries, data boundaries, data flow diagrams
- [x] 3 gaps identified and resolved (`emails/`, `robots.txt`, Studio config)

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level: High** — All 40 FRs, 30 NFRs, and 4 user journeys are architecturally covered. No open decisions remain. Patterns are specific enough to prevent agent conflicts.

**Key Strengths:**
- RSC-first with explicit client islands keeps bundle size within NFR-P5 (< 300KB JS)
- localStorage-queued RSVP + decoupled integrations means RSVP never fails from the guest's perspective
- Sanity Studio as the single admin interface means Nianne has one login for content + RSVP dashboard
- `generateStaticParams()` + ISR means personalized pages are CDN-served with zero origin latency

**Areas for Future Enhancement (post-MVP):**
- Cloudinary plugin when gallery exceeds Sanity's 10 GB limit (post-wedding)
- Vercel Analytics for visitor insight (post-launch)
- Phase 2: Illustrated Lipa map, day-of boarding pass, layered ambient music
- Phase 3: January 7th easter egg, light mode, end credits entourage

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented — no alternative interpretations
- Use implementation patterns with the provided ✅/❌ examples as the standard
- Respect the `sections/` (RSC) vs `ui/` (client) boundary — no exceptions without explicit justification
- Refer to this document for all architectural questions before making new decisions

**First Implementation Story:**
```bash
git clone https://github.com/serge-0v/next-js-sanity-starter nijao-wedding-2027
cd nijao-wedding-2027 && pnpm install
```
Then: configure Vercel project, connect GitHub repo, add all environment variables from `.env.example`, configure Sanity project, set up Sanity webhook pointing to `/api/revalidate`.
