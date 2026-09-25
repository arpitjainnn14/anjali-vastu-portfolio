/**
 * Section shell and the small typographic parts that repeat down the page.
 *
 * 128px section padding desktop / 80 mobile, 80px gutter desktop / 20 mobile,
 * 1280 content width inside a 1440 frame.
 */

type Tone = 'paper' | 'deep' | 'night';

const TONES: Record<Tone, string> = {
  paper: '',
  deep: 'bg-paper-deep',
  night: 'on-night bg-night text-cream-muted',
};

export function Section({
  id,
  className = '',
  tone = 'paper',
  children,
  ...rest
}: {
  id?: string;
  className?: string;
  tone?: Tone;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden py-16 md:py-32 ${TONES[tone]} ${className}`}
      {...rest}
    >
      {children}
    </section>
  );
}

export function Container({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative z-10 mx-auto w-full max-w-[1440px] px-5 md:px-20 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Renders a heading string, setting any word wrapped in *asterisks* as the
 * italic accent. Keeps the emphasis in content.ts without putting markup there.
 */
export function Accented({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('*') && part.endsWith('*') ? (
          <em key={i} className="accent">
            {part.slice(1, -1)}
          </em>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * Section header: an h2, and a lead paragraph set beside it on wide screens.
 *
 * No label above the heading. A tracked-out caps label over every section is
 * the most obvious template signature there is, and here each one only said
 * again, in smaller letters, what the heading below it already said.
 */
export function SectionHeader({
  heading,
  lead,
  className = '',
}: {
  heading: string;
  lead?: string | null;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-20 ${className}`}
      data-reveal
    >
      <h2 className="t-h2 m-0 max-w-[16ch] text-balance text-ink in-[.on-night]:text-cream">
        <Accented text={heading} />
      </h2>
      {lead && <p className="t-body m-0 max-w-[46ch] lg:pb-2">{lead}</p>}
    </div>
  );
}
