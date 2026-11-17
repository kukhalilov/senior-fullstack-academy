<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript errors, exceptions, and error objects — Exercises and worked solutions

# Goals

Practice tracing thrown values, catch and finally completions, cause chains, AggregateError iteration, Error branding, subclass initialization, and Promise rejection boundaries. Predict results before reading the solution.

# Worked example

```js
function parseConfig(text) {
  try {
    return JSON.parse(text);
  } catch (cause) {
    throw new SyntaxError("Configuration text is invalid", { cause });
  }
}
```

The `catch` receives the original parser error. The new SyntaxError gives callers context about the configuration boundary, while `cause` preserves the parser detail. The thrown new error propagates to a caller's catch unless this function adds another handler.

# Exercises

Assume modern ECMAScript. Where `Error.isError` appears, assume the runtime implements the ECMAScript 2026 API unless the prompt asks about feature detection.

## Exercise 1: return versus throw

```js
function one() { return new Error("returned"); }
function two() { throw new Error("thrown"); }
try {
  console.log(one().message);
  two();
  console.log("after two");
} catch (error) {
  console.log(error.message);
}
```

Which lines print? Why is the first Error not caught?

## Exercise 2: finally replaces completion

```js
function result() {
  try {
    throw new TypeError("original");
  } finally {
    return "cleanup result";
  }
}
try {
  console.log(result());
} catch (error) {
  console.log(error.message);
}
```

What prints, and what happened to the TypeError?

## Exercise 3: catch can receive any value

```js
try {
  throw { code: "E_LIMIT", message: "custom value" };
} catch (error) {
  console.log(error.code, Error.isError(error));
}
```

What values print? Would a `catch (error)` binding convert the value to an Error?

## Exercise 4: message and cause property presence

```js
const first = new Error("first");
const omittedMessage = new Error(undefined);
const second = new Error("second", { cause: first });
const third = new Error("third", { cause: undefined });
console.log(Object.hasOwn(second, "cause"), second.cause === first);
console.log(Object.hasOwn(third, "cause"), third.cause);
console.log(Object.getOwnPropertyDescriptor(second, "cause").enumerable);
console.log(Object.hasOwn(omittedMessage, "message"));
```

## Exercise 5: aggregate iterable

```js
function* failures() {
  yield new RangeError("small");
  yield "remote failure";
}
const error = new AggregateError(failures(), "two tasks failed");
console.log(error.name, error.errors.length, error.errors[1]);
console.log(Object.getOwnPropertyDescriptor(error, "errors").enumerable);
```

What does construction consume, and why can the second item be a string?

## Exercise 6: branded errors and prototypes

```js
const genuine = new Error("genuine");
const lookalike = Object.create(Error.prototype);
console.log(genuine instanceof Error, Error.isError(genuine));
console.log(lookalike instanceof Error, Error.isError(lookalike));
```

Explain why the two checks disagree for the lookalike. What could happen if `genuine` came from another realm?

## Exercise 7: await placement

```js
async function bad() {
  let pending;
  try {
    pending = Promise.reject(new Error("later"));
  } catch {
    return "caught";
  }
  return pending.catch(error => `handled after local try: ${error.message}`);
}

async function good() {
  try {
    await Promise.reject(new Error("now inside try"));
  } catch {
    return "caught";
  }
}
```

What do the returned promises fulfill with? Which catch handles each failure, and how should the caller observe the result?

# Progressive hints

1. **Exercise 1:** A returned value does not make the surrounding try abrupt; a throw does.
2. **Exercise 2:** Track the pending throw, then ask whether finally completes normally.
3. **Exercise 3:** A catch binding receives the exact value from the throw expression.
4. **Exercise 4:** The constructor tests property presence for `cause`, not whether its value is non-undefined. It creates `message` only when the message value is not `undefined`; both own properties are non-enumerable.
5. **Exercise 5:** AggregateError consumes the iterator and stores every yielded value in an array.
6. **Exercise 6:** `instanceof` checks the prototype chain; Error.isError checks the internal brand.
7. **Exercise 7:** In `bad`, the try block does not await the rejected promise, so rejection happens after the try has left.

# Complete solutions

## Solution 1

The output is:

```text
returned
thrown
```

`one()` returns an Error as an ordinary value and the first `console.log` reads its message. `two()` throws, so execution skips `console.log("after two")` and enters catch. It receives the Error created by `two`, whose message is `"thrown"`.

## Solution 2

It prints `cleanup result`. The return in finally is an abrupt completion that replaces the pending throw, so the outer catch is not entered. This pattern is legal but dangerous; cleanup code should normally avoid return/throw that masks the operation's real outcome.

## Solution 3

It prints `E_LIMIT false`. Catch binds the exact object thrown. It does not wrap or convert it into Error. A boundary may normalize it, for example `throw new Error("Operation failed", { cause: error })`, while preserving the original value.

## Solution 4

The first line is `true true`. The second is `true undefined`: the third Error owns cause even though its value is undefined. The final result is `false`, because the cause property is non-enumerable. The standard also defines message as non-enumerable; host-specific extra Error fields may affect a full `Object.keys` result, so inspect the property you need directly.
The added final check prints `false`: an Error constructed with an `undefined` message does not get an own `message` property.

## Solution 5

The first line is `AggregateError 2 remote failure`. The final result is `false` because the `errors` property is non-enumerable. Construction synchronously consumes the generator into a new array. The iterable contract permits any values; it does not validate that every element is an Error object.

## Solution 6

For `genuine`, both results are true. For `lookalike`, `instanceof Error` is true because `Error.prototype` is in its prototype chain, but `Error.isError` is false because the object was not initialized by an Error constructor and has no internal Error brand. A genuine error from another realm can fail `instanceof Error` because it inherits from that realm's distinct Error prototype, but Error.isError remains true.

## Solution 7

`bad()` returns a promise whose rejection handler is attached after the local try has already completed; it fulfills with `"handled after local try: later"`. The local catch did not run. `good()` fulfills with `"caught"` because the awaited rejection becomes a throw completion inside the try and enters catch. Callers should await returned promises and handle rejections.

# Tests and edge cases

```js
import assert from "node:assert/strict";

const cause = new TypeError("low-level");
const wrapped = new Error("high-level", { cause });
assert.equal(wrapped.cause, cause);
assert.equal(Object.getOwnPropertyDescriptor(wrapped, "cause").enumerable, false);

const aggregate = new AggregateError([cause, "other"], "two failures");
assert.equal(aggregate.errors.length, 2);

let finalValue;
try {
  throw "anything";
} catch (value) {
  finalValue = value;
}
assert.equal(finalValue, "anything");
```

In production code, check whether Error.isError is available before calling it if your runtime target is not fixed. Error messages and stack strings should be logged for diagnostics, not parsed as stable codes. Use application-owned `code` fields or error subclasses for machine decisions.

# Reflection questions

1. At which boundary should a low-level failure gain domain-specific context?
2. Which cleanup belongs in finally, and could it accidentally throw or return?
3. Should a group of failures be aggregated or should the first one stop the operation?
4. If a caught value is not an Error, should the application preserve it in a cause or normalize it?
5. Does an async operation get awaited inside the try that is expected to catch it?

# Sources

- [ECMAScript 2026 Error objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [ECMAScript 2026 throw and try statements](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [MDN: Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [MDN: Error.isError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError)
