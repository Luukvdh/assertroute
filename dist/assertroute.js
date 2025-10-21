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
    code = "ASSERT_FAILED";
    info;
    constructor(message, info) {
        super(message);
        this.name = "AssertError";
        this.info = info;
    }
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
export function assert(condition, message = "Assertion failed", info) {
    if (!condition)
        throw new AssertError(message, info);
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
export function isString(x) {
    return typeof x === "string";
}
/**
 * Returns true if x is a finite number.
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to number.
 */
export function isNumber(x) {
    return typeof x === "number" && Number.isFinite(x);
}
/**
 * Returns true if x is a boolean.
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to boolean.
 */
export function isBoolean(x) {
    return typeof x === "boolean";
}
/**
 * Returns true if x is an array.
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to T[].
 */
export function isArray(x) {
    return Array.isArray(x);
}
/**
 * Returns true if x is a plain object (not null, not array).
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to Record<string, unknown>.
 */
export function isObject(x) {
    return typeof x === "object" && x !== null && !Array.isArray(x);
}
/**
 * Returns true if x is a valid Date instance (non-NaN time).
 *
 * Narrowing:
 * - On a true branch, TypeScript narrows x to Date.
 */
export function isDate(x) {
    return x instanceof Date && !Number.isNaN(x.getTime?.());
}
/** Returns true if x is a function. */
export function isFunction(x) {
    return typeof x === "function";
}
/** Returns true if x is Promise-like (has a then method). */
export function isPromiseLike(x) {
    return x != null && typeof x.then === "function";
}
/**
 * Returns true if x is not undefined.
 *
 * Narrowing:
 * - On a true branch, narrows from T | undefined to T.
 */
export function isDefined(x) {
    return x !== undefined;
}
/**
 * Returns true if x is not null.
 *
 * Narrowing:
 * - On a true branch, narrows from T | null to T.
 */
export function isNonNull(x) {
    return x !== null;
}
/**
 * Returns true if x is neither null nor undefined.
 *
 * Narrowing:
 * - On a true branch, narrows from T | null | undefined to T.
 */
export function isPresent(x) {
    return x !== null && x !== undefined;
}
/**
 * Returns true if x is an instance of the provided constructor.
 *
 * Narrowing:
 * - On a true branch, narrows x to InstanceType<C>.
 */
export function isInstanceOf(x, ctor) {
    return typeof ctor === "function" && x instanceof ctor;
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
export function assertString(x, message = "Expected string", info) {
    assert(isString(x), message, { ...info, got: typeof x });
}
/**
 * Asserts that x is a finite number.
 *
 * Narrowing:
 * - On success, narrows x to number.
 */
export function assertNumber(x, message = "Expected number", info) {
    assert(isNumber(x), message, { ...info, got: typeof x });
}
/**
 * Asserts that x is a boolean.
 *
 * Narrowing:
 * - On success, narrows x to boolean.
 */
export function assertBoolean(x, message = "Expected boolean", info) {
    assert(isBoolean(x), message, { ...info, got: typeof x });
}
/**
 * Asserts that x is an array.
 *
 * Narrowing:
 * - On success, narrows x to T[].
 */
export function assertArray(x, message = "Expected array", info) {
    assert(isArray(x), message, {
        ...info,
        got: Array.isArray(x) ? "array" : typeof x,
    });
}
/**
 * Asserts that x is a plain object (not null, not array).
 *
 * Narrowing:
 * - On success, narrows x to Record<string, unknown>.
 */
export function assertObject(x, message = "Expected object", info) {
    assert(isObject(x), message, {
        ...info,
        got: Array.isArray(x) ? "array" : x === null ? "null" : typeof x,
    });
}
/**
 * Asserts that x is a valid Date instance (non-NaN time).
 *
 * Narrowing:
 * - On success, narrows x to Date.
 */
export function assertDate(x, message = "Expected Date", info) {
    assert(isDate(x), message, { ...info, got: typeof x });
}
/**
 * Asserts that x is a function.
 *
 * Narrowing:
 * - On success, narrows x to (...args:any[]) => unknown.
 */
export function assertFunction(x, message = "Expected function", info) {
    assert(isFunction(x), message, { ...info, got: typeof x });
}
/**
 * Asserts that x is Promise-like (has a then method).
 *
 * Narrowing:
 * - On success, narrows x to PromiseLike<unknown>.
 */
export function assertPromiseLike(x, message = "Expected Promise-like", info) {
    assert(isPromiseLike(x), message, { ...info, got: typeof x });
}
/**
 * Asserts that x is not undefined.
 *
 * Narrowing:
 * - On success, narrows from T | undefined to T.
 */
export function assertDefined(x, message = "Expected defined", info) {
    assert(isDefined(x), message, info);
}
/**
 * Asserts that x is not null.
 *
 * Narrowing:
 * - On success, narrows from T | null to T.
 */
export function assertNonNull(x, message = "Expected non-null", info) {
    assert(isNonNull(x), message, info);
}
/**
 * Asserts that x is neither null nor undefined.
 *
 * Narrowing:
 * - On success, narrows from T | null | undefined to T.
 */
export function assertPresent(x, message = "Expected value present", info) {
    assert(isPresent(x), message, info);
}
/**
 * Asserts that x is an instance of ctor.
 *
 * Narrowing:
 * - On success, narrows x to InstanceType<C>.
 */
export function assertInstanceOf(x, ctor, message, info) {
    assert(isInstanceOf(x, ctor), message ?? `Expected instance of ${ctor?.name ?? "<ctor>"}`, { ...info, got: x?.constructor?.name ?? typeof x });
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
export function expectString(x, message) {
    assertString(x, message);
    return x;
}
/**
 * Ensures x is a number and returns it.
 */
export function expectNumber(x, message) {
    assertNumber(x, message);
    return x;
}
/**
 * Ensures x is a boolean and returns it.
 */
export function expectBoolean(x, message) {
    assertBoolean(x, message);
    return x;
}
/**
 * Ensures x is an array and returns it typed as T[].
 */
export function expectArray(x, message) {
    assertArray(x, message);
    return x;
}
/**
 * Ensures x is a plain object and returns it.
 */
export function expectObject(x, message) {
    assertObject(x, message);
    return x;
}
/**
 * Ensures x is a Date and returns it.
 */
export function expectDate(x, message) {
    assertDate(x, message);
    return x;
}
export function assertRoute(fallback, fn, options = {}) {
    const { onError, catchNonAssertErrors = false } = options;
    // If the function has no parameters (length === 0), execute it immediately
    if (fn.length === 0) {
        try {
            return fn();
        }
        catch (e) {
            if (e instanceof AssertError) {
                onError?.(e);
                return fallback;
            }
            if (catchNonAssertErrors) {
                const err = e instanceof Error ? e : new Error(String(e));
                onError?.(new AssertError(err.message, { cause: err }));
                return fallback;
            }
            throw e; // rethrow non-assert errors by default
        }
    }
    // If the function has parameters, return a wrapped function
    return ((...args) => {
        try {
            return fn(...args);
        }
        catch (e) {
            if (e instanceof AssertError) {
                onError?.(e);
                return fallback;
            }
            if (catchNonAssertErrors) {
                const err = e instanceof Error ? e : new Error(String(e));
                onError?.(new AssertError(err.message, { cause: err }));
                return fallback;
            }
            throw e; // rethrow non-assert errors by default
        }
    });
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
export function routeWith(fallback, options) {
    return (fn) => assertRoute(fallback, fn, options);
}
export function assertRouteAsync(fallback, fn, options = {}) {
    const { onError, catchNonAssertErrors = false } = options;
    if (fn.length === 0) {
        return (async () => {
            try {
                return await fn();
            }
            catch (e) {
                if (e instanceof AssertError) {
                    onError?.(e);
                    return fallback;
                }
                if (catchNonAssertErrors) {
                    const err = e instanceof Error ? e : new Error(String(e));
                    onError?.(new AssertError(err.message, { cause: err }));
                    return fallback;
                }
                throw e;
            }
        })();
    }
    return (async (...args) => {
        try {
            return await fn(...args);
        }
        catch (e) {
            if (e instanceof AssertError) {
                onError?.(e);
                return fallback;
            }
            if (catchNonAssertErrors) {
                const err = e instanceof Error ? e : new Error(String(e));
                onError?.(new AssertError(err.message, { cause: err }));
                return fallback;
            }
            throw e;
        }
    });
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
export function assertNonEmptyString(x, message = "Expected non-empty string") {
    assertString(x, message);
    assert(x.length > 0, message);
}
/**
 * Asserts that x is an array with length > 0.
 *
 * Narrowing:
 * - On success, narrows x to T[].
 */
export function assertArrayNotEmpty(x, message = "Expected non-empty array") {
    assertArray(x, message);
    assert(x.length > 0, message);
}
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
export function assertStringLength(x, len, message) {
    assertString(x, message ?? `Expected string length ${len}`);
    assert(x.length === len, message ?? `Expected string length ${len}`);
}
/** Asserts that x is a string with length >= `n`. */
export function assertStringLengthAtLeast(x, n, message) {
    assertString(x, message ?? `Expected string length >= ${n}`);
    assert(x.length >= n, message ?? `Expected string length >= ${n}`);
}
/** Asserts that x is a string with length <= `n`. */
export function assertStringLengthAtMost(x, n, message) {
    assertString(x, message ?? `Expected string length <= ${n}`);
    assert(x.length <= n, message ?? `Expected string length <= ${n}`);
}
/** Asserts that x is a string with min/max inclusive bounds. */
export function assertStringLengthBetween(x, min, max, message) {
    assertString(x, message ?? `Expected string length between ${min} and ${max}`);
    const l = x.length;
    assert(l >= min && l <= max, message ?? `Expected string length between ${min} and ${max}`);
}
/** Asserts that x is a string containing substring or matching regex. */
export function assertStringContains(x, needle, message) {
    assertString(x, message ?? `Expected string to contain ${String(needle)}`);
    const s = x;
    const ok = typeof needle === "string" ? s.includes(needle) : needle.test(s);
    assert(ok, message ?? `Expected string to contain ${String(needle)}`);
}
/** Asserts that x is a string starting with the given prefix. */
export function assertStringStartsWith(x, prefix, message) {
    assertString(x, message ?? `Expected string to start with "${prefix}"`);
    assert(x.startsWith(prefix), message ?? `Expected string to start with "${prefix}"`);
}
/** Asserts that x is a string ending with the given suffix. */
export function assertStringEndsWith(x, suffix, message) {
    assertString(x, message ?? `Expected string to end with "${suffix}"`);
    assert(x.endsWith(suffix), message ?? `Expected string to end with "${suffix}"`);
}
/** Asserts that x is a string that matches the regex. */
export function assertStringMatches(x, re, message) {
    assertString(x, message ?? `Expected string to match ${re}`);
    assert(re.test(x), message ?? `Expected string to match ${re}`);
}
/** Asserts that x (string) equals `expected` ignoring case. */
export function assertStringEqualsIgnoreCase(x, expected, message) {
    assertString(x, message ?? `Expected "${expected}" (case-insensitive)`);
    assert(x.toLowerCase() === expected.toLowerCase(), message ?? `Expected "${expected}" (case-insensitive)`);
}
/** Asserts that x is a string including any of the provided substrings. */
export function assertStringIncludesAny(x, ...needles) {
    assertString(x, `Expected string`);
    const s = x;
    assert(needles.some((n) => s.includes(n)), `Expected string to include any of [${needles.join(", ")}]`);
}
/** Asserts that x is a string including all of the provided substrings. */
export function assertStringIncludesAll(x, ...needles) {
    assertString(x, `Expected string`);
    const s = x;
    assert(needles.every((n) => s.includes(n)), `Expected string to include all of [${needles.join(", ")}]`);
}
/** Asserts that x is a string containing valid JSON. */
export function assertStringIsJSON(x, message = "Expected valid JSON") {
    assertString(x, message);
    try {
        JSON.parse(x);
    }
    catch {
        assert(false, message);
    }
}
/** Asserts that x is a string whose trimmed length > 0. */
export function assertStringTrimmedNotEmpty(x, message = "Expected non-empty (trimmed)") {
    assertString(x, message);
    assert(x.trim().length > 0, message);
}
// ---- Numbers ----
/** Asserts that x is a number strictly greater than n. */
export function assertNumberGreaterThan(x, n, message) {
    assertNumber(x, message ?? `Expected > ${n}`);
    assert(x > n, message ?? `Expected > ${n}`);
}
/** Asserts that x is a number >= n. */
export function assertNumberGreaterOrEqual(x, n, message) {
    assertNumber(x, message ?? `Expected >= ${n}`);
    assert(x >= n, message ?? `Expected >= ${n}`);
}
/** Asserts that x is a number strictly less than n. */
export function assertNumberLessThan(x, n, message) {
    assertNumber(x, message ?? `Expected < ${n}`);
    assert(x < n, message ?? `Expected < ${n}`);
}
/** Asserts that x is a number <= n. */
export function assertNumberLessOrEqual(x, n, message) {
    assertNumber(x, message ?? `Expected <= ${n}`);
    assert(x <= n, message ?? `Expected <= ${n}`);
}
/** Asserts that x is a number within [min, max]. */
export function assertNumberBetween(x, min, max, message) {
    assertNumber(x, message ?? `Expected between ${min} and ${max}`);
    const v = x;
    assert(v >= min && v <= max, message ?? `Expected between ${min} and ${max}`);
}
// ---- Arrays ----
/** Asserts that x is an array with exact length `len`. */
export function assertArrayLength(x, len, message) {
    assertArray(x, message ?? `Expected array length ${len}`);
    assert(x.length === len, message ?? `Expected array length ${len}`);
}
/** Asserts that x is an array containing at least one of the provided items (by string form). */
export function assertArrayHasAnyOf(x, items, message) {
    assertArray(x, message ?? `Expected array`);
    const arr = x;
    const set = new Set(items);
    const ok = arr.some((el) => set.has(String(el)) || set.has(el));
    assert(ok, message ?? `Expected array to contain any of [${items.join(", ")}]`);
}
/** Asserts that x is an array containing all the provided items (by string form). */
export function assertArrayHasEveryOf(x, items, message) {
    assertArray(x, message ?? `Expected array`);
    const arr = x;
    const set = new Set(arr.map((v) => (typeof v === "string" ? v : String(v))));
    const missing = items.filter((k) => !set.has(k));
    assert(missing.length === 0, message ?? `Missing required items: [${missing.join(", ")}]`);
}
/** Asserts that x is an array and element at index i is a boolean. */
export function assertArrayItemIsBoolean(x, i, message) {
    assertArray(x, message ?? `Expected array`);
    assert(typeof x[i] === "boolean", message ?? `Expected boolean at ${i}`);
}
/** Asserts that x is an array and element at index i is a string. */
export function assertArrayItemIsString(x, i, message) {
    assertArray(x, message ?? `Expected array`);
    assert(typeof x[i] === "string", message ?? `Expected string at ${i}`);
}
/** Asserts that x is an array and element at index i is a number. */
export function assertArrayItemIsNumber(x, i, message) {
    assertArray(x, message ?? `Expected array`);
    assert(typeof x[i] === "number", message ?? `Expected number at ${i}`);
}
/** Asserts that x is an array and element at index i is a plain object. */
export function assertArrayItemIsObject(x, i, message) {
    assertArray(x, message ?? `Expected array`);
    const v = x[i];
    assert(typeof v === "object" && v !== null && !Array.isArray(v), message ?? `Expected object at ${i}`);
}
/** Asserts that x is an array with at least one item whose string form includes `needle`. */
export function assertArrayIncludesString(x, needle, message) {
    assertArray(x, message ?? `Expected array`);
    assert(x.some((item) => String(item).includes(needle)), message ?? `Expected array to include string containing "${needle}"`);
}
/** Asserts that x is an array including the exact number `needle`. */
export function assertArrayIncludesNumber(x, needle, message) {
    assertArray(x, message ?? `Expected array`);
    assert(x.some((item) => item === needle), message ?? `Expected array to include number ${needle}`);
}
/** Asserts that x is an array including an object deep-equal to `needle`. */
export function assertArrayIncludesObject(x, needle, message) {
    assertArray(x, message ?? `Expected array`);
    const needleStr = JSON.stringify(needle);
    assert(x.some((item) => JSON.stringify(item) === needleStr), message ?? `Expected array to include object ${needleStr}`);
}
/** Asserts that x is an array whose every element is a plain object. */
export function assertArrayOnlyHasObjects(x, message) {
    assertArray(x, message ?? `Expected array`);
    assert(x.every((item) => typeof item === "object" && item !== null && !Array.isArray(item)), message ?? `Expected array to only contain objects`);
}
/** Asserts that x is an array whose every element is a string. */
export function assertArrayOnlyHasStrings(x, message) {
    assertArray(x, message ?? `Expected array`);
    assert(x.every((item) => typeof item === "string"), message ?? `Expected array to only contain strings`);
}
/** Asserts that x is an array whose every element is a number. */
export function assertArrayOnlyHasNumbers(x, message) {
    assertArray(x, message ?? `Expected array`);
    assert(x.every((item) => typeof item === "number"), message ?? `Expected array to only contain numbers`);
}
/** Asserts that x is an array and every element is falsy. */
export function assertArrayEveryIsFalsy(x, message) {
    assertArray(x, message ?? `Expected array`);
    assert(x.every((item) => !item), message ?? `Expected every item to be falsy`);
}
/** Asserts that x is an array and every element is truthy. */
export function assertArrayEveryIsTruthy(x, message) {
    assertArray(x, message ?? `Expected array`);
    assert(x.every((item) => !!item), message ?? `Expected every item to be truthy`);
}
/** Asserts that x is an array including an element for which predicate returns true. */
export function assertArrayIncludesCondition(x, predicate, message) {
    assertArray(x, message ?? `Expected array`);
    assert(x.some(predicate), message ?? `Expected array to include an item matching condition`);
}
// ---- Objects ----
/** Asserts that obj is a plain object containing the provided key. */
export function assertHasKey(obj, key, message) {
    assertObject(obj, message ?? `Expected object`);
    assert(key in obj, message ?? `Expected key "${key}"`);
}
/** Asserts that obj is a plain object containing all provided keys. */
export function assertHasKeys(obj, ...keys) {
    assertObject(obj, `Expected object`);
    const r = obj;
    assert(keys.every((k) => k in r), `Expected keys: ${keys.join(", ")}`);
}
/** Asserts that obj[key] strictly equals expected. */
export function assertKeyEquals(obj, key, expected, message) {
    assertObject(obj, message ?? `Expected object`);
    assert(obj[key] === expected, message ??
        `Expected key "${String(key)}" to equal ${JSON.stringify(expected)}`);
}
/** Asserts that obj has exactly the same set of keys as `expected`. */
export function assertSameKeys(obj, expected, message) {
    assertObject(obj, message ?? `Expected object`);
    const a = Object.keys(obj).sort();
    const b = Object.keys(expected).sort();
    assert(a.length === b.length && a.every((k, i) => k === b[i]), message ?? `Expected same keys`);
}
/** Asserts that every value in obj is falsy. */
export function assertAllKeysFalsy(obj, message) {
    assertObject(obj, message ?? `Expected object`);
    assert(Object.values(obj).every((v) => !v), message ?? `Expected all keys to be falsy`);
}
/** Asserts that every value in obj is neither null nor undefined. */
export function assertAllKeysSet(obj, message) {
    assertObject(obj, message ?? `Expected object`);
    const vals = Object.values(obj);
    assert(vals.every((v) => v !== null && v !== undefined), message ?? `Expected all keys to be set (not null/undefined)`);
}
/** Asserts that at least one value in obj is null. */
export function assertAnyKeyNull(obj, message) {
    assertObject(obj, message ?? `Expected object`);
    const vals = Object.values(obj);
    assert(vals.some((v) => v === null), message ?? `Expected any key to be null`);
}
// ---- Elements ----
/** Returns true if x is a DOM Element (when running in an environment with DOM). */
export function isElement(x) {
    return typeof Element !== "undefined" && x instanceof Element;
}
/** Asserts that x is a DOM Element. */
export function assertElement(x, message = "Expected Element") {
    assert(isElement(x), message);
}
/** Asserts that the element has at least one child node/element. */
export function assertElementHasChildren(x, message = "Expected element to have children") {
    assertElement(x, message);
    const el = x;
    const count = el.children?.length ?? el.childNodes?.length ?? 0;
    assert(count > 0, message);
}
/** Asserts that the element has at least one child element. */
export function assertElementHasChild(x, message = "Expected element to have a child") {
    assertElement(x, message);
    const el = x;
    assert(el.children?.length > 0, message);
}
/** Asserts that the element has a child matching the CSS selector. */
export function assertElementHasChildMatching(x, selector, message) {
    assertElement(x, message ?? `Expected element`);
    const el = x;
    const children = Array.from(el.children ?? []);
    assert(children.some((c) => c.matches?.(selector)), message ?? `Expected child matching "${selector}"`);
}
/** Asserts that the element has a descendant matching the CSS selector. */
export function assertElementHasDescendant(x, selector, message) {
    assertElement(x, message ?? `Expected element`);
    const el = x;
    const found = el.querySelector?.(selector);
    assert(!!found, message ?? `Expected descendant matching "${selector}"`);
}
/** Asserts that the element has the given attribute. */
export function assertElementHasAttribute(x, name, message) {
    assertElement(x, message ?? `Expected element`);
    const el = x;
    const ok = el.hasAttribute?.(name);
    assert(!!ok, message ?? `Expected element to have attribute "${name}"`);
}
/** Asserts that the element's attribute equals the expected value. */
export function assertElementAttributeEquals(x, name, expected, message) {
    assertElement(x, message ?? `Expected element`);
    const el = x;
    const val = el.getAttribute?.(name);
    assert(val === expected, message ?? `Expected attribute "${name}" to equal "${expected}"`);
}
/** Returns true if the Element is hidden via display:none or visibility:hidden (DOM environments). */
export function isElementHidden(x) {
    if (typeof Element === "undefined" || !(x instanceof Element))
        return false;
    const computed = typeof window !== "undefined" ? window.getComputedStyle(x) : null;
    return computed
        ? computed.display === "none" || computed.visibility === "hidden"
        : false;
}
/** Returns true if the Element is visible (i.e., not hidden by display/visibility). */
export function isElementVisible(x) {
    if (typeof Element === "undefined" || !(x instanceof Element))
        return false;
    const computed = typeof window !== "undefined" ? window.getComputedStyle(x) : null;
    return computed
        ? computed.display !== "none" && computed.visibility !== "hidden"
        : true;
}
/** Asserts that x is an Element currently hidden by CSS (display or visibility). */
export function assertElementHidden(x, message = "Expected element to be hidden") {
    assert(isElementHidden(x), message);
}
/** Asserts that x is an Element currently visible (not hidden by display/visibility). */
export function assertElementVisible(x, message = "Expected element to be visible") {
    assert(isElementVisible(x), message);
}
// ---- Dates ----
/** Asserts that x is a Date earlier than `than`. */
export function assertDateEarlier(x, than, message) {
    assertDate(x, message ?? `Expected Date`);
    assert(x.getTime() < than.getTime(), message ?? `Expected date earlier than ${than.toISOString?.() ?? than}`);
}
/** Asserts that x is a Date later than `than`. */
export function assertDateLater(x, than, message) {
    assertDate(x, message ?? `Expected Date`);
    assert(x.getTime() > than.getTime(), message ?? `Expected date later than ${than.toISOString?.() ?? than}`);
}
/** Asserts that x is a Date within [min, max]. */
export function assertDateBetween(x, min, max, message) {
    assertDate(x, message ?? `Expected Date`);
    const t = x.getTime();
    assert(t >= min.getTime() && t <= max.getTime(), message ??
        `Expected date between ${min.toISOString?.() ?? min} and ${max.toISOString?.() ?? max}`);
}
/** Asserts that x is a Date whose full year equals `year`. */
export function assertDateYear(x, year, message) {
    assertDate(x, message ?? `Expected Date`);
    assert(x.getFullYear() === year, message ?? `Expected year ${year}`);
}
// ---- Nullish / Boolean convenience ----
/** Asserts that x is strictly true. */
export function assertTrue(x, message = "Expected true") {
    assert(x === true, message);
}
/** Asserts that x is strictly false. */
export function assertFalse(x, message = "Expected false") {
    assert(x === false, message);
}
/** Asserts that x is strictly null. */
export function assertNull(x, message = "Expected null") {
    assert(x === null, message);
}
/** Asserts that x is strictly undefined. */
export function assertUndefined(x, message = "Expected undefined") {
    assert(x === undefined, message);
}
// ==========================
// Extra number assertions
// ==========================
/** Asserts that x is a number not equal to 0. */
export function assertNumberNotZero(x, message = "Expected non-zero number") {
    assertNumber(x, message);
    assert(x !== 0, message);
}
/** Asserts that x is a number strictly greater than 0. */
export function assertNumberPositive(x, message = "Expected positive number") {
    assertNumber(x, message);
    assert(x > 0, message);
}
/** Asserts that x is a number >= 0. */
export function assertNumberNonNegative(x, message = "Expected non-negative number") {
    assertNumber(x, message);
    assert(x >= 0, message);
}
/** Asserts that x is a number strictly less than 0. */
export function assertNumberNegative(x, message = "Expected negative number") {
    assertNumber(x, message);
    assert(x < 0, message);
}
/** Asserts that x is a number <= 0. */
export function assertNumberNonPositive(x, message = "Expected non-positive number") {
    assertNumber(x, message);
    assert(x <= 0, message);
}
/** Asserts that x is an integer (Number.isInteger). */
export function assertNumberInteger(x, message = "Expected integer") {
    assertNumber(x, message);
    assert(Number.isInteger(x), message);
}
/** Asserts that x is a safe integer (Number.isSafeInteger). */
export function assertNumberSafeInteger(x, message = "Expected safe integer") {
    assertNumber(x, message);
    assert(Number.isSafeInteger(x), message);
}
/** Asserts that x is a number within ±epsilon of expected. */
export function assertNumberApproxEquals(x, expected, epsilon = 1e-9, message) {
    assertNumber(x, message ?? `Expected approximately ${expected} ± ${epsilon}`);
    assert(Math.abs(x - expected) <= epsilon, message ?? `Expected approximately ${expected} ± ${epsilon}`);
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
export function assertObjectArrayAllHaveKey(x, key, message) {
    assertArray(x, message ?? `Expected array`);
    assert(x.every((item) => typeof item === "object" &&
        item !== null &&
        !Array.isArray(item) &&
        key in item), message ?? `Expected every object in array to have key "${key}"`);
}
/** Asserts that x is an array of objects and each object contains all provided keys. */
export function assertObjectArrayEveryHasKeys(x, ...keys) {
    assertArray(x, `Expected array`);
    assert(x.every((item) => {
        if (!(typeof item === "object" && item !== null && !Array.isArray(item)))
            return false;
        const r = item;
        return keys.every((k) => k in r);
    }), `Expected every object in array to have keys: ${keys.join(", ")}`);
}
// ==========================
// One-of helpers
// ==========================
/** Asserts that x is strictly equal to one of the provided primitive options. */
export function assertOneOfPrimitive(x, options, message) {
    assert(options.includes(x), message ?? `Expected one of [${options.join(", ")}]`);
}
// ==========================
// Aliases for alternative naming style
// ==========================
/** Alias for assertArrayNotEmpty. */
export const assertIsArrayNotEmpty = assertArrayNotEmpty;
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
export function assertOnFail(fn, onFail, options = {}) {
    const { catchNonAssertErrors = false } = options;
    try {
        return fn();
    }
    catch (e) {
        if (e instanceof AssertError) {
            return onFail(e);
        }
        if (catchNonAssertErrors) {
            const err = e instanceof Error ? e : new Error(String(e));
            return onFail(new AssertError(err.message, { cause: err }));
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
export function onFail(fn) {
    return {
        return: (fallback, options) => assertRoute(fallback, fn, {
            catchNonAssertErrors: options?.catchNonAssertErrors,
        }),
        run: (handler, options) => assertOnFail(fn, handler, options),
    };
}
// ==========================
// Equality and identity assertions
// ==========================
function deepEqual(a, b) {
    if (a === b)
        return true;
    if (a && b && typeof a === "object" && typeof b === "object") {
        // Dates
        if (a instanceof Date || b instanceof Date) {
            if (!(a instanceof Date && b instanceof Date))
                return false;
            return a.getTime() === b.getTime();
        }
        // Arrays
        if (Array.isArray(a) || Array.isArray(b)) {
            if (!(Array.isArray(a) && Array.isArray(b)))
                return false;
            if (a.length !== b.length)
                return false;
            for (let i = 0; i < a.length; i++)
                if (!deepEqual(a[i], b[i]))
                    return false;
            return true;
        }
        // Plain objects
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length)
            return false;
        for (const k of aKeys) {
            if (!Object.prototype.hasOwnProperty.call(b, k))
                return false;
            if (!deepEqual(a[k], b[k]))
                return false;
        }
        return true;
    }
    // NaN equals NaN behavior
    return Number.isNaN(a) && Number.isNaN(b);
}
/** Asserts referential/primitive equality (===). */
export function assertEquals(actual, expected, message) {
    assert(actual === expected, message ??
        `Expected ${JSON.stringify(actual)} === ${JSON.stringify(expected)}`);
}
/** Asserts non-equality (!==). */
export function assertNotEquals(actual, expected, message) {
    assert(actual !== expected, message ?? `Expected values to differ`);
}
/** Asserts deep equality using a simple structural comparison (arrays, objects, dates). */
export function assertDeepEquals(actual, expected, message) {
    assert(deepEqual(actual, expected), message ?? `Expected deep equality`);
}
// ==========================
// Subset and key presence
// ==========================
/** Asserts that x is a plain object with at least one own key. */
export function assertNonEmptyRecord(x, message = "Expected non-empty object") {
    assertObject(x, message);
    assert(Object.keys(x).length > 0, message);
}
/** Asserts that `obj` contains all keys/values present in `subset` (deep-equality per key). */
export function assertSubset(obj, subset, message) {
    assertObject(obj, message ?? `Expected object`);
    const r = obj;
    for (const [k, v] of Object.entries(subset)) {
        assert(k in r, message ?? `Missing key: ${k}`);
        assert(deepEqual(r[k], v), message ?? `Mismatched value at key: ${k}`);
    }
}
/** Asserts that `obj` has a defined path (e.g., 'a.b[0].c' via array form). */
export function assertHasPath(obj, path, message) {
    assertObject(obj, message ?? `Expected object`);
    const parts = Array.isArray(path) ? path : path.split(".").filter(Boolean);
    let curr = obj;
    for (const p of parts) {
        const key = typeof p === "number" ? p : p;
        if (curr == null || !(key in curr)) {
            assert(false, message ?? `Missing path: ${parts.join(".")}`);
        }
        curr = curr[key];
    }
}
// ==========================
// Map / Set helpers
// ==========================
/** Asserts that m is a Map containing the given key. */
export function assertMapHasKey(m, key, message) {
    assert(m instanceof Map, message ?? `Expected Map`);
    assert(m.has(key), message ?? `Expected Map to have key`);
}
/** Asserts that s is a Set containing the given value. */
export function assertSetHasValue(s, value, message) {
    assert(s instanceof Set, message ?? `Expected Set`);
    assert(s.has(value), message ?? `Expected Set to contain value`);
}
/**
 * Asserts that object `x` matches the given simple schema. For function rules, the predicate must return true.
 */
export function assertMatchesSchema(x, schema, message) {
    assertObject(x, message ?? `Expected object`);
    const r = x;
    for (const [k, rule] of Object.entries(schema)) {
        const v = r[k];
        if (typeof rule === "function") {
            assert(rule(v), message ?? `Schema predicate failed at ${k}`);
        }
        else {
            switch (rule) {
                case "string":
                    assert(typeof v === "string", message ?? `Expected ${k} to be string`);
                    break;
                case "number":
                    assert(typeof v === "number" && Number.isFinite(v), message ?? `Expected ${k} to be number`);
                    break;
                case "boolean":
                    assert(typeof v === "boolean", message ?? `Expected ${k} to be boolean`);
                    break;
                case "object":
                    assert(typeof v === "object" && v !== null && !Array.isArray(v), message ?? `Expected ${k} to be object`);
                    break;
                case "array":
                    assert(Array.isArray(v), message ?? `Expected ${k} to be array`);
                    break;
                case "date":
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
function canonicalizeString(s) {
    return s.toLowerCase().replace(/\s+/g, "");
}
/** Asserts that x (string) equals expected after canonicalization. */
export function assertStringEqualsCanonical(x, expected, message) {
    assertString(x, message ?? `Expected string`);
    const got = canonicalizeString(x);
    const exp = canonicalizeString(expected);
    assert(got === exp, message ?? `Expected canonical equality`);
}
/** Asserts that x (string) contains needle after canonicalization. */
export function assertStringContainsCanonical(x, needle, message) {
    assertString(x, message ?? `Expected string`);
    const got = canonicalizeString(x);
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
export function confirm(...assertions) {
    try {
        for (const assertion of assertions) {
            assertion();
        }
        return true;
    }
    catch (e) {
        if (e instanceof AssertError) {
            return false;
        }
        // Re-throw non-assertion errors
        throw e;
    }
}
/** Like confirm(), but returns error detail of the first failing assertion */
/** Like confirm(), but returns the first AssertError encountered for diagnostics. */
export function confirmWithError(...assertions) {
    try {
        for (const assertion of assertions)
            assertion();
        return { ok: true };
    }
    catch (e) {
        if (e instanceof AssertError)
            return { ok: false, error: e };
        throw e;
    }
}
/** Run all assertions and aggregate all AssertErrors (continues after failures) */
/** Runs all assertions and aggregates all AssertErrors (continues after failures). */
export function confirmAll(...assertions) {
    const errors = [];
    for (const assertion of assertions) {
        try {
            assertion();
        }
        catch (e) {
            if (e instanceof AssertError) {
                errors.push(e);
            }
            else {
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
    value;
    assertions = [];
    constructor(value, initialAssertions = []) {
        this.value = value;
        // Shallow copy to avoid accidental external mutation
        this.assertions = [...initialAssertions];
    }
    /**
     * Add an assertion to check
     */
    /** Add an assertion to the builder (non-throwing check first, then re-assert for TS narrowing in callbacks). */
    check(assertion) {
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
    run(callback) {
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
    runOr(callback, fallback) {
        const result = this.run(callback);
        return result !== undefined ? result : fallback;
    }
}
export function onConfirmed(value, ...assertions) {
    return new ConfirmationBuilder(value, assertions);
}
/**
 * Typed narrowing builder that carries compile-time narrowing through chained guards.
 *
 * Example:
 * onValue(x).check(assertDefined).check(assertString).run(s => s.toUpperCase())
 */
export class NarrowingBuilder {
    value;
    guards = [];
    constructor(value, initialGuards = []) {
        this.value = value;
        this.guards = [...initialGuards];
    }
    /** Add a guard that narrows V to V2 */
    /** Add a guard; returns a new builder typed to the narrowed V2. */
    check(guard) {
        // We store the guard and return a new builder typed to V2
        const next = new NarrowingBuilder(this.value, [
            ...this.guards,
            guard,
        ]);
        return next;
    }
    /** Execute callback if all guards pass; returns undefined on failure */
    /** Execute fn if all guards pass; returns undefined if an AssertError occurs. */
    run(fn) {
        let v = this.value;
        try {
            for (const g of this.guards)
                g(v);
            // At this point, TS knows v is V (narrowed by type-level check() chaining)
            return fn(v);
        }
        catch (e) {
            if (e instanceof AssertError)
                return undefined;
            throw e;
        }
    }
    /** Execute callback if all guards pass; otherwise return fallback */
    /** Execute fn if all guards pass; otherwise return fallback. */
    runOr(fn, fallback) {
        const r = this.run(fn);
        return r === undefined ? fallback : r;
    }
}
/** Start a typed narrowing chain */
/** Start a typed narrowing chain from an initial value. */
export function onValue(value) {
    return new NarrowingBuilder(value);
}
export function onConfirmedWith(value, ...guards) {
    // We cannot compute final type at runtime, but overloads preserve compile-time inference
    return new NarrowingBuilder(value, guards);
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
export class AssertChain {
    builder;
    constructor(builder) {
        this.builder = builder;
    }
    /** Add a custom guard */
    /** Add a custom guard to the chain. */
    check(guard) {
        return new AssertChain(this.builder.check(guard));
    }
    // ---- Primitive/category guards ----
    /** Assert that the value is a string (alias: isString). */
    string() {
        return new AssertChain(this.builder.check((x) => {
            assertString(x);
        }));
    }
    // Alias: isString()
    /** Alias for .string(). */
    isString() {
        return this.string();
    }
    /** Assert that the value is a number (alias: isNumber). */
    number() {
        return new AssertChain(this.builder.check((x) => {
            assertNumber(x);
        }));
    }
    // Alias: isNumber()
    /** Alias for .number(). */
    isNumber() {
        return this.number();
    }
    /** Assert that the value is a boolean (alias: isBoolean). */
    boolean() {
        return new AssertChain(this.builder.check((x) => {
            assertBoolean(x);
        }));
    }
    // Alias: isBoolean()
    /** Alias for .boolean(). */
    isBoolean() {
        return this.boolean();
    }
    /** Assert that the value is an array (alias: isArray). */
    array() {
        return new AssertChain(this.builder.check((x) => {
            assertArray(x);
        }));
    }
    // Alias: isArray()
    /** Alias for .array(). */
    isArray() {
        return this.array();
    }
    /** Assert that the value is a plain object (alias: isObject). */
    object() {
        return new AssertChain(this.builder.check((x) => {
            assertObject(x);
        }));
    }
    // Alias: isObject()
    /** Alias for .object(). */
    isObject() {
        return this.object();
    }
    /** Assert that the value is a Date (alias: isDate). */
    date() {
        return new AssertChain(this.builder.check((x) => {
            assertDate(x);
        }));
    }
    // Alias: isDate()
    /** Alias for .date(). */
    isDate() {
        return this.date();
    }
    // ---- Nullability ----
    /** Assert that the value is not undefined. */
    defined() {
        return new AssertChain(this.builder.check((x) => {
            assertDefined(x);
        }));
    }
    /** Assert that the value is not null. */
    nonNull() {
        return new AssertChain(this.builder.check((x) => {
            assertNonNull(x);
        }));
    }
    /** Assert that the value is neither null nor undefined. */
    present() {
        return new AssertChain(this.builder.check((x) => {
            assertPresent(x);
        }));
    }
    // ---- Instances ----
    /** Assert that the value is an instance of the given constructor. */
    instanceOf(ctor) {
        return new AssertChain(this.builder.check((x) => {
            assertInstanceOf(x, ctor);
        }));
    }
    // ---- String specifics ----
    /** Assert that the value is a non-empty string (alias: isNonEmptyString). */
    nonEmptyString() {
        return new AssertChain(this.builder.check((x) => {
            assertNonEmptyString(x);
        }));
    }
    // Alias: isNonEmptyString()
    /** Alias for .nonEmptyString(). */
    isNonEmptyString() {
        return this.nonEmptyString();
    }
    /** Assert that the string's length is >= n. */
    stringLengthAtLeast(n) {
        return new AssertChain(this.builder.check((x) => {
            assertStringLengthAtLeast(x, n);
        }));
    }
    /** Assert that the string's length is <= n. */
    stringLengthAtMost(n) {
        return new AssertChain(this.builder.check((x) => {
            assertStringLengthAtMost(x, n);
        }));
    }
    /** Assert that the string contains the given substring or matches regex. */
    stringContains(needle) {
        return new AssertChain(this.builder.check((x) => {
            assertStringContains(x, needle);
        }));
    }
    // ---- Array specifics ----
    /** Assert that the value is a non-empty array (alias: isNonEmptyArray). */
    nonEmptyArray() {
        return new AssertChain(this.builder.check((x) => {
            assertArrayNotEmpty(x);
        }));
    }
    // Alias: isNonEmptyArray()
    /** Alias for .nonEmptyArray(). */
    isNonEmptyArray() {
        return this.nonEmptyArray();
    }
    /** Assert that the array length is exactly len. */
    arrayLength(len) {
        return new AssertChain(this.builder.check((x) => {
            assertArrayLength(x, len);
        }));
    }
    /** Execute callback if all guards pass */
    /** Execute fn if all chained guards pass; otherwise undefined. */
    run(fn) {
        return this.builder.run(fn);
    }
    /** Execute callback if all guards pass; otherwise fallback */
    /** Execute fn if all guards pass; otherwise return fallback. */
    runOr(fn, fallback) {
        return this.builder.runOr(fn, fallback);
    }
}
/** Start a chainable assertion flow */
/** Start an AssertChain over a value (alias exposed under assert.that). */
export function chain(value) {
    return new AssertChain(onValue(value));
}
/** Start a chain with initial guards */
/** Start an AssertChain with initial guards applied. */
export function chainWith(value, ...guards) {
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
(function (assert) {
    // chain starter
    assert.that = __chain;
    assert.onValue = __onValue;
    assert.onConfirmedWith = __onConfirmedWith;
    assert.onConfirmed = __onConfirmed;
    // routes
    assert.route = __assertRoute;
    assert.routeAsync = __assertRouteAsync;
    // confirm utils
    // Prefer builder-style under assert.confirm; boolean variant available as confirmBool
    assert.confirm = __onConfirmedWith;
    assert.confirmBool = __confirm;
    assert.confirmWithError = __confirmWithError;
    assert.confirmAll = __confirmAll;
    // assertions
    assert.isString = __assertString;
    assert.isNumber = __assertNumber;
    assert.isBoolean = __assertBoolean;
    assert.isArray = __assertArray;
    assert.isObject = __assertObject;
    assert.isDate = __assertDate;
    assert.isFunction = __assertFunction;
    assert.isPromiseLike = __assertPromiseLike;
    assert.isDefined = __assertDefined;
    assert.isNonNull = __assertNonNull;
    assert.isPresent = __assertPresent;
    assert.instanceOf = __assertInstanceOf;
    assert.isNonEmptyString = __assertNonEmptyString;
    assert.stringLengthAtLeast = __assertStringLengthAtLeast;
    assert.stringLengthAtMost = __assertStringLengthAtMost;
    assert.stringContains = __assertStringContains;
    assert.isNonEmptyArray = __assertArrayNotEmpty;
    assert.arrayLength = __assertArrayLength;
    // Element visibility assertions (naming consistent with other is* assertion exports)
    assert.isElementHidden = __assertElementHidden;
    assert.isElementVisible = __assertElementVisible;
    // Back-compat alias: promise
    assert.isPromise = __assertPromiseLike;
    // Array content helpers (ergonomic aliases)
    assert.arrayOnlyNumbers = assertArrayOnlyHasNumbers;
    assert.arrayOnlyStrings = assertArrayOnlyHasStrings;
    assert.arrayAllTruthy = assertArrayEveryIsTruthy;
    assert.arrayAllFalsy = assertArrayEveryIsFalsy;
})(assert || (assert = {}));
assert.instanceOf = (x, ctor, message) => assertInstanceOf(x, ctor, message);
assert.isNonEmptyString = (x, message) => assertNonEmptyString(x, message);
assert.stringLengthAtLeast = (x, n, message) => assertStringLengthAtLeast(x, n, message);
assert.stringLengthAtMost = (x, n, message) => assertStringLengthAtMost(x, n, message);
assert.stringContains = (x, needle, message) => assertStringContains(x, needle, message);
assert.isNonEmptyArray = (x, message) => assertArrayNotEmpty(x, message);
assert.arrayLength = (x, len, message) => assertArrayLength(x, len, message);
