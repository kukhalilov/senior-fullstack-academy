# JavaScript WeakMap and WeakSet collections — Exercises and worked solutions

## Goals

Practice selecting weak versus strong collections, storing metadata by object identity, using the ES2026 computed insertion method, validating weak-key assumptions, and preventing repeated work on cyclic data. Every exercise states whether enumeration or deterministic cleanup is required; those requirements decide whether a weak collection fits. [ECMA-262 keyed collections](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

## Worked example

**Task:** Attach parse information to objects without adding properties to them. Reuse a cached value when the object is parsed again. The parse result can be `undefined`, so the solution must still distinguish cached from absent.

```js
const parseMetadata = new WeakMap();

function getParseMetadata(node, parse) {
  if (parseMetadata.has(node)) return parseMetadata.get(node);
  const result = parse(node);
  parseMetadata.set(node, result);
  return result;
}
```

`has` is necessary because `get` returning `undefined` alone cannot distinguish a missing entry from a present `undefined` value. The key must be an object or non-registered symbol. If the expensive computation is naturally a callback and the runtime supports ES2026, `getOrInsertComputed` can express lazy initialization directly; consider its specified reentrancy behavior when the callback writes to the same map. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN getOrInsertComputed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/getOrInsertComputed)

## Exercises

### Exercise 1: Metadata cache

Write `getOrCompute(cache, key, compute)` so it returns an existing value even when that value is `undefined`, otherwise computes once, stores the result, and returns it. Use only operations in the supplied WeakMap inventory. State which argument is required to be callable and which key types are allowed.

### Exercise 2: Eligible values

For each value, predict whether `WeakMap.prototype.set`, `WeakMap.prototype.get`, `WeakSet.prototype.add`, `WeakSet.prototype.has`, and `WeakSet.prototype.delete` throw, return false, or proceed: `{}`, `Symbol("local")`, `Symbol.for("shared")`, `"id"`, and `null`. Explain the rule rather than memorizing a browser error message.

### Exercise 3: Cycle-aware traversal

Write a recursive function that returns the number of distinct object nodes reachable through each node's `children` array. Input may contain cycles and shared children. The function must count each object once. Explain why a WeakSet works for the membership check and why a separate strong collection may still be required if the traversal must return the list of nodes.

### Exercise 4: Pick the collection

Choose Map, Set, WeakMap, or WeakSet for each need and justify the choice: (a) cache metadata by DOM-node identity with no later listing; (b) preserve the ordered set of selected string IDs and render them; (c) mark object instances seen while traversing a graph; (d) count active requests and clear the registry on logout.

## Progressive hints

1. For Exercise 1, check presence before reading; do not test truthiness and do not use `get(...) === undefined` as the missing test.
2. For Exercise 2, apply `CanBeHeldWeakly`: objects pass; symbols pass only if the registry lookup returns `undefined`; other primitives fail. Invalid-key mutation throws, but query/deletion methods have false/undefined outcomes.
3. For Exercise 3, add an object to the visited set before traversing children. If a node has already been seen, stop. Guard against non-object input if the function's contract allows it.
4. For Exercise 4, ask first whether keys/members are primitive and whether the program must count, enumerate, or deterministically clear them. [ECMA-262 weak-key rule](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)

## Complete solutions

### Solution 1

```js
function getOrCompute(cache, key, compute) {
  if (cache.has(key)) return cache.get(key);
  const value = compute(key);
  cache.set(key, value);
  return value;
}
```

`cache` must be a genuine WeakMap; `key` must be an object or non-registered symbol; `compute` must be callable. If computation reenters and writes the same key, this manual sequence's final `set` overwrites that reentrant write with the returned result. The ES2026 `getOrInsertComputed` method also specifies that its computed value overwrites a same-key reentrant write; do not assume it preserves the callback's write. Use the built-in on supported runtimes when its explicit standard behavior and lazy default fit the design. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

### Solution 2

| Input | WeakMap `set` | WeakMap `get` | WeakSet `add` | WeakSet `has` | WeakSet `delete` |
|---|---|---|---|---|---|
| `{}` | stores and returns the map | value or `undefined` | adds and returns the set | boolean membership | boolean removal result |
| `Symbol("local")` | stores if the runtime implements the ES2023 weak-symbol feature | value or `undefined` | adds if implemented | boolean membership | boolean removal result |
| `Symbol.for("shared")` | throws `TypeError` | returns `undefined` | throws `TypeError` | returns `false` | returns `false` |
| `"id"` | throws `TypeError` | returns `undefined` | throws `TypeError` | returns `false` | returns `false` |
| `null` | throws `TypeError` | returns `undefined` | throws `TypeError` | returns `false` | returns `false` |

The same admissibility check applies to WeakMap `getOrInsert`, `getOrInsertComputed`, and `set`: each throws for an invalid key. WeakMap `has` and `delete` return false for invalid values. The function signatures assume genuine collection receivers; an incompatible receiver itself throws. Non-registered-symbol support dates to ECMAScript 2023, but engines may lag the standard. [ECMA-262 `CanBeHeldWeakly`](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html) · [MDN WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)

### Solution 3

```js
function countReachableObjects(root) {
  const visited = new WeakSet();
  let count = 0;

  function visit(node) {
    if (node === null || typeof node !== "object") return;
    if (visited.has(node)) return;
    visited.add(node);
    count += 1;
    for (const child of node.children ?? []) visit(child);
  }

  visit(root);
  return count;
}
```

`visited` prevents both cycles and shared children from being counted twice. The input graph itself strongly references its reachable nodes while traversal runs, so the WeakSet's non-retention property does not remove nodes mid-call. If the result must include the identities themselves, maintain a parallel array or Set and accept that it strongly retains them. [MDN WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)

### Solution 4

| Need | Choice | Reason |
|---|---|---|
| (a) Metadata by DOM-node identity, no listing | WeakMap | The node is the key; external metadata follows key liveness and need not alter node properties. |
| (b) Ordered string IDs to render | Set | Strings are ineligible for weak membership, and the selected IDs must remain enumerable. |
| (c) Object visitation marks | WeakSet | Membership is by exact object identity; the algorithm does not need to list all marked objects. |
| (d) Count and clear active requests | Map or Set, based on whether values are associated with keys | Both needs require deterministic count/reset. A weak collection lacks size and clear. |

## Tests and edge cases

Run these assertions in an ES2026 runtime that implements the current WeakMap additions and non-registered symbol keys:

```js
import assert from "node:assert/strict";

const key = {};
const cache = new WeakMap();
assert.equal(cache.has(key), false);
assert.equal(cache.get(key), undefined);
cache.set(key, undefined);
assert.equal(cache.has(key), true);
assert.equal(cache.getOrInsert(key, "fallback"), undefined);

let calls = 0;
const another = {};
assert.equal(cache.getOrInsertComputed(another, (seen) => {
  calls += 1;
  return seen === another ? 42 : 0;
}), 42);
assert.equal(calls, 1);
assert.equal(cache.getOrInsertComputed(another, () => {
  calls += 1;
  return 0;
}), 42);
assert.equal(calls, 1);

assert.equal(cache.get("bad"), undefined);
assert.equal(cache.has("bad"), false);
assert.equal(cache.delete("bad"), false);
assert.throws(() => cache.set("bad", 1), TypeError);
assert.throws(() => cache.getOrInsert("bad", 1), TypeError);
assert.throws(() => cache.getOrInsertComputed("bad", () => 1), TypeError);

const localSymbol = Symbol("local");
const registeredSymbol = Symbol.for("registered");
cache.set(localSymbol, "symbol value");
assert.equal(cache.get(localSymbol), "symbol value");
assert.throws(() => cache.set(registeredSymbol, 1), TypeError);
```

The symbol assertions intentionally fail on runtimes that predate non-registered-symbol weak keys; test the runtime capability before using this feature in production. Do not try to test garbage-collection timing by dropping a key and asserting that the entry disappears after a delay; the standard does not provide such a timing guarantee.

## Reflection questions

- Does your cache need to report its current entries? If yes, what will strongly retain those keys?
- Can your computed callback modify the same WeakMap? Which method's reentrancy semantics match your intent?
- Are all values used as weak keys actually objects or non-registered symbols, or are some user-visible IDs strings?
- Does the target runtime implement ES2026 insertion methods and ES2023 weak-symbol keys?
- What explicit lifecycle event could replace weak retention if deterministic cleanup becomes necessary?
