import type { Metadata } from 'next';
import Link from 'next/link';
import { picker, servicesSection } from '@/content';
import { Section, Container, Accented } from '@/components/ui/Section';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { ServicePicker } from '@/components/sections/ServicePicker';

/**
 * "Which reading do I need?"
 *
 * Its own page rather than a block on the home page: inline, a three-step
 * questionnaire interrupted the one thing the home page is for, which is
 * getting a stranger to WhatsApp. Here it is the whole point of the page, and
 * the services section links to it in one line.
 */
export const metadata: Metadata = {
  title: picker.pageTitle,
  description: picker.pageDescription,
  alternates: { canonical: picker.href },
};

export default function WhichReadingPage() {
  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <div className="flex max-w-[760px] flex-col gap-5">
          <Link
            href="/#services"
            className="group inline-flex min-h-11 items-center gap-2 self-start t-small font-semibold text-muted no-underline transition-colors duration-200 hover:text-ink"
          >
            <ArrowRightIcon size={14} className="rotate-180" />
            {picker.backLabel}
          </Link>

          <h1 className="t-h1 m-0 max-w-[16ch] text-balance text-ink">
            <Accented text={picker.pageHeading} />
          </h1>

          <p className="t-lead m-0 max-w-[52ch]">{picker.pageLead}</p>
        </div>

        <div className="mt-10 max-w-[760px] md:mt-14">
          <ServicePicker showIntro={false} />
        </div>

        <p className="t-small m-0 mt-8 max-w-[52ch] text-muted">{servicesSection.footnote}</p>
      </Container>
    </Section>
  );
}
