'use client';

import { usePathname } from 'next/navigation';
import { hindiLive, languageNames } from '@/content/shared';
import { useContent } from '@/components/locale/LocaleProvider';
import { alternatePath } from '@/lib/locale-routing';

/** Where the visitor's chosen language is remembered; read by RememberedLanguage. */
export const LANGUAGE_STORAGE_KEY = 'lang';

/**
 * The link to this same page in the other language: "हिंदी" on an English
 * page, "English" on a Hindi one. Rendered only once `hindiLive` is on.
 *
 * A plain <a>, not next/link: the two languages have different root layouts,
 * so crossing between them is a full page load either way. The choice is
 * remembered, so a visitor who picked Hindi and comes back to the English
 * home page is sent to /hi (see RememberedLanguage).
 */
export function LanguageToggle({ className = '', onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { locale } = useContent();
  const pathname = usePathname();
  if (!hindiLive) return null;

  const target = locale === 'hi' ? 'en' : 'hi';

  function remember() {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, target);
    } catch {
      /* Private mode or blocked storage: the link still works, it just isn't remembered. */
    }
    onNavigate?.();
  }

  return (
    <a href={alternatePath(pathname)} lang={target} hrefLang={target} onClick={remember} className={className}>
      {languageNames[target]}
    </a>
  );
}
