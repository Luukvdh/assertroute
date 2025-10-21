# assumed

Fast and very versatile asserter

## Quick guide: pick a primitive, then chain

Start by choosing the primitive guard that matches your value. That unlocks focused methods:

- that(x).isString() → notEmpty, minLength, contains, matches, …
- that(x).isNumber() → greaterThan, between, …
- that(x).isArray() → notEmpty, hasLength, itemIsString, onlyHasNumbers, …
- that(x).isObject() → hasKey, hasKeys, keyEquals, sameKeys, …
- that(x).isDate() → earlier, later, isYear, daysSinceAtLeast, …

Example:

const id = that(input.id)
.isString("id must be string")
.minLength(3)
.commit();

## Passing functions: shapes spelled out

Many APIs take functions; here’s what they expect:

- assuming(...).Run(fn)
  - fn: () => R
  - Runs only when assumptions pass; result captured by value().

- assuming(...).onRefuted(fn)
  - fn: (err?: unknown) => unknown
  - Runs only on failure; its return captured by value().

- assuming(...).result(success, failure?)
  - success: () => R
  - failure?: (err?: unknown) => R

- assuming(...).emitOn(condition, event, data?)
  - condition: boolean | () => boolean
  - event: string
  - data?: unknown | () => unknown

## assumedRoute: your using-block wrapper

Wrap a handler and always return a safe default value if an error occurs. No custom error callback needed.

// sync
const safeAdd = assumedRoute(0, (a: unknown, b: unknown) =>
that(a).isNumber().commit() + that(b).isNumber().commit()
);
safeAdd(1, 2); // 3
safeAdd(1, undefined); // 0 (default)

// async
const safeFetch = assumedRoute({ ok: false }, async (id: unknown) => {
that(id).isString().minLength(3).commit();
return fetchThing(id);
});
await safeFetch("x"); // { ok: false }
