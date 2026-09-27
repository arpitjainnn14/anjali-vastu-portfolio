import type { Metadata } from 'next';
import { getContent } from '@/content';
import { BookingView, bookingMetadata } from '@/components/sections/BookingView';
import { bookableServices, bookPageHref } from '@/lib/booking';

const c = getContent('en');
const chosen = bookableServices(c)[0];

/*
 * The canonical points at /book/<service>, not /book: the two pages have the
 * same content, and /book/<service> is the one form of the URL a visitor can
 * also reach by picking a service.
 */
export const metadata: Metadata = bookingMetadata(c, chosen, bookPageHref(chosen));

export default function BookPage() {
  return <BookingView c={c} chosen={chosen} />;
}
