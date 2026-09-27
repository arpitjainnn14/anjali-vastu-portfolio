/** The site's languages, and the type every language bundle must satisfy. */

import type { en } from './en';

export type Locale = 'en' | 'hi';

export const locales: readonly Locale[] = ['en', 'hi'];

export const defaultLocale: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Widens a content bundle's type so a translation can swap any string for a
 * different one, while TypeScript still rejects a bundle that is missing a
 * field, has an extra one, or changes a function's signature or an array's
 * shape.
 *
 * - A string (including a string-literal union, such as `'sun' | 'grid'`)
 *   widens to `string`.
 * - A function keeps its parameter types and widens its return type.
 * - An array or a readonly tuple becomes a readonly array of the widened
 *   element type — a Hindi bundle need not repeat a fixed tuple length.
 * - An object maps every property through `Widen` recursively.
 * - Anything else (numbers, booleans, `null`) is left alone.
 */
export type Widen<T> = T extends string
  ? string
  : T extends (...args: infer Args) => infer Return
    ? (...args: Args) => Widen<Return>
    : T extends readonly (infer Item)[]
      ? readonly Widen<Item>[]
      : T extends object
        ? { [Key in keyof T]: Widen<T[Key]> }
        : T;

/** The shape every language bundle (`en`, `hi`) must have. */
export type Content = Widen<typeof en>;
