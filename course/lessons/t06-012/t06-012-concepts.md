
# JavaScript arrays — Core concepts and how they fit together

## Learning objectives

- Explain how array indexes and `length` interact and what a hole means.
- Choose between Array construction, iterable conversion, and array-like conversion.
- Predict which common methods skip holes, read them as `undefined`, or make dense copies.
- Distinguish mutating methods, copying methods, and species-based result construction.
- Explain callback order, short-circuiting, and empty-array behavior.

## Prerequisites

You should understand objects, properties, prototypes, callbacks, iterables, equality, and basic functions. An array index is a property key representing an array index within the language's defined range; it is not every string that looks numeric. An iterable exposes an iterator method. An array-like object instead has a `length` and indexed properties.

## Core concepts

### Arrays are exotic objects with a coordinated length

An Array is an object whose special internal property-definition behavior coordinates array-index properties with its `length`. Its `length` is a non-enumerable, non-configurable data property and is writable unless changed by property descriptors. Adding an own array-index property at or above the current length raises `length` to one more than that index. Reducing `length` deletes configurable own index properties at or beyond the new end. If deletion reaches a non-configurable index, deletion stops; the Array's length is restored to one greater than that index, and the requested reduction fails (strict assignment throws; reflective operations report failure).

The highest valid array index is `2 ** 32 - 2`; the string `"4294967295"` is not an array index. `length` may be `2 ** 32 - 1`. When assigning, the value is converted using the array-length rules and must represent an integer in the inclusive range from 0 to that maximum; invalid numeric lengths throw `RangeError`, while conversions such as Symbol/BigInt can throw `TypeError`. Thus a coercible string like `"2"` can set length to 2. A property like `array[-1]` is a string-keyed ordinary property, not an element and not a reason to change `length`.

### A hole is absent, not an explicit undefined value

Compare `["a", , "c"]` with `["a", undefined, "c"]`. Both have length three, and reading index 1 returns `undefined` in either case. But the first lacks that own index property; presence-aware operations can distinguish them. Inherited indexed properties also matter: algorithms using property-presence checks can see an inherited value at a hole position.

Sparse behavior depends on the method:

| Behavior | Representative operations | Effect on an absent slot (if no inherited index exists) |
| --- | --- | --- |
| Check property presence and skip | `map`, `filter`, `forEach`, `some`, `every`, `reduce`, `indexOf` | Callback/search work skips it; copying methods in this family may preserve holes |
| Read every index | `find`, `findIndex`, `findLast`, `findLastIndex`, `includes`, Array iterators | Reads as `undefined`; callbacks/search see that value |
| Create a dense copy | `Array.from`, `toReversed`, `toSorted`, `toSpliced`, `with` | Missing positions become explicit `undefined` values |
| Preserve absent positions | `slice`, `concat`, and some other presence-aware copies | The result may retain holes |

This is a rule-of-thumb table; consult each reference item for exact behavior. It prevents the common mistake of treating every “iteration” method as hole-skipping.

### Constructors answer different questions

`[]` and array literals put the listed values at indexes. `Array(3)` uses the single-Number length form and creates three holes. `Array(3, 4)` creates two elements. `Array.of(3)` creates one element containing 3, avoiding the single-number special case. `Array.from(source)` prefers an iterable; if no iterator exists, it reads `length` and each indexed position from an array-like object. It can map values as they are read. `Array.fromAsync` first uses an async iterator, then a synchronous iterator adapter, then array-like indexed access. It awaits mapper results sequentially. Source-value awaiting is path-specific: sync-iterator adapter and array-like values are awaited, while values from a genuine async iterator are passed through as yielded (including a Promise object from a custom async iterator).

### Iterators expose a traversal, not a snapshot

`keys()`, `values()`, `entries()`, and `[Symbol.iterator]()` return iterator objects. `for...of` over an Array uses its values iterator. Array iterators consult the current length as they advance and read current indexed values, so mutation during iteration can affect future results. This differs from callback traversal methods such as `map` and `forEach`, which capture the initial length and do not visit appended indexes beyond it. `at(index)` reads one position and treats negative indexes as offsets from the end; it returns `undefined` outside the range.

### Methods vary by mutation and equality

`reverse`, `sort`, `splice`, `push`, `pop`, `shift`, `unshift`, `fill`, and `copyWithin` mutate the receiver. `slice`, `concat`, `map`, and other result methods create outputs, though legacy species rules can customize some Array results. `toReversed`, `toSorted`, `toSpliced`, and `with` provide non-mutating changes; they create ordinary Arrays and read through positions, so holes become `undefined` in the result.

`indexOf` uses strict equality and cannot find `NaN`; `includes` uses SameValueZero and can find it. `find` and its directional variants return a value or `undefined`, which is ambiguous if the found value is itself `undefined`; their index variants avoid that ambiguity by returning an index or `-1`.

### Callback methods have precise control flow

`map` calls a callback for present properties and returns a same-length result shape, preserving holes when no inherited property fills them. `filter` collects values whose predicate is truthy into a compact result. `some` and `every` short-circuit. `forEach` consumes the traversal without producing a result Array. `reduce` processes present properties from left to right; `reduceRight` processes them in reverse. Without an initial accumulator, an empty array (or an array with no present properties) throws `TypeError`; a single present value becomes the result without invoking the callback.

### Flattening and copying retain references

Array copies are shallow: nested objects remain shared references. `flat(depth)` removes nested Array structure to the requested depth (default one); it skips holes at flattened levels. `flatMap` maps each present value and flattens each returned Array by one level. It is not the same as recursively flattening arbitrary iterables.

### Sorting has a default and a contract

Without a comparator, `sort` and `toSorted` compare string representations, so `[1, 30, 4]` defaults to the order `[1, 30, 4]` because `"30"` sorts before `"4"`. Provide a comparator for numeric order, such as `(a, b) => a - b` for finite Numbers. Current ECMAScript requires stable sorting: elements that compare equal retain their relative order. The engine's comparison-call sequence, algorithm, and complexity are not specified. A comparator must define a consistent ordering and avoid mutating the Array or comparison values in ways that undermine it.

### Species affects selected result methods

`Array[Symbol.species]` is a getter returning `this` by default. Subclasses may override species so methods that use `ArraySpeciesCreate` produce a chosen constructor's instances. This legacy customization adds complexity and has security/performance implications. The copy-by-change methods intentionally return ordinary Arrays and do not consult species.

## Mechanisms and relationships

Use this checklist before choosing a method:

1. Does it mutate the receiver?
2. Does it skip absent indexes, read them, preserve holes, or densify the result?
3. Which equality algorithm does it use?
4. Does it short-circuit?
5. Does it use `ArraySpeciesCreate` or always produce an ordinary Array?
6. Does it consume an iterator, or does it use `length` plus indexed reads?

For async sources, choose `Array.fromAsync` only when sequential asynchronous consumption is appropriate. It does not request all mapper calls concurrently.

## Worked examples

### Hole versus explicit undefined

```js
const sparse = ["x", , "z"];
const explicit = ["x", undefined, "z"];

console.log(sparse.length, explicit.length); // 3 3
console.log(sparse[1], explicit[1]);       // undefined undefined
console.log(1 in sparse, 1 in explicit);   // false true
console.log(sparse.map(value => value));   // ["x", <empty>, "z"]
console.log(sparse.includes(undefined));   // true
```

The `in` operator checks the prototype chain as well as own properties. Under the ordinary unmodified Array prototype, it distinguishes this hole from the explicit element.

### Mutation versus copy

```js
const original = [3, 1, 2];
const sorted = original.toSorted((a, b) => a - b);
console.log(sorted);   // [1, 2, 3]
console.log(original); // [3, 1, 2]
```

### Same value, different search result

```js
const values = [NaN];
console.log(values.indexOf(NaN));   // -1
console.log(values.includes(NaN));  // true
```

## Misconceptions and edge cases

- **“Length counts defined values.”** It is one greater than the greatest own array-index property; holes contribute to length.
- **“A hole is just undefined.”** Reads can match, but property-presence tests and methods differ.
- **“Every callback method skips holes.”** `find*` callbacks are called for absent positions as `undefined` when there is no inherited indexed value.
- **“`Array.from` is just a shallow copy of an Array.”** It uses the iterator when present, can accept array-like values, and can map while constructing.
- **“`Array(5)` creates five undefined values.”** It creates holes; use a value-producing constructor path for dense values.
- **“`sort()` is numeric by default.”** The default order is by string comparison.
- **“`toSorted()` preserves holes.”** It reads through positions and creates a dense Array.
- **“All copying methods return Array.”** Species-sensitive older methods can create subclass instances; copy-by-change methods return ordinary Arrays.
- **“`reduce()` on an empty array returns undefined.”** Without an initial value and without any present element, it throws.
- **“Copies duplicate nested objects.”** They copy only the outer sequence; nested references are shared.

## Knowledge checks with answers

1. **What does `Array(2)` contain?** Two holes and length 2.
2. **What is the biggest valid Array index?** `2 ** 32 - 2`; `2 ** 32 - 1` is not an array index.
3. **Which finds a stored or hole-read `NaN`: `indexOf` or `includes`?** `includes`, because it uses SameValueZero.
4. **Do `toReversed` and `reverse` mutate the same receiver?** `reverse` mutates; `toReversed` returns a dense copy.
5. **What does `Array.fromAsync` await?** Mapper results sequentially in all paths; it also awaits sync-adapter and array-like source values, but does not additionally await a value yielded by a genuine async iterator.
6. **Can an inherited property at a hole index be visited by `map`?** Yes; presence checks include the prototype chain.
7. **What happens when `reduce` has no initial value and no present elements?** It throws `TypeError`.

## Sources

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [ECMAScript 2026 Array exotic objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [MDN Array reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN Array.fromAsync](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync)
