# assertroute

Tiny, fast runtime assertions with clean TypeScript narrowing — plus a block-scoped “route” wrapper that converts assertion failures into safe default returns.

Validate at the top; write clear, assumption-friendly logic in the middle. If any `assert*` throws an `AssertError` inside the route, we stop and return your default. Fewer `try/catch`, fewer defensive `if` checks, better narrowing.

Have you always dislikes counting the brackets of you nested conditions? There has got to be a better way!

## Install

```bash
npm i assertroute
```

## Usage

### After (assert-first, block-scoped route)

```ts
import { v } from 'assertroute';

const findClientTags = v.fn<string[]>([], (cdata: unknown, allclients: unknown[]) => {
  v.assertObject(cdata);
  v.assertArray(allclients);
  v.assertArray(cdata.tags, 'Expected tags array');
  v.assertArrayNotEmpty(cdata.tags, 'Tags must not be empty');

  const tags = cdata.tags as string[];
  v.assertArrayOnlyHasStrings(tags, 'Tags must be strings');

  // From here, TypeScript trusts the narrowing;
  // logic reads clearly with fewer conditionals.
  return allclients.filter((x) => Array.isArray(x.tagsShared) && x.tagsShared.some((t) => tags.includes(t))).map((x) => x.name);
});
```

Key benefits:

- Strong narrowing: thrown `AssertError` prunes invalid paths, so TS treats code after asserts as safe.
- Declarative checks: catalog of strict `assert*` helpers replaces scattered `if` guards.
- Localized failure handling: one default return per route instead of many ad-hoc catch/fallbacks.

---

## Dist files

- dist/assertroute.esm.js – ESM build for modern bundlers/Node ESM (import).
- dist/assertroute.cjs – CommonJS build for Node (require).
- dist/assertroute.browser.min.js – IIFE build for browsers (window.assertroute = { … }).
- \*.map – Source maps for debugging.
- assertroute.d.ts (+ .d.ts.map) – TypeScript typings (includes JSDoc).

> package.json uses "exports" and "type": "module". Tree-shaking friendly ("sideEffects": false).

## Core patterns

### 1) Throwing assertions (narrowing)

Plain function `function toUpper(x: unknown) {    assertString(x);    return x.toUpperCase(); // x is string  }   `

### 2) Route with fallback

```ts
const value = v.route(0, () => {
  v.assertNumber(Math.random());
  return 42;
}); // 42 or 0 on if assert failed with AssertError
```

### 3) Async route

```ts
const get = v.async(null, async () => {
  const r = await fetch('/data');
  v.assert(r.ok);
  return await r.json();
}); // Promise
```

### 4) Boolean validator for N asserts

```ts
import { v } from 'assertroute';
const isValidUser = v.confirmOne(() => {
  v.assertObject({ name: 'Luuk' });
  v.assertString('Luuk');
});
// true when single assertion passes
```

## API index (kept)

> All are **function declarations** (narrowing-safe). Names are stable; params are obvious from the name—see editor tooltips or the d.ts.

### Routing

- assertRoute, assertRouteAsync, routeWith, isValid

### Core / Guards

- assert, AssertError
- assertString, assertNumber, assertBoolean, assertArray, assertObject, assertDate, assertFunction
- assertPromiseLike, assertDefined, assertNonNull, assertPresent, assertInstanceOf

### Expect (returns the narrowed value)

- expectString, expectNumber, expectBoolean, expectArray, expectObject, expectDate

### String

- assertNonEmptyString
- assertStringLength, assertStringLengthAtLeast, assertStringLengthAtMost, assertStringLengthBetween
- assertStringContains, assertStringStartsWith, assertStringEndsWith, assertStringMatches
- assertStringEqualsIgnoreCase
- assertStringIncludesAny, assertStringIncludesAll
- assertStringIsJSON, assertStringTrimmedNotEmpty
- assertStringEqualsCanonical, assertStringContainsCanonical

### Number

- assertNumberGreaterThan, assertNumberGreaterOrEqual
- assertNumberLessThan, assertNumberLessOrEqual
- assertNumberBetween
- assertNumberNotZero, assertNumberPositive, assertNumberNonNegative
- assertNumberNegative, assertNumberNonPositive
- assertNumberInteger, assertNumberSafeInteger
- assertNumberApproxEquals
- Aliases: assertIsNotZero, assertIsPositive, assertIsNegative

### Array

- assertArrayNotEmpty, assertArrayLength
- assertArrayHasAnyOf, assertArrayHasEveryOf
- assertArrayItemIsBoolean, assertArrayItemIsString, assertArrayItemIsNumber, assertArrayItemIsObject
- assertArrayIncludesString, assertArrayIncludesNumber, assertArrayIncludesObject
- assertArrayOnlyHasObjects, assertArrayOnlyHasStrings, assertArrayOnlyHasNumbers
- assertArrayEveryIsFalsy, assertArrayEveryIsTruthy
- assertArrayIncludesCondition
- assertArrayUnique
- Alias: assertIsArrayNotEmpty
- **Consistency** (your addition): arrayIsConsistent _(or assertArrayConsistent\* if you used that naming)_

### Object / Keys

- assertHasKey, assertHasKeys, assertKeyEquals, assertSameKeys
- assertAllKeysFalsy, assertAllKeysSet, assertAnyKeyNull
- assertNonEmptyRecord, assertSubset, assertHasPath

### Map/Set

- assertMapHasKey, assertSetHasValue

### Dates

- assertDateEarlier, assertDateLater, assertDateBetween, assertDateYear

### Truthiness / Nullish

- assertTrue, assertFalse, assertNull, assertUndefined

### Equality

- assertEquals, assertNotEquals, assertDeepEquals

### Schema / Enums

- assertMatchesSchema, assertOneOfPrimitive

### DOM (safe outside browser via guards)

- assertElement, assertElementHasChildren, assertElementHasChild
- assertElementHasChildMatching, assertElementHasDescendant
- assertElementHasAttribute, assertElementAttributeEquals
- assertElementHidden, assertElementVisible

### (If you kept the “extra” helpers)

- assertPlainObject, assertNoExtraKeys
- assertArrayOf, assertRecordOf, assertArrayUnique, assertArraySortedNumber
- assertInstanceOfAny, assertURLString, assertUUID, assertEmail
- assertNonEmptyMap, assertNonEmptySet
- assertDeepSubset, assertDiscriminant, assertWithinSet
- assertNever _(exhaustiveness)_

## Notes

- **TypeScript**: all functions are declared (not const) to avoid TS2775; narrowing works reliably.
- **Errors**: assertions throw AssertError (not plain Error).
- **Tree-shaking**: builds are side-effect free. Import only what you use.
- **Browser global**: IIFE exposes window.assertroute with the full API.

Pro tip: keep one canonical name per helper. It improves discoverability, docs, and IntelliSense — no alias sprawl.

Happy asserting.

```

```
