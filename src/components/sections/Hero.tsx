import { hero } from '@/content';
import { whatsappHref } from '@/lib/whatsapp';
import { Kundli } from '@/components/art/Kundli';
import { WhatsAppIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { ButtonLink } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Section';

/**
 * The hero.
 *
 * Load sequence, all CSS so it plays before hydration: the label fades in,
 * each headline line rises from its own mask, a brush stroke draws under the
 * accent word, the copy and buttons follow, and the kundli draws itself
 * alongside. Under reduced motion everything is simply there.
 *
 * `--d` sets each element's delay; see `.enter` and `.line-mask` in globals.
 *
 * Phones get their own order. Stacked in source order the kundli — the page's
 * signature image — landed ~1,150px down, below the first screen, so a phone
 * opened on text and buttons alone. Below `lg` the column reorders to label,
 * headline, chart, buttons, then the lead and the quote, and a compact copy of
 * the chart sits in that slot (the large one is the right-hand column on
 * desktop). The kundli has no element ids, so rendering it twice is safe.
 */

function delay(seconds: number) {
  return { '--d': `${seconds}s` } as React.CSSProperties;
}

export function Hero() {
  return (
    <section id="top" data-hides-sticky className="relative overflow-hidden pb-12 pt-24 md:pb-24 md:pt-40">
      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] gap-10 px-5 md:px-20 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:gap-16">
        <div className="flex flex-col gap-6 md:gap-8">
          <Eyebrow className="enter order-1 lg:order-none">{hero.eyebrow}</Eyebrow>

          <h1 className="t-display order-2 m-0 text-ink lg:order-none">
            <span className="line-mask">
              <span style={delay(0.1)}>{hero.headingLine1}</span>
            </span>
            <span className="line-mask">
              <span style={delay(0.22)}>
                {hero.headingLine2Before}
                <span className="relative inline-block">
                  <em className="accent">{hero.headingAccent}</em>
                  {/* Brush stroke under the accent word. */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 200 14"
                    preserveAspectRatio="none"
                    className="absolute -bottom-[0.06em] left-0 h-[0.16em] w-full"
                  >
                    <path
                      d="M3 9 C 50 4, 110 3, 197 7"
                      fill="none"
                      stroke="var(--color-haldi)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      pathLength={1}
                      className="brush"
                    />
                  </svg>
                </span>
                {hero.headingAfter}
              </span>
            </span>
          </h1>

          {/* Phone-only chart, straight under the headline. */}
          <div className="order-3 mx-auto w-full max-w-[272px] py-1 lg:hidden" aria-hidden="true">
            <Kundli size={272} className="w-full" />
          </div>

          <p className="t-lead enter order-5 m-0 max-w-[40ch] text-body lg:order-none" style={delay(0.45)}>
            {hero.lead}
          </p>

          <div className="enter order-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 lg:order-none" style={delay(0.6)}>
            <ButtonLink href={whatsappHref()}>
              <WhatsAppIcon size={19} />
              {hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} variant="secondary">
              {hero.secondaryCta.label}
              <ArrowRightIcon size={16} className="nudge" />
            </ButtonLink>
          </div>

          {/* A real client's words, next to the button they are deciding on. */}
          <figure className="enter order-6 m-0 flex max-w-[46ch] gap-4 border-l-2 border-haldi pl-4 lg:order-none" style={delay(0.75)}>
            <div className="flex flex-col gap-1.5">
              <blockquote className="m-0 font-display text-[17px] italic leading-[1.5] text-ink md:text-[18px]">
                “{hero.proof.quote}”
              </blockquote>
              <figcaption className="t-caption text-muted">{hero.proof.name}, {hero.proof.role}</figcaption>
            </div>
          </figure>
        </div>

        <div className="relative mx-auto hidden w-full lg:block" data-parallax="-40">
          <Kundli size={460} className="w-full" />
        </div>
      </div>

      {/* Trust figures: set like an almanac's margin notes, not as pills. */}
      <div className="relative z-10 mx-auto mt-10 w-full max-w-[1440px] px-5 md:mt-24 md:px-20">
        {/* Three across at every width, like the desktop row: a stacked list
            on phones read as three unrelated lines. */}
        <dl
          className="enter m-0 grid grid-cols-3 border-y border-line"
          style={delay(0.9)}
        >
          {hero.trust.map((item, i) => (
            <div
              key={item.label}
              className={`flex min-w-0 flex-col justify-start gap-1.5 py-4 sm:py-5 md:flex-row md:items-baseline md:gap-4 md:py-7 ${
                i > 0 ? 'border-l border-line pl-3 sm:pl-4 md:pl-8' : 'pr-2'
              }`}
            >
              <dt className="order-2 text-[12px] leading-[1.35] text-muted sm:text-[13.5px] md:text-[15.5px]">{item.label}</dt>
              <dd className="order-1 m-0 shrink-0 font-display text-[21px] leading-none text-ink sm:text-[26px] md:text-[40px]">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
