import type { Metadata } from 'next';
import { getContent } from '@/content';
import { BookingView, bookingMetadata } from '@/components/sections/BookingView';
import { bookableServices } from '@/lib/booking';

const c = getContent('en');
const chosen = bookableServices(c)[0];

/* Canonical: /book/<service> (see bookingMetadata). */
export const metadata: Metadata = bookingMetadata(c, 'en', chosen);

export default function Page() {
  return <BookingView c={c} locale="en" chosen={chosen} />;
}
