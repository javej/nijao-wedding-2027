---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - _bmad-output/brainstorming/brainstorming-session-2026-03-08-0001.md
  - _bmad-output/planning-artifacts/research/technical-wedding-website-tech-stack-research-2026-04-03.md
date: 2026-04-03
author: Javej
---

# Product Brief: nijao-wedding-2027

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

**Nijao Wedding 2027** is a bespoke, single-page wedding website for Jave & Nianne — two college sweethearts from Lipa, Batangas, who became a couple on January 7, 2017, and are getting married exactly ten years and one day later on January 8, 2027. The site is not a logistics portal. It is a cinematic experience: a scroll through a love story, an Aman-level welcome for every guest, and a ceremony that begins the moment someone opens the link.

The product solves a problem that every off-the-shelf wedding platform ignores — that the story *is* the event, and the website should honor it. Where Zola and The Knot give couples a template, this gives Jave & Nianne a world.

The guiding north star: every guest should feel the way you feel when you arrive at an Aman resort. *We've been waiting for you.*

---

## Core Vision

### Problem Statement

Generic wedding websites are transactional. They exist to answer three questions — when, where, and are you coming — and then get out of the way. For most couples, that's sufficient. For Jave & Nianne, it falls catastrophically short. Their story has a setting (a Philippine college campus), a decade of quiet accumulation, a cinematic turning point (a marriage proposal at Mt. Fuji), and a homecoming (a wedding in Lipa, Batangas, in a venue with vaulted ceilings and floor-to-ceiling garden windows). That story deserves to be *told* — not reduced to a countdown timer and a map embed.

Existing wedding platforms also fail the guests. They receive a link, fill out a form, and are done. The hospitality ends at data collection. For a couple whose relationship runs 10 years deep, and whose families span the Philippines and beyond, the website is often the first and most lasting impression of the wedding itself.

### Problem Impact

Guests — especially those traveling from abroad or from distant provinces — arrive at most wedding websites with no sense of the couple's world. They get logistics, not warmth. They fill out an RSVP form and receive a generic "Your response has been submitted" message. The opportunity to make them feel genuinely anticipated, genuinely *hosted*, is wasted.

For the couple themselves, off-the-shelf tools offer no way to manage a living, evolving site over a 1–2 year engagement period — no personalized guest experiences, no content drop strategy, no supplier coordination layer.

### Why Existing Solutions Fall Short

- **Zola / The Knot / Withjoy**: Template-bound, aesthetically generic, no custom interaction design, no story-first architecture. RSVP confirmation is transactional.
- **Squarespace / Webflow**: Design freedom exists, but no built-in CMS workflow, no admin layer, no personalized guest links.
- **Hired developers**: Custom sites exist but are rarely designed with a 2-year self-management lifecycle in mind — they get built and then go stale.
- None of these honor the specific emotional weight of this story: *ten years, one more day.*

### Proposed Solution

A custom-built, single-page wedding website where the scroll experience mirrors walking down the aisle at Casa 10 22. Guests do not navigate — they are *guided*. From the moment the `.jn` monogram draws itself on screen, through the 10-year love story told in quiet chapters, to an RSVP that feels like a personal invitation rather than a form submission, every moment is designed to make the guest feel welcomed and the story feel earned.

Beneath the cinematic surface: an admin layer that lets the couple manage content, publish announcement drops, generate personalized guest links, and monitor RSVPs — all without a developer — for the full duration of the engagement.

### Key Differentiators

1. **The scroll is the ceremony.** No navigation menu. Guests walk the aisle in order, just as they would on January 8, 2027. The venue's architecture — its aisle, its garden windows, its vaulted ceiling — becomes the literal UI metaphor.
2. **"Ten years. One more day."** A love story so specific it could only belong to this couple. The emotional architecture of the site flows from one discovery: that they became a couple the day before what would become their 10th anniversary wedding date.
3. **Aman-level guest hospitality.** Personalized arrival links, illustrated maps of Lipa, day-of boarding passes, and a confirmation message — *"We've been waiting for you"* — that treats every guest as an honored arrival, not a data point.
4. **A site built to live for two years.** Content drops, entourage reveals, pre-wedding teasers, and post-wedding gallery — managed entirely by the couple through a custom admin layer backed by Sanity CMS.

---

## Target Users

### Primary Users

**1. The Filipino Local Guest — "Ate Karen"**

A college friend or extended family member based in the Philippines, most likely in Metro Manila or a nearby province. She opens the site from a Viber group message on a Samsung mid-range Android phone, probably while commuting or at home in the evening. She's not a tech enthusiast but she's comfortable with social media. She wants to know the schedule, what to wear, and whether she needs to book a hotel — but she deserves more than a checklist. She's emotionally invested in this couple. When she arrives at the site and the `.jn` monogram draws itself and the music begins, that moment should feel like it was made for her.

- **Goals:** Confirm attendance, understand dress code, know what to expect on the day
- **Pain point:** Generic wedding sites feel impersonal — she fills out a form and gets an auto-response
- **Success moment:** She reads *"We've been waiting for you"* and screenshots it to send to a mutual friend

**2. The Diaspora Guest — "Kuya Mark"**

A close friend or relative based abroad — Singapore, the US, the Middle East, or Australia. He's flying home specifically for this wedding and is planning his trip around it. He's on desktop as often as mobile. He needs more context than a local guest: Where do I stay near Lipa? How far is the venue from Manila? What's the dress code in the context of a January Batangas evening? The illustrated Lipa map, the hotel recommendations, and the day-of boarding pass are designed for him. He's also the guest most likely to share the site with others abroad.

- **Goals:** Plan travel logistics, find accommodation, understand the full day's itinerary
- **Pain point:** Off-the-shelf wedding sites have no hospitality layer — he has to Google everything separately
- **Success moment:** He saves the boarding pass to his phone and shows it to his wife: *"This is actually beautiful."*

**3. The Couple — Jave (Builder) & Nianne (Content Owner)**

Jave builds the site and owns the technical architecture. Nianne updates it. Both are admin users, but with different interaction patterns. Jave configures the system once — sets up schemas, personalized guest link generation, RSVP dashboard — and then hands the content management off. Nianne should be able to publish a new entourage announcement, upload engagement photos, or toggle a section visible/hidden from a browser tab, with no code. Sanity Studio is their shared interface; it must feel approachable for a non-developer.

- **Goals (Jave):** Build a system that runs itself — zero maintenance calls from Nianne at 11pm
- **Goals (Nianne):** Update content confidently without asking Jave for help
- **Pain point:** Most custom-built sites turn into developer-dependency traps
- **Success moment:** Nianne publishes the entourage reveal herself, on her own schedule, and it goes live instantly

### Secondary Users

**4. Parents & Senior Family Members**

Older relatives — parents, titas, lolos — sent the link by a family member. They may be on older iPhones or basic Androids. The no-navigation-menu architecture is, counterintuitively, an advantage here: there's nothing to get confused by. They scroll, they see the story, they find the RSVP. The conversational RSVP interface (chat-bubble style) should feel intuitive even for those unfamiliar with web forms.

**5. Ninongs & Ninangs (as honorees, not as a separate UX)**

The Digital Padrino Wall honors the entourage in the wedding palette — each sponsor gets an elegant card in their assigned color. From the site's perspective, this is a decorative feature that celebrates their role publicly. They experience it as guests, not as a distinct user type with separate needs.

### User Journey

**The Guest Journey (Local & Diaspora)**

1. **Discovery:** Receives a personalized link via Viber, WhatsApp, or direct message from Jave or Nianne — or a group announcement link shared to a family chat. The URL may include their name.
2. **Arrival:** The `.jn` monogram draws itself. Optional ambient music begins. An arrival overlay: *"Welcome. We're so glad you're here."* First impression = Aman hotel lobby, not a web form.
3. **The Walk:** Scrolls through the site in order — no menu, no shortcuts. Hero → Love Story → Mt. Fuji Proposal → Venue → Wedding Details → Entourage → RSVP. Each chapter unfolds at its own pace.
4. **RSVP:** Conversational interface. Feels like texting the couple. Three gentle haptic pulses + petal burst on submission. Confirmation: *"We've been waiting for you."*
5. **Post-RSVP:** Receives a welcome kit email — illustrated Lipa map, day-of schedule, couple's note. Diaspora guests receive additional hotel and travel context.
6. **Return visits:** The site evolves over 18 months — entourage reveals, countdown updates, pre-wedding content drops. Guests have reason to come back.

**The Admin Journey (Nianne)**

1. Opens Sanity Studio in her browser (accessible at `/studio` or sanity.io/manage)
2. Navigates to the relevant content type — e.g., Gallery, Announcements, Entourage
3. Makes her update — uploads photos, writes an announcement, toggles a section
4. Publishes — the site updates within seconds via webhook, no deploy needed
5. Checks the RSVP dashboard to see current headcount and any new responses

---

## Success Metrics

This is a personal project with a defined end state — January 8, 2027. Success is measured not by growth or revenue, but by guest experience quality, operational reliability, and the couple's ability to manage the site independently over an 18-month lifecycle.

### User Success Metrics

| Metric | Target | How to Measure |
|---|---|---|
| RSVP response rate | ≥ 90% of ~100 invited guests | Google Sheets RSVP dashboard |
| RSVP via site (not Viber/text) | 100% of responses through the site | No off-site RSVP exceptions |
| Diaspora guest logistics questions to couple | 0 after site launch | Absence of logistical DMs to Jave/Nianne |
| Nianne self-publishes content update | First update without Jave's help | Qualitative — she does it alone |
| RSVP confirmation shared/screenshotted | Anecdotal evidence from guests | Guest feedback, social media |

### Business Objectives

**Phase 1 — Foundation (by mid-2026)**
- Site live at custom domain, all core sections published
- RSVP form functional end-to-end: submission → Google Sheets row → confirmation email
- Personalized guest link generation working
- Sanity Studio accessible and usable by Nianne without documentation

**Phase 2 — Complete (by October 2026, ~3 months before wedding)**
- All entourage content published
- Illustrated Lipa map and hotel recommendations live
- Boarding pass / day-of itinerary card ready
- Supplier Google Sheet populated and shared

**Phase 3 — Wedding Ready (by December 2026)**
- ≥ 90 of ~100 RSVPs collected
- Zero outstanding logistical questions from diaspora guests
- Couple has not touched the codebase in at least 6 weeks — site runs itself
- Final headcount exported for caterer

**Phase 4 — Legacy (post January 8, 2027)**
- Wedding gallery published within 2 weeks of the wedding
- Site preserved as a permanent memory artifact — no expiry, no takedown

### Key Performance Indicators

**Performance**
- LCP (Largest Contentful Paint) < 2.5s on Philippine LTE (mid-range Android)
- CLS (Cumulative Layout Shift) < 0.1
- INP (Interaction to Next Paint) < 200ms
- Zero downtime on wedding day (Vercel 99.99% SLA)

**RSVP Funnel**
- Guest opens site → starts RSVP: ≥ 70% conversion
- Starts RSVP → submits: ≥ 95% completion (conversational UI reduces drop-off)
- Submits → Google Sheet row appears: 100% (no silent failures)
- Submits → confirmation email delivered: 100%

**Content & Admin**
- Sanity content update → live on site: < 10 seconds (webhook + ISR)
- Nianne's first solo content update: achieved within 1 month of site launch
- Admin session requiring Jave's intervention: 0 after handoff

---

## MVP Scope

### Core Features

The MVP is the complete guest-facing experience required before the first guest link goes out. Every feature below must work before any guest receives a URL.

**Experience & Identity**
- `.jn` monogram draw-on loader — the ceremonial first moment before anything else renders
- Hero section with "Ten years. One more day." tagline and ambient orchestral music
- Palette-as-wayfinding architecture — 8 named colors as section accents, no navigation menu
- Scroll-locked chapter structure — guests walk the aisle in order, no shortcuts

**Story**
- 10-year love story told in scroll chapters (2017 → 2027, one image + one sentence per year minimum)
- Mt. Fuji proposal section
- Arrival overlay — *"Welcome. We're so glad you're here."*

**Wedding Details**
- Ceremony details — St. Therese Parish, date, time
- Reception details — Casa 10 22, Lipa, Batangas
- Dress code section — palette-coded, clearly communicated

**Entourage**
- Digital Padrino Wall — ninongs and ninangs listed with palette color cards
- Full entourage section — wedding party listed (can be a clean list at launch, not yet the illustrated full wall)

**RSVP & Guest Hospitality**
- Conversational RSVP interface (chat-bubble style, mobile-optimized)
- Personalized guest links — each guest receives a unique URL, greeted by name on arrival
- RSVP → Google Sheets integration — every submission appends a row in real time
- RSVP confirmation email via Resend — *"We've been waiting for you"*
- Haptic confirmation on mobile (three pulses + petal burst on submit)

**Admin**
- Sanity CMS Studio — Nianne can update content, publish announcements, upload photos without code
- RSVP dashboard — live headcount, guest list, export for caterer
- Personalized guest link generator — admin tool to create and manage guest URLs
- Webhook + ISR — content changes go live in < 10 seconds, no redeploy

**Technical**
- Mobile-first, LCP < 2.5s on Philippine LTE (mid-range Android baseline)
- Custom domain live
- Vercel deployment with auto-deploy on GitHub push

### Out of Scope for MVP

These features are valuable but do not block the first guest link from going out. They ship in Phase 2 or 3.

| Feature | Deferred To | Rationale |
|---|---|---|
| Illustrated Lipa map | Phase 2 (Oct 2026) | Requires illustration asset; logistical text is sufficient for MVP |
| Day-of boarding pass / itinerary card | Phase 2 | High-effort; text schedule covers the need at launch |
| Post-RSVP welcome kit email | Phase 2 | Confirmation email ships in MVP; full kit is an enhancement |
| Ambient scroll-triggered music layers (per section) | Phase 2 | Single ambient loop ships in MVP; layered score is Phase 2 |
| January 7th easter egg | Phase 3 (Dec 2026) | By definition activates one day before wedding |
| Day/night Batangas light mode | Phase 3 | Delight layer — no guest is blocked without it |
| Interactive dress code palette harmonizer | Phase 3 | Palette card in dress code section covers the core anxiety |
| End credits entourage scroll | Phase 3 | Simple entourage list ships in MVP |
| Wedding gallery | Post-wedding (Feb 2027) | No content exists until after Jan 8 |
| Apple/Google Wallet boarding passes | Out of scope | Native wallet integration complexity outweighs benefit |
| Shared memory Spotify playlist | Out of scope | Nice-to-have; not guest-critical |

### MVP Success Criteria

The MVP is complete and ready to share when:

1. A guest can open a personalized link, experience the full story scroll, and submit an RSVP — end to end — on a mid-range Android phone in under 3 minutes
2. Their RSVP appears as a row in Google Sheets within 5 seconds of submission
3. They receive a confirmation email within 60 seconds
4. Nianne has successfully published at least one content update without Jave's help
5. Lighthouse mobile score ≥ 90, LCP < 2.5s on simulated Philippine LTE

### Future Vision

Post-wedding, the site becomes a permanent memory artifact — the living record of this story. The gallery is the final chapter. After January 8, 2027, no more active management is required; the site simply exists, loads fast, and tells the story of Jave & Nianne for as long as the domain is renewed.

The longer arc: this codebase and design system could serve as a template for close friends' weddings — the "`.jn` system" as a gift, not a product. But that is entirely optional and never a constraint on the original build.
