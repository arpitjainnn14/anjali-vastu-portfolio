import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContent } from '@/content';
import { MotionLab } from './MotionLab';

/** Throwaway motion preview. `npm run dev` only; 404 in production builds. */
export const metadata: Metadata = {
  title: 'Motion lab',
  robots: { index: false, follow: false },
};

export default function MotionLabPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  const c = getContent('en');
  return <MotionLab seal={c.seal} opening={c.about.paragraphs[0]} testimonials={c.testimonials} portrait={c.about.portrait} about={c.about} />;
}
