import type { Content } from '@/content';
import { whatsappHref } from '@/lib/whatsapp';
import { Section, Container, Accented } from '@/components/ui/Section';
import { Seal } from '@/components/art/Seal';
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

/**
 * The contact block. `standalone` is the contact page, where this is the whole
 * page rather than the last section of a longer argument: there it fills the
 * column under the details with who reads the message, because a bare form on
 * its own page tells a stranger nothing.
 */
export function Contact({
  c,
  heading = 'h2',
  standalone = false,
}: {
  c: Content;
  heading?: 'h1' | 'h2';
  standalone?: boolean;
}) {
  const { contactSection } = c;
  const Heading = heading;
  const FormHeading = standalone ? 'h2' : 'h3';
  const formHeadingClass = standalone ? 't-h2' : 't-h3';

  return (
    <Section id="contact" tone="deep" data-hides-sticky>
      <Container>
        <div className="grid gap-10 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] xl:gap-24">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5" data-reveal>
              <Heading
                className={`m-0 max-w-[16ch] text-balance text-ink ${standalone ? 't-h1' : 't-h2'}`}
              >
                <Accented text={contactSection.heading} />
              </Heading>
              <p className="t-body m-0 max-w-[46ch]">{contactSection.lead}</p>
              {standalone && <p className="t-body m-0 max-w-[46ch]">{contactSection.page.localNote}</p>}
            </div>

            <ButtonLink
              href={whatsappHref(c)}
              className="self-stretch sm:self-start"
            >
              <WhatsAppIcon size={19} />
              {contactSection.whatsappCta}
            </ButtonLink>

            <dl className="m-0 mt-2 grid gap-5 sm:grid-cols-2 sm:gap-x-10">
              {contactSection.details.map((detail) => {
                const href = detail.link ? presentHref(detail.link.href) : null;

                return (
                  <div key={detail.label} className="flex flex-col gap-0.5">
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

            {standalone && (
              <div className="mt-2 flex gap-6 border-t border-line-strong pt-7" data-reveal>
                <div className="flex flex-col gap-2">
                  <h2 className="t-h3 m-0 text-ink">{contactSection.page.answeredBy.heading}</h2>
                  <p className="t-small m-0 max-w-[44ch]">{contactSection.page.answeredBy.body}</p>
                </div>
                <Seal id="contact" seal={c.seal} size={96} className="hidden self-start sm:block" />
              </div>
            )}
          </div>

          <div data-reveal>
            <FormHeading className={`${formHeadingClass} m-0 mb-7 text-balance text-ink md:mb-8`}>
              {contactSection.formTitle}
            </FormHeading>
            <ContactForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}
