
# JavaScript arrays — Exercises and worked solutions

## Goals

Practice distinguishing holes from explicit `undefined`, selecting a method based on equality and mutation, tracing callbacks, and handling synchronous/asynchronous sources. Before checking each answer, predict both the result and what happens to the original Array.

## Worked example

Normalize a sparse sequence without changing it:

```js
const source = [4, , 2];
const normalized = Array.from(source, value => value ?? 0);
console.log(normalized); // [4, 0, 2]
console.log(source);     // [4, <empty>, 2]
```

`Array.from` consumes the Array iterator, which reads the missing position as `undefined`. The mapper turns that value into zero. `Array.from` creates a new dense Array, so the source remains sparse and unchanged.

## Exercises

### 1. Constructor intent

Create an Array with one element whose value is `5`, then create an Array of length five with holes. Predict the result of `map()` on the latter and explain why its callback does not run.

### 2. Sparse method behavior

For `const values = ["a", , undefined]`, predict:

- callback indexes recorded by `map`, `findIndex`, and `forEach`;
- `values.includes(undefined)`;
- `values.indexOf(undefined)`;
- `values.map(value => value)` and `Array.from(values)`.

### 3. Mutation or copy

Given `const original = [3, 1, 2]`, produce a sorted copy, a reversed copy, and a copy with index 1 replaced by `9`. Confirm the original stays unchanged. Then use `splice` to remove index 1 from a separate Array and show its two results.

### 4. Search/equality decision

For `const values = [NaN, +0]`, compare `includes(NaN)` with `indexOf(NaN)`, and compare `includes(-0)` with `indexOf(-0)`. Explain the equality relation behind each result.

### 5. Callback and reduction

Use `reduce` with an explicit initial value to sum `[2, 3, 4]`. Then predict what happens when reducing an empty Array without an initial value. For `[2, , 4]`, show which values are passed to the reducer.

### 6. Species behavior

Create an Array subclass whose `Symbol.species` returns `Array`. Call `map` on an instance and inspect the result's constructor. Compare with `toReversed` and explain why both results are ordinary Arrays in this case.

### 7. Sequential asynchronous collection

Use `Array.fromAsync` with an async iterable that yields two numbers and an asynchronous mapper that doubles each value. Record a start/end label in the mapper and predict the order. Explain why the two mapper calls do not overlap.

Then compare a custom async iterator whose `next()` returns `{ value: promise, done: false }` with a synchronous iterator and an array-like object whose indexed value is that same Promise. Predict what the mapper receives in each case.

## Progressive hints

1. Use `Array.of` for one value. `Array(5)` creates length five but has no present indexes.
2. `findIndex` reads every position; `map` and `forEach` use property-presence checks; `includes` reads holes as `undefined` and uses SameValueZero.
3. The copy-by-change methods do not mutate. `splice` mutates and returns a removed-items Array.
4. `includes` uses SameValueZero; `indexOf` uses strict equality. Both equality rules treat signed zeros as equal, but only SameValueZero finds NaN.
5. Reducers skip absent indexes. The first present element becomes the accumulator if no initial value is given.
6. Species affects `map`; `toReversed` does not consult species.
7. `Array.fromAsync` awaits each mapper result before advancing; source-value awaiting depends on the input route (true async iterator versus sync-iterator adapter versus array-like).

## Complete solutions

### 1. Constructor intent

```js
const one = Array.of(5);
const holes = Array(5);
let calls = 0;
const mapped = holes.map(() => { calls++; return 1; });
console.log(one);       // [5]
console.log(holes.length, calls); // 5 0
console.log(mapped);    // [ <5 empty items> ]
```

`Array.of` treats 5 as an element. `Array(5)` creates five absent indexes; `map` skips them and preserves the sparse result shape.

### 2. Sparse method behavior

```js
const values = ["a", , undefined];
const mappedIndexes = [];
const foundIndexes = [];
const visitedIndexes = [];

values.map((value, index) => { mappedIndexes.push(index); return value; });
values.findIndex((value, index) => { foundIndexes.push(index); return false; });
values.forEach((value, index) => visitedIndexes.push(index));

console.log(mappedIndexes);  // [0, 2]
console.log(foundIndexes);   // [0, 1, 2]
console.log(visitedIndexes); // [0, 2]
console.log(values.includes(undefined)); // true
console.log(values.indexOf(undefined));  // 2
console.log(values.map(value => value)); // ["a", <empty>, undefined]
console.log(Array.from(values));         // ["a", undefined, undefined]
```

`map` and `forEach` skip the absent index. `findIndex` reads it and calls the predicate with `undefined`. `includes` finds the hole-read `undefined`; `indexOf` skips the absent index and finds the explicit element at index 2. `Array.from` consumes values and makes a dense result.

### 3. Mutation or copy

```js
const original = [3, 1, 2];
console.log(original.toSorted((a, b) => a - b)); // [1, 2, 3]
console.log(original.toReversed());              // [2, 1, 3]
console.log(original.with(1, 9));                // [3, 9, 2]
console.log(original);                           // [3, 1, 2]

const edited = ["a", "b", "c"];
const removed = edited.splice(1, 1);
console.log(edited);  // ["a", "c"]
console.log(removed); // ["b"]
```

The three copy-by-change operations preserve `original`; `splice` changes `edited` and returns a separate Array of removed elements.

### 4. Search/equality decision

```js
const values = [NaN, +0];
console.log(values.includes(NaN)); // true
console.log(values.indexOf(NaN));  // -1
console.log(values.includes(-0));  // true
console.log(values.indexOf(-0));   // 1
```

`includes` uses SameValueZero, which finds NaN. `indexOf` uses strict equality, which does not. Both relations treat positive and negative zero as equal.

### 5. Callback and reduction

```js
console.log([2, 3, 4].reduce((sum, value) => sum + value, 0)); // 9

try {
  [].reduce((sum, value) => sum + value);
} catch (error) {
  console.log(error.name); // TypeError
}

const seen = [];
[2, , 4].reduce((sum, value) => {
  seen.push(value);
  return sum + value;
}, 0);
console.log(seen); // [2, 4]
```

The empty traversal has no value from which to choose an initial accumulator, so the no-initial-value form throws. The sparse hole is skipped.

### 6. Species behavior

```js
class NumberList extends Array {
  static get [Symbol.species]() { return Array; }
}
const list = new NumberList(1, 2, 3);
const mapped = list.map(value => value * 2);
const reversed = list.toReversed();
console.log(mapped.constructor === Array);   // true
console.log(reversed.constructor === Array); // true
```

`map` consults species, which this subclass sets to Array. `toReversed` creates an ordinary Array without consulting species.

### 7. Sequential asynchronous collection

```js
async function* source() {
  yield 2;
  yield 4;
}

const events = [];
const values = await Array.fromAsync(source(), async value => {
  events.push(`start ${value}`);
  await Promise.resolve();
  events.push(`end ${value}`);
  return value * 2;
});

console.log(values); // [4, 8]
console.log(events); // ["start 2", "end 2", "start 4", "end 4"]
```

`Array.fromAsync` awaits the first mapper result before continuing to the second value, so mapper work is sequential, not concurrent. Async generators adopt a yielded Promise as part of async-generator semantics. A custom async iterator can instead return a Promise object as its `value`; `Array.fromAsync` passes that value to the mapper without an extra await. By contrast, the sync-iterator adapter and array-like path await source values.

For example, when a custom async iterator directly returns a Promise as its yielded `value`, the mapper receives that Promise object. When a sync iterator yields the same Promise, the async-from-sync adapter awaits it before passing the resolved value to the mapper. An array-like source also awaits the property value before invoking the mapper. If no mapper is supplied, a Promise value yielded by a true async iterator is stored as that Promise value.

## Tests and edge cases

- `Array(0)` is empty; `Array(-1)` and fractional or too-large numeric length forms throw `RangeError`.
- An array index can increase `length`; a non-index string key such as `"-1"` does not.
- Setting `length` smaller removes configurable own indexed properties at or above the new length.
- `find` and `includes` read holes; `map`, `forEach`, and `indexOf` skip absent properties (unless inherited indexed properties make them present).
- `toSorted` and `toReversed` create dense outputs from sparse inputs; `slice` preserves holes.
- `sort()` without a comparator orders string forms, not numeric values.
- `fill({})` stores one shared object reference in every filled slot.
- `reduce`/`reduceRight` without an initial value throw for empty or all-hole Arrays.
- `Array.fromAsync` can fail asynchronously; callers should await and handle its Promise.
- A copy is shallow; nested Arrays/objects remain shared references.

## Reflection questions

Answers follow each question.

1. **Why should a method choice be based on hole behavior as well as return value?** Sparse slots can be skipped, read as `undefined`, preserved, or materialized depending on the method, which can change callbacks, search results, and output shape.
2. **When is `includes` a better choice than `indexOf`?** When a Boolean answer is enough, especially when searching for `NaN` or treating holes read as `undefined` as matches; use `indexOf` when the matching index is required.
3. **Which operations in the exercise mutate, and how can aliases reveal it?** `splice`, `sort`, and other in-place methods mutate the same object, so a second variable referencing that Array observes the change; copy-by-change methods leave the original unchanged.
4. **Why is `Array.fromAsync` sequential rather than a concurrent mapper?** Its algorithm awaits each mapper result before advancing to the next element, preserving ordered consumption and backpressure; concurrency requires an explicit separate strategy. Source-value awaiting depends on the selected input route.
5. **What kinds of bugs can a custom species constructor introduce?** It can return an unexpected result type, violate assumptions made by a method, throw during result creation, or execute surprising constructor code when legacy methods create outputs.

## Sources

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [ECMAScript 2026 Array exotic objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [MDN Array reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN Array.fromAsync](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync)
- [TC39 Array.fromAsync proposal](https://github.com/tc39/proposal-array-from-async)
- [TC39 change-array-by-copy proposal](https://github.com/tc39/proposal-change-array-by-copy)
