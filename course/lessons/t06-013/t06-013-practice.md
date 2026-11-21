# JavaScript Map and Set collections — Exercises and worked solutions

## Goals

Build practical fluency with identity-based Map keys, Set uniqueness, map grouping, default insertion, insertion order, and set algebra. Decide explicitly when to use a plain object or array and when runtime compatibility should influence API choice. New Map insertion methods require an ES2026-capable runtime; Set algebra methods are ES2025. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

## Worked example

**Task:** Count how many times each word appears, preserving words with different casing as distinct keys. Return the count for a word without replacing an existing value.

```js
function countWords(words) {
  const counts = new Map();
  for (const word of words) {
    counts.set(word, counts.getOrInsert(word, 0) + 1);
  }
  return counts;
}

const result = countWords(["Map", "Set", "Map"]);
console.log([...result]); // [["Map", 2], ["Set", 1]]
```

The `getOrInsert` call returns the existing value (including zero) or inserts the default. It is ES2026; if targeting older runtimes, write the `has`/`get`/`set` logic explicitly. The `Map` preserves first insertion order, so the first word encountered remains first even when its count changes. [MDN getOrInsert](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsert)

## Exercises

### Exercise 1: Object identity, not object shape

Create a Map for two separate objects that have the same `id` property. Store different values. Show that retrieving by the original references succeeds and retrieving by a third lookalike object is absent. Explain what would change if you used each `id` string as the key.

### Exercise 2: Group by object key

Given a list of orders with `customer` object references and `amount`, use Map.groupBy to group them by customer identity, then compute the total for one customer. Preserve each order's original reference. Explain the callback's index argument and why a new object with copied customer properties does not retrieve the group.

### Exercise 3: Required and granted permissions

Given `required` and `granted` Sets, calculate missing permissions, extra permissions, and whether all required permissions are granted. Use Set algebra. State the output ordering rules.

### Exercise 4: Custom set-like operand

Create a set-like object for a Map whose keys are candidate permissions. Use it with `intersection`. Which Map components participate? Explain why its default iterator is not the method used by the Set algebra operation.

### Exercise 5: Mutation during iteration

Start with a Map containing keys `a` and `b`. In `forEach`, when visiting `a`, delete `b` and add `c`. Predict visits. Then modify the exercise to delete a key after it was visited and add it again; predict how that changes traversal.

## Progressive hints

1. For Exercise 1, object identity is not the `id` field. A third literal always has a distinct identity.
2. For Exercise 2, return `order.customer` from the grouping callback, then use that same reference with `get`.
3. For Exercise 3, define “extra” direction carefully: granted minus required. Difference is directional.
4. For Exercise 4, a Map already has `size`, `has`, and `keys`; `keys()` yields keys, which is exactly what Set algebra uses.
5. For Exercise 5, `forEach` is live. A not-yet-visited deleted value is skipped; a newly appended value may be visited; deleting/re-adding an already visited value moves it to the tail and permits another visit.

## Complete solutions

### Solution 1

```js
const first = { id: "same" };
const second = { id: "same" };
const lookalike = { id: "same" };
const byObject = new Map();
byObject.set(first, "first record");
byObject.set(second, "second record");

console.log(byObject.size); // 2
console.log(byObject.get(first)); // "first record"
console.log(byObject.get(second)); // "second record"
console.log(byObject.get(lookalike)); // undefined
```

If the map were keyed by `id`, the two records would collide because both strings are `"same"`. That may be desirable if ID defines the domain identity, but it discards the independent object identity distinction.

### Solution 2

```js
const customerA = { name: "Mina" };
const customerB = { name: "Mina" };
const orders = [
  { customer: customerA, amount: 12 },
  { customer: customerB, amount: 5 },
  { customer: customerA, amount: 8 },
];
const byCustomer = Map.groupBy(orders, (order, index) => order.customer);
const totalA = byCustomer.get(customerA).reduce((sum, order) => sum + order.amount, 0);
console.log(totalA); // 20
console.log(byCustomer.get({ name: "Mina" })); // undefined
```

The callback gets both order and index, although this solution uses only the order. The group contains original order references. Equal-looking customer objects remain different keys. [MDN Map.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy)

### Solution 3

```js
const required = new Set(["read", "write"]);
const granted = new Set(["read", "admin"]);
const missing = required.difference(granted);
const extra = granted.difference(required);
const allGranted = required.isSubsetOf(granted);

console.log([...missing]); // ["write"]
console.log([...extra]); // ["admin"]
console.log(allGranted); // false
```

Each difference preserves the order of its receiver: `missing` follows `required`, and `extra` follows `granted`. `isSubsetOf` returns a boolean and is true exactly when every required value is present in `granted`. Set composition is ES2025 and takes set-like operands. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

### Solution 4

```js
const candidates = new Map([["read", true], ["admin", false]]);
const requested = new Set(["read", "write"]);
const validRequested = requested.intersection(candidates);
console.log([...validRequested]); // ["read"]
```

Map's `size`, `has`, and `keys` form the set-like protocol. The algebra operation reads `keys()` when it needs to iterate the Map side; Map's regular iterator would yield `[key, value]` pairs and is not used as the set-like key iterator. The `false` payload does not make `admin` absent: membership is determined by key presence. This is why use of Map as set-like operand treats all its keys as members regardless of associated values.

### Solution 5

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

`b` is deleted before its turn, so it is skipped. `c` is appended while traversal is active and is visited. If a previously visited `a` is deleted and re-added while iteration continues, the new insertion is at the end and can be visited again. Avoid depending on this as a queue design unless that behavior is deliberate. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

## Tests and edge cases

```js
import assert from "node:assert/strict";

const map = new Map();
const key = {};
map.set(key, undefined);
assert.equal(map.get(key), undefined);
assert.equal(map.has(key), true);
assert.equal(map.has({}), false);
assert.equal(map.get(NaN), undefined);
map.set(NaN, "not a number");
assert.equal(map.get(Number("nope")), "not a number");
map.set(-0, "zero");
assert.equal(map.get(+0), "zero");

const set = new Set([NaN, NaN, -0, +0]);
assert.equal(set.size, 2);
assert.equal(set.has(NaN), true);
assert.equal(set.has(-0), true);

const left = new Set(["a", "b"]);
const right = new Set(["b", "c"]);
assert.deepEqual([...left.union(right)], ["a", "b", "c"]);
assert.deepEqual([...left.intersection(right)], ["b"]);
assert.deepEqual([...left.difference(right)], ["a"]);
assert.deepEqual([...left.symmetricDifference(right)], ["a", "c"]);
assert.equal(new Set(["a"]).isSubsetOf(left), true);
assert.equal(left.isSupersetOf(new Set(["a"])), true);
assert.equal(left.isDisjointFrom(new Set(["c"])), true);

assert.throws(() => left.union(["a"]), TypeError); // Array is iterable, not set-like
```

The last assertion documents a semantic boundary: constructors consume iterables, but Set algebra requires the set-like contract. Run the assertions only in runtimes implementing ES2025 Set composition; `getOrInsert` requires ES2026. Do not assert garbage-collection or finalizer timing in tests.

## Reflection questions

- Should two objects with identical fields be separate keys in your domain?
- Which parts of your code rely on collection insertion order?
- Are you mutating a collection during iteration, and can a snapshot make the intended logic clearer?
- Does your Set operand implement `size`, `has`, and `keys`, or only `[Symbol.iterator]`?
- Which target runtimes provide `Map.groupBy`, ES2025 Set operations, and ES2026 default insertion methods?
- Would a fixed object record or an indexed array express your data more clearly?

## Sample answers to reflection questions

- Treat two same-shaped objects as separate keys when their identities represent different entities. If the domain defines identity by a stable ID, key by that ID instead.
- Map and Set expose insertion order. If output order matters, make insertion and delete/reinsert behavior deliberate; ordinary object key enumeration has its own ordering rules.
- If the algorithm must process only the initial collection, snapshot it first (for example, `[...map]` or `[...set]`). The snapshot freezes which entries are traversed, but referenced objects are still shared.
- Set algebra needs `size`, callable `has`, and callable `keys`; `[Symbol.iterator]` alone is not enough. A Map qualifies through its keys; an Array can be converted with `new Set(array)`.
- Check the actual deployment targets: Map.groupBy is ES2024 and broadly available since March 2024, Set composition is ES2025, and Map get-or-insert methods are ES2026/Baseline 2026. Feature detection can cover older engines.
- Use an object for a fixed named record, an Array for indexed order/duplicates, a Map for arbitrary-key associations, and a Set for unique membership. Choose based on semantics and lifecycle, not a blanket speed assumption.
