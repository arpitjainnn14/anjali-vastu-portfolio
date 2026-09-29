import type { Content, Locale } from '@/content';
import { Wordmark } from '@/components/ui/Wordmark';
import { KundliMark } from '@/components/art/Kundli';
import { Seal } from '@/components/art/Seal';
import { SmartLink } from '@/components/ui/SmartLink';
import { liveLinks } from '@/lib/sections';
import { localePath } from '@/lib/locale-routing';

const FOOTER_LINK =
  'inline-flex min-h-11 items-center t-small text-cream-muted no-underline transition-colors duration-200 hover:text-cream md:min-h-0';

export function Footer({ c, locale }: { c: Content; locale: Locale }) {
  const { footer } = c;

  return (
    <footer className="on-night bg-night text-cream-muted">
      <div className="mx-auto max-w-[1440px] px-6 md:px-20">
        {/* A sign-off line, set large, before the practical columns. */}
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-night-line py-10 md:gap-10 md:py-24">
          <p className="m-0 max-w-[20ch] font-display text-[30px] italic leading-[1.1] text-cream md:text-[60px]">
            {footer.signoff}
          </p>
          <Seal
            id="footer"
            seal={c.seal}
            size={116}
            className="h-[84px] w-[84px] text-haldi-light md:h-[116px] md:w-[116px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-9 md:grid-cols-[minmax(0,5fr)_repeat(3,minmax(0,2fr))] md:gap-12 md:py-16">
          <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <KundliMark size={22} className="shrink-0 text-haldi-light" />
              <Wordmark className="text-[21px] text-cream" />
            </div>
            <p className="m-0 t-small text-cream">{footer.practitioner}</p>
            <p className="m-0 max-w-[36ch] t-small">{footer.blurb}</p>
          </div>

          {/*
            Two short lists (Services, Reach her) sit side by side on a phone;
            the long one (Practice, with the policy links) would otherwise pair
            with a short list and leave a tall gap under it, so it takes the
            full row instead. Desktop ignores all of this and lays the columns
            out in their natural order.
          */}
          {footer.columns.map((column, i) => {
            const long = column.links.length > 5;
            return (
              <nav
                key={column.heading}
                className={
                  'flex flex-col gap-3 md:order-none md:col-span-1 ' +
                  (long ? 'order-3 col-span-2' : i === 0 ? 'order-1' : 'order-2')
                }
                aria-label={column.heading}
              >
                <span className="font-display text-[17px] text-haldi-light">{column.heading}</span>
                {liveLinks(column.links, c.testimonials).map((link) => (
                  <SmartLink key={link.href} href={localePath(locale, link.href)} className={FOOTER_LINK}>
                    {link.label}
                  </SmartLink>
                ))}
                {column.showMeta &&
                  footer.meta.map((item) => (
                    <span key={item} className="t-small">
                      {item}
                    </span>
                  ))}
              </nav>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 border-t border-night-line py-5 pb-20 t-caption lg:pb-10 sm:flex-row sm:items-center sm:justify-between">
          <span>{footer.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
