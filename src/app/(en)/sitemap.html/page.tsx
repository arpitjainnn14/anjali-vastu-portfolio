import type { Metadata } from 'next';
import { getContent } from '@/content';
import { SiteMapPage, siteMapMetadata } from '@/components/pages/SiteMapPage';

const c = getContent('en');

export const metadata: Metadata = siteMapMetadata(c, 'en');

export default function Page() {
  return <SiteMapPage c={c} locale="en" />;
}
