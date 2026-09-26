import type { Metadata } from 'next';
import { privacy } from '@/content';
import { PolicyDocument } from '@/components/sections/PolicyDocument';
import { pageMetadata } from '@/lib/metadata';

/**
 * How your details are used.
 *
 * Its own page, not a footer paragraph: India's DPDP Rules require the notice
 * to be clear, itemised and separate from any terms of service.
 *
 * DESIGN.md is explicit that a lawyer reviews this copy before it ships, and
 * four decisions are still open (retention period, an email address for
 * written requests, who handles complaints, whether analytics are added). So
 * the page is `noindex` until it has been reviewed — publishing an
 * unreviewed privacy notice to search engines is worse than not having one.
 *
 * To ship it: have the copy reviewed, fill the TODOs in content.ts, then
 * delete the `robots` block below.
 */
export const metadata: Metadata = {
  ...pageMetadata({ title: privacy.heading, description: privacy.metaDescription, path: '/privacy' }),
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return <PolicyDocument doc={privacy} />;
}
