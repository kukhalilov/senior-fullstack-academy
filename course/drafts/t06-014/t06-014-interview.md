# JavaScript WeakMap and WeakSet collections — Interview questions and reasoning

## Core questions

1. What does “weak” mean for a WeakMap key or WeakSet member?
2. Why can a weak collection answer `has(key)` but not list its keys or expose a size?
3. Which values satisfy the weak-holding rule, and why are `Symbol.for()` symbols different from `Symbol()` symbols?
4. How do you distinguish a missing WeakMap key from a key whose stored value is `undefined`?
5. Compare WeakMap and WeakSet with Map and Set in ownership and observability.
6. What is the semantic difference between `getOrInsert` and `getOrInsertComputed`?
7. What happens when a `getOrInsertComputed` callback modifies the same WeakMap for the same key?
8. Why might a WeakMap still fail to prevent a memory leak in an application?

## Concise interview answers

1. An entry does not by itself make its key/member live. If the value is otherwise not live, it may later be reclaimed; timing is not promised.
2. Enumerating would reveal which keys the collector has reclaimed, making program output depend on nondeterministic timing. Weak collections expose only operations where the caller presents the candidate value.
3. Every object is eligible. A symbol is eligible when it is non-registered (`Symbol.keyFor(symbol) === undefined`); registry symbols from `Symbol.for()` are excluded. This language rule includes well-known symbols.
4. Call `has(key)`. `get(key)` returns `undefined` both for absence and for a present `undefined` value.
5. Map/Set strongly retain and can enumerate/count their entries, accept primitives as appropriate, and support explicit bulk clearing. WeakMap/WeakSet have restricted eligible keys and omit enumeration/count/clear to keep garbage-collection state unobservable.
6. Both return an existing value or insert a default. The eager value argument to `getOrInsert` is evaluated before the call; `getOrInsertComputed` calls a callback only when the key is absent.
7. In ECMAScript 2026, after the callback returns, the algorithm checks again; if it wrote the same key, the computed result replaces that value, then is returned.
8. Other strong references—closures, arrays, event registries, globals, or a value retained elsewhere—can keep keys or associated values live independently of the WeakMap.

## Deep follow-up answers

### Does WeakMap guarantee the value is reclaimed with the key?

No immediate reclamation is guaranteed. The weak entry does not make the key live solely through that relationship, and the specification allows collection/removal latency. A value that points back to its key does not by itself make that key live through the WeakMap entry, but any separate strong path can affect liveness. Treat the API as a lifetime relationship, not a deterministic destructor. [ECMA-262 weak-target processing](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html) · [ECMA-262 keyed collections](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

### Why does `getOrInsertComputed` specify behavior after callback reentrancy?

The callback is arbitrary synchronous code and can mutate the same map. A naive implementation might check for absence, call the callback, and then conditionally preserve a reentrant insertion. ECMAScript 2026 instead searches again after the callback and replaces a same-key entry with the computed value. This is a behavior contract callers can reason about, but it also means callback side effects can be overwritten. If the desired contract is “a callback's reentrant value wins,” implement that policy explicitly with `has`/`get`/`set` rather than assuming the built-in does so. [ECMA-262 algorithm](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

### Why not put metadata directly on the object?

An object may be frozen, owned by another package, or intentionally kept free of implementation state. A WeakMap keeps metadata external and keys it by identity. This is not a security boundary: anyone with access to both WeakMap and key can retrieve the value. Native private fields may be clearer when data belongs to one class; a normal Map is better when inspection or deterministic cleanup is part of the design. [MDN WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)

### What version boundaries should you mention?

Non-registered symbols became valid weak keys in ECMAScript 2023. WeakMap `getOrInsert` and `getOrInsertComputed` are in ECMAScript 2026; MDN marks them Baseline 2026, so do not assume they exist in older browsers or runtimes. Check the deployment matrix or provide a fallback. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN getOrInsert](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/getOrInsert)

## Scenario questions

1. A cache needs per-DOM-node computed output and should not keep detached nodes alive. What collection fits, and what unrelated references could defeat the intended lifetime?
2. A team wants to display every cached key and show a count. Why is WeakMap the wrong data structure, and what behavior changes if they switch to Map?
3. A key can be either a local symbol or a globally registered symbol. How can the caller validate eligibility, and what should happen for each?
4. An insertion callback increments a counter and calls `weakMap.set(key, "manual")`, then returns `"computed"`. What does the built-in return and retain in ECMAScript 2026?
5. A `get` call returns `undefined`. What follow-up check distinguishes absence from a stored undefined value?
6. A runtime lacks the ES2026 insertion methods. What fallback is appropriate, and how must you account for reentrancy differences?

## Tradeoffs and alternatives

- **WeakMap vs Map:** choose WeakMap for metadata keyed by eligible identity when independent enumeration is unnecessary; choose Map for primitives, ordered iteration, count, or explicit retention.
- **WeakSet vs Set:** choose WeakSet for object/symbol membership that should not retain values solely through the membership entry; choose Set when listing, count, or primitive values matter.
- **WeakMap vs private fields:** a WeakMap can associate data with instances without modifying them and can be shared by cooperating code; private fields provide language-enforced class privacy and tighter ownership but are tied to the class declaration.
- **Weak collection vs explicit lifecycle cleanup:** weak retention avoids a manual key deletion for memory lifetime, but explicit cleanup gives deterministic semantic release and observability. Use explicit lifecycle management when ordering, side effects, or reporting matter.

## Common weak answers

- “WeakMap immediately deletes a key when I set its variable to null.” The collector controls timing; no synchronous deletion occurs.
- “WeakMap is private.” Access control depends on who has the map and key, not on weak retention.
- “Any primitive works if I wrap it.” A wrapper object changes identity and requires reuse of that exact wrapper.
- “Symbols are primitives, so none can be keys.” Non-registered symbols are an explicit exception; registry symbols are excluded.
- “`get` tells me whether the entry exists.” An entry may store `undefined`; use `has`.
- “WeakMap is always more memory efficient or faster.” The collection is useful for lifetime semantics; performance depends on engine and workload.
- “The callback's reentrant insertion wins.” The ES2026 computed insertion algorithm overwrites a same-key entry with its computed result after callback return.

## Self-check rubric

Score each answer 0–2: 0 = incorrect, 1 = broadly right but missing a boundary, 2 = correct and explains the practical consequence.

- I can define weak key liveness without promising collection timing.
- I can state the exact object/symbol admissibility rule and classify `Symbol()` vs `Symbol.for()`.
- I know why weak collections have no count, enumeration, or iterator.
- I distinguish absent entries from stored `undefined`.
- I can explain eager versus computed insertion and computed-callback reentrancy.
- I can name strong references that can keep a key/value alive.
- I can choose a strong collection when listing, counting, primitive keys, or deterministic cleanup is required.

Sources: [ECMA-262 keyed collections](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [ECMA-262 weak-target operations](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html) · [MDN WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) · [MDN WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)
