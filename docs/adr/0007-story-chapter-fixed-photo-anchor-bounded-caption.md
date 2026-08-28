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

- **2026-06-19 — caption band re-sized to hold 280, then zones re-balanced to maximize the photo.** The 2026-06-10 amendment raised the cap but left the reserved zones sized for ~140 chars, so a full-length caption overflowed the band and the `overflow-hidden` backstop clipped the bottom of the caption plate (a hard-cut edge, not graceful) — the backstop was silently doing enforcement work the schema cap was supposed to own. Two coupled changes fixed it:

  1. **Caption fits at the cap.** The caption font is now responsive (`clamp(0.75rem, 1.85dvh, 0.9375rem)`) so it shrinks on shorter viewports rather than clipping; leading tightened (`relaxed` → `snug`) and horizontal padding reduced (`px-8` → `px-6`). The cap is `0.9375rem` (15px) rather than the prior 1rem body size — 15px Newsreader stays comfortably readable, and the extra headroom is what lets the photo grow (below). The `overflow-hidden` is back to being a true never-triggered backstop.

  2. **Photo maximized within the page, spacing evened out.** With the caption able to fit in less room, the photo band was *grown* rather than shrunk (44% → **48%**; year band 16% → **14%**), reclaiming the dead space that pooled below a near-max caption — on a phone that gap ran ~86px. The photo stays the anchor: identical size and position in every chapter at a given viewport. Net effect on a phone, the photo grew from ~245×196 to ~292×234, and the four vertical gaps (top / year–photo / photo–caption / bottom) land within a few px of each other, so the year, photo, and caption read as one evenly-spaced stack centered in the embossed frame.

  The binding case for "how big can the photo be" is a **narrow-and-tall phone** (e.g. 360×800): narrow width wraps the caption to the most lines, and a tall viewport pushes the responsive font toward its cap — together the worst squeeze on the caption band. 48% is the largest photo band that still clears a ~280-char caption there with margin. (An earlier attempt at 56% looked right only because the test viewport was artificially short — ~732px, where the font shrank enough to fit — and clipped ~37px on a real 844px phone. The fix was verified afterward with Playwright driving true device-sized viewports.) Verified at 360–1440px across portrait and short landscape: a ~270–284-char caption is fully contained with margin everywhere. The "~56% photo band" figure in *Consequences* below predates this retune.

- **2026-06-25 — proposal chapter gets the same caption treatment, with a smaller photo band.** The 2026-06-19 retune fixed the *year* chapters ([StoryChapter.tsx](../../frontend/components/sections/StoryChapter.tsx)) but the **proposal** ([ProposalStack.tsx](../../frontend/components/sections/ProposalStack.tsx)) still used the pre-retune caption styling (fixed `text-body-md` ≈ 16px, `leading-relaxed`, `px-8`, **no `overflow-hidden` backstop**), so a full-length caption ran past the bottom of the ivory caption card — worst on a short landscape laptop. Two changes bring it in line:

  1. **Caption matches the year chapters.** The proposal caption is now the responsive `clamp(0.75rem, 1.85dvh, 0.9375rem)` with `leading-snug`, `px-6`, and the `overflow-hidden` clean-edge backstop — identical to the year-chapter caption band.

  2. **Photo band 48% → 42% (proposal only).** Unlike a year chapter's single-line header, the proposal header is two lines ("2025" + "The Proposal") at display sizes, so it is taller and leaves the caption band less room. Trimming the photo band hands that difference back to the caption so a full-length caption clears the card. The stacked-photo mechanic is unaffected — its slot offsets and rise are fixed px, independent of the band size; the photos just render slightly smaller.

  Verified in-browser with the production ~281-char caption injected at 1440×820 and 1366×768 (landscape) and 541-wide portrait: caption renders ~146px in a ~154px band on the binding short laptop — 0px clipped, ≥74px clearance below — and fits with more room in portrait. The binding case for the proposal is the **short landscape laptop** (fixed 90dvh card + the taller two-line header), not the narrow-tall phone that bounds the year chapters.

- **2026-08-28 — caption font Newsreader → Montserrat, zones re-balanced, proposal header made height-aware.** The caption serif is replaced by **Montserrat** (`--font-caption`), a geometric sans. The pairing logic from *Decision* is unchanged in spirit — the caption face is still deliberately unrelated to the Cormorant Garamond year — but the contrast is now serif-vs-sans rather than two serif lineages. The reason is legibility at caption size over the embossed page: measured at the same nominal size, Montserrat's x-height is **20% larger** than Newsreader's (0.53em vs 0.44em), so the caption reads meaningfully bigger without the nominal size rising at all. References to "Newsreader" above describe the original decision.

  Montserrat is also **~18% wider** per character (average advance 0.57em vs 0.485em), so the same caption wraps to more lines and the swap could not be made in isolation — it had to buy back band height. Three coupled changes:

  1. **Caption spec.** `clamp(0.75rem, 1.9dvh, 0.9375rem)` (12–15px, up from a 1.85dvh coefficient) with `leading-ui` (1.4, up from `snug`/1.375). The cap stays 15px: at 15px Montserrat the x-height is ~22% larger than the 14.8px Newsreader it replaces, which is the size increase — pushing the nominal cap to 16px overflowed every chapter by 45–138px and was reverted.
  2. **Photo bands trimmed** — year chapters **48% → 45%**, proposal **42% → 39%**. The 2026-06-19 retune grew the photo to 48% on the strength of Newsreader's narrower setting; a wider face gives part of that back. The photo remains the anchor at identical size and position in every chapter.
  3. **Proposal header is now height-capped**, `text-[min(clamp(1.75rem,4vw,3rem),4.6dvh)]` (and `min(clamp(1.25rem,3vw,2rem),2.9dvh)` for "The Proposal"). This fixes a **pre-existing defect** the font work surfaced: the `text-display-*` tokens scale on `vw` alone, so on a wide-but-short laptop the two-line header sat at its 3rem/2rem maximum while the card was short — 121px of a 461px card (26%) at 1536×674 — pushing the caption 17px past the bottom edge on unmodified `main`. The `min()` wrapper leaves phone rendering byte-identical (the tokens are already at their minimum there) and shrinks the header only on short viewports.

  Verified against the live production captions (12 chapters, longest 280 chars) at five viewports, measuring clearance between the caption plate's bottom and the band's bottom edge. Worst-case year chapter / proposal, in px of remaining clearance: **360×800** +7 / +11 · **390×844** +21 / +52 · **1440×820** +55 / +33 · **1536×674** +18 / +10 · **1280×620** +12 / +2. Nothing clipped anywhere; the `overflow-hidden` backstop stays untriggered. For comparison, unmodified `main` clipped the proposal by 17px at 1536×674 and 34px at 1280×620, so the two tightest viewports are better after this change than before it.

- **2026-08-28 — the polaroid matte goes album-wide.** The thin warm-white matte introduced for the proposal stack (justified there because stacked layers need a visible boundary against each other) is now the treatment for **every** chapter photo, via `ChapterPhotoCrossfade`. This supersedes the original bare-photo rule for year chapters. The matte renders *inside* the box `StoryChapter` sizes, so the photo band's footprint — and therefore every caption clearance measured above — is unchanged; the print itself is 16px smaller in each dimension. `overflow-hidden` moved from the photo wrapper to an inner window element so the Ken Burns zoom is clipped at the photo's edge instead of bleeding over the white border. Year chapters only ever land on the matcha and raspberry pages, so the white matte always has a deep ground behind it.

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
