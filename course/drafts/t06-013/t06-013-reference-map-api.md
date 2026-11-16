# JavaScript Map and Set collections — Reference: Map constructor, properties, methods, and symbols

## Scope and version

This reference covers every supplied Map name against ECMAScript 2026 checked 2026-11-16. `Map.groupBy` is from ES2024; `getOrInsert` and `getOrInsertComputed` are ES2026 and MDN marks them Baseline 2026. Older runtimes need a feature check or a fallback. [ECMA-262 keyed collections](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN Map.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy) · [MDN getOrInsert](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsert) · [MDN getOrInsertComputed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsertComputed)

## How this group fits the mental model

Map is an ordered association table keyed by SameValueZero identity/value equality. It differs from an object record because it accepts arbitrary key values without coercing them to property names and offers direct size, iteration, and membership operations. It differs from Set because each Map key has one associated value. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

## Supplied names explained

- `Map` — A constructor requiring `new`. No argument, `undefined`, or `null` creates an empty Map. Otherwise it consumes a synchronous iterable whose elements are pair-like: index/property `0` supplies key and `1` supplies value; extra fields are not part of the key/value pair. It obtains the new instance's `set` method and invokes it for each pair, so subclass or instance overrides participate. Bad entries, invalid `set`, or abrupt iteration cause construction to fail with iterator closing when required by the iteration protocol. [ECMA-262 constructor](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Map.groupBy` — Consumes an iterable and calls the callback for each element in order with `(element, zeroBasedIndex)`. Each callback result is used directly as a key; the returned Map maps each first-seen key to an array of original elements in encounter order. It is not string-key coercion, and object keys compare by identity. The input elements are not deep-cloned. It was standardized in ES2024 and is broadly available in current browsers since March 2024 per MDN. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN Map.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy)
- `Map[Symbol.species]` — A static accessor on the Map constructor; its getter returns the constructor value on which it is accessed (normally `Map`, or a subclass constructor). The accessor is a standardized compatibility surface, but MDN documents it as unused by all current Map methods. `Map.groupBy` constructs an ordinary Map and does not consult this accessor. Overriding species therefore does not customize current Map operation result types. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN Map species](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/Symbol.species)
- `Map.prototype.constructor` — Initially points to `Map`. It is an ordinary writable prototype property, so reassignment is possible; it is not a reliable authenticity or type test. Built-in methods instead require the receiver's Map internal state and throw `TypeError` when borrowed onto an incompatible object. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Map.prototype.size` — An accessor returning the current number of entries. It is inherited from the prototype and has no setter; assignment in strict code fails, while non-strict assignment does not change the collection's size. It throws when its receiver lacks Map internal state. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Map.prototype.clear` — Removes all current entries and returns `undefined`. Existing iterators refer to the same live Map and can observe entries added after the clear. It requires a genuine Map receiver. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Map.prototype.delete` — Removes the entry identified by the supplied key and returns whether an entry existed. Deleting a missing key returns `false`. If that key is later set again, it is a new insertion at the end of iteration order. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Map.prototype.entries` — Returns a new live iterator that yields `[key, value]` pairs in insertion order. It is not an array or snapshot; later mutations can affect what the iterator yields. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Map.prototype.forEach` — Calls the callback for each present entry in insertion order with arguments `(value, key, map)` and returns `undefined`. A supplied `thisArg` is the callback's this-argument, subject to normal strict/sloppy/arrow function rules. Entries deleted before their turn are skipped; newly appended entries may be visited; deleting then re-adding an already visited key can visit it again. Callback exceptions propagate. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Map.prototype.get` — Returns the value for a key or `undefined` if absent. Since `undefined` can itself be stored, pair it with `has` when presence matters. Key matching uses SameValueZero, including object identity, `NaN` matching itself, and `+0`/`-0` equivalence. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Map.prototype.getOrInsert` — Returns an existing key's value, including a stored `undefined`, without replacing it; otherwise stores and returns the supplied default value. The argument expression is evaluated before the method call, so the default is eager. This standardized ES2026 method is marked Baseline 2026 by MDN. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN getOrInsert](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsert)
- `Map.prototype.getOrInsertComputed` — Validates that callback is callable, canonicalizes the key, and returns an existing value without calling the callback. For an absent key, it invokes the callback with the canonicalized key and an `undefined` this-argument, then stores/returns the result. Strict functions observe undefined; sloppy ordinary functions substitute the global object; arrows use lexical `this`. If callback code reentrantly writes the same key, the computed result replaces that entry after callback return. A thrown callback exception propagates; callback side effects before the throw remain. This standardized ES2026 method is marked Baseline 2026 by MDN. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN getOrInsertComputed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsertComputed)
- `Map.prototype.has` — Returns whether an entry exists for the exact key under SameValueZero semantics. Use this when a stored `undefined` must be distinguished from absence. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Map.prototype.keys` — Returns a live insertion-order iterator of keys. It reflects the same current Map and mutation behavior as other Map iterators. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Map.prototype.set` — Adds a key/value pair or updates the value for an existing key, returning the same Map for chaining. Updating does not move its insertion position. `-0` is canonicalized to `+0`; `NaN` is a valid key and matches itself; objects are identity keys. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Map.prototype.values` — Returns a live insertion-order iterator of current values. If an existing entry is updated before its iterator position is reached, the iterator yields the then-current value. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Map.prototype[Symbol.iterator]` — The default iterator method; initially the same function object as `Map.prototype.entries`, so `for...of map` yields `[key, value]` pairs. It is writable/configurable like a prototype method and may be overridden on an instance or subclass. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Map.prototype[Symbol.toStringTag]` — A non-writable, non-enumerable, configurable prototype data property initially containing `"Map"`. It affects the descriptive `Object.prototype.toString` result but is not a secure authenticity test. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

## Cross-item comparison

`get` reads but conflates absent and stored-undefined values; `has` supplies the presence bit. `set` inserts or overwrites and returns the Map; `getOrInsert` preserves a present value and uses an eager default only when absent; `getOrInsertComputed` lazily invokes a callback and defines what happens if that callback reenters. `delete` reports removal; `clear` removes all entries. `entries`/the default iterator expose pairs, while `keys` and `values` project one side. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

`Map` versus an object: Map accepts arbitrary keys without converting them to property keys, has explicit membership and size, and preserves entry insertion order. An object is usually clearer for a fixed named record and integrates with object property syntax/descriptors. `Map.groupBy` is useful when the grouping key is an object identity or another non-property-key value. [MDN Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) · [MDN Map.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy)

`Map[Symbol.species]` is present but does not make current Map methods produce subclass results. This is a legacy accessor rather than an active result-factory hook in this API surface. [MDN Map species](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/Symbol.species)

## Examples

### Stable order, update versus delete/reinsert

```js
const map = new Map([["first", 1], ["second", 2]]);
map.set("first", 10);
console.log([...map.keys()]); // ["first", "second"]
map.delete("first");
map.set("first", 11);
console.log([...map.keys()]); // ["second", "first"]
```

### Group by an identity key

```js
const owner = {};
const records = [{ owner, value: 1 }, { owner, value: 2 }];
const grouped = Map.groupBy(records, (record, index) => record.owner);
console.log(grouped.get(owner).length); // 2
```

The callback also receives the zero-based `index`; it is unused here. Returning a newly created object per callback would create separate groups because each is a different key identity.

### Lazy default insertion

```js
const cache = new Map();
const key = {};
let computations = 0;
const getValue = () => cache.getOrInsertComputed(key, (seenKey) => {
  computations += 1;
  return { seenKey };
});

const first = getValue();
const second = getValue();
console.log(first === second); // true
console.log(computations); // 1
```

## Common mistakes

- Treating Map like an object and expecting `map[key]` or JSON serialization to read the stored entry. Use Map methods.
- Treating structurally equal object literals as interchangeable keys.
- Using `get(key) === undefined` as the only absence check.
- Assuming an iterator snapshots the collection before a loop starts.
- Assuming `Map.groupBy` coerces object keys to their names.
- Expecting `Map[Symbol.species]` to customize `Map.groupBy` or current Map method results.
- Passing an expensive expression to `getOrInsert` and assuming it runs lazily.
- Assuming ES2026 methods exist in older runtime targets.
- Treating `size` as a normal own instance data property; it is a prototype accessor.

## Knowledge checks with answers

1. **What does `Map.groupBy` pass to its callback?** The element and zero-based iterable index.
2. **What does `Map.prototype[Symbol.iterator]` yield?** The same kind of `[key, value]` pairs as `entries()`.
3. **Does updating an existing key move it?** No; delete and reinsert to move it to the tail.
4. **Does the species getter control grouping results?** No; it is unused by current Map methods.
5. **When is the computed insertion callback skipped?** When the key is already present; callback validation still occurs before the presence check.
6. **What result does `get` return for missing key?** `undefined`, which is also a possible stored value, so use `has` to distinguish.
