import { describe, expect, it } from 'vitest';
import { getContent } from './index';
import { brand } from './shared';

/**
 * Structural parity between the `en` and `hi` bundles: on top of the
 * type-level check (`Content` in locale.ts), this walks both bundles at
 * runtime and confirms neither is missing a field, an array item, or a
 * translated string the other one has.
 *
 * `hi` is currently `en` itself (see hi/index.ts), so this passes trivially
 * until Task 5 writes the real Hindi bundle — at which point it starts
 * checking something.
 */

type Walkable = string | number | boolean | null | undefined | AnyFunction | readonly Walkable[] | WalkableObject;
type AnyFunction = (...args: unknown[]) => unknown;
type WalkableObject = { [key: string]: Walkable };

function isPlainObject(value: unknown): value is WalkableObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** A plausible argument for the Nth parameter of a sample function call. */
function sampleArg(index: number): unknown {
  return index === 0 ? 'X' : ['X'];
}

function walk(a: unknown, b: unknown, path: string): void {
  const typeA = typeof a;
  expect(typeof b, `${path}: one bundle has ${typeA}, the other ${typeof b}`).toBe(typeA);

  if (typeA === 'function') {
    const fnA = a as AnyFunction;
    const fnB = b as AnyFunction;
    const args = Array.from({ length: Math.max(fnA.length, fnB.length, 1) }, (_, i) => sampleArg(i));
    expect(typeof fnA(...args), `${path}: en does not return a string`).toBe('string');
    expect(typeof fnB(...args), `${path}: hi does not return a string`).toBe('string');
    return;
  }

  if (typeA === 'string') {
    expect((a as string).length, `${path}: en has an empty string`).toBeGreaterThan(0);
    expect((b as string).length, `${path}: hi has an empty string`).toBeGreaterThan(0);
    return;
  }

  if (Array.isArray(a)) {
    const arrB = b as unknown[];
    expect(arrB.length, `${path}: array lengths differ`).toBe(a.length);
    a.forEach((item, i) => walk(item, arrB[i], `${path}[${i}]`));
    return;
  }

  if (isPlainObject(a)) {
    const objB = b as WalkableObject;
    const keysA = Object.keys(a).sort();
    const keysB = Object.keys(objB).sort();
    expect(keysB, `${path}: key sets differ`).toEqual(keysA);
    for (const key of keysA) walk(a[key], objB[key], `${path}.${key}`);
    return;
  }

  // Numbers, booleans, null, undefined: the typeof check above is enough.
}

describe('content parity between en and hi', () => {
  const en = getContent('en');
  const hi = getContent('hi');

  it('has the same shape, with no empty translated strings', () => {
    walk(en, hi, 'content');
  });

  it('site.brand is the shared fact, not a per-language literal', () => {
    expect(en.site.brand).toBe(brand);
    expect(hi.site.brand).toBe(brand);
  });
});
