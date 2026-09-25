import { footer, site } from '@/content';
import { KundliMark } from '@/components/art/Kundli';
import { Seal } from '@/components/art/Seal';
import { SmartLink } from '@/components/ui/SmartLink';
import { liveLinks } from '@/lib/sections';

const FOOTER_LINK =
  'inline-flex min-h-11 items-center t-small text-cream-muted no-underline transition-colors duration-200 hover:text-cream md:min-h-0';

export function Footer() {
  return (
    <footer className="on-night bg-night text-cream-muted">
      <div className="mx-auto max-w-[1440px] px-5 md:px-20">
        {/* A sign-off line, set large, before the practical columns. */}
        <div className="flex flex-wrap items-end justify-between gap-10 border-b border-night-line py-14 md:py-24">
          <p className="m-0 max-w-[20ch] font-display text-[30px] italic leading-[1.1] text-cream md:text-[60px]">
            {footer.signoff}
          </p>
          <Seal id="footer" size={116} className="text-haldi-light" />
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-[minmax(0,5fr)_repeat(3,minmax(0,2fr))] md:gap-12 md:py-16">
          <div className="col-span-2 flex flex-col gap-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <KundliMark size={22} className="text-haldi-light" />
              <span className="font-display text-[22px] leading-none text-cream">{site.name}</span>
            </div>
            <p className="m-0 max-w-[36ch] t-small">{footer.blurb}</p>
          </div>

          {footer.columns.map((column) => (
            <nav key={column.heading} className="flex flex-col gap-3" aria-label={column.heading}>
              <span className="font-display text-[17px] text-haldi-light">{column.heading}</span>
              {liveLinks(column.links).map((link) => (
                <SmartLink key={link.href} href={link.href} className={FOOTER_LINK}>
                  {link.label}
                </SmartLink>
              ))}
              {column.heading === 'Reach her' &&
                footer.meta.map((item) => (
                  <span key={item} className="t-small">
                    {item}
                  </span>
                ))}
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-night-line py-6 pb-24 t-caption lg:pb-10 sm:flex-row sm:items-center sm:justify-between">
          <span>{footer.copyright}</span>
          <span>{site.credential}</span>
        </div>
      </div>
    </footer>
  );
}
