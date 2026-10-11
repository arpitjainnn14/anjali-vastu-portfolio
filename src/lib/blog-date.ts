import type { Locale } from '@/content';

/** A note's date in the reader's language, in India's time zone: "5 October 2026". */
export const blogDate = (ms: number, locale: Locale): string =>
  new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(ms));
