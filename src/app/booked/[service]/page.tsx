import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { booking } from '@/content';
import { BookedView } from '@/components/sections/BookedView';
import { bookableServices, findBookable } from '@/lib/booking';
import { pageMetadata } from '@/lib/metadata';

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
  const { service } = await params;
  return {
    ...pageMetadata({
      title: booking.booked.metaTitle,
      description: booking.booked.metaDescription,
      path: `/booked/${service}`,
    }),
    robots: { index: false, follow: false },
  };
}

export default async function BookedServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const service = findBookable((await params).service);
  if (!service) notFound();
  return <BookedView service={service} />;
}
