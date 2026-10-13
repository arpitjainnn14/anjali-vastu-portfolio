import type { Content, Locale } from '@/content';
import { whatsappHref } from '@/lib/whatsapp';
import { localePath } from '@/lib/locale-routing';
import { Kundli } from '@/components/art/Kundli';
import { WhatsAppIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { ButtonLink } from '@/components/ui/Button';

/**
 * The hero.
 *
 * Load sequence, all CSS so it plays before hydration: the label fades in,
 * the headline rises word by word out of each line's mask, a brush stroke draws under the
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
 *
 * On scroll (Motion.tsx) the kundli turns as the page leaves it
 * (`data-turn`) and the text column drifts up and fades (`data-drift-out`).
 */

function delay(seconds: number) {
  return { '--d': `${seconds}s` } as React.CSSProperties;
}

/** The headline's words rise in turn: one this many seconds after the last. */
const WORD_STEP = 0.07;

/** The words of `text`, without the spaces. */
const wordsIn = (text: string) => text.split(/\s+/).filter(Boolean);

/**
 * Splits `text` into `.word` spans, the first rising at `start` seconds and
 * each after it one step later, keeping the spaces as real text so the
 * heading still reads as a sentence.
 */
function Words({ text, start }: { text: string; start: number }) {
  let word = 0;
  return text.split(/(\s+)/).map((part, i) =>
    !part || /^\s+$/.test(part) ? (
      part
    ) : (
      <span key={i} className="word" style={delay(start + WORD_STEP * word++)}>
        {part}
      </span>
    ),
  );
}

export function Hero({ c, locale }: { c: Content; locale: Locale }) {
  const { hero } = c;
  /* When each run of the headline starts: line 1, line 2, the accent, the rest. */
  const line1 = 0.1;
  const line2 = line1 + WORD_STEP * wordsIn(hero.headingLine1).length;
  const accent = line2 + WORD_STEP * wordsIn(hero.headingLine2Before).length;
  const after = accent + WORD_STEP;

  return (
    <section id="top" data-hides-sticky className="relative overflow-hidden pb-12 pt-20 md:pb-24 md:pt-28">
      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] gap-10 px-6 md:px-20 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:gap-16">
        <div className="flex flex-col gap-6 md:gap-8" data-drift-out>
          <p className="t-small enter order-1 m-0 text-muted lg:order-none">{hero.standfirst}</p>

          <h1 className="t-display order-2 m-0 text-ink lg:order-none">
            <span className="line-mask">
              <span>
                <Words text={hero.headingLine1} start={line1} />
              </span>
            </span>
            {/* The lines are blocks; without this, extracted text reads "youa". */}
            {' '}
            <span className="line-mask">
              <span>
                <Words text={hero.headingLine2Before} start={line2} />
                <span className="word" style={delay(accent)}>
                  <em className="accent" data-space-after={/^\s/.test(hero.headingAfter) || undefined}>
                    {hero.headingAccent}
                  </em>
                </span>
                <Words text={hero.headingAfter} start={after} />
              </span>
            </span>
          </h1>

          {/* Phone-only chart, under the headline, flush with the text column. */}
          <div className="order-3 w-full max-w-[300px] py-2 sm:max-w-[360px] lg:hidden" aria-hidden="true" data-turn>
            <Kundli size={300} className="w-full" />
          </div>

          <p className="t-lead enter order-5 m-0 max-w-[40ch] text-body lg:order-none" style={delay(0.45)}>
            {hero.lead}
          </p>

          <div className="enter order-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4 lg:order-none" style={delay(0.6)}>
            <ButtonLink href={whatsappHref(c)}>
              <WhatsAppIcon size={19} />
              {hero.primaryCta.label}
            </ButtonLink>
            <ButtonLink href={localePath(locale, hero.secondaryCta.href)} variant="secondary">
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
            {/* Her words, in the language she wrote them in; marked when that isn't the page's. */}
            <blockquote
              lang={hero.proof.lang === locale ? undefined : hero.proof.lang}
              className="m-0 -indent-[0.42em] font-display text-[17px] italic leading-[1.55] text-ink md:text-[18px]"
            >
              “{hero.proof.quote}”
            </blockquote>
            <figcaption className="mt-1.5 t-caption text-muted">
              {hero.proof.name}, {hero.proof.role}
            </figcaption>
          </figure>
        </div>

        <div className="relative mx-auto hidden w-full lg:block" data-parallax="-40">
          <div data-turn>
            <Kundli size={460} className="w-full" />
          </div>
        </div>
      </div>

      {/* Her credentials, as a line of text rather than a row of stat boxes. */}
      <div className="relative z-10 mx-auto mt-10 w-full max-w-[1440px] px-6 md:mt-16 md:px-20">
        <p className="t-small enter m-0 max-w-[62ch] text-muted" style={delay(0.9)}>
          {hero.credentials}
        </p>
      </div>
    </section>
  );
}
