
# JavaScript function forms, parameters, and return behavior — Reference: Calls, return behavior, and composition

# Scope and version

This reference covers the nine supplied invocation, completion, composition, and metadata terms in ECMAScript 2026. It keeps receiver-binding details linked to t06-017 and Promise timing to t06-005. See [ECMAScript function evaluation](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html) and [MDN: Functions guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions).

# How this group fits the mental model

A call provides actual argument values to a callable function. The function body then completes normally with a return value or undefined, or abruptly with a throw/other completion. Higher-order functions and callbacks compose these calls by passing functions as values. Name and length metadata help inspect functions but do not constrain what calls can do.

# Supplied names explained

- `Call expression` — Syntax such as `fn(a, b)`, `object.method(a)`, or `(factory())(a)`. The callee expression and arguments are evaluated as part of the call, then the callable is invoked. A non-callable value causes TypeError. Spread arguments expand an iterable into positional arguments; the resulting argument count is not restricted by formal parameter count. Receiver details for method calls are in t06-017.
- `Return statement` — `return expression;` evaluates the expression, stops the current function body, and completes with that value. `return;` completes with undefined. A line terminator immediately after the `return` keyword triggers automatic semicolon insertion, so the next line's expression is not returned. Return in an async function settles its Promise; return in a generator can be observed as a done iterator result.
- `Implicit undefined return` — A normal function that reaches its closing brace without a return expression produces undefined. A bare `return;` also produces undefined. This is distinct from throwing undefined, which is abrupt control flow, and from returning a Promise that fulfills with undefined.
- `Recursive function call` — A function calls itself directly or indirectly to solve a smaller instance. Correct recursion requires a base case reachable for every valid input; each active call has separate parameter/local bindings and consumes stack resources. Deep or unbounded recursion can overflow the call stack; use iteration or a worklist when depth may be large.
- `Higher-order function` — A function that accepts one or more functions as arguments or returns a function. This enables abstraction over behavior, such as selecting a comparison rule, transforming values, or deferring work. Higher-order does not necessarily mean asynchronous.
- `Callback function` — A function supplied to another function so that the receiving API invokes it according to its contract. The contract determines when/how often it runs and which arguments are passed. A callback may run immediately or later; passing a method value may detach it from its receiver (see t06-017). Prefer explicit closures/bind where a receiver is required.
- `Immediately invoked function expression` — An IIFE is a function expression called directly, commonly `(function () { ... })()` or `(() => { ... })()`. It creates a function scope and executes immediately. Modern block scope and modules often make an IIFE unnecessary for simple local isolation, but it remains useful in expression contexts or initialization patterns.
- `Function name inference` — The language may infer a function's `name` from a binding or property initialization context, such as `const process = function () {}` or `{ run() {} }`. Inference aids debugging; it does not create a new outer binding or make name a semantic identity guarantee. Explicitly named function expressions have a local self-name.
- `Function length property` — Descriptive metadata for the number of formal parameters before the first default-initialized parameter or rest parameter. It does not count all declared optional-looking later parameters and does not reject calls with fewer or more actual arguments. The own property is non-writable, non-enumerable, configurable for ordinary function instances.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `Call expression` vs `Return statement` | A call invokes another function; return completes the current function. |
| `Return statement` vs `Implicit undefined return` | Explicit return may provide a value; falling off the body supplies undefined. |
| `Higher-order function` vs `Callback function` | Higher-order describes the receiving/returning function category; callback describes a function passed for another operation to call. |
| `Function name inference` vs explicit function binding | Inferred `.name` is descriptive metadata; a declaration/variable creates an actual lexical binding. |
| `Function length property` vs actual argument count | Declared-shape metadata versus values supplied in this particular call. |

# Examples

```js
function transform(values, mapper) {
  const output = [];
  for (const value of values) output.push(mapper(value));
  return output;
}

const doubled = transform([1, 2, 3], value => value * 2);
console.log(doubled); // [2, 4, 6]
```

`transform` is higher-order because it accepts a function; the arrow is the callback. This implementation invokes it synchronously once for each value because that is the function's explicit code.

```js
const inferred = function (x, y = 0, ...rest) { return x + y + rest.length; };
console.log(inferred.name, inferred.length); // "inferred", 1
console.log(inferred(2, 3, 4, 5)); // 4; length does not limit actual args
```

# Common mistakes

- Assuming every call passes the same receiver or scheduling; call contracts vary.
- Assuming a callback passed as `obj.method` will necessarily run with `obj` as its receiver; the receiving API's call form matters.
- Confusing a function's return value with side effects or a thrown exception.
- Forgetting a newline after `return` can insert a semicolon.
- Assuming a function's `.length` equals `arguments.length` or enforces input count.
- Treating a function's `.name` as a stable unique identifier.
- Using recursion without a termination condition or depth analysis.
- Assuming an IIFE is required for every local scope in modern JavaScript.

# Knowledge checks with answers

1. **What does a function that reaches its end return?** Undefined.
2. **Does a callback's receiving function decide when it runs?** Yes; the API contract and implementation determine timing/count/arguments.
3. **Does `.length` change when extra actual arguments are passed?** No.
4. **What is a base case for recursion?** A condition that returns/finishes without another recursive call.
5. **Does inferred function name create a variable of that name?** Not necessarily; `.name` metadata and lexical bindings are different.

# Sources

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [ECMAScript 2026 Function objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [MDN: Functions guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
