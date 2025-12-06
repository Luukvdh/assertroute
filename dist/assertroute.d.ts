/**
 * Minimal, hard-assert library with type-narrowing plus an "assertRoute" scope to catch
 * assertion failures and return a default value. This is intentionally simpler than the
 * flexible assume.ts chain: assertions always throw AssertError on failure, so TS can
 * confidently narrow types after calls.
 */
/**
 * Error thrown when an assertion fails.
 * - code: always "ASSERT_FAILED"
 * - info: optional extra context provided by the assertion site
 */
export declare class AssertError extends Error {
  readonly code: 'ASSERT_FAILED';
  readonly info?: Record<string, unknown>;
  constructor(message: string, info?: Record<string, unknown>);
}
/**
 * Set or clear a global onError handler for all assertion failures.
 * The handler is invoked right before an AssertError is thrown by `assert()` or any assert* helper.
 * Note: This does not suppress the throw; use assertRoute/confirm or installAssertErrorTrap to prevent breaks.
 */
export declare function setAssertErrorHandler(handler?: (err: AssertError) => void): void;
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
export declare function assert(condition: unknown, message?: string, info?: Record<string, unknown>): asserts condition;
/**
 * Returns true if x is a string.
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to string.
 */
export declare function isString(x: unknown): x is string;
/**
 * Returns true if x is a finite number.
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to number.
 */
type NonNullableNumber = number & NonNullable<unknown>;
export declare function isNumber(x: unknown): x is NonNullableNumber;
/**
 * Returns true if x is a finite number and not zero.
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to number.
 */
export declare function isNumberNotZero(x: unknown): x is NonNullableNumber;
/**
 * Returns true if x is a boolean.
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to boolean.
 */
export declare function isBoolean(x: unknown): x is boolean;
/**
 * Returns true if x is an array.
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to T[].
 */
export declare function isArray<T = unknown>(x: unknown): x is T[];
/**
 * Returns true if x is a plain object (not null, not array).
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to Record<string, unknown>.
 */
export declare function isObject(x: unknown): x is Record<string, unknown>;
/**
 * Returns true if x is thruthy as a boolean.
 */
export declare function isTruthy<T = unknown>(x: unknown): x is T;
export declare function isNotNil<T = unknown>(x: unknown): x is T;
/**
 * Returns true if x is a valid Date instance (non-NaN time).
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to Date.
 */
export declare function isDate(x: unknown): x is Date;
/** Returns true if x is a function. */
export declare function isFunction(x: unknown): x is (...args: any[]) => unknown;
/** Returns true if x is Promise-like (has a then method). */
export declare function isPromiseLike<T = unknown>(x: unknown): x is PromiseLike<T>;
/**
 * Returns true if x is not undefined.
 *
 * Narrowing:
 * - On a true branch, narrows from T | undefined to T.
 */
export declare function isDefined<T>(x: T | undefined): x is T;
/**
 * Returns true if x is not null.
 *
 * Narrowing:
 * - On a true branch, narrows from T | null to T.
 */
export declare function isNonNull<T>(x: T | null): x is T;
/**
 * Returns true if x is neither null nor undefined.
 *
 * Narrowing:
 * - On a true branch, narrows from T | null | undefined to T.
 */
export declare function isPresent<T>(x: T | null | undefined): x is T;
/** Alias: returns true if value "exists" (not null/undefined). */
export declare function exists<T>(x: T | null | undefined): x is T;
/**
 * Returns true if x is an instance of the provided constructor.
 *
 * Narrowing:
 * - On a true branch, narrows x to InstanceType<C>.
 */
export declare function isInstanceOf<C extends new (...args: any[]) => any>(x: unknown, ctor: C): x is InstanceType<C>;
/**
 * Returns input if instance validated, otherwise throws.
 *
 * Narrowing:
 * - On a true branch, narrows x to InstanceType<C>.
 */
export declare function expectedGuardBoolean<C extends new (...args: any[]) => any>(x: unknown, ctor: C, asst?: (v: InstanceType<C>) => boolean | void): x is InstanceType<C>;
export declare function expectedGuard<C extends new (...args: any[]) => any>(x: unknown, ctor: C, asst?: (v: InstanceType<C>) => boolean | void): x is InstanceType<C>;
export declare function assertExpected<C extends new (...args: any[]) => any>(x: unknown, ctor: C, asst?: (v: InstanceType<C>) => boolean | void): InstanceType<C>;
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
export declare function assertString(x: unknown, message?: string, info?: Record<string, unknown>): asserts x is string;
/**
 * Asserts that x is a finite number.
 *
 * Narrowing:
 * - On success, narrows x to number.
 */
export declare function assertNumber(x: unknown, message?: string, info?: Record<string, unknown>): asserts x is number;
/**
 * Asserts that x is a boolean.
 *
 * Narrowing:
 * - On success, narrows x to boolean.
 */
export declare function assertBoolean(x: unknown, message?: string, info?: Record<string, unknown>): asserts x is boolean;
/**
 * Asserts that x is an array.
 *
 * Narrowing:
 * - On success, narrows x to T[].
 */
export declare function assertArray<T = unknown>(x: unknown, message?: string, info?: Record<string, unknown>): asserts x is T[];
/**
 * Asserts that x is a plain object (not null, not array).
 *
 * Narrowing:
 * - On success, narrows x to Record<string, unknown>.
 */
export declare function assertObject(x: unknown, message?: string, info?: Record<string, unknown>): asserts x is Record<string, unknown>;
/**
 * Asserts that x is a valid Date instance (non-NaN time).
 *
 * Narrowing:
 * - On success, narrows x to Date.
 */
export declare function assertDate(x: unknown, message?: string, info?: Record<string, unknown>): asserts x is Date;
/**
 * Asserts that x is a function.
 *
 * Narrowing:
 * - On success, narrows x to (...args:any[]) => unknown.
 */
export declare function assertFunction(x: unknown, message?: string, info?: Record<string, unknown>): asserts x is (...args: any[]) => unknown;
/**
 * Asserts that x is Promise-like (has a then method).
 *
 * Narrowing:
 * - On success, narrows x to PromiseLike<unknown>.
 */
export declare function assertPromiseLike<T = unknown>(x: unknown, message?: string, info?: Record<string, unknown>): asserts x is PromiseLike<T>;
/**
 * Asserts that x is not undefined.
 *
 * Narrowing:
 * - On success, narrows from T | undefined to T.
 */
export declare function assertDefined<T>(x: T | undefined, message?: string, info?: Record<string, unknown>): asserts x is T;
/**
 * Asserts that x is not null.
 *
 * Narrowing:
 * - On success, narrows from T | null to T.
 */
export declare function assertNonNull<T>(x: T | null, message?: string, info?: Record<string, unknown>): asserts x is T;
/**
 * Asserts that x is neither null nor undefined.
 *
 * Narrowing:
 * - On success, narrows from T | null | undefined to T.
 */
export declare function assertPresent<T>(x: T | null | undefined, message?: string, info?: Record<string, unknown>): asserts x is T;
/**
 * Asserts that x is neither not converted to false boolean (truthy, falsey).
 *
 * Narrowing:
 * - On success, narrows from T | null | undefined to T.
 */
export declare function assertTruthy<T>(x: T | null | undefined, message?: string, info?: Record<string, unknown>): asserts x is T;
/** Alias: asserts that value exists (not null/undefined). */
export declare function assertExists<T>(x: T | null | undefined, message?: string, info?: Record<string, unknown>): asserts x is T;
/**
 * Asserts that x is an instance of ctor.
 *
 * Narrowing:
 * - On success, narrows x to InstanceType<C>.
 */
export declare function assertInstanceOf<C extends new (...args: any[]) => any>(x: unknown, ctor: C, message?: string, info?: Record<string, unknown>): asserts x is InstanceType<C>;
/**
 * Ensures x is a string and returns it.
 *
 * Narrowing/Return:
 * - Throws on failure; returns string on success.
 */
export declare function expectString<T>(x: T, message?: string): string;
/**
 * Ensures x is a number and returns it.
 */
export declare function expectNumber<T>(x: T, message?: string): number;
/**
 * Ensures x is a HTMLElement and returns it.
 */
export declare function expectElement<T>(x: T, message?: string): HTMLElement;
/**
 * Ensures x is a boolean and returns it.
 */
export declare function expectBoolean<T>(x: T, message?: string): boolean;
/**
 * Ensures x is an array and returns it typed as T[].
 */
export declare function expectArray<T = unknown>(x: unknown, message?: string): T[];
/**
 * Ensures x is a plain object and returns it.
 */
export declare function expectObject(x: unknown, message?: string): Record<string, unknown>;
/**
 * Ensures x is a Date and returns it.
 */
export declare function expectDate(x: unknown, message?: string): Date;
/**
 * Options controlling how assertRoute/assertRouteAsync handle errors.
 * - onError: callback invoked for caught AssertError (and optionally other errors)
 * - catchNonAssertErrors: when true, also catch and convert non-AssertError errors to fallback
 */
export type AssertRouteOptions = {
  onError?: (err: AssertError) => void;
  catchNonAssertErrors?: boolean;
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
export declare function assertRoute<T>(fallback: T, fn: () => T, options?: AssertRouteOptions): T;
export declare function assertRoute<T, A extends any[]>(fallback: T, fn: (...args: A) => T, options?: AssertRouteOptions): (...args: A) => T;
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
export declare function routeWith<T>(fallback: T, options?: AssertRouteOptions): <A extends any[]>(fn: (...args: A) => T) => T;
/**
 * Async variant of assertRoute.
 * - If `fn.length === 0`, executes immediately and returns Promise<T>.
 * - Otherwise, returns an async wrapper (...args) => Promise<T>.
 *
 * @param fallback Value returned when an AssertError (or optionally other errors) is thrown
 * @param fn Async function to execute
 * @param options Control catching/logging behavior
 */
export declare function assertRouteAsync<T>(fallback: T, fn: () => Promise<T>, options?: AssertRouteOptions): Promise<T>;
export declare function assertRouteAsync<T, A extends any[]>(fallback: T, fn: (...args: A) => Promise<T>, options?: AssertRouteOptions): (...args: A) => Promise<T>;
/**
 * Asserts that x is a string with length > 0.
 *
 * Narrowing:
 * - On success, narrows x to string.
 */
export declare function assertNonEmptyString(x: unknown, message?: string): asserts x is string;
/**
 * Asserts that x is an array with length > 0.
 *
 * Narrowing:
 * - On success, narrows x to T[].
 */
export declare function assertArrayNotEmpty<T = unknown>(x: unknown, message?: string): asserts x is T[];
export declare function isNonEmptyString(x: unknown): x is string;
export declare function isNonEmptyArray<T = unknown>(x: unknown): x is T[];
export declare function objectHasNoTruthyValues(x: unknown, message?: string, info?: Record<string, unknown>): boolean;
export declare function objectHasNoFalseyValues(x: unknown, message?: string, info?: Record<string, unknown>): boolean;
export declare function isNonEmptyRecord(x: unknown): x is Record<string, unknown>;
export declare function isNonZeroNumber(x: unknown): x is number;
/** Composite guard: narrows to a union of non-empty primitives/structures. */
export type NonEmpty = string | any[] | Record<string, unknown> | number | boolean;
export declare function isNonEmpty(x: unknown): x is NonEmpty;
/** Re-export: consumers can import { AssertionError } name for AssertError. */
export type { AssertError as AssertionError };
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
/** Asserts that x is a string with exact length `len`. */
export declare function assertStringLength(x: unknown, len: number, message?: string): asserts x is string;
/** Asserts that x is a string with length >= `n`. */
export declare function assertStringLengthAtLeast(x: unknown, n: number, message?: string): asserts x is string;
/** Asserts that x is a string with length <= `n`. */
export declare function assertStringLengthAtMost(x: unknown, n: number, message?: string): asserts x is string;
/** Asserts that x is a string with min/max inclusive bounds. */
export declare function assertStringLengthBetween(x: unknown, min: number, max: number, message?: string): asserts x is string;
/** Asserts that x is a string containing substring or matching regex. */
export declare function assertStringContains(x: unknown, needle: string | RegExp, message?: string): asserts x is string;
/** Asserts that x is a string starting with the given prefix. */
export declare function assertStringStartsWith(x: unknown, prefix: string, message?: string): asserts x is string;
/** Asserts that x is a string ending with the given suffix. */
export declare function assertStringEndsWith(x: unknown, suffix: string, message?: string): asserts x is string;
/** Asserts that x is a string that matches the regex. */
export declare function assertStringMatches(x: unknown, re: RegExp, message?: string): asserts x is string;
/** Asserts that x (string) equals `expected` ignoring case. */
export declare function assertStringEqualsIgnoreCase(x: unknown, expected: string, message?: string): asserts x is string;
/** Asserts that x is a string including any of the provided substrings. */
export declare function assertStringIncludesAny(x: unknown, ...needles: string[]): asserts x is string;
/** Asserts that x is a string including all of the provided substrings. */
export declare function assertStringIncludesAll(x: unknown, ...needles: string[]): asserts x is string;
/** Asserts that x is a string containing valid JSON. */
export declare function assertStringIsJSON(x: unknown, message?: string): asserts x is string;
/** Asserts that x is a string whose trimmed length > 0. */
export declare function assertStringTrimmedNotEmpty(x: unknown, message?: string): asserts x is string;
/** Asserts that x is a number strictly greater than n. */
export declare function assertNumberGreaterThan(x: unknown, n: number, message?: string): asserts x is number;
/** Asserts that x is a number >= n. */
export declare function assertNumberGreaterOrEqual(x: unknown, n: number, message?: string): asserts x is number;
/** Asserts that x is a number strictly less than n. */
export declare function assertNumberLessThan(x: unknown, n: number, message?: string): asserts x is number;
/** Asserts that x is a number <= n. */
export declare function assertNumberLessOrEqual(x: unknown, n: number, message?: string): asserts x is number;
/** Asserts that x is a number within [min, max]. */
export declare function assertNumberBetween(x: unknown, min: number, max: number, message?: string): asserts x is number;
/** Asserts that x is an array with exact length `len`. */
export declare function assertArrayLength<T = unknown>(x: unknown, len: number, message?: string): asserts x is T[];
/** Asserts that x is an array containing at least one of the provided items (by string form). */
export declare function assertArrayHasAnyOf<T = unknown>(x: unknown, items: string[], message?: string): asserts x is T[];
/** Asserts that x is an array containing all the provided items (by string form). */
export declare function assertArrayHasEveryOf<T = unknown>(x: unknown, items: string[], message?: string): asserts x is T[];
/** Asserts that x is an array and element at index i is a boolean. */
export declare function assertArrayItemIsBoolean<T = unknown>(x: unknown, i: number, message?: string): asserts x is T[];
/** Asserts that x is an array and element at index i is a string. */
export declare function assertArrayItemIsString<T = unknown>(x: unknown, i: number, message?: string): asserts x is T[];
/** Asserts that x is an array and element at index i is a number. */
export declare function assertArrayItemIsNumber<T = unknown>(x: unknown, i: number, message?: string): asserts x is T[];
/** Asserts that x is an array and element at index i is a plain object. */
export declare function assertArrayItemIsObject<T = unknown>(x: unknown, i: number, message?: string): asserts x is T[];
/** Asserts that x is an array with at least one item whose string form includes `needle`. */
export declare function assertArrayIncludesString<T = unknown>(x: unknown, needle: string, message?: string): asserts x is T[];
/** Asserts that x is an array including the exact number `needle`. */
export declare function assertArrayIncludesNumber<T = unknown>(x: unknown, needle: number, message?: string): asserts x is T[];
/** Asserts that x is an array including an object deep-equal to `needle`. */
export declare function assertArrayIncludesObject<T = unknown>(x: unknown, needle: Record<string, unknown>, message?: string): asserts x is T[];
/** Asserts that x is an array whose every element is a plain object. */
export declare function assertArrayOnlyHasObjects<T = unknown>(x: unknown, message?: string): asserts x is Record<string, unknown>[];
/** Asserts that x is an array whose every element is a string. */
export declare function assertArrayOnlyHasStrings<T = unknown>(x: unknown, message?: string): asserts x is string[];
/** Asserts that x is an array whose every element is a number. */
export declare function assertArrayOnlyHasNumbers<T = unknown>(x: unknown, message?: string): asserts x is number[];
/** Asserts that x is an array and every element is falsy. */
export declare function assertArrayEveryIsFalsy<T = unknown>(x: unknown, message?: string): asserts x is T[];
/** Asserts that x is an array and every element is truthy. */
export declare function assertArrayEveryIsTruthy<T = unknown>(x: unknown, message?: string): asserts x is T[];
/** Asserts that x is an array including an element for which predicate returns true. */
export declare function assertArrayIncludesCondition<T = unknown>(x: unknown, predicate: (item: unknown) => boolean, message?: string): asserts x is T[];
/** Asserts that obj is a plain object containing the provided key. */
export declare function assertHasKey<O extends Record<string, unknown>, K extends string>(obj: unknown, key: K, message?: string): asserts obj is O & Record<K, unknown>;
/** Asserts that obj is a plain object containing all provided keys. */
export declare function assertHasKeys<O extends Record<string, unknown>, const K extends readonly string[]>(
  obj: unknown,
  ...keys: K
): asserts obj is O & {
  [P in K[number]]: unknown;
};
/** Asserts that obj[key] strictly equals expected. */
export declare function assertKeyEquals<O extends Record<string, unknown>, K extends keyof O>(obj: unknown, key: K, expected: unknown, message?: string): asserts obj is O;
/** Asserts that obj has exactly the same set of keys as `expected`. */
export declare function assertSameKeys(obj: unknown, expected: Record<string, unknown>, message?: string): asserts obj is Record<string, unknown>;
/** Asserts that every value in obj is falsy. */
export declare function assertAllKeysFalsy(obj: unknown, message?: string): asserts obj is Record<string, unknown>;
/** Asserts that every value in obj is neither null nor undefined. */
export declare function assertAllKeysSet(obj: unknown, message?: string): asserts obj is Record<string, unknown>;
/** Asserts that at least one value in obj is null. */
export declare function assertAnyKeyNull(obj: unknown, message?: string): asserts obj is Record<string, unknown>;
/** Returns true if x is a DOM Element (when running in an environment with DOM). */
export declare function isElement(x: unknown): x is Element;
/** Asserts that x is a DOM Element. */
export declare function assertElement(x: unknown, message?: string): asserts x is Element;
/** Asserts that the element has at least one child node/element. */
export declare function assertElementHasChildren(x: unknown, message?: string): asserts x is Element;
/** Asserts that the element has at least one child element. */
export declare function assertElementHasChild(x: unknown, message?: string): asserts x is Element;
/** Asserts that the element has a child matching the CSS selector. */
export declare function assertElementHasChildMatching(x: unknown, selector: string, message?: string): asserts x is Element;
/** Asserts that the element has a descendant matching the CSS selector. */
export declare function assertElementHasDescendant(x: unknown, selector: string, message?: string): asserts x is Element;
/** Asserts that the element has the given attribute. */
export declare function assertElementHasAttribute(x: unknown, name: string, message?: string): asserts x is Element;
/** Asserts that the element's attribute equals the expected value. */
export declare function assertElementAttributeEquals(x: unknown, name: string, expected: string, message?: string): asserts x is Element;
/** Returns true if the Element is hidden via display:none or visibility:hidden (DOM environments). */
export declare function isElementHidden(x: unknown): x is Element;
/** Returns true if the Element is visible (i.e., not hidden by display/visibility). */
export declare function isElementVisible(x: unknown): x is Element;
/** Asserts that x is an Element currently hidden by CSS (display or visibility). */
export declare function assertElementHidden(x: unknown, message?: string): asserts x is Element;
/** Asserts that x is an Element currently visible (not hidden by display/visibility). */
export declare function assertElementVisible(x: unknown, message?: string): asserts x is Element;
/** Asserts that x is a Date earlier than `than`. */
export declare function assertDateEarlier(x: unknown, than: Date, message?: string): asserts x is Date;
/** Asserts that x is a Date later than `than`. */
export declare function assertDateLater(x: unknown, than: Date, message?: string): asserts x is Date;
/** Asserts that x is a Date within [min, max]. */
export declare function assertDateBetween(x: unknown, min: Date, max: Date, message?: string): asserts x is Date;
/** Asserts that x is a Date whose full year equals `year`. */
export declare function assertDateYear(x: unknown, year: number, message?: string): asserts x is Date;
/** Asserts that x is strictly true. */
export declare function assertTrue(x: unknown, message?: string): asserts x is true;
/** Asserts that x is strictly false. */
export declare function assertFalse(x: unknown, message?: string): asserts x is false;
/** Asserts that x is strictly null. */
export declare function assertNull(x: unknown, message?: string): asserts x is null;
/** Asserts that x is strictly undefined. */
export declare function assertUndefined(x: unknown, message?: string): asserts x is undefined;
/** Asserts that x is a number not equal to 0. */
export declare function assertNumberNotZero(x: unknown, message?: string): asserts x is number;
/** Asserts that x is a number strictly greater than 0. */
export declare function assertNumberPositive(x: unknown, message?: string): asserts x is number;
/** Asserts that x is a number >= 0. */
export declare function assertNumberNonNegative(x: unknown, message?: string): asserts x is number;
/** Asserts that x is a number strictly less than 0. */
export declare function assertNumberNegative(x: unknown, message?: string): asserts x is number;
/** Asserts that x is a number <= 0. */
export declare function assertNumberNonPositive(x: unknown, message?: string): asserts x is number;
/** Asserts that x is an integer (Number.isInteger). */
export declare function assertNumberInteger(x: unknown, message?: string): asserts x is number;
/** Asserts that x is a safe integer (Number.isSafeInteger). */
export declare function assertNumberSafeInteger(x: unknown, message?: string): asserts x is number;
/** Asserts that x is a number within ±epsilon of expected. */
export declare function assertNumberApproxEquals(x: unknown, expected: number, epsilon?: number, message?: string): asserts x is number;
/** Alias for assertNumberNotZero. */
export declare const assertIsNotZero: typeof assertNumberNotZero;
/** Alias for assertNumberPositive. */
export declare const assertIsPositive: typeof assertNumberPositive;
/** Alias for assertNumberNegative. */
export declare const assertIsNegative: typeof assertNumberNegative;
/** Asserts that x is an array of objects and each object contains `key`. */
export declare function assertObjectArrayAllHaveKey<T = Record<string, unknown>>(x: unknown, key: string, message?: string): asserts x is T[];
/** Asserts that x is an array of objects and each object contains all provided keys. */
export declare function assertObjectArrayEveryHasKeys<T = Record<string, unknown>>(x: unknown, ...keys: string[]): asserts x is T[];
/** Asserts that x is strictly equal to one of the provided primitive options. */
export declare function assertOneOfPrimitive<T extends string | number | boolean>(x: unknown, options: readonly T[], message?: string): asserts x is T;
/** Alias for assertArrayNotEmpty. */
export declare const assertIsArrayNotEmpty: typeof assertArrayNotEmpty;
/** Options for assertOnFail/onFail wrappers. */
export type AssertOnFailOptions = {
  catchNonAssertErrors?: boolean;
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
export declare function assertOnFail<T>(fn: () => T, onFail: (err: AssertError) => T, options?: AssertOnFailOptions): T;
/** Fluent helper to compose on-fail behavior */
/**
 * Fluent helper to compose on-fail behavior for a function that may assert.
 *
 * Usage:
 * onFail(() => risky()).return(fallback) or .run(handler)
 */
export declare function onFail<T>(fn: () => T): {
  readonly return: (fallback: T, options?: AssertOnFailOptions) => T;
  readonly run: (handler: (err: AssertError) => T, options?: AssertOnFailOptions) => T;
};
export declare function ifFails<T>(
  fallback: T,
  logFail?: boolean
): {
  readonly on: (fn: (...args: any[]) => T) => T;
  readonly return: T;
};
export declare function _fn<Args extends any[], R>(defaultValue: R, impl: (...args: Args) => R): (...args: Args) => R;
/** Asserts referential/primitive equality (===). */
export declare function assertEquals<T>(actual: T, expected: T, message?: string): void;
/** Asserts non-equality (!==). */
export declare function assertNotEquals<T>(actual: T, expected: T, message?: string): void;
/** Asserts deep equality using a simple structural comparison (arrays, objects, dates). */
export declare function assertDeepEquals<T>(actual: T, expected: T, message?: string): void;
/** Asserts that x is a plain object with at least one own key. */
export declare function assertNonEmptyRecord(x: unknown, message?: string): asserts x is Record<string, unknown>;
/** Asserts that `obj` contains all keys/values present in `subset` (deep-equality per key). */
export declare function assertSubset(obj: unknown, subset: Record<string, unknown>, message?: string): asserts obj is Record<string, unknown>;
/** Asserts that `obj` has a defined path (e.g., 'a.b[0].c' via array form). */
export declare function assertHasPath(obj: unknown, path: string | Array<string | number>, message?: string): asserts obj is Record<string, unknown>;
/** Asserts that m is a Map containing the given key. */
export declare function assertMapHasKey<K, V>(m: unknown, key: K, message?: string): asserts m is Map<K, V>;
/** Asserts that s is a Set containing the given value. */
export declare function assertSetHasValue<T>(s: unknown, value: T, message?: string): asserts s is Set<T>;
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
export declare function assertMatchesSchema(x: unknown, schema: SimpleSchema, message?: string): asserts x is Record<string, unknown>;
/** Asserts that x (string) equals expected after canonicalization. */
export declare function assertStringEqualsCanonical(x: unknown, expected: string, message?: string): asserts x is string;
/** Asserts that x (string) contains needle after canonicalization. */
export declare function assertStringContainsCanonical(x: unknown, needle: string, message?: string): asserts x is string;
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
export declare function confirm(...assertions: (() => void)[]): boolean;
/** Like confirm(), but returns error detail of the first failing assertion */
/** Like confirm(), but returns the first AssertError encountered for diagnostics. */
export declare function confirmWithError(...assertions: (() => void)[]):
  | {
      ok: true;
    }
  | {
      ok: false;
      error: AssertError;
    };
/** Run all assertions and aggregate all AssertErrors (continues after failures) */
/** Runs all assertions and aggregates all AssertErrors (continues after failures). */
export declare function confirmAll(...assertions: (() => void)[]): {
  ok: boolean;
  errors: AssertError[];
};
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
export declare class ConfirmationBuilder {
  private value;
  private assertions;
  constructor(value: unknown, initialAssertions?: (() => void)[]);
  /**
   * Add an assertion to check
   */
  /** Add an assertion to the builder (non-throwing check first, then re-assert for TS narrowing in callbacks). */
  check(assertion: () => void): this;
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
  run<T>(callback: (value: unknown) => T): T | undefined;
  /**
   * Execute the callback if all assertions pass, with a fallback value.
   * @param callback - Function to execute if all assertions pass
   * @param fallback - Value to return if assertions fail
   * @returns The result of the callback, or the fallback value
   */
  /** Execute callback if checks pass, otherwise return the provided fallback value. */
  runOr<T>(callback: (value: unknown) => T, fallback: T): T;
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
export declare function onConfirmed(value: unknown): ConfirmationBuilder;
export declare function onConfirmed(value: unknown, ...assertions: (() => void)[]): ConfirmationBuilder;
/** A guard function that narrows V to V2 by throwing on failure. */
export type Guard<V, V2 extends V = V> = (x: V) => asserts x is V2;
/**
 * Typed narrowing builder that carries compile-time narrowing through chained guards.
 *
 * Example:
 * onValue(x).check(assertDefined).check(assertString).run(s => s.toUpperCase())
 */
export declare class NarrowingBuilder<V> {
  private value;
  private guards;
  constructor(value: V, initialGuards?: Array<Guard<any, any>>);
  /** Add a guard that narrows V to V2 */
  /** Add a guard; returns a new builder typed to the narrowed V2. */
  check<V2 extends V>(guard: Guard<V, V2>): NarrowingBuilder<V2>;
  /** Execute callback if all guards pass; returns undefined on failure */
  /** Execute fn if all guards pass; returns undefined if an AssertError occurs. */
  run<T>(fn: (v: V) => T): T | undefined;
  /** Execute callback if all guards pass; otherwise return fallback */
  /** Execute fn if all guards pass; otherwise return fallback. */
  runOr<T>(fn: (v: V) => T, fallback: T): T;
}
/** Start a typed narrowing chain */
/** Start a typed narrowing chain from an initial value. */
export declare function onValue<V>(value: V): NarrowingBuilder<V>;
/** Start a typed narrowing chain with initial guards */
/**
 * Start a typed narrowing chain with one or more initial guards.
 * Overloads preserve compile-time inference through up to four guards.
 */
export declare function onConfirmedWith<V>(value: V, ...guards: Array<Guard<any, any>>): NarrowingBuilder<V>;
export declare function onConfirmedWith<V, V1 extends V>(value: V, g1: Guard<V, V1>): NarrowingBuilder<V1>;
export declare function onConfirmedWith<V, V1 extends V, V2 extends V1>(value: V, g1: Guard<V, V1>, g2: Guard<V1, V2>): NarrowingBuilder<V2>;
export declare function onConfirmedWith<V, V1 extends V, V2 extends V1, V3 extends V2>(value: V, g1: Guard<V, V1>, g2: Guard<V1, V2>, g3: Guard<V2, V3>): NarrowingBuilder<V3>;
export declare function onConfirmedWith<V, V1 extends V, V2 extends V1, V3 extends V2, V4 extends V3>(value: V, g1: Guard<V, V1>, g2: Guard<V1, V2>, g3: Guard<V2, V3>, g4: Guard<V3, V4>): NarrowingBuilder<V4>;
/**
 * Fluent chain of assertions built on NarrowingBuilder.<br>
 * Each method adds a guard and returns a new chain with a narrowed type parameter.
 *
 * Use .run(cb) or .runOr(cb, fallback) to access the narrowed value.
 */
export declare class AssertChain<V> {
  private builder;
  constructor(builder: NarrowingBuilder<V>);
  /** Add a custom guard */
  /** Add a custom guard to the chain. */
  check<V2 extends V>(guard: Guard<V, V2>): AssertChain<V2>;
  /** Assert that the value is a string (alias: isString). */
  string(): AssertChain<V & string>;
  /** Alias for .string(). */
  isString(): AssertChain<V & string>;
  /** Assert that the value is a number (alias: isNumber). */
  number(): AssertChain<V & number>;
  /** Alias for .number(). */
  isNumber(): AssertChain<V & number>;
  /** Assert that the value is a boolean (alias: isBoolean). */
  boolean(): AssertChain<V & boolean>;
  /** Alias for .boolean(). */
  isBoolean(): AssertChain<V & boolean>;
  /** Assert that the value is an array (alias: isArray). */
  array(): AssertChain<V & unknown[]>;
  /** Alias for .array(). */
  isArray(): AssertChain<V & unknown[]>;
  /** Assert that the value is a plain object (alias: isObject). */
  object(): AssertChain<V & Record<string, unknown>>;
  /** Alias for .object(). */
  isObject(): AssertChain<V & Record<string, unknown>>;
  /** Assert that the value is a Date (alias: isDate). */
  date(): AssertChain<V & Date>;
  /** Alias for .date(). */
  isDate(): AssertChain<V & Date>;
  /** Assert that the value is not undefined. */
  defined(): AssertChain<Exclude<V, undefined>>;
  /** Assert that the value is not null. */
  nonNull(): AssertChain<Exclude<V, null>>;
  /** Assert that the value is neither null nor undefined. */
  present(): AssertChain<Exclude<V, null | undefined>>;
  /** Alias: value exists (not null/undefined). */
  exists(): AssertChain<Exclude<V, null | undefined>>;
  /** Assert that the value is an instance of the given constructor. */
  instanceOf<C extends new (...args: any[]) => any>(ctor: C): AssertChain<V & InstanceType<C>>;
  /** Assert that the value is a non-empty string (alias: isNonEmptyString). */
  nonEmptyString(): AssertChain<V & string>;
  /** Alias for .nonEmptyString(). */
  isNonEmptyString(): AssertChain<V & string>;
  /** Assert that the string's length is >= n. */
  stringLengthAtLeast(n: number): AssertChain<V & string>;
  /** Assert that the string's length is <= n. */
  stringLengthAtMost(n: number): AssertChain<V & string>;
  /** Assert that the string contains the given substring or matches regex. */
  stringContains(needle: string | RegExp): AssertChain<V & string>;
  /** Assert that the value is a non-empty array (alias: isNonEmptyArray). */
  nonEmptyArray(): AssertChain<V & unknown[]>;
  /** Alias for .nonEmptyArray(). */
  isNonEmptyArray(): AssertChain<V & unknown[]>;
  /** Assert that the array length is exactly len. */
  arrayLength(len: number): AssertChain<V & unknown[]>;
  /** Execute callback if all guards pass */
  /** Execute fn if all chained guards pass; otherwise undefined. */
  run<T>(fn: (v: V) => T): T | undefined;
  /** Execute callback if all guards pass; otherwise fallback */
  /** Execute fn if all guards pass; otherwise return fallback. */
  runOr<T>(fn: (v: V) => T, fallback: T): T;
}
/** Start a chainable assertion flow */
/** Start an AssertChain over a value (alias exposed under assert.that). */
export declare function chain<V>(value: V): AssertChain<V>;
/** Start a chain with initial guards */
/** Start an AssertChain with initial guards applied. */
export declare function chainWith<V>(value: V, ...guards: Array<Guard<any, any>>): AssertChain<V>;
/**
 * Facade namespace offering a concise API:
 * - assert.that(x) -> AssertChain
 * - assert.route / assert.routeAsync / assert.confirm*
 * - assert.isString/Number/...: assertion helpers identical to top-level exports
 */
export declare namespace assert {
  const that: typeof chain;
  const onValue: typeof import('./assertroute').onValue;
  const onConfirmedWith: typeof import('./assertroute').onConfirmedWith;
  const onConfirmed: typeof import('./assertroute').onConfirmed;
  const route: typeof assertRoute;
  const routeAsync: typeof assertRouteAsync;
  const confirm: typeof import('./assertroute').onConfirmedWith;
  const confirmBool: typeof import('./assertroute').confirm;
  const confirmWithError: typeof import('./assertroute').confirmWithError;
  const confirmAll: typeof import('./assertroute').confirmAll;
  const isString: typeof assertString;
  const isNumber: typeof assertNumber;
  const isBoolean: typeof assertBoolean;
  const isArray: typeof assertArray;
  const isObject: typeof assertObject;
  const isDate: typeof assertDate;
  const isFunction: typeof assertFunction;
  const isPromiseLike: typeof assertPromiseLike;
  const isDefined: typeof assertDefined;
  const isNonNull: typeof assertNonNull;
  const isPresent: typeof assertPresent;
  const exists: typeof assertExists;
  const instanceOf: typeof assertInstanceOf;
  const isNonEmptyString: typeof assertNonEmptyString;
  const stringLengthAtLeast: typeof assertStringLengthAtLeast;
  const stringLengthAtMost: typeof assertStringLengthAtMost;
  const stringContains: typeof assertStringContains;
  const isNonEmptyArray: typeof assertArrayNotEmpty;
  const arrayLength: typeof assertArrayLength;
  const isElementHidden: typeof assertElementHidden;
  const isElementVisible: typeof assertElementVisible;
  const isPromise: typeof assertPromiseLike;
  const arrayOnlyNumbers: typeof assertArrayOnlyHasNumbers;
  const arrayOnlyStrings: typeof assertArrayOnlyHasStrings;
  const arrayAllTruthy: typeof assertArrayEveryIsTruthy;
  const arrayAllFalsy: typeof assertArrayEveryIsFalsy;
}
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
export declare function installAssertErrorTrap(options?: AssertErrorTrapOptions): {
  readonly uninstall: () => void;
};
//# sourceMappingURL=assertroute.d.ts.map
