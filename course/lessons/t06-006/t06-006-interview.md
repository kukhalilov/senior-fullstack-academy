
# JavaScript errors, exceptions, and error objects — Interview questions and reasoning

# Core questions

1. Is throwing an Error different from returning an Error?
2. Can JavaScript throw a non-Error value?
3. What does a catch clause receive?
4. How does finally affect a pending return or throw?
5. When should you use `cause` versus `AggregateError`?
6. How does `Error.isError` differ from `instanceof Error`?
7. What does the `AggregateError` constructor do with its first argument?
8. What are the limits of Error messages and stack traces?
9. How should an async function catch a Promise rejection?
10. Does `Error.isError()` recognize a browser `DOMException`?

# Concise interview answers

1. **Yes.** Return produces a value for the direct caller; throw creates abrupt control flow and searches for a catch boundary.
2. **Yes.** The throw statement accepts any value, although new application code should normally throw Error objects for diagnostics.
3. **The exact value that was thrown.** The language does not automatically wrap it.
4. **A normal finally completion preserves the pending result; an abrupt completion in finally replaces it.** A return in finally can suppress a throw.
5. **Cause preserves one underlying failure while adding context; AggregateError stores several collected failure values.**
6. **Error.isError checks the Error internal brand across realms; instanceof checks a particular prototype chain.** Error.isError is new in ECMAScript 2026 and support is limited in some runtimes.
7. **It synchronously consumes a synchronous iterable into a new `errors` array.** Entries need not all be Error instances.
8. **Messages and stack format are not portable protocol fields.** Stack capture and formatting are host-specific; use application-owned codes for program decisions.
9. **Await the promise inside the try block.** A rejection that happens after control leaves a non-awaiting try is not caught there.
10. **Yes.** Web IDL gives `DOMException` the `[[ErrorData]]` brand used by `Error.isError()`, even though it is defined as a platform interface rather than a JavaScript Error subclass.

# Deep follow-up answers

## Why preserve a cause when wrapping?

The outer layer can explain what the application was doing, while the cause retains the lower-level reason. This keeps context without discarding the original value. Cause may be any value, is non-enumerable, and is created when the options object has a `cause` property—even if the value is undefined. Avoid exposing sensitive causes to end users without review.

## What does finally guarantee, and what does it not guarantee?

The finally block is evaluated during each control-flow exit from its try/catch, including normal completion, throw, return, and loop control. If finally completes normally, the earlier completion continues. If finally returns, throws, breaks, or continues, it replaces what was pending. Thus it is appropriate for cleanup such as releasing a resource, but a `return` there can accidentally swallow a failure. Cleanup can itself fail; decide how that new failure should interact with the original one.

## Why can Error.isError be a better brand check?

`instanceof Error` asks whether the relevant Error prototype is in an object's prototype chain. An Error created in another realm has a different Error constructor, so a local `instanceof Error` may be false. A fake object can also inherit from Error.prototype without being initialized as an Error. Error.isError checks the internal brand, so it handles these cases more accurately. It does not establish trust or safe content, and a Proxy wrapping a genuine Error is not itself branded. The API is standardized in ECMAScript 2026, but feature support remains uneven.

## Why is an AggregateError not just an Error with an array attached?

The built-in constructor defines the Error brand and standard message/cause behavior, consumes an iterable to produce the errors array, and sets a standard non-enumerable property descriptor. An application can create a similar shape, but it may not be recognized as an Error or follow standard constructor semantics. Use it when several errors are meaningful together; do not aggregate merely to obscure which item failed first.

## What should application code depend on?

Depend on standard fields, intentional error subclasses/codes, and documented control-flow boundaries. Treat engine messages as human diagnostics, stack strings as host-specific, and caught values as unknown until checked. Do not use parsing, stack shape, or constructor identity alone as authorization logic.

# Scenario questions

1. **A caller needs to know whether a failed operation was caused by an underlying network error.** Wrap it with `new Error("request failed", { cause })` and preserve the cause instead of replacing it with a message-only string.
2. **A caller catches an arbitrary value from a plug-in.** Narrow its shape or normalize it to an Error while retaining the original value as cause; do not assume `error.message` exists.
3. **Several independent validation tasks fail.** Collect the failures and use AggregateError if callers need to inspect all of them; otherwise fail fast with one well-defined error.
4. **Cleanup is in finally and the original operation threw.** Ensure cleanup does not return or throw unintentionally; if cleanup can fail, explicitly decide whether that error should replace or be combined with the original.
5. **The app runs in old browsers.** Feature-detect Error.isError or use an explicitly documented fallback, understanding that instanceof is realm-sensitive and prototype checks can be spoofed.

# Tradeoffs and alternatives

- **Throw immediately:** clear fail-fast control flow; callers must have an appropriate handling boundary.
- **Return a result/error union:** explicit in function signatures and useful for expected failures; callers can forget to inspect it, and it is not the same control flow as throw.
- **Wrap with cause:** adds context and preserves one lower-level value; diagnostic data may contain sensitive details.
- **Aggregate errors:** preserves several independent failures; callers need a strategy for inspecting/reporting all entries.
- **Catch and recover:** keeps expected local failures close to their recovery logic; broad catches can hide programming errors.
- **Finally cleanup:** runs across outcomes; abrupt statements in it override pending results.

# Common weak answers

- “You can only throw Error.” The syntax accepts any value.
- “Catch always gets an Error.” It gets the thrown value unchanged.
- “Finally always runs after a caught error and cannot change it.” It runs on all exits and abrupt completion can replace the result.
- “Error cause is a nested Error.” Cause can be any value and is installed by property presence.
- “`instanceof Error` identifies all errors.” Cross-realm errors can fail that test; prototype lookalikes can pass.
- “AggregateError only accepts an array.” It consumes any synchronous iterable.
- “The message text tells the error category reliably.” Messages are not stable contracts.
- “A try/catch catches a pending Promise automatically.” The rejection must be awaited or handled.

# Self-check rubric

Score 0 (cannot explain), 1 (can recall), or 2 (can reason through a fresh example):

| Skill | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Throw propagation | Confuses return and throw | Knows they differ | Traces an exception to the nearest catch |
| Finally behavior | Thinks it is cleanup-only | Knows it always runs | Predicts completion replacement correctly |
| Cause and aggregation | Treats them as synonyms | Knows one vs many | Explains property presence, iterable, and use |
| Error identity | Relies only on instanceof | Knows cross-realm issue | Explains brand check and proxy boundary |
| Async boundaries | Assumes try catches all rejections | Knows await matters | Places await and handler correctly |

Aim for 8/10 or higher. Revisit any score of 0 by writing each pending completion in order.

# Sources

- [ECMAScript 2026 Error objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [ECMAScript 2026 statements and declarations](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [MDN: Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [MDN: Error.isError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError)
- [Web IDL: DOMException JavaScript bindings](https://webidl.spec.whatwg.org/#js-DOMException-specialness)
