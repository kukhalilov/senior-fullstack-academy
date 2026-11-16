<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript function forms, parameters, and return behavior — Core concepts and how they fit together

# Learning objectives

You will explain how declarations and expressions create bindings or values; compare ordinary, arrow, method, async, and generator forms; trace defaults, destructuring, rest, and `arguments`; distinguish return from fall-through; and reason about callbacks, recursion, names, and function length.

# Prerequisites

Know lexical bindings, objects, arrays, call expressions, and basic control flow. A formal parameter is a local binding declared in a function's parameter list. An actual argument is a value supplied by the call. A function object is a value that can be invoked.

# Core concepts

## Function forms describe different roles

A function declaration creates a binding in its enclosing scope. A named function expression creates a function value with an internal name useful for self-reference; that name is not a surrounding binding. Anonymous expressions and arrows are values that can be stored or passed. Method definitions create methods as part of object/class syntax; they are not ordinary function-valued properties in every semantic detail. Detailed `this` behavior is covered separately in t06-017.

An ordinary function can have its own dynamic receiver and, for constructible forms, can be used with `new`. An arrow has lexical `this`, `super`, and `new.target` behavior, no own `arguments`, and cannot be constructed. Async functions always return a Promise: returning a value fulfills it and throwing rejects it. Generator functions return suspended iterators; their body starts on iteration. Async generator functions return asynchronous iterators. The generator protocols themselves are covered in t06-016.

The `Function` constructor compiles strings into a new function in the global environment; it does not close over local variables. This dynamic-code facility has security, debugging, and optimization costs, and environments may restrict it.

## Parameters initialize local bindings

Arguments are matched to parameters from left to right. Missing parameters normally become `undefined`. A default initializer runs only when the argument value is `undefined`, including when the argument is explicitly passed as undefined; `null`, `0`, `false`, and `""` do not trigger it. Initializers run when the call happens and only when needed.

```js
function range(start, end = start + 10, options = {}) {
  return { start, end, options };
}
range(5);                 // { start: 5, end: 15, options: {} }
range(5, undefined, null); // { start: 5, end: 15, options: null }
```

Defaults are evaluated in order. A later parameter may refer to an earlier one, but an earlier initializer cannot read a later parameter before initialization. Destructuring parameters extract fields/elements into local names; when the whole argument is missing, provide a default pattern value if destructuring should still proceed.

A rest parameter must be last and receives the remaining actual arguments in a new Array. It is usually clearer than `arguments` when a function needs a variable number of arguments.

## The arguments object and its legacy corner

Ordinary functions may have a local `arguments` object with indexed actual values and a `length` equal to the number of arguments supplied, not the number of formal parameters. It is array-like but is not an Array. In non-strict ordinary functions with a simple parameter list, indexed entries can be mapped to parameter bindings. Strict functions and functions with non-simple parameters (defaults, rest, or destructuring) have an unmapped arguments object. Arrows do not create an `arguments` binding; an arrow nested inside a function can resolve that outer binding.

`arguments.callee` is deprecated and forbidden in strict mode. Named function expressions, declarations, or explicit recursion parameters are clearer and safer. A strict-mode access throws; do not build recursion or stack inspection around this property.

## Call and completion

A call expression evaluates a callable value and its arguments, then invokes the function. It is not the same as constructing an object with `new`; the specific call form can also affect a function's receiver (covered in t06-017). A function can accept any number of arguments. Extra arguments are available through rest/arguments or can simply be ignored; missing arguments become undefined unless defaulted.

`return expression` stops the current function body and completes with the evaluated expression value. `return;` completes with undefined. Reaching the end also produces undefined. A newline immediately after `return` triggers automatic semicolon insertion, so the expression on the next line is not returned. Concise arrow bodies implicitly return their expression; block-bodied arrows need an explicit return.

## Composition: recursion and higher-order functions

A recursive function calls itself on a smaller or simpler subproblem and needs a base case. Each call has a separate parameter/local environment. A higher-order function accepts a function argument, returns a function, or both. A callback is a function passed for another operation to invoke; the API determines invocation timing and arguments. Functions are first-class values, so callbacks can close over local bindings, but avoid relying on hidden mutable state when explicit arguments are clearer.

Immediately invoked function expressions (IIFEs) are function expressions called as part of the same expression. They can create a local scope, though block-scoped `let`/`const` and modules provide common modern alternatives.

## Name and length are metadata

Function `name` is descriptive and may be inferred from declaration or assignment context. It has no semantic identity role. Function `length` reflects a typical expected-argument count: parameters before the first default initializer or rest parameter; it does not limit accepted calls. Defaults/rest and binding affect the reported length.

# Mechanisms and relationships

| Feature | Own `this`? | Own `arguments`? | Constructible? | Call result |
| --- | --- | --- | --- | --- |
| Ordinary function declaration/expression | Yes, dynamic | Yes | Commonly, depending on exact form | Body's return value or undefined |
| Arrow | No; lexical | No | No | Expression/body completion |
| Concise object method | Yes, dynamic | Yes | No | Body's return value or undefined |
| Async function | Yes unless arrow form | Yes unless async arrow | No | Promise |
| Generator function | Yes | Yes | No | Generator object |
| Async generator function | Yes | Yes | No | Async generator object |
| Function constructor result | Ordinary function behavior | Yes | Yes | Body's return value or undefined |

Treat this as a first-pass map; function syntax families have additional strictness, name, prototype, and grammar distinctions in the reference lesson.

# Worked examples

```js
function collect(first, { enabled = false } = {}, ...rest) {
  return { first, enabled, rest, actualCount: arguments.length };
}
collect("x", undefined, 3, 4);
// { first: "x", enabled: false, rest: [3, 4], actualCount: 4 }
```

The default object handles a missing/undefined second argument before its properties are destructured. The rest array contains arguments after the first two formal positions. The unmapped `arguments.length` still counts all four actual values.

# Misconceptions and edge cases

- “Defaults apply to every falsy value.” They apply only to undefined.
- “`arguments` is an Array.” It is array-like; use rest for a real Array.
- “Arrow functions have the caller's arguments.” They resolve an outer lexical binding if one exists; they create none.
- “Every function declaration is hoisted to the top of the whole program.” Binding behavior depends on scope and block/legacy rules.
- “Function length is maximum accepted arguments.” Calls may pass any count.
- “Async means parallel.” An async function returns a Promise; awaits and operations determine sequencing.
- “Calling a generator runs it to the first yield.” The body is initially suspended until iteration requests execution.
- “A callback automatically keeps its method receiver.” A detached function value may not; see t06-017.
- “A newline after return is harmless.” Automatic semicolon insertion may end the return with undefined.
- “The Function constructor sees local variables.” It parses dynamic code in the global environment, not the caller's lexical environment.

# Knowledge checks with answers

1. **Does `f(undefined)` trigger a default parameter?** Yes; undefined triggers the initializer.
2. **Does `f(null)` trigger that default?** No.
3. **What is the difference between rest and arguments?** Rest is a real Array for remaining parameters; arguments is an array-like object of all actual args in ordinary functions.
4. **Can an arrow use `new`?** No; it is not constructible.
5. **What does an async function return after `return 5`?** A Promise fulfilled with 5.
6. **What does a function return if it reaches its closing brace?** Undefined.
7. **Does `.length` prevent extra arguments?** No; it is metadata.

# Sources

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [MDN: Functions guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
- [MDN: Function reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions)
- [MDN: Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
