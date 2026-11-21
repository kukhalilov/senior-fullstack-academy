
# JavaScript arrays — Interview questions and reasoning

## Core questions

1. How do Array indexes interact with `length`?
2. What is the difference between a hole and an explicit `undefined` element?
3. Why do `Array(3)` and `Array.of(3)` differ?
4. How does `Array.from` choose between an iterable and array-like input?
5. How is `Array.fromAsync` different from `Array.from`?
6. Which search method finds NaN, `includes` or `indexOf`, and why?
7. How do callback methods differ in hole handling?
8. Which common methods mutate, and which newer methods copy?
9. What is Array species construction?
10. What is the default order of `sort`, and what does a comparator need to provide?
11. What does stable sorting guarantee?
12. Are Array methods limited to Array instances?

## Concise interview answers

1. Adding an own property at a valid array index at or beyond current length increases length; reducing length deletes later configurable indexed properties.
2. A hole is an absent indexed property. Reading either may yield `undefined`, but presence-aware methods distinguish them.
3. A single numeric argument to `Array` requests a length and makes holes; `Array.of` treats every argument as an element.
4. It prefers the iterable protocol; without an iterator it reads `length` and indexed properties as an array-like value.
5. It prefers an async iterator, then adapts a sync iterator, then uses array-like reads; it awaits mapper results sequentially and returns a Promise. It additionally awaits sync-adapter and array-like source values, but a genuine async iterator's yielded value is not additionally awaited by this algorithm.
6. `includes` finds NaN with SameValueZero; `indexOf` uses strict equality and returns `-1` for NaN.
7. Methods such as `map`, `forEach`, `filter`, `some`, `every`, and reducers skip absent properties, while `find*` and `includes` read each position. Inherited indexed properties count as present where property-presence is checked.
8. `reverse`, `sort`, `splice`, and end-edit methods mutate. `toReversed`, `toSorted`, `toSpliced`, and `with` return non-mutating copies.
9. Methods that use `ArraySpeciesCreate` may construct results using `this.constructor[Symbol.species]`; this supports subclasses but can make result types surprising.
10. Default sort compares string forms lexicographically. A comparator returns a negative Number, zero, or positive Number to express ordering.
11. Elements comparing equal retain their original relative order.
12. Many prototype methods are generic and can operate on suitable array-like receivers, though an array-like object does not gain Array exotic length semantics automatically.

## Deep follow-up answers

### Why is a hole not simply undefined?

An indexed read can produce `undefined` for both an absent property and a property storing `undefined`, but a presence check distinguishes them. That affects callbacks and copies: `map` skips an absent slot, while a value-reading iterator visits the position and yields `undefined`. If an indexed property is inherited, a hole in the Array can read that inherited value and count as present for methods using `HasProperty`.

### How do species and copy-by-change interact?

Several older result-producing methods use species construction, letting an Array subclass customize the result constructor. That behavior can preserve a subclass or even cause surprising errors if the custom constructor is incompatible. `toReversed`, `toSorted`, `toSpliced`, and `with` deliberately produce ordinary Arrays rather than consulting species, which makes their result type predictable.

### What is the difference between iteration and array-like access?

An iterable defines an iterator that supplies values and can control sequencing or cleanup. An array-like object supplies a length and integer-keyed properties. `Array.from` prefers iteration, then array-like access. The two routes can yield different results if both are present or if values change while being read.

### Why can `toSorted()` change the representation of sparse data?

It reads through each position to produce a copy. An absent slot with no inherited index is read as `undefined`, and the result is dense. `slice()` uses property-presence behavior and can preserve holes. So a “copy then sort” should not be assumed equivalent to `slice().sort()` for sparse Arrays.

## Scenario questions

1. **A search must find NaN. Which method?** `includes`, because it uses SameValueZero.
2. **An Array of known size should have every slot initialized to zero. Why not `Array(size).map(() => 0)`?** `Array(size)` has holes and `map` skips them; use a value-producing construction such as `Array.from` with an array-like length and mapper.
3. **A reducer throws on empty user input. What should you inspect?** Whether an initial accumulator was provided and whether the Array has any present indexes.
4. **A sorted result must leave cached input unchanged.** Use `toSorted` with a comparator appropriate to the data, or copy before sorting where older runtimes require it.
5. **A list is consumed asynchronously and each mapper operation performs I/O. Should you expect concurrent mapping?** No; `Array.fromAsync` awaits mapper results sequentially. Use an explicitly designed concurrency strategy if parallelism is intended. Note that an async iterator's yielded Promise is not automatically unwrapped by `Array.fromAsync` before the mapper; the async iterator's own semantics determine what it yields.
6. **A subclass's `map` result has an unexpected type.** Inspect its `Symbol.species` behavior; compare with copy-by-change methods that return ordinary Arrays.
7. **A comma-separated Array string is being stored as a data format. What is the risk?** `join` loses type and nullish distinctions and does not escape values like a serialization format; use a suitable structured format instead.

## Tradeoffs and alternatives

| Requirement | Array choice | Tradeoff |
| --- | --- | --- |
| Update an exclusively owned Array | Mutating methods | Aliases observe changes |
| Preserve input while editing order/content | Copy-by-change methods | Allocates a new outer Array; nested objects remain shared |
| Search for NaN or equality with SameValueZero | `includes` | Returns Boolean, not index |
| Need matching index or predicate | `indexOf` / `findIndex` | Equality/hole semantics differ |
| Convert sync iterable to indexed storage | `Array.from` | Eagerly consumes the source |
| Convert async input sequentially | `Array.fromAsync` | Returns Promise; mapping is not concurrent |
| Model missing values | Explicit sentinel/optional values or deliberate holes | Holes interact inconsistently with method families |

## Common weak answers

- “An Array is just an object with a length field.” Its exotic indexed-property behavior maintains length invariants.
- “A hole and undefined are identical.” Reads can match, but presence-aware algorithms differ.
- “Array methods always skip holes.” The search and iterator families include value-reading methods.
- “`sort` sorts numbers numerically.” It uses string order by default.
- “`sort` is unstable.” Current ECMAScript requires stability.
- “Every copy preserves subclass type.” Species behavior differs; copy-by-change methods produce ordinary Arrays.
- “`Array.fromAsync` runs mapper work in parallel.” It awaits mapper results sequentially. Source-value awaiting depends on whether input is a real async iterator, a sync iterator, or array-like.
- “Array copies deep-clone nested data.” They are shallow.

## Self-check rubric

Award one point for each skill you can explain with a short example:

- Explain index/length coordination and the valid array-index boundary.
- Distinguish a hole from stored `undefined` and describe inherited-index effects.
- Choose between `Array`, `Array.of`, `Array.from`, and `Array.fromAsync`.
- Explain iterator versus array-like input handling.
- Compare search methods by equality, direction, holes, and return value.
- Distinguish mutating methods from copying/copy-by-change methods.
- Explain species and which methods use it.
- Explain default sort, comparator expectations, stability, and unspecified complexity.
- Explain callback short-circuiting and reduction on empty/sparse inputs.

Eight or nine points indicates strong readiness; revisit the matching reference lesson for any gaps.

## Sources

- [ECMAScript 2026 indexed collections](https://tc39.es/ecma262/2026/multipage/indexed-collections.html)
- [ECMAScript 2026 Array exotic objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [MDN Array reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
- [MDN Array.fromAsync](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync)
- [MDN Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [TC39 change-array-by-copy proposal](https://github.com/tc39/proposal-change-array-by-copy)
