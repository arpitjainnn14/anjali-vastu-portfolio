import { contactSection } from '@/content';
import { whatsappHref } from '@/lib/whatsapp';
import { Section, Container, Eyebrow, Accented } from '@/components/ui/Section';
import { WhatsAppIcon } from '@/components/ui/Icons';
import { ButtonLink } from '@/components/ui/Button';
import { ContactForm } from '@/components/sections/ContactForm';
import { presentHref } from '@/lib/todo';

/**
 * Contact. WhatsApp first, the form second.
 *
 * The WhatsApp button has no scroll motion at all — it must never be
 * mid-animation when a thumb arrives.
 */

function ExternalArrow() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export function Contact({ heading = 'h2' }: { heading?: 'h1' | 'h2' }) {
  const Heading = heading;

  return (
    <Section id="contact" tone="deep" data-hides-sticky>
      <Container>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-24">
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-5" data-reveal>
              <Eyebrow>{contactSection.eyebrow}</Eyebrow>
              <Heading className="t-h2 m-0 max-w-[14ch] text-balance text-ink">
                <Accented text={contactSection.heading} />
              </Heading>
              <p className="t-body m-0 max-w-[46ch]">{contactSection.lead}</p>
            </div>

            <ButtonLink
              href={whatsappHref()}
              className="self-stretch sm:self-start"
            >
              <WhatsAppIcon size={19} />
              {contactSection.whatsappCta}
            </ButtonLink>

            <dl className="m-0 mt-2 grid grid-cols-2 border-t border-line-strong">
              {contactSection.details.map((detail) => {
                const href = detail.link ? presentHref(detail.link.href) : null;

                return (
                  <div key={detail.label} className="flex flex-col gap-1 border-b border-line-strong py-4 odd:pr-4 sm:odd:pr-6">
                    <dt className="t-caption text-muted">{detail.label}</dt>
                    <dd className="m-0 flex flex-col gap-1">
                      <span className="t-small font-medium text-ink">{detail.value}</span>

                      {/* Rendered only once there is a real Maps URL. */}
                      {detail.link && href && (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ink-link inline-flex min-h-11 items-center gap-1.5 t-small text-sindoor md:min-h-0"
                        >
                          {detail.link.label}
                          <ExternalArrow />
                        </a>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>

          <div data-reveal>
            <h3 className="t-h3 m-0 mb-5 text-ink">{contactSection.formTitle}</h3>
            <ContactForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}
