
# JavaScript arrays — Reference: Searching and predicate methods

## Scope and version

This reference covers the supplied Array searches and predicate methods through ECMAScript 2026. `findLast` and `findLastIndex` became standard in ECMAScript 2023. See [ECMAScript indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html), [MDN Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), and the [change-array-by-copy proposal](https://github.com/tc39/proposal-change-array-by-copy).

## How this group fits the mental model

Search methods answer different questions: “is this value present?”, “where is this equal value?”, or “which value/index satisfies this predicate?” The equality relation, search direction, handling of holes, and return value all matter. Predicate methods scan and short-circuit when their answer is known.

## Supplied names explained

- `Array.prototype.every` — Calls a predicate for each present indexed property and returns true only if every call is truthy. It short-circuits on false; for an empty Array or one with no present properties it returns true. It does not mutate by itself, but callbacks can.
- `Array.prototype.find` — Scans indexes from low to high and returns the first value whose predicate is truthy, or `undefined`. It reads every position below the initial length, including holes as `undefined` when no inherited index exists. Because a matching value may itself be `undefined`, use its index variant when that distinction matters.
- `Array.prototype.findIndex` — Like `find`, but returns the first matching index or `-1`. It calls the predicate for each position, including absent own slots (which read as `undefined` unless inherited); it short-circuits on a match.
- `Array.prototype.findLast` — Scans from high to low and returns the last matching value or `undefined`. Added in ECMAScript 2023. It visits positions including holes as `undefined` when no inherited indexed property exists.
- `Array.prototype.findLastIndex` — Reverse-direction predicate search returning an index or `-1`; it visits every position, including holes read as `undefined`. Added in ECMAScript 2023.
- `Array.prototype.includes` — Returns whether a value occurs using SameValueZero equality, so it can find `NaN` and treats signed zeros as equal. It reads every index, so a hole can match `undefined`; an inherited value at that index is read instead. Optional `fromIndex` sets the start, including negative offsets from the end.
- `Array.prototype.indexOf` — Searches forward using strict equality and returns the first matching index or `-1`. It skips positions for which the index is absent throughout the prototype chain, and it cannot find `NaN`. Optional `fromIndex` chooses the start position.
- `Array.prototype.lastIndexOf` — Searches backward with strict equality and returns the last matching index or `-1`. It skips absent indexed properties and cannot find `NaN`. Its optional starting index defaults to the final position; a negative value is offset from the end.
- `Array.prototype.some` — Calls a predicate for each present indexed property and returns true at the first truthy result; otherwise false. It short-circuits; an empty Array or one with no present properties returns false.

For methods using callbacks, the initial length is captured before scanning, but property presence and values are checked as the algorithm reaches each index. Mutations during a callback can therefore affect later observations, although newly appended positions beyond the initial length are not visited.

## Cross-item comparison

| Method family | Equality/predicate | Direction | Hole behavior | No match / empty result |
| --- | --- | --- | --- | --- |
| `includes` | SameValueZero | Forward from `fromIndex` | Reads position as value | `false` |
| `indexOf`, `lastIndexOf` | Strict equality | Forward / backward | Skips absent property | `-1` |
| `find`, `findLast` | Callback truthiness | Forward / backward | Calls callback with read value | `undefined` |
| `findIndex`, `findLastIndex` | Callback truthiness | Forward / backward | Calls callback with read value | `-1` |
| `some`, `every` | Callback truthiness | Forward | Skip absent property | `false` / `true` on empty traversal |

## Examples

```js
const values = [NaN, , undefined, 4];
console.log(values.includes(NaN));       // true
console.log(values.indexOf(NaN));        // -1
console.log(values.includes(undefined)); // true; the hole is read as undefined
console.log(values.findIndex(value => value === undefined)); // 1
```

```js
const scores = [7, 12, 9, 15];
console.log(scores.find(score => score >= 10));       // 12
console.log(scores.findLast(score => score >= 10));   // 15
console.log(scores.findLastIndex(score => score >= 10)); // 3
console.log(scores.every(score => score > 0));        // true
console.log(scores.some(score => score > 14));        // true
```

## Common mistakes

- Assuming `includes` and `indexOf` use the same equality algorithm.
- Expecting `indexOf(NaN)` to find NaN.
- Treating a hole and explicit `undefined` the same for every method.
- Using `find()` when `undefined` is a valid matching value and then assuming `undefined` means no match.
- Forgetting that `find*` callbacks run on holes, while `some`/`every` skip absent properties.
- Assuming predicate methods scan the full Array even after the answer is known.
- Assuming an empty Array makes `every()` false; it is true because no counterexample exists.
- Assuming callback mutations change the captured traversal length.

## Knowledge checks with answers

1. **Which method can find `NaN`?** `includes`, because it uses SameValueZero.
2. **Which methods search backward?** `lastIndexOf`, `findLast`, and `findLastIndex`.
3. **Does `findIndex` skip a hole?** No; it reads the position and calls the predicate.
4. **What does `every()` return on an empty Array?** True.
5. **What does `some()` return on an empty Array?** False.
6. **When do `findLast` and `findLastIndex` enter the standard?** ECMAScript 2023.

## Further reading

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [MDN Array reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN findLast](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast)
- [TC39 change-array-by-copy proposal](https://github.com/tc39/proposal-change-array-by-copy)
