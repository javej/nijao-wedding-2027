/**
 * Sanity Webhook → ISR Revalidation Endpoint
 *
 * Configure in Sanity project settings (manage.sanity.io → API → Webhooks):
 *   URL:        https://<your-domain>/api/revalidate
 *   Trigger:    Create, Update, Delete
 *   Filter:     _type in ["storyChapter", "entourageMember", "guest", "announcement", "weddingDetails", "dressCode", "faq"] && !(_id in path("drafts.**"))
 *   Projection: {_type, slug}
 *   Secret:     Must match SANITY_WEBHOOK_SECRET env var
 *   HTTP method: POST
 */
import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  validateWebhookSignature,
  SIGNATURE_HEADER_NAME,
} from "@/lib/webhook";

/**
 * Document types that affect all pages (home + every guest page). Keep this in
 * sync with `studio/schema-types.ts` — a guest-facing type missing from here
 * used to fall through to the home-page-only branch below, which reused the
 * still-valid cached Sanity data and so never showed the edit at all.
 */
const KNOWN_CONTENT_TYPES = [
  "storyChapter",
  "entourageMember",
  "announcement",
  "weddingDetails",
  "dressCode",
  "guest",
  "faq",
] as const;

export async function POST(request: NextRequest) {
  // Parse the incoming webhook payload as raw text (needed for signature validation)
  const body = await request.text();

  // Extract the Sanity signature header (format: t=<ts>,v1=<base64url>)
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  if (!signature) {
    return NextResponse.json(
      { message: "Missing signature header" },
      { status: 401 },
    );
  }

  // Validate signature using @sanity/webhook's official HMAC-SHA256 verification
  if (!(await validateWebhookSignature(body, signature))) {
    return NextResponse.json(
      { message: "Invalid signature" },
      { status: 401 },
    );
  }

  // Parse JSON payload (signature is valid at this point)
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { message: "Malformed JSON payload" },
      { status: 400 },
    );
  }

  const docType = payload._type as string | undefined;
  if (!docType) {
    return NextResponse.json(
      { message: "Missing _type in payload" },
      { status: 400 },
    );
  }

  // Path-aware revalidation based on document type
  try {
    const revalidatedPaths: string[] = [];

    // Bust next-sanity's fetch data cache first. `defineLive` caches every
    // `sanityFetch` under the "sanity" tag, so this one call expires all Sanity
    // data. It has to happen for unknown types too: without it a page
    // revalidation just re-renders from the cached query results and the edit
    // stays invisible.
    revalidateTag("sanity", { expire: 0 });

    if (
      KNOWN_CONTENT_TYPES.includes(
        docType as (typeof KNOWN_CONTENT_TYPES)[number],
      )
    ) {
      // All known content types affect home + all guest pages.
      // Layout-level revalidation is the only way to purge all dynamic [slug]
      // pages without querying Sanity for every slug at webhook time.
      revalidatePath("/", "layout");
      revalidatedPaths.push("/ (layout)");
    } else {
      // Unknown document type — the data cache is already expired above, so
      // only the home page needs re-rendering.
      revalidatePath("/");
      revalidatedPaths.push("/");
    }

    console.log(`[revalidate] ${docType} → ${revalidatedPaths.join(", ")}`);

    return NextResponse.json({ revalidated: true, paths: revalidatedPaths });
  } catch (error) {
    console.error("[revalidate] error:", error);
    return NextResponse.json(
      { message: "Revalidation failed" },
      { status: 500 },
    );
  }
}
