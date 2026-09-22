/**
 * Off-site, phone and mail links render as a plain <a>; everything else is a
 * route and goes through next/link. Shared by every link-rendering component
 * so they agree on which is which.
 */
export function isExternalHref(href: string): boolean {
  return /^(https?:|tel:|mailto:)/.test(href);
}

/** Web links open in a new tab, without handing the new page a window.opener. */
export function newTabProps(href: string) {
  return href.startsWith('http') ? ({ target: '_blank', rel: 'noopener noreferrer' } as const) : {};
}
