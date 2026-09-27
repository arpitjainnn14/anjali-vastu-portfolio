/**
 * The Hindi content bundle.
 *
 * Temporary: re-exports the English bundle until the translation is written.
 * Task 5 of the Hindi-site plan replaces this with the real Hindi strings;
 * `Content` (in ../locale.ts) is what keeps that replacement honest — it must
 * have every field `en` has, no more, no fewer, with matching function
 * signatures and array shapes.
 */

import { en } from '../en';
import type { Content } from '../locale';

export const hi: Content = en;
