import type { Metadata } from 'next';
import { WeddingExperience } from '@/components/WeddingExperience';

export const metadata: Metadata = {
  title: 'Jave & Nianne — January 8, 2027',
  description:
    'You are cordially invited to the wedding of Jave and Nianne. January 8, 2027 — Lipa, Batangas.',
};

export default async function IndexPage() {
  return <WeddingExperience guest={null} />;
}
