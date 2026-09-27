'use client';

import { useEffect } from 'react';
import { hindiLive } from '@/content/shared';
import { LANGUAGE_STORAGE_KEY } from '@/components/locale/LanguageToggle';

/**
 * On the English home page only: a visitor who chose Hindi with the toggle
 * before is sent to /hi. Nothing else redirects, and nothing reads the
 * browser's language; the visitor's own choice is the only signal. Renders
 * nothing.
 */
export function RememberedLanguage() {
  useEffect(() => {
    if (!hindiLive) return;
    try {
      if (window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'hi') window.location.replace('/hi');
    } catch {
      /* Storage unavailable: stay on the English page. */
    }
  }, []);
  return null;
}
