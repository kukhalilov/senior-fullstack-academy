<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript iterables, iterators, and generator protocols — Interview questions and reasoning

# Core questions

1. What is the difference between an iterable and an iterator?
2. What is an iterator result, and what does `done` mean?
3. How does `for...of` obtain and consume values?
4. What happens to an iterator when a loop exits early?
5. How do generator functions differ from ordinary functions?
6. What do `next(value)`, `return(value)`, and `throw(error)` do to a generator?
7. How does `yield*` differ from `yield`?
8. What is the difference between iterator helpers and Array methods?
9. How do `for await...of` and async generators work?
10. How does `for await...of` consume a synchronous iterable?
11. What did recent ECMAScript editions add to iteration?

# Concise interview answers

1. An iterable exposes a method that creates/returns an iterator; an iterator holds traversal state and advances with `next()`.
2. It is an object with a `done` status and usually a `value`. `done: true` signals completion; the final value is not yielded by `for...of`.
3. It obtains the object's synchronous iterator and repeatedly calls `next()` until the result is done.
4. The consumer performs iterator closing through optional `return()`, allowing a generator's `finally` or other cleanup to run.
5. A generator call returns a paused iterator object instead of running to a normal return value.
6. `next` resumes and can supply a value to a suspended yield; `return` injects a return completion; `throw` injects an exception at the suspension point.
7. `yield` emits one expression value; `yield*` delegates iteration to another iterable/iterator and can receive its completion value.
8. Iterator helpers are lazy and return iterator helpers for transformations; Array methods are typically eager and return arrays or final values.
9. An async iterator's `next()` returns a promise for a result; `for await...of` awaits each step. Async generators can both await and yield.
10. It creates an async-from-sync adapter that wraps iterator results in promises and awaits yielded values.
11. ES2025 added the Iterator base, `Iterator.from`, and iterator helpers; ES2026 added `Iterator.concat`.

# Deep follow-up answers

## Why is the iterable/iterator split useful?

It separates reusable configuration from traversal state. An Array can create a new iterator every time. A generator object is a single traversal and is normally exhausted after one pass. A custom iterable can be restarted by creating a fresh iterator while each cursor keeps independent state.

## What does an iterator consumer guarantee about cleanup?

When a construct leaves before natural completion, it performs the relevant closing operation if the iterator supports `return()`. Generator cleanup can run through `finally`. Errors and returns during close have specified precedence; cleanup code should avoid masking the original failure unexpectedly.

## How is `yield` bidirectional?

The generator yields a value out to the caller. A later `next(value)` supplies a value back into the suspended yield expression. The first `next` argument is ignored because the generator has not suspended at a yield yet. `throw` and `return` inject abrupt/return completions at the same suspension point.

## When should you use a helper chain?

Use it when a sequence can be processed incrementally, especially when a pipeline should stop early or avoid intermediate arrays. Helpers are lazy; callback side effects occur only as values are requested. Terminal helpers such as `reduce`, `find`, and `toArray` consume the iterator. Collecting an infinite sequence without a bound never completes.

## What changes with async iteration?

Each async iterator step is awaited, and async-generator method requests are queued rather than running generator code concurrently. `for await...of` adapts sync-only sources, awaiting yielded values. It is still a sequential loop; parallel work must be explicitly designed and bounded.

# Scenario questions

1. **A generator owns a file-like resource and a consumer breaks after one value.** Put cleanup in `finally`; iterator closing calls the generator's `return()` on early exit.
2. **A pipeline reads an unbounded sequence but only needs the first five qualifying values.** Apply `filter()` and `take(5)` before `toArray()`; the helper chain pulls only as far as needed.
3. **A custom `next()` returns a number directly.** The object violates the iterator protocol because each call must return an object result.
4. **A `next(value)` call seems to lose its argument.** If it is the first call on a new generator, this is expected; there is no suspended yield expression to receive it.
5. **An async loop over a sync-only range is accepted.** The language uses async-from-sync adaptation; each iteration is awaited even though the producer itself is synchronous.
6. **A helper chain accepts a bare `next()` object but `Iterator.concat()` rejects it.** Ensure it is iterable or normalize it with `Iterator.from()` before passing it to `Iterator.concat()`.

# Tradeoffs and alternatives

| Need | Choice | Tradeoff |
| --- | --- | --- |
| Random access and repeated passes | Array | Eager storage; simple indexing |
| Lazy synchronous state machine | Generator | One-shot cursor; control flow can be less obvious when deeply nested |
| Lazy iterator transformation | Iterator helpers | Avoid intermediate arrays; must consume explicitly |
| Values that arrive asynchronously | Async iterator/generator | Sequentially awaited protocol and async cleanup |
| Build a reusable custom sequence | Iterable with fresh iterators | Requires implementing cursor state and completion correctly |
| Concatenate iterables lazily | `Iterator.concat()` | Inputs must be iterable; it does not eagerly create an Array |

# Common weak answers

- “An iterator is just an Array-like object.” It need not have indexes, length, or random access.
- “Calling a generator runs it.” It creates a paused generator object; `next()` starts it.
- “The first `next(value)` sends data into `yield`.” It cannot, because no yield is suspended yet.
- “Iterator `.map()` immediately transforms everything.” It is lazy and requires a consumer to pull values.
- “`for await...of` runs each item in parallel.” It awaits each step sequentially.
- “`yield*` is syntactic sugar for yielding an array.” It delegates protocol operations and can forward `next`, `throw`, and `return`.
- “Breaking a loop abandons the iterator without cleanup.” Early exit can perform iterator closing.
- “`toArray()` is safe on any iterator.” It consumes all remaining values and will not finish for an infinite source.

# Self-check rubric

Award one point for each skill you can explain without notes:

- Distinguish a reusable iterable from its stateful iterator.
- Trace `next()` results and completion values correctly.
- Explain generator suspension, resumption, and first-call behavior.
- Predict `return`/`throw` effects and `finally` cleanup.
- Explain delegation through `yield*`.
- Distinguish lazy helpers from consuming terminal methods.
- Explain early iterator closing.
- Explain async-from-sync adaptation and sequential async requests.
- Identify the ES2025 Iterator helper family and ES2026 concatenation change.

Eight or nine points indicates readiness; use the missed reference topic to review any gap.

# Sources

- [ECMAScript 2026 iteration, generators, and Iterator helpers](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html)
- [ECMAScript 2026 iteration statements](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [MDN Iterators and generators guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators)
