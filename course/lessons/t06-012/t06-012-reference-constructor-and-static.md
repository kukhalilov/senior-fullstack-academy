
# JavaScript arrays — Reference: Array constructor, static methods and static property

## Scope and version

This reference covers the Array constructor, its supplied static members, and current construction semantics through ECMAScript 2026. `Array.fromAsync` became standard in ECMAScript 2024. See [ECMAScript indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html), [Array exotic objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html), and [MDN Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array).

## How this group fits the mental model

The constructor and static methods make new Arrays from different kinds of input. A single numeric constructor argument is a special length request; `of()` treats every argument as an element. `from()` uses synchronous iterable values or array-like indexed values. `fromAsync()` consumes asynchronous or synchronous iterators, or array-like indexed values, sequentially; whether source values themselves are awaited depends on the selected input path. Species controls constructors for selected Array results.

## Supplied names explained

- `Array` — The global constructor/function for Arrays. `Array()` and `new Array()` both create an Array. With no arguments it creates an empty Array; with one Number argument it treats that number as a requested length and creates holes; with multiple arguments it creates elements from those arguments. A single Number is valid as a length only if it is an integer from 0 through `2 ** 32 - 1`; invalid lengths throw `RangeError`. A single non-Number argument is an element, not a length. Prefer a literal or `Array.of()` when a single Number should be a value.
- `Array[Symbol.species]` — Static getter returning `this` by default. Array methods that use species construction consult the constructor's species property to select the result constructor. Subclasses can override it, but species customization makes result types less predictable. The newer copy-by-change methods do not use species.
- `Array.from` — Creates a new Array (or uses a constructable `this` value) from an iterable, preferring its iterator when available; otherwise it reads an array-like object's `length` and indexed values. Optional `mapFn` and `thisArg` map values during creation. It produces a dense result when positions are absent and can close an iterator if mapping/creation fails.
- `Array.fromAsync` — Async factory that returns a Promise for an Array (or constructed result). It prefers an async iterator, otherwise adapts a sync iterator, otherwise reads array-like positions. It awaits each mapper result before advancing, so mapping is sequential. Value awaiting depends on the path: values yielded by a genuine async iterator are used as yielded (an iterator may yield a Promise object); the synchronous-iterator adapter awaits yielded values, and the array-like path awaits each indexed value. Standardized in ECMAScript 2024.
- `Array.isArray` — Returns whether a value is an Array exotic object. It works across realms, unlike a constructor `instanceof` check that depends on a particular realm's prototype. It returns false for typed arrays and array-like objects; a revoked Proxy can cause a `TypeError` while the check is performed.
- `Array.of` — Creates an Array from its argument list, so `Array.of(4)` is `[4]`, not an Array of length four. It uses its constructor receiver where construction semantics allow, which supports subclassing.

## Cross-item comparison

| Need | Choice | Result |
| --- | --- | --- |
| One Number should be an element | `Array.of(number)` | One-element Array |
| Create a requested length | `Array(number)` | Array with that length and holes |
| Convert sync iterable or array-like input | `Array.from(source)` | Synchronous dense Array |
| Convert async iterable or other supported input | `Array.fromAsync(source)` | Promise for a sequentially collected Array |
| Check Array identity across realms | `Array.isArray(value)` | Boolean based on Array exotic identity |

## Examples

```js
console.log(Array(3));       // [ <3 empty items> ]
console.log(Array.of(3));    // [3]
console.log(Array.from("cat")); // ["c", "a", "t"]

const arrayLike = { 0: "first", 2: "third", length: 3 };
console.log(Array.from(arrayLike)); // ["first", undefined, "third"]
```

```js
const arrayLike = { 0: Promise.resolve(2), 1: 3, length: 2 };
const values = await Array.fromAsync(arrayLike, value => value * 2);
console.log(values); // [4, 6]
```

`Array.fromAsync` awaits each mapper result before it advances. In addition, its synchronous-iterator adapter and array-like path await each source value before mapping; a genuine async iterator's yielded value is passed through as yielded, so a custom async iterator can yield a Promise object to the mapper. Async generators themselves adopt/await a yielded Promise according to async-generator semantics, which can make a simple generator example look different.

```js
const pending = Promise.resolve(7);
const customAsyncIterable = {
  [Symbol.asyncIterator]() {
    let finished = false;
    return {
      async next() {
        if (finished) return { done: true };
        finished = true;
        return { done: false, value: pending };
      },
    };
  },
};

const asyncIteratorResult = await Array.fromAsync(
  customAsyncIterable,
  value => value instanceof Promise,
);
const syncIteratorResult = await Array.fromAsync(
  { *[Symbol.iterator]() { yield pending; } },
  value => value,
);
console.log(asyncIteratorResult); // [true]: mapper received the Promise object
console.log(syncIteratorResult);  // [7]: sync adapter awaited the yielded Promise
```

An array-like input also awaits each indexed value before calling its mapper. If `Array.fromAsync` is called without a mapper for the custom async iterable above, the Promise object is stored as the array element.

## Common mistakes

- Assuming `Array(3)` contains three explicit `undefined` values; its indexes are absent holes.
- Using `Array(value)` when `value` might be a Number intended as one element; use `Array.of(value)`.
- Assuming `Array.from` only accepts Arrays; it consumes any iterable or array-like value.
- Assuming `Array.fromAsync` runs mapper calls concurrently; it processes/awaits them sequentially.
- Assuming `Array.isArray` and `value instanceof Array` are equivalent across realms.
- Assuming `Array[Symbol.species]` changes the results of `toReversed`, `toSorted`, `toSpliced`, or `with`.
- Assuming an absent array-like property is skipped by `Array.from`; it is read as `undefined` and included.
- Assuming a genuine async iterator's yielded Promise is unwrapped by `Array.fromAsync`; source-value awaiting differs from the sync-iterator-adapter and array-like routes.

## Knowledge checks with answers

1. **What does `Array(2)` create?** An Array of length 2 with two holes.
2. **How do you create a one-element Array containing `2`?** `Array.of(2)`.
3. **Which input protocol does `Array.from` prefer when both iterator and length exist?** The iterable protocol.
4. **Which input protocol does `Array.fromAsync` prefer?** Async iterable, then synchronous iterable, then array-like indexed access.
5. **Does `Array.fromAsync` map all values at once?** No; mapper results are awaited sequentially. Source-value awaiting differs by input path: sync-iterator adapter and array-like values are awaited, while a genuine async iterator's yielded value is not additionally awaited by `Array.fromAsync`.
6. **Why can `Array.isArray` succeed across realms where `instanceof` fails?** It checks Array exotic identity rather than comparing against one realm's `Array.prototype`.

## Further reading

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [ECMAScript 2026 Array exotic objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [MDN Array reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN Array.fromAsync](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync)
- [TC39 Array.fromAsync proposal](https://github.com/tc39/proposal-array-from-async)
