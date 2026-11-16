<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript errors, exceptions, and error objects — Reference: Error properties and related syntax

# Scope and version

This reference covers the 12 supplied Error properties, options, syntax forms, and subclassing behavior in ECMAScript 2026. It distinguishes standardized Error data from host-specific diagnostics. `Error.isError` is new in the 2026 edition, while error `cause` dates to ECMAScript 2022. See [ECMAScript Error objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html) and [ECMAScript statements](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html).

# How this group fits the mental model

Error objects carry diagnostic data; throw/catch transfer that data through control flow. `cause` preserves context from a previous layer, while AggregateError's `errors` array records multiple values. `finally` handles cleanup but participates in completion propagation, so its own return/throw can replace what was pending.

# Supplied names explained

- `Error.isError` — ECMAScript 2026 static branded check. It returns false for primitives and objects without the internal `[[ErrorData]]` slot; true for standard branded Error-family objects. It works across realms, unlike `instanceof Error`, but a Proxy around an Error is not itself branded. MDN currently marks support as limited availability, so feature-detect if runtime versions are not controlled.
- `Error.prototype.message` — The inherited default message is the empty string. A constructor creates an own message property only when a message argument is supplied; that own property is writable and configurable but non-enumerable. Do not assume an error always owns `message`.
- `Error.prototype.name` — The inherited default name is `"Error"`; subtype prototypes supply names such as `"TypeError"`. It is a normal writable/configurable, non-enumerable property by default. Instances or application code may override it, so it is descriptive rather than a protected tag.
- `Error.prototype.toString` — Reads `name` and `message` from its receiver, defaulting only `undefined` values to `"Error"` and `""`. It stringifies non-undefined values. If name is empty it returns the message; if message is empty it returns the name; otherwise it returns `name + ": " + message`. It throws if `this` is not an object and can also propagate errors from getters or string conversion.
- `Error instance cause property` — When installed, this is an own, writable, configurable, non-enumerable data property holding exactly the supplied cause value. It can be any value, not only an Error. It is not created merely because an `options` object exists; options must have a `cause` property.
- `AggregateError instance errors property` — A writable, configurable, non-enumerable own property containing a new array created by consuming the first constructor argument as a synchronous iterable. The array contains yielded values, not necessarily Error objects. Mutating the array is allowed unless application code freezes it separately.
- `Error options cause` — The second constructor argument is an options object. If it has a `cause` property, even one whose value is undefined or inherited, that value is copied to the new error's own non-enumerable `cause`. This option was standardized in ECMAScript 2022. Cause chaining preserves lower-level context while allowing a higher layer to add a useful message.
- `throw statement` — Evaluates one expression and throws its value, creating abrupt control flow. The value may be any type. A line terminator is not allowed between `throw` and its expression, so `throw` followed by a newline is a syntax error. Use `throw new Error(...)` for conventional diagnostics; do not throw strings for new code unless interoperating with an existing protocol.
- `try statement` — Encloses a block and may have catch, finally, or both. A catch handles only a throw completion from its try block; finally executes on every exit path. A try with only finally propagates a pending throw after cleanup if finally completes normally.
- `catch clause` — Receives the exact thrown value in a block-scoped binding. Current syntax allows `catch (error) { ... }` or an optional binding `catch { ... }`. Do not assume the binding is an Error; narrow or normalize it at an application boundary.
- `finally clause` — Runs as control leaves try/catch whether the protected block succeeded, threw, returned, or changed loop control. If finally completes normally, the previous completion continues. A throw, return, break, or continue from finally replaces the pending completion; avoid return/throw there unless override is intentional.
- `Error subclassing` — Use `class DatabaseError extends Error { constructor(message, options) { super(message, options); this.name = "DatabaseError"; } }`. Calling `super` initializes the built-in Error brand and standard cause behavior. A subclass may add typed fields/codes; preserve `cause` when wrapping. Stack capture/formatting is runtime-specific, and transpiled older targets need special care with built-in subclassing.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `Error.isError` vs `instanceof Error` | Brand-based and cross-realm versus prototype-chain and constructor-identity based. |
| `Error options cause` vs `AggregateError instance errors property` | One causal value describing an underlying failure versus an array of multiple collected values. |
| `throw statement` vs returning an Error | Throw abruptly transfers control; return sends an ordinary value to the direct caller. |
| `catch clause` vs `finally clause` | Catch handles a throw; finally runs during all exits and may replace a pending completion. |
| `Error.prototype.name` vs own name/message | Inherited defaults are conventions; instances can own customized diagnostic values. |

# Examples

```js
try {
  await saveRecord(record);
} catch (cause) {
  if (typeof Error.isError === "function" && !Error.isError(cause)) {
    throw new Error("Saving failed with a non-Error value", { cause });
  }
  throw new Error("Could not save record", { cause });
}
```

The feature check protects runtimes that do not yet implement the new static method. The cause retains the original value, while the outer message describes the current abstraction boundary.

# Common mistakes

- Assuming a `cause` exists whenever a constructor options object is passed.
- Assuming `cause` must be an Error or is enumerable.
- Assuming AggregateError's `errors` argument must be an array; any synchronous iterable works.
- Assuming `Error.isError` is available in every current browser/runtime.
- Assuming an object that inherits from `Error.prototype` has the Error internal brand.
- Returning or throwing from `finally` unintentionally and suppressing the original completion.
- Placing a newline immediately after `throw`.
- Using message or stack text as stable machine-readable fields.

# Knowledge checks with answers

1. **Does `{ cause: undefined }` create an own cause property?** Yes, because the options object has the property even though its value is undefined.
2. **Is `AggregateError.errors` enumerable?** No; it is writable and configurable but non-enumerable.
3. **Can `throw` carry a string?** Yes, though Error objects are usually better diagnostics.
4. **What does normal completion of finally do?** It preserves the pending result from try/catch.
5. **What can `Error.isError` prove?** That the object has the standard Error brand; it cannot prove the message or cause is trusted.

# Sources

- [ECMAScript 2026 Error objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [ECMAScript 2026 statements and declarations](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [MDN: Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [MDN: Error.isError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError)
