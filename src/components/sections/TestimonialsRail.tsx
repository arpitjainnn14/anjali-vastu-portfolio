'use client';

import { useEffect, useRef, useState } from 'react';
import type { Testimonial } from '@/content';
import { testimonialsSection } from '@/content';
import { present } from '@/lib/todo';
import { ArrowRightIcon } from '@/components/ui/Icons';

/**
 * Testimonials: short cards on a rail that drifts on its own, each with a
 * "Read more" that opens the full testimonial in a dialog.
 *
 * Why a drifting rail rather than the scroll-driven one in DESIGN.md: a
 * scroll-linked rail needs more cards than fit on screen, and with three there
 * is nothing left to scroll through.
 *
 * The motion is a CSS animation on one HTML element's transform, so it runs on
 * the compositor and costs no layout. It stops for hover, keyboard focus, an
 * open dialog, the pause button (WCAG 2.2.2: anything that moves on its own
 * for more than five seconds must be stoppable), and prefers-reduced-motion,
 * where it becomes an ordinary swipeable row. See `.marquee` in globals.css.
 */

/** Fewer than this and a loop reads as a glitch, so the row stays still. */
const MOVE_FROM = 3;

/**
 * One pass of the loop must be wider than the widest screen, or a gap opens
 * at the right edge before the loop wraps. Six cards clears 2,400px.
 */
const MIN_CARDS_PER_PASS = 6;

/** Seconds per card: slow enough to read a headline as it passes. */
const SECONDS_PER_CARD = 10;

function paragraphsOf(t: Testimonial) {
  return t.quote.split('\n\n').filter(Boolean);
}

function attributionOf(t: Testimonial) {
  /* Only shown once someone has actually told us where they are. */
  const city = present(t.city);
  return city ? `${city} · ${t.service}` : t.service;
}

/*
 * Fraunces has no Devanagari glyphs, so Hindi is set in Tiro Devanagari, a
 * serif cut to sit beside it, with more leading for the matras.
 */
function quoteType(t: Testimonial, size: 'card' | 'dialog') {
  if (t.lang === 'hi') {
    return size === 'card'
      ? 'font-deva text-[18px] leading-[1.75]'
      : 'font-deva text-[19px] leading-[1.8] md:text-[20px]';
  }
  return size === 'card'
    ? 'font-display text-[19px] leading-[1.5]'
    : 'font-display text-[19px] leading-[1.6] md:text-[21px]';
}

/** A large set quotation mark, in the display face rather than an SVG. */
function QuoteMark() {
  return (
    <span aria-hidden="true" className="-mb-6 block font-display text-[72px] leading-none text-haldi-light">
      “
    </span>
  );
}

/*
 * On the cards the quote mark is a faint watermark in the corner rather than
 * a line of its own. As its own row it pushed every excerpt down and left a
 * hollow block at the top of each card.
 */
function QuoteWatermark() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute right-6 top-3 -z-10 h-[64px] select-none overflow-visible font-display text-[128px] leading-[0.9] text-haldi-light/[.10]"
    >
      “
    </span>
  );
}

/**
 * First letter of the name, set in a disc beside it. Array.from keeps a
 * Devanagari first letter whole ("नितिन" gives "न").
 */
function Monogram({ name, hindi }: { name: string; hindi: boolean }) {
  const initial = Array.from(name.trim())[0] ?? '';
  return (
    <span
      aria-hidden="true"
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-haldi-light/25 bg-haldi-light/10 text-haldi-light ${
        hindi ? 'font-deva text-[19px]' : 'font-display text-[20px]'
      }`}
    >
      {initial}
    </span>
  );
}

function QuoteCard({
  testimonial,
  onOpen,
  duplicate = false,
}: {
  testimonial: Testimonial;
  onOpen: () => void;
  /**
   * A copy that only exists to make the loop seamless. Hidden from assistive
   * tech and skipped by Tab, but still clickable — a mouse user who clicks
   * "Read more" on whichever copy is passing should still get the dialog.
   * (`inert` would block the click, so it is deliberately not used.)
   */
  duplicate?: boolean;
}) {
  const hindi = testimonial.lang === 'hi';
  const excerpt = paragraphsOf(testimonial)[0];

  return (
    <figure
      data-quote-card
      lang={hindi ? 'hi' : undefined}
      aria-hidden={duplicate || undefined}
      className={
        'quote-card relative isolate m-0 flex w-[300px] shrink-0 flex-col gap-4 overflow-hidden ' +
        'rounded-[22px] border border-night-line p-7 sm:w-[420px] md:px-9 md:pb-8 md:pt-9 ' +
        (duplicate ? 'marquee-dup' : '')
      }
    >
      <QuoteWatermark />

      {testimonial.title && (
        <p
          className={`m-0 line-clamp-2 font-semibold text-haldi-light ${
            hindi ? 'font-deva text-[16px] leading-[1.6]' : 'text-[15px] leading-[1.45]'
          }`}
        >
          {testimonial.title}
        </p>
      )}

      <blockquote className={`m-0 line-clamp-4 text-cream ${quoteType(testimonial, 'card')}`}>
        {excerpt}
      </blockquote>

      <button
        type="button"
        onClick={onOpen}
        tabIndex={duplicate ? -1 : undefined}
        aria-haspopup="dialog"
        aria-label={`${testimonialsSection.readMore}: ${testimonial.name}`}
        lang="en"
        className="group mt-auto inline-flex min-h-11 cursor-pointer items-center gap-2 self-start bg-transparent p-0 text-[15px] font-semibold text-haldi-light transition-colors duration-200 hover:text-cream"
      >
        {testimonialsSection.readMore}
        <ArrowRightIcon size={15} className="nudge" />
      </button>

      {/* "Read more" takes the free space, so it lines up across cards whether or not a card has a headline. */}
      <figcaption className="flex items-center gap-3.5 border-t border-night-line/70 pt-5">
        <Monogram name={testimonial.name} hindi={hindi} />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[16px] font-semibold text-cream">{testimonial.name}</span>
          <span lang="en" className="truncate t-small text-cream-muted">
            {attributionOf(testimonial)}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

export function TestimonialsRail({
  quotes,
  header,
}: {
  quotes: Testimonial[];
  /**
   * The section heading. Rendered here so the pause button can sit in the
   * heading row's empty right side rather than on a row of its own.
   */
  header: React.ReactNode;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const moving = quotes.length >= MOVE_FROM;

  /* Open the native dialog whenever a card asks for it. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || openIndex === null || dialog.open) return;
    dialog.showModal();
  }, [openIndex]);

  /* The page behind a modal should not scroll. */
  useEffect(() => {
    if (openIndex === null) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previous;
    };
  }, [openIndex]);

  const active = openIndex === null ? null : quotes[openIndex];

  /*
   * Build one pass of the loop: the real cards first, then repeats until the
   * pass is wide enough. Only the first appearance of each quote is exposed
   * to assistive tech; every repeat is a visual copy.
   */
  const repeats = Math.max(1, Math.ceil(MIN_CARDS_PER_PASS / quotes.length));
  const pass = Array.from({ length: repeats }, (_, rep) =>
    quotes.map((testimonial, index) => ({ testimonial, index, duplicate: rep > 0 })),
  ).flat();

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1440px] items-end justify-between gap-6 px-5 md:px-20">
        <div className="min-w-0 flex-1">{header}</div>
        {moving && (
          <div className="marquee-toggle shrink-0 pb-1">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? testimonialsSection.play : testimonialsSection.pause}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-night-line bg-transparent text-haldi-light transition-colors duration-200 hover:border-haldi-light hover:text-cream"
            >
              {paused ? <PlayIcon /> : <PauseIcon />}
            </button>
          </div>
        )}
      </div>

      {moving ? (
        <div
          data-quote-rail
          className="marquee relative mt-10 md:mt-12"
          data-paused={paused || openIndex !== null ? 'true' : 'false'}
        >
          <div className="marquee-viewport overflow-hidden py-2">
            <div
              className="marquee-track flex w-max"
              style={{ '--marquee-duration': `${pass.length * SECONDS_PER_CARD}s` } as React.CSSProperties}
            >
              {/* Two identical halves; the track slides by exactly one. */}
              {[0, 1].map((half) => (
                <div key={half} className="flex shrink-0 gap-6 pr-6 md:gap-8 md:pr-8">
                  {pass.map(({ testimonial, index, duplicate }, i) => (
                    <QuoteCard
                      key={`${half}-${i}`}
                      testimonial={testimonial}
                      duplicate={half === 1 || duplicate}
                      onOpen={() => setOpenIndex(index)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Edge fades, desktop only. Plain gradients: no blend modes. */}
          <div
            aria-hidden="true"
            className="marquee-fade pointer-events-none absolute inset-y-0 left-0 hidden w-[140px] lg:block"
            style={{ background: 'linear-gradient(to right, #1D1812 0%, rgba(29,24,18,0) 100%)' }}
          />
          <div
            aria-hidden="true"
            className="marquee-fade pointer-events-none absolute inset-y-0 right-0 hidden w-[140px] lg:block"
            style={{ background: 'linear-gradient(to left, #1D1812 0%, rgba(29,24,18,0) 100%)' }}
          />

        </div>
      ) : (
        <div
          data-quote-rail
          className="mx-auto mt-10 flex w-full max-w-[1440px] flex-wrap gap-6 px-5 md:mt-12 md:gap-8 md:px-20"
        >
          {quotes.map((testimonial, index) => (
            <QuoteCard key={index} testimonial={testimonial} onOpen={() => setOpenIndex(index)} />
          ))}
        </div>
      )}

      {/*
        One dialog for every card. Native <dialog> with showModal() gives the
        focus trap, Esc to close, the top layer and focus returned to the
        opener, all without hand-rolled code. A click on the dialog element
        itself (not its content) is a click on the backdrop, and closes it.
      */}
      <dialog
        ref={dialogRef}
        onClose={() => setOpenIndex(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        aria-labelledby="quote-dialog-name"
        className="quote-dialog on-night m-auto w-[calc(100vw-2rem)] max-w-[680px] rounded-[22px] border border-night-line bg-night-card p-0 text-cream"
      >
        {active && (
          <div
            lang={active.lang === 'hi' ? 'hi' : undefined}
            className="relative flex max-h-[85vh] flex-col gap-5 overflow-y-auto p-7 md:p-10"
          >
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label={testimonialsSection.close}
              lang="en"
              className="absolute right-3 top-3 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-transparent text-cream-muted transition-colors duration-200 hover:text-cream md:right-4 md:top-4"
            >
              <svg
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <QuoteMark />

            {active.title && (
              <p
                className={`m-0 pr-10 font-semibold text-haldi-light ${
                  active.lang === 'hi' ? 'font-deva text-[17px] leading-[1.6]' : 'text-[17px] leading-[1.45]'
                }`}
              >
                {active.title}
              </p>
            )}

            <blockquote className={`m-0 flex flex-col gap-4 ${quoteType(active, 'dialog')}`}>
              {paragraphsOf(active).map((paragraph, i) => (
                <p key={i} className="m-0">
                  {paragraph}
                </p>
              ))}
            </blockquote>

            <div className="flex items-center gap-3.5 border-t border-night-line/70 pt-5">
              <Monogram name={active.name} hindi={active.lang === 'hi'} />
              <span className="flex flex-col gap-0.5">
                <span id="quote-dialog-name" className="text-[17px] font-semibold text-cream">
                  {active.name}
                </span>
                <span lang="en" className="t-small text-cream-muted">
                  {attributionOf(active)}
                </span>
              </span>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
