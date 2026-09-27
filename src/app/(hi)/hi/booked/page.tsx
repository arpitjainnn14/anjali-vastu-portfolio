import type { Metadata } from 'next';
import { getContent } from '@/content';
import { BookedView, bookedMetadata } from '@/components/sections/BookedView';

const c = getContent('hi');

export const metadata: Metadata = bookedMetadata(c, 'hi', '/booked');

export default function Page() {
  return <BookedView c={c} service={null} />;
}
