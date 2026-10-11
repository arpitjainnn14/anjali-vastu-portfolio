import type { Metadata } from 'next';
import { BlogPostRoute, blogPostRouteMetadata } from '@/components/pages/BlogPostRoute';

/** Per request, like the list: see README "Blog". */
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return blogPostRouteMetadata('hi', (await params).slug);
}

export default async function Page({ params }: Props) {
  return <BlogPostRoute locale="hi" slug={(await params).slug} />;
}
