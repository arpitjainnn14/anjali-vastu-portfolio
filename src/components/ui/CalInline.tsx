import Script from 'next/script';
import { calEmbedSnippet } from '@/lib/cal-embed';

type Props = { namespace: string; calLink: string; scriptUrl: string; origin: string };

/**
 * A Cal ID calendar inside the page. The container holds its height while the
 * calendar loads, so the page does not jump.
 */
export function CalInline({ namespace, calLink, scriptUrl, origin }: Props) {
  const elementId = `cal-inline-${namespace}`;
  return (
    <>
      <div
        id={elementId}
        className="min-h-[640px] w-full overflow-hidden rounded-card border border-line-strong bg-card"
      />
      <Script
        id={`cal-embed-${namespace}`}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: calEmbedSnippet({ scriptUrl, origin, namespace, calLink, elementId }),
        }}
      />
    </>
  );
}
