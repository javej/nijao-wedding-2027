import { useEffect, useMemo, useState } from "react";
import {
  Badge,
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

type GuestRow = {
  _id: string;
  firstName: string;
  slug: string;
  plusOneEligible: boolean;
  plusOneType: "linked" | "open" | null;
  linkedFirstName: string | null;
};

// Exclude drafts so a guest being edited doesn't appear twice (once as `drafts.xyz`,
// once as the published `xyz`). Jave shares the published URL, so that's the only
// row that matters.
const GUESTS_QUERY = `*[_type == "guest" && defined(slug.current) && !(_id in path("drafts.**"))] | order(firstName asc) {
  _id,
  firstName,
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

const API_VERSION = process.env.SANITY_STUDIO_API_VERSION || "2026-03-23";

export function GuestLinksTool() {
  const client = useClient({ apiVersion: API_VERSION });
  const toast = useToast();
  const [guests, setGuests] = useState<GuestRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

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

  const filtered = useMemo(() => {
    if (!guests) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter(
      (g) =>
        g.firstName?.toLowerCase().includes(q) ||
        g.slug?.toLowerCase().includes(q),
    );
  }, [guests, filter]);

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
      .map((g) => `${g.firstName}: ${siteUrl}/${g.slug}`)
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
                        {g.firstName}
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
