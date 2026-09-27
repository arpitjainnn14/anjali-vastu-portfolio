import type { Metadata } from 'next';
import { getContent } from '@/content';
import { PolicyDocument } from '@/components/sections/PolicyDocument';
import { pageMetadata } from '@/lib/metadata';

const c = getContent('en');

/** noindex until Anjali has read it, like the privacy notice. */
export const metadata: Metadata = {
  ...pageMetadata({
    title: c.refundPolicy.heading,
    description: c.refundPolicy.metaDescription,
    path: '/refund-policy',
    c,
  }),
  robots: { index: false, follow: true },
};

export default function RefundPolicyPage() {
  return <PolicyDocument c={c} doc={c.refundPolicy} />;
}
