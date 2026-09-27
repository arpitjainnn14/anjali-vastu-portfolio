import type { Content } from '@/content';
import { contact } from '@/content/shared';

/**
 * A wa.me link that opens WhatsApp with a message already typed.
 *
 * The one place a WhatsApp URL is built. Every button on the site calls this,
 * so changing the number is a one-line edit in `content/shared.ts` (it is the
 * same in every language), and the default opener is `whatsappMessages` in
 * each bundle's `site.ts` (`content/en/`, `content/hi/`), taken from the
 * page's own bundle.
 */
export function whatsappHref(c: Content, message: string = c.whatsappMessages.general): string {
  return `${contact.whatsappUrl}?text=${encodeURIComponent(message)}`;
}
