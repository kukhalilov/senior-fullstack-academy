<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript arrays — Reference: Indexing and iterator methods

## Scope and version

This reference covers one-position access and the synchronous Array iterator family through ECMAScript 2026. `Array.prototype.at` became standard in ECMAScript 2022. See [ECMAScript indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html), [MDN Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), and [MDN Array.prototype.at](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at).

## How this group fits the mental model

An Array index is a property key; `at()` computes a single index, while iterator methods create a cursor that yields values, indexes, or pairs. The iterator family reads positions as it advances, so holes usually appear as `undefined` values rather than being omitted.

## Supplied names explained

- `Array.prototype.at` — Returns the value at an integer index, converting/truncating the supplied index; negative values count backward from the end. Out-of-range indexes return `undefined`. It is generic and does not mutate the receiver.
- `Array.prototype.entries` — Returns an iterator yielding `[index, value]` pairs in ascending index order. It includes every position below the current length, reading a hole as `undefined`; it does not snapshot all values at creation.
- `Array.prototype.keys` — Returns an iterator yielding integer indexes from 0 through the length observed as iteration advances. It yields indexes for holes because it enumerates positions, not present properties.
- `Array.prototype.values` — Returns an iterator yielding values by reading each index. Holes are read as `undefined`; mutations to values or length during traversal can affect later yields.
- `Array.prototype[Symbol.iterator]` — The default iteration method for Arrays; its initial value is the same function as `Array.prototype.values`. This is why `for...of`, spread, and `Array.from` consume Array values in index order.

## Cross-item comparison

| Method | Each yielded value | Includes holes? |
| --- | --- | --- |
| `keys()` | Index | Yes, as positions |
| `values()` / `[Symbol.iterator]()` | Value read at each index | Yes, read as `undefined` absent inherited value |
| `entries()` | `[index, value]` | Yes, value read as `undefined` absent inherited value |
| `at(index)` | One value | Reads the requested position; out of range is `undefined` |

These iterators are lazy: creating one does not enumerate the entire Array.

## Examples

```js
const letters = ["a", , "c"];
console.log(letters.at(-1)); // "c"
console.log([...letters.keys()]); // [0, 1, 2]
console.log([...letters.values()]); // ["a", undefined, "c"]
console.log([...letters.entries()]); // [[0, "a"], [1, undefined], [2, "c"]]
```

```js
const values = [1, 2];
const iterator = values.values();
console.log(iterator.next()); // { value: 1, done: false }
values.push(3);
console.log([...iterator]); // [2, 3]
```

The iterator sees the appended item because it checks the current length as it continues.

This live-length rule contrasts with callback traversals such as `map`, `forEach`, and `reduce`, which capture the starting length once and do not visit newly appended indexes beyond that boundary.

## Common mistakes

- Assuming `keys()` yields only indexes with present properties; it yields each position below length.
- Assuming `values()` skips holes; it reads them as `undefined` unless an inherited indexed property supplies a value.
- Assuming iterators are snapshots; later mutations may affect future yields.
- Using `array[index]` when negative-from-end access is intended; bracket indexing treats a negative number as a property key, while `at()` counts from the end.
- Assuming `at()` wraps around when the index is beyond either end; it returns `undefined`.
- Assuming an iterator method returns an Array; it returns an iterator object.

## Knowledge checks with answers

1. **What does `array.at(-1)` return?** The last value, or `undefined` for an empty Array.
2. **Does `keys()` skip a hole?** No, it yields the numeric position.
3. **What is yielded for a hole by `values()` if the prototype chain has no indexed value?** `undefined`.
4. **Does `[Symbol.iterator]()` yield `[index, value]` pairs?** No, it is the values iterator; use `entries()` for pairs.
5. **Are values fixed when the iterator is created?** No; later reads/length changes can affect traversal.

## Further reading

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [MDN Array reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN Array.prototype.at](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at)
