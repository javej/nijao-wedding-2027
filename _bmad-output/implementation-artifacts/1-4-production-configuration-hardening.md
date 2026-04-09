# Story 1.4: Production Configuration & Hardening

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want all production environment variables configured in Vercel, security hardening in place (robots.txt, HTTPS, no exposed secrets), and Open Graph meta tags set for messaging app previews,
so that the site is live at the Vercel-provided URL, ready to receive real guest traffic, without any secrets exposed.

## Acceptance Criteria

1. **Given** all production environment variables are configured in Vercel project settings, **When** the production build runs, **Then** the build succeeds with no missing-env warnings and no secrets appear in the browser bundle (verifiable via `pnpm build` output)

2. **Given** HTTPS is enforced by Vercel on all deployments, **When** the production URL is accessed, **Then** the connection is always served over HTTPS — no insecure connections possible

3. **Given** a `robots.txt` file is added to the project, **When** a search engine crawler accesses `/robots.txt`, **Then** it returns `User-agent: * / Disallow: /` — the site is invite-only, not indexed

4. **And** basic Open Graph meta tags (title, description, wedding date) are present in the root layout so that sharing the Vercel URL on Viber or WhatsApp produces a readable preview card rather than a blank one (supports FR40)

## Tasks / Subtasks

- [ ] Task 1 — Update root layout metadata for wedding site (AC: 4)
  - [ ] 1.1 Open `frontend/app/layout.tsx`. The current metadata has placeholder values:
    ```typescript
    title: { template: "%s | Schema UI", default: "Sanity Next.js Website | Schema UI" }
    ```
    Replace with wedding-specific metadata:
    ```typescript
    title: { template: "%s | Jave & Nianne", default: "Jave & Nianne — January 8, 2027" }
    description: "Ten years. One more day. Join us as we celebrate our wedding at Casa 10 22, Lipa, Batangas."
    ```
  - [ ] 1.2 Add Open Graph meta tags to the metadata export:
    ```typescript
    openGraph: {
      title: "Jave & Nianne — January 8, 2027",
      description: "Ten years. One more day. Join us as we celebrate our wedding at Casa 10 22, Lipa, Batangas.",
      type: "website",
      locale: "en_PH",
      siteName: "Jave & Nianne Wedding",
    }
    ```
  - [ ] 1.3 **OG Image:** The current layout references `/images/og-image.jpg` (1200x630). This image likely doesn't exist or is a starter placeholder. For now, either:
    - (a) Create a simple placeholder OG image with the couple's names and date (can be replaced later with a designed version), or
    - (b) Remove the `openGraph.images` reference until a real image is ready
    **Recommendation:** (b) Remove for now — a missing image is better than a starter placeholder. The OG title + description alone will make a readable Viber/WhatsApp preview card. OG image can be added in a later story when visual assets are ready.
  - [ ] 1.4 Remove or update the `robots` metadata in layout.tsx. Currently:
    ```typescript
    robots: process.env.NEXT_PUBLIC_SITE_ENV === "production" ? "index, follow" : "noindex, nofollow"
    ```
    This site is invite-only and should NEVER be indexed. Change to unconditionally:
    ```typescript
    robots: { index: false, follow: false }
    ```
  - [ ] 1.5 Update `metadataBase` — currently uses `NEXT_PUBLIC_SITE_URL`. Ensure this is set to the Vercel production URL (`https://nijao-wedding-2027-frontend.vercel.app`) or the future custom domain. This is required for OG tags to resolve absolute URLs correctly.

- [ ] Task 2 — Add robots.txt (AC: 3)
  - [ ] 2.1 In Next.js App Router, `robots.txt` can be generated via `frontend/app/robots.ts` (the metadata API approach) or as a static file at `frontend/public/robots.txt`. Use the metadata API approach for consistency:
    ```typescript
    // frontend/app/robots.ts
    import type { MetadataRoute } from 'next'

    export default function robots(): MetadataRoute.Robots {
      return {
        rules: {
          userAgent: '*',
          disallow: '/',
        },
      }
    }
    ```
  - [ ] 2.2 Verify by running dev server and accessing `http://localhost:3000/robots.txt` — should return the disallow rule
  - [ ] 2.3 Check if a `frontend/app/sitemap.ts` exists (it does — from the starter). Since the site is invite-only and robots.txt disallows all crawlers, the sitemap is unnecessary. Either:
    - (a) Remove `sitemap.ts` entirely (recommended — no SEO surface)
    - (b) Keep it but ensure it doesn't expose guest slugs
    **Recommendation:** (a) Remove it. The site has no SEO purpose.

- [ ] Task 3 — Remove dark mode infrastructure (AC: 1)
  - [ ] 3.1 The wedding site is single-theme (light only, warm off-white `#faf9f6` background). The starter includes dark mode infrastructure:
    - `ThemeProvider` from `next-themes` wrapping the app in `layout.tsx`
    - `MenuToggle` component (theme mode toggle button) in the header
    - Dark mode CSS custom property overrides in `globals.css`
  - [ ] 3.2 Remove `ThemeProvider` wrapper from `layout.tsx` — the app doesn't need theme switching
  - [ ] 3.3 Remove `next-themes` from `frontend/package.json` dependencies (run `pnpm --filter frontend remove next-themes`)
  - [ ] 3.4 Remove the `MenuToggle` component import/usage from the header (if still referenced)
  - [ ] 3.5 Remove `frontend/components/theme-provider.tsx` and `frontend/components/menu-toggle.tsx` files
  - [ ] 3.6 Remove dark mode CSS overrides from `globals.css` (the `@media (prefers-color-scheme: dark)` block)
  - [ ] 3.7 **Note:** If Story 1.2 has already been implemented, the dark mode removal in globals.css may already be done. Check before duplicating work. If Story 1.2 is NOT done yet, coordinate — whoever runs first handles the globals.css dark mode removal.

- [ ] Task 4 — Clean up starter header/footer for wedding site (AC: 1)
  - [ ] 4.1 The wedding site has NO navigation menu (scroll-only architecture). The starter's header component (`frontend/components/header/index.tsx`) renders a sticky header with desktop nav, mobile nav drawer, and logo. This entire header needs to be either:
    - (a) **Removed entirely** — the wedding site has no header. Remove header from root layout.
    - (b) **Replaced with a minimal shell** — an empty component that can later hold the floating anchor set
    **Recommendation:** (a) Remove the header from the layout. The floating anchor set (Story 3.x) will be an independent client component, not part of the header.
  - [ ] 4.2 Similarly, the footer component (`frontend/components/footer.tsx`) renders navigation links and copyright. The wedding site has no traditional footer. Remove footer from root layout.
  - [ ] 4.3 Remove orphaned component files after layout cleanup:
    - `frontend/components/header/index.tsx`
    - `frontend/components/header/desktop-nav.tsx`
    - `frontend/components/header/mobile-nav.tsx`
    - `frontend/components/footer.tsx`
    - `frontend/components/logo.tsx` (used only by header)
  - [ ] 4.4 Remove `Toaster` (sonner toast provider) from layout if not needed for the wedding site MVP. The RSVP confirmation is an in-site message, not a toast. **Keep it if** toasts might be useful for error feedback; **remove if** the wedding UX doesn't use toasts.
    **Recommendation:** Keep `Toaster` for now — useful for error states in RSVP flow. Low cost to retain.
  - [ ] 4.5 After removing header/footer, verify the layout renders a clean blank page with just the warm off-white background (if Story 1.2 tokens are applied) or the default background

- [ ] Task 5 — Verify env var safety and build (AC: 1, 2)
  - [ ] 5.1 Run `pnpm build` and verify:
    - Build succeeds with no missing-env warnings
    - No secrets appear in client-side chunks (only `NEXT_PUBLIC_*` vars should be in browser code)
  - [ ] 5.2 Verify the `.env.example` file documents all required vars (already done in Story 1.1 — just confirm it's still accurate)
  - [ ] 5.3 Verify `.gitignore` includes `.env.local` and any other secret files (already done in Story 1.1 — confirm)
  - [ ] 5.4 Run `pnpm lint` — zero errors after all changes
  - [ ] 5.5 Verify in browser: open the dev server, check that the page loads cleanly, no console errors related to missing env vars or broken imports from removed components

- [ ] Task 6 — Verify OG preview (AC: 4)
  - [ ] 6.1 After deploying to Vercel (or using the preview URL), test the URL in:
    - A Viber chat (paste URL, check preview card shows title + description)
    - A WhatsApp chat (paste URL, check preview card)
  - [ ] 6.2 If preview doesn't show: verify `metadataBase` is set correctly, and that the OG tags render in the page `<head>` (inspect with browser DevTools)
  - [ ] 6.3 **Note:** This verification requires a deployed build. It can be tested locally using `next build && next start` but the full OG preview test needs a public URL. Test after pushing to a branch (Vercel auto-generates a preview URL).

## Dev Notes

### Current State of layout.tsx

`frontend/app/layout.tsx` currently:
- **Font:** Imports `Inter` from `next/font/google` (weights 400–800), CSS variable `--font-sans`
- **Metadata:** Placeholder titles ("Schema UI"), `robots` conditional on `NEXT_PUBLIC_SITE_ENV`, `openGraph.images` pointing to `/images/og-image.jpg`
- **Providers:** `ThemeProvider` (next-themes) wrapping all children, `Toaster` (sonner) for toast notifications
- **Layout structure:** `<Header>` + `{children}` + `<Footer>` inside `<ThemeProvider>`
- **metadataBase:** Uses `NEXT_PUBLIC_SITE_URL` env var

**After this story:** Layout should have wedding metadata, no ThemeProvider, no Header, no Footer, no dark mode. Just a clean shell with the correct fonts (if Story 1.2 is done) and OG meta tags.

### Coordination with Story 1.2

Both Story 1.2 and 1.4 modify `frontend/app/layout.tsx`:
- **Story 1.2** changes: font imports (Inter → Cormorant Garamond + DM Sans), font CSS variables
- **Story 1.4** changes: metadata (title, description, OG tags, robots), removes ThemeProvider/Header/Footer

**If Story 1.2 runs first:** layout.tsx will already have the new fonts. Story 1.4 just updates metadata and removes wrappers.
**If Story 1.4 runs first:** layout.tsx will still have Inter font. Story 1.2 will replace it later.

**Either order works.** No conflict as long as the dev agent reads the current file state before editing.

### Header/Footer Removal Impact

Removing the header and footer removes these Sanity data fetches from the layout:
- `fetchSanityNavigation()` — fetches navigation links (no longer needed)
- `fetchSanitySettings()` — fetches site settings including logo and siteName

**Impact:** The `navigation` and `settings` Sanity document types (from starter) become unused in the frontend. They don't need to be deleted from Studio schemas — they're harmless and might be useful later. But their fetch functions in `frontend/sanity/lib/fetch.ts` are no longer called from the layout.

**Consider:** If the settings `siteName` is used elsewhere (e.g., in metadata generation via `frontend/sanity/lib/metadata.ts`), keep the fetch. If it's only used by the header/footer, the fetch call can be removed from layout.

### Vercel Production URL

From Story 1.1: The Vercel production URL is `https://nijao-wedding-2027-frontend.vercel.app/`

This should be the `metadataBase` value (or configured via `NEXT_PUBLIC_SITE_URL` env var). When a custom domain is eventually configured, this will change — but for now, use the Vercel URL.

### robots.txt via Next.js Metadata API

Next.js App Router supports generating `robots.txt` via a `robots.ts` file in the app directory. This is preferred over a static `public/robots.txt` because:
- It's co-located with other metadata (layout.tsx, sitemap.ts)
- It can be dynamic if needed (though for this site it's always "disallow all")
- It follows the same pattern as other Next.js metadata files

### HTTPS Enforcement

HTTPS is enforced by Vercel automatically on all deployments (production and preview). No code changes needed for AC: 2. This is a Vercel platform guarantee — no middleware or redirect code required.

### What This Story Does NOT Do

- Does NOT configure the custom domain (that's a Vercel dashboard action, not code)
- Does NOT set up the Sanity webhook endpoint (that's Story 4.x)
- Does NOT configure Cloudflare Turnstile (that's Story 3.x)
- Does NOT add real values for env vars in Vercel — the dummy/placeholder approach from Story 1.1 is sufficient until the actual services are set up
- Does NOT create the `[guest-slug]` dynamic route (that's Story 3.x)

### Previous Story Intelligence (Story 1.1)

- **Vercel URL:** `https://nijao-wedding-2027-frontend.vercel.app/`
- **Env vars in Vercel:** All 6 vars set with dummy values — build passes
- **`.env.example`:** Already created at repo root with all 6 keys
- **`.gitignore`:** Includes `.env.local` — confirmed
- **`pnpm build`:** Builds both frontend and studio workspaces successfully
- **Route group:** `(main)` — the main page is at `frontend/app/(main)/page.tsx`
- **Sanity fetch guards:** `isSanityConfigured` check prevents build failures with placeholder env vars — this means removing header/footer (which call Sanity fetch functions) won't break the build even if other Sanity fetches remain

### Architecture Compliance

From `architecture.md` — these rules apply:
- [ ] NFR-S1: All secrets as environment variables — never committed
- [ ] NFR-S4: HTTPS enforced by Vercel (automatic)
- [ ] NFR-S5: Sanity content API server-side only — no API credentials in browser
- [ ] FR40: Messaging app link preview (OG meta tags)
- [ ] No navigation menu at any time on first visit — header removal aligns with this

### Project Structure Notes

New files:
```
frontend/app/robots.ts   (new — robots.txt metadata)
```

Modified files:
```
frontend/app/layout.tsx   (metadata update, remove ThemeProvider/Header/Footer)
```

Deleted files:
```
frontend/components/header/index.tsx      (no nav menu)
frontend/components/header/desktop-nav.tsx (no nav menu)
frontend/components/header/mobile-nav.tsx  (no nav menu)
frontend/components/footer.tsx             (no footer)
frontend/components/logo.tsx               (used only by header)
frontend/components/theme-provider.tsx     (no dark mode)
frontend/components/menu-toggle.tsx        (no dark mode toggle)
frontend/app/sitemap.ts                    (no SEO surface)
```

Potentially removed dependencies:
```
next-themes  (if ThemeProvider removed)
```

### References

- Architecture: Infrastructure → Vercel, HTTPS, custom domain [Source: `_bmad-output/planning-artifacts/architecture.md` → Infrastructure]
- Architecture: Security → NFR-S1, NFR-S4, NFR-S5 [Source: `_bmad-output/planning-artifacts/architecture.md` → Security Requirements]
- PRD: FR40 — messaging app link preview [Source: `_bmad-output/planning-artifacts/prd.md` → Functional Requirements → System & Integration]
- PRD: SEO Strategy — invite-only, robots.txt disallow all [Source: `_bmad-output/planning-artifacts/prd.md` → SEO Strategy]
- PRD: NFR-S4 — HTTPS enforced [Source: `_bmad-output/planning-artifacts/prd.md` → Non-Functional Requirements → Security]
- UX Design: No navigation menu architecture [Source: `_bmad-output/planning-artifacts/ux-design-specification.md` → Navigation]
- Epics: Story 1.4 requirements [Source: `_bmad-output/planning-artifacts/epics.md` → Story 1.4]
- Story 1.1: Vercel URL, env var scaffold, build verification [Source: `_bmad-output/implementation-artifacts/1-1-project-bootstrap-vercel-deployment.md`]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
