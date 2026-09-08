/**
 * Migration 0003 — Split open plus-one `name` into `firstName` + `lastName`
 *
 * The RSVP chat used to capture an open plus-one as a single free-text
 * `openPlusOne.name`. The RSVP export now lists every plus-one as their own
 * line, so the chat asks for first and last name separately and the guest
 * schema stores `openPlusOne.firstName` / `openPlusOne.lastName`.
 *
 * Guests who RSVPed before this change still hold the legacy `name`. This
 * splits it on the last space ("Maria Cristina Reyes" → "Maria Cristina" /
 * "Reyes"); a single-word name becomes the first name with no last name, and
 * the legacy field is removed.
 *
 * USAGE
 *
 *   Dry-run against a dataset clone first:
 *     pnpm --filter studio exec sanity dataset copy production migration-test
 *     SANITY_STUDIO_DATASET=migration-test pnpm --filter studio exec \
 *       sanity exec migrations/0003-open-plus-one-split-name.ts --with-user-token
 *
 *   Then commit against production:
 *     pnpm --filter studio exec sanity exec \
 *       migrations/0003-open-plus-one-split-name.ts --with-user-token
 *
 * The script is idempotent: once no guest holds `openPlusOne.name` the query
 * matches nothing and the run is a no-op.
 */

import { getCliClient } from "sanity/cli";
import { splitName } from "../lib/splitName";

interface GuestDocument {
  _id: string;
  firstName?: string;
  lastName?: string;
  openPlusOne?: { attending?: boolean; name?: string };
}

async function run() {
  const client = getCliClient({ apiVersion: "2024-01-01" });

  const docs = await client.fetch<GuestDocument[]>(
    `*[_type == "guest" && defined(openPlusOne.name)]{ _id, firstName, lastName, openPlusOne }`,
  );

  if (docs.length === 0) {
    console.log("No guests with a legacy open plus-one name — nothing to migrate.");
    return;
  }

  const transaction = client.transaction();

  for (const doc of docs) {
    const legacy = doc.openPlusOne?.name?.trim();
    if (!legacy) {
      transaction.patch(doc._id, { unset: ["openPlusOne.name"] });
      continue;
    }
    const { firstName, lastName } = splitName(legacy);
    const host = [doc.firstName, doc.lastName].filter(Boolean).join(" ") || doc._id;
    console.log(`  → ${host}: "${legacy}" → "${firstName}" / "${lastName ?? ""}"`);
    transaction.patch(doc._id, {
      set: {
        "openPlusOne.firstName": firstName,
        ...(lastName && { "openPlusOne.lastName": lastName }),
      },
      unset: ["openPlusOne.name"],
    });
  }

  await transaction.commit();
  console.log(`Split ${docs.length} open plus-one name(s).`);
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
