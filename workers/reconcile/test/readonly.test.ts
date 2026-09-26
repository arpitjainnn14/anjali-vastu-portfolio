import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * The live Razorpay key can refund. The checker must only ever read. Any
 * write method in the files that talk to Razorpay or Cal ID fails this test.
 */
const READ_ONLY_FILES = ['src/http.ts', 'src/razorpay.ts', 'src/calid.ts', 'src/reconcile.ts', 'src/index.ts'];

describe('read-only toward Razorpay and Cal ID', () => {
  for (const file of READ_ONLY_FILES) {
    it(`${file} uses no write method`, () => {
      let source: string;
      try {
        source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
      } catch {
        return; // file not written yet in this task
      }
      expect(source).not.toMatch(/['"](POST|PUT|PATCH|DELETE)['"]/);
    });
  }
});
