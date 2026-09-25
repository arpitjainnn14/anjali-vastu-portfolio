'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { nav, site, contactSection } from '@/content';
import { whatsappHref } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/ui/Icons';
import { KundliMark } from '@/components/art/Kundli';
import { liveLinks } from '@/lib/sections';
import { ButtonLink } from '@/components/ui/Button';

/**
 * The nav bar and the mobile drawer.
 *
 * No call-to-action button in the bar: the WhatsApp ask already appears in
 * the hero, on every service and in the contact section. The bar is for
 * finding your way, so it holds links only.
 *
 * The bar gains its paper fill and hairline once the page has scrolled, via
 * `data-scrolled`. Without JS it stays filled.
 *
 * The drawer traps focus while open and restores it on close — a drawer that
 * lets Tab escape behind it is the most common mobile a11y failure.
 */

const LINKS = liveLinks(nav.links);

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(true);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  /*
   * A link to the page you are already on is not a navigation, so Next leaves
   * the scroll where it is. Send the visitor back to the top instead, which is
   * what a click on "About" while reading About is asking for.
   */
  function onLinkClick(href: string) {
    setOpen(false);
    if (href === pathname) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* Transparent at the very top of the page, filled as soon as it moves. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Lock the page behind the drawer, trap Tab inside it, restore focus after. */
  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const focusables = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    focusables()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  return (
    <>
      <header data-nav className="fixed inset-x-0 top-0 z-40">
        {/* The fill is its own layer, so only its opacity changes. */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 border-b border-line bg-paper/90 backdrop-blur-[10px] transition-opacity duration-300 ${
            scrolled ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="relative mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 md:h-20 md:px-20">
          <Link href="/" className="group flex min-h-11 items-center gap-3 no-underline md:min-h-0">
            <KundliMark size={22} className="text-sindoor transition-transform duration-500 group-hover:rotate-90" />
            <span className="font-display text-[20px] leading-none tracking-[-0.01em] text-ink md:text-[22px]">
              {site.name}
            </span>
          </Link>

          {/* Desktop */}
          <nav className="hidden items-center gap-9 lg:flex" aria-label={nav.labels.main}>
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? 'page' : undefined}
                onClick={() => onLinkClick(link.href)}
                className="nav-link text-[15.5px] font-medium text-body no-underline transition-colors duration-200 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile */}
          <button
            ref={triggerRef}
            type="button"
            aria-label={nav.labels.openMenu}
            aria-expanded={open}
            aria-controls="mobile-drawer"
            onClick={() => setOpen(true)}
            className="-mr-3 flex h-12 w-12 items-center justify-center bg-transparent lg:hidden"
          >
            <svg
              width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"
              className="text-ink"
            >
              <path d="M4 8h16M4 16h11" />
            </svg>
          </button>
        </div>
      </header>

      {open && (
        <div
          ref={drawerRef}
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={nav.labels.menu}
          className="fixed inset-0 z-50 overflow-y-auto bg-paper lg:hidden"
        >
          <div className="flex min-h-full flex-col px-6 pb-10">
            <div className="flex h-16 items-center justify-between">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center gap-3 no-underline"
              >
                <KundliMark size={22} className="text-sindoor" />
                <span className="font-display text-[20px] leading-none text-ink">
                  {site.name}
                </span>
              </Link>
              <button
                type="button"
                aria-label={nav.labels.closeMenu}
                onClick={() => setOpen(false)}
                className="-mr-3 flex h-12 w-12 items-center justify-center bg-transparent"
              >
                <svg
                  width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"
                  className="text-ink"
                >
                  <path d="M5 5l14 14M19 5L5 19" />
                </svg>
              </button>
            </div>

            <nav className="mt-10 flex flex-col border-t border-line-strong" aria-label={nav.labels.main}>
              {LINKS.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  onClick={() => onLinkClick(link.href)}
                  className="enter flex min-h-16 items-baseline gap-4 border-b border-line-strong font-display text-[32px] text-ink no-underline"
                  style={{ '--d': `${0.04 * i}s` } as React.CSSProperties}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-12 flex flex-col gap-3">
              <ButtonLink
                href={whatsappHref()}
                block
              >
                <WhatsAppIcon size={18} />
                {contactSection.whatsappCta}
              </ButtonLink>
            </div>

            <div className="mt-auto flex flex-col gap-2.5 pt-12">
              <span className="t-small text-muted">
                {site.city}, {site.state} · {site.languages}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
