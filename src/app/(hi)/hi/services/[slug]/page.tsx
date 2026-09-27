import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContent } from '@/content';
import { ServicePage, findService, serviceMetadata, serviceSlugs } from '@/components/pages/ServicePage';

const c = getContent('hi');

export function generateStaticParams() {
  return serviceSlugs(c);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return serviceMetadata(c, 'hi', (await params).slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const service = findService(c, (await params).slug);
  if (!service) notFound();
  return <ServicePage c={c} locale="hi" service={service} />;
}
