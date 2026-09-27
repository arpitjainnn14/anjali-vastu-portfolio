import { contactSection } from '@/content';
import { Section, Container } from '@/components/ui/Section';
import { present } from '@/lib/todo';
import { howItWorksSteps } from '@/lib/booking';

/**
 * The steps between writing and the consultation, for the contact page.
 *
 * The same steps the service pages show (`howItWorksSteps`), so the two can never tell
 * a visitor different things. A step whose copy is still unsupplied is
 * dropped, rather than leaving a numbered gap.
 *
 * Paper tone: the contact block above it is the deep band, and two deep
 * sections running together read as one flat slab.
 */
export function WhatHappensNext() {
  const steps = howItWorksSteps().filter(
    (step) => present(step.title) !== null && present(step.body) !== null,
  );
  if (steps.length === 0) return null;

  return (
    <Section>
      <Container>
        <div className="flex max-w-[52ch] flex-col gap-4" data-reveal>
          <h2 className="t-h2 m-0 text-balance text-ink">{contactSection.page.stepsHeading}</h2>
          <p className="t-body m-0">{contactSection.page.stepsLead}</p>
        </div>

        <ol className="m-0 mt-12 grid list-none gap-10 p-0 md:mt-16 md:grid-cols-2 md:gap-12 lg:grid-cols-4" data-reveal-group>
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-3 border-t border-line-strong pt-5" data-reveal-item>
              <span className="font-display text-[22px] italic text-sindoor md:text-[26px]">{i + 1}</span>
              <h3 className="t-h3 m-0 text-ink">{step.title}</h3>
              <p className="t-small m-0">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
