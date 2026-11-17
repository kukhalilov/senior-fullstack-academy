# JavaScript WeakMap and WeakSet collections — Big-picture orientation and mental model

## Problem and purpose

Sometimes data belongs to an object without being part of that object's public shape. A UI library might need per-node bookkeeping; a parser might need to mark objects already visited; a class-like abstraction might need metadata without exposing a property on each instance. A normal `Map` or `Set` strongly retains its entries, so keeping the collection alive can also keep its keys or members alive. Weak collections provide keyed association or membership without making the key/value itself live solely because of that entry. [ECMA-262 keyed collections](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)

## Plain-language mental model

Think of a weak collection as a side table attached to the lifetime of an object. A `WeakMap` is a side table: “for this exact object, store this metadata.” A `WeakSet` is a side checklist: “this exact object is currently marked.” If the program has no remaining live way to observe a key, the weak collection must not keep it alive by itself. The engine decides when collection happens; JavaScript gives the program no clock or enumeration API for detecting that moment.

The name “weak” describes the collection's reference relationship, not whether lookup is unreliable while you still hold a key. If you have the key in hand, `get`, `has`, and `delete` give ordinary deterministic answers for that call. [ECMA-262 WeakMap/WeakSet objects](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

## How the parts fit together

1. The collection stores an association in a `WeakMap`, or a membership marker in a `WeakSet`.
2. The key/value supplied must satisfy the standard's weak-holding rule: any object qualifies; a symbol qualifies only if it is not registered with the global symbol registry.
3. Operations require the caller to present the key/value. There is no enumeration, count, or bulk-clear operation that could reveal garbage-collection progress.
4. A strong reference elsewhere still controls lifetime. A weak collection is not a cleanup scheduler and does not guarantee when memory is reclaimed.
5. Choose `Map`/`Set` when you need primitives, enumeration, counts, or deterministic ownership; choose a weak collection when the lifetime relationship is the actual requirement.

```text
object ───────► application code still observes it
   │
   └─ weak key ─► private metadata (WeakMap)
                  or membership mark (WeakSet)

The weak entry alone does not make the key live.
```

## Concept map

- **Weak reference relationship:** the collection does not keep its key/member live by itself.
- **Weak-key eligibility:** objects and non-registered symbols have language identity suitable for weak holding; most primitives do not.
- **Identity:** two structurally identical objects are different keys unless they are the same object reference.
- **Non-observability:** the collection cannot reveal all current keys or members because that list could vary with collection timing.
- **Lifetime-oriented use:** metadata and temporary membership follow the identity of their key rather than requiring a separate public property or a manual deletion path.
- **Current insertion convenience:** `WeakMap` has lazy and eager default insertion methods in ECMAScript 2026; these are not `WeakSet` methods. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN getOrInsert](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/getOrInsert)

## End-to-end walkthrough

Suppose a renderer caches a derived label for each node object. The cache should not keep removed nodes alive, and the label is expensive enough to compute only when needed.

```js
const labels = new WeakMap();

function labelFor(node) {
  return labels.getOrInsertComputed(node, (currentNode) => {
    return `${currentNode.kind}: ${currentNode.name}`;
  });
}

const node = { kind: "button", name: "Save" };
console.log(labelFor(node)); // "button: Save"
console.log(labelFor(node)); // same cached string; callback is not called again
```

The local `node` binding keeps the key live here, so lookup remains available. If the application later discards every strong reference to the node and the cache is the only remaining association, the weak entry does not keep the node alive. No code should expect to observe exactly when the engine reclaims it. The `getOrInsertComputed` feature is newly broadly available in current browsers in 2026; older runtimes may lack it, so check the deployment target or use `get`/`has`/`set` logic where necessary. [MDN getOrInsertComputed](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap/getOrInsertComputed)

For a graph walk, a `WeakSet` can mark objects on the current recursion path or already visited objects. It stores no count and cannot later list what it saw. If the algorithm needs a report of every visited object, keep a separate strong `Set` or array intentionally; that separate structure changes lifetime behavior.

## When to use it and tradeoffs

Use a `WeakMap` for external per-object metadata, cached derived data, or state associated with object identity. Use a `WeakSet` for membership or visitation marks when you do not need to enumerate the members. Prefer a native private class field when the state is intrinsically part of one class design and cross-instance access is not required; prefer `Map` or `Set` when callers need listing, size, primitive keys/values, explicit deletion policy, or stable retention.

Weak collections can still be misused. A separate strong reference to a key, a closure capturing the key, a global array, or another data structure can keep it live. Weakness also does not make data private from code that has access to the collection and the key. It only changes the collection-to-key liveness relationship. Do not use finalization timing as a correctness mechanism; the garbage collector may reclaim later or not before program shutdown. [ECMA-262 weak-target processing](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)

## What later lessons cover

The concepts lesson develops reachability, observability, identity, and constructor behavior. The reference lessons cover the WeakMap and WeakSet constructors, their fixed `prototype` properties, every current instance operation, and the weak-key rules in the supplied inventory, including exact behavior for invalid keys and callback reentrancy. Practice builds metadata and cycle-detection examples, then diagnoses when a strong collection is the better design. The interview lesson focuses on tradeoffs, lifetime reasoning, and version-sensitive API support.
