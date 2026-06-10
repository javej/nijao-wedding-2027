# ADR 0007 — Story chapters use a fixed photo anchor with a bounded caption

- **Status:** Accepted
- **Date:** 2026-06-09
- **Related:** [ADR-0004](0004-proposal-chapter-merged-into-storychapter-with-gallery.md) (proposal merged into `storyChapter`); the love-story scroll look-and-feel revamp.

## Context

Each **story chapter** ([StoryChapter.tsx](../../frontend/components/sections/StoryChapter.tsx)) renders one year of the love story as a "page in the album": a year (large serif italic), a 4:5 photo (or auto-cycle crossfade), and a caption — stacked inside the inner safe area of a patterned `PageCard` ([PageCard.tsx](../../frontend/components/ui/PageCard.tsx)).

On landscape (laptop) viewports, the `PageCard` clamps its height to `90dvh`, which gives the inner content area a **fixed** height. A prior fix made the photo the *flexible* element — `flex-1` absorbed whatever vertical space the year and caption left behind. The unintended consequence: **the photo's size became a function of the caption's length.** A one-line-caption chapter showed a large photo; a five-line-caption chapter showed a small one. Scrolling the timeline, the eye landed on a differently-sized, differently-positioned photo in every chapter — the album read as accidental rather than composed.

This collides with the product's stated design language. The [UX spec](../../_bmad-output/planning-artifacts/ux-design-specification.md) commits hard to an A24 reference: *"one image + one caption per unit — the constraint forces quality"* and *"restraint lets the story breathe."* In that idiom the **image frame is the constant** — same place, same size, every title card — and text orbits it in a fixed zone.

A secondary problem: the year and caption sat in **hard, semi-opaque rounded pills** (`--text-backdrop` fill + `backdrop-blur` + `rounded-md`) to stay readable over the embossed ornament. They read as UI chips, not as type printed on a page.

We considered three structural options for what stays constant chapter-to-chapter:

| Option | What's fixed | What flexes | Result |
|---|---|---|---|
| **Caption-as-anchor** (status quo) | A reserved text block | The photo fills remaining space | Captions never truncate, but photo size/position drift with caption length — the imbalance. |
| **Free-floating group** | Nothing; the year+photo+caption group is vertically centered, photo max-height capped | The whole group's position | Photo size stabilizes, but its *vertical position* still shifts as the centered group grows/shrinks with caption length. |
| **Photo-as-anchor** | Photo size **and** position (fixed zones); caption length bounded | Only the amount of empty space below a short caption | Photo is identical in every chapter. Forces a caption length cap. |

## Decision

**The photo is the anchor.** The page-card inner area is divided into three fixed-percentage zones — a year band (top), a photo band (middle), and a caption band (bottom) — that sum to the full inner height. The photo is a height-driven 4:5 print (`h-full w-auto … max-w-full`) centered in its band, so it occupies the same size and the same vertical position in every chapter regardless of caption length. On landscape it floats with visible margin inside the embossed frame; on portrait it naturally widens toward the frame (height-driven + width-capped), giving mobile the more immersive read without a separate layout.

The caption band is **reserved** and its text is **top-aligned**: a short caption leaves empty space at the *bottom* of its band rather than re-centering and dragging the photo with it. That reserved emptiness is the cost of a photo that never moves — it is intentional, not a gap to be closed.

Because the photo and its zones are fixed, the caption **must** be bounded. The `caption` field on the `storyChapter` schema gains a **hard `max(140)` validation** (≈ one or two short sentences, ~2–3 lines), surfaced to the content editor while typing. There is **no ellipsis truncation** anywhere — capping happens at authoring time in Studio, never as a silent CSS clip with a "…". A quiet `overflow-hidden` on the caption band exists only as a clean-edge backstop against a legacy over-length caption; it is not the enforcement mechanism.

Separately, the year and caption pills are replaced with a **shadow-lift** (`chapter-lift` utility in [globals.css](../../frontend/app/globals.css)) — no background at all, just a soft tone-aware `text-shadow` halo (driven by `--text-halo`, set per page in `ChapterSection`: dark halo under white type on deep pages, light halo under dark type on cream/strawberry pages). Type reads as print on the page, contrast floor (4.5:1) preserved, no rounded-rectangle chip. (An intermediate **feathered radial scrim** was tried first and rejected — keyed to `--text-backdrop`, it read as a smudge/stain on the embossed paper.)

The chapter **caption font** also changes from the body sans (DM Sans) to **Newsreader** (`--font-caption`), an editorial text serif scoped to the love-story captions only — body and UI elsewhere stay DM Sans. Newsreader is a deliberately *different* serif lineage from the Cormorant Garamond year, so the title/caption pairing reads intentional rather than like two near-identical Garamonds.

The **proposal chapter** ([ProposalStack.tsx](../../frontend/components/sections/ProposalStack.tsx)) keeps its distinct scroll-pinned photo-stacking mechanic, **and gets its own readability treatment.** The climax sits on the light strawberry-milk page, where the shadow-lift fails — a light halo cannot separate dark serif type from a light background, and the type reads faint over the embossing plus the photo-stack shadows. Since it is the most important chapter before the wedding, readability wins over consistency: the proposal's year and caption sit on an **ivory caption card** (`chapter-card`) — a warm-white opaque plate that reads like a paper label tucked into the album. It is also the only chapter with a card, so the treatment doubles as the climax's signature. A bolder deep-matcha plate (cream on green, tying the palette) was considered and set aside as heavier against the delicate embossing.

## Amendments

- **2026-06-10 — caption cap raised 140 → 280.** The bounded-caption principle stands; only the bound changed. Captions running a touch long against the original 140-character limit warranted a little more room, so the schema `max()` and editor copy now allow 280. The reserved photo-anchor zones and the `overflow-hidden` backstop are unchanged — the caption band still flexes only into the empty space below a short caption, and the cap is still enforced at authoring time, never by ellipsis. References to "140" below describe the original decision.

## Consequences

### Positive

- The love-story scroll reads as one composed album. The photo is the constant the eye trusts from chapter to chapter.
- The caption cap enforces the A24 "the constraint forces quality" ideal at the data layer, not by hope.
- The feathered scrim removes the most UI-like element on the page; year and caption read as printed type.
- One layout serves both orientations (height-driven photo + width cap), so there is no separate mobile composition to maintain.

### Negative

- **Existing long captions must be trimmed.** Production captions over 140 characters (e.g. the 2017 chapter, ~195 chars) will fail validation the next time they're edited, and until trimmed they can overflow the reserved band (clipped cleanly by the backstop, never ellipsized). This is a one-time content task for the couple in Studio.
- **A short caption shows deliberate empty space.** Anyone unaware of the anchor decision may read the gap below a one-line caption as a layout bug rather than an intentional reservation. This ADR is the answer to "why is there space there?"
- **The ~56% photo band is landscape-tuned.** The percentage is a starting point; the portrait feel is verified visually rather than assumed identical.

### Rejected alternatives

- **Caption-as-anchor.** Keeps captions unbounded but is the exact source of the imbalance being fixed.
- **Free-floating bounded group.** Stabilizes photo size but not position; the photo still drifts vertically as the centered group changes height with caption length.
- **CSS `line-clamp` with ellipsis.** Would bound the caption visually with zero content edits, but truncating a love-story line with "…" is the least elegant possible outcome and was explicitly ruled out.
- **Shrinking the year.** The year is the timeline title ("Year 8 — the proposal"); it never caused the crowding (the flexing photo did). Demoting it would weaken the ten-year narrative spine for no layout benefit.
