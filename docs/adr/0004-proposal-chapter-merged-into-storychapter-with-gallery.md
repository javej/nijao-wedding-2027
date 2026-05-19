# ADR 0004 — Proposal chapter merged into `storyChapter` with a gallery field

- **Status:** Accepted
- **Date:** 2026-05-19
- **Related:** UI/UX improvements round (proposal-as-chapter phase)
- **Supersedes:** the prior decision implicit in [storyChapter.ts](../../studio/schemas/documents/storyChapter.ts) — proposal as a *non-year* `storyChapter` filtered out of the year list via `isProposal != true`

## Context

The love-story scroll is organized as a sequence of **story chapters**, one per year between 2017 and 2027 (the couple started dating in 2017; they marry on January 8, 2027). Each chapter is a Sanity `storyChapter` document with a `year`, a `caption`, and exactly one `image`. There is also one special chapter marked `isProposal: true` that holds the Mt. Fuji proposal moment; today this chapter has **no year**, **one image**, and renders via a dedicated component [ProposalSection.tsx](../../frontend/components/sections/ProposalSection.tsx) with a full-bleed blurred backdrop and a single caption.

The GROQ queries in [storyChapters.ts](../../frontend/sanity/queries/storyChapters.ts) explicitly exclude the proposal from the year list (`*[_type == "storyChapter" && isProposal != true]`) and fetch it separately, and [WeddingExperience.tsx](../../frontend/components/WeddingExperience.tsx) renders it as its own snap-scroll section between the year chapters and the wedding details.

This shape is being revisited for two reasons:

1. **The proposal happened in 2025 — eight years after the couple started dating.** That is itself a story-chapter beat. Today the year chapter for 2025 either does not exist or is empty; the proposal moment is intentionally segregated from the year narrative. The couple would rather the narrative read continuously: *"Year 1 we met … Year 8 he proposed."*
2. **One photo is not enough.** The proposal has several photos worth showing (the moment, the ring, the surroundings, candids). The current `image: image` field on `storyChapter` only holds one.

We considered three structural options:

| Option | Data shape | Narrative |
|---|---|---|
| **Adjacent** | Two documents: year-2025 chapter + separate proposal chapter (status quo + a year added) | Two snap points for what is emotionally one beat. User scrolls "Year 8: he proposed" then scrolls *again* to see proposal photos. Read order is fragile (depends on Sanity `order` field being correct). |
| **Parent/Child** | One taller year-2025 section with internal snap points (intro → gallery) | Most cinematic on paper, but conflicts with the snap-mandatory commitment in [ADR-0003](0003-arrival-scroll-lock-targets-scroll-container.md). Mini-scrolls inside a snap-mandatory parent are fragile on iOS Safari and undermine the "one chapter per gesture" contract. |
| **Merge** | One `storyChapter` document with `year: 2025`, `isProposal: true`, and a new `images: Image[]` gallery. | Single narrative beat. One snap point. The `isProposal` flag now controls *layout* (scrapbook stack vs. single-image year layout), not *placement*. |

## Decision

The proposal becomes a regular `storyChapter` document with `year: 2025` and `isProposal: true`. The `storyChapter` schema gains an optional `images: Image[]` field for the gallery. Other year chapters continue to use the existing single `image` field and ignore `images`.

Concretely:

- **Schema change** ([studio/schemas/documents/storyChapter.ts](../../studio/schemas/documents/storyChapter.ts)):
  - `year` becomes required for *all* chapters (the proposal one included). The existing custom validator that exempts proposal from `year` is removed.
  - A new `images` field is added, typed as `array of { type: image, hotspot: true, fields: [alt] }`. It is optional. A second validator ensures `images.length > 0` *only* when `isProposal === true`.
  - The existing `image` field is kept (non-proposal chapters continue to use it).
  - `isProposal`'s description is updated: "Marks this chapter as the proposal. The chapter renders with the scrapbook gallery layout using `images` instead of `image`."
- **Query change** ([frontend/sanity/queries/storyChapters.ts](../../frontend/sanity/queries/storyChapters.ts)):
  - The `STORY_CHAPTERS_QUERY` drops the `&& isProposal != true` filter. All year chapters, including the proposal one, are returned in order.
  - `PROPOSAL_SECTION_QUERY` and `getProposalSection()` are removed.
  - The result type gains an optional `images: ...[]` property.
- **Render change** ([frontend/components/WeddingExperience.tsx](../../frontend/components/WeddingExperience.tsx)):
  - The standalone `<ChapterSection id="proposal">` slot is removed.
  - `StoryChapter` branches on `chapter.isProposal`: regular layout vs. scrapbook layout. (Alternative: keep `ProposalSection.tsx`, rename to `ProposalChapterLayout.tsx`, and have `StoryChapter` delegate to it. To be decided in implementation; the data shape is the load-bearing decision.)
- **Migration**: a one-shot Sanity migration script copies the existing proposal document's `image` into `images[0]`, sets `year: 2025`, then deletes the old `image` field on that one doc. The script lives at `studio/migrations/0001-proposal-to-gallery.ts` and runs once via `sanity exec`.

## Consequences

### Positive

- The love-story scroll reads as one continuous timeline. The proposal is *the* Year 8 beat, not a sidecar.
- The schema becomes more honest. `isProposal` is finally an *adjective on a chapter*, not a *type discriminator that escapes the year axis*.
- Gallery support generalizes. If a future couple wants multiple photos for any year, the `images` field is already there — they'd just need to relax the "only the proposal uses it" validator.
- The frontend collapses one component and one query. Less surface area in [WeddingExperience.tsx](../../frontend/components/WeddingExperience.tsx).

### Negative

- **Migration risk.** There is exactly one proposal document in production today, but the migration must run against the live dataset. Mitigation: dry-run the script against a Sanity dataset clone first; commit only after a successful round-trip.
- **The Sanity Studio admin UX for the proposal chapter is now subtler.** A content editor seeing the document for the first time will see *both* `image` and `images` fields and may be unsure which to fill. Mitigation: conditional `hidden`/`readOnly` rules in the schema so `image` is hidden when `isProposal === true` and `images` is hidden when `isProposal === false`.
- **The `border-l-` palette accent** today differs between year chapters (`matcha-latte`) and the proposal (`strawberry-jam`). With the merge, the proposal chapter is still styled as `strawberry-jam` via a per-chapter palette override — handled at render time by `StoryChapter` branching on `isProposal`, not by adding a per-chapter palette field to the schema. We deliberately keep palette out of the content model.

### Rejected alternatives

- **Adjacent.** Smallest data-model change, but doubles the snap points for one narrative beat and leaves the existing `isProposal != true` filter as long-lived debt.
- **Parent/Child with internal snap points.** Conflicts with the snap-mandatory commitment from [ADR-0003](0003-arrival-scroll-lock-targets-scroll-container.md). The mini-scroll-inside-a-snap-section pattern is fragile on iOS Safari and surprises users who have already learned the "one flick = one chapter" rule on earlier sections.
- **Make `images` mandatory for all chapters and retire `image`.** Cleaner long-term, but a bigger migration (every chapter doc rewritten) and we lose nothing today by keeping `image` for the single-photo case. Deferred until a real need appears.
