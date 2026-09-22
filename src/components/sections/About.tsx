import Image from 'next/image';
import { about } from '@/content';
import { Section, Container, Eyebrow, Accented, Diamond } from '@/components/ui/Section';
import { presentAll } from '@/lib/todo';

/**
 * About. Her story is the strongest argument on the site — she was the client
 * who got a poor answer — so the heading says it outright and the pull quote
 * repeats the turn in her own terms.
 *
 * "What she will not do" renders only once she supplies the refusals. It is
 * the highest-trust block on the page, so an empty box in its place would be
 * worse than no box.
 */
export function About({ heading = 'h2' }: { heading?: 'h1' | 'h2' }) {
  const Heading = heading;
  const refusals = presentAll(about.willNotDo.items);

  return (
    <Section id="about">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
          {/*
            Portrait, mounted like a print: a paper margin inside a hairline,
            with a turmeric corner block offset behind it.
          */}
          <figure className="relative m-0 self-start" data-reveal>
            <div className="relative" data-parallax="-24">
              <div aria-hidden="true" className="absolute -bottom-4 -right-4 h-2/3 w-2/3 bg-haldi-soft md:-bottom-6 md:-right-6" />
              <div className="relative border border-line-strong bg-card p-2.5 md:p-3">
                <Image
                  src={about.portrait.src}
                  alt={about.portrait.alt}
                  width={560}
                  height={680}
                  priority
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="h-[420px] w-full object-cover object-[52%_28%] md:h-[560px] lg:h-[620px] lg:object-[55%_40%]"
                />
              </div>
            </div>
            <figcaption className="relative mt-8 t-caption text-muted md:mt-10">{about.portrait.caption}</figcaption>
          </figure>

          <div className="flex flex-col gap-6 lg:pt-6" data-reveal-group>
            <Eyebrow data-reveal-item>{about.eyebrow}</Eyebrow>

            <Heading className="t-h2 m-0 max-w-[18ch] text-balance text-ink" data-reveal-item>
              <Accented text={about.heading} />
            </Heading>

            <div className="flex flex-col gap-5" data-reveal-item>
              {about.paragraphs.map((paragraph, i) => (
                <p key={i} className="t-body m-0 max-w-[60ch]">
                  {paragraph}
                </p>
              ))}
            </div>

            <blockquote
              className="m-0 my-2 border-l-2 border-sindoor pl-5 font-display text-[24px] italic leading-[1.3] text-ink md:pl-7 md:text-[30px]"
              data-reveal-item
            >
              {about.pullQuote}
            </blockquote>

            <ul className="m-0 flex list-none flex-wrap gap-x-7 gap-y-3 p-0" data-reveal-item>
              {about.facts.map((fact) => (
                <li key={fact} className="flex items-center gap-2.5 t-small font-medium text-ink">
                  <Diamond className="text-haldi" />
                  {fact}
                </li>
              ))}
            </ul>

            {refusals.length > 0 && (
              <div className="flex flex-col gap-3 border border-line-strong bg-card px-6 py-6" data-reveal-item>
                <span className="t-label text-sindoor">{about.willNotDo.heading}</span>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {refusals.map((item) => (
                    <li key={item} className="t-body">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
