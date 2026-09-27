import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContent } from '@/content';
import { BookingView, bookingMetadata } from '@/components/sections/BookingView';
import { bookableServices, bookPageHref, findBookable } from '@/lib/booking';

const c = getContent('en');

/** One static page per service booked online; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return bookableServices(c).map((service) => ({ service: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ service: string }>;
}): Promise<Metadata> {
  const chosen = findBookable(c, (await params).service);
  return chosen ? bookingMetadata(c, chosen, bookPageHref(chosen)) : {};
}

export default async function BookServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const chosen = findBookable(c, (await params).service);
  if (!chosen) notFound();
  return <BookingView c={c} chosen={chosen} />;
}
