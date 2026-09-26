'use client';

import { useEffect, useState } from 'react';
import { calEmbedSnippet } from '@/lib/cal-embed';

type Props = { namespace: string; calLink: string; scriptUrl: string; origin: string };

/**
 * Counts mounts across the page's lifetime, so every mount of `CalInline` gets
 * its own Cal namespace even when the same page component remounts (a
 * client-side navigation back to /book after next/link, then browser Back).
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
 * Each mount gets a fresh Cal namespace, so it never inherits another mount's
 * queue state in `window.Cal`; `calEmbedSnippet`'s loader already reuses
 * `window.Cal` and embed.js once they exist, so this does not re-fetch them.
 */
export function CalInline({ namespace, calLink, scriptUrl, origin }: Props) {
  /*
   * A lazy useState initialiser, not a useRef read in render: this project's
   * lint (eslint-plugin-react-hooks' React Compiler rules) flags reading
   * ref.current during render. useState's initialiser still runs once per
   * mount and stays stable across re-renders of that mount.
   */
  const [mountNumber] = useState(() => ++mountCount);

  const uniqueNamespace = `${namespace}-${mountNumber}`;
  const elementId = `cal-inline-${uniqueNamespace}`;

  useEffect(() => {
    const script = document.createElement('script');
    script.textContent = calEmbedSnippet({
      scriptUrl,
      origin,
      namespace: uniqueNamespace,
      calLink,
      elementId,
    });
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [uniqueNamespace, elementId, calLink, scriptUrl, origin]);

  return (
    <div
      id={elementId}
      className="min-h-[640px] w-full overflow-hidden rounded-card border border-line-strong bg-card"
    />
  );
}
