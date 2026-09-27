import { Fraunces, Hanken_Grotesk, Tiro_Devanagari_Hindi } from 'next/font/google';

/*
 * The fonts both root layouts load. Self-hosted by next/font: no third-party
 * request, no layout shift. Defined once here so the English and Hindi
 * layouts share one copy of each file; Mukta, which only Hindi pages need, is
 * defined in the Hindi layout.
 */

/* Variable, with the SOFT and optical-size axes the type scale leans on. */
export const fraunces = Fraunces({
  weight: 'variable',
  style: ['normal', 'italic'],
  axes: ['SOFT', 'opsz'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
});

export const hanken = Hanken_Grotesk({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-hanken',
});

/* A serif Devanagari to sit beside Fraunces. Hindi quotes and chart labels; on Hindi pages, the headings. */
export const tiroDeva = Tiro_Devanagari_Hindi({
  weight: '400',
  subsets: ['devanagari'],
  display: 'swap',
  variable: '--font-tiro-deva',
});
