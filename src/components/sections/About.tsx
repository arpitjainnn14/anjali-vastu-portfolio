import { Fragment } from 'react';
import Image from 'next/image';
import { about } from '@/content';
import { Section, Container, Accented } from '@/components/ui/Section';
import { Seal } from '@/components/art/Seal';
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
  /* The phone seal sits before the closing paragraph; -1 when there is no room. */
  const sealAfter = about.paragraphs.length - 2;

  return (
    <Section id="about">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-24">
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
                  className="h-[250px] w-full object-cover object-[52%_28%] md:h-[560px] lg:h-[620px] lg:object-[55%_40%]"
                />
              </div>
            </div>
            <figcaption className="relative mt-8 t-caption text-muted md:mt-10">{about.portrait.caption}</figcaption>
          </figure>

          <div className="flex flex-col gap-6 lg:pt-6" data-reveal-group>
            <Heading className="t-h2 m-0 max-w-[20ch] text-balance text-ink" data-reveal-item>
              <Accented text={about.heading} />
            </Heading>

            <div className="flex flex-col gap-5" data-reveal-item>
              {about.paragraphs.map((paragraph, i) => (
                <Fragment key={i}>
                  <p className={`m-0 max-w-[60ch] ${i === 0 ? 't-open text-ink md:text-body' : 't-body'}`}>
                    {paragraph}
                  </p>
                  {i === sealAfter && (
                    <Seal id="about-phone" size={76} className="my-1 self-end md:hidden" />
                  )}
                </Fragment>
              ))}
            </div>

            {/*
              Her seal closes the story, the way she would stamp a chart she
              had read. It carries the emphasis the old bar-and-pull-quote did.

              On a phone it moves up, between the second and third paragraphs,
              where it breaks the longest run of text on the site. The two
              instances are mutually exclusive by breakpoint — never both in
              the same layout — and each needs its own id, since the curved
              text hangs off path ids.
            */}
            <div className="flex flex-wrap items-center justify-between gap-6 pt-1" data-reveal-item>
              <p className="t-small m-0 max-w-[46ch] pl-5 text-muted md:pl-0">{about.facts.join(' · ')}</p>
              <Seal id="about" size={104} className="-mt-1 hidden md:block" />
            </div>

            {refusals.length > 0 && (
              <div className="flex flex-col gap-3 border border-line-strong bg-card px-6 py-6" data-reveal-item>
                <span className="font-display text-[19px] text-ink">{about.willNotDo.heading}</span>
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
