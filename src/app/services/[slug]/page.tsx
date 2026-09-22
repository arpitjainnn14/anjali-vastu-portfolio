import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  services,
  howItWorks,
  site,
  whatsappMessages,
  serviceDetail,
} from '@/content';
import { Section, Container, Eyebrow } from '@/components/ui/Section';
import { serviceIcons, WhatsAppIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { ButtonLink } from '@/components/ui/Button';
import { whatsappHref } from '@/lib/whatsapp';
import { presentAll, present } from '@/lib/todo';

/** Three pages from one typed array, never three hand-written files. */
export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};

  return {
    title: service.name,
    description: service.summary,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: `${service.name} — ${site.name}`,
      description: service.summary,
      url: `/services/${service.slug}`,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const Icon = serviceIcons[service.icon];
  const covers = presentAll(service.covers);
  const others = services.filter((s) => s.slug !== service.slug);

  /* A step whose copy is unsupplied is dropped, so no numbered gap appears. */
  const steps = howItWorks.filter(
    (step) => present(step.title) !== null && present(step.body) !== null,
  );

  const glance = [
    { label: serviceDetail.glanceLabels.where, value: serviceDetail.glanceWhere },
    { label: serviceDetail.glanceLabels.languages, value: site.languages },
    { label: serviceDetail.glanceLabels.youWillNeed, value: service.youWillNeed },
    { label: serviceDetail.glanceLabels.fees, value: serviceDetail.glanceFees },
  ];

  return (
    <Section className="pt-28 md:pt-40">
      <Container>
        <nav aria-label={serviceDetail.breadcrumbLabel} className="flex items-center gap-3">
          <Link
            href="/#services"
            className="ink-link inline-flex min-h-11 items-center t-small text-muted md:min-h-0"
          >
            {serviceDetail.breadcrumbRoot}
          </Link>
          <span aria-hidden="true" className="t-small text-muted">
            /
          </span>
          <span aria-current="page" className="t-small font-medium text-ink">{service.name}</span>
        </nav>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-20">
          {/*
            Three grid items, not two columns: on a phone the order is title,
            the at-a-glance card with the WhatsApp button, then the detail, so
            the button is on the first screen rather than after every step.
          */}
          <div className="flex flex-col gap-5" data-reveal-group>
            <Eyebrow data-reveal-item>{service.question}</Eyebrow>
            <h1 className="t-h1 m-0 flex items-center gap-4 text-ink" data-reveal-item>
              <Icon size={44} strokeWidth={1.2} className="shrink-0 text-haldi" />
              {service.name}
            </h1>
            <p className="t-lead m-0 max-w-[48ch]" data-reveal-item>{service.summary}</p>
          </div>

          {/* At a glance */}
          <aside data-hides-sticky className="flex h-fit flex-col gap-5 rounded-card border border-line-strong bg-card p-6 md:p-8 lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <span className="t-label text-muted">
              {serviceDetail.glanceHeading}
            </span>

            <dl className="m-0 flex flex-col">
              {glance.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex justify-between gap-4 border-t border-dashed border-line-strong py-3 ${
                    i === glance.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <dt className="t-small text-muted">{row.label}</dt>
                  <dd className="m-0 t-small text-right font-medium text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>

            <ButtonLink
              href={whatsappHref(whatsappMessages.service(service.name))}
              block
            >
              <WhatsAppIcon size={19} />
              {serviceDetail.ctaLabel}
            </ButtonLink>

            <span className="t-caption text-muted">{serviceDetail.reassurance}</span>
          </aside>

          <div className="flex flex-col gap-12 md:gap-16 lg:col-start-1">

            {/*
              What a reading covers. Anjali has not supplied these lines yet, and
              DESIGN.md calls this the page that decides whether someone books —
              so it renders only when there is something real to put in it.
            */}
            {covers.length > 0 && (
              <div className="flex flex-col gap-5">
                <h2 className="t-h3 m-0 text-ink">
                  {service.detailLinkLabel}
                </h2>
                <ul className="m-0 flex list-none flex-col p-0">
                  {covers.map((point, i) => (
                    <li
                      key={point}
                      className={`border-t border-line-strong py-4 t-body ${
                        i === covers.length - 1 ? 'border-b' : ''
                      }`}
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {steps.length > 0 && (
              <div className="flex flex-col gap-6" data-reveal>
                <h2 className="t-h3 m-0 text-ink">
                  {serviceDetail.howItWorksHeading}
                </h2>
                <ol className="m-0 grid list-none grid-cols-[44px_1fr] gap-x-5 p-0 md:grid-cols-[56px_1fr]">
                  {steps.map((step, i) => (
                    <li key={step.title} className="contents">
                      <span className="font-display text-[22px] italic text-sindoor md:text-[26px]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div
                        className={`flex flex-col gap-1.5 ${
                          i === steps.length - 1 ? '' : 'pb-6 md:pb-[26px]'
                        }`}
                      >
                        <span className="text-[17px] font-semibold text-ink md:text-[18px]">
                          {step.title}
                        </span>
                        <span className="t-body max-w-[58ch]">{step.body}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* The other two */}
        <div className="mt-20 flex flex-col gap-6 border-t border-line-strong pt-12 md:mt-28" data-reveal>
          <h2 className="t-h3 m-0 text-ink">
            {serviceDetail.otherHeading}
          </h2>
          <div className="grid gap-5 md:grid-cols-2 md:gap-6">
            {others.map((other) => (
              <Link
                key={other.slug}
                href={`/services/${other.slug}`}
                className="group flex items-center justify-between gap-5 rounded-card border border-line-strong bg-card px-6 py-5 no-underline transition-colors duration-[240ms] hover:border-ink md:px-7 md:py-6"
              >
                <span className="flex flex-col gap-1">
                  <span className="font-display text-[22px] text-ink md:text-[24px]">
                    {other.name}
                  </span>
                  <span className="t-small text-muted">{other.question}</span>
                </span>
                <ArrowRightIcon size={20} className="nudge shrink-0 text-sindoor" />
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
