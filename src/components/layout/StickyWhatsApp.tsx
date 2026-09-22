'use client';

import { useEffect, useState } from 'react';
import { contactSection } from '@/content';
import { whatsappHref } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/ui/Icons';

/**
 * A small WhatsApp button pinned to the bottom of the screen, phones and
 * tablets only (hidden from 1024px up, where the page has room for its own).
 *
 * It never doubles up: while any element marked `data-hides-sticky` is on
 * screen — the hero, the contact section, a service page's at-a-glance card,
 * each of which has its own WhatsApp button — it steps out of the way.
 *
 * Starts hidden, so it never flashes over the hero before hydration.
 */
export function StickyWhatsApp() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const targets = document.querySelectorAll('[data-hides-sticky]');
    const onScreen = new Set<Element>();

    const update = () => setVisible(onScreen.size === 0 && window.scrollY > 200);

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      }
      update();
    });
    targets.forEach((el) => observer.observe(el));

    window.addEventListener('scroll', update, { passive: true });
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <a
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      className={
        'fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 inline-flex h-[52px] items-center gap-2.5 ' +
        'rounded-full bg-sindoor pl-5 pr-6 text-[15.5px] font-semibold text-card no-underline ' +
        'shadow-[0_10px_30px_rgba(35,28,22,.28)] transition-[opacity,transform,background-color] duration-300 ease-out ' +
        'hover:bg-sindoor-deep motion-reduce:transition-none lg:hidden ' +
        (visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0')
      }
    >
      <WhatsAppIcon size={20} />
      {contactSection.stickyLabel}
    </a>
  );
}
