# JavaScript WeakMap and WeakSet collections — Reference: WeakMap constructor, properties, and methods

## Scope and version

This lesson covers all nine names in the supplied WeakMap API inventory against ECMAScript 2026, the current published edition checked 2026-11-16. The two default-insertion methods are ES2026 features and may be absent in older runtimes. Their standard semantics and current availability notes are linked beside the discussion. [ECMA-262 keyed collections](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN getOrInsert](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/getOrInsert) · [MDN getOrInsertComputed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/getOrInsertComputed)

## How this group fits the mental model

A WeakMap is an identity-keyed side table. It is useful when metadata should be reachable through a key the caller already has, while the table itself must not keep that key alive. The stored value is unrestricted; the key must be an object or a non-registered symbol. There is no enumeration or count because observing those would expose garbage-collection timing. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)

## Supplied names explained

- `WeakMap` — A constructor that must be called with `new`; direct `WeakMap()` throws `TypeError`. It creates an empty map when its argument is omitted, `undefined`, or `null`. Otherwise it consumes a synchronous iterable of pair-like entries. For each entry it obtains and calls the new object's `set` method, so an overridden `set` can affect subclass construction. An invalid key or abrupt iterator/adder completion causes construction to fail; the iterator is closed on abrupt completion under the iterable protocol. Values may be primitives or objects. [ECMA-262 constructor](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `WeakMap.prototype.constructor` — The inherited prototype property whose initial value is the `WeakMap` constructor. It is a normal writable/configurable prototype property and can be reassigned; it is not a reliable brand check. Methods use the internal WeakMap slot, so an object with a copied `get` method but no WeakMap internal state throws `TypeError`. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `WeakMap.prototype.delete` — Removes the entry for the exact key identity and returns `true`; returns `false` when no entry exists or the argument cannot be held weakly. It does not throw merely because the argument is a primitive. It throws if `this` is not a genuine WeakMap instance with the required internal state. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `WeakMap.prototype.get` — Returns the value associated with an eligible key, or `undefined` when absent or when the key is inadmissible. Because a present entry may deliberately store `undefined`, use `has` when the distinction matters. Key matching is identity for objects and identity for symbols. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `WeakMap.prototype.getOrInsert` — If an eligible key is present, returns its current value without replacing it. If absent, stores and returns the supplied default. JavaScript evaluates the default argument before the call, even when the key is already present; use the computed variant to defer expensive work. Inadmissible keys throw `TypeError`. This method became a standardized WeakMap method in ECMAScript 2026; MDN marks it Baseline 2026. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN getOrInsert](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/getOrInsert)
- `WeakMap.prototype.getOrInsertComputed` — For an eligible key, returns the existing value without calling the callback. Otherwise it requires a callable callback and calls it with the key and an `undefined` this-argument. Strict callbacks observe `this === undefined`; sloppy ordinary callbacks substitute the global object, and arrows retain lexical `this`. It stores the callback result and returns it. An invalid key or non-callable callback throws `TypeError`. If the callback reentrantly writes that same key in this WeakMap, the post-callback algorithm overwrites that entry with the computed result and returns that result. Exceptions from the callback propagate; this method does not perform a computed insertion if the callback throws, though callback side effects before the throw remain. This ES2026 method is newly broadly available in current browsers since 2026, but older targets need a compatibility plan. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN getOrInsertComputed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/getOrInsertComputed)
- `WeakMap.prototype.has` — Returns `true` for an existing entry keyed by the exact eligible identity; `false` if missing or if the argument is inadmissible. This is the way to distinguish a missing key from an existing key storing `undefined`. A wrong receiver still throws `TypeError`. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `WeakMap.prototype.set` — Adds or replaces the value for an eligible key and returns the same WeakMap instance, so calls can be chained. The value can be any JavaScript value. An inadmissible key throws `TypeError`; an invalid receiver does as well. Setting the same identity updates its value rather than creating a second entry. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `WeakMap.prototype[Symbol.toStringTag]` — An own, non-writable, non-enumerable, configurable data property on the prototype whose initial value is `"WeakMap"`. It influences `Object.prototype.toString.call(map)` for an ordinary WeakMap, but tags are not a secure authenticity test: user code can modify relevant properties or create lookalike objects. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

## Cross-item comparison

`get` is a read with a potentially ambiguous `undefined` result; `has` provides the separate presence bit. `set` always overwrites an existing key and returns the map; `getOrInsert` preserves the existing value and otherwise stores an eager default; `getOrInsertComputed` does the same with lazy computation. `delete` reports whether it removed an entry. `WeakMap` construction can batch-initialize from an iterable but is not itself a way to recover the collection's entries later. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

There is no within-group static species accessor: neither the current standard's WeakMap constructor properties nor its prototype methods define derived-collection construction. The manifest previously included two incorrect species names; they were removed after checking the current standard and the original ES2015 standard. [ECMA-262 2026](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [ECMA-262 2015](https://262.ecma-international.org/6.0/)

## Examples

### Metadata with presence distinct from value

```js
const metadata = new WeakMap();
const element = {};

metadata.set(element, undefined);
console.log(metadata.get(element)); // undefined
console.log(metadata.has(element)); // true
console.log(metadata.getOrInsert(element, "fallback")); // undefined; existing value wins
```

### Lazy cache and specified reentrancy

```js
const cache = new WeakMap();
const token = {};

const value = cache.getOrInsertComputed(token, (key) => {
  cache.set(key, "temporary");
  return { calculatedFor: key };
});

console.log(cache.get(token) === value); // true
```

The callback's own write is replaced by the computed result because that is the specified post-callback behavior. The callback is trusted application code, so avoid side effects unless this interaction is intentional. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

### Initialize from entry pairs

```js
const first = {};
const second = {};
const labels = new WeakMap([
  [first, "first"],
  [second, "second"],
]);

console.log(labels.get(second)); // "second"
```

## Common mistakes

- Treating `get(key) === undefined` as proof that no key exists; the stored value may be `undefined`.
- Passing `null`, a string, a number, a registered symbol, or another ineligible primitive to `set` or either insertion method; these throw rather than coercing.
- Expecting a lazy default from `getOrInsert`; the argument expression runs before the method is invoked.
- Assuming `getOrInsertComputed` never runs side effects when reentrant code mutates the map; its final store is specified and can overwrite that reentrant write.
- Assuming constructor input is a plain array only. Any synchronous iterable producing two-element pair-like values may be used.
- Assuming WeakMap has `size`, `clear`, iteration, or a species accessor because Map has related features. It does not have these standardized APIs.
- Using `Object.prototype.toString` or `.constructor` as a security brand check.
- Treating the ES2026 addition as automatically available in old browsers or older server runtimes.

## Knowledge checks with answers

1. **How do you tell absent from present-with-undefined?** Call `has(key)`; `get` alone cannot distinguish them.
2. **Does `getOrInsert(key, expensive())` defer the call?** No. The argument is evaluated first; use `getOrInsertComputed` for lazy work.
3. **What is returned when the computed callback reentrantly writes the same key and then returns a value?** The callback's returned value; the algorithm updates that key to the computed value afterward.
4. **What does `delete("x")` do on a valid WeakMap?** Returns `false`; invalid weak keys are non-throwing for `delete`.
5. **Can the value refer back to the key and thereby make the key strongly live through the entry?** No; the weak association alone does not make the key live. A separate strong path elsewhere can.
6. **Why was the species inventory entry removed?** Current and original ECMAScript specifications define no WeakMap species accessor; the getter is unnecessary for these non-derived collection APIs.
