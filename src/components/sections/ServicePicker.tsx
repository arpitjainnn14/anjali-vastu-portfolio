'use client';

import { useState } from 'react';
import Link from 'next/link';
import { picker, services, type ServiceSlug } from '@/content';
import { whatsappHref } from '@/lib/whatsapp';
import { serviceIcons, WhatsAppIcon, ArrowRightIcon } from '@/components/ui/Icons';
import { ButtonLink } from '@/components/ui/Button';

/**
 * "Which reading do I need?" — three questions, then one recommendation with
 * the WhatsApp message already written.
 *
 * It answers the question the services lead already poses out loud, and it is
 * the one thing on the page a visitor can *use*. Everything happens in this
 * component: nothing is sent anywhere, nothing is stored, no analytics.
 *
 * Accessibility: each step is a labelled radiogroup of real buttons, so Tab
 * and Enter work with no key handling of our own. The step count and the
 * result are announced through a live region, because choosing an answer
 * replaces what is on screen.
 */

type Answer = { questionId: string; optionIndex: number };

/**
 * The step marker. Local to the picker: the shared Diamond was retired with
 * the caps-label eyebrows it used to sit beside, and this is the one place on
 * the site where a row of marks means something — how many questions are left.
 */
function StepDiamond({ className = '' }: { className?: string }) {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d="M5 0 10 5 5 10 0 5Z" fill="currentColor" />
    </svg>
  );
}

function scoreOf(answers: Answer[]): ServiceSlug {
  const totals: Record<ServiceSlug, number> = {
    'vedic-astrology': 0,
    numerology: 0,
    vastu: 0,
  };

  answers.forEach(({ questionId, optionIndex }) => {
    const question = picker.questions.find((q) => q.id === questionId);
    const option = question?.options[optionIndex];
    if (!option) return;
    for (const [slug, points] of Object.entries(option.weights)) {
      totals[slug as ServiceSlug] += points ?? 0;
    }
  });

  /* Ties fall to whichever comes first in `services`, so the result is stable. */
  return services.reduce<ServiceSlug>((best, service) => {
    const slug = service.slug as ServiceSlug;
    return totals[slug] > totals[best] ? slug : best;
  }, services[0].slug as ServiceSlug);
}

export function ServicePicker({ showIntro = true }: { showIntro?: boolean }) {
  const [answers, setAnswers] = useState<Answer[]>([]);

  const total = picker.questions.length;
  const step = answers.length;
  const done = step === total;
  const question = done ? null : picker.questions[step];

  const choose = (optionIndex: number) => {
    if (!question) return;
    setAnswers((prior) => [...prior, { questionId: question.id, optionIndex }]);
  };

  const back = () => setAnswers((prior) => prior.slice(0, -1));
  const restart = () => setAnswers([]);

  const result = done ? scoreOf(answers) : null;
  const service = result ? services.find((s) => s.slug === result)! : null;
  const Icon = service ? serviceIcons[service.icon] : null;

  const echoes = answers.map(
    ({ questionId, optionIndex }) =>
      picker.questions.find((q) => q.id === questionId)!.options[optionIndex].echo,
  );

  return (
    <div
      className="border border-line-strong bg-card px-6 py-8 md:px-10 md:py-10"
      data-reveal
    >
      <div className="relative flex flex-col gap-6 md:gap-8">
        {/*
          Off on its own page, where the h1 and lead say this already. On the
          home page, where the card stands alone, it introduces itself.
        */}
        {showIntro && (
          <div className="flex flex-col gap-3">
            <p className="t-caption m-0 text-muted">{picker.eyebrow}</p>
            <h3 className="t-h3 m-0 text-ink">{picker.heading}</h3>
            <p className="t-small m-0 max-w-[52ch] text-muted">{picker.lead}</p>
          </div>
        )}

        {/* Progress: one diamond per question, filled as it is answered. */}
        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="flex items-center gap-2">
            {picker.questions.map((q, i) => (
              <StepDiamond
                key={q.id}
                className={`transition-colors duration-300 ${
                  i < step ? 'text-sindoor' : 'text-line-strong'
                }`}
              />
            ))}
          </span>
          <span className="t-caption text-muted" aria-live="polite">
            {done ? picker.resultLabel : picker.labels.step(step + 1, total)}
          </span>
        </div>

        {question && (
          /*
           * `key` remounts the group each step, so the CSS entrance replays and
           * the browser does not carry focus rings across to a different answer.
           */
          <div key={question.id} className="enter flex flex-col gap-4">
            <p id={`picker-${question.id}`} className="t-lead m-0 text-ink">
              {question.prompt}
            </p>

            {/*
              A group of buttons, not a radiogroup: choosing an answer moves
              straight to the next question, so nothing is ever left "checked".
              Announcing them as radios would promise a selection that does not
              exist.
            */}
            <div role="group" aria-labelledby={`picker-${question.id}`} className="flex flex-col gap-2.5">
              {question.options.map((option, i) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => choose(i)}
                  className="group flex min-h-[52px] w-full cursor-pointer items-center justify-between gap-4 border border-line bg-paper px-5 py-3 text-left transition-colors duration-200 hover:border-sindoor hover:bg-sindoor-soft"
                >
                  <span className="t-body text-ink">{option.label}</span>
                  <ArrowRightIcon
                    size={16}
                    className="nudge shrink-0 text-line-strong transition-colors duration-200 group-hover:text-sindoor"
                  />
                </button>
              ))}
            </div>

            {step > 0 && (
              <button
                type="button"
                onClick={back}
                className="t-small inline-flex min-h-11 cursor-pointer items-center self-start bg-transparent p-0 font-semibold text-muted underline-offset-4 transition-colors duration-200 hover:text-ink hover:underline"
              >
                {picker.labels.back}
              </button>
            )}
          </div>
        )}

        {service && Icon && (
          <div className="enter flex flex-col gap-5" role="status">
            <div className="flex flex-col gap-3 border-t border-line pt-6">
              <h4 className="t-h3 m-0 flex items-center gap-3 text-ink">
                <Icon size={28} strokeWidth={1.4} className="shrink-0 text-haldi" />
                {service.name}
              </h4>
              <p className="t-body m-0 max-w-[52ch]">{picker.because[result!]}</p>
              <p className="t-small m-0 max-w-[52ch] text-muted">{picker.resultNote}</p>
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <ButtonLink href={whatsappHref(picker.message(service.name, echoes))}>
                <WhatsAppIcon size={19} />
                {picker.labels.cta}
              </ButtonLink>

              <Link
                href={`/services/${service.slug}`}
                className="group inline-flex min-h-11 items-center gap-2 text-[15.5px] font-semibold text-sindoor no-underline"
              >
                {picker.labels.readMore}
                <ArrowRightIcon size={15} className="nudge" />
              </Link>
            </div>

            <button
              type="button"
              onClick={restart}
              className="t-small inline-flex min-h-11 cursor-pointer items-center self-start bg-transparent p-0 font-semibold text-muted underline-offset-4 transition-colors duration-200 hover:text-ink hover:underline"
            >
              {picker.labels.restart}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
