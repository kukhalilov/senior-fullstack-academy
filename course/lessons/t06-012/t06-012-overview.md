
# JavaScript arrays — Big-picture orientation and mental model

## Problem and purpose

An Array stores an ordered sequence under integer-indexed properties and tracks the end with `length`. Arrays are convenient for ordered data, iteration, searching, transformation, aggregation, and in-place edits. Their behavior is richer than “a list of values”: arrays are objects with special index/length rules, and their methods differ in mutation, copying, sparse-slot handling, iteration source, and subclass construction.

Those differences explain common bugs. `Array(3)` has three holes, not three explicit `undefined` values; `map()` skips absent slots, while `includes()` reads them as `undefined`; `sort()` changes its receiver, while `toSorted()` returns a copy. Good Array code starts by deciding whether the input may be sparse and whether mutation is acceptable.

## Plain-language mental model

Think of an Array as an object with a numbered set of property slots and a special `length` marker. Creating index `5` can move `length` to `6`; shortening `length` deletes later configurable index properties. A hole is an absent property between zero and `length - 1`, so reading it normally gives `undefined`, but checking whether the property exists can distinguish it from a stored `undefined`.

Methods are tools operating over that structure. Some read through every position, some skip missing properties, and some preserve or fill holes in a new result. Some mutate the same Array; newer copy-by-change methods return a dense copy. Iterables and array-like objects can also feed Array factories, but those are different protocols: an iterable supplies values through an iterator, while an array-like object supplies `length` and indexed properties.

## How the parts fit together

1. Choose construction: a literal for values, `Array.of()` for positional values, `Array.from()` for iterables/array-like values, or `Array.fromAsync()` for asynchronous sources.
2. Decide whether the data can contain holes. Use presence-aware methods when missing slots have meaning; normalize first when dense values are required.
3. Choose an operation family: index/iterate, search, map/filter/flatten, add/remove, rearrange/fill, aggregate, or convert to text.
4. Decide whether mutation is intended. `reverse`, `sort`, and `splice` mutate; `toReversed`, `toSorted`, and `toSpliced` copy.
5. Check equality semantics and result construction. `includes` uses SameValueZero, `indexOf` uses strict equality; some older copying methods consult `Symbol.species`, while copy-by-change methods create ordinary Arrays.

## Concept map

| Need | Array feature | Main idea |
| --- | --- | --- |
| Store ordered indexed data | Array exotic object | Index keys and `length` stay coordinated |
| Convert values into a sequence | `Array.from`, `Array.fromAsync`, `Array.of` | Iterator/array-like ingestion versus positional arguments |
| Traverse values or indexes | Iterators and `at` | Iterator methods produce a live cursor; `at` accesses one position |
| Find a value or position | Search methods | Equality rule, direction, and hole handling differ |
| Transform or flatten | Mapping methods | Callback methods may skip holes; flattening has depth rules |
| Edit in place or copy | Mutating/copying methods | Mutation affects aliases; copy methods return a new outer Array |
| Fold into one result | `reduce`, `reduceRight` | Accumulate in a chosen direction; empty arrays need care |

## End-to-end walkthrough

Suppose a list can contain missing slots and you want to preserve the input while normalizing it for a display:

```js
const readings = [12, , undefined, 8];
const display = readings.toReversed();

console.log(readings.length); // 4
console.log(readings.includes(undefined)); // true
console.log(display); // [8, undefined, undefined, 12]
console.log(readings); // [12, <empty>, undefined, 8]
```

The hole differs from an explicit `undefined` for presence-aware methods, but `includes()` reads each position and uses SameValueZero, so it finds an undefined-like value. `toReversed()` does not mutate `readings`; it reads each index and creates a dense result where the hole has become `undefined`.

## When to use it and tradeoffs

Use Arrays for ordered collections where indexing, traversal, and built-in transformation methods match the problem. Prefer copying methods when callers may retain references to the input or when immutable update patterns are clearer. Prefer mutating methods when ownership is local and mutation is intentional. Sparse arrays are usually harder to reason about; if holes are not meaningful, build dense arrays with literals, `Array.from`, or an explicit mapping step.

Array methods can be generic over array-like receivers, but an array-like object does not gain Array's exotic `length` behavior or iteration automatically. Array subclasses and `Symbol.species` can influence legacy result-producing methods; the copy-by-change methods intentionally return ordinary Arrays, which makes their result construction more predictable.

## Recent version changes

ECMAScript 2023 added `findLast`, `findLastIndex`, `toReversed`, `toSorted`, `toSpliced`, and `with`; ECMAScript 2024 added `Array.fromAsync`. It consumes async iterables, synchronous iterables, or array-like values sequentially and awaits mapper results. Source-value awaiting depends on the route: values from the sync-iterator adapter and array-like reads are awaited, while a genuine async iterator's yielded value is passed through as yielded. See the [ECMAScript 2023 indexed-collections edition](https://tc39.es/ecma262/2023/), the [ECMAScript 2024 indexed-collections edition](https://tc39.es/ecma262/2024/multipage/indexed-collections.html), and the [Array.fromAsync proposal](https://github.com/tc39/proposal-array-from-async).

## What later lessons cover

The concepts lesson explains array exotic behavior, holes, iteration, callback semantics, mutation, copying, and subclass construction. Reference lessons cover every supplied constructor, property, iterator, method, and operator-adjacent behavior. Practice traces sparse arrays and selects appropriate operations; interview questions focus on mutation, equality, iteration, and species.

## Sources

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [ECMAScript 2026 Array exotic objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [MDN Array reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [TC39 change-array-by-copy proposal](https://github.com/tc39/proposal-change-array-by-copy)
- [TC39 Array.fromAsync proposal](https://github.com/tc39/proposal-array-from-async)
