---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish, step-12-complete]
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-nijao-wedding-2027-2026-04-03.md
  - _bmad-output/planning-artifacts/research/technical-wedding-website-tech-stack-research-2026-04-03.md
  - _bmad-output/brainstorming/brainstorming-session-2026-03-08-0001.md
briefCount: 1
researchCount: 1
brainstormingCount: 1
projectDocsCount: 0
classification:
  projectType: web_app
  domain: general
  complexity: low-medium
  projectContext: greenfield
workflowType: 'prd'
---

# Product Requirements Document - nijao-wedding-2027

**Author:** Javej
**Date:** 2026-04-03

## Executive Summary

Nijao Wedding 2027 is a bespoke, single-page wedding website for Jave & Nianne — college sweethearts who became a couple on January 7, 2017, marrying exactly ten years and one day later on January 8, 2027, at Casa 10 22, Lipa, Batangas, Philippines. It is a cinematic experience: a scroll through a love story, an Aman-level welcome for every guest, a ceremony that begins the moment someone opens the link.

Off-the-shelf wedding platforms treat the website as a form: answer when, where, and are you coming, then get out of the way. For Jave & Nianne — whose story spans a Philippine college campus, a decade of quiet accumulation, a Mt. Fuji proposal, and a homecoming wedding in a venue with vaulted ceilings and garden windows — that is insufficient. Zola, The Knot, and Withjoy have no architecture for this story.

The guiding north star: every guest should feel the way you feel when you arrive at an Aman resort. *We've been waiting for you.*

### What Makes This Special

**The core insight:** "Ten years. One more day." — the couple became a couple the day before what would become their 10th anniversary wedding date. Six words that contain the entire emotional arc of the site. No template could ever hold this story; it had to be built.

**The scroll is the ceremony.** No navigation menu. Guests walk the aisle at Casa 10 22 in order — from the `.jn` monogram drawing itself, through a 10-year love story in scroll-locked chapters, to an RSVP that feels like a personal invitation. The venue's architecture — its aisle, vaulted ceiling, floor-to-ceiling garden windows — is the literal UI metaphor.

**Aman-level guest hospitality.** Personalized arrival links, an illustrated Lipa map, a day-of boarding pass, and a confirmation that says *"We've been waiting for you."* Guests are hosted, not processed.

**A site built to live for two years.** Content drops, entourage reveals, pre-wedding teasers, and post-wedding gallery — managed entirely by the couple through Sanity CMS, with zero developer dependency after handoff.

## Project Classification

| Attribute | Value |
|---|---|
| **Project Type** | Web Application (SPA, mobile-first) |
| **Domain** | General / Consumer (events & lifestyle) |
| **Complexity** | Low-Medium — no compliance requirements; technical complexity from CMS integration, personalized guest links, Google Sheets API, Resend email, admin layer |
| **Project Context** | Greenfield — custom build, no existing codebase |
| **Tech Stack** | Next.js 15 + Sanity CMS + Vercel + Google Sheets API + Resend |
| **Timeline** | MVP by mid-2026 → wedding ready December 2026 → legacy post January 8, 2027 |

## Success Criteria

### User Success

| Metric | Target | How Measured |
|---|---|---|
| RSVP response rate | ≥ 90% of ~100 invited guests | Google Sheets RSVP dashboard |
| RSVP channel | 100% via site — no off-site responses accepted | Absence of Viber/text RSVPs |
| Diaspora logistics questions to couple | 0 after site launch | Absence of logistical DMs to Jave or Nianne |
| Nianne's first solo content update | Completed without Jave's help | Qualitative — she does it alone |
| RSVP → Google Sheets row | Appears within 5 seconds of submission | Manual end-to-end test |
| RSVP → confirmation email | Delivered within 60 seconds | Manual end-to-end test |

### Business Success

**Phase 1 — Foundation:** Site live at custom domain, core sections published, RSVP end-to-end functional, Sanity Studio accessible to Nianne without documentation.

**Phase 2 — Complete:** All entourage content published, illustrated Lipa map and hotel recommendations live, boarding pass / day-of itinerary card ready, supplier Google Sheet populated.

**Phase 3 — Wedding Ready:** ≥ 90 RSVPs collected, zero outstanding logistical questions from diaspora guests, final headcount exportable for caterer.

**Phase 4 — Legacy:** Wedding gallery published post-January 8, 2027. Site preserved as a permanent memory artifact — no expiry, no takedown.

*Note: Phase target dates are indicative and will flex with development pace. The hard deadline is January 8, 2027.*

### Technical Success

| Metric | Target |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s on simulated Philippine LTE, mid-range Android |
| CLS (Cumulative Layout Shift) | < 0.1 |
| INP (Interaction to Next Paint) | < 200ms |
| Lighthouse mobile score | ≥ 90 |
| Uptime on wedding day | 99.99% (Vercel SLA) |
| Sanity publish → live on site | < 10 seconds via webhook + ISR |

### Measurable Outcomes

The MVP is complete and ready for first guest link when:
1. A guest can open a personalized link, walk the full story scroll, and submit an RSVP — end to end — on a mid-range Android in under 3 minutes
2. Their RSVP row appears in Google Sheets within 5 seconds
3. They receive a confirmation email within 60 seconds
4. Nianne has successfully published at least one content update without Jave's help
5. Lighthouse mobile score ≥ 90, LCP < 2.5s on simulated Philippine LTE

## Product Scope

### MVP — Minimum Viable Product

*Everything required before the first guest link goes out.*

**Experience & Identity**
- `.jn` monogram draw-on loader
- Hero section with "Ten years. One more day." tagline and ambient orchestral music
- Palette-as-wayfinding — 8 named colors as section accents, no navigation menu
- Scroll-locked chapter architecture

**Story**
- 10-year love story in scroll chapters (2017 → 2027, one image + one sentence per year minimum)
- Mt. Fuji proposal section
- Arrival overlay — *"Welcome. We're so glad you're here."*

**Wedding Details**
- Ceremony — St. Therese Parish, date, time
- Reception — Casa 10 22, Lipa, Batangas
- Dress code section — palette-coded

**Entourage**
- Digital Padrino Wall — ninongs/ninangs with palette color cards
- Full wedding party list

**RSVP & Guest Hospitality**
- Conversational RSVP (chat-bubble style, mobile-optimized)
- Personalized guest links — each guest greeted by name on arrival
- RSVP → Google Sheets (real-time row append)
- Confirmation email via Resend — *"We've been waiting for you"*

**Admin**
- Sanity CMS Studio — Nianne updates content without code
- RSVP dashboard — live headcount, export for caterer
- Personalized guest link generator
- Webhook + ISR — content live in < 10 seconds

### Growth Features (Phase 2)

- Illustrated Lipa map (hand-drawn, wedding palette)
- Day-of boarding pass / itinerary card (saveable)
- Post-RSVP welcome kit email (illustrated map + couple note + hotel context for diaspora)
- Ambient scroll-triggered layered music (per-section instrument builds)

### Vision (Phase 3 & Delight Layer)

- January 7th easter egg — site transforms on the actual 10th anniversary eve
- Batangas day/night light mode — calibrated to highland light quality
- End credits entourage — full list scrolling upward to orchestral music
- Haptic RSVP confirmation — three pulses + petal burst on mobile
- Dress code palette visualizer — "does my outfit work?"
- Haiku transitions between sections

### Post-Wedding

- Wedding gallery — published within 2 weeks of January 8, 2027
- Site preserved as permanent memory artifact — no content expiry

### Explicitly Out of Scope

- SEO / organic discovery — site is invite-only, direct links only
- Apple/Google Wallet native boarding passes
- Shared Spotify playlist embed
- Any form of e-commerce or payment processing

## User Journeys

### Journey 1: Ate Karen — The Local Guest (Primary / Happy Path)

Karen is a college friend, now based in Makati. She's in a Viber group with mutual friends when Nianne drops a link with the message *"it's up!"* She's on her Samsung Galaxy A55, commuting home on the MRT, standing.

She taps the link. The screen goes dark. A dot appears — then a slow, deliberate stroke: `.jn`. The monogram draws itself. Music begins — a single cello note. An overlay fades in: *"Welcome. We're so glad you're here."* She didn't expect to feel anything. She does.

She scrolls. No menu to figure out. Each chapter snaps into place — a photo, one sentence, one year. 2017: a classroom. 2019: a road trip. 2023: a mountain she recognizes as Fuji. *"She said yes."* Karen screenshots this. She sends it to another college friend: *"OMG look at this."*

She reaches the RSVP. A chat bubble appears: *"Will you be joining us on January 8?"* She types "Yes." It asks her meal preference. She picks. It asks if she's bringing a plus-one. She's not. One more bubble: *"We've been waiting for you."* Three gentle pulses from her phone. Petals. She smiles on the MRT.

Thirty seconds later, her inbox has an email. Subject: *We've been waiting for you.* It has the date, the church, the venue, and a note from Jave and Nianne. She saves it.

**Capabilities revealed:** Personalized links, monogram loader, scroll-locked chapters, ambient music, arrival overlay, conversational RSVP, haptic confirmation, confirmation email via Resend, Google Sheets row append.

---

### Journey 2: Kuya Mark — The Diaspora Guest (Primary / Logistics-Heavy Path)

Mark is Jave's cousin, based in Singapore. He gets the link directly from Jave via WhatsApp. He opens it on his laptop at home, evening.

He experiences the same cinematic opening — the monogram, the music, the overlay. He scrolls through the story and feels the weight of ten years compressed into a single scroll. He's flying home for this.

He gets to Wedding Details. He needs to know: *What time does it start? Where exactly is the venue? Where do I stay?* The ceremony details answer the first two cleanly. He taps the dress code — the palette card tells him *"Smart formal, in tones of green or pink."* He checks his wardrobe mentally.

He reaches the RSVP. Types yes. The chat asks about his plus-one — his wife is coming. Two guests confirmed. The confirmation email arrives with the illustrated Lipa map *(Phase 2)*, hotel recommendations near Casa 10 22, and the day-of itinerary. He forwards it to his wife: *"Here's everything."* She replies: *"This is actually beautiful."*

He does not message Jave asking for the venue address.

**Capabilities revealed:** Desktop-responsive layout, ceremony and reception detail sections, dress code section, personalized link (couple name greeting), two-guest RSVP handling, diaspora-aware confirmation email, illustrated Lipa map (Phase 2), hotel recommendations (Phase 2).

---

### Journey 3: Senior Family Member — The Tita (Primary / Accessibility Edge Case)

Tita Cora is 62. Nianne's aunt. Her daughter sends her the link via Viber on her iPhone SE. She opens it. The monogram draws. Music plays — she didn't expect that, but she smiles.

She scrolls slowly. The snap-scroll feels a little unfamiliar at first but she figures it out — there's only one direction and the sections lock into place naturally. She reads each year of the story. She finds the wedding details. She finds the RSVP chat. She types "oo" (Tagalog "yes"). The chat understands. It asks if she's bringing a plus-one — she's not. She gets the confirmation.

She calls her daughter: *"I did it! And it's so ganda."*

There are no navigation menus to get confused by. There is no form with 12 fields. There is only scrolling and answering simple questions. The intentional simplicity — no nav, conversational RSVP — is the accessibility feature.

**Capabilities revealed:** Scroll-only navigation (no menu = no confusion), conversational RSVP with natural language tolerance, clear plain-language prompts, mobile-optimized layout on small screens (375px+).

---

### Journey 4: Nianne — The Content Owner (Admin Path)

It's September 2026. Nianne wants to publish the entourage reveal. She's been waiting for one ninang to confirm, and today she did.

She opens a browser tab — Sanity Studio, bookmarked. She logs in. She navigates to *Entourage → Ninangs*. She finds the card for the newly confirmed ninang, fills in her photo and color assignment (Berry Meringue), and toggles her card to *Published*.

She clicks Publish. The site updates within seconds — the Digital Padrino Wall now shows the complete lineup.

She does not call Jave. She does not wait for a deploy. She screenshots the live site and sends it to the entourage group chat.

Later that week, she publishes a new announcement: *"Three months to go."* She types it directly into Sanity, sets a publish date, and saves. It goes live automatically.

Jave has not touched the codebase in eight weeks.

**Capabilities revealed:** Sanity CMS Studio (browser-based, no-code), entourage content schema, announcements schema, section toggle (published/draft), webhook + ISR (< 10 second publish), RSVP dashboard (headcount view, export).

---

### Journey Requirements Summary

| Capability Area | Revealed By |
|---|---|
| Personalized guest links + name greeting | Karen, Mark |
| Monogram draw-on loader | All guests |
| Scroll-locked chapter architecture | All guests |
| Ambient music + arrival overlay | All guests |
| Conversational RSVP (mobile-first, natural language) | Karen, Tita Cora |
| Haptic confirmation + petal burst | Karen |
| RSVP → Google Sheets (real-time) | Karen, Mark |
| Confirmation email via Resend | Karen, Mark |
| Desktop-responsive layout | Mark |
| Ceremony, reception, dress code sections | Mark, Tita Cora |
| Illustrated Lipa map + hotel recs (Phase 2) | Mark |
| Scroll-only navigation (no menu) | Tita Cora |
| Sanity CMS Studio | Nianne |
| Entourage + announcements schemas | Nianne |
| Webhook + ISR (< 10s publish) | Nianne |
| RSVP dashboard + headcount export | Nianne |

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. The Scroll as Ceremony — Eliminating Navigation Entirely**
Every wedding website assumes guests need a menu to find what they want. This product challenges that assumption: guests don't browse a wedding, they attend it. The scroll-locked chapter architecture eliminates the navigation menu and replaces it with a single linear journey — walk the aisle, in order. The venue's physical aisle is the literal UI metaphor. This is a novel interaction pattern for the category.

**2. Palette-as-Wayfinding**
Rather than color being decorative, the 8 named palette colors function as invisible navigation — each section's left-edge accent tells you where you are. No labels. No breadcrumbs. A design system doing wayfinding without a single navigation element.

**3. The Conversational RSVP**
RSVP forms are universally transactional — fields, dropdowns, a submit button. This product replaces the form entirely with a chat-bubble interface that feels like texting the couple. The confirmation message ("We've been waiting for you") treats a data submission as a human moment. This reframes the most transactional interaction on the site as its most emotionally resonant.

**4. The Monogram as Interface Primitive**
The `.jn` monogram is not decoration — it is the loader, the transition element, and the first interaction every guest has with the site. Turning the most annoying UX moment (loading) into a branded ceremony is a direct inversion of standard web convention.

**5. Story-First Product Architecture**
Wedding platforms are built around logistics (dates, venues, RSVPs) with story as optional decoration. This product inverts the hierarchy: the love story is the architecture, and logistics are embedded within it. The "Ten years. One more day." discovery isn't a tagline — it is the structural spine of the entire experience.

### Market Context & Competitive Landscape

No existing wedding platform (Zola, The Knot, Withjoy, Squarespace) offers scroll-locked narrative architecture, no-navigation design, or conversational RSVP. Custom-built wedding sites exist but are typically developer-built templates with limited interaction design ambition. The hospitality benchmark (Aman Resorts) comes from outside the wedding category entirely — borrowed from luxury travel UX. This cross-domain borrowing is itself an innovation signal.

### Validation Approach

| Innovation | Validation Method |
|---|---|
| Scroll-only navigation | User test with Tita Cora archetype — can a 60-year-old non-technical user complete the RSVP without a menu? |
| Conversational RSVP | Track completion rate — target ≥ 95% of guests who start RSVP submit it |
| Monogram loader | Qualitative — does the first 10 seconds feel ceremonial, or does it feel slow? Test with real guests |
| Palette-as-wayfinding | Do guests know where they are in the scroll without labels? Validate in usability testing |

### Risk Mitigation

| Risk | Mitigation |
|---|---|
| Scroll-lock confuses users on certain devices | Cross-browser/device testing; graceful degradation to natural scroll if snap-scroll fails |
| No-nav means guests can't jump to key sections on return visits | Minimal floating anchor set (Wedding Details, Dress Code, RSVP) — progressive disclosure after first full scroll-through; state stored in `localStorage` |
| Conversational RSVP feels gimmicky rather than warm | Tone of prompts is critical — plain language, short sentences, warm but not saccharine |
| Monogram loader perceived as slow | Must complete in < 2 seconds; if connection is slow, loader doubles as genuine loading feedback |

## Web App Specific Requirements

### Project-Type Overview

Nijao Wedding 2027 is a **single-page application (SPA)** with scroll-locked chapter architecture. The site is entirely content-driven and invite-only — no public-facing SEO surface, no multi-page routing, no app shell navigation. Guests receive a direct URL and experience the site as a linear cinematic journey from top to bottom.

### Browser Matrix

| Browser | Versions | Priority |
|---|---|---|
| Chrome (Android) | Latest 2 | P1 — primary guest device |
| Safari (iOS) | Latest 2 | P1 — primary guest device |
| Chrome (Desktop) | Latest 2 | P2 — diaspora guests on laptop |
| Safari (macOS) | Latest 2 | P2 — diaspora guests on laptop |
| Other browsers | Not supported | Out of scope |

**Key browser-specific concerns:**
- **iOS audio autoplay** — Safari blocks audio autoplay without user gesture. Ambient music must be triggered by first user interaction (scroll or tap), not on page load. A subtle "tap to unmute" affordance is required.
- **Scroll-snap cross-browser** — CSS `scroll-snap-type` behavior varies. Must be tested on both Chrome Android and Safari iOS before first guest link goes out.
- **Haptic feedback** — `navigator.vibrate()` is supported on Chrome Android; not available on iOS. Haptic confirmation degrades gracefully to visual-only petal burst on iOS.

### Responsive Design

**Mobile-first, designed at 390px.** All layout decisions start at mobile width. Desktop is an enhancement, not the baseline.

| Breakpoint | Target Devices | Design Approach |
|---|---|---|
| 375px+ | iPhone SE, small Android | Minimum supported width; full experience |
| 390px | iPhone 14/15 (design base) | Primary design canvas |
| 412px | Samsung Galaxy mid-range | Primary Android target |
| 768px+ | Tablets | Comfortable reading layout |
| 1024px+ | Desktop / laptop | Kuya Mark scenario; wider content columns |

**Floating Navigation Anchor Set**

A minimal set of floating anchors appears **after the guest has completed their first full scroll-through** (i.e., reached the RSVP section for the first time). On return visits, these persist as a subtle persistent element — never a nav bar, never disruptive to the cinematic layout.

| Anchor | Target Section |
|---|---|
| Wedding Details (calendar glyph) | Ceremony + Reception block |
| Dress Code (palette swatch) | Dress code section |
| RSVP (envelope or heart glyph) | Conversational RSVP |

**Design constraints:**
- Positioned bottom-right, small — does not overlap content
- Uses palette color of the current section (palette-as-wayfinding continues)
- Hidden on first visit until guest reaches RSVP for the first time (state stored in `localStorage`)
- `prefers-reduced-motion` respected — no bounce or pulse animation if motion is reduced

### Performance Targets

| Metric | Target | Context |
|---|---|---|
| LCP | < 2.5s | Simulated Philippine LTE, mid-range Android |
| CLS | < 0.1 | Critical for snap-scroll layout stability |
| INP | < 200ms | Conversational RSVP interactions |
| Lighthouse mobile | ≥ 90 | Measured on simulated LTE |
| Time to first meaningful paint | < 1.5s | Monogram loader should begin within 1.5s |
| Total page weight (initial load) | < 300KB JS | React Server Components minimize JS shipped |

**Performance strategy:** Static generation (SSG) for all content sections; zero JS shipped for read-only pages via React Server Components; only the RSVP form and monogram animation are client components. Images served via `next/image` (WebP, lazy-loaded, sized per breakpoint).

### SEO Strategy

**Not applicable.** The site is invite-only — guests receive personalized direct links. No public indexing, no sitemap, no Open Graph optimization. `robots.txt` will disallow all crawlers.

*Exception:* Basic meta tags (title, description) are included for when guests share the URL preview in messaging apps (Viber, WhatsApp). The preview should show the couple's name and wedding date, not a blank card.

### Accessibility Level

**Target: WCAG 2.1 AA**

| Requirement | Implementation |
|---|---|
| Color contrast | All text meets 4.5:1 ratio against background; verified across all 8 palette colors |
| Keyboard navigation | Full keyboard traversal through chapters and RSVP (even without a nav menu) |
| Screen reader support | Semantic HTML throughout; ARIA labels on interactive elements; chapter headings as landmarks |
| Focus management | Visible focus indicators; focus trapped correctly in RSVP chat interface |
| Motion | `prefers-reduced-motion` respected — scroll animations and monogram draw-on disabled for users who opt out |
| Text sizing | No text below 16px on mobile; all text scales correctly with system font size |
| Touch targets | Minimum 44×44px for all interactive elements (RSVP chat inputs, buttons) |

**Practical note:** The no-navigation-menu architecture is, counterintuitively, an accessibility advantage for senior users — there is nothing to get confused by. WCAG AA compliance formalizes what the design already intends.

### Implementation Considerations

- **Framework:** Next.js 15 App Router — SSG for content pages, Server Actions for RSVP submission
- **Styling:** Tailwind CSS — purges unused CSS at build time; palette as CSS custom properties (`--color-deep-matcha`, `--color-raspberry`, etc.)
- **Animation:** CSS-first where possible; GSAP or Framer Motion only for the monogram draw-on and scroll-triggered effects
- **State:** Minimal — RSVP form state lives in a single client component; `localStorage` for first-visit tracking (floating anchor reveal); no global state management needed
- **Fonts:** Self-hosted via `next/font` — eliminates Google Fonts render-blocking and GDPR concerns

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP — the minimum that delivers the full cinematic emotional experience with RSVP fully functional. A partial experience (story without RSVP, or RSVP without story) is not a viable guest-facing product. The monogram, the scroll, the arrival overlay, and the conversational RSVP must all work before the first guest link goes out.

**Resource:** Two developers (Jave + Nianne), solo project. No external dependencies on contractors or agencies. Nianne additionally owns all content management post-handoff.

### MVP Feature Set (Phase 1)

*The Product Scope section lists MVP features by category. The table below maps each capability to its rationale — use this as the prioritization reference during development.*

**Core User Journeys Supported:**
- Ate Karen (local guest) — arrival → story scroll → RSVP → confirmation email
- Tita Cora (senior guest) — scroll-only navigation, conversational RSVP, no menu confusion
- Kuya Mark (diaspora guest) — desktop layout, wedding details, dress code, RSVP
- Nianne (admin) — Sanity Studio content updates without Jave's help

**Must-Have Capabilities:**

| Capability | Rationale |
|---|---|
| `.jn` monogram draw-on loader | First interaction — sets the entire tone |
| Hero + "Ten years. One more day." | Emotional anchor; without it the site is just a wedding site |
| Scroll-locked chapter architecture | The core interaction innovation; defines the product |
| 10-year love story chapters | The story IS the product |
| Mt. Fuji proposal section | Emotional climax of the story arc |
| Arrival overlay | Aman hospitality starts here |
| Ambient orchestral music (single loop) | Sound before visuals; muted by default on iOS with tap-to-unmute |
| Palette-as-wayfinding (8 colors) | Navigation system without a nav menu |
| Ceremony + reception details | Guests need to know when and where |
| Dress code section (palette-coded) | Reduces the #1 Filipino guest anxiety |
| Digital Padrino Wall | Honours the Filipino sponsor tradition |
| Full wedding party list | Expected entourage section |
| Conversational RSVP (chat-bubble, mobile-first) | Core conversion; replaces the form entirely |
| Personalized guest links | Guests greeted by name; Aman hospitality layer 1 |
| RSVP → Google Sheets (real-time) | Operational data for caterer |
| Confirmation email via Resend | *"We've been waiting for you"* |
| Floating anchor set (Wedding Details, Dress Code, RSVP) | Progressive disclosure after first scroll-through; return visit usability |
| Sanity CMS Studio | Nianne manages content without code |
| RSVP dashboard + headcount export | Jave and Nianne monitor responses |
| Personalized guest link generator | Admin tool to create and manage guest URLs |
| Webhook + ISR (< 10s publish) | Content changes go live instantly |
| Custom domain + Vercel deployment | Site live at a real URL |

### Post-MVP Features

**Phase 2 — Guest Hospitality Layer:**
- Illustrated Lipa map (hand-drawn, wedding palette)
- Day-of boarding pass / saveable itinerary card
- Post-RSVP welcome kit email (map + hotel recs + couple note)
- Ambient scroll-triggered layered music (per-section instrument builds on the base loop)

**Phase 3 — Delight Layer:**
- January 7th easter egg — site transforms on the 10th anniversary eve
- Batangas day/night light mode
- End credits entourage — full list scrolling upward to orchestral music
- Haptic RSVP confirmation (Chrome Android) + petal burst (all mobile)
- Dress code palette visualizer
- Haiku section transitions

**Post-Wedding:**
- Wedding gallery (published within 2 weeks of January 8, 2027)
- Site preserved as permanent memory artifact

### Risk Mitigation Strategy

**Technical Risks:**

| Risk | Likelihood | Mitigation |
|---|---|---|
| Scroll-snap cross-browser inconsistency (P1 risk) | Medium | Build and test scroll architecture first — before any other section; if snap-scroll fails, graceful degradation to smooth scroll with IntersectionObserver-based chapter detection |
| iOS audio autoplay blocked | High (guaranteed) | Design music as opt-in from day one; "tap to unmute" affordance built into monogram loader interaction |
| Personalized link generation at scale (100 guests) | Low | Sanity-backed guest list + slug-based routing; straightforward Next.js dynamic route pattern |
| Sanity free tier asset limit (10 GB) | Low-Medium | Use `next/image` compression aggressively; add Cloudinary plugin if gallery exceeds 200 photos post-wedding |

**Resource Risks:**

Two developers (Jave + Nianne) with complementary roles — significantly reduces single-point-of-failure risk. No resource contingency plan needed beyond prioritizing MVP ruthlessly if timelines compress. The hard deadline (January 8, 2027) is immovable; scope flexes, deadline does not.

## Functional Requirements

### Guest Experience & Navigation

- **FR1:** A guest can experience a full-screen monogram draw-on animation as the first interaction upon site load
- **FR2:** A guest can hear ambient orchestral music that begins on first user interaction (scroll or tap)
- **FR3:** A guest can see a full-screen arrival overlay greeting them upon entering the site
- **FR4:** A guest can navigate the site exclusively by vertical scrolling, with chapters locking into place sequentially
- **FR5:** A guest can identify their current position in the site via section-specific palette color accents, without a navigation menu
- **FR6:** A guest can access a minimal floating anchor set (Wedding Details, Dress Code, RSVP) after completing their first full scroll-through
- **FR7:** A guest with a personalized link is greeted by name upon arrival

### Love Story & Content

- **FR8:** A guest can read the 10-year love story presented as scroll-locked chapters (one image, one caption per year, 2017–2027)
- **FR9:** A guest can experience the Mt. Fuji proposal as a dedicated story section
- **FR10:** A guest can view ceremony details (church, date, time, location)
- **FR11:** A guest can view reception details (venue name, address, date, time)
- **FR12:** A guest can view dress code guidance presented in the wedding palette
- **FR13:** A guest can view the Digital Padrino Wall — ninongs and ninangs listed with their assigned palette color cards
- **FR14:** A guest can view the full wedding party / entourage list

### RSVP & Guest Hospitality

- **FR15:** A guest can submit an RSVP through a conversational chat-bubble interface
- **FR16:** A guest can specify a plus-one within the RSVP flow only if their personalized link is pre-designated as plus-one eligible — guests without eligibility do not see the plus-one prompt
- **FR16a:** An admin can designate plus-one eligibility per guest when managing the guest list
- **FR18:** A guest receives an in-site confirmation message upon RSVP submission
- **FR19:** A guest receives a confirmation email upon RSVP submission
- **FR20:** A guest's RSVP submission is recorded in real time to a shared Google Sheet

### Personalization & Links

- **FR21:** An admin can generate a unique personalized URL for each guest
- **FR22:** The system can identify a guest by their unique URL and display their name in the arrival greeting
- **FR23:** A guest's first-visit completion status is stored locally so return visits surface the floating anchor set

### Admin — Content Management

- **FR24:** An admin can create, edit, and publish all site content sections (hero, story chapters, wedding details, entourage, announcements) without writing code
- **FR25:** An admin can upload and manage photos and images for all content sections
- **FR26:** An admin can toggle individual content sections between draft and published states
- **FR27:** An admin can publish a new announcement and have it appear on the site within 10 seconds
- **FR28:** An admin can schedule content to publish at a future date and time

### Admin — RSVP & Guest Management

- **FR29:** An admin can view a live RSVP dashboard showing current headcount and individual responses
- **FR30:** An admin can export the complete RSVP list (guest name, attending, plus-one, timestamp) for the caterer
- **FR31:** An admin can view and manage the full guest list and their personalized link assignments

### Accessibility & Inclusive Design

- **FR32:** A guest using keyboard-only navigation can traverse all chapters and complete the RSVP
- **FR33:** A guest using a screen reader can access all content sections with appropriate semantic structure and labels
- **FR34:** A guest with motion sensitivity can experience the site with animations disabled, respecting their OS preference
- **FR35:** A guest on a small screen (375px+) can access the full site experience without horizontal scrolling or truncated content

### System & Integration

- **FR36:** The system sends a transactional confirmation email to the guest within 60 seconds of RSVP submission
- **FR37:** The system appends an RSVP response row to Google Sheets within 5 seconds of submission
- **FR38:** The system revalidates and republishes affected pages within 10 seconds of a Sanity content publish event
- **FR39:** The system protects the RSVP form from automated spam submissions
- **FR40:** The system serves a messaging app link preview (title, description) when the URL is shared on Viber or WhatsApp

## Non-Functional Requirements

### Performance

| NFR | Requirement |
|---|---|
| NFR-P1 | LCP < 2.5s on simulated Philippine LTE, mid-range Android (Lighthouse throttled mobile) |
| NFR-P2 | CLS < 0.1 across all sections, including snap-scroll transitions |
| NFR-P3 | INP < 200ms for all RSVP chat interactions |
| NFR-P4 | Lighthouse mobile performance score ≥ 90 on production build |
| NFR-P5 | Initial JS bundle < 300KB; content pages ship zero client-side JS via React Server Components |
| NFR-P6 | Monogram draw-on animation begins within 1.5s of page load on target network |
| NFR-P7 | Total page weight (HTML + CSS + critical JS) < 100KB before images |

### Security

| NFR | Requirement |
|---|---|
| NFR-S1 | All secrets (Sanity token, Google Service Account credentials, Resend API key) stored as environment variables — never committed to the repository |
| NFR-S2 | Sanity webhook payloads validated via HMAC-SHA256 signature before triggering page revalidation |
| NFR-S3 | RSVP form protected against automated spam (Cloudflare Turnstile or honeypot field) |
| NFR-S4 | All traffic served over HTTPS — enforced by Vercel on all deployments including previews |
| NFR-S5 | Sanity content API accessed server-side only via read-only token — no API credentials exposed to the browser |
| NFR-S6 | Admin Sanity Studio access requires authenticated login — not publicly accessible without credentials |
| NFR-S7 | Guest personal data (name, RSVP response) stored only in Google Sheets — no persistent database exposed to the internet |

### Accessibility

| NFR | Requirement |
|---|---|
| NFR-A1 | WCAG 2.1 AA compliance across all guest-facing sections |
| NFR-A2 | All text meets minimum 4.5:1 contrast ratio against its background across all 8 palette colors |
| NFR-A3 | All interactive elements have a minimum touch target of 44×44px |
| NFR-A4 | All animations and scroll effects respect `prefers-reduced-motion` — disabled when user OS preference is set |
| NFR-A5 | No text below 16px on mobile; layout does not break when system font size is increased |
| NFR-A6 | Full site navigable via keyboard; focus order follows visual reading order through chapters |
| NFR-A7 | iOS Safari audio autoplay restriction handled gracefully — music never auto-plays without user gesture |

### Integration

| NFR | Requirement |
|---|---|
| NFR-I1 | RSVP submission → Google Sheets row appears within 5 seconds under normal network conditions |
| NFR-I2 | RSVP submission → confirmation email delivered to guest within 60 seconds |
| NFR-I3 | Sanity content publish → site revalidation and updated page live within 10 seconds via webhook + ISR |
| NFR-I4 | Google Sheets integration handles API failures gracefully — RSVP submission must not silently fail; guest receives error feedback if the row cannot be written |
| NFR-I5 | Resend email failures are logged and retried — guest submission is not blocked by email delivery failure |

### Reliability

| NFR | Requirement |
|---|---|
| NFR-R1 | Site uptime ≥ 99.99% on wedding day, January 8, 2027 (Vercel SLA) |
| NFR-R2 | Static content pages served from CDN edge — no origin server dependency for guest-facing reads |
| NFR-R3 | RSVP form remains functional during Sanity outages — form submission does not depend on CMS availability |
| NFR-R4 | Site functions correctly under simultaneous access by all ~100 invited guests |
