# JavaScript Map and Set collections — Interview questions and reasoning

## Core questions

1. When would you choose Map instead of an ordinary object?
2. How does Map/Set key equality handle objects, `NaN`, and signed zero?
3. What is the difference between Map insertion order, replacement, and deletion/reinsertion?
4. Why does `get` returning `undefined` not prove that a key is absent?
5. What does Map.groupBy pass to its callback, and what does it return?
6. Why are Map and Set iterators described as live?
7. What is the set-like protocol used by Set composition methods?
8. How do Set difference, intersection, union, and symmetric difference differ?
9. What role does `Symbol.species` play in current Map/Set methods?
10. Which edition added Map groupBy, Set composition, and Map get-or-insert methods?
11. Do Map and Set guarantee O(1) lookup, and what performance requirement does the specification state?

## Concise interview answers

1. Use Map for dynamic arbitrary-value keys, object identity, explicit size/iteration, or frequent keyed lookup. Use object for a fixed named record or property-oriented behavior.
2. SameValueZero applies: objects use identity, `NaN` matches itself, and `+0`/`-0` are one key/member.
3. New keys append; updating an existing key changes its value without moving it; deleting and then reinserting appends it at the end.
4. An existing entry can store `undefined`. `has` distinguishes presence from absence.
5. It receives each iterable element and its zero-based index; callback results become Map keys and values are arrays of the original elements.
6. The collection is not copied when iteration begins. Deletions/additions during traversal can affect future visits under the specified rules.
7. The other operand supplies `size`, callable `has`, and callable `keys`; a generic iterable by itself is not enough.
8. Difference is directional; intersection returns common values; union combines values; symmetric difference returns values belonging to exactly one side.
9. The static accessors remain standardized and return the constructor receiver, but MDN documents them as unused by current Map and Set methods. Do not assume them to select result subclasses.
10. Map.groupBy: ES2024; Set composition methods: ES2025; Map getOrInsert methods: ES2026. Runtime support may lag the standard.
11. No O(1) guarantee: implementations must provide average access times sublinear in collection size, but the backing structure and exact complexity are implementation choices.

## Deep follow-up answers

### What equality means operationally

SameValueZero ensures a Set cannot accumulate multiple `NaN` values and treats signed zero as one key. Objects remain reference identities: mutating a key's properties does not change lookup, while a new object with identical properties is a different key. This avoids coercion and makes object-associated state practical, but requires callers to retain the exact key reference. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

### Why Set algebra accepts a protocol instead of only a Set

The `other` side needs only a reported size, membership test, and key iterator for the algorithms. This lets a Map act set-like through its keys and allows read-only/custom host collections to participate without materializing a Set. Because size affects algorithm strategy and sometimes result order, custom implementations should report coherent size and membership and provide a stable keys iteration. A plain Array has an iterator but is not sufficient. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

### Why can intersection's order depend on operand sizes?

To reduce membership work, the standard iterates the smaller side: if this Set is no larger, it checks this Set's members and emits in this Set order; otherwise it traverses `other.keys()` and emits matches in that order. Set mathematical equality is order-independent, but JavaScript collections expose iteration order, so the method documents a size-related order choice. Do not treat set algebra results as sorted unless you sort them separately. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

### What does “live iterator” imply in a real loop?

An iterator tracks a collection and cursor rather than a frozen array. Deleting an unvisited key means it is skipped; appending can extend the iteration; deleting and re-adding a visited key gives it a new insertion position and can make it appear again. If a loop is intended to process only the original items, snapshot first with an explicit array conversion. If it is intended as a work queue, specify termination and deduplication conditions because callbacks can continuously append more work. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

### How do the insertion methods differ from a common fallback?

`getOrInsert` is equivalent in intent to `has` then `get` or store, but it avoids conflating an existing `undefined` with absence and has specified behavior. `getOrInsertComputed` delays callback work until missing and defines post-callback reentrancy: if callback changed the same key, the computed result is written afterward. A manual `if (!map.has(key)) map.set(key, compute())` also performs its `set` after callback and thus overwrites a callback write; if your policy differs, spell it out rather than assuming the built-in preserves side effects. `getOrInsert`'s value expression remains eager. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN getOrInsertComputed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsertComputed)

### Do species accessors control the newer collection result methods?

No. Map and Set species accessors remain defined for compatibility, but current Map and Set methods do not consult them. `Map.groupBy` constructs a Map, and Set algebra constructs Set results with the intrinsic prototypes specified by the standard. If subclass-preserving operations are needed, write or choose an API that explicitly provides that behavior. [MDN Map species](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/Symbol.species) · [MDN Set species](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/Symbol.species)

## Scenario questions

1. A cache uses an object key, then code reconstructs a new object from the same JSON fields and calls `get`. Why is it missing, and what identifier design could solve the domain mismatch?
2. A loop deletes the next key and adds a new key. Which values can still be visited, and how would you freeze the original work list?
3. A Set operation receives an array and throws. What contract did the caller confuse, and how can it adapt the data correctly?
4. `intersection` returns the same members in a different order after a set-like size report changes. Why can that happen, and how should consumers handle order if they need a canonical output?
5. A Map stores `undefined` for a valid key. How does a caller distinguish this from absence?
6. A team targets older browsers and wants to use ES2026 insertion methods. What compatibility checks and fallback behavior should they define?

## Scenario answers

1. Map keys use object identity, so a reconstructed object is a different key even if its fields match. If the domain identity is the stable `id`, key by that primitive value instead; validate that IDs are unique and normalized.
2. A not-yet-visited deleted key is skipped, newly appended keys can be visited, and a visited key deleted/re-added can be visited again at its new position. Snapshot the intended starting entries first, for example `const original = [...map]`; this copies entry pairs but not nested key/value objects.
3. The caller supplied an iterable, but Set composition asks for the set-like protocol (`size`, callable `has`, callable `keys`). Convert the array with `new Set(array)` or deliberately implement that protocol.
4. `intersection` traverses the smaller side by reported size, so its output order follows whichever side it traverses. If a canonical order is required, sort the result with a domain-specific comparator after computing the members.
5. Call `map.has(key)` to test presence; `get(key)` alone cannot distinguish a missing key from a stored `undefined`.
6. Feature-detect both `Map.prototype.getOrInsert` and `getOrInsertComputed` on the actual target runtimes. Provide a tested fallback using `has`, `get`, and `set`; preserve the desired callback laziness and same-key reentrancy policy explicitly.

## Tradeoffs and alternatives

- **Map vs Object:** Map has arbitrary keys, size, direct iteration, and collection semantics; Object suits fixed fields and property-oriented data.
- **Set vs Array:** Set provides uniqueness and membership semantics; Array preserves duplicates and indexes naturally.
- **Map vs Set:** use Map when each key needs an associated payload, Set when presence alone matters.
- **Map/Set vs weak collections:** strong collections support enumeration and explicit lifecycle control but retain entries; weak collections trade those observables for weak key lifetime.
- **Built-in insertion vs explicit code:** built-ins centralize presence and callback semantics; explicit code can express a different reentrancy policy but needs careful presence checks.

## Common weak answers

- “Objects are compared by value.” They are compared by identity.
- “Map `get` returns null when absent.” It returns undefined; stored undefined is possible.
- “Updating a key moves it to the end.” Replacement preserves order; delete/reinsert moves it.
- “Set algebra accepts any iterable.” The protocol is set-like: size, has, keys.
- “Intersection order is always based on the receiver.” It can follow the other keys order when traversing the smaller side.
- “`for...of` uses a snapshot.” Iterators are live.
- “Species gives subclass results.” Current Map/Set methods do not use it.
- “Passing a callback to computed insertion makes all side effects safe.” Reentrant same-key writes can be overwritten by the computed result.
- “Current syntax means current engine support.” Standard edition and runtime deployment dates differ.

## Self-check rubric

Score each answer 0–2: 0 = inaccurate, 1 = correct but missing an important boundary, 2 = precise and tied to practical behavior.

- I compare Map and objects based on key and property semantics rather than blanket speed claims.
- I can predict object identity, NaN, and signed-zero behavior.
- I distinguish Map presence from stored undefined.
- I know how insertion, replacement, deletion, and reinsertion affect order.
- I can explain live mutation during traversal.
- I can name all three properties of the Set-like protocol and explain Map compatibility.
- I know that intersection order can follow the smaller operand.
- I distinguish the ES2024, ES2025, and ES2026 additions and plan for target support.
- I avoid claiming Map or Set lookup is guaranteed O(1); I can state the standard's sublinear-average requirement.

Sources: [ECMA-262 keyed collections](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) · [MDN Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
