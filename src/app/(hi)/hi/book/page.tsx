import type { Metadata } from 'next';
import { getContent } from '@/content';
import { BookingView, bookingMetadata } from '@/components/sections/BookingView';
import { bookableServices } from '@/lib/booking';

const c = getContent('hi');
const chosen = bookableServices(c)[0];

/* Canonical: /book/<service> (see bookingMetadata). */
export const metadata: Metadata = bookingMetadata(c, 'hi', chosen);

export default function Page() {
  return <BookingView c={c} locale="hi" chosen={chosen} />;
}
