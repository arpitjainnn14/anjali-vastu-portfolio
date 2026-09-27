import type { Metadata } from 'next';
import Link from 'next/link';
import type { Content, Locale } from '@/content';
import { Section, Container, Accented } from '@/components/ui/Section';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { ServicePicker } from '@/components/sections/ServicePicker';
import { pageMetadata } from '@/lib/metadata';
import { localePath } from '@/lib/locale-routing';

/**
 * "Which reading do I need?"
 *
 * Its own page rather than a block on the home page: inline, a three-step
 * questionnaire interrupted the one thing the home page is for, which is
 * getting a stranger to WhatsApp. Here it is the whole point of the page, and
 * the services section links to it in one line.
 */
export function whichReadingMetadata(c: Content, locale: Locale): Metadata {
  return pageMetadata({
    title: c.picker.pageTitle,
    description: c.picker.pageDescription,
    path: c.picker.href,
    locale,
    c,
  });
}

export function WhichReadingPage({ c, locale }: { c: Content; locale: Locale }) {
  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <div className="flex max-w-[760px] flex-col gap-5">
          <Link
            href={localePath(locale, '/#services')}
            className="group inline-flex min-h-11 items-center gap-2 self-start t-small font-semibold text-muted no-underline transition-colors duration-200 hover:text-ink"
          >
            <ArrowRightIcon size={14} className="rotate-180" />
            {c.picker.backLabel}
          </Link>

          <h1 className="t-h1 m-0 max-w-[16ch] text-balance text-ink">
            <Accented text={c.picker.pageHeading} />
          </h1>

          <p className="t-lead m-0 max-w-[52ch]">{c.picker.pageLead}</p>
        </div>

        <div className="mt-10 max-w-[760px] md:mt-14">
          <ServicePicker showIntro={false} />
        </div>

        <p className="t-small m-0 mt-8 max-w-[52ch] text-muted">{c.servicesSection.footnote}</p>
      </Container>
    </Section>
  );
}
