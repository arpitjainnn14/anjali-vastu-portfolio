'use client';

import { createContext, useContext, useMemo } from 'react';
import { getContent, type Content, type Locale } from '@/content';

/**
 * Gets the visitor's language to client components.
 *
 * A page passes its own `locale` (a string) to the root layout, which wraps
 * the body in `<LocaleProvider locale={locale}>`. The provider builds the
 * bundle itself with `getContent(locale)`: the bundle carries functions
 * (`picker.message`, `whatsappMessages.service`, …), which cannot cross the
 * server→client boundary as a prop, so only the locale is passed down and
 * the client rebuilds the bundle from it. Both bundles ship in the client
 * JS either way — they're a couple thousand lines of strings, which is
 * accepted rather than split further.
 *
 * Client components read the bundle with `useContent()` instead of
 * importing `@/content` directly, the same way a server component takes
 * `c: Content` as a prop.
 */

const LocaleContext = createContext<{ c: Content; locale: Locale } | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo(() => ({ c: getContent(locale), locale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useContent() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useContent must be called from inside a LocaleProvider');
  }
  return context;
}
