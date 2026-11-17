<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript iterables, iterators, and generator protocols — Big-picture orientation and mental model

# Problem and purpose

Iteration offers one shared way to consume values one at a time even when the source is not an array: a string, collection, custom sequence, generator, or asynchronous producer. The protocol separates a source (iterable) from the stateful cursor (iterator). Language constructs such as `for...of`, spread, and destructuring consume this protocol. Generators make lazy custom iterators easier to write; async iteration handles values that arrive over time.

# Plain-language mental model

An iterable is like a ticket counter that can hand out a fresh numbered queue. Calling its iterator method starts a traversal. The iterator is the queue itself: each `next()` advances its state and returns a result with `value` and `done`. A generator is a paused function acting as that queue; `yield` hands a value to the caller and suspends until the next request. An async iterator uses the same idea, but each request completes through a promise.

# How the parts fit together

1. A consumer asks an object for an iterator through `Symbol.iterator`, or `Symbol.asyncIterator` for async iteration.
2. It repeatedly calls `next()` and reads each `{ value, done }` result.
3. When a loop stops early, the consumer may call optional `return()` so the iterator can release resources.
4. A generator function creates a fresh generator object per call; each object retains its own paused execution state.
5. Iterator helpers transform values lazily. They do not pull the source until a consumer requests values. Terminal helpers such as `toArray()` and `reduce()` consume it.
6. Async iteration awaits each request and uses async closing rules. `for await...of` can also adapt a synchronous iterable.

# Concept map

| Need | Protocol/tool | Main idea |
| --- | --- | --- |
| Expose a repeatable traversal | Iterable protocol | `[Symbol.iterator]()` returns a cursor |
| Represent traversal state | Iterator protocol | `next()` returns `{ value, done }` |
| Express lazy synchronous production | Generator | `yield` suspends; `next()` resumes |
| Transform values without eager arrays | Iterator helpers | Lazy map/filter/take/drop and consuming terminals |
| Consume promise-producing sequences | Async iterator/generator | Each `next()` resolves to an iteration result |
| Stop early and clean up | Iterator closing | Call optional `return()` when control exits early |

# End-to-end walkthrough

This generator emits a bounded sequence, then `for...of` consumes it:

```js
function* ids(start, count) {
  for (let i = 0; i < count; i++) yield start + i;
}

const result = [];
for (const id of ids(10, 3)) result.push(id);
console.log(result); // [10, 11, 12]
```

Each `yield` produces one value and pauses the generator. The loop requests another value until `done` becomes true. The source does not need an intermediate array.

# When to use it and tradeoffs

Use iteration when consumers should process a sequence incrementally, when eagerly producing every value would waste memory, or when a source has cleanup work. Generators are compact for stateful synchronous sequences. Async iteration fits paginated, network, or file-like sequences that produce data over time. Arrays are simpler when all values already exist and random access or repeated passes matter. Lazy pipelines avoid intermediate storage but can be harder to debug and can run forever if an infinite source has no stopping condition.

# Recent version changes

ECMAScript 2025 added the `Iterator` base class, `Iterator.from()`, and synchronous iterator helper methods. ECMAScript 2026 added `Iterator.concat()`. The edition has an intrinsic `%AsyncIteratorPrototype%`, but no public global `AsyncIterator` constructor or built-in async iterator helpers. Runtime support may differ from the language edition. See [ECMAScript control abstraction objects](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html).

# What later lessons cover

The concepts lesson traces protocol requests and completion/closing. Reference lessons explain every supplied synchronous-iteration, generator, and async-iteration name. Practice builds lazy pipelines and cleanup behavior; interview questions focus on delegation, async adaptation, and early termination.

# Sources

- [ECMAScript iteration and generator specification](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html)
- [ECMAScript iteration statements](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [MDN Iterators and generators guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators)
