# JavaScript WeakMap and WeakSet collections — Reference: Weak-key admissibility and limitations

## Scope and version

This lesson covers the seven supplied eligibility and limitation terms using ECMAScript 2026. The weak-holding rule includes non-registered symbols beginning with ECMAScript 2023; the current spec names the abstract operation `CanBeHeldWeakly`. [ECMA-262 weak-target operations](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html) · [ECMA-262 keyed collections](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)

## How this group fits the mental model

Weak collections need a value with identity that can be weakly held. Their API accepts only values in that category and avoids every operation that would reveal how many such values remain live. “Not enumerable” is therefore a semantic guarantee that prevents nondeterministic collection timing from becoming application output.

## Supplied names explained

- `Object weak key` — Every ECMAScript object can be a WeakMap key or WeakSet value, including functions, arrays, proxies, frozen objects, and other collection instances. Eligibility does not require the object to be extensible. Matching is by exact object identity, not properties or serialization. [ECMA-262](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)
- `Non-registered Symbol weak key` — A symbol is admissible if it is not in the global symbol registry. This includes symbols returned by `Symbol()` and well-known symbols. It excludes registry symbols from `Symbol.for()`. The feature was standardized in ECMAScript 2023; old engines may not implement symbol keys even if they support WeakMap for objects, so deployment support matters. [ECMA-262](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)
- `Symbol()` — Creates a unique, non-registered symbol by default. It is eligible for weak holding. A symbol's description is descriptive text, not a key and not an identity lookup mechanism. Creating another symbol with the same description produces a different identity. [ECMA-262 Symbols](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)
- `Symbol.for()` — Looks up or creates a symbol in the shared global symbol registry. These symbols are intentionally reusable and fail the weak-holding criterion; they cannot be used in WeakMap or WeakSet. The same key string therefore does not convert a registered symbol into a weakly collectible key. [ECMA-262 Symbols](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)
- `Symbol.keyFor()` — Returns the registry key string for a registered symbol and `undefined` for an unregistered symbol. In the normative weak-holding rule, the undefined result is what makes a symbol eligible. It is a useful explanation/test of eligibility but is not itself a garbage-collection detector. [ECMA-262 Symbols and CanBeHeldWeakly](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)
- `CanBeHeldWeakly` — A specification abstract operation: true for an object, or for a symbol whose registry lookup is undefined; false otherwise. It is not a JavaScript global function. It governs WeakMap keys, WeakSet members, and also weak-reference/finalization targets outside this topic's API scope. [ECMA-262](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)
- `Non-enumerable weak collection` — The collection exposes only key-presented lookups. The specification permits a variable delay between a key becoming inaccessible and the implementation removing its weak entry. A list of current keys/members would reveal that delay and make program behavior nondeterministic, so no standard enumeration API is provided. [ECMA-262 keyed collections](https://tc39.es/ecma262/2026/multipage/keyed-collections.html)
- `No size accessor` — There is no standard property that counts live entries. Even if an implementation can count internal records, exposing a count would make garbage-collection progress observable and could make results differ between runs.
- `No clear method` — A bulk clear operation is not standardized for these weak collections. If the program needs deterministic reset, replace its reference with a new empty WeakMap/WeakSet or design explicit per-key deletion/strong ownership. Reassignment only releases this variable's reference to the old collection; aliases can still keep that collection alive.
- `No keys or values iterator` — WeakMap has no standard `keys`, `values`, `entries`, or iterator; WeakSet has no iterator or values listing. They cannot provide an inventory of keys or members. If you need a work queue or report, maintain a separate strong collection and accept its explicit retention behavior.

## Cross-item comparison

Object identity and unregistered symbol identity qualify; primitive values without weak-holding identity do not. An unregistered symbol is unique but may still be strongly retained by any normal variable or reachable structure. A weak key is not “automatically cleared now”; it is simply not kept live by the weak entry. A strong key in Map/Set remains retained for as long as the strong collection entry exists. A weak collection supports keyed questions; an iterable collection supports inspection and counting. [ECMA-262](https://tc39.es/ecma262/2026/multipage/keyed-collections.html) · [MDN WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) · [MDN WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)

## Examples

```js
const local = Symbol("cache-key");
const shared = Symbol.for("cache-key");
const wm = new WeakMap();
const ws = new WeakSet();

wm.set(local, "allowed");
ws.add(local);

console.log(Symbol.keyFor(local)); // undefined
console.log(Symbol.keyFor(shared)); // "cache-key"
console.log(wm.has(shared)); // false
console.log(ws.has(shared)); // false

try {
  wm.set("text", 1);
} catch (error) {
  console.log(error instanceof TypeError); // true
}
```

## Common mistakes

- Treating `CanBeHeldWeakly` as a function developers can call; it is specification notation.
- Assuming all symbols qualify; registered symbols do not.
- Expecting to verify collection by waiting a fixed time or forcing collection; the language exposes no deterministic weak-collection timing mechanism.
- Replacing a WeakMap with Map solely to gain a `clear` call without considering that Map strongly retains every key.
- Assuming no `size` means there can be no program-side count: maintain a separate count only if you also update it consistently for every insertion, deletion, replacement, and any independent key lifetime behavior; GC-driven disappearance itself cannot be reflected exactly.
- Using weak collections for job queues, eviction policies, or finalization. Those require explicit lifecycle/ordering semantics outside this API.

## Knowledge checks with answers

1. **Is `Symbol("x")` eligible?** Yes, unless a custom host/environment changes unrelated behavior; ordinary Symbol creation is non-registered.
2. **Is `Symbol.for("x")` eligible?** No; registry symbols are excluded.
3. **Can an object be ineligible because it is frozen?** No. Every object passes the abstract operation.
4. **Why is there no `.size`?** It would expose whether weakly held entries have been reclaimed.
5. **How can code report all visited nodes and still use a WeakSet for membership?** Keep a separate strong list or Set; that structure intentionally retains the reported values.
