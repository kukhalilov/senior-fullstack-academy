
# JavaScript promises, async functions, and event-loop scheduling — Reference: Promise APIs and chaining

# Scope and version

This reference covers the supplied Promise constructor, prototype methods, static combinators, and recent static APIs through ECMAScript 2026. `Promise.withResolvers()` was added in ES2024; `Promise.try()` was added in ES2025. See [ECMAScript Promise objects](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html) and [MDN Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

# How this group fits the mental model

A Promise represents one eventual outcome and is settled once. Prototype methods transform that outcome into a new promise; static methods create/reject/adopt promises or combine several inputs. These methods do not generally cancel work. Every result is another Promise even when the final value is ordinary.

# Supplied names explained

## Construction and prototype behavior

- `Promise constructor` — `new Promise(executor)` creates a pending promise and calls `executor(resolve, reject)` synchronously. The first effective settlement wins; an executor throw rejects. The constructor must be called with `new` and a callable executor.
- `Promise.prototype.then` — Registers fulfillment and optional rejection handlers and returns a new promise. A handler's return value resolves that promise, a thrown error rejects it, and a returned thenable is assimilated. Missing handlers forward the existing value or reason.
- `Promise.prototype.catch` — Registers a rejection handler and returns a new promise; behavior is equivalent to `then(undefined, onRejected)`.
- `Promise.prototype.finally` — Registers cleanup for either outcome. If cleanup fulfills, the prior value/reason passes through; if cleanup throws or returns a rejected thenable, the new promise rejects with that cleanup failure.
- `Promise.prototype[Symbol.toStringTag]` — The built-in tag used by object stringification; its initial value is `"Promise"`.
- `Promise[Symbol.species]` — Accessor whose default returns the constructor receiver. Promise prototype transformations consult constructor/species behavior for derived promises; subclassing/custom species can alter result allocation and is rarely needed in application code.
- `Promise.prototype.constructor` — Reference to the constructor associated with the prototype. It participates in derived-promise constructor lookup; changing it can affect promise-chain behavior.

## Static creation and composition

- `Promise.all` — Accepts an iterable, resolves each input through the constructor, and fulfills with values in original input order when all fulfill. It rejects on the first observed rejection but does not cancel other operations. Empty input fulfills with `[]`.
- `Promise.allSettled` — Fulfills after every input settles, returning ordered records such as `{ status: "fulfilled", value }` or `{ status: "rejected", reason }`. It normally fulfills even when inputs reject; empty input fulfills with `[]`.
- `Promise.any` — Fulfills with the first fulfillment, ignoring earlier rejections. If all inputs reject, it rejects with `AggregateError` containing rejection reasons in input order. Empty input rejects with an empty aggregate error.
- `Promise.race` — Settles with the first input that settles, whether fulfilled or rejected; it does not cancel the others. An empty iterable produces a promise that remains pending.
- `Promise.reject` — Creates a new rejected promise for the supplied reason. It does not adopt the reason even if the reason is itself a promise.
- `Promise.resolve` — Resolves a promise with a value, adopting a promise/thenable. If the input is already a Promise with the same constructor, it can be returned unchanged.
- `Promise.try` — Calls a callback immediately with the provided arguments and converts a returned value/thenable to a promise; a synchronous throw becomes a rejected promise. It provides a common promise boundary for sync/async callbacks, not deferred execution. Added in ES2025.
- `Promise.withResolvers` — Returns `{ promise, resolve, reject }` from one promise capability. The externally held functions settle that promise at most once; keep them scoped to the component that owns settlement. Added in ES2024.

# Cross-item comparison

| Need | Use | Outcome rule |
| --- | --- | --- |
| Require every operation | `Promise.all` | All fulfill or first rejection wins |
| Inspect every result independently | `Promise.allSettled` | Wait for all and return ordered status records |
| Accept first success | `Promise.any` | First fulfillment or aggregate rejection |
| Accept first result of either kind | `Promise.race` | First settlement |
| Handle only rejection | `.catch()` | Equivalent to a rejection-only `.then()` |
| Cleanup regardless of result | `.finally()` | Preserves prior outcome unless cleanup fails |

# Examples

```js
const outcomes = await Promise.allSettled([
  Promise.resolve("saved"),
  Promise.reject(new Error("offline")),
]);
console.log(outcomes.map(item => item.status)); // ["fulfilled", "rejected"]
```

`allSettled` preserves input order even if the operations settle at different times.

```js
const { promise, resolve, reject } = Promise.withResolvers();
setTimeout(() => resolve("ready"), 0);
console.log(await promise); // "ready"
```

`withResolvers` separates promise creation from a later settlement point. Do not expose the resolving functions more broadly than needed.

```js
const result = Promise.try(() => { throw new Error("invalid input"); });
result.catch(error => console.log(error.message)); // later logs "invalid input"
```

The callback runs during the `Promise.try()` call; its throw is represented as a rejection.

# Common mistakes

- Assuming a pending Promise runs work by itself; the executor runs synchronously and async APIs schedule their own completion.
- Calling the Promise constructor without `new` or with a non-function executor.
- Confusing resolved with fulfilled; a promise can be locked to a still-pending thenable.
- Assuming a handler's returned promise is nested inside the next promise; chaining adopts it.
- Assuming `Promise.all` cancels siblings after rejection.
- Using `Promise.race` when the requirement is first success; use `Promise.any` for that rule.
- Assuming `Promise.any` rejects after one failure; it waits for all failures if nothing fulfills.
- Assuming `Promise.race([])` fulfills with undefined; it remains pending.
- Returning a value from `finally()` and expecting it to replace the prior value.
- Treating `Promise.try()` as a task or microtask scheduler; the callback is called synchronously.
- Treating `Promise.withResolvers()` as inherently safer than a constructor; exposed settlement functions still need ownership and lifecycle discipline.
- Customizing `Symbol.species` without understanding that downstream promise constructors can change.

# Knowledge checks with answers

1. **Does the Promise executor run immediately?** Yes, synchronously during construction.
2. **Which combinator returns the first successful value?** `Promise.any`.
3. **What does `Promise.race([])` do?** Returns a promise that remains pending.
4. **Do `Promise.all` and `Promise.race` cancel losing work?** No.
5. **What happens if a `finally` callback fulfills?** The original fulfillment value or rejection reason continues.
6. **Does `Promise.try()` defer its callback?** No, it calls it immediately and wraps its outcome.
7. **What fields does `Promise.withResolvers()` return?** `promise`, `resolve`, and `reject`.

# Further reading

- [ECMAScript 2026 Promise objects](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html)
- [MDN Promise reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [ECMAScript Promise.try and Promise.withResolvers change summary](https://tc39.es/ecma262/2026/)
