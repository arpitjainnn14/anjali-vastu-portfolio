'use client';

import { useEffect, useRef } from 'react';
import { calEmbedSnippet } from '@/lib/cal-embed';

type Props = { namespace: string; calLink: string; scriptUrl: string; origin: string };

/**
 * Counts mounts across the page's lifetime, so every mount of `CalInline` gets
 * its own Cal namespace even when the same page component remounts (a
 * client-side navigation back to /book after next/link, then browser Back).
 * Read only inside the effect below, never during render: the container's
 * markup carries no counter-derived id, so a statically generated page (whose
 * build-time counter value has nothing to do with a visitor's fresh page
 * load) never disagrees with the browser about what the container is called.
 */
let mountCount = 0;

/**
 * A Cal ID calendar inside the page. The container holds its height while the
 * calendar loads, so the page does not jump.
 *
 * Runs the embed itself, from an effect, on every mount, rather than through
 * `next/script`: next/script's `LoadCache` runs an inline script with a given
 * `id` only once per page load (node_modules/next/dist/client/script.js), so
 * a client-side navigation back to a /book page would leave an empty box.
 * Each mount gets a fresh Cal namespace and element id, assigned to the
 * container in the browser rather than rendered into the markup, so it never
 * inherits another mount's queue state in `window.Cal` and (under Strict
 * Mode's double-invoked effects) the first, discarded run's queued calls
 * target an id nothing points at any more. `calEmbedSnippet`'s loader already
 * reuses `window.Cal` and embed.js once they exist, so this does not re-fetch
 * them.
 */
export function CalInline({ namespace, calLink, scriptUrl, origin }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const n = ++mountCount;
    const ns = `${namespace}-${n}`;
    const elementId = `cal-inline-${ns}`;
    el.id = elementId;
    el.replaceChildren();

    const script = document.createElement('script');
    script.textContent = calEmbedSnippet({ scriptUrl, origin, namespace: ns, calLink, elementId });
    document.body.appendChild(script);

    return () => {
      script.remove();
      el.replaceChildren();
    };
  }, [namespace, calLink, scriptUrl, origin]);

  return (
    <div
      ref={containerRef}
      data-cal-namespace={namespace}
      className="min-h-[640px] w-full overflow-hidden rounded-card border border-line-strong bg-card"
    />
  );
}
