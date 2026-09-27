import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContent } from '@/content';
import { BookedView } from '@/components/sections/BookedView';
import { bookableServices, findBookable } from '@/lib/booking';
import { pageMetadata } from '@/lib/metadata';

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
  const { service } = await params;
  return {
    ...pageMetadata({
      title: c.booking.booked.metaTitle,
      description: c.booking.booked.metaDescription,
      path: `/booked/${service}`,
      c,
    }),
    robots: { index: false, follow: false },
  };
}

export default async function BookedServicePage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const service = findBookable(c, (await params).service);
  if (!service) notFound();
  return <BookedView c={c} service={service} />;
}
