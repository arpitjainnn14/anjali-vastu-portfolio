import type { Content } from '@/content';
import { contact } from '@/content/shared';

/**
 * A wa.me link that opens WhatsApp with a message already typed.
 *
 * The one place a WhatsApp URL is built. Every button on the site calls this,
 * so changing the number, or the default opener, is a one-line edit in
 * `content/site.ts`. The phone number is a shared fact (same in every
 * language); the default message comes from the page's own content bundle.
 */
export function whatsappHref(c: Content, message: string = c.whatsappMessages.general): string {
  return `${contact.whatsappUrl}?text=${encodeURIComponent(message)}`;
}
