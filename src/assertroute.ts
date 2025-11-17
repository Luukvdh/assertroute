/**
 * Minimal, hard-assert library with type-narrowing plus an "assertRoute" scope to catch
 * assertion failures and return a default value. This is intentionally simpler than the
 * flexible assume.ts chain: assertions always throw AssertError on failure, so TS can
 * confidently narrow types after calls.
 */

// ===============
// Error type
// ===============

/**
 * Error thrown when an assertion fails.
 * - code: always "ASSERT_FAILED"
 * - info: optional extra context provided by the assertion site
 */
export class AssertError extends Error {
  readonly code = 'ASSERT_FAILED' as const;
  readonly info?: Record<string, unknown>;
  constructor(message: string, info?: Record<string, unknown>) {
    super(message);
    this.name = 'AssertError';
    this.info = info;
  }
}

// ===============
// Global AssertError handling
// ===============

/** Global handler invoked whenever an assertion fails (called right before throwing). */
let __assertGlobalOnError: ((err: AssertError) => void) | undefined;

/**
 * Set or clear a global onError handler for all assertion failures.
 * The handler is invoked right before an AssertError is thrown by `assert()` or any assert* helper.
 * Note: This does not suppress the throw; use assertRoute/confirm or installAssertErrorTrap to prevent breaks.
 */
export function setAssertErrorHandler(handler?: (err: AssertError) => void) {
  __assertGlobalOnError = handler;
}

// ===============
// Core assert
// ===============

/**
 * Hard assert. Throws AssertError when condition is falsy.
 */
/**
 * Hard assert: throws AssertError when the condition is falsy.
 *
 * Narrowing:
 * - Uses `asserts condition` so TypeScript narrows the checked condition on success.
 *
 * @param condition Any value treated as boolean; falsy will fail the assertion
 * @param message Error message (default: "Assertion failed")
 * @param info Optional diagnostic info attached to the thrown AssertError
 */
export function assert(condition: unknown, message = 'Assertion failed', info?: Record<string, unknown>): asserts condition {
  if (!condition) {
    const err = new AssertError(message, info);
    try {
      __assertGlobalOnError?.(err);
    } catch {
      // ignore errors in global handler
    }
    throw err;
  }
}

// ===============
// Type predicates / guards
// ===============

/**
 * Returns true if x is a string.
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to string.
 */
export function isString(x: unknown): x is string {
  return typeof x === 'string';
}

/**
 * Returns true if x is a finite number.
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to number.
 */
export function isNumber(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x);
}

/**
 * Returns true if x is a finite number.
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to number.
 */
export function isNumberNotZero(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x) && x !== 0;
}

/**
 * Returns true if x is a boolean.
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to boolean.
 */
export function isBoolean(x: unknown): x is boolean {
  return typeof x === 'boolean';
}

/**
 * Returns true if x is an array.
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to T[].
 */
export function isArray<T = unknown>(x: unknown): x is T[] {
  return Array.isArray(x);
}

/**
 * Returns true if x is a plain object (not null, not array).
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to Record<string, unknown>.
 */
export function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

/**
 * Returns true if x is a valid Date instance (non-NaN time).
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to Date.
 */
export function isDate(x: unknown): x is Date {
  return x instanceof Date && !Number.isNaN(x.getTime?.());
}

/** Returns true if x is a function. */
export function isFunction(x: unknown): x is (...args: any[]) => unknown {
  return typeof x === 'function';
}

/** Returns true if x is Promise-like (has a then method). */
export function isPromiseLike<T = unknown>(x: unknown): x is PromiseLike<T> {
  return x != null && typeof (x as any).then === 'function';
}

/**
 * Returns true if x is not undefined.
 *
 * Narrowing:
 * - On a true branch, narrows from T | undefined to T.
 */
export function isDefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

/**
 * Returns true if x is not null.
 *
 * Narrowing:
 * - On a true branch, narrows from T | null to T.
 */
export function isNonNull<T>(x: T | null): x is T {
  return x !== null;
}

/**
 * Returns true if x is neither null nor undefined.
 *
 * Narrowing:
 * - On a true branch, narrows from T | null | undefined to T.
 */
export function isPresent<T>(x: T | null | undefined): x is T {
  return x !== null && x !== undefined;
}

/** Alias: returns true if value "exists" (not null/undefined). */
export function exists<T>(x: T | null | undefined): x is T {
  return isPresent(x);
}

/**
 * Returns true if x is an instance of the provided constructor.
 *
 * Narrowing:
 * - On a true branch, narrows x to InstanceType<C>.
 */
export function isInstanceOf<C extends new (...args: any[]) => any>(x: unknown, ctor: C): x is InstanceType<C> {
  return typeof ctor === 'function' && x instanceof ctor;
}

// ===============
// Assert helpers with narrowing
// ===============

/**
 * Asserts that x is a string.
 *
 * Narrowing:
 * - On success, narrows x to string.
 *
 * @param x Value to check
 * @param message Custom error message
 * @param info Optional diagnostic info
 */
export function assertString(x: unknown, message = 'Expected string', info?: Record<string, unknown>): asserts x is string {
  assert(isString(x), message, { ...info, got: typeof x });
}

/**
 * Asserts that x is a finite number.
 *
 * Narrowing:
 * - On success, narrows x to number.
 */
export function assertNumber(x: unknown, message = 'Expected number', info?: Record<string, unknown>): asserts x is number {
  assert(isNumber(x), message, { ...info, got: typeof x });
}

/**
 * Asserts that x is a boolean.
 *
 * Narrowing:
 * - On success, narrows x to boolean.
 */
export function assertBoolean(x: unknown, message = 'Expected boolean', info?: Record<string, unknown>): asserts x is boolean {
  assert(isBoolean(x), message, { ...info, got: typeof x });
}

/**
 * Asserts that x is an array.
 *
 * Narrowing:
 * - On success, narrows x to T[].
 */
export function assertArray<T = unknown>(x: unknown, message = 'Expected array', info?: Record<string, unknown>): asserts x is T[] {
  assert(isArray<T>(x), message, {
    ...info,
    got: Array.isArray(x) ? 'array' : typeof x,
  });
}

/**
 * Asserts that x is a plain object (not null, not array).
 *
 * Narrowing:
 * - On success, narrows x to Record<string, unknown>.
 */
export function assertObject(x: unknown, message = 'Expected object', info?: Record<string, unknown>): asserts x is Record<string, unknown> {
  assert(isObject(x), message, {
    ...info,
    got: Array.isArray(x) ? 'array' : x === null ? 'null' : typeof x,
  });
}

/**
 * Asserts that x is a valid Date instance (non-NaN time).
 *
 * Narrowing:
 * - On success, narrows x to Date.
 */
export function assertDate(x: unknown, message = 'Expected Date', info?: Record<string, unknown>): asserts x is Date {
  assert(isDate(x), message, { ...info, got: typeof x });
}

/**
 * Asserts that x is a function.
 *
 * Narrowing:
 * - On success, narrows x to (...args:any[]) => unknown.
 */
export function assertFunction(x: unknown, message = 'Expected function', info?: Record<string, unknown>): asserts x is (...args: any[]) => unknown {
  assert(isFunction(x), message, { ...info, got: typeof x });
}

/**
 * Asserts that x is Promise-like (has a then method).
 *
 * Narrowing:
 * - On success, narrows x to PromiseLike<unknown>.
 */
export function assertPromiseLike<T = unknown>(x: unknown, message = 'Expected Promise-like', info?: Record<string, unknown>): asserts x is PromiseLike<T> {
  assert(isPromiseLike<T>(x), message, { ...info, got: typeof x });
}

/**
 * Asserts that x is not undefined.
 *
 * Narrowing:
 * - On success, narrows from T | undefined to T.
 */
export function assertDefined<T>(x: T | undefined, message = 'Expected defined', info?: Record<string, unknown>): asserts x is T {
  assert(isDefined(x), message, info);
}

/**
 * Asserts that x is not null.
 *
 * Narrowing:
 * - On success, narrows from T | null to T.
 */
export function assertNonNull<T>(x: T | null, message = 'Expected non-null', info?: Record<string, unknown>): asserts x is T {
  assert(isNonNull(x), message, info);
}

/**
 * Asserts that x is neither null nor undefined.
 *
 * Narrowing:
 * - On success, narrows from T | null | undefined to T.
 */
export function assertPresent<T>(x: T | null | undefined, message = 'Expected value present', info?: Record<string, unknown>): asserts x is T {
  assert(isPresent(x), message, info);
}

/** Alias: asserts that value exists (not null/undefined). */
export function assertExists<T>(x: T | null | undefined, message = 'Expected value to exist', info?: Record<string, unknown>): asserts x is T {
  assertPresent(x, message, info);
}

/**
 * Asserts that x is an instance of ctor.
 *
 * Narrowing:
 * - On success, narrows x to InstanceType<C>.
 */
export function assertInstanceOf<C extends new (...args: any[]) => any>(x: unknown, ctor: C, message?: string, info?: Record<string, unknown>): asserts x is InstanceType<C> {
  assert(isInstanceOf(x, ctor), message ?? `Expected instance of ${ctor?.name ?? '<ctor>'}`, { ...info, got: (x as any)?.constructor?.name ?? typeof x });
}

// ===============
// Value-level helpers (return the narrowed value)
// ===============

/**
 * Ensures x is a string and returns it.
 *
 * Narrowing/Return:
 * - Throws on failure; returns string on success.
 */
export function expectString<T>(x: T, message?: string): string {
  assertString(x as unknown, message);
  return x as unknown as string;
}

/**
 * Ensures x is a number and returns it.
 */
export function expectNumber<T>(x: T, message?: string): number {
  assertNumber(x as unknown, message);
  return x as unknown as number;
}

/**
 * Ensures x is a boolean and returns it.
 */
export function expectBoolean<T>(x: T, message?: string): boolean {
  assertBoolean(x as unknown, message);
  return x as unknown as boolean;
}

/**
 * Ensures x is an array and returns it typed as T[].
 */
export function expectArray<T = unknown>(x: unknown, message?: string): T[] {
  assertArray<T>(x, message);
  return x as T[];
}

/**
 * Ensures x is a plain object and returns it.
 */
export function expectObject(x: unknown, message?: string): Record<string, unknown> {
  assertObject(x, message);
  return x as Record<string, unknown>;
}

/**
 * Ensures x is a Date and returns it.
 */
export function expectDate(x: unknown, message?: string): Date {
  assertDate(x, message);
  return x as Date;
}

// ===============
// assertRoute: scope that converts AssertError to a fallback value
// ===============

/**
 * Options controlling how assertRoute/assertRouteAsync handle errors.
 * - onError: callback invoked for caught AssertError (and optionally other errors)
 * - catchNonAssertErrors: when true, also catch and convert non-AssertError errors to fallback
 */
export type AssertRouteOptions = {
  // Called when an assertion fails inside the route; can log/telemetry
  onError?: (err: AssertError) => void;
  // Optional guard to only catch AssertError; default true
  catchNonAssertErrors?: boolean; // default false: rethrow non-AssertError
};

/**
 * Execute a function in an assertion route. Any AssertError thrown inside is caught
 * and the provided fallback value is returned. Non-AssertError exceptions are rethrown
 * by default (set catchNonAssertErrors=true to also catch them).
 */
/**
 * Execute a function within an "assertion route"; any AssertError thrown inside is caught
 * and the fallback value is returned. Overload behavior:
 * - If `fn.length === 0` (no parameters), executes immediately and returns T.
 * - Otherwise, returns a wrapper function (...args) => T that applies the same routing.
 *
 * Narrowing:
 * - Inside fn, your assert* calls act normally (throwing AssertError), enabling narrowing in code that executes after successful assertions.
 * - Failures are translated to `fallback` for this route.
 *
 * @param fallback Value returned when an AssertError is thrown within the route
 * @param fn Function to execute (sync)
 * @param options Control catching/logging behavior
 */
export function assertRoute<T>(fallback: T, fn: () => T, options?: AssertRouteOptions): T;
export function assertRoute<T, A extends any[]>(fallback: T, fn: (...args: A) => T, options?: AssertRouteOptions): (...args: A) => T;
export function assertRoute<T, A extends any[]>(fallback: T, fn: (...args: A) => T, options: AssertRouteOptions = {}): T | ((...args: A) => T) {
  const { onError, catchNonAssertErrors = false } = options;

  // If the function has no parameters (length === 0), execute it immediately
  if (fn.length === 0) {
    try {
      return (fn as () => T)();
    } catch (e) {
      if (e instanceof AssertError) {
        onError?.(e);
        return fallback;
      }
      if (catchNonAssertErrors) {
        const err = e instanceof Error ? e : new Error(String(e));
        onError?.(new AssertError(err.message, { cause: err } as any));
        return fallback;
      }
      throw e; // rethrow non-assert errors by default
    }
  }

  // If the function has parameters, return a wrapped function
  return ((...args: A) => {
    try {
      return fn(...args);
    } catch (e) {
      if (e instanceof AssertError) {
        onError?.(e);
        return fallback;
      }
      if (catchNonAssertErrors) {
        const err = e instanceof Error ? e : new Error(String(e));
        onError?.(new AssertError(err.message, { cause: err } as any));
        return fallback;
      }
      throw e; // rethrow non-assert errors by default
    }
  }) as (...args: A) => T;
}

/**
 * Curry-style helper: returns a function wrapping any target function so that
 * assertion failures return the given fallback.
 */
/**
 * Curry helper: configure a fallback and options once, then wrap functions so
 * assertion failures return the fallback.
 *
 * @example
 * const safe = routeWith(0);
 * const parseLen = safe((s?: string) => { assertString(s); return s.length; });
 */
export function routeWith<T>(fallback: T, options?: AssertRouteOptions) {
  return <A extends any[]>(fn: (...args: A) => T) => assertRoute(fallback, fn, options);
}

// ===============
// Async variant: assertRouteAsync
// ===============

/**
 * Async variant of assertRoute.
 * - If `fn.length === 0`, executes immediately and returns Promise<T>.
 * - Otherwise, returns an async wrapper (...args) => Promise<T>.
 *
 * @param fallback Value returned when an AssertError (or optionally other errors) is thrown
 * @param fn Async function to execute
 * @param options Control catching/logging behavior
 */
export function assertRouteAsync<T>(fallback: T, fn: () => Promise<T>, options?: AssertRouteOptions): Promise<T>;
export function assertRouteAsync<T, A extends any[]>(fallback: T, fn: (...args: A) => Promise<T>, options?: AssertRouteOptions): (...args: A) => Promise<T>;
export function assertRouteAsync<T, A extends any[]>(fallback: T, fn: (...args: A) => Promise<T>, options: AssertRouteOptions = {}): Promise<T> | ((...args: A) => Promise<T>) {
  const { onError, catchNonAssertErrors = false } = options;

  if (fn.length === 0) {
    return (async () => {
      try {
        return await (fn as () => Promise<T>)();
      } catch (e) {
        if (e instanceof AssertError) {
          onError?.(e);
          return fallback;
        }
        if (catchNonAssertErrors) {
          const err = e instanceof Error ? e : new Error(String(e));
          onError?.(new AssertError(err.message, { cause: err } as any));
          return fallback;
        }
        throw e;
      }
    })();
  }

  return (async (...args: A) => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof AssertError) {
        onError?.(e);
        return fallback;
      }
      if (catchNonAssertErrors) {
        const err = e instanceof Error ? e : new Error(String(e));
        onError?.(new AssertError(err.message, { cause: err } as any));
        return fallback;
      }
      throw e;
    }
  }) as (...args: A) => Promise<T>;
}

// ===============
// Small extras for strings and arrays (assert*)
// ===============

/**
 * Asserts that x is a string with length > 0.
 *
 * Narrowing:
 * - On success, narrows x to string.
 */
export function assertNonEmptyString(x: unknown, message = 'Expected non-empty string'): asserts x is string {
  assertString(x, message);
  assert((x as string).length > 0, message);
}

/**
 * Asserts that x is an array with length > 0.
 *
 * Narrowing:
 * - On success, narrows x to T[].
 */
export function assertArrayNotEmpty<T = unknown>(x: unknown, message = 'Expected non-empty array'): asserts x is T[] {
  assertArray<T>(x, message);
  assert((x as T[]).length > 0, message);
}

// Re-export type for consumers to refine catches
/** Re-export: consumers can import { AssertionError } name for AssertError. */
export type { AssertError as AssertionError };

// Quick examples (JSDoc)
/**
 * Example:
 * const name = maybeName as unknown;
 * assertString(name);
 * // name is string here
 *
 * const result = assertRoute(() => {
 *   assertArrayNotEmpty(input, "input required");
 *   return input.length;
 * }, 0);
 */

// ===============
// Additional useful assertions (ported from assume.ts ideas)
// ===============

// ---- Strings ----

/** Asserts that x is a string with exact length `len`. */
export function assertStringLength(x: unknown, len: number, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string length ${len}`);
  assert((x as string).length === len, message ?? `Expected string length ${len}`);
}

/** Asserts that x is a string with length >= `n`. */
export function assertStringLengthAtLeast(x: unknown, n: number, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string length >= ${n}`);
  assert((x as string).length >= n, message ?? `Expected string length >= ${n}`);
}

/** Asserts that x is a string with length <= `n`. */
export function assertStringLengthAtMost(x: unknown, n: number, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string length <= ${n}`);
  assert((x as string).length <= n, message ?? `Expected string length <= ${n}`);
}

/** Asserts that x is a string with min/max inclusive bounds. */
export function assertStringLengthBetween(x: unknown, min: number, max: number, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string length between ${min} and ${max}`);
  const l = (x as string).length;
  assert(l >= min && l <= max, message ?? `Expected string length between ${min} and ${max}`);
}

/** Asserts that x is a string containing substring or matching regex. */
export function assertStringContains(x: unknown, needle: string | RegExp, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string to contain ${String(needle)}`);
  const s = x as string;
  const ok = typeof needle === 'string' ? s.includes(needle) : needle.test(s);
  assert(ok, message ?? `Expected string to contain ${String(needle)}`);
}

/** Asserts that x is a string starting with the given prefix. */
export function assertStringStartsWith(x: unknown, prefix: string, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string to start with "${prefix}"`);
  assert((x as string).startsWith(prefix), message ?? `Expected string to start with "${prefix}"`);
}

/** Asserts that x is a string ending with the given suffix. */
export function assertStringEndsWith(x: unknown, suffix: string, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string to end with "${suffix}"`);
  assert((x as string).endsWith(suffix), message ?? `Expected string to end with "${suffix}"`);
}

/** Asserts that x is a string that matches the regex. */
export function assertStringMatches(x: unknown, re: RegExp, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string to match ${re}`);
  assert(re.test(x as string), message ?? `Expected string to match ${re}`);
}

/** Asserts that x (string) equals `expected` ignoring case. */
export function assertStringEqualsIgnoreCase(x: unknown, expected: string, message?: string): asserts x is string {
  assertString(x, message ?? `Expected "${expected}" (case-insensitive)`);
  assert((x as string).toLowerCase() === expected.toLowerCase(), message ?? `Expected "${expected}" (case-insensitive)`);
}

/** Asserts that x is a string including any of the provided substrings. */
export function assertStringIncludesAny(x: unknown, ...needles: string[]): asserts x is string {
  assertString(x, `Expected string`);
  const s = x as string;
  assert(
    needles.some((n) => s.includes(n)),
    `Expected string to include any of [${needles.join(', ')}]`
  );
}

/** Asserts that x is a string including all of the provided substrings. */
export function assertStringIncludesAll(x: unknown, ...needles: string[]): asserts x is string {
  assertString(x, `Expected string`);
  const s = x as string;
  assert(
    needles.every((n) => s.includes(n)),
    `Expected string to include all of [${needles.join(', ')}]`
  );
}

/** Asserts that x is a string containing valid JSON. */
export function assertStringIsJSON(x: unknown, message = 'Expected valid JSON'): asserts x is string {
  assertString(x, message);
  try {
    JSON.parse(x as string);
  } catch {
    assert(false, message);
  }
}

/** Asserts that x is a string whose trimmed length > 0. */
export function assertStringTrimmedNotEmpty(x: unknown, message = 'Expected non-empty (trimmed)'): asserts x is string {
  assertString(x, message);
  assert((x as string).trim().length > 0, message);
}

// ---- Numbers ----

/** Asserts that x is a number strictly greater than n. */
export function assertNumberGreaterThan(x: unknown, n: number, message?: string): asserts x is number {
  assertNumber(x, message ?? `Expected > ${n}`);
  assert((x as number) > n, message ?? `Expected > ${n}`);
}

/** Asserts that x is a number >= n. */
export function assertNumberGreaterOrEqual(x: unknown, n: number, message?: string): asserts x is number {
  assertNumber(x, message ?? `Expected >= ${n}`);
  assert((x as number) >= n, message ?? `Expected >= ${n}`);
}

/** Asserts that x is a number strictly less than n. */
export function assertNumberLessThan(x: unknown, n: number, message?: string): asserts x is number {
  assertNumber(x, message ?? `Expected < ${n}`);
  assert((x as number) < n, message ?? `Expected < ${n}`);
}

/** Asserts that x is a number <= n. */
export function assertNumberLessOrEqual(x: unknown, n: number, message?: string): asserts x is number {
  assertNumber(x, message ?? `Expected <= ${n}`);
  assert((x as number) <= n, message ?? `Expected <= ${n}`);
}

/** Asserts that x is a number within [min, max]. */
export function assertNumberBetween(x: unknown, min: number, max: number, message?: string): asserts x is number {
  assertNumber(x, message ?? `Expected between ${min} and ${max}`);
  const v = x as number;
  assert(v >= min && v <= max, message ?? `Expected between ${min} and ${max}`);
}

// ---- Arrays ----

/** Asserts that x is an array with exact length `len`. */
export function assertArrayLength<T = unknown>(x: unknown, len: number, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array length ${len}`);
  assert((x as T[]).length === len, message ?? `Expected array length ${len}`);
}

/** Asserts that x is an array containing at least one of the provided items (by string form). */
export function assertArrayHasAnyOf<T = unknown>(x: unknown, items: string[], message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  const arr = x as any[];
  const set = new Set(items);
  const ok = arr.some((el) => set.has(String(el)) || set.has(el as any));
  assert(ok, message ?? `Expected array to contain any of [${items.join(', ')}]`);
}

/** Asserts that x is an array containing all the provided items (by string form). */
export function assertArrayHasEveryOf<T = unknown>(x: unknown, items: string[], message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  const arr = x as any[];
  const set = new Set(arr.map((v) => (typeof v === 'string' ? v : String(v))));
  const missing = items.filter((k) => !set.has(k));
  assert(missing.length === 0, message ?? `Missing required items: [${missing.join(', ')}]`);
}

/** Asserts that x is an array and element at index i is a boolean. */
export function assertArrayItemIsBoolean<T = unknown>(x: unknown, i: number, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(typeof (x as any[])[i] === 'boolean', message ?? `Expected boolean at ${i}`);
}

/** Asserts that x is an array and element at index i is a string. */
export function assertArrayItemIsString<T = unknown>(x: unknown, i: number, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(typeof (x as any[])[i] === 'string', message ?? `Expected string at ${i}`);
}

/** Asserts that x is an array and element at index i is a number. */
export function assertArrayItemIsNumber<T = unknown>(x: unknown, i: number, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(typeof (x as any[])[i] === 'number', message ?? `Expected number at ${i}`);
}

/** Asserts that x is an array and element at index i is a plain object. */
export function assertArrayItemIsObject<T = unknown>(x: unknown, i: number, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  const v = (x as any[])[i];
  assert(typeof v === 'object' && v !== null && !Array.isArray(v), message ?? `Expected object at ${i}`);
}

/** Asserts that x is an array with at least one item whose string form includes `needle`. */
export function assertArrayIncludesString<T = unknown>(x: unknown, needle: string, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(
    (x as any[]).some((item) => String(item).includes(needle)),
    message ?? `Expected array to include string containing "${needle}"`
  );
}

/** Asserts that x is an array including the exact number `needle`. */
export function assertArrayIncludesNumber<T = unknown>(x: unknown, needle: number, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(
    (x as any[]).some((item) => item === needle),
    message ?? `Expected array to include number ${needle}`
  );
}

/** Asserts that x is an array including an object deep-equal to `needle`. */
export function assertArrayIncludesObject<T = unknown>(x: unknown, needle: Record<string, unknown>, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  const needleStr = JSON.stringify(needle);
  assert(
    (x as any[]).some((item) => JSON.stringify(item) === needleStr),
    message ?? `Expected array to include object ${needleStr}`
  );
}

/** Asserts that x is an array whose every element is a plain object. */
export function assertArrayOnlyHasObjects<T = unknown>(x: unknown, message?: string): asserts x is Record<string, unknown>[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(
    (x as any[]).every((item) => typeof item === 'object' && item !== null && !Array.isArray(item)),
    message ?? `Expected array to only contain objects`
  );
}

/** Asserts that x is an array whose every element is a string. */
export function assertArrayOnlyHasStrings<T = unknown>(x: unknown, message?: string): asserts x is string[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(
    (x as any[]).every((item) => typeof item === 'string'),
    message ?? `Expected array to only contain strings`
  );
}

/** Asserts that x is an array whose every element is a number. */
export function assertArrayOnlyHasNumbers<T = unknown>(x: unknown, message?: string): asserts x is number[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(
    (x as any[]).every((item) => typeof item === 'number'),
    message ?? `Expected array to only contain numbers`
  );
}

/** Asserts that x is an array and every element is falsy. */
export function assertArrayEveryIsFalsy<T = unknown>(x: unknown, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(
    (x as any[]).every((item) => !item),
    message ?? `Expected every item to be falsy`
  );
}

/** Asserts that x is an array and every element is truthy. */
export function assertArrayEveryIsTruthy<T = unknown>(x: unknown, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(
    (x as any[]).every((item) => !!item),
    message ?? `Expected every item to be truthy`
  );
}

/** Asserts that x is an array including an element for which predicate returns true. */
export function assertArrayIncludesCondition<T = unknown>(x: unknown, predicate: (item: unknown) => boolean, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert((x as any[]).some(predicate), message ?? `Expected array to include an item matching condition`);
}

// ---- Objects ----

/** Asserts that obj is a plain object containing the provided key. */
export function assertHasKey<O extends Record<string, unknown>, K extends string>(obj: unknown, key: K, message?: string): asserts obj is O & Record<K, unknown> {
  assertObject(obj, message ?? `Expected object`);
  assert(key in (obj as Record<string, unknown>), message ?? `Expected key "${key}"`);
}

/** Asserts that obj is a plain object containing all provided keys. */
export function assertHasKeys<O extends Record<string, unknown>, const K extends readonly string[]>(obj: unknown, ...keys: K): asserts obj is O & { [P in K[number]]: unknown } {
  assertObject(obj, `Expected object`);
  const r = obj as Record<string, unknown>;
  assert(
    keys.every((k) => k in r),
    `Expected keys: ${keys.join(', ')}`
  );
}

/** Asserts that obj[key] strictly equals expected. */
export function assertKeyEquals<O extends Record<string, unknown>, K extends keyof O>(obj: unknown, key: K, expected: unknown, message?: string): asserts obj is O {
  assertObject(obj, message ?? `Expected object`);
  assert((obj as any)[key] === expected, message ?? `Expected key "${String(key)}" to equal ${JSON.stringify(expected)}`);
}

/** Asserts that obj has exactly the same set of keys as `expected`. */
export function assertSameKeys(obj: unknown, expected: Record<string, unknown>, message?: string): asserts obj is Record<string, unknown> {
  assertObject(obj, message ?? `Expected object`);
  const a = Object.keys(obj as Record<string, unknown>).sort();
  const b = Object.keys(expected).sort();
  assert(a.length === b.length && a.every((k, i) => k === b[i]), message ?? `Expected same keys`);
}

/** Asserts that every value in obj is falsy. */
export function assertAllKeysFalsy(obj: unknown, message?: string): asserts obj is Record<string, unknown> {
  assertObject(obj, message ?? `Expected object`);
  assert(
    Object.values(obj as Record<string, unknown>).every((v) => !v),
    message ?? `Expected all keys to be falsy`
  );
}

/** Asserts that every value in obj is neither null nor undefined. */
export function assertAllKeysSet(obj: unknown, message?: string): asserts obj is Record<string, unknown> {
  assertObject(obj, message ?? `Expected object`);
  const vals = Object.values(obj as Record<string, unknown>);
  assert(
    vals.every((v) => v !== null && v !== undefined),
    message ?? `Expected all keys to be set (not null/undefined)`
  );
}

/** Asserts that at least one value in obj is null. */
export function assertAnyKeyNull(obj: unknown, message?: string): asserts obj is Record<string, unknown> {
  assertObject(obj, message ?? `Expected object`);
  const vals = Object.values(obj as Record<string, unknown>);
  assert(
    vals.some((v) => v === null),
    message ?? `Expected any key to be null`
  );
}

// ---- Elements ----

/** Returns true if x is a DOM Element (when running in an environment with DOM). */
export function isElement(x: unknown): x is Element {
  return typeof Element !== 'undefined' && x instanceof Element;
}

/** Asserts that x is a DOM Element. */
export function assertElement(x: unknown, message = 'Expected Element'): asserts x is Element {
  assert(isElement(x), message);
}

/** Asserts that the element has at least one child node/element. */
export function assertElementHasChildren(x: unknown, message = 'Expected element to have children'): asserts x is Element {
  assertElement(x, message);
  const el = x as Element;
  const count = (el as any).children?.length ?? el.childNodes?.length ?? 0;
  assert(count > 0, message);
}

/** Asserts that the element has at least one child element. */
export function assertElementHasChild(x: unknown, message = 'Expected element to have a child'): asserts x is Element {
  assertElement(x, message);
  const el = x as Element;
  assert((el as any).children?.length > 0, message);
}

/** Asserts that the element has a child matching the CSS selector. */
export function assertElementHasChildMatching(x: unknown, selector: string, message?: string): asserts x is Element {
  assertElement(x, message ?? `Expected element`);
  const el = x as Element;
  const children = Array.from((el as any).children ?? []) as Element[];
  assert(
    children.some((c) => c.matches?.(selector)),
    message ?? `Expected child matching "${selector}"`
  );
}

/** Asserts that the element has a descendant matching the CSS selector. */
export function assertElementHasDescendant(x: unknown, selector: string, message?: string): asserts x is Element {
  assertElement(x, message ?? `Expected element`);
  const el = x as Element;
  const found = (el as any).querySelector?.(selector);
  assert(!!found, message ?? `Expected descendant matching "${selector}"`);
}

/** Asserts that the element has the given attribute. */
export function assertElementHasAttribute(x: unknown, name: string, message?: string): asserts x is Element {
  assertElement(x, message ?? `Expected element`);
  const el = x as Element;
  const ok = (el as any).hasAttribute?.(name);
  assert(!!ok, message ?? `Expected element to have attribute "${name}"`);
}

/** Asserts that the element's attribute equals the expected value. */
export function assertElementAttributeEquals(x: unknown, name: string, expected: string, message?: string): asserts x is Element {
  assertElement(x, message ?? `Expected element`);
  const el = x as Element;
  const val = (el as any).getAttribute?.(name);
  assert(val === expected, message ?? `Expected attribute "${name}" to equal "${expected}"`);
}

/** Returns true if the Element is hidden via display:none or visibility:hidden (DOM environments). */
export function isElementHidden(x: unknown): x is Element {
  if (typeof Element === 'undefined' || !(x instanceof Element)) return false;
  const computed = typeof window !== 'undefined' ? window.getComputedStyle(x) : null;
  return computed ? computed.display === 'none' || computed.visibility === 'hidden' : false;
}

/** Returns true if the Element is visible (i.e., not hidden by display/visibility). */
export function isElementVisible(x: unknown): x is Element {
  if (typeof Element === 'undefined' || !(x instanceof Element)) return false;
  const computed = typeof window !== 'undefined' ? window.getComputedStyle(x) : null;
  return computed ? computed.display !== 'none' && computed.visibility !== 'hidden' : true;
}

/** Asserts that x is an Element currently hidden by CSS (display or visibility). */
export function assertElementHidden(x: unknown, message = 'Expected element to be hidden'): asserts x is Element {
  assert(isElementHidden(x), message);
}

/** Asserts that x is an Element currently visible (not hidden by display/visibility). */
export function assertElementVisible(x: unknown, message = 'Expected element to be visible'): asserts x is Element {
  assert(isElementVisible(x), message);
}

// ---- Dates ----

/** Asserts that x is a Date earlier than `than`. */
export function assertDateEarlier(x: unknown, than: Date, message?: string): asserts x is Date {
  assertDate(x, message ?? `Expected Date`);
  assert((x as Date).getTime() < than.getTime(), message ?? `Expected date earlier than ${than.toISOString?.() ?? than}`);
}

/** Asserts that x is a Date later than `than`. */
export function assertDateLater(x: unknown, than: Date, message?: string): asserts x is Date {
  assertDate(x, message ?? `Expected Date`);
  assert((x as Date).getTime() > than.getTime(), message ?? `Expected date later than ${than.toISOString?.() ?? than}`);
}

/** Asserts that x is a Date within [min, max]. */
export function assertDateBetween(x: unknown, min: Date, max: Date, message?: string): asserts x is Date {
  assertDate(x, message ?? `Expected Date`);
  const t = (x as Date).getTime();
  assert(t >= min.getTime() && t <= max.getTime(), message ?? `Expected date between ${min.toISOString?.() ?? min} and ${max.toISOString?.() ?? max}`);
}

/** Asserts that x is a Date whose full year equals `year`. */
export function assertDateYear(x: unknown, year: number, message?: string): asserts x is Date {
  assertDate(x, message ?? `Expected Date`);
  assert((x as Date).getFullYear() === year, message ?? `Expected year ${year}`);
}

// ---- Nullish / Boolean convenience ----

/** Asserts that x is strictly true. */
export function assertTrue(x: unknown, message = 'Expected true'): asserts x is true {
  assert(x === true, message);
}

/** Asserts that x is strictly false. */
export function assertFalse(x: unknown, message = 'Expected false'): asserts x is false {
  assert(x === false, message);
}

/** Asserts that x is strictly null. */
export function assertNull(x: unknown, message = 'Expected null'): asserts x is null {
  assert(x === null, message);
}

/** Asserts that x is strictly undefined. */
export function assertUndefined(x: unknown, message = 'Expected undefined'): asserts x is undefined {
  assert(x === undefined, message);
}

// ==========================
// Extra number assertions
// ==========================

/** Asserts that x is a number not equal to 0. */
export function assertNumberNotZero(x: unknown, message = 'Expected non-zero number'): asserts x is number {
  assertNumber(x, message);
  assert((x as number) !== 0, message);
}

/** Asserts that x is a number strictly greater than 0. */
export function assertNumberPositive(x: unknown, message = 'Expected positive number'): asserts x is number {
  assertNumber(x, message);
  assert((x as number) > 0, message);
}

/** Asserts that x is a number >= 0. */
export function assertNumberNonNegative(x: unknown, message = 'Expected non-negative number'): asserts x is number {
  assertNumber(x, message);
  assert((x as number) >= 0, message);
}

/** Asserts that x is a number strictly less than 0. */
export function assertNumberNegative(x: unknown, message = 'Expected negative number'): asserts x is number {
  assertNumber(x, message);
  assert((x as number) < 0, message);
}

/** Asserts that x is a number <= 0. */
export function assertNumberNonPositive(x: unknown, message = 'Expected non-positive number'): asserts x is number {
  assertNumber(x, message);
  assert((x as number) <= 0, message);
}

/** Asserts that x is an integer (Number.isInteger). */
export function assertNumberInteger(x: unknown, message = 'Expected integer'): asserts x is number {
  assertNumber(x, message);
  assert(Number.isInteger(x as number), message);
}

/** Asserts that x is a safe integer (Number.isSafeInteger). */
export function assertNumberSafeInteger(x: unknown, message = 'Expected safe integer'): asserts x is number {
  assertNumber(x, message);
  assert(Number.isSafeInteger(x as number), message);
}

/** Asserts that x is a number within ±epsilon of expected. */
export function assertNumberApproxEquals(x: unknown, expected: number, epsilon = 1e-9, message?: string): asserts x is number {
  assertNumber(x, message ?? `Expected approximately ${expected} ± ${epsilon}`);
  assert(Math.abs((x as number) - expected) <= epsilon, message ?? `Expected approximately ${expected} ± ${epsilon}`);
}

// Aliases for descriptive naming
/** Alias for assertNumberNotZero. */
export const assertIsNotZero = assertNumberNotZero;
/** Alias for assertNumberPositive. */
export const assertIsPositive = assertNumberPositive;
/** Alias for assertNumberNegative. */
export const assertIsNegative = assertNumberNegative;

// ==========================
// Array/object-of-object assertions
// ==========================

/** Asserts that x is an array of objects and each object contains `key`. */
export function assertObjectArrayAllHaveKey<T = Record<string, unknown>>(x: unknown, key: string, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(
    (x as any[]).every((item) => typeof item === 'object' && item !== null && !Array.isArray(item) && key in (item as Record<string, unknown>)),
    message ?? `Expected every object in array to have key "${key}"`
  );
}

/** Asserts that x is an array of objects and each object contains all provided keys. */
export function assertObjectArrayEveryHasKeys<T = Record<string, unknown>>(x: unknown, ...keys: string[]): asserts x is T[] {
  assertArray<T>(x, `Expected array`);
  assert(
    (x as any[]).every((item) => {
      if (!(typeof item === 'object' && item !== null && !Array.isArray(item))) return false;
      const r = item as Record<string, unknown>;
      return keys.every((k) => k in r);
    }),
    `Expected every object in array to have keys: ${keys.join(', ')}`
  );
}

// ==========================
// One-of helpers
// ==========================

/** Asserts that x is strictly equal to one of the provided primitive options. */
export function assertOneOfPrimitive<T extends string | number | boolean>(x: unknown, options: readonly T[], message?: string): asserts x is T {
  assert(options.includes(x as T), message ?? `Expected one of [${options.join(', ')}]`);
}

// ==========================
// Aliases for alternative naming style
// ==========================

/** Alias for assertArrayNotEmpty. */
export const assertIsArrayNotEmpty = assertArrayNotEmpty;

// ==========================
// Reverse try->catch helper: onFail-run
// ==========================

/** Options for assertOnFail/onFail wrappers. */
export type AssertOnFailOptions = {
  catchNonAssertErrors?: boolean; // default false
};

/**
 * Run fn, and if an AssertError occurs, invoke onFail(err) and return its value.
 * Non-AssertError exceptions are rethrown by default unless catchNonAssertErrors=true.
 */
/**
 * Run fn and, if it throws AssertError, invoke onFail(err) and return its value.
 *
 * @param fn A function that may throw AssertError via assert* calls
 * @param onFail Handler that maps an AssertError to a return value
 * @param options catchNonAssertErrors: when true, non-AssertError exceptions are converted to AssertError and passed to onFail
 */
export function assertOnFail<T>(fn: () => T, onFail: (err: AssertError) => T, options: AssertOnFailOptions = {}): T {
  const { catchNonAssertErrors = false } = options;
  try {
    return fn();
  } catch (e) {
    if (e instanceof AssertError) {
      return onFail(e);
    }
    if (catchNonAssertErrors) {
      const err = e instanceof Error ? e : new Error(String(e));
      return onFail(new AssertError(err.message, { cause: err } as any));
    }
    throw e;
  }
}

/** Fluent helper to compose on-fail behavior */
/**
 * Fluent helper to compose on-fail behavior for a function that may assert.
 *
 * Usage:
 * onFail(() => risky()).return(fallback) or .run(handler)
 */
export function onFail<T>(fn: () => T) {
  return {
    return: (fallback: T, options?: AssertOnFailOptions) =>
      assertRoute(fallback, fn, {
        catchNonAssertErrors: options?.catchNonAssertErrors,
      }),
    run: (handler: (err: AssertError) => T, options?: AssertOnFailOptions) => assertOnFail(fn, handler, options),
  } as const;
}

// ==========================
// Equality and identity assertions
// ==========================

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    // Dates
    if (a instanceof Date || b instanceof Date) {
      if (!(a instanceof Date && b instanceof Date)) return false;
      return a.getTime() === b.getTime();
    }
    // Arrays
    if (Array.isArray(a) || Array.isArray(b)) {
      if (!(Array.isArray(a) && Array.isArray(b))) return false;
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    // Plain objects
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
      if (!deepEqual(a[k], b[k])) return false;
    }
    return true;
  }
  // NaN equals NaN behavior
  return Number.isNaN(a) && Number.isNaN(b);
}

/** Asserts referential/primitive equality (===). */
export function assertEquals<T>(actual: T, expected: T, message?: string) {
  assert(actual === expected, message ?? `Expected ${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);
}

/** Asserts non-equality (!==). */
export function assertNotEquals<T>(actual: T, expected: T, message?: string) {
  assert(actual !== expected, message ?? `Expected values to differ`);
}

/** Asserts deep equality using a simple structural comparison (arrays, objects, dates). */
export function assertDeepEquals<T>(actual: T, expected: T, message?: string) {
  assert(deepEqual(actual, expected), message ?? `Expected deep equality`);
}

// ==========================
// Subset and key presence
// ==========================

/** Asserts that x is a plain object with at least one own key. */
export function assertNonEmptyRecord(x: unknown, message = 'Expected non-empty object'): asserts x is Record<string, unknown> {
  assertObject(x, message);
  assert(Object.keys(x as Record<string, unknown>).length > 0, message);
}

/** Asserts that `obj` contains all keys/values present in `subset` (deep-equality per key). */
export function assertSubset(obj: unknown, subset: Record<string, unknown>, message?: string): asserts obj is Record<string, unknown> {
  assertObject(obj, message ?? `Expected object`);
  const r = obj as Record<string, unknown>;
  for (const [k, v] of Object.entries(subset)) {
    assert(k in r, message ?? `Missing key: ${k}`);
    assert(deepEqual((r as any)[k], v), message ?? `Mismatched value at key: ${k}`);
  }
}

/** Asserts that `obj` has a defined path (e.g., 'a.b[0].c' via array form). */
export function assertHasPath(obj: unknown, path: string | Array<string | number>, message?: string): asserts obj is Record<string, unknown> {
  assertObject(obj, message ?? `Expected object`);
  const parts = Array.isArray(path) ? path : path.split('.').filter(Boolean);
  let curr: any = obj;
  for (const p of parts) {
    const key = typeof p === 'number' ? p : p;
    if (curr == null || !(key in curr)) {
      assert(false, message ?? `Missing path: ${parts.join('.')}`);
    }
    curr = curr[key as any];
  }
}

// ==========================
// Map / Set helpers
// ==========================

/** Asserts that m is a Map containing the given key. */
export function assertMapHasKey<K, V>(m: unknown, key: K, message?: string): asserts m is Map<K, V> {
  assert(m instanceof Map, message ?? `Expected Map`);
  assert((m as Map<K, V>).has(key), message ?? `Expected Map to have key`);
}

/** Asserts that s is a Set containing the given value. */
export function assertSetHasValue<T>(s: unknown, value: T, message?: string): asserts s is Set<T> {
  assert(s instanceof Set, message ?? `Expected Set`);
  assert((s as Set<T>).has(value), message ?? `Expected Set to contain value`);
}

// ==========================
// Schema matcher (lightweight)
// ==========================

/** Primitive schema types supported by assertMatchesSchema. */
type PrimitiveTypeName = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date';
type SchemaRule = PrimitiveTypeName | ((x: unknown) => boolean);
/**
 * Very small schema representation: a record of key -> rule, where rule is a primitive type name
 * or a predicate function receiving the value.
 */
export type SimpleSchema = Record<string, SchemaRule>;

/**
 * Asserts that object `x` matches the given simple schema. For function rules, the predicate must return true.
 */
export function assertMatchesSchema(x: unknown, schema: SimpleSchema, message?: string): asserts x is Record<string, unknown> {
  assertObject(x, message ?? `Expected object`);
  const r = x as Record<string, unknown>;
  for (const [k, rule] of Object.entries(schema)) {
    const v = r[k];
    if (typeof rule === 'function') {
      assert(rule(v), message ?? `Schema predicate failed at ${k}`);
    } else {
      switch (rule) {
        case 'string':
          assert(typeof v === 'string', message ?? `Expected ${k} to be string`);
          break;
        case 'number':
          assert(typeof v === 'number' && Number.isFinite(v as number), message ?? `Expected ${k} to be number`);
          break;
        case 'boolean':
          assert(typeof v === 'boolean', message ?? `Expected ${k} to be boolean`);
          break;
        case 'object':
          assert(typeof v === 'object' && v !== null && !Array.isArray(v), message ?? `Expected ${k} to be object`);
          break;
        case 'array':
          assert(Array.isArray(v), message ?? `Expected ${k} to be array`);
          break;
        case 'date':
          assert(v instanceof Date && !Number.isNaN(v.getTime?.()), message ?? `Expected ${k} to be Date`);
          break;
      }
    }
  }
}

// ==========================
// Canonical string comparisons (lowercase + no spaces)
// ==========================

/** Lowercases and removes all whitespace from a string (for canonical comparisons). */
function canonicalizeString(s: string) {
  return s.toLowerCase().replace(/\s+/g, '');
}

/** Asserts that x (string) equals expected after canonicalization. */
export function assertStringEqualsCanonical(x: unknown, expected: string, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string`);
  const got = canonicalizeString(x as string);
  const exp = canonicalizeString(expected);
  assert(got === exp, message ?? `Expected canonical equality`);
}

/** Asserts that x (string) contains needle after canonicalization. */
export function assertStringContainsCanonical(x: unknown, needle: string, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string`);
  const got = canonicalizeString(x as string);
  const ndl = canonicalizeString(needle);
  assert(got.includes(ndl), message ?? `Expected canonical containment`);
}

// ===============
// Confirmation utility - returns boolean instead of throwing
// ===============

/**
 * Execute one or more assertion functions and return true if all pass, false if any fail.
 * This catches AssertError internally and returns a boolean result instead of throwing.
 * Useful for validation without interrupting program flow.
 *
 * @param assertions - One or more functions that perform assertions
 * @returns true if all assertions pass, false if any assertion fails
 *
 * @example
 * const isValid = confirm(
 *   () => assertString(value),
 *   () => assert(value.length > 0),
 *   () => assertStringContains(value, '@')
 * );
 */
/**
 * Executes one or more assertions and returns true when all pass; returns false when any
 * assertion throws AssertError. Non-AssertError exceptions are rethrown.
 *
 * Narrowing:
 * - This utility is non-throwing, so it does not provide compile-time narrowing; use
 *   `onConfirmed(...).run(cb)` or the typed chain for narrowing inside the callback.
 */
export function confirm(...assertions: (() => void)[]): boolean {
  try {
    for (const assertion of assertions) {
      assertion();
    }
    return true;
  } catch (e) {
    if (e instanceof AssertError) {
      return false;
    }
    // Re-throw non-assertion errors
    throw e;
  }
}

/** Like confirm(), but returns error detail of the first failing assertion */
/** Like confirm(), but returns the first AssertError encountered for diagnostics. */
export function confirmWithError(...assertions: (() => void)[]): { ok: true } | { ok: false; error: AssertError } {
  try {
    for (const assertion of assertions) assertion();
    return { ok: true } as const;
  } catch (e) {
    if (e instanceof AssertError) return { ok: false, error: e } as const;
    throw e;
  }
}

/** Run all assertions and aggregate all AssertErrors (continues after failures) */
/** Runs all assertions and aggregates all AssertErrors (continues after failures). */
export function confirmAll(...assertions: (() => void)[]): { ok: boolean; errors: AssertError[] } {
  const errors: AssertError[] = [];
  for (const assertion of assertions) {
    try {
      assertion();
    } catch (e) {
      if (e instanceof AssertError) {
        errors.push(e);
      } else {
        throw e;
      }
    }
  }
  return { ok: errors.length === 0, errors };
}

// ===============
// Fluent confirmation interface with type narrowing
// ===============

/**
 * Fluent interface for conditional execution with type narrowing.
 * First checks if assertions would pass, then executes callback with actual assertions for type narrowing.
 */
/**
 * Fluent, non-typed confirmation builder.
 * - First, checks all assertions via confirm() without throwing.
 * - If they pass, re-runs them to enable TypeScript narrowing in the callback.
 *
 * Prefer NarrowingBuilder/AssertChain for compile-time propagation across steps.
 */
export class ConfirmationBuilder {
  private assertions: (() => void)[] = [];

  constructor(private value: unknown, initialAssertions: (() => void)[] = []) {
    // Shallow copy to avoid accidental external mutation
    this.assertions = [...initialAssertions];
  }

  /**
   * Add an assertion to check
   */
  /** Add an assertion to the builder (non-throwing check first, then re-assert for TS narrowing in callbacks). */
  check(assertion: () => void): this {
    this.assertions.push(assertion);
    return this;
  }

  /**
   * Execute the callback if all assertions pass.
   * Inside the callback, assertions are re-run for TypeScript type narrowing.
   * @param callback - Function to execute if all assertions pass
   * @returns The result of the callback, or undefined if assertions fail
   */
  /**
   * Execute callback only when all checks pass. Re-asserts before calling to benefit from TS narrowing inside callback.
   * Returns undefined if any assertion fails.
   */
  run<T>(callback: (value: unknown) => T): T | undefined {
    // First, check if all assertions would pass
    if (!confirm(...this.assertions)) {
      return undefined;
    }

    // If they pass, re-run them for type narrowing and execute callback
    for (const assertion of this.assertions) {
      assertion(); // This will narrow types in the callback
    }

    return callback(this.value);
  }

  /**
   * Execute the callback if all assertions pass, with a fallback value.
   * @param callback - Function to execute if all assertions pass
   * @param fallback - Value to return if assertions fail
   * @returns The result of the callback, or the fallback value
   */
  /** Execute callback if checks pass, otherwise return the provided fallback value. */
  runOr<T>(callback: (value: unknown) => T, fallback: T): T {
    const result = this.run(callback);
    return result !== undefined ? result : fallback;
  }
}

/**
 * Create a confirmation builder for fluent assertion checking with type narrowing.
 *
 * @example
 * const result = onConfirmed(value)
 *   .check(() => assertArray(value))
 *   .check(() => assertArrayNotEmpty(value))
 *   .run(v => {
 *     // v is narrowed to non-empty array here
 *     return v.map(x => x.toString());
 *   });
 */
/**
 * Create a non-throwing confirmation flow over a value, with optional initial assertions.
 * - Use .run(cb) to get narrowing inside the callback.
 */
export function onConfirmed(value: unknown): ConfirmationBuilder;
export function onConfirmed(value: unknown, ...assertions: (() => void)[]): ConfirmationBuilder;
export function onConfirmed(value: unknown, ...assertions: (() => void)[]): ConfirmationBuilder {
  return new ConfirmationBuilder(value, assertions);
}

// ===============
// Typed narrowing builder (compile-time narrowing across checks)
// ===============

/** A guard function that narrows V to V2 by throwing on failure. */
export type Guard<V, V2 extends V = V> = (x: V) => asserts x is V2;

/**
 * Typed narrowing builder that carries compile-time narrowing through chained guards.
 *
 * Example:
 * onValue(x).check(assertDefined).check(assertString).run(s => s.toUpperCase())
 */
export class NarrowingBuilder<V> {
  private guards: Array<Guard<any, any>> = [];
  constructor(private value: V, initialGuards: Array<Guard<any, any>> = []) {
    this.guards = [...initialGuards];
  }

  /** Add a guard that narrows V to V2 */
  /** Add a guard; returns a new builder typed to the narrowed V2. */
  check<V2 extends V>(guard: Guard<V, V2>): NarrowingBuilder<V2> {
    // We store the guard and return a new builder typed to V2
    const next = new NarrowingBuilder<V2>(this.value as unknown as V2, [...this.guards, guard]);
    return next;
  }

  /** Execute callback if all guards pass; returns undefined on failure */
  /** Execute fn if all guards pass; returns undefined if an AssertError occurs. */
  run<T>(fn: (v: V) => T): T | undefined {
    let v: any = this.value;
    try {
      for (const g of this.guards) g(v);
      // At this point, TS knows v is V (narrowed by type-level check() chaining)
      return fn(v as V);
    } catch (e) {
      if (e instanceof AssertError) return undefined;
      throw e;
    }
  }

  /** Execute callback if all guards pass; otherwise return fallback */
  /** Execute fn if all guards pass; otherwise return fallback. */
  runOr<T>(fn: (v: V) => T, fallback: T): T {
    const r = this.run(fn);
    return r === undefined ? fallback : r;
  }
}

/** Start a typed narrowing chain */
/** Start a typed narrowing chain from an initial value. */
export function onValue<V>(value: V): NarrowingBuilder<V> {
  return new NarrowingBuilder<V>(value);
}

/** Start a typed narrowing chain with initial guards */
/**
 * Start a typed narrowing chain with one or more initial guards.
 * Overloads preserve compile-time inference through up to four guards.
 */
export function onConfirmedWith<V>(value: V, ...guards: Array<Guard<any, any>>): NarrowingBuilder<V>;
export function onConfirmedWith<V, V1 extends V>(value: V, g1: Guard<V, V1>): NarrowingBuilder<V1>;
export function onConfirmedWith<V, V1 extends V, V2 extends V1>(value: V, g1: Guard<V, V1>, g2: Guard<V1, V2>): NarrowingBuilder<V2>;
export function onConfirmedWith<V, V1 extends V, V2 extends V1, V3 extends V2>(value: V, g1: Guard<V, V1>, g2: Guard<V1, V2>, g3: Guard<V2, V3>): NarrowingBuilder<V3>;
export function onConfirmedWith<V, V1 extends V, V2 extends V1, V3 extends V2, V4 extends V3>(value: V, g1: Guard<V, V1>, g2: Guard<V1, V2>, g3: Guard<V2, V3>, g4: Guard<V3, V4>): NarrowingBuilder<V4>;
export function onConfirmedWith(value: any, ...guards: Array<Guard<any, any>>): any {
  // We cannot compute final type at runtime, but overloads preserve compile-time inference
  return new NarrowingBuilder<any>(value, guards);
}

// ===============
// Chainable assertions API (typed narrowing per step)
// ===============

/**
 * Fluent chain of assertions built on NarrowingBuilder.<br>
 * Each method adds a guard and returns a new chain with a narrowed type parameter.
 *
 * Use .run(cb) or .runOr(cb, fallback) to access the narrowed value.
 */
export class AssertChain<V> {
  constructor(private builder: NarrowingBuilder<V>) {}

  /** Add a custom guard */
  /** Add a custom guard to the chain. */
  check<V2 extends V>(guard: Guard<V, V2>): AssertChain<V2> {
    return new AssertChain<V2>(this.builder.check(guard));
  }

  // ---- Primitive/category guards ----
  /** Assert that the value is a string (alias: isString). */
  string(): AssertChain<V & string> {
    return new AssertChain(
      this.builder.check((x: V): asserts x is V & string => {
        assertString(x as unknown);
      })
    );
  }
  // Alias: isString()
  /** Alias for .string(). */
  isString(): AssertChain<V & string> {
    return this.string();
  }
  /** Assert that the value is a number (alias: isNumber). */
  number(): AssertChain<V & number> {
    return new AssertChain(
      this.builder.check((x: V): asserts x is V & number => {
        assertNumber(x as unknown);
      })
    );
  }
  // Alias: isNumber()
  /** Alias for .number(). */
  isNumber(): AssertChain<V & number> {
    return this.number();
  }
  /** Assert that the value is a boolean (alias: isBoolean). */
  boolean(): AssertChain<V & boolean> {
    return new AssertChain(
      this.builder.check((x: V): asserts x is V & boolean => {
        assertBoolean(x as unknown);
      })
    );
  }
  // Alias: isBoolean()
  /** Alias for .boolean(). */
  isBoolean(): AssertChain<V & boolean> {
    return this.boolean();
  }
  /** Assert that the value is an array (alias: isArray). */
  array(): AssertChain<V & unknown[]> {
    return new AssertChain(
      this.builder.check((x: V): asserts x is V & unknown[] => {
        assertArray(x as unknown);
      })
    );
  }
  // Alias: isArray()
  /** Alias for .array(). */
  isArray(): AssertChain<V & unknown[]> {
    return this.array();
  }
  /** Assert that the value is a plain object (alias: isObject). */
  object(): AssertChain<V & Record<string, unknown>> {
    return new AssertChain(
      this.builder.check((x: V): asserts x is V & Record<string, unknown> => {
        assertObject(x as unknown);
      })
    );
  }
  // Alias: isObject()
  /** Alias for .object(). */
  isObject(): AssertChain<V & Record<string, unknown>> {
    return this.object();
  }
  /** Assert that the value is a Date (alias: isDate). */
  date(): AssertChain<V & Date> {
    return new AssertChain(
      this.builder.check((x: V): asserts x is V & Date => {
        assertDate(x as unknown);
      })
    );
  }
  // Alias: isDate()
  /** Alias for .date(). */
  isDate(): AssertChain<V & Date> {
    return this.date();
  }

  // ---- Nullability ----
  /** Assert that the value is not undefined. */
  defined(): AssertChain<Exclude<V, undefined>> {
    return new AssertChain(
      this.builder.check((x: V): asserts x is Exclude<V, undefined> => {
        assertDefined(x as any);
      })
    );
  }
  /** Assert that the value is not null. */
  nonNull(): AssertChain<Exclude<V, null>> {
    return new AssertChain(
      this.builder.check((x: V): asserts x is Exclude<V, null> => {
        assertNonNull(x as any);
      })
    );
  }
  /** Assert that the value is neither null nor undefined. */
  present(): AssertChain<Exclude<V, null | undefined>> {
    return new AssertChain(
      this.builder.check((x: V): asserts x is Exclude<V, null | undefined> => {
        assertPresent(x as any);
      })
    );
  }
  /** Alias: value exists (not null/undefined). */
  exists(): AssertChain<Exclude<V, null | undefined>> {
    return this.present();
  }

  // ---- Instances ----
  /** Assert that the value is an instance of the given constructor. */
  instanceOf<C extends new (...args: any[]) => any>(ctor: C): AssertChain<V & InstanceType<C>> {
    return new AssertChain(
      this.builder.check((x: V): asserts x is V & InstanceType<C> => {
        assertInstanceOf(x as unknown, ctor);
      })
    );
  }

  // ---- String specifics ----
  /** Assert that the value is a non-empty string (alias: isNonEmptyString). */
  nonEmptyString(): AssertChain<V & string> {
    return new AssertChain(
      this.builder.check((x: V): asserts x is V & string => {
        assertNonEmptyString(x as unknown);
      })
    );
  }
  // Alias: isNonEmptyString()
  /** Alias for .nonEmptyString(). */
  isNonEmptyString(): AssertChain<V & string> {
    return this.nonEmptyString();
  }
  /** Assert that the string's length is >= n. */
  stringLengthAtLeast(n: number): AssertChain<V & string> {
    return new AssertChain(
      this.builder.check((x: V): asserts x is V & string => {
        assertStringLengthAtLeast(x as unknown, n);
      })
    );
  }
  /** Assert that the string's length is <= n. */
  stringLengthAtMost(n: number): AssertChain<V & string> {
    return new AssertChain(
      this.builder.check((x: V): asserts x is V & string => {
        assertStringLengthAtMost(x as unknown, n);
      })
    );
  }
  /** Assert that the string contains the given substring or matches regex. */
  stringContains(needle: string | RegExp): AssertChain<V & string> {
    return new AssertChain(
      this.builder.check((x: V): asserts x is V & string => {
        assertStringContains(x as unknown, needle);
      })
    );
  }

  // ---- Array specifics ----
  /** Assert that the value is a non-empty array (alias: isNonEmptyArray). */
  nonEmptyArray(): AssertChain<V & unknown[]> {
    return new AssertChain(
      this.builder.check((x: V): asserts x is V & unknown[] => {
        assertArrayNotEmpty(x as unknown);
      })
    );
  }
  // Alias: isNonEmptyArray()
  /** Alias for .nonEmptyArray(). */
  isNonEmptyArray(): AssertChain<V & unknown[]> {
    return this.nonEmptyArray();
  }
  /** Assert that the array length is exactly len. */
  arrayLength(len: number): AssertChain<V & unknown[]> {
    return new AssertChain(
      this.builder.check((x: V): asserts x is V & unknown[] => {
        assertArrayLength(x as unknown, len);
      })
    );
  }

  /** Execute callback if all guards pass */
  /** Execute fn if all chained guards pass; otherwise undefined. */
  run<T>(fn: (v: V) => T): T | undefined {
    return this.builder.run(fn);
  }
  /** Execute callback if all guards pass; otherwise fallback */
  /** Execute fn if all guards pass; otherwise return fallback. */
  runOr<T>(fn: (v: V) => T, fallback: T): T {
    return this.builder.runOr(fn, fallback);
  }
}

/** Start a chainable assertion flow */
/** Start an AssertChain over a value (alias exposed under assert.that). */
export function chain<V>(value: V): AssertChain<V> {
  return new AssertChain(onValue(value));
}

/** Start a chain with initial guards */
/** Start an AssertChain with initial guards applied. */
export function chainWith<V>(value: V, ...guards: Array<Guard<any, any>>): AssertChain<V> {
  return new AssertChain(new NarrowingBuilder(value, guards));
}

// ===============
// assert facade via namespace merging on function assert
// ===============

// Alias outer symbols to avoid shadowing inside namespace
const __chain = chain;
const __onValue = onValue;
const __onConfirmedWith = onConfirmedWith;
const __onConfirmed = onConfirmed;
const __assertRoute = assertRoute;
const __assertRouteAsync = assertRouteAsync;
const __confirm = confirm;
const __confirmWithError = confirmWithError;
const __confirmAll = confirmAll;
const __assertString = assertString;
const __assertNumber = assertNumber;
const __assertBoolean = assertBoolean;
const __assertArray = assertArray;
const __assertObject = assertObject;
const __assertDate = assertDate;
const __assertFunction = assertFunction;
const __assertPromiseLike = assertPromiseLike;
const __assertDefined = assertDefined;
const __assertNonNull = assertNonNull;
const __assertPresent = assertPresent;
const __assertExists = assertExists;
const __assertInstanceOf = assertInstanceOf;
const __assertNonEmptyString = assertNonEmptyString;
const __assertStringLengthAtLeast = assertStringLengthAtLeast;
const __assertStringLengthAtMost = assertStringLengthAtMost;
const __assertStringContains = assertStringContains;
const __assertArrayNotEmpty = assertArrayNotEmpty;
const __assertArrayLength = assertArrayLength;
const __assertElementHidden = assertElementHidden;
const __assertElementVisible = assertElementVisible;

/**
 * Facade namespace offering a concise API:
 * - assert.that(x) -> AssertChain
 * - assert.route / assert.routeAsync / assert.confirm*
 * - assert.isString/Number/...: assertion helpers identical to top-level exports
 */
export namespace assert {
  // chain starter
  export const that = __chain;
  export const onValue = __onValue;
  export const onConfirmedWith = __onConfirmedWith;
  export const onConfirmed = __onConfirmed;
  // routes
  export const route = __assertRoute;
  export const routeAsync = __assertRouteAsync;
  // confirm utils
  // Prefer builder-style under assert.confirm; boolean variant available as confirmBool
  export const confirm = __onConfirmedWith;
  export const confirmBool = __confirm;
  export const confirmWithError = __confirmWithError;
  export const confirmAll = __confirmAll;
  // assertions
  export const isString = __assertString;
  export const isNumber = __assertNumber;
  export const isBoolean = __assertBoolean;
  export const isArray = __assertArray;
  export const isObject = __assertObject;
  export const isDate = __assertDate;
  export const isFunction = __assertFunction;
  export const isPromiseLike = __assertPromiseLike;
  export const isDefined = __assertDefined;
  export const isNonNull = __assertNonNull;
  export const isPresent = __assertPresent;
  export const exists = __assertExists;
  export const instanceOf = __assertInstanceOf;
  export const isNonEmptyString = __assertNonEmptyString;
  export const stringLengthAtLeast = __assertStringLengthAtLeast;
  export const stringLengthAtMost = __assertStringLengthAtMost;
  export const stringContains = __assertStringContains;
  export const isNonEmptyArray = __assertArrayNotEmpty;
  export const arrayLength = __assertArrayLength;
  // Element visibility assertions (naming consistent with other is* assertion exports)
  export const isElementHidden = __assertElementHidden;
  export const isElementVisible = __assertElementVisible;
  // Back-compat alias: promise
  export const isPromise = __assertPromiseLike;
  // Array content helpers (ergonomic aliases)
  export const arrayOnlyNumbers = assertArrayOnlyHasNumbers;
  export const arrayOnlyStrings = assertArrayOnlyHasStrings;
  export const arrayAllTruthy = assertArrayEveryIsTruthy;
  export const arrayAllFalsy = assertArrayEveryIsFalsy;
}
(assert as any).instanceOf = <C extends new (...args: any[]) => any>(x: unknown, ctor: C, message?: string) => assertInstanceOf(x, ctor, message);
(assert as any).isNonEmptyString = (x: unknown, message?: string) => assertNonEmptyString(x, message);
(assert as any).stringLengthAtLeast = (x: unknown, n: number, message?: string) => assertStringLengthAtLeast(x, n, message);
(assert as any).stringLengthAtMost = (x: unknown, n: number, message?: string) => assertStringLengthAtMost(x, n, message);
(assert as any).stringContains = (x: unknown, needle: string | RegExp, message?: string) => assertStringContains(x, needle, message);
(assert as any).isNonEmptyArray = (x: unknown, message?: string) => assertArrayNotEmpty(x, message);
(assert as any).arrayLength = (x: unknown, len: number, message?: string) => assertArrayLength(x, len, message);

// ===============
// Unhandled AssertError trap installer (optional and environment-specific)
// ===============

export type AssertErrorTrapOptions = {
  onError?: (err: AssertError) => void;
  /** When true (or returns true), unhandled AssertErrors are suppressed (prevent process/page break). */
  suppress?: boolean | ((err: AssertError) => boolean);
};

/**
 * Install a best-effort global trap for unhandled AssertErrors in Node and browsers.
 * - In Node: attaches 'uncaughtException' and 'unhandledRejection' listeners that swallow AssertErrors when suppress=true.
 * - In browsers: attaches 'error' and 'unhandledrejection' listeners that prevent default for AssertErrors when suppress=true.
 *
 * IMPORTANT: Suppressing unhandled errors can leave your app in an unknown state. Prefer assertRoute/confirm at boundaries.
 * This helper is provided for last-resort safety nets and diagnostics.
 */
export function installAssertErrorTrap(options: AssertErrorTrapOptions = {}) {
  const { onError, suppress } = options;
  const shouldSuppress = (err: AssertError) => (typeof suppress === 'function' ? suppress(err) : !!suppress);

  const teardown: Array<() => void> = [];

  const isNodeEnv = typeof process !== 'undefined' && !!(process as any)?.on && !!(process as any)?.versions?.node;

  if (isNodeEnv && shouldSuppress(new AssertError('probe'))) {
    const node = process as any;
    const uncaught = (err: unknown) => {
      if (err instanceof AssertError) {
        try {
          onError?.(err);
        } catch {}
        // swallow to avoid process crash
        return;
      }
    };
    const unhandled = (reason: unknown) => {
      if (reason instanceof AssertError) {
        try {
          onError?.(reason);
        } catch {}
        // swallow
        return;
      }
    };
    node.on('uncaughtException', uncaught);
    node.on('unhandledRejection', unhandled);
    teardown.push(() => {
      try {
        node.off('uncaughtException', uncaught);
      } catch {}
      try {
        node.off('unhandledRejection', unhandled);
      } catch {}
    });
  }

  if (typeof window !== 'undefined' && shouldSuppress(new AssertError('probe'))) {
    const onErrorEvt = (e: Event) => {
      const err = (e as any).error as unknown;
      if (err instanceof AssertError) {
        try {
          onError?.(err);
        } catch {}
        (e as any).preventDefault?.();
      }
    };
    const onRejEvt = (e: PromiseRejectionEvent) => {
      const reason = e.reason as unknown;
      if (reason instanceof AssertError) {
        try {
          onError?.(reason);
        } catch {}
        e.preventDefault();
      }
    };
    window.addEventListener('error', onErrorEvt as any);
    window.addEventListener('unhandledrejection', onRejEvt as any);
    teardown.push(() => {
      try {
        window.removeEventListener('error', onErrorEvt as any);
      } catch {}
      try {
        window.removeEventListener('unhandledrejection', onRejEvt as any);
      } catch {}
    });
  }

  return {
    uninstall() {
      for (const t of teardown) t();
    },
  } as const;
}
