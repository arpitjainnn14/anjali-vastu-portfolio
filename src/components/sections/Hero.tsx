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
 */

function delay(seconds: number) {
  return { '--d': `${seconds}s` } as React.CSSProperties;
}

export function Hero() {
  return (
    <section id="top" data-hides-sticky className="relative overflow-hidden pb-12 pt-24 md:pb-24 md:pt-40">
      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] gap-10 px-5 md:px-20 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:gap-16">
        <div className="flex flex-col gap-6 md:gap-8">
          <Eyebrow className="enter">{hero.eyebrow}</Eyebrow>

          <h1 className="t-display m-0 text-ink">
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

          <p className="t-lead enter m-0 max-w-[40ch] text-body" style={delay(0.45)}>
            {hero.lead}
          </p>

          <div className="enter flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4" style={delay(0.6)}>
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
          <figure className="enter m-0 flex max-w-[46ch] gap-4 border-l-2 border-haldi pl-4" style={delay(0.75)}>
            <div className="flex flex-col gap-1.5">
              <blockquote className="m-0 font-display text-[17px] italic leading-[1.5] text-ink md:text-[18px]">
                “{hero.proof.quote}”
              </blockquote>
              <figcaption className="t-caption text-muted">{hero.proof.name}, {hero.proof.role}</figcaption>
            </div>
          </figure>
        </div>

        <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[360px] lg:max-w-none" data-parallax="-40">
          <Kundli size={460} className="w-full" />
        </div>
      </div>

      {/* Trust figures: set like an almanac's margin notes, not as pills. */}
      <div className="relative z-10 mx-auto mt-10 w-full max-w-[1440px] px-5 md:mt-24 md:px-20">
        <dl
          className="enter m-0 grid border-y border-line sm:grid-cols-3"
          style={delay(0.9)}
        >
          {hero.trust.map((item, i) => (
            <div
              key={item.label}
              className={`flex items-baseline justify-between gap-4 py-4 sm:flex-col sm:justify-start sm:gap-1 sm:py-5 md:flex-row md:items-baseline md:gap-4 md:py-7 ${
                i > 0 ? 'border-t border-line sm:border-l sm:border-t-0 sm:pl-4 md:pl-8' : ''
              }`}
            >
              <dt className="order-2 t-caption text-right text-muted sm:text-left md:t-small">{item.label}</dt>
              <dd className="order-1 m-0 shrink-0 font-display text-[24px] leading-none text-ink sm:text-[26px] md:text-[40px]">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
