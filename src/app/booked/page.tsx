import type { Metadata } from 'next';
import { getContent } from '@/content';
import { BookedView } from '@/components/sections/BookedView';
import { pageMetadata } from '@/lib/metadata';

const c = getContent('en');

/** Never indexed. */
export const metadata: Metadata = {
  ...pageMetadata({ title: c.booking.booked.metaTitle, description: c.booking.booked.metaDescription, path: '/booked', c }),
  robots: { index: false, follow: false },
};

export default function BookedPage() {
  return <BookedView c={c} service={null} />;
}
