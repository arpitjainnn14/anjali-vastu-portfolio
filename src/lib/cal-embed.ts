/**
 * The inline script that shows a Cal ID calendar inside a page.
 *
 * LOADER is Cal.com's published embed loader, which Cal ID (a Cal.com fork)
 * uses too; checked against Cal ID's Embed dialog (booking plan, Task 1). It
 * queues calls until embed.js arrives. Every value is JSON-encoded with `<`
 * escaped, so nothing in it can end the script tag.
 */

const LOADER =
  '(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; ' +
  'C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { ' +
  'cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; ' +
  'cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; ' +
  'const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { ' +
  'cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); ' +
  'p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })';

type EmbedOptions = {
  scriptUrl: string;
  origin: string;
  namespace: string;
  calLink: string;
  elementId: string;
};

function js(value: string): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

export function calEmbedSnippet(o: EmbedOptions): string {
  const ns = js(o.namespace);
  return [
    `${LOADER}(window, ${js(o.scriptUrl)}, "init");`,
    `Cal("init", ${ns}, { origin: ${js(o.origin)} });`,
    `Cal.ns[${ns}]("inline", { elementOrSelector: ${js(`#${o.elementId}`)}, calLink: ${js(o.calLink)}, config: { layout: "month_view" } });`,
    `Cal.ns[${ns}]("ui", { layout: "month_view" });`,
  ].join('\n');
}
