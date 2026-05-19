/**
 * Migration 0001 — Proposal chapter → year-anchored scrapbook gallery
 *
 * One-shot script that reshapes the single existing proposal document so it
 * conforms to the merged schema (see ADR-0004):
 *
 *   1. Ensure `year: 2025` is set (the proposal happened 8 years after the
 *      couple started dating in 2017).
 *   2. If the document still has a single `image`, copy it into `images[0]`
 *      so the new scrapbook layout has something to render.
 *   3. Unset the legacy `image` field on that one document — the schema
 *      hides it for proposal chapters, and leaving it around would confuse
 *      future content editors and the typegen output.
 *
 * Other story chapters (year chapters that are not the proposal) are left
 * untouched — they continue to use `image` and never look at `images`.
 *
 * USAGE
 *
 *   Dry-run against a dataset clone first:
 *     pnpm --filter studio exec sanity dataset copy production migration-test
 *     SANITY_STUDIO_DATASET=migration-test pnpm --filter studio exec \
 *       sanity exec migrations/0001-proposal-to-gallery.ts --with-user-token
 *
 *   Then commit against production:
 *     pnpm --filter studio exec sanity exec \
 *       migrations/0001-proposal-to-gallery.ts --with-user-token
 *
 * The `--with-user-token` flag wires in the user's CLI auth, so the script
 * runs as them — no `SANITY_AUTH_TOKEN` required.
 *
 * The script is idempotent: re-running it after a successful run is a no-op
 * (year is already 2025, images[0] already exists, image is already unset).
 */

import { getCliClient } from "sanity/cli";

interface LegacyImageField {
  _type?: "image";
  asset?: { _type: "reference"; _ref: string };
  alt?: string;
  hotspot?: unknown;
  crop?: unknown;
}

interface ProposalDocument {
  _id: string;
  _type: "storyChapter";
  _rev: string;
  isProposal?: boolean;
  year?: number;
  image?: LegacyImageField;
  images?: Array<LegacyImageField & { _key: string }>;
}

const TARGET_YEAR = 2025;

async function run() {
  const client = getCliClient({ apiVersion: "2024-01-01" });

  const docs = await client.fetch<ProposalDocument[]>(
    `*[_type == "storyChapter" && isProposal == true]`,
  );

  if (docs.length === 0) {
    console.log("No proposal chapter found — nothing to migrate.");
    return;
  }

  if (docs.length > 1) {
    throw new Error(
      `Expected at most one proposal chapter, found ${docs.length}. ` +
        "Resolve the duplicate before running this migration.",
    );
  }

  const doc = docs[0]!;
  console.log(`Found proposal chapter: ${doc._id}`);

  const needsYear = doc.year !== TARGET_YEAR;
  const needsGalleryFromImage =
    (!doc.images || doc.images.length === 0) && Boolean(doc.image?.asset?._ref);
  const needsImageUnset = Boolean(doc.image);

  if (!needsYear && !needsGalleryFromImage && !needsImageUnset) {
    console.log("Already migrated. Nothing to do.");
    return;
  }

  const patch = client.patch(doc._id);

  if (needsYear) {
    console.log(`  → setting year = ${TARGET_YEAR}`);
    patch.set({ year: TARGET_YEAR });
  }

  if (needsGalleryFromImage) {
    console.log("  → copying image into images[0]");
    const legacy = doc.image as LegacyImageField;
    const firstGalleryItem: LegacyImageField & { _key: string } = {
      _type: "image",
      _key: keyFromAssetRef(legacy.asset?._ref ?? "proposal-image"),
      asset: legacy.asset,
      ...(legacy.alt !== undefined ? { alt: legacy.alt } : {}),
      ...(legacy.hotspot !== undefined ? { hotspot: legacy.hotspot } : {}),
      ...(legacy.crop !== undefined ? { crop: legacy.crop } : {}),
    };
    patch.set({ images: [firstGalleryItem] });
  }

  if (needsImageUnset) {
    console.log("  → unsetting legacy `image` field");
    patch.unset(["image"]);
  }

  const result = await patch.commit({ autoGenerateArrayKeys: true });
  console.log(`Committed patch for ${result._id} (rev ${result._rev})`);
}

/** Sanity arrays need a stable `_key` per item. Derive it from the asset ref. */
function keyFromAssetRef(ref: string): string {
  return ref.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 32) || "key";
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
