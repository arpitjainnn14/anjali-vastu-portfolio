import type { Metadata } from 'next';
import { booking } from '@/content';
import { BookedView } from '@/components/sections/BookedView';
import { pageMetadata } from '@/lib/metadata';

/** Never indexed. */
export const metadata: Metadata = {
  ...pageMetadata({ title: booking.booked.metaTitle, description: booking.booked.metaDescription, path: '/booked' }),
  robots: { index: false, follow: false },
};

export default function BookedPage() {
  return <BookedView service={null} />;
}
