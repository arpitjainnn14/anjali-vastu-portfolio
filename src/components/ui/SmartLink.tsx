import Link from 'next/link';
import { isExternalHref, newTabProps } from '@/lib/links';

type Props = { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

/**
 * The link primitive. A route gets next/link (prefetching, client
 * navigation); WhatsApp, tel: and mailto: get a real <a>, and web links open
 * in a new tab. Every other link component is styling on top of this.
 */
export function SmartLink({ href, children, ...rest }: Props) {
  if (isExternalHref(href)) {
    return (
      <a href={href} {...newTabProps(href)} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
