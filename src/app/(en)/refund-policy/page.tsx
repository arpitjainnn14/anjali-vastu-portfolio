import type { Metadata } from 'next';
import { getContent } from '@/content';
import { PolicyPage, policyMetadata } from '@/components/pages/PolicyPage';

const c = getContent('en');

/** noindex until it has been read (see policyMetadata). */
export const metadata: Metadata = policyMetadata(c, 'en', 'refundPolicy');

export default function Page() {
  return <PolicyPage c={c} policy="refundPolicy" />;
}
