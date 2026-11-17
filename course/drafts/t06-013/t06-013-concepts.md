# JavaScript Map and Set collections — Core concepts and how they fit together

## Learning objectives

By the end, you can distinguish collection semantics from object properties and array indexes; predict key equality and order; reason about mutation during iteration; group by object identity; and understand why Set algebra uses a size/has/keys protocol.

## Prerequisites

Know JavaScript primitive and object values, references, synchronous iterables, callbacks, and `for...of`. **Identity** means a particular object or symbol value, not a structure that happens to look alike. A **collection** stores multiple values under explicit insertion, lookup, deletion, and traversal rules.

## Core concepts

### Map models associations; Set models membership

A Map answers “what value is associated with this key?” A Set answers “is this value present?” Each Map key occurs at most once; each Set value occurs at most once. Adding a duplicate Set value is a no-op. Setting an existing Map key replaces its value without adding a second row. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

Map and Set keys can be primitive or object values. Object keys are compared by identity:

```js
const first = { code: "A" };
const second = { code: "A" };
const records = new Map([[first, "saved"]]);
console.log(records.get(first)); // "saved"
console.log(records.get(second)); // undefined
```

This is different from property access on an ordinary object, where property keys are strings or symbols (object values used in brackets are converted to property keys). Map can therefore use an object itself as a stable, uncoerced key.

### Equality and edge values

Map and Set use SameValueZero semantics. `NaN` compares as equal to itself; `+0` and `-0` identify one key/member; strings compare by their value; objects compare by identity. Map/Set canonicalize a stored negative-zero key/value to positive zero. The equality rules are not strict structural comparison and do not serialize objects. [ECMA-262 keyed collections](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

```js
const values = new Set([NaN, NaN, -0, +0]);
console.log(values.size); // 2
console.log(values.has(NaN)); // true
console.log(Object.is([...values][1], -0)); // false; stored zero is +0
```

### Insertion order and mutation

New keys/members appear at the end. Replacing an existing Map value does not move its position. Deleting and then adding the same key creates a new insertion at the end. Iterators and `forEach` operate on the live collection state, not a copy: entries removed before they are reached are skipped; new entries appended before the traversal finishes can be visited; deleting a previously visited entry and adding it again can make it appear again at the end. Avoid using collection mutation during iteration as an implicit queue unless this live behavior is intended. [ECMA-262 iteration algorithms](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

```js
const map = new Map([["a", 1], ["b", 2]]);
const visited = [];
map.forEach((value, key) => {
  visited.push(key);
  if (key === "a") {
    map.delete("b");
    map.set("c", 3);
  }
});
console.log(visited); // ["a", "c"]
```

### Iterables and constructors

The Map constructor consumes a synchronous iterable that yields pair-like values; the first indexed element becomes a key and the second a value. The Set constructor consumes values. Both accept omitted, `undefined`, or `null` as an empty input, retrieve their new instance's `set`/`add` method, and call it for each yielded element. Therefore constructor initialization can be influenced by subclass overrides. An invalid pair/value, failing iterator, or throwing adder can cause construction to fail, with iterator closing handled under the synchronous iteration protocol. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

Map iterators from `entries()` (also its default iterator) yield `[key, value]`; `keys()` yields keys and `values()` yields values. Set `values()` and `keys()` return the same value iteration; `entries()` yields `[value, value]` to resemble Map's interface. `forEach` callback argument order differs: Map uses `(value, key, map)`, while Set uses `(value, value, set)`.

### Grouping with keys that remain meaningful

Map.groupBy accepts an iterable and a callback, called with each element and its zero-based index. Each returned value is used directly as a Map key. The output is a Map from each first-seen group key to an array of original elements in encounter order. Object keys stay tied to identity and can be mutated without changing which group they identify. Group arrays and input elements are not deep-copied. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN Map.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy)

### Map default insertion

`getOrInsert` returns the present value or stores a provided default; its default expression is evaluated before the call. `getOrInsertComputed` validates a callback, returns an existing value without calling it, or calls it with the key and an undefined this-argument. In a strict callback, `this` is undefined; sloppy and arrow functions follow normal JavaScript this-binding rules. The algorithm checks again after the callback: if it reentrantly wrote the same key, the computed result replaces that value. These methods were standardized in ECMAScript 2026 and may be unavailable in older runtimes. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN getOrInsert](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsert) · [MDN getOrInsertComputed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsertComputed)

### Set algebra and its set-like protocol

Set composition does not require the `other` operand to be an actual Set or even to be iterable. It must provide a numeric `size`, callable `has`, and callable `keys`; algorithms that need to traverse it call `keys()` and consume that iterator. A plain array has an iterator but lacks the other required pieces, so it is not sufficient. Map is set-like because it supplies `size`, `has`, and `keys()` (its keys—not entry pairs—are yielded). [ECMA-262 GetSetRecord](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

For a real Set `A` and set-like `B`, the operations represent ordinary membership relations: `A.union(B)` includes either side; `A.intersection(B)` includes both; `A.difference(B)` includes A without B; `A.symmetricDifference(B)` includes values present on exactly one side; `isDisjointFrom`, `isSubsetOf`, and `isSupersetOf` return booleans. The seven operations were standardized in ES2025. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

The returned order is observable. Union keeps the receiver's order and appends unseen values in the other operand's `keys()` order. Difference keeps receiver order. Symmetric difference keeps receiver-only values first, then other-only values in its keys order. Intersection iterates whichever side is smaller according to reported `size`, so its result order follows that side. For a custom set-like object with an inaccurate size or unstable methods, algorithm choice and result may be surprising; implement the protocol honestly.

`GetSetRecord` reads the other object's `size` first, converts it to a Number and then an integer-or-infinity, and rejects NaN (`TypeError`) or negative values (`RangeError`). Fractions truncate toward zero and positive Infinity is allowed. It then requires callable `has` and `keys`. Because these are ordinary property reads and calls, getters and custom methods can run or throw; custom implementations should be side-effect-aware and report coherent data.

## Mechanisms and relationships

### `has` is different from testing `get`

`get(key)` returns `undefined` both when a key is absent and when it is present with value `undefined`. If that difference matters, use `has(key)` first. `getOrInsert` and `getOrInsertComputed` preserve a present `undefined` rather than replacing it with a default. Avoid `map.set(key, map.get(key) ?? fallback)` when nullish values are legitimate stored values.

### Strong lifetime versus weak lifetime

Map and Set strongly retain entries as long as the collection is reachable and the entry remains. This gives deterministic listing, count, and deletion. WeakMap/WeakSet use a different relationship for object/non-registered-symbol keys and cannot enumerate or count. Select based on desired lifetime and observability, not because “weak” sounds automatically more efficient. [MDN Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) · [MDN WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)

### Species accessors are not result factories here

The `Map.prototype` and `Set.prototype` constructor properties themselves are non-writable, non-enumerable, and non-configurable. The referenced prototype objects are ordinary objects without the collection's internal data slot, so their inherited `size` getters and collection methods throw `TypeError` when used with the prototype as receiver. Each actual Map or Set instance receives the required internal slot during construction. [ECMA-262 keyed collections](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

The Map and Set constructor species accessors are still standardized. Each returns the receiver constructor and may be overridden by subclasses. However, MDN documents both as unused by all current methods; Map.groupBy constructs a Map and Set algebra constructs a Set rather than consulting those accessors. Do not assume a subclass gets subclass instances from these newer methods. [MDN Map species](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/Symbol.species) · [MDN Set species](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/Symbol.species)

## Worked examples

### Membership and deduplication

```js
const attendees = new Set(["Ari", "Bo", "Ari"]);
attendees.add("Dee");
console.log([...attendees]); // ["Ari", "Bo", "Dee"]
console.log(attendees.has("Bo")); // true
```

### Map group by mutable object identity

```js
const teamA = { id: 1, label: "Alpha" };
const jobs = [{ team: teamA, id: "j1" }, { team: teamA, id: "j2" }];
const byTeam = Map.groupBy(jobs, (job) => job.team);
teamA.label = "Renamed";
console.log(byTeam.get(teamA).length); // 2
```

Mutating the object does not alter its identity. A newly created `{ id: 1 }` would not retrieve this group.

### Custom set-like operand

```js
const known = new Set(["read", "write"]);
const required = {
  size: 2,
  has(value) { return value === "read" || value === "admin"; },
  *keys() { yield "read"; yield "admin"; },
};
console.log([...known.intersection(required)]); // ["read"]
```

The `keys()` method is part of the contract; implementing only `[Symbol.iterator]` would not satisfy Set algebra's set-like protocol.

## Misconceptions and edge cases

- **“Map compares object keys by their fields.”** It compares object identity.
- **“Map `get` returning undefined means the key is absent.”** A present value can be undefined; use `has`.
- **“Updating a Map key moves it to the end.”** No; replacement keeps its order. Delete then reinsert to move it.
- **“A for-of loop copies the Map first.”** Iteration is live; additions/deletions can change later visits.
- **“Any iterable works with Set algebra.”** It requires a set-like object with size, has, and keys.
- **“Set intersection always follows the receiver's order.”** It can follow the `other.keys()` order when the other side reports a smaller size.
- **“Species decides the result type of every built-in collection operation.”** Current Map/Set methods do not consult those accessors.
- **“A default expression passed to `getOrInsert` is lazy.”** It is evaluated before method call; use the computed form for lazy work.
- **“The ES2026 methods are available in every JavaScript runtime.”** ECMAScript editions and runtime deployment dates are separate; check targets.

## Knowledge checks with answers

1. **Why can two `{ id: 1 }` keys both exist in one Map?** They are separate object identities.
2. **What equality makes `new Set([NaN, NaN]).size` equal one?** SameValueZero treats NaN as equal to itself.
3. **Does replacing an existing Map value move the key?** No, insertion order remains unchanged.
4. **What does a Set-like object provide?** `size`, callable `has`, and callable `keys`.
5. **Which order does intersection use?** It uses this Set order when its size is no greater than the other's reported size; otherwise it iterates `other.keys()`.
6. **Does the Map species accessor control `Map.groupBy`?** No; the current operation constructs an ordinary Map and the accessor is unused by current Map methods.
