
# JavaScript errors, exceptions, and error objects — Reference: Built-in error constructors

# Scope and version

This lesson covers the eight supplied Error constructors in ECMAScript 2026. It separates standard error categories from runtime-specific message and stack details. The constructors can be called with or without `new`; subclass construction has additional rules described in the properties reference. See [ECMAScript Error objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html) and [MDN: Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error).

# How this group fits the mental model

Each constructor creates an Error-branded object with a prototype chain and diagnostic fields. A subtype suggests the category of the failure, but message text and the particular error an engine chooses for a detected problem are not always portable. Use thrown Error objects for actionable diagnostics; do not classify an error solely by matching its message.

# Supplied names explained

- `Error` — The general-purpose error constructor. `new Error(message, { cause })` creates an Error-branded object and optionally an own non-enumerable message and cause. Calling `Error(...)` without `new` also creates an Error object. The standard does not require stack text in a portable format.
- `AggregateError` — Represents a collection of failures, commonly when concurrent or batch operations all fail. Its first argument must be a synchronous iterable; the constructor consumes it immediately and stores the resulting values in an own `errors` array. Optional message and cause follow Error-style rules. It is a subtype of Error.
- `EvalError` — Legacy error type retained for compatibility. The current ECMAScript specification does not use it for its own runtime errors; ordinary invalid operations involving `eval` generally use another category such as SyntaxError or TypeError.
- `RangeError` — Indicates a numeric/value range or set constraint is not met, such as an invalid array length. It does not mean that all numeric validation automatically throws this type; application code should choose it when range is the actual issue.
- `ReferenceError` — Indicates an invalid reference operation, such as reading an unresolvable identifier. It is also a useful application choice when a required binding/reference cannot be resolved, though custom domain errors may communicate more precisely.
- `SyntaxError` — Indicates that source text or a dynamically parsed expression has invalid syntax. Syntax errors in the current script may be detected before that script can run and therefore cannot always be caught by a try block inside the same source unit.
- `TypeError` — Indicates an operation could not proceed because a value has an unsuitable type or required capability, such as calling a non-function. It is one of the most common standard runtime errors.
- `URIError` — Indicates a malformed URI sequence encountered by URI encoding/decoding operations, such as a malformed encoded sequence passed to `decodeURIComponent`.

# Prototype hierarchy

| Constructor | Prototype relationship | Main category |
| --- | --- | --- |
| `Error` | Base Error prototype | General failure |
| `AggregateError` | Subtype of Error | Several collected failures |
| `EvalError` | Native Error subtype | Legacy compatibility type |
| `RangeError` | Native Error subtype | Out-of-range value |
| `ReferenceError` | Native Error subtype | Invalid/unresolvable reference |
| `SyntaxError` | Native Error subtype | Invalid syntax |
| `TypeError` | Native Error subtype | Incompatible operation/value |
| `URIError` | Native Error subtype | URI encoding/decoding failure |

The prototype chain controls `instanceof`, but it is not a cross-realm brand test. ECMAScript 2026's `Error.isError` checks the internal Error brand and recognizes standard Error-family instances across realms. Runtime support is not yet universal; check the [MDN Error.isError compatibility data](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError) for target environments.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `Error` vs `AggregateError` | General single failure versus a wrapper containing an iterable's collected failure values. |
| `RangeError` vs `TypeError` | Value is outside a permitted range versus value/capability is unsuitable for the requested operation. |
| `ReferenceError` vs `SyntaxError` | A reference operation is invalid versus the source cannot be parsed as valid syntax. |
| `EvalError` vs current native errors | Legacy constructor retained for compatibility; current ECMAScript algorithms do not generate it. |
| `Error.isError` vs `instanceof Error` | Internal brand test across realms versus prototype-chain test tied to a constructor identity. |

# Examples

```js
try {
  decodeURIComponent("%E0%A4%A");
} catch (error) {
  if (Error.isError(error)) {
    console.log(error.name); // typically "URIError"
  }
}

const failures = new AggregateError(
  [new TypeError("bad input"), new RangeError("too large")],
  "Batch could not be completed",
  { cause: "two independent validation steps failed" },
);
console.log(failures.errors.length); // 2
```

The error names are standard, but exact messages are engine- and operation-dependent. Application errors should have messages designed for people and stable machine-readable fields when programmatic handling is needed.

# Common mistakes

- Treating an Error message as a stable API or parsing its text to decide recovery.
- Assuming `EvalError` is currently thrown by standard eval operations.
- Using `AggregateError` when failures are not actually independent or aggregated.
- Assuming `instanceof Error` works across realms such as iframes or VM contexts.
- Treating `Error.isError` as a security trust check; it proves branding, not safe content.
- Assuming every `SyntaxError` can be caught by a try block in the same source unit; parse-time errors may prevent that unit from executing.
- Assuming every URI-related failure is `URIError`; validate the exact operation and error category.

# Knowledge checks with answers

1. **What kind of input does `AggregateError` consume?** A synchronous iterable, immediately converted to an array of yielded values.
2. **Which supplied constructor is retained but not currently generated by ECMAScript algorithms?** `EvalError`.
3. **Can a message string safely drive retry logic?** No; message wording is not a stable cross-engine contract.
4. **Why can a genuine error fail `instanceof Error`?** It may originate in another realm with a different Error constructor/prototype.
5. **What does `Error.isError` check?** The internal Error brand, not just the prototype chain.

# Sources

- [ECMAScript 2026 Error objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [MDN: Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [MDN: Error.isError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError)
