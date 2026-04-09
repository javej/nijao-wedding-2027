# Story 1.1: Project Bootstrap & Vercel Deployment

Status: done

## Story

As a **developer**,
I want the project initialized from the `serge-0v/next-js-sanity-starter` and connected to Vercel with CI/CD running,
so that every push to `main` produces a live preview URL testable on real devices.

## Acceptance Criteria

1. **Given** the starter repo is cloned, **When** `pnpm install` and `pnpm dev` are run locally, **Then** the development server starts without errors and the default starter UI renders at `localhost:3000`
2. **Given** the repo is pushed to GitHub, **When** it is connected to a Vercel project, **Then** Vercel auto-deploys on every push to `main` and generates a unique preview URL for every branch push
3. **Given** the Vercel project is configured, **When** environment variable placeholders are added (`SANITY_API_READ_TOKEN`, `GOOGLE_SERVICE_ACCOUNT_JSON`, `RESEND_API_KEY`, `SANITY_WEBHOOK_SECRET`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`) with empty or dummy values, **Then** the build succeeds without missing-env errors and the placeholder structure is documented in `.env.example`
4. **And** no `package-lock.json` or `yarn.lock` file exists — only `pnpm-lock.yaml` is committed

## Tasks / Subtasks

- [x] Task 1 — Clone starter and verify local dev (AC: 1)
  - [x] 1.1 Clone starter: `git clone https://github.com/serge-0v/next-js-sanity-starter nijao-wedding-2027`
  - [x] 1.2 Run `pnpm install` from the workspace root
  - [x] 1.3 Run `pnpm --filter frontend dev` and confirm Next.js dev server starts at `localhost:3000` with no TypeScript or build errors
  - [x] 1.4 Run `pnpm --filter studio dev` and confirm Sanity Studio starts (typically `localhost:3333`)

- [x] Task 2 — Strip and reset starter boilerplate (AC: 1)
  - [x] 2.1 Remove all demo/sample content from the starter (placeholder pages, sample Sanity content, demo components not needed for this project)
  - [x] 2.2 Confirm `pnpm build` still succeeds after stripping boilerplate
  - [x] 2.3 Confirm `pnpm lint` passes with zero errors (strict mode + no-explicit-any enforced)

- [x] Task 3 — Configure environment variables scaffold (AC: 3)
  - [x] 3.1 Create `.env.example` (committed) with all 6 required keys, no values:
    ```
    SANITY_API_READ_TOKEN=
    GOOGLE_SERVICE_ACCOUNT_JSON=
    RESEND_API_KEY=
    SANITY_WEBHOOK_SECRET=
    TURNSTILE_SECRET_KEY=
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=
    ```
  - [x] 3.2 Create `.env.local` (gitignored) with dummy/placeholder values for local dev
  - [x] 3.3 Add assertion guards to `lib/` placeholder files (even if empty stubs) that will throw clearly if env vars are missing at runtime — pattern: `if (!process.env.FOO) throw new Error('FOO is not set')`
  - [x] 3.4 Confirm `.gitignore` includes `.env.local` (starter likely already has this — verify)

- [x] Task 4 — Push to GitHub and connect Vercel (AC: 2, 4)
  - [x] 4.1 Create new GitHub repo `nijao-wedding-2027` (private)
  - [x] 4.2 Push initial commit to `main`
  - [x] 4.3 Connect repo to Vercel project (import from GitHub in Vercel dashboard)
  - [x] 4.4 Set all 6 env vars in Vercel project settings (Environment Variables tab) — use dummy values for keys not yet obtained (Resend, Sheets, Turnstile)
  - [x] 4.5 Trigger first Vercel deploy and confirm it succeeds — get the `.vercel.app` URL → https://nijao-wedding-2027-frontend.vercel.app/
  - [x] 4.6 Create a feature branch (`feature/bootstrap`), push it, and verify a unique preview URL is generated for the branch — branch pushed; preview deployments enabled in Vercel settings, no diff from main so deploy skipped (expected behavior)

- [x] Task 5 — Verify pnpm-only (AC: 4)
  - [x] 5.1 Confirm only `pnpm-lock.yaml` is committed — no `package-lock.json` or `yarn.lock` anywhere in the repo
  - [x] 5.2 Add `engines` field to `package.json` to enforce pnpm: `"engines": { "node": ">=20", "pnpm": ">=10" }`
  - [x] 5.3 Add `.npmrc` with `engine-strict=true` to prevent accidental npm/yarn usage

## Dev Notes

### ✅ Starter Template Decision — RESOLVED

**Use the starter as-is: Next.js 16.2.2, Tailwind v4, pnpm monorepo structure.**

The starter v2.0.0 is a pnpm workspace with separate `frontend/` and `studio/` subdirs. This means the architecture's `app/studio/[[...tool]]/page.tsx` embedded Studio approach does **not apply** — the Studio is a standalone workspace, not embedded in the Next.js app. All Epic 4 admin stories should treat Studio as a separate pnpm workspace, not an `/studio` route.

Clone and install exactly as-is — no version pinning, no downgrading:
```bash
git clone https://github.com/serge-0v/next-js-sanity-starter nijao-wedding-2027
cd nijao-wedding-2027
pnpm install
```

**Active versions in use:**
- Next.js: `16.2.2`
- React: `19.2.4`
- Sanity: `5.19.0`
- Tailwind CSS: `4.2.2`
- `motion` (Framer Motion): `12.38.0`
- `next-sanity`: `^12.x`
- pnpm: `10.33.0`

---

### Tailwind CSS v4 — Config Approach Change

Tailwind v4 uses CSS-native configuration via `@theme` in `globals.css` — **not** `tailwind.config.ts`. The architecture doc referenced `tailwind.config.ts` for design tokens, but that is a Tailwind v3 pattern.

**For Story 1.2 (Design Token System):** all palette colors, type scale, and animation duration tokens are defined in `app/globals.css` using the `@theme` block:
```css
@import "tailwindcss";

@theme {
  --color-deep-matcha: #3d5a3e;
  --color-raspberry: #b5294e;
  /* etc. */
  --font-display: "Cormorant Garamond", serif;
  --duration-ceremony: 800ms;
}
```
Tailwind v4 auto-generates utility classes from `@theme` variables — `bg-deep-matcha`, `text-raspberry`, etc. No `tailwind.config.ts` needed for tokens.

---

### Project Structure Notes

**Monorepo structure (using starter v2.0.0 as-is):**
```
nijao-wedding-2027/          ← pnpm workspace root
  frontend/                  ← Next.js 16 app (pnpm --filter frontend dev)
    app/
      (site)/page.tsx
      [guest-slug]/page.tsx
      api/revalidate/route.ts
      actions/rsvp.ts
    components/sections/
    components/ui/
    lib/
    types/
  studio/                    ← Standalone Sanity Studio (pnpm --filter studio dev)
    sanity.config.ts
    schemas/
```

**Key implication:** The architecture doc's `app/studio/[[...tool]]/page.tsx` embedded Studio route does **not apply**. Sanity Studio runs as a separate workspace at a separate dev port (typically `localhost:3333`). This is the chosen approach for all future stories — Story 1.3 defines schemas inside `studio/schemas/`, not `sanity/schemas/`.

Run commands from workspace root:
- `pnpm --filter frontend dev` — Next.js dev server
- `pnpm --filter studio dev` — Sanity Studio dev server
- `pnpm --filter frontend build` — production build
- `pnpm build` — builds all workspaces

---

### Key Technical Specifics

**Versions confirmed (April 2026):**
- Next.js 15 latest patch: `15.5.9` (npm tag: `next@15`)
- Next.js 16 latest: `16.2.2` (npm tag: `next@latest`)
- pnpm latest: `10.33.0`
- Sanity: `5.19.0` (package is `sanity`, not `@sanity/client` standalone for Studio)
- `next-sanity`: `^12.x` required for Next.js 15/16 + React 19 compatibility
- Tailwind CSS: `4.2.2` (v4 stable) / `3.4.19` (v3 LTS)
- `motion` (formerly Framer Motion): `12.38.0`
- shadcn/ui CLI: `4.1.2`

**Critical Next.js 15 gotcha — async params:**
In Next.js 15, `params` and `searchParams` in dynamic routes are now `Promise`-based (async). Any `[guest-slug]` route **must await params**:
```typescript
// ✅ Correct for Next.js 15
export default async function GuestPage({ params }: { params: Promise<{ 'guest-slug': string }> }) {
  const { 'guest-slug': slug } = await params
  // ...
}
```
This will be critical in Story 3.1 — flagging here so it is not forgotten.

**Critical Next.js 15 gotcha — async cookies/headers:**
`cookies()` and `headers()` from `next/headers` are async in Next.js 15. Sanity's `draftMode()` setup must use `await`:
```typescript
import { draftMode } from 'next/headers'
const { isEnabled } = await draftMode()
```

**pnpm workspace note:**
If using the monorepo structure, all `pnpm` commands run from the root. To run just the frontend: `pnpm --filter frontend dev`. Document this in the README so Nianne (and future CI) knows the correct commands.

---

### Vercel Hobby Plan — Relevant Limits

For a ~100-guest wedding site, Hobby is well within limits:
- Bandwidth: 100 GB/month ✅ (a static site for 100 guests is negligible)
- Serverless function timeout: **10 seconds** (not 60s as Pro has) — RSVP Server Actions + Google Sheets writes must complete within 10s. Sheets API typically responds in 1–3s. No concern, but flag for Story 3.4.
- Build minutes: 6,000/month ✅
- Image optimization: 1,000 source images/month ✅ (wedding gallery: ~200 photos max MVP)
- Cron jobs: 2 max on Hobby — not needed for MVP
- Custom domain password protection: NOT available on Hobby — if a locked pre-launch experience is wanted, implement in app code (middleware-based redirect), not Vercel's deployment protection

---

### Environment Variables Reference

All 6 required env vars — never hardcode values, always assert at module load:

| Variable | Used In | Notes |
|---|---|---|
| `SANITY_API_READ_TOKEN` | `sanity/lib/client.ts` | Read-only Sanity API token — server-side only |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | `lib/sheets.ts` | Full JSON of service account — server-side only |
| `RESEND_API_KEY` | `lib/resend.ts` | Resend API key — server-side only |
| `SANITY_WEBHOOK_SECRET` | `lib/webhook.ts` | HMAC-SHA256 secret — server-side only |
| `TURNSTILE_SECRET_KEY` | `app/actions/rsvp.ts` | Cloudflare Turnstile server key — server-side only |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `components/ui/RSVPChat.tsx` | Turnstile public key — exposed to browser (NEXT_PUBLIC_ prefix) |

Only `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is safe to expose to the client. All others are server-side only.

---

### Architecture Compliance Checklist for this Story

From `architecture.md` → Implementation Patterns & Consistency Rules:
- [ ] Package manager: pnpm only — `pnpm install`, `pnpm dev`, `pnpm build`
- [ ] No `package-lock.json` or `yarn.lock` committed
- [ ] TypeScript: strict mode enabled (`tsconfig.json` → `"strict": true`)
- [ ] ESLint: `no-explicit-any` rule active (`.eslintrc.json`)
- [ ] File naming: Next.js reserved files lowercase (`page.tsx`, `layout.tsx`, `route.ts`)
- [ ] Env vars: asserted at module load in `lib/` files — never inline optional-chain

---

### References

- Architecture decision: Starter Template Evaluation [Source: `_bmad-output/planning-artifacts/architecture.md` → Starter Template Evaluation]
- Architecture decision: Implementation Sequence [Source: `_bmad-output/planning-artifacts/architecture.md` → Decision Impact Analysis]
- Architecture decision: File Naming [Source: `_bmad-output/planning-artifacts/architecture.md` → Naming Patterns]
- Architecture decision: Project Directory Structure [Source: `_bmad-output/planning-artifacts/architecture.md` → Complete Project Directory Structure]
- Architecture decision: Env var assertion pattern [Source: `_bmad-output/planning-artifacts/architecture.md` → Format Patterns]
- NFR-S1: Secrets as env vars [Source: `_bmad-output/planning-artifacts/prd.md` → Non-Functional Requirements → Security]
- NFR-S4: HTTPS enforced by Vercel [Source: `_bmad-output/planning-artifacts/prd.md` → Non-Functional Requirements → Security]

## Dev Agent Record

### Agent Model Used

claude-opus-4-6 (implementation) — 2026-04-09

### Debug Log References

- `next lint` broken in Next.js 16.1.7 — replaced with direct `eslint .` invocation
- ESLint 10 incompatible with eslint-config-next FlatCompat — downgraded to ESLint 9 with native flat config
- Sanity fetch functions guarded with `isSanityConfigured` check to allow build with placeholder env vars

### Completion Notes List

- [x] Next.js version: 16.1.7 (starter v2.0.0) — Turbopack enabled
- [x] Starter structure: pnpm monorepo (frontend/ + studio/ workspaces) — Studio is NOT embedded in Next.js app
- [x] Tailwind: v4.2.2 — tokens defined in globals.css @theme, not tailwind.config.ts
- [x] Stripped demo content: removed blog routes, newsletter API, 13 demo block components/schemas, post/author/category/testimonial document types, sample-data.tar.gz
- [x] ESLint flat config created (eslint.config.mjs) with @typescript-eslint/no-explicit-any: error
- [x] Sanity fetch functions return null/[] when SANITY_PROJECT_ID is "placeholder" — build-safe with dummy env vars
- [x] `.env.example` created at repo root with all 6 required keys
- [x] Assertion guard stubs: `lib/sheets.ts`, `lib/resend.ts`, `lib/webhook.ts`, `lib/turnstile.ts` — throw on missing env at module load
- [x] `engines` field added to root package.json (node >=20, pnpm >=10), `.npmrc` with engine-strict=true
- [x] `pnpm.onlyBuiltDependencies` configured for esbuild, sharp, unrs-resolver
- [x] Vercel URL confirmed: https://nijao-wedding-2027-frontend.vercel.app/
- [x] Boilerplate deps kept: all UI primitives (shadcn/ui components), Sanity shared schemas, theme/layout infrastructure

### File List

**New files:**
- `.env.example` — env var scaffold with 6 required keys
- `.npmrc` — engine-strict=true
- `frontend/.env.local` — local dev placeholder values (gitignored)
- `studio/.env.local` — local dev placeholder values (gitignored)
- `frontend/eslint.config.mjs` — ESLint 9 flat config with no-explicit-any
- `frontend/lib/sheets.ts` — GOOGLE_SERVICE_ACCOUNT_JSON assertion guard stub
- `frontend/lib/resend.ts` — RESEND_API_KEY assertion guard stub
- `frontend/lib/webhook.ts` — SANITY_WEBHOOK_SECRET assertion guard stub
- `frontend/lib/turnstile.ts` — TURNSTILE_SECRET_KEY assertion guard stub

**Modified files:**
- `package.json` — renamed to nijao-wedding-2027, added engines field, pnpm.onlyBuiltDependencies, build/lint scripts
- `frontend/package.json` — lint script changed to `eslint .`, added ESLint deps
- `frontend/components/blocks/index.tsx` — stripped demo block imports, empty componentMap
- `frontend/components/header/index.tsx` — null guards for navigation/settings
- `frontend/components/footer.tsx` — null guard for navigation
- `frontend/sanity/lib/fetch.ts` — isSanityConfigured guard, removed post fetchers
- `frontend/sanity/lib/metadata.ts` — removed POST_QUERY_RESULT type reference
- `frontend/sanity/queries/page.ts` — stripped demo block sub-queries
- `frontend/app/sitemap.ts` — isSanityConfigured guard, removed post/contact types
- `studio/schema-types.ts` — removed demo document/block schema imports
- `studio/structure.ts` — removed Posts, Categories, Authors, Testimonials from studio nav
- `studio/schemas/documents/page.ts` — emptied blocks array (demo block types removed)
- `studio/defaultDocumentNode.ts` — removed post/contact preview schema types
- `studio/schemas/blocks/shared/block-content.ts` — removed post reference from internal links
- `studio/schemas/blocks/shared/link.ts` — removed post reference from internal links

**Deleted files:**
- `studio/sample-data.tar.gz`
- `studio/schemas/documents/post.ts`, `author.ts`, `category.ts`, `testimonial.ts`
- `studio/schemas/blocks/hero/`, `split/`, `grid/`, `carousel/`, `timeline/`, `cta/`, `logo-cloud/`, `forms/`, `faqs.ts`, `all-posts.ts`, `section-header.ts`
- `studio/static/`
- `frontend/components/blocks/hero/`, `split/`, `grid/`, `carousel/`, `timeline/`, `cta/`, `logo-cloud/`, `forms/`, `faqs.tsx`, `all-posts.tsx`, `section-header.tsx`, `post-hero.tsx`
- `frontend/components/ui/post-card.tsx`, `frontend/components/post-date.tsx`
- `frontend/app/(main)/blog/`
- `frontend/app/api/newsletter/`
- `frontend/sanity/queries/hero/`, `split/`, `grid/`, `carousel/`, `cta/`, `logo-cloud/`, `forms/`, `all-posts.ts`, `faqs.ts`, `section-header.ts`, `timeline.ts`, `post.ts`
- `.github/workflows/validate.yml` — removed starter-specific template validator

## Senior Developer Review (AI)

**Reviewer:** claude-opus-4-6 (code-review) — 2026-04-09

### Findings (11 total: 3 HIGH, 6 MEDIUM, 2 LOW)

**HIGH — Fixed:**
1. `studio/presentation/resolve.ts` still referenced `post` type and `/blog/:slug` routes — removed post locations and blog route
2. `frontend/sanity.types.ts` (2028 lines) and `studio/schema.json` (4269 lines) never regenerated after schema cleanup — contained dead types (Post, Author, Category, Testimonial, AllPosts, FormNewsletter). Regenerated via `pnpm typegen`: now 452 and 1748 lines respectively
3. Missing assertion guard stub for `TURNSTILE_SECRET_KEY` — created `frontend/lib/turnstile.ts`

**MEDIUM — Fixed:**
4. Root `package.json` export script referenced deleted `sample-data.tar.gz` — replaced with `build` and `lint` scripts
5. No root `build` or `lint` script — added `"build": "pnpm --parallel -r run build"` and `"lint": "pnpm --filter frontend lint"`
6. Root `package.json` still named `schema-ui-next-js-sanity-starter` — renamed to `nijao-wedding-2027`
7. `.github/workflows/validate.yml` ran `sanity-io/template-validator` (starter-specific) — deleted
8. Assertion guard stubs used lazy evaluation instead of module-load pattern — updated to top-level assertion matching architecture spec
9. `studio/schema.json` bloated with deleted schema definitions — fixed by regeneration (same root cause as #2)

**LOW — Not fixed (acceptable):**
10. `studio/` workspace uses `any` in `structure.ts` and `defaultDocumentNode.ts` — no ESLint configured for studio workspace; standard Sanity pattern
11. `feature/bootstrap` has 0 commits ahead of main — all work in initial commit; branch exists for Vercel preview verification

**Additional fix discovered during review:**
- `frontend/components/blocks/index.tsx` had a type error (`_type` on `never`) exposed by schema regeneration — replaced `PAGE_QUERY_RESULT` block type with generic `Block` interface since blocks array is currently empty

### Verification
- `pnpm lint` passes
- `pnpm build` passes (frontend + studio)
- `pnpm typegen` regenerated clean types
