<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript iterables, iterators, and generator protocols — Reference: Generator functions, objects, and delegation

# Scope and version

This reference explains the supplied synchronous generator syntax and its intrinsic objects in ECMAScript 2026. Generator functions predate the current edition; the language's iterator consumers and helper methods provide additional ways to use their iterator results. See [ECMAScript functions and generators](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html), [iteration](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html), and [MDN Iterators and generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators).

# How this group fits the mental model

A generator function is a recipe for a paused execution; calling it creates a generator object but does not run its body. Its `next`, `return`, and `throw` methods resume that saved execution in different ways. `yield` pauses and exposes a value; `yield*` delegates a portion of the iterator protocol to another sequence. The object is both an iterator and an iterable that returns itself.

# Supplied names explained

- `Generator function` — A function declared with `function*`. Calling it returns a fresh generator object in the suspended-start state; the body begins on the first `next()`.
- `Generator function expression` — A generator function created as an expression, optionally named for recursion/debugging, and usable wherever an expression is allowed.
- `Generator method` — An object or class method declared with `*name()`. Calling it creates a generator object with the method's receiver as `this`.
- `Generator object` — The stateful iterator created by a generator call. It exposes `next`, `return`, and `throw` and normally implements the iterable protocol by returning itself.
- `Generator.prototype.next` — Starts or resumes execution. Its optional argument becomes the value of the currently suspended `yield`; the first call's argument is ignored. It returns `{ value, done }`.
- `Generator.prototype.return` — Injects a return completion at the suspension point, causing pending `finally` blocks to run. A `finally` block may yield, so the returned result may still have `done: false`.
- `Generator.prototype.throw` — Throws a supplied value at the suspended `yield` expression. Generator code may catch it; otherwise it propagates, with `finally` cleanup still executed.
- `yield expression` — Produces an iterator result with the expression's value and suspends execution. When resumed by a later `next(value)`, the yield expression evaluates to that supplied value.
- `yield* delegation` — Delegates iteration to another iterable/iterator until it completes. It forwards `next`, `throw`, and `return` according to the delegated iterator protocol and evaluates to the delegate's final value when applicable.
- `GeneratorFunction` — Intrinsic constructor associated with generator function objects. It is not a recommended way to generate source dynamically; dynamic construction has security and debugging costs.
- `GeneratorFunction.prototype` — Shared prototype in the generator-function constructor chain; generator functions inherit function behavior through it.
- `Generator.prototype[Symbol.iterator]` — Returns the generator object itself so it can be consumed by `for...of`, spread, and iterator helpers.

# State transitions

| Generator state | Operation | Effect |
| --- | --- | --- |
| Suspended-start | `next()` | Begins body; initial argument is ignored |
| Suspended-yield | `next(v)` | Resumes and substitutes `v` for the paused yield expression |
| Suspended-yield | `throw(e)` | Throws `e` at the paused yield expression |
| Suspended-yield | `return(v)` | Injects return; runs intervening `finally` blocks |
| Completed | `next()` | Returns `{ value: undefined, done: true }` |

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| Generator function vs generator object | Reusable function recipe versus one stateful traversal |
| `yield` vs `yield*` | Produce one value versus delegate to another iterator |
| `next(value)` vs `throw(error)` | Resume a yield expression with a value versus throw at that point |
| `return(value)` vs `return` statement in body | External injected completion versus ordinary code flow, both subject to `finally` |

# Examples

```js
function* conversation() {
  try {
    const name = yield "name?";
    yield `hello, ${name}`;
  } finally {
    console.log("cleanup");
  }
}

const g = conversation();
console.log(g.next());       // { value: "name?", done: false }
console.log(g.next("Mina")); // { value: "hello, Mina", done: false }
console.log(g.return("bye")); // logs "cleanup"; { value: "bye", done: true }
```

```js
function* combined() {
  yield 1;
  const finalValue = yield* [2, 3];
  return finalValue;
}
const g = combined();
console.log([...g]); // [1, 2, 3]
```

The spread consumer observes yielded values but discards the generator's final return value.

# Common mistakes

- Expecting the generator body to run when its function is called.
- Sending a meaningful value with the first `next(value)` call.
- Treating the result of `yield*` as the last yielded element; it is the delegate's completion value.
- Assuming `return()` bypasses `finally` or always completes in exactly one call.
- Assuming `throw()` always escapes; the generator can catch it and yield again.
- Reusing a completed generator as if it restarted; call the generator function again.
- Confusing the `GeneratorFunction` intrinsic with the ordinary generator-function syntax.
- Expecting spread or `for...of` to preserve a generator's final `return` value; they only consume non-done values.

# Knowledge checks with answers

1. **When does a generator function body first execute?** On the first `next()` call.
2. **What does `next(7)` do after the generator has yielded?** The suspended `yield` expression evaluates to 7.
3. **What happens when `return()` crosses a `try/finally`?** The `finally` block runs; it can yield before the generator fully completes.
4. **What is the result of `yield*`?** It delegates yielded values and evaluates to the delegated iterator's final value.
5. **Does `[...generator]` include its final return value?** No; spread collects only values whose result has `done: false`.

# Further reading

- [ECMAScript 2026 functions and generator syntax](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [ECMAScript 2026 iterator protocol](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html)
- [MDN Iterators and generators guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators)
