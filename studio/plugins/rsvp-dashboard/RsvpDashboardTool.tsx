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

type RsvpStatus = "pending" | "attending" | "declined";

type GuestRow = {
  _id: string;
  firstName: string;
  slug: string;
  plusOneEligible: boolean | null;
  plusOneType: "linked" | "open" | null;
  rsvpStatus: RsvpStatus | null;
  rsvpUpdatedAt: string | null;
  openPlusOne: { attending: boolean | null; name: string | null } | null;
  linkedPartner: {
    firstName: string;
    rsvpStatus: RsvpStatus | null;
  } | null;
};

type SortKey = "rsvpUpdatedAt" | "name";
type SortDir = "asc" | "desc";

const API_VERSION = process.env.SANITY_STUDIO_API_VERSION || "2026-04-09";

const GUEST_DASHBOARD_QUERY = `*[
  _type == "guest" &&
  !(_id in path("drafts.**")) &&
  defined(slug.current)
]{
  _id,
  firstName,
  "slug": slug.current,
  plusOneEligible,
  plusOneType,
  rsvpStatus,
  rsvpUpdatedAt,
  openPlusOne,
  "linkedPartner": plusOneLinkedGuest->{ firstName, rsvpStatus }
}`;

function normalizeStatus(value: RsvpStatus | null | undefined): RsvpStatus {
  return value ?? "pending";
}

function formatTimestamp(iso: string | null): string {
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

// Compute the visible plus-one name for a guest (linked partner if attending,
// open plus-one name if attending) — used in both the table and the CSV.
function plusOneDisplay(guest: GuestRow): string {
  if (normalizeStatus(guest.rsvpStatus) !== "attending") return "";
  if (guest.plusOneType === "linked") {
    if (guest.linkedPartner && normalizeStatus(guest.linkedPartner.rsvpStatus) === "attending") {
      return guest.linkedPartner.firstName;
    }
    return "";
  }
  if (guest.plusOneType === "open") {
    if (guest.openPlusOne?.attending && guest.openPlusOne.name) {
      return guest.openPlusOne.name;
    }
    return "";
  }
  return "";
}

function buildCsv(rows: GuestRow[]): string {
  const header = ["guest name", "attending", "plus-one name", "timestamp"];
  const lines = [header.join(",")];
  for (const r of rows) {
    const status = normalizeStatus(r.rsvpStatus);
    lines.push(
      [
        escapeCsvCell(r.firstName),
        status === "attending" ? "yes" : status === "declined" ? "no" : "",
        escapeCsvCell(plusOneDisplay(r)),
        escapeCsvCell(r.rsvpUpdatedAt ?? ""),
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
  const [guests, setGuests] = useState<GuestRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortKey, setSortKey] = useState<SortKey>("rsvpUpdatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const abortRef = useRef<AbortController | null>(null);

  const loadData = useCallback(async () => {
    // Cancel any in-flight request so a refresh doesn't race with stale data.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await client.fetch<GuestRow[]>(GUEST_DASHBOARD_QUERY);
      if (controller.signal.aborted) return;
      setGuests(result ?? []);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Failed to load RSVP data");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void loadData();
    return () => {
      abortRef.current?.abort();
    };
  }, [loadData]);

  const counts = useMemo(() => {
    if (!guests) return { attending: 0, declined: 0, pending: 0, plusOnes: 0 };
    let attending = 0;
    let declined = 0;
    let pending = 0;
    let plusOnes = 0;
    for (const g of guests) {
      const status = normalizeStatus(g.rsvpStatus);
      if (status === "attending") {
        attending += 1;
        // Count attending plus-ones in headcount: linked partner only if THEIR
        // own status is attending (avoid double-counting since the partner is
        // their own guest row); open plus-one if marked attending.
        if (
          g.plusOneType === "open" &&
          g.openPlusOne?.attending === true
        ) {
          plusOnes += 1;
        }
      } else if (status === "declined") {
        declined += 1;
      } else {
        pending += 1;
      }
    }
    return { attending, declined, pending, plusOnes };
  }, [guests]);

  const sortedGuests = useMemo(() => {
    if (!guests) return [];
    const copy = [...guests];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.firstName.localeCompare(b.firstName);
        if (cmp === 0)
          cmp = (a.rsvpUpdatedAt ?? "").localeCompare(b.rsvpUpdatedAt ?? "");
      } else {
        cmp = (a.rsvpUpdatedAt ?? "").localeCompare(b.rsvpUpdatedAt ?? "");
        if (cmp === 0) cmp = a.firstName.localeCompare(b.firstName);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [guests, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  function handleExport() {
    if (!guests || guests.length === 0) return;
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`rsvp-export-${date}.csv`, buildCsv(sortedGuests));
  }

  return (
    <Card padding={4} height="fill" overflow="auto">
      <Stack space={4}>
        <Stack space={2}>
          <Heading size={2}>RSVP Dashboard</Heading>
          <Text size={1} muted>
            Live RSVP responses, read directly from the Sanity guest list.
            Refresh to pull the latest data or export a CSV for the caterer.
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
            disabled={!guests || guests.length === 0}
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
            value={guests ? counts.attending : null}
            tone="positive"
            hint={
              guests && counts.plusOnes > 0
                ? `+${counts.plusOnes} open plus-one${counts.plusOnes === 1 ? "" : "s"}`
                : undefined
            }
          />
          <SummaryCard
            label="Declined"
            value={guests ? counts.declined : null}
            tone="critical"
          />
          <SummaryCard
            label="Pending"
            value={guests ? counts.pending : null}
            tone="caution"
            hint={
              guests
                ? `${guests.length} guest${guests.length === 1 ? "" : "s"} total`
                : undefined
            }
          />
        </Grid>

        <Stack space={3}>
          <Flex gap={2} align="center" wrap="wrap">
            <Heading size={1}>Guests</Heading>
            <Box flex={1} />
            <Button
              text={`Sort: Name ${sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}`}
              mode="ghost"
              tone={sortKey === "name" ? "primary" : "default"}
              onClick={() => toggleSort("name")}
            />
            <Button
              text={`Sort: Updated ${sortKey === "rsvpUpdatedAt" ? (sortDir === "asc" ? "↑" : "↓") : ""}`}
              mode="ghost"
              tone={sortKey === "rsvpUpdatedAt" ? "primary" : "default"}
              onClick={() => toggleSort("rsvpUpdatedAt")}
            />
          </Flex>

          {guests === null && !error && (
            <Text size={1} muted>
              Loading RSVP responses…
            </Text>
          )}

          {guests !== null && sortedGuests.length === 0 && !error && (
            <Card tone="transparent" padding={3} radius={2} border>
              <Text size={1} muted>
                No guests yet.
              </Text>
            </Card>
          )}

          <Stack space={2}>
            {sortedGuests.map((g) => {
              const status = normalizeStatus(g.rsvpStatus);
              const plusOneName = plusOneDisplay(g);
              return (
                <Card key={g._id} padding={3} radius={2} border>
                  <Flex align="center" gap={3} wrap="wrap">
                    <Stack space={2} flex={1}>
                      <Flex align="center" gap={2} wrap="wrap">
                        <Text weight="semibold" size={2}>
                          {g.firstName}
                        </Text>
                        <Badge
                          tone={
                            status === "attending"
                              ? "positive"
                              : status === "declined"
                                ? "critical"
                                : "caution"
                          }
                          fontSize={0}
                        >
                          {status === "attending"
                            ? "Attending"
                            : status === "declined"
                              ? "Declined"
                              : "Pending"}
                        </Badge>
                        {plusOneName && (
                          <Badge tone="primary" fontSize={0}>
                            +1: {plusOneName}
                          </Badge>
                        )}
                      </Flex>
                      <Text size={1} muted>
                        {formatTimestamp(g.rsvpUpdatedAt)}
                      </Text>
                    </Stack>
                  </Flex>
                </Card>
              );
            })}
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
