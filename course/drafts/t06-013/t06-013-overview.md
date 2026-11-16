# JavaScript Map and Set collections — Big-picture orientation and mental model

## Problem and purpose

Objects are useful records: properties are named, often by strings or symbols, and their values describe one thing. But many problems need a changing collection of arbitrary keys, preserved insertion order, reliable counts, or uniqueness checks. `Map` stores key/value associations; `Set` stores unique values. Both accept arbitrary JavaScript values and provide dedicated membership operations. [ECMA-262 keyed collections](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) · [MDN Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)

## Plain-language mental model

Picture an ordered ledger. A Map row has a key and a value; looking up the same key finds the row. A Set is the same ledger with only one column: adding a value already present does not create another row. Both collections remember insertion order and compare object keys by identity. They are not ordinary objects with convenient syntax; they are purpose-built collection objects with their own internal storage and operations.

```text
Map: key ──► value        Set: value
     key ──► value             value
     key ──► value             value

Map/Set: preserve insertion order, support membership/count, accept objects
as identities and primitives as values. Updating/re-adding affects order by rules.
```

## How the parts fit together

1. A Map starts empty or consumes an iterable of key/value pairs. A Set starts empty or consumes an iterable of values.
2. Insertions use collection equality: `NaN` matches itself, positive and negative zero are one key/value, and objects match only the same reference.
3. Insertion order is observable through iterators and callbacks. Updating an existing Map value does not move its key; deleting and adding it later puts it at the end.
4. Iteration is live, not a frozen snapshot. Mutations during an active loop can affect which values are still visited.
5. Set composition applies mathematical relations but accepts a set-like protocol (`size`, `has`, `keys`), not just any iterable.
6. Newer convenience methods have edition boundaries: `Map.groupBy` is ES2024, Set composition is ES2025, and Map's get-or-insert methods are ES2026.

## Concept map

- **Association:** Map connects each unique key to one current value; `get` reads, `set` creates or replaces, and `has` distinguishes absence from a stored `undefined`.
- **Membership:** Set records that a value is present once; membership has no separate payload.
- **Equality:** SameValueZero behavior gives predictable primitive equality while preserving object identity.
- **Order:** insertion order supports deterministic traversal, but mutation while traversing follows live iteration rules.
- **Grouping:** Map.groupBy creates groups keyed by callback results, including object identities.
- **Set algebra:** difference, union, intersection, symmetric difference, subset/superset, and disjointness express common membership questions.
- **Alternatives:** Object is often better for a fixed record or property-oriented data; Array may be enough for a small ordered sequence but needs explicit duplicate/search policy. Map/Set are appropriate when collection semantics matter more than plain property/sequence semantics.

## End-to-end walkthrough

Suppose a scheduler groups tasks by the exact owner object. Owners may be updated and two different owners may share the same display name, so grouping by a name string could merge distinct owners accidentally.

```js
const product = { name: "Widget" };
const support = { name: "Widget" };
const tasks = [
  { owner: product, title: "Update listing" },
  { owner: support, title: "Reply to customer" },
  { owner: product, title: "Check stock" },
];

const groups = Map.groupBy(tasks, (task) => task.owner);
console.log(groups.get(product).map((task) => task.title));
// ["Update listing", "Check stock"]
console.log(groups.get(support).length); // 1
```

The two owner objects are different keys even though their properties match. The groups preserve the input order within each group, and the original task objects are referenced rather than cloned. `Map.groupBy` is standardized in ECMAScript 2024; check target runtimes if older environments are supported. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN Map.groupBy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy)

For required skills, a Set can express the difference between needed and completed skills:

```js
const required = new Set(["HTML", "CSS", "JavaScript"]);
const completed = new Set(["HTML", "JavaScript"]);
console.log([...required.difference(completed)]); // ["CSS"]
```

Set composition is part of ECMAScript 2025. These methods accept Set-like objects, not merely arrays or generic iterables; arrays need conversion to Set or a deliberate set-like adapter. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

## When to use it and tradeoffs

Use Map for dynamic associations, especially when keys are objects, keys must not be coerced to property strings, or you need `size`, iteration, or frequent keyed access. Use Set for unique membership and set algebra. Use Object for a fixed record of named fields, serialization-oriented data, or property descriptors/prototype behavior. Use Array for an ordered sequence where duplicates are meaningful or index operations dominate.

Map and Set hold values strongly; entries remain reachable through the collection until deletion/clear or release of the collection itself. If keys should not be retained solely by the association, a weak collection is a different lifetime tool and cannot enumerate or count. Do not choose Map/Set because of a blanket speed claim: the useful decision is about required keys, ordering, membership, observation, and lifetime.

Species accessors remain standardized on Map and Set constructors, but the current methods in these APIs do not use them to create derived instances. MDN describes each as unused. The accessor can matter to code that reads it or subclasses it, but it does not make `Map.groupBy` or Set algebra return the subclass. [MDN Map species](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/Symbol.species) · [MDN Set species](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/Symbol.species)

## What later lessons cover

The concepts lesson teaches identity, equality, ordering, live iteration, iterable construction, and the set-like protocol. The Map reference explains every supplied Map name, including grouping, species, and ES2026 insertion methods. The Set reference explains all collection operations and their output ordering, size-based algorithm choices, and set-like inputs. Practice applies the APIs and diagnoses collection choices; the interview lesson focuses on equality, ordering, and compatibility boundaries.
