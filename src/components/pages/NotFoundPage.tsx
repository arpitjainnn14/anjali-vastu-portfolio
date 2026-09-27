import type { Content } from '@/content';
import { Section, Container } from '@/components/ui/Section';

/**
 * An address with no page behind it. The same words Next's own 404 used, set
 * in the site's type instead of Next's black-on-white card. The `<title>` is
 * hoisted into the head by React, as Next's was.
 */
export function NotFoundPage({ c }: { c: Content }) {
  const { notFound } = c;
  return (
    <Section className="pt-28 md:pt-40">
      <title>{notFound.title}</title>
      <Container>
        <div className="flex flex-col gap-3">
          <h1 className="t-h1 m-0 text-ink">{notFound.code}</h1>
          <p className="t-lead m-0">{notFound.message}</p>
        </div>
      </Container>
    </Section>
  );
}
