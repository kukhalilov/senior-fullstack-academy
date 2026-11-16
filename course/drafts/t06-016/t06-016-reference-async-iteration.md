<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript iterables, iterators, and generator protocols — Reference: Async iteration and async generators

# Scope and version

This reference covers async iterable and iterator protocols, `for await...of`, async generators, sync-to-async adaptation, and async closing as specified in ECMAScript 2026. See [ECMAScript iteration and generators](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html), [iteration statements](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html), and [MDN Iterators and generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators).

# How this group fits the mental model

Async iteration retains the cursor model but makes each advance asynchronous: `next()` returns a promise for an iterator result. `for await...of` awaits each step in sequence. Async generators combine this protocol with suspended function execution and `await`. When the source only has a synchronous iterator, the language wraps it in an async-from-sync iterator so the same loop syntax can consume it.

# Supplied names explained

- `Async iterable protocol` — An object is async iterable when it provides a callable `Symbol.asyncIterator` method that returns an async iterator.
- `Async iterator protocol` — An async iterator supplies `next()` returning a promise for an iterator-result object. Its optional `return()` and `throw()` can also be asynchronous.
- `%AsyncIteratorPrototype%[Symbol.asyncIterator]` — The common async-iterator identity method returns the receiver itself, making an async iterator consumable wherever an async iterable is required.
- `Symbol.asyncIterator` — Well-known symbol used as the method key to obtain an async iterator.
- `for-await-of statement` — Gets an async iterator (or adapts a synchronous one), awaits each `next()` result, and binds each yielded value. Early exit performs async closing and waits for cleanup.
- `Async generator function` — A function declared with `async function*`. Calling it creates an async generator object; its body advances through asynchronous requests, and it can both `await` and `yield`.
- `Async generator method` — An object/class method declared with `async *name()`. It has a receiver like other methods and returns a new async generator object per call.
- `Async generator object` — Stateful async iterator produced by an async generator function or method. Its request methods return promises, and requests are processed in order.
- `AsyncGenerator.prototype.next` — Queues a resume request and returns a promise for an iterator result. Its supplied value becomes the result of a suspended `yield` when that request resumes the generator.
- `AsyncGenerator.prototype.return` — Queues an injected return completion and returns a promise. The generator's `finally` cleanup runs and may itself await or yield before completion.
- `AsyncGenerator.prototype.throw` — Queues an injected exception at the suspended yield point and returns a promise. The generator can catch it or let it reject the request after cleanup.
- `AsyncGeneratorFunction` — Intrinsic constructor associated with async generator functions. Ordinary `async function*` syntax is clearer and avoids dynamically constructing code.
- `AsyncGeneratorFunction.prototype` — Shared prototype in the async-generator-function constructor chain.
- `Async-from-sync iterator` — Adapter the language creates when async iteration is requested but only a sync iterator exists. It wraps results in promises and awaits yielded values, including promise-like values, before exposing them.
- `AsyncIteratorClose` — Specification operation used when async iteration exits early. It calls optional `return()`, awaits its result, and applies completion precedence rules; application code normally relies on `for await...of` to perform it.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| Async iterable vs async iterator | An async iterable exposes a cursor method; an async iterator performs stateful asynchronous steps |
| `for...of` vs `for await...of` | Sync request loop versus a loop that awaits async requests and can adapt sync sources |
| Generator vs async generator | `next()` returns a result immediately versus a promise for the result; async generators can await |
| Async generator `return()` vs synchronous generator `return()` | Promise-returning queued request with awaitable cleanup versus immediate request/result |

# Examples

```js
async function* pages() {
  yield "page 1";
  await Promise.resolve();
  yield "page 2";
}

const collected = [];
for await (const page of pages()) collected.push(page);
console.log(collected); // ["page 1", "page 2"]
```

Each loop step awaits the async generator request. The `await` inside the producer suspends that generator without blocking the thread.

```js
async function* source() {
  try {
    yield 1;
    yield 2;
  } finally {
  await 0; // asynchronous cleanup
  }
}

for await (const value of source()) {
  if (value === 1) break;
}
```

Leaving early causes async closing, so the consumer waits for the generator's cleanup.

# Common mistakes

- Assuming `for await...of` runs all iterations concurrently; it awaits each step in sequence.
- Assuming an async iterator's `next()` must be declared `async`; it only needs to return a promise for a valid result.
- Assuming `for await...of` rejects all synchronous iterables; it adapts a sync iterator when no async iterator method exists.
- Assuming async-from-sync yields promise objects unchanged; the adapter awaits yielded values.
- Calling an async generator's `next()` without awaiting or observing its promise and assuming execution finished.
- Assuming `return()` skips cleanup or that async cleanup does not delay loop exit.
- Assuming overlapping `next()` calls execute a generator body concurrently; requests are queued.
- Confusing an async generator with a synchronous generator that happens to yield promises; the protocol differs.
- Forgetting that a thrown error from loop-body code can also trigger async iterator cleanup.

# Knowledge checks with answers

1. **What must an async iterator's `next()` produce?** A promise for an iterator-result object.
2. **Can `for await...of` consume an Array?** Yes; it uses the async-from-sync adaptation path.
3. **Do async generator requests run concurrently when called rapidly?** No; requests are queued and execution is serialized.
4. **Does early `break` wait for async generator cleanup?** Yes, async iterator closing awaits the `return()` result.
5. **What does an async generator combine?** Async iterator requests with generator suspension, allowing `await` and `yield` in one body.

# Further reading

- [ECMAScript 2026 async iteration and generator specification](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html)
- [ECMAScript 2026 `for await...of` specification](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [MDN Iterators and generators guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators)
