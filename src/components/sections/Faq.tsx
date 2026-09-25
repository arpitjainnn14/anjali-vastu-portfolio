import { faq } from '@/content';
import { Section, Container, Accented } from '@/components/ui/Section';

/**
 * The questions that stop people messaging: cost, distance, language, and
 * the birth time. Answered before they have to ask.
 *
 * Native <details>, so it works without JS and every answer is in the HTML
 * for search engines. The first one starts open, so the pattern is obvious.
 */
export function Faq() {
  return (
    <Section id="faq">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-24">
          <div className="flex flex-col gap-5 lg:sticky lg:top-32 lg:self-start" data-reveal>
            <h2 className="t-h2 m-0 max-w-[14ch] text-balance text-ink">
              <Accented text={faq.heading} />
            </h2>
          </div>

          <div className="border-t border-line-strong" data-reveal-group>
            {faq.items.map((item, i) => (
              <details key={item.q} className="faq group border-b border-line-strong" open={i === 0} data-reveal-item>
                <summary className="flex min-h-11 items-center justify-between gap-6 py-6 md:py-7">
                  <span className="font-display text-[20px] leading-[1.3] text-ink md:text-[23px]">{item.q}</span>
                  <svg
                    width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"
                    className="shrink-0 text-sindoor"
                  >
                    <path d="M1 9h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <path className="plus-v" d="M9 1v16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </summary>
                <p className="faq-body t-body m-0 max-w-[60ch] pb-7">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
