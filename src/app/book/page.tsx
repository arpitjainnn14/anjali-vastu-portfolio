import type { Metadata } from 'next';
import { BookingView, bookingMetadata } from '@/components/sections/BookingView';
import { bookableServices, bookPageHref } from '@/lib/booking';

const chosen = bookableServices[0];

/*
 * The canonical points at /book/<service>, not /book: the two pages have the
 * same content, and /book/<service> is the one form of the URL a visitor can
 * also reach by picking a service.
 */
export const metadata: Metadata = bookingMetadata(chosen, bookPageHref(chosen));

export default function BookPage() {
  return <BookingView chosen={chosen} />;
}
