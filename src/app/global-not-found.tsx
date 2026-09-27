import NotFound from 'next/dist/client/components/builtin/not-found';
import EnglishRootLayout from './(en)/layout';

/*
 * The 404 for any URL that matches no page. With two root layouts there is no
 * single layout for Next to put its 404 in, so without this file the page came
 * out bare: no styles, no nav, no footer. This puts Next's own 404 message
 * back inside the English site's layout, as it was before the Hindi site.
 */
export { metadata, viewport } from './(en)/layout';

export default function GlobalNotFound() {
  return (
    <EnglishRootLayout>
      <NotFound />
    </EnglishRootLayout>
  );
}
