<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript this binding and Function object methods — Big-picture orientation and mental model

# Problem and purpose

JavaScript functions are values that can be stored, passed to callbacks, detached from objects, and called in several ways. The same ordinary function can therefore see different `this` values on different calls. This topic explains how the call expression supplies a receiver, how strictness affects the received value, how arrows capture an outer receiver, and how `call`, `apply`, and `bind` make invocation choices explicit. It also explains what a function's metadata and constructor-related `prototype` property do—and do not—tell you.

# Plain-language mental model

Think of an ordinary function call as sending two things: the explicit arguments and an implicit receiver. In `account.read()`, the call expression carries `account` as that receiver. If you first copy `account.read` into a variable, the copy is just a function value; the old object is no longer carried along. `call` and `apply` choose a receiver for one call. `bind` makes a new callable package that remembers a receiver and any leading arguments. An arrow is different: it has no receiver slot of its own and uses the surrounding `this`.

Function properties are labels and construction machinery. `name` and `length` are descriptive metadata. A constructible function's own `prototype` property is the object new instances initially inherit from. This is not the same property as the shared `Function.prototype` object that functions inherit methods from.

# How the parts fit together

1. The syntax of the call determines a candidate receiver for an ordinary function: a property-reference call supplies its base object; a plain call supplies `undefined`.
2. The function's `this` mode then applies. Strict functions preserve the supplied value. Non-strict ordinary functions replace nullish values with the global this value and box primitives.
3. An arrow gets `this` from its lexical environment instead of the call expression. A bound function uses the receiver saved when `bind` created it.
4. Constructor calls use `new` and establish a fresh receiver, with `new.target` identifying the active constructor. `super.method()` starts lookup from a parent prototype but calls with the current receiver.
5. Function methods invoke a callable with arguments and optional receiver. Function metadata helps inspect the callable but does not prove its behavior or restrict the number of arguments.

# Concept map

| Question | Rule or tool | What to remember |
| --- | --- | --- |
| What is `this` in an ordinary call? | Call-site binding | Read the actual call expression, not where the function was created |
| What does a detached call pass? | Plain-call receiver | `undefined`; strictness decides how an ordinary function treats it |
| How can a callback keep a receiver? | Arrow or `bind` | Arrow captures lexically; bind creates a new callable |
| How can one call set the receiver? | `call` / `apply` | Immediate call; apply also accepts an array-like argument list |
| What happens with `new`? | Constructor call | A new receiver is initialized; `new.target` records the construction target |
| What does `fn.prototype` mean? | Constructor property | Initial prototype for instances created by that constructor |
| What does `Function.prototype` mean? | Shared intrinsic prototype | Common inherited function methods and metadata behavior |

# End-to-end walkthrough

```js
"use strict";
const meter = {
  value: 4,
  read() { return this.value; },
};

console.log(meter.read()); // 4: property call supplies meter
const detached = meter.read;
// detached(); // TypeError here: strict method receives undefined
console.log(detached.call({ value: 9 })); // 9: call supplies a receiver

const readMeter = meter.read.bind(meter);
console.log(readMeter()); // 4: bind remembers meter

function Scale(factor) { this.factor = factor; }
const DoubleScale = Scale.bind(null, 2);
console.log(new DoubleScale().factor); // 2: new ignores bound this, keeps bound argument
```

The receiver changes only where an ordinary function's call form or construction form provides it. Binding the function does not rewrite its body. The bound constructor ignores the stored null receiver because `new` creates the instance receiver.

# When to use it and tradeoffs

Use an ordinary method when its receiver should be supplied by the caller. Use an arrow for a nested callback that should keep the surrounding receiver. Use `bind` when a callback must be passed elsewhere with a stable receiver or preset arguments. Use `call` or `apply` for a one-time explicit invocation. Prefer explicit parameters or closures when they make a dependency clearer than an implicit receiver. Avoid relying on deprecated function caller inspection. Function names and lengths are useful for debugging and tooling, not validation or security decisions.

# What later lessons cover

The concepts lesson walks through receiver selection and function kinds. The three reference lessons enumerate every supplied binding rule, Function prototype method, and function property. Practice predicts results and repairs callback/construction bugs. The interview lesson develops concise explanations of the common traps.

# Sources

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [ECMAScript 2026 Function objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [MDN: `this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)
- [MDN: Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
