import type { Metadata } from 'next';
import type { Content, Locale } from '@/content';
import { PolicyDocument } from '@/components/sections/PolicyDocument';
import { pageMetadata } from '@/lib/metadata';

/** The three notices, each with its own page and its own document in content. */
export type Policy = 'privacy' | 'terms' | 'refundPolicy';

const paths: Record<Policy, string> = {
  privacy: '/privacy',
  terms: '/terms',
  refundPolicy: '/refund-policy',
};

/**
 * All three are `noindex` until they have been read.
 *
 * The privacy notice is its own page, not a footer paragraph: India's DPDP
 * Rules require the notice to be clear, itemised and separate from any terms
 * of service. DESIGN.md is explicit that a lawyer reviews that copy before it
 * ships, and four decisions are still open (retention period, an email
 * address for written requests, who handles complaints, whether analytics are
 * added) — publishing an unreviewed privacy notice to search engines is worse
 * than not having one. The terms and refund policy wait for Anjali, likewise.
 *
 * To ship one: have the copy reviewed, fill its TODOs in content, then drop
 * its `robots` override here.
 */
export function policyMetadata(c: Content, locale: Locale, policy: Policy): Metadata {
  const doc = c[policy];
  return {
    ...pageMetadata({ title: doc.heading, description: doc.metaDescription, path: paths[policy], locale, c }),
    robots: { index: false, follow: true },
  };
}

export function PolicyPage({ c, policy }: { c: Content; policy: Policy }) {
  return <PolicyDocument c={c} doc={c[policy]} />;
}
