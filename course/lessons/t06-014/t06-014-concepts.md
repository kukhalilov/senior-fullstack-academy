# JavaScript WeakMap and WeakSet collections — Core concepts and how they fit together

## Learning objectives

After this lesson, you can explain weak versus strong reachability, select eligible keys, predict each operation's behavior for an invalid key, distinguish membership from enumerable storage, and use a weak collection without assuming that garbage collection is immediate or observable.

## Prerequisites

You should know object identity, references, synchronous iterables, callbacks, and ordinary `Map`/`Set` behavior. A **strong reference** is a reference that makes its target reachable for the program's ordinary lifetime analysis. A **weak reference relationship** does not by itself make its target live. These words describe reachability semantics, not a promise about a specific collector algorithm. [ECMA-262 weak-target processing](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)

## Core concepts

### Collections as side tables

Objects often need data owned by another subsystem. Mutating the object can be inappropriate: it may be frozen, supplied by another library, shared across realms, or intentionally kept free of implementation metadata. A WeakMap stores an external association keyed by the object's identity. A WeakSet stores only membership. Neither uses structural equality: `{ id: 1 }` and another `{ id: 1 }` are distinct identities.

```js
const metadata = new WeakMap();
const first = { id: 1 };
const second = { id: 1 };

metadata.set(first, { parsed: true });
console.log(metadata.get(first).parsed); // true
console.log(metadata.get(second)); // undefined
```

The metadata value may be any JavaScript value. A value can itself refer to the key; the WeakMap entry alone still does not make the key live. Other strong references in the program can, of course, keep either object live. [MDN WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)

### The admissibility rule

The specification's `CanBeHeldWeakly` abstract operation admits every object and a symbol only when `Symbol.keyFor(symbol)` is `undefined`. It rejects numbers, strings, booleans, `null`, `undefined`, bigints, and registered symbols. The rule also admits well-known symbols even though implementations may effectively retain them indefinitely; their set is bounded. `Symbol()` creates a unique non-registered symbol, while `Symbol.for()` uses the shared global registry and therefore produces an inadmissible value. [ECMA-262 CanBeHeldWeakly](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)

```js
const localSymbol = Symbol("local");
const registrySymbol = Symbol.for("shared");
const weak = new WeakMap();

weak.set(localSymbol, "eligible");
console.log(weak.get(localSymbol)); // "eligible"
console.log(Symbol.keyFor(localSymbol)); // undefined
console.log(Symbol.keyFor(registrySymbol)); // "shared"
console.log(weak.has(registrySymbol)); // false
```

Eligibility is a language rule. It does not mean that every key will be collected promptly, or that every key is likely to be collected at all. A well-known symbol is eligible but globally available by definition. [ECMA-262 keyed collections](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

### Why weak collections cannot enumerate

Imagine an API that returned `weakMap.keys()`. Its result could change depending on whether the implementation had collected an otherwise unreachable key. That would make a normal program's visible result depend on collector timing. The specification therefore allows only operations that present a candidate key/value. WeakMap has no `size`, `clear`, `keys`, `values`, `entries`, or iterator; WeakSet has no `size`, `clear`, or iterator. This is a consequence of non-observability, not a missing convenience feature. [ECMA-262 WeakMap and WeakSet objects](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

### Operation outcomes for inadmissible values

The API deliberately distinguishes queries and mutations. WeakMap `get`, `has`, and `delete` return `undefined`, `false`, and `false` for an inadmissible key. WeakMap `set`, `getOrInsert`, and `getOrInsertComputed` throw `TypeError`. WeakSet `has` and `delete` return `false`; `add` throws `TypeError`. A query returning a default-like result does not prove a valid key is absent: `get` returns `undefined` both for a missing key and a present key storing `undefined`, so pair it with `has` when that difference matters. [ECMA-262 keyed collections](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

## Mechanisms and relationships

### Constructors consume iterables

`new WeakMap(iterable)` accepts an optional synchronous iterable whose yielded entries are pair-like: first element is the eligible key and second is the arbitrary value. `new WeakSet(iterable)` consumes values. `null` and `undefined` produce an empty collection. Both constructors retrieve the new instance's `set` or `add` method and call it for each item. That means subclasses or a modified adder can affect construction; a bad entry or thrown adder can make construction fail, and iterator closing follows the iteration protocol. This is why constructor behavior is richer than “copy this array.” [ECMA-262 WeakMap constructor](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

```js
const owner = {};
const weakMap = new WeakMap([[owner, "session"]]);
const weakSet = new WeakSet([owner]);

console.log(weakMap.get(owner)); // "session"
console.log(weakSet.has(owner)); // true
```

### Lazy and eager default insertion

`getOrInsert(key, value)` receives the default value immediately because JavaScript evaluates arguments before calling the method. It stores that value only if the key is absent. `getOrInsertComputed(key, callback)` delays computation until the key is absent, then calls the callback with the key and an `undefined` this-argument. As with any function call, the callback's strictness determines the observed `this` binding: a strict function sees `undefined`, while a sloppy ordinary function substitutes the global object. Arrow functions use their lexical `this`. The callback must be callable even when an entry already exists because the method validates it before checking the entry.

The callback may reenter and modify the same WeakMap. Per the ES2026 algorithm, after the callback returns, if it inserted or changed an entry for the same key, the computed result replaces that value, and the computed result is returned. This differs from a naive “check, callback, then set only if still absent” implementation. [ECMA-262 getOrInsertComputed](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

```js
const cache = new WeakMap();
const key = {};
const result = cache.getOrInsertComputed(key, (currentKey) => {
  cache.set(currentKey, "reentrant value");
  return "computed value";
});

console.log(result); // "computed value"
console.log(cache.get(key)); // "computed value"
```

### Choose collection by required observability

`Map`/`Set` provide strong retention, primitive values where appropriate, size and enumeration. WeakMap/WeakSet trade away those observables so entries can follow weak-key liveness. If a feature must later list all records, count them, clear them at a specific time, or process cleanup deterministically, design explicit ownership with a strong collection and explicit deletion. If the state is class-private, native private fields may communicate ownership more directly than a module-scoped WeakMap.

## Worked examples

### Distinguish missing from stored `undefined`

```js
const table = new WeakMap();
const object = {};
table.set(object, undefined);

console.log(table.get(object)); // undefined
console.log(table.has(object)); // true
console.log(table.has({})); // false
```

`get` alone cannot distinguish these first two states. `has` can, as long as the caller still holds the same identity.

### Detect an object during graph traversal

```js
const visited = new WeakSet();
function visit(node) {
  if (visited.has(node)) return;
  visited.add(node);
  for (const child of node.children ?? []) visit(child);
}
```

This prevents revisiting cycles. If later output must list visited nodes, pair it with a deliberately strong results collection; the WeakSet itself cannot provide that report. Keep `node` values constrained to objects or eligible symbols before calling `add`; this particular tree-walk assumes nodes are objects.

## Misconceptions and edge cases

- **“Weak means a lookup can randomly fail.”** A held eligible key can be queried normally; weak means the entry alone does not keep that key live.
- **“The key disappears as soon as I assign `null`.”** Reclamation timing is implementation-controlled and not observable through a weak collection.
- **“Every symbol is allowed.”** Only non-registered symbols pass the standard rule. `Symbol.for()` values are rejected. `Symbol()` values are accepted.
- **“WeakMap values must be weak too.”** Values may be arbitrary. The entry does not make its key live solely through the collection, even if value points back to key.
- **“`get` returning `undefined` means absent.”** A present entry may store `undefined`; use `has` to distinguish.
- **“`getOrInsertComputed` is a safe exactly-once initializer under reentrancy.”** Its callback can mutate the map; the specified final value is the callback's returned value for that key.
- **“A weak map is secure private storage.”** Code with both the map and key can read metadata. WeakMap avoids adding a discoverable property to the key; it is not a permission system.
- **“WeakMap has species because Map does.”** It does not. The current standard has no weak-collection species accessor; neither weak collection creates derived collections that need one. [ECMA-262 2026](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [ECMA-262 2015](https://262.ecma-international.org/6.0/)

## Knowledge checks with answers

1. **Why does WeakMap have no `size`?** A count could reveal whether a weak key has been collected; that would make results depend on nondeterministic timing.
2. **Can `Symbol()` be a key? What about `Symbol.for()`?** Yes, a unique non-registered symbol can be weakly held. A registry symbol cannot because it is globally shared and fails `CanBeHeldWeakly`.
3. **What does `get` return for an invalid primitive key?** `undefined`; `has` and `delete` return false, while mutation/insertion methods throw.
4. **When does the callback run in `getOrInsertComputed`?** Only for an absent valid key, after validation that the callback is callable; it receives the key and undefined `this`.
5. **When should you use `Map` instead?** When enumeration, count, primitives, or explicit retention/cleanup is part of the requirement.
