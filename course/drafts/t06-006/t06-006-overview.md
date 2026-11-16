<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript errors, exceptions, and error objects — Big-picture orientation and mental model

# Problem and purpose

Programs need a controlled way to stop normal work when an operation cannot continue, carry diagnostic context, and let a suitable boundary decide what to do next. JavaScript's `throw` statement creates an abrupt completion; `try`, `catch`, and `finally` route control around it. Error objects carry standard fields such as name, message, cause, and—depending on the host—stack information. `AggregateError` represents multiple failures. The 2026 standard adds `Error.isError`, a branded check for genuine ECMAScript error objects.

# Plain-language mental model

Treat an exception as a control-flow signal carrying a value. `throw value` interrupts the current path and searches outward for a matching `catch`. A `finally` block is cleanup that runs as control leaves, whether the path succeeded, returned, or threw. An Error object is a useful conventional package for a failure, but JavaScript permits throwing any value, including a string or `null`.

An Error's `message` describes the immediate failure. `cause` can preserve the lower-level failure that led to it. `AggregateError` contains several errors when one operation collects multiple failures. The runtime controls stack details, so portable logic should rely on standard fields and treat stack formatting as diagnostics.

# How the parts fit together

1. An operation succeeds normally or produces an abrupt completion such as a throw.
2. `throw` can carry any value; built-in errors provide conventional names and messages.
3. The nearest dynamically enclosing `catch` receives the exact thrown value.
4. `finally` runs during exit. Its normal completion preserves the pending result; an abrupt `finally` completion replaces it.
5. Callers can add context with `cause`, or collect several independent failures with `AggregateError`.
6. At boundaries, `Error.isError` can distinguish branded ECMAScript errors from arbitrary thrown values, including across realms; it is not yet available in every runtime.

# Concept map

| Need | Feature | Main point |
| --- | --- | --- |
| Stop normal flow | `throw` | Throws any value and unwinds the current stack |
| Handle locally | `try` / `catch` | Catch gets the thrown value, not necessarily an Error |
| Guarantee cleanup | `finally` | Always runs; abrupt completion can override pending control flow |
| Describe one failure | Error family | Subtypes classify common failure categories |
| Preserve lower-level detail | `cause` | Keep the original reason while adding context |
| Report several failures | `AggregateError` | Consumes an iterable and stores collected errors |
| Check error branding | `Error.isError` | Standardized in ECMAScript 2026; runtime support varies |

# End-to-end walkthrough

```js
async function loadProfile(id) {
  try {
    const response = await fetch(`/profiles/${id}`);
    if (!response.ok) throw new RangeError(`Unexpected status ${response.status}`);
    return await response.json();
  } catch (cause) {
    throw new Error(`Could not load profile ${id}`, { cause });
  } finally {
    console.log("load attempt finished");
  }
}
```

The awaited operations occur inside the `try`, so their rejections reach `catch`. The wrapper Error records new context while preserving the original thrown value in `cause`. The `finally` block runs on success or failure. It does not return or throw, so it preserves the pending outcome.

# When to use it and tradeoffs

Throw an Error object for unexpected failures that should interrupt normal work; choose a subtype when its category is useful. Use a `cause` when translating an error across an abstraction boundary, and `AggregateError` when several independent operations fail. Catch errors where the program can recover, add context, or translate them; avoid catching only to hide them. Keep `finally` focused on cleanup and avoid abrupt control flow in it. Error messages and stacks are diagnostic; do not use them as stable program protocols.

# Recent additions

The `cause` option became standard in ECMAScript 2022. `Error.isError` became part of ECMAScript 2026 and checks the internal error brand rather than a prototype chain. Its browser support is still limited in current MDN compatibility data, so code targeting unpinned runtimes should feature-detect it. See [ECMAScript Error objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html) and [MDN: `Error.isError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError).

# What later lessons cover

The concepts lesson traces throw completion and stack unwinding. The reference lessons describe every standard Error constructor, property, option, statement, and clause in the supplied inventory. Practice follows failures through synchronous and asynchronous paths. Interview questions focus on completion overriding, error identity, causes, and aggregation.

# Sources

- [ECMAScript 2026 Error objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [ECMAScript 2026 statements and declarations](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [MDN: Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [MDN: Error.isError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError)
