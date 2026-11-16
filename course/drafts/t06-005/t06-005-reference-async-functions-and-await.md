<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript promises, async functions, and event-loop scheduling — Reference: Async function and await syntax

# Scope and version

This reference covers the supplied async function forms, `await`, promise-return behavior, thenable assimilation, and unhandled rejection concept through ECMAScript 2026. Async functions and await were standardized in ES2017. See [ECMAScript async functions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html), [ECMAScript Promise objects](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html), and [MDN async functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).

# How this group fits the mental model

An async function is a function whose call returns a Promise. It runs synchronously until it returns, throws, or reaches an `await`. Awaiting suspends that function's continuation while other JavaScript can run. When the awaited value settles, the function resumes asynchronously; its final returned value or thrown error settles the promise returned by the call.

# Supplied names explained

- `Async function declaration` — `async function load() { ... }` declares a hoisted async function. Calling it immediately returns a Promise; the body runs until its first suspension or completion.
- `Async function expression` — `const load = async function () { ... };` creates an async function value in an expression context. A named form can provide a local function name for recursion/debugging.
- `Async arrow function` — `const load = async () => { ... };` creates an async arrow with lexical `this`, `arguments`, `super`, and `new.target` behavior like other arrow functions.
- `Async method` — `async name() { ... }` defines a method whose call returns a Promise. It uses method `this` semantics and may await internally.
- `Await expression` — `await value` resolves/adopts the value through Promise semantics, suspends the current async function, then evaluates to its fulfillment value or throws its rejection reason when resumed. Awaiting even a plain value resumes asynchronously.
- `Async function return promise` — Every async call returns a Promise. A return value fulfills it, and an uncaught throw rejects it. Returning a Promise causes the async call's Promise to adopt its outcome, but the async call returns a distinct Promise object.
- `Await thenable assimilation` — Await accepts native promises, ordinary values, and thenables. A thenable's `then` property is interpreted using the Promise resolution procedure; malformed or hostile thenables can reject, call multiple times, or run user code, but resolving functions ensure one settlement.
- `Unhandled promise rejection` — A rejected promise with no rejection handler attached by the host's reporting checkpoint may be reported as unhandled. A handler added later may trigger a handled-later notification. The timing and reporting interface belong to the host, not the promise's state machine.

# Cross-item comparison

| Form/operation | Key distinction |
| --- | --- |
| Async declaration vs expression | Declaration form versus function value created in an expression |
| Async function vs async arrow | Function's own receiver/constructibility behavior versus lexical arrow behavior |
| Async method vs async function | Method has an object receiver; both return promises |
| `await` vs `.then()` | Suspends one async function in source order versus registering a reaction callback |
| Rejected awaited value vs unhandled rejection | A rejection caught by `try/catch` is handled; one escaping with no handler can be host-reported |

# Examples

## Forms and synchronous prefix

```js
async function declaration() {
  console.log("declaration starts now");
  await 0;
  return "done";
}

const expression = async function () { return "expression"; };
const arrow = async () => "arrow";
const service = {
  async method() { return "method"; },
};

const result = declaration(); // logs before this call returns
console.log(result instanceof Promise); // true
```

The prefix before `await` runs synchronously. The returned Promise remains pending until the continuation finishes.

## Rejection handled by await

```js
async function readValue(promise) {
  try {
    return await promise;
  } catch (reason) {
    return `recovered: ${reason}`;
  }
}
```

The await rejection is thrown into the async function's control flow and can be caught normally. If it escapes, the function's returned Promise rejects.

## Thenable adoption

```js
const thenable = {
  then(resolve) {
    resolve("adopted");
    resolve("ignored after first settlement");
  },
};

async function useIt() {
  return await thenable;
}
```

The thenable is adopted according to Promise resolution semantics; its attempts to settle more than once cannot change the eventual outcome after the first effective resolution.

# Common mistakes

- Assuming an async body starts only after awaiting its returned Promise; the prefix before the first await executes immediately.
- Assuming `await 5` returns synchronously; continuation after await is asynchronous.
- Treating an async function's returned Promise as identical to a Promise it returns; it adopts the outcome through its own Promise.
- Forgetting that a throw before the first await still becomes a rejected Promise rather than escaping as a normal synchronous throw.
- Assuming `await` only accepts native Promise objects; it also accepts values and thenables.
- Assuming a rejected value in an async function is automatically handled; if it escapes, the returned Promise rejects.
- Assuming async arrow functions capture a dynamic method receiver; arrow `this` is lexical.
- Ignoring a promise returned by an async method/callback and thereby creating an unhandled rejection path.
- Treating unhandled-rejection events/logs as ECMAScript Promise methods; reporting is host behavior.

# Knowledge checks with answers

1. **What happens before an async function's first await?** Its body executes synchronously until it returns, throws, or suspends.
2. **What does awaiting a rejected promise do inside the function?** It resumes by throwing the rejection reason at the await expression.
3. **Does returning a Promise from an async function return the same Promise object?** No; the async call returns a distinct Promise that adopts the result.
4. **Can an async arrow capture `this` from its surrounding scope?** Yes; arrow functions use lexical `this`.
5. **Who decides how an unhandled rejection is reported?** The host environment.

# Further reading

- [ECMAScript 2026 async functions](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [ECMAScript 2026 Promise resolution and jobs](https://tc39.es/ecma262/2026/multipage/control-abstraction-objects.html)
- [MDN async function reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN Promise reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
