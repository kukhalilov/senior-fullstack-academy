
# JavaScript iterables, iterators, and generator protocols — Exercises and worked solutions

# Goals

Implement a reusable iterable, trace generator input/output, build a lazy iterator-helper pipeline, and observe cleanup when a consumer stops early. The goal is to reason about exactly when values are pulled and when an iterator is closed.

# Worked example

Build a one-shot generator that yields a bounded range. Use a helper chain to keep even values and stop after two outputs.

```js
function* countFrom(start) {
  let current = start;
  while (true) yield current++;
}

const values = Iterator.from(countFrom(1))
  .filter(value => value % 2 === 0)
  .take(2)
  .toArray();
console.log(values); // [2, 4]
```

The source is infinite, but `take(2)` bounds the pipeline. `toArray()` pulls until it has those two values, then closes the upstream chain.

# Exercises

## 1. Independent traversal

Implement an iterable object for an inclusive integer range. Each call to `[Symbol.iterator]()` must return an independent iterator. Show two traversals over the same iterable.

## 2. Generator conversation

Write a generator that yields `"ready"`, receives a value through the next `next(value)` call, then returns that value. Show the two iterator results and explain why the first `next` call cannot deliver the value.

## 3. Lazy short-circuit

Use `Iterator.from`, `map`, `filter`, `take`, and `toArray` to take the first three squares greater than 10 from `[1, 2, 3, 4, 5, 6]`. Count how many map and filter callbacks run, then explain why they do not run when the helper chain is only created.

## 4. Early cleanup

Write a generator with a `try/finally` block that yields two values. Consume only the first value with `for...of` and `break`; record whether the cleanup block executes.

## 5. Async source

Write an async generator yielding two labels with an `await` between them. Consume it with `for await...of`. Then explain how `for await...of` can consume a normal synchronous iterable too.

# Progressive hints

1. Keep the range cursor in a local variable created inside `[Symbol.iterator]()`.
2. First call `next()` to reach the yield; call `next(value)` only afterward.
3. Lazy helper callbacks run during the terminal `toArray()` call. `take(3)` bounds consumption.
4. `break` causes iterator closing. Generator closing enters `finally`.
5. An async generator is declared with `async function*`; `await` can suspend between yields.

# Complete solutions

## 1. Independent traversal

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

Each iterator receives a new `current` variable, so the traversals do not share cursor state.

## 2. Generator conversation

```js
function* conversation() {
  const response = yield "ready";
  return response;
}
const g = conversation();
console.log(g.next()); // { value: "ready", done: false }
console.log(g.next("go")); // { value: "go", done: true }
```

The first `next()` starts the body and reaches the yield. The second supplies `"go"` as the yield expression's result.

## 3. Lazy short-circuit

```js
let mapped = 0;
let tested = 0;
const pipeline = Iterator.from([1, 2, 3, 4, 5, 6])
  .map(value => { mapped++; return value * value; })
  .filter(value => { tested++; return value > 10; })
  .take(3);

console.log(mapped, tested); // 0 0
const result = pipeline.toArray();
console.log(result); // [16, 25, 36]
console.log(mapped, tested); // 6 6
```

The pipeline is lazy until `toArray()` pulls. It needs to inspect all six values to find three squares greater than ten. The callbacks run once per input.

## 4. Early cleanup

```js
const events = [];
function* source() {
  try {
    yield "first";
    yield "second";
  } finally {
    events.push("closed");
  }
}

for (const value of source()) {
  events.push(value);
  break;
}
console.log(events); // ["first", "closed"]
```

Leaving the loop early closes the iterator and runs the generator's `finally` block.

## 5. Async source

```js
async function* labels() {
  yield "first";
  await 0;
  yield "second";
}

const result = [];
for await (const label of labels()) result.push(label);
console.log(result); // ["first", "second"]
```

`for await...of` obtains an async iterator and awaits each request. If there is no async iterator but a synchronous iterator exists, it creates an async-from-sync adapter.

# Tests and edge cases

- An iterator result must be an object; returning `undefined` from `next()` violates the protocol.
- An empty range should immediately return `{ done: true, value: undefined }`.
- A generator's first `next(value)` argument is ignored.
- `take(0)` must not yield a source value; an unbounded source still needs a stopping helper before full collection.
- A helper callback that throws closes its upstream iterator; cleanup may itself affect the observed error according to iterator-closing rules.
- `for await...of` awaits async-generator steps sequentially; it does not parallelize them.
- A synchronous iterable may be consumed with `for await...of` through async-from-sync adaptation.
- Re-traversing the range object works because it creates a fresh iterator; reusing one exhausted generator does not restart it.

# Reflection questions

1. Where does cursor state live in your custom iterable?
2. Which operation causes a lazy helper chain to execute?
3. What language constructs close an iterator early?
4. What part of `for await...of` is asynchronous for a sync-only iterable?
5. Why are generators useful for infinite sequences?

## Reflection answers

1. Cursor state belongs inside the closure or iterator object created for each traversal, so separate iterators do not share a cursor accidentally.
2. A terminal operation such as `toArray()`, `reduce()`, or a consumer loop pulls values and executes the lazy callbacks.
3. `break`, `return`, and abrupt completion while consuming with constructs such as `for...of` request iterator closing when the iterator provides `return()`; normal exhaustion does not require early closing.
4. For a sync-only iterable, the loop wraps its synchronous iterator in an async-from-sync adapter, awaits each adapted step, and awaits each yielded value. The producer's `next()` work itself is still synchronous.
5. A generator can represent an unbounded sequence one item at a time without storing all future values; consumers must still bound or stop consumption.

# Sources

- [ECMAScript iteration and iterator helpers](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html)
- [ECMAScript iteration statements](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [MDN Iterators and generators guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators)
