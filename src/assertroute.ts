// path: src/assertroute.ts
/* Minimal docs, focus op narrowing-veiligheid. */

function getCallerName(stackOffset = 3): string | undefined {
  const stack = new Error().stack;
  if (!stack) return undefined;
  const match = stack.split('\n')[stackOffset]?.match(/at\s+([\w.$<>\[\]]+)/);
  return match?.[1];
}

function summarizeValue(v: unknown): string {
  const t = typeof v;
  if (v === null) return 'null';
  if (Array.isArray(v)) {
    const sample = v
      .slice(0, 3)
      .map((x) => JSON.stringify(x))
      .join(', ');
    return `array(len=${v.length}, sample=[${sample}${v.length > 3 ? ', …' : ''}])`;
  }
  if (t === 'object') {
    const keys = Object.keys(v as object).slice(0, 3);
    return `object(keys=[${keys.join(', ')}${keys.length > 3 ? ', …' : ''}])`;
  }
  if (t === 'string') {
    return `string(len=${(v as string).length}, sample="${(v as string).slice(0, 12)}${(v as string).length > 12 ? '…' : ''}")`;
  }
  return `${t}(${String(v)})`;
}

export class AssertError extends Error {
  readonly code = 'ASSERT_FAILED' as const;
  readonly info?: Record<string, unknown>;

  constructor(message: string, info?: Record<string, unknown>, cause?: unknown) {
    const caller = getCallerName(3);
    const typeSummary = info?.value !== undefined ? summarizeValue(info.value) : undefined;
    const base = message || `${caller ?? 'assert'} failed`;
    const fullMsg = typeSummary ? `${base} (got: ${typeSummary})` : base;

    // @ts-ignore
    super(fullMsg, cause ? { cause } : undefined);
    this.name = 'AssertError';
    this.info = { ...info, caller };
    if (cause && !(this as any).cause) (this as any).cause = cause;
  }
}
/* ---------------- internals ---------------- */
type OnError = (err: AssertError) => void;

function toAssertError(e: unknown): AssertError {
  if (e instanceof AssertError) return e;
  const err = e instanceof Error ? e : new Error(String(e));
  return new AssertError(err.message, { cause: err } as any, err);
}

export function assert(condition: unknown, message = 'Assertion failed', info?: Record<string, unknown>): asserts condition {
  if (!condition) throw new AssertError(message, info);
}

function handleError<T>(e: unknown, onError?: OnError, catchNonAssertErrors?: boolean, fallback?: T): T {
  if (e instanceof AssertError) {
    onError?.(e);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return fallback!;
  }
  if (catchNonAssertErrors) {
    const ae = toAssertError(e);
    onError?.(ae);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return fallback!;
  }
  throw e;
}

/* ---------------- routing ---------------- */
export type AssertRouteOptions = {
  onError?: OnError;
  catchNonAssertErrors?: boolean;
  forceWrap?: boolean;
  forceInvoke?: boolean;
};

function wrapSync<T, A extends any[]>(fallback: T, fn: (...args: A) => T, { onError, catchNonAssertErrors = false }: AssertRouteOptions = {}): (...args: A) => T {
  return ((...args: A) => {
    try {
      return fn(...args);
    } catch (e) {
      return handleError<T>(e, onError, catchNonAssertErrors, fallback);
    }
  }) as (...args: A) => T;
}

function wrapAsync<T, A extends any[]>(fallback: T, fn: (...args: A) => Promise<T>, { onError, catchNonAssertErrors = false }: AssertRouteOptions = {}): (...args: A) => Promise<T> {
  return (async (...args: A) => {
    try {
      return await fn(...args);
    } catch (e) {
      return handleError<T>(e, onError, catchNonAssertErrors, fallback);
    }
  }) as (...args: A) => Promise<T>;
}

type SafeFn<A extends any[], T> = (...args: A) => T;

/* ---------------- sync variant ---------------- */

export function assertRoute<T, A extends any[]>(fallback: T, fn: (...args: A) => T, options?: AssertRouteOptions, ...args: A): T;

export function assertRoute<T, A extends any[]>(fallback: T, fn: (...args: A) => T, options?: AssertRouteOptions): (...args: A) => T;

export function assertRoute<A extends any[]>(fn: (...args: A) => void, options?: AssertRouteOptions): (...args: A) => void;

export function assertRoute<A extends any[]>(fn: (...args: A) => void, options?: AssertRouteOptions, ...args: A): void;

/**
 * assertRoute:
 * Runs a function safely with a fallback return value.
 * - If called as `assertRoute(fn)` → assumed fallback = undefined, returns function or void.
 * - If called as `assertRoute(fallback, fn)` → uses fallback when assert fails.
 * - Accepts extra args to immediately invoke the wrapped function.
 */
export function assertRoute<T, A extends any[]>(fallbackOrFn: T | ((...args: A) => T), fnOrOpts?: ((...args: A) => T) | AssertRouteOptions, options?: AssertRouteOptions, ...args: A): T | ((...args: A) => T) {
  let fallback: T;
  let fn: (...args: A) => T;
  let opts: AssertRouteOptions | undefined;

  if (typeof fallbackOrFn === 'function') {
    fallback = undefined as T;
    fn = fallbackOrFn as (...args: A) => T;
    opts = fnOrOpts as AssertRouteOptions | undefined;
  } else {
    fallback = fallbackOrFn as T;
    fn = fnOrOpts as (...args: A) => T;
    opts = options;
  }

  const wrapped = wrapSync(fallback, fn, opts);
  return args.length ? wrapped(...args) : wrapped;
}

/* ---------------- async variant ---------------- */

export function assertRouteAsync<T, A extends any[]>(fallback: T, fn: (...args: A) => Promise<T>, options?: AssertRouteOptions, ...args: A): Promise<T>;

export function assertRouteAsync<T, A extends any[]>(fallback: T, fn: (...args: A) => Promise<T>, options?: AssertRouteOptions): (...args: A) => Promise<T>;

export function assertRouteAsync<A extends any[]>(fn: (...args: A) => Promise<void>, options?: AssertRouteOptions): (...args: A) => Promise<void>;

export function assertRouteAsync<A extends any[]>(fn: (...args: A) => Promise<void>, options?: AssertRouteOptions, ...args: A): Promise<void>;

/**
 * assertRouteAsync:
 * Runs an async function safely with a fallback return value.
 * - If called as `assertRouteAsync(fn)` → assumed fallback = undefined.
 * - If called as `assertRouteAsync(fallback, fn)` → uses fallback on AssertError.
 * - Accepts extra args to immediately invoke the wrapped async function.
 */
export function assertRouteAsync<T, A extends any[]>(
  fallbackOrFn: T | ((...args: A) => Promise<T>),
  fnOrOpts?: ((...args: A) => Promise<T>) | AssertRouteOptions,
  options?: AssertRouteOptions,
  ...args: A
): Promise<T> | ((...args: A) => Promise<T>) {
  let fallback: T;
  let fn: (...args: A) => Promise<T>;
  let opts: AssertRouteOptions | undefined;

  if (typeof fallbackOrFn === 'function') {
    fallback = undefined as T;
    fn = fallbackOrFn as (...args: A) => Promise<T>;
    opts = fnOrOpts as AssertRouteOptions | undefined;
  } else {
    fallback = fallbackOrFn as T;
    fn = fnOrOpts as (...args: A) => Promise<T>;
    opts = options;
  }

  const wrapped = wrapAsync(fallback, fn, opts);
  return args.length ? wrapped(...args) : wrapped;
}
/* ---------------- guards ---------------- */
export function typeOfDetailed(x: unknown): string {
  if (x === null) return 'null';
  if (Array.isArray(x)) {
    const len = x.length;
    const sample = x
      .slice(0, 3)
      .map((v) => JSON.stringify(v))
      .join(', ');
    return `array(len=${len}${len ? `, sample=[${sample}${len > 3 ? ', …' : ''}]` : ''})`;
  }
  if (x instanceof Date) return `date(${x.toISOString()})`;
  if (x instanceof HTMLElement) return `element(<${x.tagName.toLowerCase()}>, children=${x.childElementCount})`;
  if (typeof x === 'object' && x !== null) {
    const ctorName = x.constructor?.name ?? 'Object';
    if (ctorName !== 'Object') {
      // geef speciale weergave voor custom / DOM classes
      if ('tagName' in (x as any)) {
        return `element(<${(x as any).tagName.toLowerCase()}>, class=${ctorName})`;
      }
      return `instanceof ${ctorName}`;
    }
    // gewone objecten
    const keys = Object.keys(x as object);
    const sample = keys.slice(0, 3).join(', ');
    return `object(keys=[${sample}${keys.length > 3 ? ', …' : ''}])`;
  }
  if (typeof x === 'string') return `string(len=${x.length}, sample="${x.slice(0, 12)}${x.length > 12 ? '…' : ''}")`;
  if (typeof x === 'number') return Number.isFinite(x) ? `number(${x})` : `number(${String(x)})`;
  if (typeof x === 'boolean') return `boolean(${x})`;
  if (typeof x === 'function') return `function(${x.name || 'anonymous'})`;
  if (typeof x === 'undefined') return 'undefined';
  return typeof x;
}

export function isString(x: unknown): x is string {
  return typeof x === 'string';
}
export function isNumber(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x);
}
export function isBoolean(x: unknown): x is boolean {
  return typeof x === 'boolean';
}
export function isArray<T = unknown>(x: unknown): x is T[] {
  return Array.isArray(x);
}
export function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}
export function isDate(x: unknown): x is Date {
  return x instanceof Date && !Number.isNaN(x.getTime?.());
}
export function isFunction(x: unknown): x is (...args: any[]) => unknown {
  return typeof x === 'function';
}
export function isPromiseLike<T = unknown>(x: unknown): x is PromiseLike<T> {
  return x != null && typeof (x as any).then === 'function';
}
export function isDefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}
export function isNonNull<T>(x: T | null): x is T {
  return x !== null;
}
export function isPresent<T>(x: T | null | undefined): x is T {
  return x !== null && x !== undefined;
}
export function isInstanceOf<C extends new (...args: any[]) => any>(x: unknown, ctor: C): x is InstanceType<C> {
  return typeof ctor === 'function' && x instanceof ctor;
}

/* ---------------- assert helpers ---------------- */

export function assertArray<T = unknown>(x: unknown, message = 'Expected array', info?: Record<string, unknown>): asserts x is T[] {
  assert(isArray<T>(x), message, { ...info, got: Array.isArray(x) ? 'array' : typeOfDetailed(x) });
}
export function assertObject(x: unknown, message = 'Expected object', info?: Record<string, unknown>): asserts x is Record<string, unknown> {
  assert(isObject(x), message, { ...info, got: Array.isArray(x) ? 'array' : x === null ? 'null' : typeof x });
}
export function assertString(x: unknown, message = 'Expected string', info?: Record<string, unknown>): asserts x is string {
  assert(isString(x), message, { ...info, got: typeOfDetailed(x) });
}

export function assertNumber(x: unknown, message = 'Expected number', info?: Record<string, unknown>): asserts x is number {
  assert(isNumber(x), message, { ...info, got: typeOfDetailed(x) });
}

export function assertBoolean(x: unknown, message = 'Expected boolean', info?: Record<string, unknown>): asserts x is boolean {
  assert(isBoolean(x), message, { ...info, got: typeOfDetailed(x) });
}

export function assertDate(x: unknown, message = 'Expected Date', info?: Record<string, unknown>): asserts x is Date {
  assert(isDate(x), message, { ...info, got: typeOfDetailed(x) });
}

export function assertFunction(x: unknown, message = 'Expected function', info?: Record<string, unknown>): asserts x is (...args: any[]) => unknown {
  assert(isFunction(x), message, { ...info, got: typeOfDetailed(x) });
}

export function assertPromiseLike<T = unknown>(x: unknown, message = 'Expected Promise-like', info?: Record<string, unknown>): asserts x is PromiseLike<T> {
  // `got` is minder nuttig hier, maar we houden het consistent
  assert(isPromiseLike<T>(x), message, { ...info, got: typeOfDetailed(x) });
}

export function assertDefined<T>(x: T | undefined, message = 'Expected defined', info?: Record<string, unknown>): asserts x is T {
  assert(isDefined(x), message, { ...info, got: typeOfDetailed(x) });
}

export function assertNonNull<T>(x: T | null, message = 'Expected non-null', info?: Record<string, unknown>): asserts x is T {
  assert(isNonNull(x), message, { ...info, got: typeOfDetailed(x) });
}

export function assertPresent<T>(x: T | null | undefined, message = 'Expected value present', info?: Record<string, unknown>): asserts x is T {
  assert(isPresent(x), message, { ...info, got: typeOfDetailed(x) });
}
export function assertInstanceOf<C extends new (...args: any[]) => any>(x: unknown, ctor: C, message?: string, info?: Record<string, unknown>): asserts x is InstanceType<C> {
  assert(isInstanceOf(x, ctor), message ?? `Expected instance of ${ctor?.name ?? '<ctor>'}`, {
    ...info,
    got: (x as any)?.constructor?.name ?? typeof x,
  });
}

/* ---------------- expect wrappers ---------------- */
export function expectString<T>(x: T, message?: string): string {
  assertString(x as unknown, message);
  return x as unknown as string;
}
export function expectNumber<T>(x: T, message?: string): number {
  assertNumber(x as unknown, message);
  return x as unknown as number;
}
export function expectBoolean<T>(x: T, message?: string): boolean {
  assertBoolean(x as unknown, message);
  return x as unknown as boolean;
}
export function expectArray<T = unknown>(x: unknown, message?: string): T[] {
  assertArray<T>(x, message);
  return x as T[];
}
export function expectObject(x: unknown, message?: string): Record<string, unknown> {
  assertObject(x, message);
  return x as Record<string, unknown>;
}
export function expectDate(x: unknown, message?: string): Date {
  assertDate(x, message);
  return x as Date;
}
export function assertNever(x: never, message = 'Unreachable'): never {
  throw new AssertError(message, { got: x as unknown as object });
}

/** Asserts a plain object (no class instances/arrays). */
export function assertPlainObject(x: unknown, message = 'Expected plain object'): asserts x is Record<string, unknown> {
  assert(isPlainObject(x), message, { got: typeOfDetailed(x) });
}
/* ---------------- strings ---------------- */
export function assertNonEmptyString(x: unknown, message = 'Expected non-empty string'): asserts x is string {
  assertString(x, message);
  assert((x as string).length > 0, message);
}
export function assertStringLength(x: unknown, len: number, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string length ${len}`);
  assert((x as string).length === len, message ?? `Expected string length ${len}`);
}
export function assertStringLengthAtLeast(x: unknown, n: number, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string length >= ${n}`);
  assert((x as string).length >= n, message ?? `Expected string length >= ${n}`);
}
export function assertStringLengthAtMost(x: unknown, n: number, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string length <= ${n}`);
  assert((x as string).length <= n, message ?? `Expected string length <= ${n}`);
}
export function assertStringLengthBetween(x: unknown, min: number, max: number, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string length between ${min} and ${max}`);
  const l = (x as string).length;
  assert(l >= min && l <= max, message ?? `Expected string length between ${min} and ${max}`);
}
export function assertStringContains(x: unknown, needle: string | RegExp, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string to contain ${String(needle)}`);
  const s = x as string;
  const ok = typeof needle === 'string' ? s.includes(needle) : needle.test(s);
  assert(ok, message ?? `Expected string to contain ${String(needle)}`);
}
export function assertStringStartsWith(x: unknown, prefix: string, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string to start with "${prefix}"`);
  assert((x as string).startsWith(prefix), message ?? `Expected string to start with "${prefix}"`);
}
export function assertStringEndsWith(x: unknown, suffix: string, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string to end with "${suffix}"`);
  assert((x as string).endsWith(suffix), message ?? `Expected string to end with "${suffix}"`);
}
export function assertStringMatches(x: unknown, re: RegExp, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string to match ${re}`);
  assert(re.test(x as string), message ?? `Expected string to match ${re}`);
}
export function assertStringEqualsIgnoreCase(x: unknown, expected: string, message?: string): asserts x is string {
  assertString(x, message ?? `Expected "${expected}" (case-insensitive)`);
  assert((x as string).toLowerCase() === expected.toLowerCase(), message ?? `Expected "${expected}" (case-insensitive)`);
}
export function assertStringIncludesAny(x: unknown, ...needles: string[]): asserts x is string {
  assertString(x, `Expected string`);
  const s = x as string;
  assert(
    needles.some((n) => s.includes(n)),
    `Expected string to include any of [${needles.join(', ')}]`,
  );
}
export function assertStringIncludesAll(x: unknown, ...needles: string[]): asserts x is string {
  assertString(x, `Expected string`);
  const s = x as string;
  assert(
    needles.every((n) => s.includes(n)),
    `Expected string to include all of [${needles.join(', ')}]`,
  );
}
function isPlainObject(x: unknown): x is Record<string, unknown> {
  if (typeof x !== 'object' || x === null || Array.isArray(x)) return false;
  const proto = Object.getPrototypeOf(x);
  return proto === Object.prototype || proto === null;
}
export function assertStringIsJSON(x: unknown, message = 'Expected valid JSON'): asserts x is string {
  assertString(x, message);
  try {
    JSON.parse(x as string);
  } catch {
    assert(false, message);
  }
}

export function assertStringTrimmedNotEmpty(x: unknown, message = 'Expected non-empty (trimmed)'): asserts x is string {
  assertString(x, message);
  assert((x as string).trim().length > 0, message);
}
function canonicalizeString(s: string) {
  return s.toLowerCase().replace(/\s+/g, '');
}
export function assertStringEqualsCanonical(x: unknown, expected: string, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string`);
  assert(canonicalizeString(x as string) === canonicalizeString(expected), message ?? `Expected canonical equality`);
}
export function assertStringContainsCanonical(x: unknown, needle: string, message?: string): asserts x is string {
  assertString(x, message ?? `Expected string`);
  assert(canonicalizeString(x as string).includes(canonicalizeString(needle)), message ?? `Expected canonical containment`);
}

/* ---------------- numbers ---------------- */
export function assertNumberGreaterThan(x: unknown, n: number, message?: string): asserts x is number {
  assertNumber(x, message ?? `Expected > ${n}`);
  assert((x as number) > n, message ?? `Expected > ${n}`);
}
export function assertNumberGreaterOrEqual(x: unknown, n: number, message?: string): asserts x is number {
  assertNumber(x, message ?? `Expected >= ${n}`);
  assert((x as number) >= n, message ?? `Expected >= ${n}`);
}
export function assertNumberLessThan(x: unknown, n: number, message?: string): asserts x is number {
  assertNumber(x, message ?? `Expected < ${n}`);
  assert((x as number) < n, message ?? `Expected < ${n}`);
}
export function assertNumberLessOrEqual(x: unknown, n: number, message?: string): asserts x is number {
  assertNumber(x, message ?? `Expected <= ${n}`);
  assert((x as number) <= n, message ?? `Expected <= ${n}`);
}
export function assertNumberBetween(x: unknown, min: number, max: number, message?: string): asserts x is number {
  assertNumber(x, message ?? `Expected between ${min} and ${max}`);
  const v = x as number;
  assert(v >= min && v <= max, message ?? `Expected between ${min} and ${max}`);
}
export function assertNumberNotZero(x: unknown, message = 'Expected non-zero number'): asserts x is number {
  assertNumber(x, message);
  assert((x as number) !== 0, message);
}
export function assertNumberPositive(x: unknown, message = 'Expected positive number'): asserts x is number {
  assertNumber(x, message);
  assert((x as number) > 0, message);
}
export function assertNumberNonNegative(x: unknown, message = 'Expected non-negative number'): asserts x is number {
  assertNumber(x, message);
  assert((x as number) >= 0, message);
}
export function assertNumberNegative(x: unknown, message = 'Expected negative number'): asserts x is number {
  assertNumber(x, message);
  assert((x as number) < 0, message);
}
export function assertNumberNonPositive(x: unknown, message = 'Expected non-positive number'): asserts x is number {
  assertNumber(x, message);
  assert((x as number) <= 0, message);
}
export function assertNumberInteger(x: unknown, message = 'Expected integer'): asserts x is number {
  assertNumber(x, message);
  assert(Number.isInteger(x as number), message);
}
export function assertNumberSafeInteger(x: unknown, message = 'Expected safe integer'): asserts x is number {
  assertNumber(x, message);
  assert(Number.isSafeInteger(x as number), message);
}
export function assertNumberApproxEquals(x: unknown, expected: number, epsilon = 1e-9, message?: string): asserts x is number {
  assertNumber(x, message ?? `Expected approximately ${expected} ± ${epsilon}`);
  assert(Math.abs((x as number) - expected) <= epsilon, message ?? `Expected approximately ${expected} ± ${epsilon}`);
}
export const assertIsNotZero = assertNumberNotZero;
export const assertIsPositive = assertNumberPositive;
export const assertIsNegative = assertNumberNegative;

/* ---------------- arrays ---------------- */
export function assertArrayNotEmpty<T = unknown>(x: unknown, message = 'Expected non-empty array'): asserts x is T[] {
  assertArray<T>(x, message);
  assert((x as T[]).length > 0, message);
}
export function assertArrayLength<T = unknown>(x: unknown, len: number, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array length ${len}`);
  assert((x as T[]).length === len, message ?? `Expected array length ${len}`);
}
export function assertArrayHasAnyOf<T = unknown>(x: unknown, items: string[], message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  const arr = x as any[];
  const set = new Set(items);
  const ok = arr.some((el) => set.has(String(el)) || set.has(el as any));
  assert(ok, message ?? `Expected array to contain any of [${items.join(', ')}]`);
}
export function assertArrayHasEveryOf<T = unknown>(x: unknown, items: string[], message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  const arr = x as any[];
  const set = new Set(arr.map((v) => (typeof v === 'string' ? v : String(v))));
  const missing = items.filter((k) => !set.has(k));
  assert(missing.length === 0, message ?? `Missing required items: [${missing.join(', ')}]`);
}
export function assertArrayItemIsBoolean<T = unknown>(x: unknown, i: number, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(typeof (x as any[])[i] === 'boolean', message ?? `Expected boolean at ${i}`);
}
export function assertArrayItemIsString<T = unknown>(x: unknown, i: number, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(typeof (x as any[])[i] === 'string', message ?? `Expected string at ${i}`);
}
export function assertArrayItemIsNumber<T = unknown>(x: unknown, i: number, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(typeof (x as any[])[i] === 'number', message ?? `Expected number at ${i}`);
}
export function assertArrayItemIsObject<T = unknown>(x: unknown, i: number, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  const v = (x as any[])[i];
  assert(typeof v === 'object' && v !== null && !Array.isArray(v), message ?? `Expected object at ${i}`);
}
export function assertArrayIncludesString<T = unknown>(x: unknown, needle: string, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(
    (x as any[]).some((item) => String(item).includes(needle)),
    message ?? `Expected array to include string containing "${needle}"`,
  );
}
export function assertArrayIncludesNumber<T = unknown>(x: unknown, needle: number, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(
    (x as any[]).some((item) => item === needle),
    message ?? `Expected array to include number ${needle}`,
  );
}
export function assertArrayIncludesObject<T = unknown>(x: unknown, needle: Record<string, unknown>, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  const needleStr = JSON.stringify(needle);
  assert(
    (x as any[]).some((item) => JSON.stringify(item) === needleStr),
    message ?? `Expected array to include object ${needleStr}`,
  );
}
export function assertArrayOnlyHasObjects<T = unknown>(x: unknown, message?: string): asserts x is Record<string, unknown>[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(
    (x as any[]).every((item) => typeof item === 'object' && item !== null && !Array.isArray(item)),
    message ?? `Expected array to only contain objects`,
  );
}
export function assertArrayOnlyHasStrings<T = unknown>(x: unknown, message?: string): asserts x is string[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(
    (x as any[]).every((item) => typeof item === 'string'),
    message ?? `Expected array to only contain strings`,
  );
}
export function assertArrayOnlyHasNumbers<T = unknown>(x: unknown, message?: string): asserts x is number[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(
    (x as any[]).every((item) => typeof item === 'number'),
    message ?? `Expected array to only contain numbers`,
  );
}
export function assertArrayEveryIsFalsy<T = unknown>(x: unknown, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(
    (x as any[]).every((item) => !item),
    message ?? `Expected every item to be falsy`,
  );
}
export function assertArrayEveryIsTruthy<T = unknown>(x: unknown, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert(
    (x as any[]).every((item) => !!item),
    message ?? `Expected every item to be truthy`,
  );
}
export function assertArrayIncludesCondition<T = unknown>(x: unknown, predicate: (item: unknown) => boolean, message?: string): asserts x is T[] {
  assertArray<T>(x, message ?? `Expected array`);
  assert((x as any[]).some(predicate), message ?? `Expected array to include an item matching condition`);
}
export function assertArrayIsConsistent(x: unknown, message = 'Expected non-empty array with consistent items (same primitive type OR same keys)'): asserts x is string[] | number[] | boolean[] | Record<string, unknown>[] {
  assertArray<unknown>(x, 'Expected array');
  const arr = x as unknown[];
  assert(arr.length > 0, 'Expected array to be non-empty');

  const first = arr[0];

  // Case 1: primitive uniformity
  if (isString(first)) {
    assert(arr.every(isString), message);
    return;
  }
  if (isNumber(first)) {
    assert(arr.every(isNumber), message);
    return;
  }
  if (isBoolean(first)) {
    assert(arr.every(isBoolean), message);
    return;
  }

  // Case 2: same keys for objects (not arrays)
  if (isObject(first)) {
    const baseKeys = Object.keys(first as Record<string, unknown>).sort();
    const sameKeys = (o: unknown) => {
      if (!isObject(o)) return false;
      const k = Object.keys(o).sort();
      return k.length === baseKeys.length && k.every((kk, i) => kk === baseKeys[i]);
    };
    assert(arr.every(sameKeys), message);
    return;
  }

  // Otherwise: unsupported mixture
  assert(false, message);
}

/**
 * Asserts a non-empty array of objects where every item has the exact same keys.
 * Narrows to: Record<string, unknown>[]
 */
export function assertArrayIsConsistentByKeys(x: unknown, message = 'Expected non-empty array of objects with the same keys'): asserts x is Record<string, unknown>[] {
  assertArray<unknown>(x, 'Expected array');
  const arr = x as unknown[];
  assert(arr.length > 0, 'Expected array to be non-empty');
  assert(isObject(arr[0]), message);

  const baseKeys = Object.keys(arr[0] as Record<string, unknown>).sort();
  for (let i = 1; i < arr.length; i++) {
    const it = arr[i];
    assert(isObject(it), message);
    const k = Object.keys(it as Record<string, unknown>).sort();
    assert(k.length === baseKeys.length && k.every((kk, idx) => kk === baseKeys[idx]), message);
  }
}

/**
 * Asserts a non-empty array where every item is the same primitive type.
 * Narrows to: string[] | number[] | boolean[]
 */
export function assertArrayIsConsistentPrimitive(x: unknown, message = 'Expected non-empty array of the same primitive type'): asserts x is string[] | number[] | boolean[] {
  assertArray<unknown>(x, 'Expected array');
  const arr = x as unknown[];
  assert(arr.length > 0, 'Expected array to be non-empty');

  const first = arr[0];
  if (isString(first)) {
    assert(arr.every(isString), message);
    return;
  }
  if (isNumber(first)) {
    assert(arr.every(isNumber), message);
    return;
  }
  if (isBoolean(first)) {
    assert(arr.every(isBoolean), message);
    return;
  }

  assert(false, message);
}

export const assertIsArrayNotEmpty = assertArrayNotEmpty;

export function assertArrayHasNoExtraKeys<const K extends readonly string[]>(obj: unknown, ...allowed: K): asserts obj is { [P in K[number]]?: unknown } {
  assertPlainObject(obj, 'Expected object');
  const keys = Object.keys(obj as Record<string, unknown>);
  const allow = new Set(allowed as readonly string[]);
  const extras = keys.filter((k) => !allow.has(k));
  assert(extras.length === 0, `Unexpected keys: [${extras.join(', ')}]`);
}

/** Asserts an array where every item satisfies the guard. */
export function assertArrayOf<T>(x: unknown, guard: (v: unknown) => v is T, message = 'Expected array of items matching guard'): asserts x is T[] {
  assertArray<unknown>(x, 'Expected array');
  assert((x as unknown[]).every(guard), message);
}

/** Asserts a record whose values satisfy the guard. */
export function assertRecordOf<V>(x: unknown, guard: (v: unknown) => v is V, message = 'Expected record of values matching guard'): asserts x is Record<string, V> {
  assertPlainObject(x, 'Expected object');
  const values = Object.values(x as Record<string, unknown>);
  assert(values.every(guard), message);
}

/* ---------------- object keys ---------------- */
export function assertHasKey<O extends Record<string, unknown>, K extends string>(obj: unknown, key: K, message?: string): asserts obj is O & Record<K, unknown> {
  assertObject(obj, message ?? `Expected object`);
  assert(key in (obj as Record<string, unknown>), message ?? `Expected key "${key}"`);
}
export function assertHasKeys<O extends Record<string, unknown>, const K extends readonly string[]>(obj: unknown, ...keys: K): asserts obj is O & { [P in K[number]]: unknown } {
  assertObject(obj, `Expected object`);
  const r = obj as Record<string, unknown>;
  assert(
    keys.every((k) => k in r),
    `Expected keys: ${keys.join(', ')}`,
  );
}
export function assertKeyEquals<O extends Record<string, unknown>, K extends keyof O>(obj: unknown, key: K, expected: unknown, message?: string): asserts obj is O {
  assertObject(obj, message ?? `Expected object`);
  assert((obj as any)[key] === expected, message ?? `Expected key "${String(key)}" to equal ${JSON.stringify(expected)}`);
}
export function assertSameKeys(obj: unknown, expected: Record<string, unknown>, message?: string): asserts obj is Record<string, unknown> {
  assertObject(obj, message ?? `Expected object`);
  const a = Object.keys(obj as Record<string, unknown>).sort();
  const b = Object.keys(expected).sort();
  assert(a.length === b.length && a.every((k, i) => k === b[i]), message ?? `Expected same keys`);
}
export function assertAllKeysFalsy(obj: unknown, message?: string): asserts obj is Record<string, unknown> {
  assertObject(obj, message ?? `Expected object`);
  assert(
    Object.values(obj as Record<string, unknown>).every((v) => !v),
    message ?? `Expected all keys to be falsy`,
  );
}
export function assertAllKeysSet(obj: unknown, message?: string): asserts obj is Record<string, unknown> {
  assertObject(obj, message ?? `Expected object`);
  const vals = Object.values(obj as Record<string, unknown>);
  assert(
    vals.every((v) => v !== null && v !== undefined),
    message ?? `Expected all keys to be set (not null/undefined)`,
  );
}
export function assertAnyKeyNull(obj: unknown, message?: string): asserts obj is Record<string, unknown> {
  assertObject(obj, message ?? `Expected object`);
  const vals = Object.values(obj as Record<string, unknown>);
  assert(
    vals.some((v) => v === null),
    message ?? `Expected any key to be null`,
  );
}
export function assertNonEmptyRecord(x: unknown, message = 'Expected non-empty object'): asserts x is Record<string, unknown> {
  assertObject(x, message);
  assert(Object.keys(x as Record<string, unknown>).length > 0, message);
}
export function assertSubset(obj: unknown, subset: Record<string, unknown>, message?: string): asserts obj is Record<string, unknown> {
  assertObject(obj, message ?? `Expected object`);
  const r = obj as Record<string, unknown>;
  for (const [k, v] of Object.entries(subset)) {
    assert(k in r, message ?? `Missing key: ${k}`);
    assert(deepEqual((r as any)[k], v), message ?? `Mismatched value at key: ${k}`);
  }
}
export function assertHasPath(obj: unknown, path: string | Array<string | number>, message?: string): asserts obj is Record<string, unknown> {
  assertObject(obj, message ?? `Expected object`);
  const parts = Array.isArray(path) ? path : path.split('.').filter(Boolean);
  let curr: any = obj;
  for (const p of parts) {
    const key = typeof p === 'number' ? p : p;
    if (curr == null || !(key in curr)) assert(false, message ?? `Missing path: ${parts.join('.')}`);
    curr = curr[key as any];
  }
}

/* ---------- DOM / Element assertions (drop-in) ---------- */

// Type guard die veilig werkt buiten de browser.
export function isElement(x: unknown): x is Element {
  return typeof Element !== 'undefined' && x instanceof Element;
}

export function assertElement(x: unknown, message = 'Expected Element'): asserts x is Element {
  assert(isElement(x), message);
}

export function assertElementHasChildren(x: unknown, message = 'Expected element to have children'): asserts x is Element {
  assertElement(x, message);
  const el = x as Element;
  const count = (el as any).children?.length ?? (el as any).childNodes?.length ?? 0;
  assert(count > 0, message);
}

export function assertElementHasChild(x: unknown, message = 'Expected element to have a child'): asserts x is Element {
  assertElement(x, message);
  const el = x as Element;
  assert((el as any).children?.length > 0, message);
}

export function assertElementHasChildMatching(x: unknown, selector: string, message?: string): asserts x is Element {
  assertElement(x, message ?? 'Expected element');
  const el = x as Element;
  const children = Array.from((el as any).children ?? []) as Element[];
  const ok = children.some((c) => (c as any).matches?.(selector));
  assert(ok, message ?? `Expected child matching "${selector}"`);
}

export function assertElementHasDescendant(x: unknown, selector: string, message?: string): asserts x is Element {
  assertElement(x, message ?? 'Expected element');
  const el = x as Element;
  const found = (el as any).querySelector?.(selector);
  assert(!!found, message ?? `Expected descendant matching "${selector}"`);
}

export function assertElementHasAttribute(x: unknown, name: string, message?: string): asserts x is Element {
  assertElement(x, message ?? 'Expected element');
  const el = x as Element;
  const ok = (el as any).hasAttribute?.(name);
  assert(!!ok, message ?? `Expected element to have attribute "${name}"`);
}

export function assertElementAttributeEquals(x: unknown, name: string, expected: string, message?: string): asserts x is Element {
  assertElement(x, message ?? 'Expected element');
  const el = x as Element;
  const val = (el as any).getAttribute?.(name);
  assert(val === expected, message ?? `Expected attribute "${name}" to equal "${expected}"`);
}

// Visibility helpers are losse type guards (debug/logica)
export function isElementHidden(x: unknown): x is Element {
  if (typeof Element === 'undefined' || !(x instanceof Element)) return false;
  const computed = typeof window !== 'undefined' ? window.getComputedStyle(x) : null;
  return computed ? computed.display === 'none' || computed.visibility === 'hidden' : false;
}

export function isElementVisible(x: unknown): x is Element {
  if (typeof Element === 'undefined' || !(x instanceof Element)) return false;
  const computed = typeof window !== 'undefined' ? window.getComputedStyle(x) : null;
  return computed ? computed.display !== 'none' && computed.visibility !== 'hidden' : true;
}

export function assertElementHidden(x: unknown, message = 'Expected element to be hidden'): asserts x is Element {
  assert(isElementHidden(x), message);
}

export function assertElementVisible(x: unknown, message = 'Expected element to be visible'): asserts x is Element {
  assert(isElementVisible(x), message);
}

/* ---------------- Map/Set ---------------- */
export function assertMapHasKey<K, V>(m: unknown, key: K, message?: string): asserts m is Map<K, V> {
  assert(m instanceof Map, message ?? `Expected Map`);
  assert((m as Map<K, V>).has(key), message ?? `Expected Map to have key`);
}
export function assertSetHasValue<T>(s: unknown, value: T, message?: string): asserts s is Set<T> {
  assert(s instanceof Set, message ?? `Expected Set`);
  assert((s as Set<T>).has(value), message ?? `Expected Set to contain value`);
}

/* ---------------- dates ---------------- */
export function assertDateEarlier(x: unknown, than: Date, message?: string): asserts x is Date {
  assertDate(x, message ?? `Expected Date`);
  assert((x as Date).getTime() < than.getTime(), message ?? `Expected date earlier than ${than.toISOString?.() ?? than}`);
}
export function assertDateLater(x: unknown, than: Date, message?: string): asserts x is Date {
  assertDate(x, message ?? `Expected Date`);
  assert((x as Date).getTime() > than.getTime(), message ?? `Expected date later than ${than.toISOString?.() ?? than}`);
}
export function assertDateBetween(x: unknown, min: Date, max: Date, message?: string): asserts x is Date {
  assertDate(x, message ?? `Expected Date`);
  const t = (x as Date).getTime();
  assert(t >= min.getTime() && t <= max.getTime(), message ?? `Expected date between ${min.toISOString?.() ?? min} and ${max.toISOString?.() ?? max}`);
}
export function assertDateYear(x: unknown, year: number, message?: string): asserts x is Date {
  assertDate(x, message ?? `Expected Date`);
  assert((x as Date).getFullYear() === year, message ?? `Expected year ${year}`);
}

/* ---------------- truthiness/nullish ---------------- */
export function assertTrue(x: unknown, message = 'Expected true'): asserts x is true {
  assert(x === true, message);
}
export function assertFalse(x: unknown, message = 'Expected false'): asserts x is false {
  assert(x === false, message);
}
export function assertNull(x: unknown, message = 'Expected null'): asserts x is null {
  assert(x === null, message);
}
export function assertUndefined(x: unknown, message = 'Expected undefined'): asserts x is undefined {
  assert(x === undefined, message);
}

/* ---------------- equality ---------------- */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a instanceof Date || b instanceof Date) return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();

    if (a instanceof Map || b instanceof Map) {
      if (!(a instanceof Map && b instanceof Map)) return false;
      if (a.size !== b.size) return false;
      // Iterate over a plain array copy of entries to avoid MapIterator iteration issues when targeting ES5
      for (const [k, v] of Array.from(a.entries())) {
        if (!b.has(k) || !deepEqual(v, b.get(k))) return false;
      }
      return true;
    }
    if (a instanceof Set || b instanceof Set) {
      if (!(a instanceof Set && b instanceof Set)) return false;
      if (a.size !== b.size) return false;
      const aVals = Array.from(a);
      const bVals = Array.from(b);
      for (let i = 0; i < aVals.length; i++) {
        const v = aVals[i];
        let found = false;
        for (let j = 0; j < bVals.length; j++) {
          if (deepEqual(v, bVals[j])) {
            found = true;
            break;
          }
        }
        if (!found) return false;
      }
      return true;
    }

    if (Array.isArray(a) || Array.isArray(b)) {
      if (!(Array.isArray(a) && Array.isArray(b))) return false;
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
      if (!deepEqual(a[k], b[k])) return false;
    }
    return true;
  }
  return Number.isNaN(a) && Number.isNaN(b);
}
export function assertEquals<T>(actual: T, expected: T, message?: string) {
  assert(actual === expected, message ?? `Expected ${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);
}
export function assertNotEquals<T>(actual: T, expected: T, message?: string) {
  assert(actual !== expected, message ?? `Expected values to differ`);
}
export function assertDeepEquals<T>(actual: T, expected: T, message?: string) {
  assert(deepEqual(actual, expected), message ?? `Expected deep equality`);
}

/* ---------------- Fetch  ---------------- */

/** Ensures that a Response is ok (status 200–299). */
export async function assertFetchOk(res: Response, message?: string): Promise<Response> {
  assert(res instanceof Response, message ?? 'Expected Response');
  assert(res.ok, message ?? `Fetch failed: ${res.status} ${res.statusText}`);
  return res;
}

/** Fetch + ok + JSON parse, returns fallback on failure. */
export async function assertJsonFetch<T = unknown>(url: string, fallback: T, options?: RequestInit, routeOptions?: AssertRouteOptions): Promise<T> {
  return assertRouteAsync(
    fallback,
    async () => {
      const res = await fetch(url, options);
      await assertFetchOk(res);
      return (await res.json()) as T;
    },
    routeOptions,
  );
}

/** Fetch + ok + text. */
export async function assertTextFetch(url: string, fallback = '', options?: RequestInit, routeOptions?: AssertRouteOptions): Promise<string> {
  return assertRouteAsync(
    fallback,
    async () => {
      const res = await fetch(url, options);
      await assertFetchOk(res);
      return await res.text();
    },
    routeOptions,
  );
}

/** Ensures JSON object contains given keys. */
export function assertJsonHasKeys(obj: unknown, ...keys: string[]): asserts obj is Record<string, unknown> {
  assert(typeof obj === 'object' && obj !== null, 'Expected JSON object');
  const r = obj as Record<string, unknown>;
  for (const k of keys) {
    assert(k in r, `Missing key '${k}'`);
  }
}

/** Ensures Content-Type header matches expected type. */
export function assertResponseContentType(res: unknown, expected: string | RegExp): asserts res is Response {
  assert(res instanceof Response, 'Expected Response');
  const type = (res as Response).headers.get('content-type');
  assert(type, 'Response missing content-type');
  if (typeof expected === 'string') assert(type.includes(expected), `Expected content-type: ${expected}`);
  else assert(expected.test(type), `Expected content-type to match ${expected}`);
}

/* ---------------- SQLite & better-sqlite ---------------- */

// Minimal type interfaces to avoid mandatory imports
interface DatabaseLike {
  prepare: (sql: string) => {
    all: (...params: any[]) => any[];
    run: (...params: any[]) => { changes: number };
  };
}

interface AsyncDatabaseLike {
  all: (sql: string, ...params: any[]) => Promise<any[]>;
}

/** Assert DB connection seems valid. */
export function assertDbConnected(db: DatabaseLike): void {
  assert(typeof db.prepare === 'function', 'Invalid sqlite database connection');
}

/** Run query and return rows, with fallback. */
export function assertSqlQuery<T = any>(db: DatabaseLike, sql: string, params: unknown[] = [], fallback: T[] = []): T[] {
  return assertRoute(fallback, () => {
    const stmt = db.prepare(sql);
    const rows = stmt.all(...params);
    assert(Array.isArray(rows), 'Query did not return array');
    return rows as T[];
  });
}

/** Run update/insert/delete, assert affected > 0. */
export function assertSqlRun(db: DatabaseLike, sql: string, params: unknown[] = [], fallback = 0): number {
  return assertRoute(fallback, () => {
    const stmt = db.prepare(sql);
    const res = stmt.run(...params);
    assert(res.changes > 0, `Expected ${sql} to affect rows`);
    return res.changes;
  });
}

/** Async version (for sqlite async API). */
export async function assertSqlQueryAsync<T = any>(db: { all: (sql: string, ...params: any[]) => Promise<T[]> }, sql: string, fallback: T[] = [], ...params: any[]): Promise<T[]> {
  return assertRouteAsync(fallback, async () => {
    const rows = await db.all(sql, ...params);
    assert(Array.isArray(rows), 'Expected query to return array');
    return rows;
  });
}
/* ---------------- Express middleware ---------------- */

interface RequestLike {
  is: (type: string) => boolean;
  body: any;
  query: Record<string, any>;
}

interface ResponseLike {
  json: (body: any) => void;
  status: (code: number) => ResponseLike;
}

interface NextFunction {
  (err?: any): void;
}

/** Middleware: asserts JSON body with required keys. */
export function assertJsonBody(keys: string[]): (req: RequestLike, res: ResponseLike, next: NextFunction) => void {
  return (req, res, next) => {
    assert(req.is('application/json'), 'Expected JSON body');
    assert(typeof req.body === 'object', 'Body must be object');
    for (const k of keys) {
      assert(k in req.body, `Missing field '${k}'`);
    }
    next();
  };
}

/** Asserts query param presence. */
export function assertQueryParam(req: RequestLike, key: string): void {
  assert(req.query[key] !== undefined, `Missing query param '${key}'`);
}

/** Wraps async route handlers safely with fallback. */
export function routeSafe<H extends (req: RequestLike, res: ResponseLike, next: NextFunction) => Promise<any>>(fallback: Awaited<ReturnType<H>>, handler: H): (req: RequestLike, res: ResponseLike, next: NextFunction) => void {
  return (req, res, next) => {
    assertRouteAsync(fallback, () => handler(req, res, next))
      .then((v) => res.json(v))
      .catch(next);
  };
}

/* ---------------- boolean wrapper over multiple asserts ---------------- */
/** Bouwt een functie die N asserts tegen dezelfde args runt en boolean teruggeeft. */
export function isValid<A extends any[]>(...assertions: Array<(...args: A) => void>): (...args: A) => boolean {
  return (...args: A): boolean => {
    try {
      for (const a of assertions) a(...args);
      return true;
    } catch (e) {
      if (e instanceof AssertError) return false;
      throw e; // niet verbergen
    }
  };
}

/* ---------------- handige aliassen ---------------- */
export const instanceOf = <C extends new (...args: any[]) => any>(x: unknown, ctor: C, message?: string) => assertInstanceOf(x, ctor, message);
export const isNonEmptyString = (x: unknown, message?: string) => assertNonEmptyString(x, message);
export const stringLengthAtLeast = (x: unknown, n: number, message?: string) => assertStringLengthAtLeast(x, n, message);
export const stringLengthAtMost = (x: unknown, n: number, message?: string) => assertStringLengthAtMost(x, n, message);
export const stringContains = (x: unknown, needle: string | RegExp, message?: string) => assertStringContains(x, needle, message);
export const isNonEmptyArray = (x: unknown, message?: string) => assertArrayNotEmpty(x, message);
export const arrayLength = (x: unknown, len: number, message?: string) => assertArrayLength(x, len, message);

/* ---------------- sure-namespace ---------------- */
export type Sure = {
  ok: typeof assert;
  route: typeof assertRoute;
  routeAsync: typeof assertRouteAsync;
  isValid: typeof isValid;
  isString: typeof assertString;
  isNumber: typeof assertNumber;
  isBoolean: typeof assertBoolean;
  isArray: typeof assertArray;
  isObject: typeof assertObject;
  isDate: typeof assertDate;
  isFunction: typeof assertFunction;
  isPromiseLike: typeof assertPromiseLike;
  isDefined: typeof assertDefined;
  isNonNull: typeof assertNonNull;
  isPresent: typeof assertPresent;
  instanceOf: typeof assertInstanceOf;

  expectString: typeof expectString;
  expectNumber: typeof expectNumber;
  expectBoolean: typeof expectBoolean;
  expectArray: typeof expectArray;
  expectObject: typeof expectObject;
  expectDate: typeof expectDate;

  nonEmptyString: typeof assertNonEmptyString;
  stringLength: typeof assertStringLength;
  stringLengthAtLeast: typeof assertStringLengthAtLeast;
  stringLengthAtMost: typeof assertStringLengthAtMost;
  stringLengthBetween: typeof assertStringLengthBetween;
  stringContains: typeof assertStringContains;
  stringStartsWith: typeof assertStringStartsWith;
  stringEndsWith: typeof assertStringEndsWith;
  stringMatches: typeof assertStringMatches;
  stringEqualsIgnoreCase: typeof assertStringEqualsIgnoreCase;
  stringIncludesAny: typeof assertStringIncludesAny;
  stringIncludesAll: typeof assertStringIncludesAll;
  stringIsJSON: typeof assertStringIsJSON;
  stringTrimmedNotEmpty: typeof assertStringTrimmedNotEmpty;
  stringEqualsCanonical: typeof assertStringEqualsCanonical;
  stringContainsCanonical: typeof assertStringContainsCanonical;

  numberGreaterThan: typeof assertNumberGreaterThan;
  numberGreaterOrEqual: typeof assertNumberGreaterOrEqual;
  numberLessThan: typeof assertNumberLessThan;
  numberLessOrEqual: typeof assertNumberLessOrEqual;
  numberBetween: typeof assertNumberBetween;
  numberNotZero: typeof assertNumberNotZero;
  numberPositive: typeof assertNumberPositive;
  numberNonNegative: typeof assertNumberNonNegative;
  numberNegative: typeof assertNumberNegative;
  numberNonPositive: typeof assertNumberNonPositive;
  numberInteger: typeof assertNumberInteger;
  numberSafeInteger: typeof assertNumberSafeInteger;
  numberApproxEquals: typeof assertNumberApproxEquals;
  isNotZero: typeof assertIsNotZero;
  isPositive: typeof assertIsPositive;
  isNegative: typeof assertIsNegative;

  arrayNotEmpty: typeof assertArrayNotEmpty;
  arrayLength: typeof assertArrayLength;
  arrayHasAnyOf: typeof assertArrayHasAnyOf;
  arrayHasEveryOf: typeof assertArrayHasEveryOf;
  arrayItemIsBoolean: typeof assertArrayItemIsBoolean;
  arrayItemIsString: typeof assertArrayItemIsString;
  arrayItemIsNumber: typeof assertArrayItemIsNumber;
  arrayItemIsObject: typeof assertArrayItemIsObject;
  arrayIncludesString: typeof assertArrayIncludesString;
  arrayIncludesNumber: typeof assertArrayIncludesNumber;
  arrayIncludesObject: typeof assertArrayIncludesObject;
  arrayOnlyHasObjects: typeof assertArrayOnlyHasObjects;
  arrayOnlyHasStrings: typeof assertArrayOnlyHasStrings;
  arrayOnlyHasNumbers: typeof assertArrayOnlyHasNumbers;
  arrayEveryIsFalsy: typeof assertArrayEveryIsFalsy;
  arrayEveryIsTruthy: typeof assertArrayEveryIsTruthy;
  arrayIncludesCondition: typeof assertArrayIncludesCondition;
  isArrayNotEmpty: typeof assertIsArrayNotEmpty;
  arrayIsConsistentByKeys: typeof assertArrayIsConsistentByKeys;
  arrayIsConsistentPrimitive: typeof assertArrayIsConsistentPrimitive;
  arrayIsConsistent: typeof assertArrayIsConsistent;

  hasKey: typeof assertHasKey;
  hasKeys: typeof assertHasKeys;
  keyEquals: typeof assertKeyEquals;
  sameKeys: typeof assertSameKeys;
  allKeysFalsy: typeof assertAllKeysFalsy;
  allKeysSet: typeof assertAllKeysSet;
  anyKeyNull: typeof assertAnyKeyNull;
  nonEmptyRecord: typeof assertNonEmptyRecord;
  subset: typeof assertSubset;
  hasPath: typeof assertHasPath;

  mapHasKey: typeof assertMapHasKey;
  setHasValue: typeof assertSetHasValue;

  dateEarlier: typeof assertDateEarlier;
  dateLater: typeof assertDateLater;
  dateBetween: typeof assertDateBetween;
  dateYear: typeof assertDateYear;

  isTrue: typeof assertTrue;
  isFalse: typeof assertFalse;
  isNull: typeof assertNull;
  isUndefined: typeof assertUndefined;

  equals: typeof assertEquals;
  notEquals: typeof assertNotEquals;
  deepEquals: typeof assertDeepEquals;

  matchesSchema: typeof assertMatchesSchema;

  element: typeof assertElement;
  elementHasChildren: typeof assertElementHasChildren;
  elementHasChild: typeof assertElementHasChild;
  elementHasChildMatching: typeof assertElementHasChildMatching;
  elementHasDescendant: typeof assertElementHasDescendant;
  elementHasAttribute: typeof assertElementHasAttribute;
  elementAttributeEquals: typeof assertElementAttributeEquals;
  elementHidden: typeof assertElementHidden;
  elementVisible: typeof assertElementVisible;

  oneOfPrimitive: typeof assertOneOfPrimitive;
};

export const sure: Sure = {
  ok: assert,
  route: assertRoute,
  routeAsync: assertRouteAsync,
  isValid,

  isString: assertString,
  isNumber: assertNumber,
  isBoolean: assertBoolean,
  isArray: assertArray,
  isObject: assertObject,
  isDate: assertDate,
  isFunction: assertFunction,
  isPromiseLike: assertPromiseLike,
  isDefined: assertDefined,
  isNonNull: assertNonNull,
  isPresent: assertPresent,
  instanceOf: assertInstanceOf,

  expectString,
  expectNumber,
  expectBoolean,
  expectArray,
  expectObject,
  expectDate,

  nonEmptyString: assertNonEmptyString,
  stringLength: assertStringLength,
  stringLengthAtLeast: assertStringLengthAtLeast,
  stringLengthAtMost: assertStringLengthAtMost,
  stringLengthBetween: assertStringLengthBetween,
  stringContains: assertStringContains,
  stringStartsWith: assertStringStartsWith,
  stringEndsWith: assertStringEndsWith,
  stringMatches: assertStringMatches,
  stringEqualsIgnoreCase: assertStringEqualsIgnoreCase,
  stringIncludesAny: assertStringIncludesAny,
  stringIncludesAll: assertStringIncludesAll,
  stringIsJSON: assertStringIsJSON,
  stringTrimmedNotEmpty: assertStringTrimmedNotEmpty,
  stringEqualsCanonical: assertStringEqualsCanonical,
  stringContainsCanonical: assertStringContainsCanonical,

  numberGreaterThan: assertNumberGreaterThan,
  numberGreaterOrEqual: assertNumberGreaterOrEqual,
  numberLessThan: assertNumberLessThan,
  numberLessOrEqual: assertNumberLessOrEqual,
  numberBetween: assertNumberBetween,
  numberNotZero: assertNumberNotZero,
  numberPositive: assertNumberPositive,
  numberNonNegative: assertNumberNonNegative,
  numberNegative: assertNumberNegative,
  numberNonPositive: assertNumberNonPositive,
  numberInteger: assertNumberInteger,
  numberSafeInteger: assertNumberSafeInteger,
  numberApproxEquals: assertNumberApproxEquals,
  isNotZero: assertIsNotZero,
  isPositive: assertIsPositive,
  isNegative: assertIsNegative,

  arrayNotEmpty: assertArrayNotEmpty,
  arrayLength: assertArrayLength,
  arrayHasAnyOf: assertArrayHasAnyOf,
  arrayHasEveryOf: assertArrayHasEveryOf,
  arrayItemIsBoolean: assertArrayItemIsBoolean,
  arrayItemIsString: assertArrayItemIsString,
  arrayItemIsNumber: assertArrayItemIsNumber,
  arrayItemIsObject: assertArrayItemIsObject,
  arrayIncludesString: assertArrayIncludesString,
  arrayIncludesNumber: assertArrayIncludesNumber,
  arrayIncludesObject: assertArrayIncludesObject,
  arrayOnlyHasObjects: assertArrayOnlyHasObjects,
  arrayOnlyHasStrings: assertArrayOnlyHasStrings,
  arrayOnlyHasNumbers: assertArrayOnlyHasNumbers,
  arrayEveryIsFalsy: assertArrayEveryIsFalsy,
  arrayEveryIsTruthy: assertArrayEveryIsTruthy,
  arrayIncludesCondition: assertArrayIncludesCondition,
  isArrayNotEmpty: assertIsArrayNotEmpty,
  arrayIsConsistentByKeys: assertArrayIsConsistentByKeys,
  arrayIsConsistentPrimitive: assertArrayIsConsistentPrimitive,
  arrayIsConsistent: assertArrayIsConsistent,

  hasKey: assertHasKey,
  hasKeys: assertHasKeys,
  keyEquals: assertKeyEquals,
  sameKeys: assertSameKeys,
  allKeysFalsy: assertAllKeysFalsy,
  allKeysSet: assertAllKeysSet,
  anyKeyNull: assertAnyKeyNull,
  nonEmptyRecord: assertNonEmptyRecord,
  subset: assertSubset,
  hasPath: assertHasPath,

  mapHasKey: assertMapHasKey,
  setHasValue: assertSetHasValue,

  dateEarlier: assertDateEarlier,
  dateLater: assertDateLater,
  dateBetween: assertDateBetween,
  dateYear: assertDateYear,

  isTrue: assertTrue,
  isFalse: assertFalse,
  isNull: assertNull,
  isUndefined: assertUndefined,

  equals: assertEquals,
  notEquals: assertNotEquals,
  deepEquals: assertDeepEquals,

  matchesSchema: assertMatchesSchema,

  element: assertElement,
  elementHasChildren: assertElementHasChildren,
  elementHasChild: assertElementHasChild,
  elementHasChildMatching: assertElementHasChildMatching,
  elementHasDescendant: assertElementHasDescendant,
  elementHasAttribute: assertElementHasAttribute,
  elementAttributeEquals: assertElementAttributeEquals,
  elementHidden: assertElementHidden,
  elementVisible: assertElementVisible,

  oneOfPrimitive: assertOneOfPrimitive,
} as const;

export default sure;

/* ---------------- schema ---------------- */
type PrimitiveTypeName = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'date';
type SchemaRule = PrimitiveTypeName | ((x: unknown) => boolean);
export type SimpleSchema = Record<string, SchemaRule>;
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

type DocMap = Record<string, string>;
const DOCS: DocMap = {
  // routing
  route: 'route<T>(fallback, fn, options?): T | ((...args)=>T) — wraps with fallback on AssertError.',
  routeAsync: 'routeAsync<T>(fallback, fn, options?): Promise<T> | ((...args)=>Promise<T>) — async variant.',
  routeWith: 'routeWith<T>(fallback, options?): (fn)=>wrapped — curry helper.',
  isValid: 'isValid(...asserts)(...args): boolean — AssertError -> false; others bubble.',
  // core
  ok: 'ok(condition, message?, info?) — base assertion.',
  isString: 'isString(x): asserts x is string',
  isNumber: 'isNumber(x): asserts x is number',
  isArray: 'isArray<T>(x): asserts x is T[]',
  isObject: 'isObject(x): asserts x is Record<string,unknown>',
  // objects/keys
  hasKey: 'hasKey(obj, key)',
  hasKeys: 'hasKeys(obj, ...keys)',
  allKeysSet: 'allKeysSet(obj) — no null/undefined values',
  // dates
  dateBetween: 'dateBetween(x, min: Date, max: Date)',
  dateEarlier: 'dateEarlier(x, than: Date)',
  dateLater: 'dateLater(x, than: Date)',
  dateYear: 'dateYear(x, year)',
  // DOM
  element: 'element(x): asserts x is Element',
  elementVisible: 'elementVisible(x): asserts visibility',
  elementHidden: 'elementHidden(x): asserts hidden state',
};

/* ---------------- one-of primitive ---------------- */
export function assertOneOfPrimitive<T extends string | number | boolean>(x: unknown, options: readonly T[], message?: string): asserts x is T {
  assert(options.includes(x as T), message ?? `Expected one of [${options.join(', ')}]`);
}

/** Print a compact table of the available functions (Node & browser). */
function help(logToConsole = true): DocMap {
  if (!logToConsole) return { ...DOCS };
  if (typeof console !== 'undefined' && console.groupCollapsed) {
    console.groupCollapsed('[assertroute] available functions');
    try {
      console.table(DOCS);
    } finally {
      console.groupEnd();
    }
  } else {
    // eslint-disable-next-line no-console
    console.log('[assertroute]', DOCS);
  }
  return { ...DOCS };
}

// If you still export `sure`, you can attach:
if (typeof sure === 'object' && sure) {
  (sure as any).docs = DOCS;
  (sure as any).help = help;
}
