import type { Metadata } from 'next';
import { terms } from '@/content';
import { PolicyDocument } from '@/components/sections/PolicyDocument';
import { pageMetadata } from '@/lib/metadata';

/** noindex until Anjali has read it, like the privacy notice. */
export const metadata: Metadata = {
  ...pageMetadata({ title: terms.heading, description: terms.metaDescription, path: '/terms' }),
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return <PolicyDocument doc={terms} />;
}
