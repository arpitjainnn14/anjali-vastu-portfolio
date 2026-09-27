import type { Metadata } from 'next';
import { refundPolicy } from '@/content';
import { PolicyDocument } from '@/components/sections/PolicyDocument';
import { pageMetadata } from '@/lib/metadata';

/** noindex until Anjali has read it, like the privacy notice. */
export const metadata: Metadata = {
  ...pageMetadata({
    title: refundPolicy.heading,
    description: refundPolicy.metaDescription,
    path: '/refund-policy',
  }),
  robots: { index: false, follow: true },
};

export default function RefundPolicyPage() {
  return <PolicyDocument doc={refundPolicy} />;
}
