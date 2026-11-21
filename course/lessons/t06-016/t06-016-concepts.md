
# JavaScript iterables, iterators, and generator protocols — Core concepts and how they fit together

# Learning objectives

Distinguish iterables from iterators, implement valid iterator results, explain how language consumers request and close iterators, trace a generator across `next`/`return`/`throw`, and explain how asynchronous iteration differs from synchronous iteration.

# Prerequisites

You should understand objects, methods, symbols, functions, promises, and `try`/`finally`. A symbol is a unique property key; JavaScript uses `Symbol.iterator` and `Symbol.asyncIterator` as protocol hooks.

# Core concepts

## Iterable and iterator are different roles

An iterable provides a method at `Symbol.iterator`. Calling it returns an iterator. The iterator provides `next()`, whose result is an object with `done` and, while a value is available, `value`. An object can play both roles. A reusable Array usually creates a fresh cursor per traversal. A generator object is itself an iterator and normally represents one execution; once exhausted, iterating that object again yields nothing. Calling its generator function again creates a new object.

## Iterator results and completion

`{ done: false, value }` means a value was produced. `{ done: true, value }` signals completion; the final value may carry a generator's return value, but `for...of` ignores it. A missing `done` is treated as false. `next()` must return an object; returning a primitive violates the protocol. Once complete, an iterator should continue reporting completion on later `next()` calls. Optional `return()` and `throw()` let a caller request cleanup or inject an abrupt completion.

## Consumers request values and may close early

`for...of`, spread, and array destructuring obtain a synchronous iterator and request values until completion. An early loop exit (`break`, enclosing `return`, or an exception) triggers iterator closing when the iterator supplies `return()`. This lets generators run `finally` blocks and custom iterators release resources. A normal full traversal already reaches completion. Spread consumes to the end and never finishes on an infinite iterator. Array destructuring can stop after the requested positions and close what remains.

## Generators suspend and resume

A generator function (`function*`) creates a generator object without running its body. A call to `next()` begins or resumes execution; `yield expression` returns an iteration result and pauses. The value passed to a later `next(value)` becomes the result of the suspended `yield`. The first `next(value)` argument is ignored because no yield is suspended yet.

`return(value)` injects a return completion. A `finally` block still runs and can itself yield, so one `return()` request may not immediately produce `done: true`. `throw(error)` injects an exception at the suspended yield point. If the generator handles it, it can continue; otherwise the exception propagates. `yield*` delegates to another iterable/iterator and forwards requests according to delegation rules, including cleanup and thrown values where supported.

## Helpers are lazy until a terminal consumer pulls

`Iterator.from()` normalizes an iterable or iterator into the Iterator base protocol, wrapping a bare iterator when needed. `map`, `filter`, `take`, `drop`, and `flatMap` build lazy helper iterators. Each output request may pull one or more source values. `reduce`, `toArray`, `forEach`, `some`, `every`, and `find` consume the sequence and return a non-iterator result. Short-circuiting terminals stop when their answer is known and close the upstream iterator. `Iterator.concat()` sequences iterables lazily in argument order.

Creating a helper chain does not run its callbacks. A terminal operation or loop must pull values before transformations run. Bound an infinite source before collecting it into an array.

## Async iteration adds asynchronous requests

An async iterable exposes `Symbol.asyncIterator`; its iterator's `next()` returns a promise for an iterator result. For a custom async iterator, `for await...of` awaits that result promise but does not separately await `result.value`; async-from-sync adaptation and async generators have their own value-awaiting rules. An async generator can use `await` and `yield`; its `next`, `return`, and `throw` return promises. Requests are queued so execution remains serialized even if requests overlap. There is no public `AsyncIterator` constructor or standardized async helper family in ECMAScript 2026.

`for await...of` first asks for an async iterator. If none exists but a synchronous iterator does, the language creates an async-from-sync adapter that awaits yielded values. This does not make the source's production itself asynchronous. Early exit awaits async iterator closing.

# Mechanisms and relationships

| Mechanism | Pulls when? | Result form | Closing on early exit |
| --- | --- | --- | --- |
| `for...of` | Each loop step | Direct value from sync result | Calls optional `return()` |
| Sync generator | On `next()` | `{ value, done }` | `return()` enters cleanup/finally |
| Iterator helper chain | On downstream request | Another lazy iterator | Propagates closing upstream |
| `for await...of` | Each loop step, awaiting request | Awaited value from async result | Awaits async `return()` |
| Async generator | On async request | Promise for `{ value, done }` | Cleanup can await |

The protocol is structural: objects need not inherit from a special class to be iterable. `Iterator` supplies built-in helpers and a common base for subclassed iterators; `Iterator.from()` adapts objects that follow only the protocol.

# Worked examples

## A custom iterable creates independent iterators

```js
const range = {
  start: 2,
  end: 4,
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    return {
      next() {
        if (current > end) return { done: true, value: undefined };
        return { done: false, value: current++ };
      },
      [Symbol.iterator]() { return this; },
    };
  },
};
console.log([...range]); // [2, 3, 4]
console.log([...range]); // [2, 3, 4]
```

The iterable stores configuration; each call creates new local cursor state.

## A generator receives a value through `next`

```js
function* ask() {
  const answer = yield "ready?";
  return answer;
}
const g = ask();
console.log(g.next()); // { value: "ready?", done: false }
console.log(g.next(42)); // { value: 42, done: true }
```

The `42` becomes the result of the paused `yield` expression.

## A lazy helper pipeline

```js
const result = Iterator.from([1, 2, 3, 4, 5])
  .filter(n => n % 2 === 1)
  .map(n => n * 10)
  .take(2)
  .toArray();
console.log(result); // [10, 30]
```

Creating helpers does not run callbacks; `toArray()` pulls and consumes only enough values for the result.

# Misconceptions and edge cases

- **An iterable and an iterator are synonyms.** The iterable exposes a cursor factory; the iterator holds traversal state. One object can do both jobs.
- **The first generator `next(value)` sends that value into the body.** It is ignored; only later values reach a suspended `yield`.
- **Breaking a loop is the same as exhausting its source.** Early exits perform closing so cleanup can run.
- **A helper pipeline is eager.** It is lazy; a consuming terminal helper pulls it.
- **`for await...of` requires an async iterator.** It adapts a synchronous iterable if no async iterator exists.
- **Async iteration makes sequential results parallel.** Each step is awaited in order; concurrency needs a separate design.
- **Every iterator is reusable.** Many iterators, especially generator objects, are one-shot.
- **Collecting an unbounded source is safe.** `toArray`, spread, and full loops do not finish for an infinite source.

# Knowledge checks with answers

1. **What does a synchronous iterable provide?** `Symbol.iterator`, a method returning an iterator.
2. **What is the iterator protocol's required method?** `next()`, returning an iterator-result object.
3. **What does the first generator `next(value)` argument do?** Nothing; no yield expression is suspended yet.
4. **When does iterator helper `.map()` invoke its callback?** As downstream consumption pulls values.
5. **Can `for await...of` consume a sync-only iterable?** Yes, through an async-from-sync adapter that awaits yielded values.
6. **Why does early loop exit matter?** It can trigger `return()` so generators and iterators can clean up.

# Sources

- [ECMAScript iteration and generator specification](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html)
- [ECMAScript iteration statement specification](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [MDN Iterators and generators guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators)
