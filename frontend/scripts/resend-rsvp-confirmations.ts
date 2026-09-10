/**
 * One-off: re-send the RSVP confirmation email to attending guests whose
 * original send failed (e.g. the Sept 2026 Resend 403s before the sending
 * domain was verified).
 *
 * Dry-run by default: lists who would receive the email and from which
 * address, sends nothing. Add --send to actually send.
 *
 *   cd frontend
 *   pnpm dlx tsx --env-file=.env.local scripts/resend-rsvp-confirmations.ts --since 2026-09-01
 *   pnpm dlx tsx --env-file=.env.local scripts/resend-rsvp-confirmations.ts --since 2026-09-01 --send
 *   pnpm dlx tsx --env-file=.env.local scripts/resend-rsvp-confirmations.ts --slug abc123,def456 --send
 *
 * Reads NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
 * RESEND_API_KEY and RESEND_FROM_ADDRESS from the environment. Make sure
 * RESEND_FROM_ADDRESS is on the verified domain, not the old testing address.
 *
 * The subject mirrors lib/resend.ts; the template is the same component the
 * app sends, so guests get exactly the email they would have received.
 */
import { createClient } from "@sanity/client";
import { Resend } from "resend";
import { RsvpConfirmation } from "../emails/RsvpConfirmation";

const SUBJECT = "RSVP Confirmed: The Wedding of Jave & Nianne";
// Resend allows 2 requests/second; stay well under it.
const SEND_INTERVAL_MS = 700;

interface Guest {
  slug: string;
  firstName: string;
  lastName: string | null;
  nickname: string | null;
  email: string;
  rsvpUpdatedAt: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

function parseArgs(argv: string[]) {
  let since: string | null = null;
  let slugs: string[] | null = null;
  let send = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--send") send = true;
    else if (arg === "--since") since = argv[++i] ?? null;
    else if (arg === "--slug") slugs = (argv[++i] ?? "").split(",").filter(Boolean);
    else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(1);
    }
  }
  if (!since && !slugs?.length) {
    console.error("Pass --since <ISO date> or --slug <a,b,c> to choose recipients.");
    process.exit(1);
  }
  return { since, slugs, send };
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  const shown = local.length <= 2 ? local[0] : local.slice(0, 2);
  return `${shown}${"*".repeat(Math.max(local.length - shown.length, 1))}@${domain}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const { since, slugs, send } = parseArgs(process.argv.slice(2));

  const projectId = requireEnv("NEXT_PUBLIC_SANITY_PROJECT_ID");
  const dataset = requireEnv("NEXT_PUBLIC_SANITY_DATASET");
  const from = requireEnv("RESEND_FROM_ADDRESS");
  const apiKey = requireEnv("RESEND_API_KEY");

  const sanity = createClient({
    projectId,
    dataset,
    apiVersion: "2024-10-31",
    useCdn: false,
  });

  const filters = ['_type == "guest"', 'rsvpStatus == "attending"', "defined(email)"];
  const params: Record<string, unknown> = {};
  if (since) {
    filters.push("rsvpUpdatedAt >= $since");
    params.since = since;
  }
  if (slugs?.length) {
    filters.push("slug.current in $slugs");
    params.slugs = slugs;
  }

  const guests = await sanity.fetch<Guest[]>(
    `*[${filters.join(" && ")}] | order(rsvpUpdatedAt asc){
      "slug": slug.current, firstName, lastName, nickname, email, rsvpUpdatedAt
    }`,
    params,
  );

  console.log(`From: ${from}`);
  console.log(`Mode: ${send ? "SEND" : "dry-run (add --send to send)"}`);
  console.log(`Recipients: ${guests.length}\n`);
  for (const g of guests) {
    console.log(`  ${g.slug}  ${g.firstName.padEnd(20)} ${maskEmail(g.email).padEnd(28)} ${g.rsvpUpdatedAt}`);
  }
  console.log();

  if (!send) return;

  const resend = new Resend(apiKey);
  let ok = 0;
  let failed = 0;
  for (const g of guests) {
    const { data, error } = await resend.emails.send({
      from,
      to: g.email,
      subject: SUBJECT,
      react: RsvpConfirmation({
        guestName: [g.firstName, g.lastName].filter(Boolean).join(" "),
        guestNickname: g.nickname || undefined,
      }),
    });
    if (error) {
      failed++;
      console.error(`  FAIL ${g.slug} ${maskEmail(g.email)}: ${error.name} ${error.message}`);
    } else {
      ok++;
      console.log(`  sent ${g.slug} ${maskEmail(g.email)} id=${data?.id}`);
    }
    await sleep(SEND_INTERVAL_MS);
  }
  console.log(`\nDone: ${ok} sent, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
