import type { Metadata } from 'next';
import { getContent } from '@/content';
import { SiteMapPage, siteMapMetadata } from '@/components/pages/SiteMapPage';

const c = getContent('hi');

export const metadata: Metadata = siteMapMetadata(c, 'hi');

export default function Page() {
  return <SiteMapPage c={c} locale="hi" />;
}
