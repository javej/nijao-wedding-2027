import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllGuestSlugs, getGuestBySlug } from "@/sanity/queries/guests";
import { WeddingExperience } from "@/components/WeddingExperience";

export const dynamicParams = false;

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
  const guest = await getGuestBySlug(params.slug);

  if (!guest) return {};

  return {
    title: `${guest.firstName} — Jave & Nianne, January 8, 2027`,
    description:
      "You are cordially invited to the wedding of Jave and Nianne. January 8, 2027 — Lipa, Batangas.",
  };
}

export default async function GuestPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const guest = await getGuestBySlug(params.slug);

  if (!guest) {
    notFound();
  }

  return <WeddingExperience guest={guest} />;
}
