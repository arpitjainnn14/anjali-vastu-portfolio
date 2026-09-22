import { contact, whatsappMessages } from '@/content';

/**
 * A wa.me link that opens WhatsApp with a message already typed.
 *
 * The one place a WhatsApp URL is built. Every button on the site calls this,
 * so changing the number, or the default opener, is a one-line edit in
 * `content/site.ts`.
 */
export function whatsappHref(message: string = whatsappMessages.general): string {
  return `${contact.whatsappUrl}?text=${encodeURIComponent(message)}`;
}
