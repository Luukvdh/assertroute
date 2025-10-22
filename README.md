**TL;DR:** here’s a compact **README.md** you can drop in.Includes: what each **dist** file is for, how to **import** (ESM/CJS/Browser), and an indexed list of **kept APIs** grouped by category.

### Plan

- Title + one-liner.
- Install + import usage (ESM, CJS, Browser global).
- Dist files explained.
- Core patterns with tiny examples.
- API index (grouped, terse).
- Notes on tree-shaking & types.

Plain function `# assertroute  Tiny, fast runtime assertions with clean TypeScript narrowing.    One source file, multiple outputs (ESM/CJS/IIFE).  ---  ## Install  ```bash  npm i assertroute   `

## Usage

### ESM (Node/Bundlers)

Plain function ``   import {    AssertError,    assert, assertRoute, assertRouteAsync, routeWith, isValid,    assertString, assertArray, assertObject,  } from 'assertroute';  function greet(x: unknown) {    assertString(x);    return `hi ${x}`;  }  const safeGreet = assertRoute('oops', () => greet('Luuk'));      // returns string or 'oops'  const safeFn     = assertRoute('oops', (name: unknown) => greet(name)); // returns wrapped fn   ``

### CommonJS (Node)

Plain function `const {    AssertError, assert, assertRoute, assertArray,  } = require('assertroute');   `

### Browser (IIFE global)

Plain function ``   </div><div class="slate-code_line">  const { assertRoute, assertString } = window.assertroute;</div><div class="slate-code_line">  const say = (x) => { assertString(x); return `hi ${x}`; };</div><div class="slate-code_line">  console.log(assertRoute(&#x27;fallback&#x27;, () => say(&#x27;Luuk&#x27;))); // "hi Luuk"</div><div class="slate-code_line">   ``

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

Plain function `const value = assertRoute(0, () => {    assertNumber(Math.random());    return 42;  }); // 42 or 0 on AssertError   `

### 3) Async route

Plain function `const get = assertRouteAsync(null, async () => {    const r = await fetch('/data'); assert(r.ok);    return await r.json();  }); // Promise   `

### 4) Boolean validator for N asserts

Plain function `const isValidUser = isValid<[unknown]>(    (x) => assertObject(x),    (x) => assertString((x as any).name),  );  isValidUser({ name: 'Luuk' }) // true  isValidUser({ name: 42 })     // false   `

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

Happy asserting.
