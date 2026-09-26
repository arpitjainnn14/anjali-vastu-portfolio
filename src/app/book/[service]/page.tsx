import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BookingView, bookingMetadata } from '@/components/sections/BookingView';
import { bookableServices, bookPageHref, findBookable } from '@/lib/booking';

/** One static page per service booked online; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return bookableServices.map((service) => ({ service: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const chosen = findBookable((await params).service);
  return chosen ? bookingMetadata(chosen, bookPageHref(chosen)) : {};
}

export default async function BookServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const chosen = findBookable((await params).service);
  if (!chosen) notFound();
  return <BookingView chosen={chosen} />;
}
