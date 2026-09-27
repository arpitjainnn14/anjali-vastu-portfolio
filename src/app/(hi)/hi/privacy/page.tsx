import type { Metadata } from 'next';
import { getContent } from '@/content';
import { PolicyPage, policyMetadata } from '@/components/pages/PolicyPage';

const c = getContent('hi');

/** noindex until it has been read (see policyMetadata). */
export const metadata: Metadata = policyMetadata(c, 'hi', 'privacy');

export default function Page() {
  return <PolicyPage c={c} policy="privacy" />;
}
