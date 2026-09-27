import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContent } from '@/content';
import { BookedView, bookedMetadata } from '@/components/sections/BookedView';
import { bookableServices, findBookable } from '@/lib/booking';

const c = getContent('hi');

/** One static page per service booked online; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return bookableServices(c).map((service) => ({ service: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  return bookedMetadata(c, 'hi', `/booked/${(await params).service}`);
}

export default async function Page({ params }: { params: Promise<{ service: string }> }) {
  const service = findBookable(c, (await params).service);
  if (!service) notFound();
  return <BookedView c={c} service={service} />;
}
