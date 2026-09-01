import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Stack,
  Text,
  TextInput,
  useToast,
} from "@sanity/ui";
import { useClient } from "sanity";
import { Check, Copy, Search } from "lucide-react";
import { fullName } from "../../lib/guestName";

type GuestRow = {
  _id: string;
  firstName: string;
  lastName: string | null;
  slug: string;
  plusOneEligible: boolean;
  plusOneType: "linked" | "open" | null;
  linkedFirstName: string | null;
};

type SortKey = "firstName" | "lastName";
type SortDir = "asc" | "desc";

// Exclude drafts so a guest being edited doesn't appear twice (once as `drafts.xyz`,
// once as the published `xyz`). Jave shares the published URL, so that's the only
// row that matters.
const GUESTS_QUERY = `*[_type == "guest" && defined(slug.current) && !(_id in path("drafts.**"))] {
  _id,
  firstName,
  lastName,
  "slug": slug.current,
  plusOneEligible,
  plusOneType,
  "linkedFirstName": plusOneLinkedGuest->firstName
}`;

function getSiteUrl(): string {
  const raw =
    process.env.SANITY_STUDIO_SITE_URL ||
    process.env.SANITY_STUDIO_PREVIEW_URL ||
    "";
  return raw.replace(/\/+$/, "");
}

const API_VERSION = process.env.SANITY_STUDIO_API_VERSION || "2026-04-09";

export function GuestLinksTool() {
  const client = useClient({ apiVersion: API_VERSION });
  const toast = useToast();
  const [guests, setGuests] = useState<GuestRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("firstName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const siteUrl = getSiteUrl();

  useEffect(() => {
    let cancelled = false;
    client
      .fetch<GuestRow[]>(GUESTS_QUERY)
      .then((data) => {
        if (!cancelled) setGuests(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to load guests");
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  // Sorted here rather than in GROQ: Content Lake orders strings by code point, so
  // a lowercase "adrian" lands after "Zoe". localeCompare is case-insensitive and
  // matches how the RSVP Dashboard sorts.
  const sorted = useMemo(() => {
    if (!guests) return [];
    const primary = sortKey === "lastName" ? "lastName" : "firstName";
    const secondary = sortKey === "lastName" ? "firstName" : "lastName";
    return [...guests].sort((a, b) => {
      let cmp = (a[primary] ?? "").localeCompare(b[primary] ?? "");
      if (cmp === 0) cmp = (a[secondary] ?? "").localeCompare(b[secondary] ?? "");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [guests, sortKey, sortDir]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (g) =>
        fullName(g).toLowerCase().includes(q) ||
        g.slug?.toLowerCase().includes(q),
    );
  }, [sorted, filter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function copyToClipboard(text: string, slug: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSlug(slug);
      toast.push({ status: "success", title: "Link copied", description: text });
      setTimeout(() => setCopiedSlug((s) => (s === slug ? null : s)), 1500);
    } catch (err) {
      toast.push({
        status: "error",
        title: "Copy failed",
        description: "Clipboard access was blocked. Copy the link manually.",
      });
    }
  }

  async function copyAll() {
    if (!filtered.length) return;
    const text = filtered
      .map((g) => `${fullName(g)}: ${siteUrl}/${g.slug}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.push({
        status: "success",
        title: `Copied ${filtered.length} links`,
      });
    } catch {
      toast.push({ status: "error", title: "Copy failed" });
    }
  }

  return (
    <Card padding={4} height="fill" overflow="auto">
      <Stack space={4}>
        <Stack space={2}>
          <Heading size={2}>Guest Links</Heading>
          <Text size={1} muted>
            Personalized invitation URLs for every guest. Copy a link and share
            it via Viber, WhatsApp, or email.
          </Text>
          {!siteUrl && (
            <Card tone="caution" padding={3} radius={2}>
              <Text size={1}>
                Site URL is not configured. Set <code>SANITY_STUDIO_SITE_URL</code>{" "}
                (or <code>SANITY_STUDIO_PREVIEW_URL</code>) in your Studio env
                file to generate correct links.
              </Text>
            </Card>
          )}
        </Stack>

        <Flex gap={2} align="center">
          <TextInput
            icon={Search}
            placeholder="Filter by name or slug"
            value={filter}
            onChange={(e) => setFilter(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Button
            text={`Copy all (${filtered.length})`}
            tone="primary"
            mode="ghost"
            disabled={!filtered.length || !siteUrl}
            onClick={copyAll}
          />
        </Flex>

        <Flex gap={2} align="center" wrap="wrap">
          <Box flex={1} />
          <Button
            text={`Sort: First name ${sortKey === "firstName" ? (sortDir === "asc" ? "↑" : "↓") : ""}`}
            mode="ghost"
            tone={sortKey === "firstName" ? "primary" : "default"}
            onClick={() => toggleSort("firstName")}
          />
          <Button
            text={`Sort: Last name ${sortKey === "lastName" ? (sortDir === "asc" ? "↑" : "↓") : ""}`}
            mode="ghost"
            tone={sortKey === "lastName" ? "primary" : "default"}
            onClick={() => toggleSort("lastName")}
          />
        </Flex>

        {error && (
          <Card tone="critical" padding={3} radius={2}>
            <Text size={1}>{error}</Text>
          </Card>
        )}

        {guests === null && !error && (
          <Text size={1} muted>
            Loading guests…
          </Text>
        )}

        {guests !== null && !error && filtered.length === 0 && (
          <Card tone="transparent" padding={3} radius={2} border>
            <Text size={1} muted>
              {guests.length === 0
                ? "No guests yet. Create a guest document to generate a link."
                : "No guests match the filter."}
            </Text>
          </Card>
        )}

        <Stack space={2}>
          {filtered.map((g) => {
            const url = siteUrl ? `${siteUrl}/${g.slug}` : `/${g.slug}`;
            return (
              <Card key={g._id} padding={3} radius={2} border>
                <Flex align="center" gap={3} wrap="wrap">
                  <Stack space={2} flex={1}>
                    <Flex align="center" gap={2} wrap="wrap">
                      <Text weight="semibold" size={2}>
                        {fullName(g)}
                      </Text>
                      {g.plusOneEligible && g.plusOneType === "linked" && (
                        <Badge tone="primary" fontSize={0}>
                          +1 linked{g.linkedFirstName ? `: ${g.linkedFirstName}` : ""}
                        </Badge>
                      )}
                      {g.plusOneEligible && g.plusOneType === "open" && (
                        <Badge tone="positive" fontSize={0}>
                          +1 open
                        </Badge>
                      )}
                    </Flex>
                    <Text size={1} muted style={{ wordBreak: "break-all" }}>
                      {url}
                    </Text>
                  </Stack>
                  <Button
                    text={copiedSlug === g.slug ? "Copied" : "Copy link"}
                    aria-label={
                      copiedSlug === g.slug
                        ? `Copied link for ${fullName(g)}`
                        : `Copy link for ${fullName(g)}`
                    }
                    icon={copiedSlug === g.slug ? Check : Copy}
                    tone={copiedSlug === g.slug ? "positive" : "default"}
                    mode="ghost"
                    disabled={!siteUrl}
                    onClick={() => copyToClipboard(url, g.slug)}
                  />
                </Flex>
              </Card>
            );
          })}
        </Stack>
      </Stack>
    </Card>
  );
}
