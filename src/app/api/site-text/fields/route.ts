import { codeContent, editablePages } from '@/content';

/*
 * The words Sitedesk lets Anjali change, grouped by page, with this build's own copy as the starting text
 * (src/content/editable.ts). Sitedesk reads it to show its "Website content" section. Built once, like every page:
 * it changes only when the code does. Everything in it is already on the public pages.
 */
export const dynamic = 'force-static';

export function GET() {
  return Response.json(
    { version: 1, pages: editablePages(codeContent.en, codeContent.hi) },
    { headers: { 'x-robots-tag': 'noindex' } },
  );
}
