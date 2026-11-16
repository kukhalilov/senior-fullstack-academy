<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript arrays — Reference: In-place rearrangement and fill methods

## Scope and version

This reference covers the supplied in-place copying, filling, reversing, and sorting methods through ECMAScript 2026. `sort()` is required to be stable in current ECMAScript; the engine's specific sorting algorithm and complexity are not specified. See [ECMAScript indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html), [MDN Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), and [MDN sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).

## How this group fits the mental model

These methods rearrange or overwrite properties on the receiver. Negative indexes count from the end for range arguments. Hole-aware operations may preserve absent properties; filling makes positions present. Sorting has a default string order unless a comparator is supplied.

## Supplied names explained

- `Array.prototype.copyWithin` — Copies a range of indexed properties within the same receiver, overwriting the target range without changing length. Target, start, and optional end accept negative offsets from the end. It handles overlap in the safe direction, like a memory move; absent source properties cause corresponding target properties to be deleted, preserving holes.
- `Array.prototype.fill` — Writes the same supplied value into every position in a normalized start/end range and returns the receiver. It mutates, makes holes in the range present, and stores the same object reference in each filled slot rather than cloning it.
- `Array.prototype.reverse` — Reverses indexed properties in place and returns the receiver. It preserves holes by moving property presence along with values; it is generic over suitable array-like receivers.
- `Array.prototype.sort` — Sorts in place and returns the receiver. Without a comparator, values are converted to strings and compared lexicographically by UTF-16 code units; with a comparator, its result is converted to Number, and a `NaN` result is treated like zero. `undefined` values sort after defined values, and holes end up after `undefined`. Sorting is stable in current ECMAScript; algorithm and complexity are implementation choices.

## Cross-item comparison

| Method | Main effect | Receiver length | Sparse behavior |
| --- | --- | --- | --- |
| `copyWithin` | Copy a range into another range | Unchanged | Missing source positions delete corresponding targets |
| `fill` | Set each position to one value | Unchanged | Creates properties in holes in the range |
| `reverse` | Reverse order | Unchanged | Hole positions move with the reversal |
| `sort` | Order present values | Unchanged | Holes finish after explicit `undefined` values |

For a non-mutating rearrangement, use the relevant copy-by-change method where available: `toReversed()` or `toSorted()`.

## Examples

```js
const values = [1, 2, 3, 4, 5];
values.copyWithin(0, 3);
console.log(values); // [4, 5, 3, 4, 5]
```

```js
const shared = { active: true };
const values = Array(3).fill(shared);
console.log(values[0] === values[2]); // true: same object reference
values[1].active = false;
console.log(values[0].active); // false
```

```js
const records = [
  { name: "B", rank: 1 },
  { name: "A", rank: 1 },
  { name: "C", rank: 0 },
];
records.sort((left, right) => left.rank - right.rank);
console.log(records.map(record => record.name)); // ["C", "B", "A"]
```

Stable sorting keeps `B` before `A` because their comparator results are zero and that was their original order.

## Common mistakes

- Assuming `copyWithin` inserts or changes length; it overwrites within the current length.
- Assuming `fill({})` creates a fresh object per slot; every slot receives the same reference.
- Assuming `reverse` or `sort` returns a new Array; both mutate and return the same receiver.
- Assuming default sort is numeric or locale-aware.
- Returning Boolean from a comparator without defining a consistent negative/zero/positive ordering; use a comparator returning a negative, zero, or positive Number.
- Assuming the specification guarantees a particular sort algorithm or complexity.
- Treating a hole and explicit `undefined` as the same during `sort`; holes are placed after explicit undefined values.
- Forgetting that a comparator can be called in an implementation-chosen sequence and should not mutate the Array being sorted.

## Knowledge checks with answers

1. **Does `copyWithin` change length?** No.
2. **What does `fill` return?** The same receiver.
3. **Are objects passed to `fill` cloned?** No; the same reference is stored at each position.
4. **What is the default ordering for `sort`?** String conversion followed by UTF-16 code-unit lexicographic order.
5. **What does a comparator result of `NaN` mean to sorting?** It is treated like zero (equal for that comparison).
6. **Is Array sorting stable in current ECMAScript?** Yes, equal-comparing elements retain relative order; complexity is not specified.

## Further reading

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [MDN Array reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
