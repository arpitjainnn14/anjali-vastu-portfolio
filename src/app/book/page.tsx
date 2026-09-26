import type { Metadata } from 'next';
import { BookingView, bookingMetadata } from '@/components/sections/BookingView';
import { bookableServices } from '@/lib/booking';

const chosen = bookableServices[0];

export const metadata: Metadata = bookingMetadata(chosen, '/book');

export default function BookPage() {
  return <BookingView chosen={chosen} />;
}
