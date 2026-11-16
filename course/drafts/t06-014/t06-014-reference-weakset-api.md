# JavaScript WeakMap and WeakSet collections — Reference: WeakSet constructor, properties, and methods

## Scope and version

This reference explains every item in the supplied WeakSet API inventory against ECMAScript 2026, checked 2026-11-16. Unlike WeakMap, WeakSet has no ES2026 default-insertion methods; it stores membership only. [ECMA-262 keyed collections](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)

## How this group fits the mental model

Use WeakSet as a non-enumerable identity membership marker for objects or eligible symbols. It is useful when you need to ask “have I seen this value?” while the collection should not itself keep that value live. You cannot use it to produce a list or count afterward; use Set when results must be enumerable or strongly retained. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

## Supplied names explained

- `WeakSet` — A constructor that requires `new`. Omitted, `undefined`, and `null` inputs create an empty set. Otherwise it consumes a synchronous iterable of values. It obtains the new instance's `add` method and calls that method for each yielded value; subclass overrides can affect initialization. An inadmissible value or an abrupt adder/iterator completion causes construction to fail, with iterator closing according to the iterable protocol. [ECMA-262 constructor](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `WeakSet.prototype.constructor` — Initially references the `WeakSet` constructor. It is an ordinary mutable prototype property, not a trustworthy authenticity check. Native operations require the receiver's WeakSet internal state and throw `TypeError` when borrowed onto an incompatible object. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `WeakSet.prototype.add` — Adds an object or eligible symbol if not already present and returns the same set for chaining. Duplicate identity is ignored. Passing an ineligible primitive or registered symbol throws `TypeError`; a wrong receiver also throws. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `WeakSet.prototype.delete` — Removes the exact eligible identity and returns `true` if present, otherwise `false`. An ineligible value returns `false` rather than throwing. A wrong receiver throws `TypeError`. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `WeakSet.prototype.has` — Returns whether the exact eligible identity is present. It returns `false` for an absent value and for an ineligible primitive or registered symbol. A wrong receiver throws `TypeError`. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `WeakSet.prototype[Symbol.toStringTag]` — A non-writable, non-enumerable, configurable prototype data property initially set to `"WeakSet"`. It provides the descriptive tag used by `Object.prototype.toString`, not a security or reliable authenticity check. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

## Cross-item comparison

`add` mutates and returns the set; `has` asks about membership without mutation; `delete` mutates and reports whether it removed the value. The constructor applies `add` repeatedly to an iterable. None can list members or expose a count. There is no within-group species accessor: WeakSet has no standard derived-collection method that needs a species-selected constructor. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [ECMA-262 2015](https://262.ecma-international.org/6.0/)

## Examples

### Identity matters

```js
const seen = new WeakSet();
const first = { name: "Ada" };
const lookalike = { name: "Ada" };

seen.add(first);
console.log(seen.has(first)); // true
console.log(seen.has(lookalike)); // false
console.log(seen.add(first) === seen); // true; duplicate identity is harmless
```

### Mark the current recursive path

```js
function visit(node, active = new WeakSet()) {
  if (active.has(node)) return "cycle";
  active.add(node);
  const result = (node.children ?? []).map((child) => visit(child, active));
  active.delete(node);
  return result;
}

const root = { children: [] };
root.children.push(root);
console.log(visit(root)); // ["cycle"]
```

This design uses membership during recursion, then removes the marker on the way back. If an exception can occur after `add`, use `try/finally` when cleanup is required for correctness; weak collection does not mean the marker disappears synchronously when the stack unwinds.

## Common mistakes

- Adding a string ID when the algorithm needs object identity: WeakSet rejects strings. Keep string IDs in a normal Set.
- Thinking two equal-shaped objects are duplicates: membership is by identity.
- Expecting membership insertion to return a boolean: `add` returns the WeakSet itself.
- Using WeakSet where the later algorithm must enumerate, count, or clear all values.
- Assuming deletion with an invalid value throws; `delete` returns false, while `add` throws.
- Treating the tag or constructor property as a security brand check.
- Assuming a WeakSet makes recursive traversal faster than Set in every engine; choose based on lifetime and required observability, then measure performance for the workload.

## Knowledge checks with answers

1. **What does adding the same object twice do?** It remains one membership entry, and both calls return the WeakSet.
2. **Why does a second object literal with identical fields not match?** It is a different object identity.
3. **What happens for `has(3)` and `add(3)`?** `has(3)` returns false; `add(3)` throws `TypeError`.
4. **When is a strong Set a better fit?** When primitives, size, enumeration, stable retention, or deterministic cleanup are requirements.
5. **Does deleting an active recursion marker happen automatically on garbage collection?** No; if the node is still referenced, the marker remains until explicit deletion or the node later becomes non-live. Use `try/finally` for explicit stack-scoped cleanup.
