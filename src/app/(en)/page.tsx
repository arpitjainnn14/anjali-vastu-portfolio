import type { Metadata } from 'next';
import { getContent } from '@/content';
import { HomePage, homeMetadata } from '@/components/pages/HomePage';
import { RememberedLanguage } from '@/components/locale/RememberedLanguage';

const c = getContent('en');

export const metadata: Metadata = homeMetadata(c, 'en');

export default function Page() {
  return (
    <>
      {/* A visitor who chose Hindi before is sent to /hi (only once Hindi is live). */}
      <RememberedLanguage />
      <HomePage c={c} locale="en" />
    </>
  );
}
