import { teaching, whatsappMessages } from '@/content';
import { whatsappHref } from '@/lib/whatsapp';
import { Section, Container, Eyebrow, Accented } from '@/components/ui/Section';
import { serviceIcons, WhatsAppIcon } from '@/components/ui/Icons';
import { ButtonLink } from '@/components/ui/Button';
import { KundliMark } from '@/components/art/Kundli';
import { present } from '@/lib/todo';

/**
 * Teaching. The course facts are set as a ledger card beside the pitch.
 *
 * Spec rows whose value is still unsupplied are dropped rather than blanked —
 * a labelled row with nothing beside it reads as an error, not as pending.
 * Same for the track cards: a card renders only once it has real copy.
 */
export function Teaching({ heading = 'h2' }: { heading?: 'h1' | 'h2' }) {
  const Heading = heading;

  const spec = teaching.spec.filter((row) => present(row.value) !== null);
  const nextBatch = present(teaching.nextBatch);
  const tracks = teaching.tracks
    .map((track) => ({ ...track, covers: present(track.covers), prerequisite: present(track.prerequisite) }))
    .filter((track) => track.covers !== null);

  return (
    <Section id="teaching" tone="deep">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-start lg:gap-24">
          <div className="flex flex-col gap-6" data-reveal-group>
            <Eyebrow data-reveal-item>{teaching.eyebrow}</Eyebrow>

            <Heading className="t-h2 m-0 max-w-[14ch] text-balance text-ink" data-reveal-item>
              <Accented text={teaching.heading} />
            </Heading>

            <p className="t-body m-0 max-w-[52ch]" data-reveal-item>
              {teaching.lead}
            </p>

            <div className="flex flex-col items-start gap-4 pt-2 sm:flex-row sm:items-center sm:gap-6" data-reveal-item>
              <ButtonLink href={whatsappHref(whatsappMessages.teaching)}>
                <WhatsAppIcon size={19} />
                {teaching.cta.label}
              </ButtonLink>

              {nextBatch && (
                <span className="t-small text-muted">
                  {teaching.nextBatchLabel}: <span className="font-semibold text-ink">{nextBatch}</span>
                </span>
              )}
            </div>

            {tracks.length > 0 && (
              <div className="mt-6 grid gap-4" data-reveal-item>
                {tracks.map((track) => {
                  const Icon = serviceIcons[track.icon];
                  return (
                    <div key={track.slug} className="flex gap-5 border-t border-line-strong pt-5">
                      <Icon size={26} className="shrink-0 text-haldi" />
                      <div className="flex flex-col gap-1.5">
                        <h3 className="t-h3 m-0 text-ink">{track.name}</h3>
                        <p className="t-small m-0">{track.covers}</p>
                        {track.prerequisite && <span className="t-caption text-muted">{track.prerequisite}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {spec.length > 0 && (
            <div className="relative border border-line-strong bg-card p-6 md:p-9" data-reveal>
              <KundliMark size={28} className="absolute right-6 top-6 text-haldi md:right-9 md:top-9" />
              <span className="t-label text-muted">{teaching.specHeading}</span>
              <dl className="m-0 mt-6 flex flex-col">
                {spec.map((row) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[110px_1fr] gap-4 border-t border-dashed border-line-strong py-4 md:grid-cols-[130px_1fr]"
                  >
                    <dt className="t-small text-muted">{row.label}</dt>
                    <dd className="m-0 t-small font-medium text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
