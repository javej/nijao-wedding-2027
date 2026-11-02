import type { Metadata } from 'next';
import { WeddingExperience } from '@/components/WeddingExperience';

// No `title`: a string here would be run through the layout's
// "%s | Jave & Nianne" template and repeat the names. The layout's
// `title.default` is already the home page title.
export const metadata: Metadata = {
  description:
    'You are cordially invited to the wedding of Jave & Nianne. January 8, 2027 — Lipa, Batangas.',
};

export default async function IndexPage() {
  return <WeddingExperience guest={null} />;
}
