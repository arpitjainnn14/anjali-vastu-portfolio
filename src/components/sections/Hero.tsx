import { hero } from '@/content';
import { whatsappHref } from '@/lib/whatsapp';
import { Kundli } from '@/components/art/Kundli';
import { WhatsAppIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { ButtonLink } from '@/components/ui/Button';

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
          <p className="t-small enter order-1 m-0 text-muted lg:order-none">{hero.standfirst}</p>

          <h1 className="t-display order-2 m-0 text-ink lg:order-none">
            <span className="line-mask">
              <span style={delay(0.1)}>{hero.headingLine1}</span>
            </span>
            {/* The lines are blocks; without this, extracted text reads "youa". */}
            {' '}
            <span className="line-mask">
              <span style={delay(0.22)}>
                {hero.headingLine2Before}
                <em className="accent">{hero.headingAccent}</em>
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

          {/*
            A client's words beside the button they are deciding on. Set as
            running text with a hanging quote mark — no rule down the left,
            which is the stock "pull quote" component every site ships.
          */}
          <figure className="enter order-6 m-0 max-w-[48ch] lg:order-none" style={delay(0.75)}>
            <blockquote className="m-0 -indent-[0.42em] font-display text-[17px] italic leading-[1.55] text-ink md:text-[18px]">
              “{hero.proof.quote}”
            </blockquote>
            <figcaption className="mt-1.5 t-caption text-muted">
              {hero.proof.name}, {hero.proof.role}
            </figcaption>
          </figure>
        </div>

        <div className="relative mx-auto hidden w-full lg:block" data-parallax="-40">
          <Kundli size={460} className="w-full" />
        </div>
      </div>

      {/* Her credentials, as a line of text rather than a row of stat boxes. */}
      <div className="relative z-10 mx-auto mt-10 w-full max-w-[1440px] px-5 md:mt-16 md:px-20">
        <p className="t-small enter m-0 max-w-[62ch] text-muted" style={delay(0.9)}>
          {hero.credentials}
        </p>
      </div>
    </section>
  );
}
