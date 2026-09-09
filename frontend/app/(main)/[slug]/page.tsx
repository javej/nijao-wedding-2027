import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllGuestSlugs, getGuestBySlug } from "@/sanity/queries/guests";
import { WeddingExperience } from "@/components/WeddingExperience";
import { sharedOpenGraph } from "@/lib/site-metadata";

/**
 * Guest slugs are added in Sanity continuously — after the last deploy, not
 * before it. `generateStaticParams` only knows the slugs that existed at build
 * time, so `dynamicParams` must stay `true`: a guest added today would
 * otherwise 404 until the next rebuild (ISR revalidation cannot add new params
 * to a frozen list). Known slugs are still pre-rendered at build time; a new
 * slug renders once on demand and is then cached like any other static page.
 */
export const dynamicParams = true;

/**
 * Shape of a generated guest slug (8 chars, lowercase alphanumeric — see the
 * `slugify` in studio/schemas/documents/guest.ts). Anything else is rejected
 * before it can reach Sanity, so probing random URLs costs no API calls.
 */
const SLUG_PATTERN = /^[a-z0-9]{8}$/;

export async function generateStaticParams() {
  const guests = await getAllGuestSlugs();

  return guests.map((guest) => ({
    slug: guest.slug,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  if (!SLUG_PATTERN.test(params.slug)) return {};

  const guest = await getGuestBySlug(params.slug);

  if (!guest) return {};

  // Messenger (and Facebook generally) opens a link preview at the page's
  // `og:url`, treating it as the canonical resource, not at the URL the sender
  // pasted. Inheriting the root layout's `url: "/"` sent every first-time guest
  // who tapped the preview card to the anonymous home page, where the RSVP
  // section is only a heading. Advertise the guest's own URL instead.
  const path = `/${params.slug}`;

  return {
    title: `${guest.firstName} — Jave & Nianne, January 8, 2027`,
    description:
      "You are cordially invited to the wedding of Jave and Nianne. January 8, 2027 — Lipa, Batangas.",
    alternates: { canonical: path },
    openGraph: { ...sharedOpenGraph, url: path },
  };
}

export default async function GuestPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  if (!SLUG_PATTERN.test(params.slug)) {
    notFound();
  }

  const guest = await getGuestBySlug(params.slug);

  if (!guest) {
    notFound();
  }

  return <WeddingExperience guest={guest} />;
}
