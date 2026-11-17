<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript iterables, iterators, and generator protocols — Reference: Synchronous iterable and iterator protocol

# Scope and version

This reference covers the supplied synchronous protocol, consumers, `Iterator` class, and helper methods through ECMAScript 2026. Iterator helpers were added in ES2025; `Iterator.concat()` followed in ES2026. Implementations may lag the edition. See [ECMAScript iteration](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html), [iteration statements](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html), and [MDN iterator guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators).

# How this group fits the mental model

This group explains how JavaScript asks for a synchronous sequence, obtains successive values, and cleans up when consumption stops. The iterable supplies the entry point; the iterator stores cursor state. `Iterator` supplies common helper behavior for iterator objects, but the protocol itself remains structural. Consumer syntax and lazy helper methods pull values; terminal methods consume them.

# Supplied names explained

## Protocol foundation

- `Iterable protocol` — An object is iterable when it supplies a callable `Symbol.iterator` method that returns an iterator object.
- `Iterator protocol` — An iterator has a callable `next()` that returns an object describing whether a value is available and what that value is.
- `IteratorResult object` — The object returned by `next()`, normally `{ value, done }`. Missing `done` is treated as false; `done: true` ends iteration and may carry a final return value.
- `Iterator protocol next method` — Each call advances the cursor and returns an iterator result. Calls after completion should continue returning a completed result; `for...of` does not send arguments to `next()`.
- `Iterator protocol optional return method` — Requests iterator cleanup after early completion. Consumers such as `for...of` call it when leaving early, if present; generator cleanup commonly runs through `finally`.
- `Iterator protocol optional throw method` — Lets a caller inject an exception into an iterator that supports it. Generator objects implement it; ordinary loop consumers generally do not call it.
- `Iterator global constructor` — The `Iterator` base is subclassable, but calling or constructing the base itself throws. Use it to define custom iterator subclasses, not as a factory for built-in sequence values.
- `Iterator.prototype` — Shared prototype for the `Iterator` constructor and its helper methods. Built-in iterators in current editions inherit iterator behavior through this prototype chain.
- `Iterator.prototype.constructor` — A configurable accessor whose getter returns `Iterator`; assignment on an instance creates/shadows an own property rather than changing the shared prototype. It does not reconstruct an iterator from a sequence.
- `Iterator.from` — Converts an iterable or iterator into an Iterator-compatible object. It returns an existing Iterator instance when possible and wraps a bare iterator so helpers are available. The protocol adapter accepts a string primitive as an iterable; other non-object primitives are rejected.
- `Iterator.concat` — Creates a lazy iterator that yields values from each supplied iterable in argument order. At the call, it verifies each argument is an object and captures its `Symbol.iterator` method; it calls those methods only as consumption reaches each iterable. Inputs must be iterable objects; a bare iterator that is not itself iterable can be adapted with `Iterator.from()`.

## Lazy transformation helpers

- `Iterator.prototype.map` — Lazily maps each yielded value through `mapper(value, index)`; the callback runs only when a consumer pulls the mapped iterator. Indexing starts at zero for this helper, and there is no `thisArg` parameter.
- `Iterator.prototype.filter` — Lazily yields values whose `predicate(value, index)` is truthy; it may pull several source values to produce one output. Indexing starts at zero for this helper, and there is no `thisArg` parameter.
- `Iterator.prototype.take` — Yields at most the requested count and then completes. The limit is converted to an integer; NaN and negative values throw `RangeError`, while positive infinity is unbounded. Stopping early closes the upstream iterator.
- `Iterator.prototype.drop` — Consumes and discards the requested number of initial values, then yields the rest. Its converted limit follows `take`'s nonnegative-integer rules.
- `Iterator.prototype.flatMap` — Calls `mapper(value, index)` and requires each mapped result to be iterable, then lazily yields that inner iterable's values before moving to the next outer value. Indexing starts at zero; there is no `thisArg` parameter.

## Consuming terminal helpers

- `Iterator.prototype.reduce` — Consumes the iterator into an accumulator by calling `reducer(accumulator, value, index)` and returns one value. Without an initial value, an empty iterator throws; it also closes on callback failure. The first value becomes the accumulator when no initial value is supplied, and callback indexing begins at zero for the first reducer call.
- `Iterator.prototype.toArray` — Consumes all remaining values into a new array. It is unsuitable for an infinite iterator unless a prior helper bounds it.
- `Iterator.prototype.forEach` — Consumes values and calls `procedure(value, index)` for each one, returning undefined. It is synchronous; returning a promise does not make it await.
- `Iterator.prototype.some` — Calls `predicate(value, index)` until it succeeds or the iterator ends, returning a boolean and closing after a successful early match.
- `Iterator.prototype.every` — Calls `predicate(value, index)` until it fails or the iterator ends, returning a boolean and closing after the first failure.
- `Iterator.prototype.find` — Returns the first value matching `predicate(value, index)`, or undefined when exhausted; a match stops consumption and closes upstream.

## Identity, protocols, and built-in consumers

- `Iterator.prototype[Symbol.iterator]` — Returns the iterator itself, making Iterator instances iterable and allowing them to feed synchronous consumers and helpers.
- `Iterator.prototype[Symbol.toStringTag]` — A configurable accessor that reports `"Iterator"` for ordinary iterator instances; it is a debugging tag, not a reliable type test.
- `Iterator helper object` — An implementation-created lazy iterator returned by helper methods. It has no public constructor.
- `%IteratorHelperPrototype%.next` — Resumes the helper pipeline and requests its next output.
- `%IteratorHelperPrototype%.return` — Closes a helper pipeline and its underlying iterators, including when the helper has not yet been pulled.
- `%IteratorHelperPrototype%[Symbol.toStringTag]` — Reports `"Iterator Helper"` for helper objects.
- `Symbol.iterator` — Well-known symbol used as the method key that exposes a synchronous iterator.
- `for-of statement` — Acquires the iterable's iterator and requests values until done; `break`, `return`, or abrupt completion closes it through optional `return()`.
- `Array destructuring iteration` — Uses the synchronous iterable protocol to fill binding positions. It can stop after the requested positions and closes an unfinished iterator.
- `Spread syntax iteration` — Consumes an iterable and expands each value into an array literal or call arguments; it eagerly consumes and can exhaust memory or never finish for a large/infinite source.
- `Iterator closing` — Consumer cleanup when iteration ends before natural completion, generally by invoking the iterator's optional `return()` method.
- `IteratorClose` — Specification operation that performs synchronous iterator closing while preserving the original completion/error rules. Application code normally relies on language constructs rather than calling this abstract operation.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| Iterable vs iterator | Cursor factory/entry point versus stateful cursor |
| `Iterator.prototype.map` vs `Array.prototype.map` | Lazy iterator transform versus eager array transform producing an array |
| Helper vs terminal | A helper returns another lazy iterator; a terminal consumes and returns a final value |
| `Iterator.concat()` vs array concatenation | Streams iterable values in order rather than eagerly building a combined array |

# Examples

```js
const evens = Iterator.from([1, 2, 3, 4, 5, 6])
  .filter(value => value % 2 === 0)
  .map(value => value * 10)
  .take(2);

console.log(evens.next()); // { value: 20, done: false }
console.log(evens.toArray()); // [40]
```

The first `next()` pulls just enough source values to produce 20. The terminal call consumes the remaining bounded helper. Calling `Iterator.concat()` checks that each argument is an object and reads its iterator method immediately, while opening and consuming each iterator remains lazy.

```js
const all = Iterator.concat([1, 2], [3, 4]).toArray();
console.log(all); // [1, 2, 3, 4]
```

# Common mistakes

- Assuming every object with `next()` is accepted by every consumer; many consumers require the iterator also be iterable through `Symbol.iterator`.
- Assuming Iterator helpers are eager or that `.map()` returns an Array.
- Calling `toArray()` on an infinite iterator or forgetting it consumes the remaining sequence.
- Passing a bare non-iterable iterator to `Iterator.concat()` instead of wrapping it with `Iterator.from()`.
- Assuming `Iterator()` directly constructs a useful empty iterator; the base constructor cannot be directly instantiated.
- Using `forEach(async ...)` and expecting the terminal helper to await callback promises.
- Assuming early `break` skips cleanup; it can call `return()` and run generator `finally` blocks.
- Treating `IteratorClose` as an application method; it is an abstract specification operation.

# Knowledge checks with answers

1. **What does `Iterator.from()` add to a bare iterator?** It wraps it in an Iterator-compatible object when it is not already an Iterator.
2. **When does a helper `.filter()` predicate execute?** Only as downstream consumption pulls values.
3. **What does `take(3)` guarantee?** It yields no more than three values and stops/cleans up upstream after the bound.
4. **Can `Iterator.concat()` accept a bare object with `next()` only?** No, unless that object also provides the iterable protocol; `Iterator.from()` can adapt it.
5. **What does `toArray()` return?** A new Array containing every remaining value, consuming the iterator.

# Further reading

- [ECMAScript 2026 iteration and Iterator helpers](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html)
- [ECMAScript 2026 iteration statements](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [MDN Iterators and generators guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators)
