/**
 * Migration 0002 — Bearer role split
 *
 * The entourage role enum previously had a standalone `Ring Bearer` and a
 * combined `Bible & Coin Bearer`. The coin has moved over to the ring bearer
 * and the bible bearer now stands on their own, so the enum is:
 *
 *   Ring Bearer          → Coin & Ring Bearer
 *   Bible & Coin Bearer  → Bible Bearer
 *
 * Documents still holding a legacy value would fall through to the
 * component's "unknown role" bucket (appended alphabetically under the raw
 * role string), so they need remapping rather than being left alone.
 *
 * USAGE
 *
 *   Dry-run against a dataset clone first:
 *     pnpm --filter studio exec sanity dataset copy production migration-test
 *     SANITY_STUDIO_DATASET=migration-test pnpm --filter studio exec \
 *       sanity exec migrations/0002-bearer-roles.ts --with-user-token
 *
 *   Then commit against production:
 *     pnpm --filter studio exec sanity exec \
 *       migrations/0002-bearer-roles.ts --with-user-token
 *
 * The script is idempotent: once every document holds a new-enum value the
 * query matches nothing and the run is a no-op.
 */

import { getCliClient } from "sanity/cli";

/** Legacy role value → its replacement in the new enum. */
const ROLE_REMAP: Record<string, string> = {
  "Ring Bearer": "Coin & Ring Bearer",
  "Bible & Coin Bearer": "Bible Bearer",
};

interface EntourageMemberDocument {
  _id: string;
  _type: "entourageMember";
  name?: string;
  role?: string;
}

async function run() {
  const client = getCliClient({ apiVersion: "2024-01-01" });

  const legacyRoles = Object.keys(ROLE_REMAP);
  const docs = await client.fetch<EntourageMemberDocument[]>(
    `*[_type == "entourageMember" && role in $legacyRoles]`,
    { legacyRoles },
  );

  if (docs.length === 0) {
    console.log("No entourage members on a legacy bearer role — nothing to migrate.");
    return;
  }

  const transaction = client.transaction();

  for (const doc of docs) {
    const nextRole = doc.role ? ROLE_REMAP[doc.role] : undefined;
    if (!nextRole) continue;

    console.log(`  → ${doc.name ?? doc._id}: "${doc.role}" → "${nextRole}"`);
    transaction.patch(doc._id, { set: { role: nextRole } });
  }

  await transaction.commit();
  console.log(`Remapped ${docs.length} entourage member(s).`);
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
