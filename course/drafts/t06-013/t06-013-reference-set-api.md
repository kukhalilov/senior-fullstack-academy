# JavaScript Map and Set collections — Reference: Set constructor, properties, methods, and symbols

## Scope and version

This lesson explains all 21 supplied Set names against ECMAScript 2026, checked 2026-11-16. The seven algebra/relationship methods were standardized in ECMAScript 2025; MDN reports broad current-browser availability beginning in June 2024, while older runtimes may still need feature checks. [ECMA-262 keyed collections](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) · [MDN difference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/difference)

## How this group fits the mental model

Set is an ordered collection of unique values, with membership determined by SameValueZero. It has no separate key/value payload; each value is its own membership key. The core operations add, test, delete, clear, and iterate. ES2025 adds mathematical composition and relation methods that accept Set-like objects. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

## Supplied names explained

- `Set` — A constructor requiring `new`. No argument, `undefined`, or `null` creates an empty Set; otherwise it consumes a synchronous iterable of values and calls the new instance's `add` method for each. Subclass overrides can affect initialization. Duplicate values collapse by SameValueZero, and invalid iterator/adder completion throws with iterator closing when required. [ECMA-262 constructor](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Set[Symbol.species]` — A static accessor on the Set constructor. Its getter returns the constructor value on which it was called, which permits subclass override. The accessor is standardized but MDN documents it as unused by all current Set methods. Set algebra results are ordinary Set instances and do not consult species. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN Set species](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/Symbol.species)
- `Set.prototype.constructor` — Initially references `Set`. It is a mutable prototype property and not a trustworthy authenticity test; native Set methods require internal Set state. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Set.prototype.size` — An inherited getter returning the current number of unique members. It has no setter and throws if its receiver lacks Set internal state. It is not an own data property on each Set instance. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Set.prototype.add` — Inserts a value if no SameValueZero-equivalent value is present and returns the same Set for chaining. Re-adding a present value does not change its insertion position. `NaN` matches `NaN`; `+0` and `-0` are one value; objects compare by identity. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Set.prototype.clear` — Removes all current members and returns `undefined`. It does not replace the Set object; aliases continue to refer to the now-empty collection. Iterators already associated with the Set operate on its live state and may observe later additions. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Set.prototype.delete` — Removes the matching value and returns `true` when present, otherwise `false`. If re-added after deletion, it appears at the end of insertion order. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Set.prototype.difference` — Returns the values in this Set but not in the `other` set-like object. Result order follows this Set's insertion order. It may iterate this Set and call `other.has`, or iterate `other.keys`, depending on their reported sizes; the required `other` interface is `size`, callable `has`, and callable `keys`, not just `[Symbol.iterator]`. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN difference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/difference)
- `Set.prototype.entries` — Returns a live iterator yielding `[value, value]` pairs in insertion order. The duplicated pair shape keeps Set iteration similar to Map even though Set has no separate key and value. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Set.prototype.forEach` — Invokes the callback as `(value, value, set)` for each present member in insertion order and returns `undefined`. The second argument duplicates the first for compatibility with Map's callback shape. A supplied `thisArg` provides the callback's this-argument under normal JavaScript function rules. Mutation is live: appended values may be visited; a visited value deleted and re-added before completion may be visited again; values removed before their turn are skipped unless re-added. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Set.prototype.intersection` — Returns values present in both operands. If this Set is no larger than `other.size`, it checks this Set's values against `other.has` and preserves this Set order. Otherwise it iterates `other.keys()` and retains values present in this Set, so result order follows the other keys order. A custom set-like object's `size`, `has`, or `keys` behavior can therefore affect result order and method calls. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN intersection](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/intersection)
- `Set.prototype.isDisjointFrom` — Returns `true` if no value is present in both operands; otherwise `false`. It can stop as soon as an overlap is found and chooses a traversal strategy based on reported sizes. Like other relation methods, it accepts a set-like object and requires a real Set receiver. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Set.prototype.isSubsetOf` — Returns whether every member of this Set is included in `other`. It can reject immediately when this Set is larger than `other.size`; otherwise it checks the required membership relation. It returns a boolean and does not construct a Set. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Set.prototype.isSupersetOf` — Returns whether this Set contains every value exposed by `other.keys()`. It can reject immediately when this Set is smaller than the reported other size, then checks the other keys. Since a custom set-like object's size/keys can be inconsistent, implement that protocol coherently. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Set.prototype.symmetricDifference` — Returns values present in exactly one operand. The result order is this Set's values not in `other`, followed by values from `other.keys()` not in this Set. Duplicate values yielded by a custom `keys()` iterator do not create duplicate Set members. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Set.prototype.union` — Returns all distinct values from either operand. It starts with this Set's insertion order, then appends previously absent values in `other.keys()` order. It accepts set-like values such as Map or a custom object with the required protocol. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN union](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/union)
- `Set.prototype.has` — Returns whether a SameValueZero-equivalent value is present. Object values are compared by identity, not by their properties. `NaN` is found and negative zero is treated as positive zero. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Set.prototype.keys` — Returns a live iterator of values in insertion order. It is initially the same function object as `Set.prototype.values`; the name exists for Map-like protocol compatibility, including Set-like consumers. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Set.prototype.values` — Returns a live iterator of values in insertion order. It is the default Set iterator and is initially identical to `keys`. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Set.prototype[Symbol.iterator]` — The default iterator method, initially the same function object as `Set.prototype.values`. It makes Set directly consumable by `for...of`, spread, and ordinary iterable APIs. It does not make Set algebra accept any arbitrary iterable as its `other` operand. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `Set.prototype[Symbol.toStringTag]` — A non-writable, non-enumerable, configurable prototype data property initially containing `"Set"`. It provides a descriptive tag, not a secure authenticity check. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

## Cross-item comparison

`union` combines; `intersection` keeps shared values; `difference` is directional (this minus other); `symmetricDifference` keeps one-sided membership. The three relation methods return booleans and create no output collection. Their set-like operand must supply `size`, `has`, and `keys`. A Map qualifies: its `keys()` yields the key side, not its `[key, value]` entry pairs. An Array's iterator alone is insufficient. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

`Set` versus `Array`: Set deduplicates by equality, has direct membership and set algebra, and preserves first insertion order. Array retains duplicates and indexes; it is often the natural structure when positions or repeated values matter. Set versus Map: Set has membership without a payload; Map associates a payload with each key. [MDN Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)

Species is present but unused by current Set methods, so it does not select subclass result types for algebra. [MDN Set species](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/Symbol.species)

## Examples

### Set algebra with insertion order

```js
const roles = new Set(["reader", "editor"]);
const defaults = new Set(["reader", "admin"]);
console.log([...roles.union(defaults)]); // ["reader", "editor", "admin"]
console.log([...roles.difference(defaults)]); // ["editor"]
console.log([...roles.symmetricDifference(defaults)]); // ["editor", "admin"]
```

### Map as a set-like operand

```js
const selected = new Set(["a", "b", "c"]);
const lookup = new Map([["b", 20], ["c", 30]]);
console.log([...selected.intersection(lookup)]); // ["b", "c"]
```

The intersection checks Map keys via `size`, `has`, and `keys`; it does not compare the Map's values or iterate its entry pairs.

### A plain iterable is not enough

```js
const allowed = new Set(["read", "write"]);
const array = ["read"];
try {
  allowed.intersection(array);
} catch (error) {
  console.log(error instanceof TypeError); // true
}
```

Provide a real Set/Map or an object that deliberately implements the set-like protocol.

## Common mistakes

- Assuming `new Set(array)` and `set.intersection(array)` share input rules. The constructor accepts an iterable; composition requires set-like properties.
- Assuming `keys()` yields `[value, value]`; only `entries()` does. `keys()` and `values()` both yield values.
- Assuming `intersection` always follows this Set's order; it follows the smaller operand's traversal order.
- Assuming `union` returns a sorted result; it preserves insertion order, not numerical or lexical sorting.
- Assuming species determines algebra result type; the current methods do not use it.
- Assuming `forEach` callback arguments match Map; Set passes the same value twice, then the Set.
- Mutating the Set during traversal without reasoning about live iteration.
- Using two object literals with equal fields and expecting duplicate collapse.
- Treating custom `size` as advisory; it influences strategy and short-circuits, so incorrect size can change outcomes for malformed set-like objects.

## Knowledge checks with answers

1. **Can an Array be passed directly to `union`?** No, iterable alone is insufficient; the operand needs size, has, and keys.
2. **What is the callback shape for Set `forEach`?** `(value, value, set)`.
3. **What order does union use?** This Set's members first, then unseen values in the other's keys order.
4. **When can intersection use the other operand's order?** When this Set is larger than the other's reported size and the algorithm traverses `other.keys()`.
5. **Does species control a Set algebra result?** No, current Set methods do not consult it.
6. **What does `Set.prototype.keys()` yield?** Values, exactly like `values()`.
