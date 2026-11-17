<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript errors, exceptions, and error objects — Core concepts and how they fit together

# Learning objectives

After this lesson, you can explain throwing as control flow, trace propagation to a catch boundary, predict when finally overrides a result, choose Error/cause/AggregateError appropriately, distinguish branded errors from arbitrary values, and state which diagnostic details are host-specific.

# Prerequisites

Know function calls, return values, object properties, and synchronous versus asynchronous execution. A completion is the specification's way to describe how an operation finishes: normally with a value, or abruptly through throw, return, break, or continue.

# Core concepts

## Throwing is control flow, not returning a value

`throw expression` evaluates the expression and creates a throw completion carrying that value. It does not require an Error object. The current operation stops at that point, and the runtime unwinds callers until it reaches a dynamically enclosing `catch` or the host reports an uncaught exception. An Error returned as an ordinary function value does not interrupt execution.

```js
function returnFailure() { return new Error("not thrown"); }
function throwFailure() { throw new Error("interrupts caller"); }
```

Callers may inspect the returned Error and continue. The thrown Error transfers control immediately.

## Error objects and the standard family

`Error` is the base diagnostic type. `AggregateError` represents several values/failures; its constructor consumes an iterable and stores an array. `EvalError`, `RangeError`, `ReferenceError`, `SyntaxError`, `TypeError`, and `URIError` identify conventional categories. The engine may choose which NativeError to throw for a specification-detected failure; messages and stack traces are not stable language-level protocols. `EvalError` remains for compatibility but the current ECMAScript specification does not use it for its own runtime errors.

Error constructors can be called with or without `new`. A message value other than `undefined` becomes a non-enumerable own `message` property; explicitly passing `undefined` is like omitting it. Without an own message, the inherited `Error.prototype.message` is the empty string. `Error.prototype.name` defaults to `"Error"`; `Error.prototype.toString()` combines the effective name and message with `": "`, using defaults when either is `undefined`.

## Context with `cause`; multiple failures with AggregateError

Error options accept a `cause` property. The constructor checks whether options has that property; if so, it creates an own non-enumerable data property even when the cause value is `undefined`. This distinguishes “no cause field” from “cause explicitly undefined” through `Object.hasOwn`. Preserve the original thrown value: it might itself be non-Error.

`AggregateError(errors, message, options)` consumes `errors` as a synchronous iterable immediately and stores the yielded values in a new `errors` array. The property is writable and configurable but non-enumerable. The iterable can throw while being consumed, in which case construction itself throws. Use this when all failures matter; do not use it to conceal which failures actually occurred.

## Error branding and Error.isError

`Error.isError(value)` is standardized in ECMAScript 2026. It returns true when the value is an object carrying the Error internal brand (`[[ErrorData]]`). It rejects primitives and an ordinary object that merely inherits from `Error.prototype`; it accepts genuine standard errors from another realm, where `instanceof Error` may be false due to different constructor identities. A Proxy wrapper does not inherit the target's internal slots and therefore is not itself branded as an Error.

This is a branding test, not a trust test: a real Error may contain attacker-controlled message, cause, or custom fields. MDN currently marks the API as limited availability, so feature-detect it when supporting runtimes that may predate ECMAScript 2026.

## Catch, finally, and completion priority

`try` executes a block. `catch` runs only if the try block finishes with a throw completion, and its binding receives the exact thrown value. A catch binding is block-scoped; current syntax also permits `catch { ... }` when the value is intentionally unused.

`finally` runs as control leaves a try/catch. If finally finishes normally, the pending completion continues unchanged. If finally itself throws, returns, breaks, or continues, that new abrupt completion replaces the earlier one. A `return` in finally can suppress a throw; a throw in finally can replace another Error. This behavior is usually surprising, so cleanup code should normally finish without abrupt control flow.

## Async rejection boundaries

Promise rejection is asynchronous completion. A synchronous `try { startAsync(); } catch {}` does not catch a later rejection if the promise is not awaited inside the try. In an async function, `try { await operation(); } catch (error) {}` catches the rejection at that await. `finally` around an awaited operation runs after it settles. Attach a catch handler or await the promise so rejection is handled intentionally.

# Mechanisms and relationships

| Outcome in protected block | Catch runs? | Finally runs? | Result after normal finally |
| --- | --- | --- | --- |
| Normal fall-through | No | Yes | Normal continues |
| `return value` | No | Yes | Return continues |
| `throw value` | Yes when a catch exists | Yes | Catch result or rethrow continues |
| `break` / `continue` | No | Yes | Loop control continues |
| Abrupt completion inside finally | — | Already executing | Replaces pending completion |

When reading a try statement, track its pending completion on paper. First evaluate the try block; if it throws, evaluate catch with the thrown value. Then evaluate finally. Keep the prior result only if finally completes normally.

# Worked examples

```js
function buildUser(raw) {
  try {
    return parseUser(raw);
  } catch (cause) {
    throw new TypeError("Invalid user record", { cause });
  }
}
```

The new TypeError identifies the boundary-level problem; `cause` preserves the parser failure for diagnosis.

```js
function risky() {
  try {
    throw new Error("original");
  } finally {
    return "replacement";
  }
}
console.log(risky()); // "replacement"; the return in finally suppresses the throw
```

This is legal but usually poor design. A cleanup block should not silently replace the result unless that is intentional.

# Misconceptions and edge cases

- “Only Error objects can be thrown.” Any ECMAScript value can be thrown.
- “Returning `new Error()` is the same as throwing it.” Return is a value; throw changes control flow.
- “Catch receives an Error.” It receives exactly the thrown value.
- “Finally is only for errors.” It runs during normal returns and loop exits too.
- “Finally cannot change the pending result.” An abrupt completion in finally overrides it.
- “A cause must be an Error.” It can be any value, including `undefined`.
- “`instanceof Error` works across realms.” It can fail for a real Error from another realm.
- “An object with `Error.prototype` is a genuine Error.” Prototype shape alone is not the Error internal brand.
- “A try/catch catches any Promise rejection started inside it.” The promise must be awaited or have a rejection handler within the relevant boundary.
- “Stack is portable.” Stack capture and formatting are host-specific; do not parse stack text for application control flow.

# Knowledge checks with answers

1. **What happens to the caller after `throw value`?** Control unwinds until a dynamically enclosing catch handles the throw or the host reports it.
2. **Can `throw null` be caught?** Yes; the catch binding receives `null`.
3. **What does a normal finally completion do to a pending return?** It preserves the return.
4. **What if finally throws while another error is pending?** The finally error replaces the pending error.
5. **Why might `Error.isError` be preferable to `instanceof Error`?** It checks the Error brand across realms and rejects fake prototype-only objects.
6. **What is needed for async rejection to reach a local catch?** Await the promise inside the try or attach a rejection handler there.

# Sources

- [ECMAScript 2026 Error objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [ECMAScript 2026 throw and try statements](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [MDN: Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [MDN: Error.isError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError)
- [Web IDL: DOMException JavaScript bindings](https://webidl.spec.whatwg.org/#js-DOMException-specialness)
