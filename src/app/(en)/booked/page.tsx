import type { Metadata } from 'next';
import { getContent } from '@/content';
import { BookedView, bookedMetadata } from '@/components/sections/BookedView';

const c = getContent('en');

export const metadata: Metadata = bookedMetadata(c, 'en', '/booked');

export default function Page() {
  return <BookedView c={c} service={null} />;
}
