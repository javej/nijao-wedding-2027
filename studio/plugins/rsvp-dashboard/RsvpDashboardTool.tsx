import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Stack,
  Text,
} from "@sanity/ui";
import { useClient } from "sanity";
import { Download, RefreshCw } from "lucide-react";

type RsvpResponse = {
  guestName: string;
  guestSlug?: string;
  attending: boolean;
  plusOneName?: string;
  timestamp: string;
};

type SortKey = "timestamp" | "name";
type SortDir = "asc" | "desc";

const API_VERSION = process.env.SANITY_STUDIO_API_VERSION || "2026-04-09";
const PUBLISHED_GUEST_SLUGS_QUERY = `*[_type == "guest" && !(_id in path("drafts.**")) && defined(slug.current)]{ "slug": slug.current }`;

function getSiteUrl(): string {
  const raw =
    process.env.SANITY_STUDIO_SITE_URL ||
    process.env.SANITY_STUDIO_PREVIEW_URL ||
    "";
  return raw.replace(/\/+$/, "");
}

function getDashboardSecret(): string {
  return process.env.SANITY_STUDIO_RSVP_DASHBOARD_SECRET || "";
}

function formatTimestamp(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(rows: RsvpResponse[]): string {
  const header = ["guest name", "attending", "plus-one name", "timestamp"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        escapeCsvCell(r.guestName),
        r.attending ? "yes" : "no",
        escapeCsvCell(r.plusOneName ?? ""),
        escapeCsvCell(r.timestamp),
      ].join(","),
    );
  }
  // Prepend UTF-8 BOM so Excel detects encoding correctly for accented names.
  return "﻿" + lines.join("\n");
}

function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function RsvpDashboardTool() {
  const client = useClient({ apiVersion: API_VERSION });
  const [responses, setResponses] = useState<RsvpResponse[] | null>(null);
  const [publishedGuestSlugs, setPublishedGuestSlugs] = useState<
    string[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const abortRef = useRef<AbortController | null>(null);

  const siteUrl = getSiteUrl();
  const dashboardSecret = getDashboardSecret();

  const loadData = useCallback(async () => {
    if (!siteUrl) {
      setError(
        "Site URL is not configured. Set SANITY_STUDIO_SITE_URL in the Studio env.",
      );
      return;
    }
    if (!dashboardSecret) {
      setError(
        "Dashboard secret is not configured. Set SANITY_STUDIO_RSVP_DASHBOARD_SECRET in the Studio env.",
      );
      return;
    }

    // Cancel any in-flight request so a refresh doesn't race with stale data.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const [apiRes, guestSlugs] = await Promise.all([
        fetch(`${siteUrl}/api/rsvp-data`, {
          method: "GET",
          headers: { "x-rsvp-dashboard-secret": dashboardSecret },
          signal: controller.signal,
        }),
        client.fetch<{ slug: string }[]>(PUBLISHED_GUEST_SLUGS_QUERY),
      ]);

      if (controller.signal.aborted) return;

      if (!apiRes.ok) {
        const body = (await apiRes.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          body?.error
            ? `RSVP data API error: ${body.error} (${apiRes.status})`
            : `RSVP data API returned ${apiRes.status}`,
        );
      }

      const json = (await apiRes.json()) as { responses: RsvpResponse[] };
      if (controller.signal.aborted) return;
      setResponses(json.responses ?? []);
      setPublishedGuestSlugs((guestSlugs ?? []).map((g) => g.slug));
    } catch (err) {
      if (controller.signal.aborted) return;
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load RSVP data");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [client, siteUrl, dashboardSecret]);

  useEffect(() => {
    void loadData();
    return () => {
      abortRef.current?.abort();
    };
  }, [loadData]);

  const attendingCount = useMemo(
    () => (responses ? responses.filter((r) => r.attending).length : 0),
    [responses],
  );
  const declinedCount = useMemo(
    () => (responses ? responses.filter((r) => !r.attending).length : 0),
    [responses],
  );
  // Pending = published guests whose slug has NOT appeared in the Sheet.
  // Dedupe by slug (unique per guest), with a name fallback for legacy rows
  // written before the slug column existed. Plus-ones aren't counted because
  // they live outside the Sanity guest list.
  const pendingCount = useMemo(() => {
    if (publishedGuestSlugs === null || responses === null) return null;
    const respondedSlugs = new Set(
      responses.map((r) => r.guestSlug).filter((s): s is string => !!s),
    );
    const respondedNames = new Set(
      responses
        .filter((r) => !r.guestSlug)
        .map((r) => r.guestName.trim().toLowerCase()),
    );
    // Need the names of published guests for the legacy fallback path.
    // The dashboard already has slugs; getting names too would require
    // expanding the GROQ query. For now, fallback path only triggers for
    // rows missing slug — accepted limitation for legacy data.
    const respondedCount = publishedGuestSlugs.reduce((count, slug) => {
      return count + (respondedSlugs.has(slug) ? 1 : 0);
    }, 0);
    // Add legacy-fallback responses (rows with no slug) on top, capped so we
    // never report negative pending.
    const totalResponded = respondedCount + respondedNames.size;
    return Math.max(publishedGuestSlugs.length - totalResponded, 0);
  }, [publishedGuestSlugs, responses]);

  const sortedResponses = useMemo(() => {
    if (!responses) return [];
    const copy = [...responses];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.guestName.localeCompare(b.guestName);
        if (cmp === 0) cmp = a.timestamp.localeCompare(b.timestamp);
      } else {
        cmp = a.timestamp.localeCompare(b.timestamp);
        if (cmp === 0) cmp = a.guestName.localeCompare(b.guestName);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [responses, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  function handleExport() {
    if (!responses || responses.length === 0) return;
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`rsvp-export-${date}.csv`, buildCsv(sortedResponses));
  }

  return (
    <Card padding={4} height="fill" overflow="auto">
      <Stack space={4}>
        <Stack space={2}>
          <Heading size={2}>RSVP Dashboard</Heading>
          <Text size={1} muted>
            Live RSVP responses, read directly from the Google Sheet. Refresh
            to pull the latest data or export a CSV for the caterer.
          </Text>
        </Stack>

        <Flex gap={2} align="center" wrap="wrap">
          <Button
            text={loading ? "Refreshing…" : "Refresh"}
            icon={RefreshCw}
            tone="primary"
            mode="ghost"
            disabled={loading}
            onClick={() => void loadData()}
          />
          <Button
            text="Export CSV"
            icon={Download}
            tone="primary"
            disabled={!responses || responses.length === 0}
            onClick={handleExport}
          />
        </Flex>

        {error && (
          <Card tone="critical" padding={3} radius={2}>
            <Text size={1}>{error}</Text>
          </Card>
        )}

        <Grid columns={[1, 3]} gap={3}>
          <SummaryCard
            label="Attending"
            value={responses ? attendingCount : null}
            tone="positive"
          />
          <SummaryCard
            label="Declined"
            value={responses ? declinedCount : null}
            tone="critical"
          />
          <SummaryCard
            label="Pending"
            value={pendingCount}
            tone="caution"
            hint={
              publishedGuestSlugs !== null
                ? `${publishedGuestSlugs.length} published guest${publishedGuestSlugs.length === 1 ? "" : "s"}`
                : undefined
            }
          />
        </Grid>

        <Stack space={3}>
          <Flex gap={2} align="center" wrap="wrap">
            <Heading size={1}>Responses</Heading>
            <Box flex={1} />
            <Button
              text={`Sort: Name ${sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}`}
              mode="ghost"
              tone={sortKey === "name" ? "primary" : "default"}
              onClick={() => toggleSort("name")}
            />
            <Button
              text={`Sort: Time ${sortKey === "timestamp" ? (sortDir === "asc" ? "↑" : "↓") : ""}`}
              mode="ghost"
              tone={sortKey === "timestamp" ? "primary" : "default"}
              onClick={() => toggleSort("timestamp")}
            />
          </Flex>

          {responses === null && !error && (
            <Text size={1} muted>
              Loading RSVP responses…
            </Text>
          )}

          {responses !== null && sortedResponses.length === 0 && !error && (
            <Card tone="transparent" padding={3} radius={2} border>
              <Text size={1} muted>
                No RSVP responses yet.
              </Text>
            </Card>
          )}

          <Stack space={2}>
            {sortedResponses.map((r, idx) => (
              <Card
                key={`${r.timestamp}-${r.guestName}-${idx}`}
                padding={3}
                radius={2}
                border
              >
                <Flex align="center" gap={3} wrap="wrap">
                  <Stack space={2} flex={1}>
                    <Flex align="center" gap={2} wrap="wrap">
                      <Text weight="semibold" size={2}>
                        {r.guestName}
                      </Text>
                      <Badge
                        tone={r.attending ? "positive" : "critical"}
                        fontSize={0}
                      >
                        {r.attending ? "Attending" : "Declined"}
                      </Badge>
                      {r.plusOneName && (
                        <Badge tone="primary" fontSize={0}>
                          +1: {r.plusOneName}
                        </Badge>
                      )}
                    </Flex>
                    <Text size={1} muted>
                      {formatTimestamp(r.timestamp)}
                    </Text>
                  </Stack>
                </Flex>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number | null;
  tone: "positive" | "critical" | "caution";
  hint?: string;
}) {
  return (
    <Card tone={tone} padding={4} radius={2} border>
      <Stack space={2}>
        <Text size={1} weight="semibold">
          {label}
        </Text>
        <Heading size={4}>{value === null ? "—" : value}</Heading>
        {hint && (
          <Text size={1} muted>
            {hint}
          </Text>
        )}
      </Stack>
    </Card>
  );
}
