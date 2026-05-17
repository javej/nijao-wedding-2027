/**
 * RSVP Data API — read-only endpoint consumed by the Sanity Studio RSVP Dashboard.
 *
 * Auth: requires `x-rsvp-dashboard-secret` header matching RSVP_DASHBOARD_SECRET.
 *
 * The Studio bundle exposes this secret to the browser because it ships as a
 * `SANITY_STUDIO_*` env var, so treat it as scraping friction rather than a
 * real secret — Studio access is already gated by Sanity auth.
 */
import { type NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { readRsvpRows } from "@/lib/sheets";

const DASHBOARD_SECRET = process.env.RSVP_DASHBOARD_SECRET;
const ALLOWED_ORIGINS = (process.env.RSVP_DASHBOARD_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function buildCorsHeaders(requestOrigin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "x-rsvp-dashboard-secret, content-type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  // Only echo back an origin the caller actually used AND is in our allowlist.
  // Omitting the header for unknown origins is the correct CORS behavior.
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    headers["Access-Control-Allow-Origin"] = requestOrigin;
  }
  return headers;
}

function secretsMatch(provided: string, expected: string): boolean {
  // Pad to equal length so timingSafeEqual doesn't throw on mismatched lengths
  // (which would itself leak length information via the exception path).
  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);
  if (providedBuf.length !== expectedBuf.length) {
    // Still run a comparison so timing stays uniform, then return false.
    timingSafeEqual(expectedBuf, expectedBuf);
    return false;
  }
  return timingSafeEqual(providedBuf, expectedBuf);
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(request.headers.get("origin")),
  });
}

export async function GET(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));

  if (!DASHBOARD_SECRET) {
    return NextResponse.json(
      { error: "RSVP_DASHBOARD_SECRET is not configured" },
      { status: 500, headers: corsHeaders },
    );
  }

  const providedSecret = request.headers.get("x-rsvp-dashboard-secret") ?? "";
  if (!secretsMatch(providedSecret, DASHBOARD_SECRET)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: corsHeaders },
    );
  }

  try {
    const responses = await readRsvpRows();
    return NextResponse.json({ responses }, { headers: corsHeaders });
  } catch (error) {
    console.error("[rsvp-data] Sheets read failed:", error);
    return NextResponse.json(
      { error: "sheets_unavailable" },
      { status: 502, headers: corsHeaders },
    );
  }
}
