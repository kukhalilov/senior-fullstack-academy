<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript function forms, parameters, and return behavior — Reference: Function syntaxes and callable forms

# Scope and version

This reference explains the 18 supplied callable forms in ECMAScript 2026. It focuses on binding, value creation, call/result shape, and constructibility. Detailed receiver behavior is in t06-017; class constructors and methods are in t06-018; generator protocol details are in t06-016. See [ECMAScript function syntax](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html) and [MDN: Function reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions).

# How this group fits the mental model

Some syntax creates a binding in its surrounding scope; some creates a function value at an expression location; some creates a method with special receiver/home-object semantics. Async and generator prefixes change how the function body completes. Choose syntax based on the intended role, then check its name binding, receiver, `arguments`, constructibility, and result protocol.

# Supplied names explained

- `Function declaration` — A statement such as `function compute(x) { ... }` creates a function binding in the containing scope. Its initialization/availability depends on the declaration's scope and context; do not assume every declaration is hoisted across every block. A top-level function declaration in a classic script may interact with global bindings differently from a module declaration. Ordinary declarations are commonly constructible with `new`.
- `Named function expression` — An expression such as `const run = function step(n) { ... }` creates a function value with an internal `step` binding available inside its body, useful for recursion. The name does not create an outer variable named `step`. It is an ordinary function unless additional syntax changes its kind.
- `Anonymous function expression` — An expression such as `const run = function (x) { ... }` creates an ordinary function without a written name. Its `.name` may be inferred from assignment/property context, but inference is descriptive and should not drive behavior.
- `Arrow function` — An expression such as `(x) => x * 2` with a concise expression body, or `(x) => { return x * 2; }` with a block body. It has lexical `this`, `super`, and `new.target`; no own `arguments`; no `[[Construct]]`, so `new arrow()` throws; and no own `.prototype`. A block body needs an explicit return to produce a value.
- `Async arrow function` — An arrow prefixed with `async`, such as `async (x) => x * 2` or `async x => x * 2`. It retains arrow lexical behavior and is not constructible; calling it returns a Promise that fulfills with the returned value or rejects if the body throws.
- `Concise method definition` — Object literal syntax such as `{ read() { return this.value; } }`. The method has dynamic receiver behavior and a home object for `super`, but is not constructible with `new`. It is not identical to assigning `read: function () { ... }`, particularly for constructibility and `super` support.
- `Getter definition` — Object literal syntax such as `{ get value() { return this._value; } }`. It defines an accessor invoked on property read, with no parameter list. It is not called with `obj.value()`; reading `obj.value` runs it.
- `Setter definition` — Object literal syntax such as `{ set value(next) { this._value = next; } }`. It defines an accessor invoked on property assignment and receives the assigned value as its single parameter. Reading the property does not invoke the setter.
- `Generator method definition` — Object/class method syntax such as `{ *values() { yield 1; } }`. Calling the method creates a generator object in suspended-start state. Like concise methods, it is not constructible with `new`; its iteration protocol is in t06-016.
- `Async method definition` — Object/class method syntax such as `{ async load() { return 1; } }`. It has method receiver/home-object behavior and returns a Promise when called; it is not constructible with `new`.
- `Async generator method definition` — Object/class method syntax such as `{ async *events() { yield "ready"; } }`. Calling it returns an async generator object and uses method receiver/home-object behavior; it is not constructible with `new`.
- `Generator function declaration` — Syntax `function* name(...) { ... }`. Calling it returns a generator object in suspended-start state; the body begins when the iterator is advanced. It cannot be called with `new`.
- `Generator function expression` — Expression form `const sequence = function* (...) { ... };`, optionally with an internal name. It creates a generator function value; each call creates an independent generator object and suspended execution. Its `yield`/iterator protocol is detailed in t06-016.
- `Async function declaration` — Syntax `async function name(...) { ... }`. Calling it returns a Promise. A normal return fulfills the Promise with the resulting value (assimilating a returned Promise/thenable); a throw rejects it. It cannot be constructed with `new`.
- `Async function expression` — Expression form `const load = async function (...) { ... };`, optionally named. It has the same Promise-based completion rules as an async declaration and is useful as a function value. It cannot be constructed with `new`.
- `Async generator function declaration` — Syntax `async function* name(...) { ... }`. Calling it returns an async generator object; advancing it uses the async iteration protocol. It is neither an ordinary Promise-returning function nor constructible with `new`.
- `Async generator function expression` — Expression form `const stream = async function* (...) { ... };`, optionally with a name. Each call returns an async generator object whose requests produce Promise-backed iterator results. Full request/yield/close behavior is in t06-016.
- `Function constructor` — `Function(parameterStrings..., bodyString)` dynamically parses source strings into a new ordinary constructible function; calling with or without `new` creates a function. It does not capture caller-local lexical bindings: its body closes over the global environment. This is eval-like dynamic code with security, debugging, performance, and CSP costs; avoid it for ordinary callbacks or factories.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `Function declaration` vs `Named function expression` | Declaration creates a surrounding binding; expression creates a value whose written name is internal to the function body. |
| `Anonymous function expression` vs `Arrow function` | Both can be concise function values; an anonymous ordinary expression has ordinary function semantics, while an arrow has lexical receiver behavior and is non-constructible. |
| `Concise method definition` vs function-valued property | A concise method is non-constructible and supports `super` through its home object; a function-valued property may be constructible depending on the function form. |
| `Generator function declaration` vs `Async function declaration` | Generator call returns a paused iterator; async function call returns a Promise. |
| `Generator function expression` vs `Async generator function expression` | Synchronous iterator protocol versus asynchronous iterator protocol. |
| `Function constructor` vs lexical declaration/expression | Dynamic global-scope source compilation versus source-level lexical closure and static parsing. |

# Examples

```js
function declaration(x) { return x + 1; }
const named = function inner(x) { return x === 0 ? 0 : inner(x - 1); };
const arrow = x => x + 1;
const object = {
  value: 3,
  read() { return this.value; },
  get doubled() { return this.value * 2; },
};

console.log(declaration(2), named(2), arrow(2)); // 3, 0, 3
console.log(object.read(), object.doubled); // 3, 6
```

```js
function makeLocal() {
  const local = 40;
  return Function("return typeof local");
}
console.log(makeLocal()()); // "undefined" (local is not captured)
```

# Common mistakes

- Assuming the written name of a named function expression creates a variable in its parent scope.
- Assuming every declaration is visible before its block or module scope begins; scope rules differ.
- Using an arrow when a constructor or dynamic receiver is required.
- Calling a getter with parentheses or expecting a setter to return a property value.
- Expecting an async function to return its raw value rather than a Promise.
- Expecting generator body code to run when the generator function is called.
- Treating an async generator as a function that simply returns a Promise of an array.
- Assuming the Function constructor closes over local variables.
- Using Function constructor as an ordinary alternative to a declaration; it adds dynamic-code risks.

# Knowledge checks with answers

1. **Does a named function expression create its name in the outer scope?** No; the internal name is available in its own body.
2. **Can an arrow function be constructed?** No.
3. **What does calling a generator function return immediately?** A suspended generator object.
4. **What does an async function call return?** A Promise.
5. **Does `Function("return local")` see a caller's local `local` binding?** No; it uses the global environment.
6. **What happens when an object-literal getter is read?** Its function executes; it is not a method call requiring parentheses.

# Sources

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [ECMAScript 2026 Function objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [MDN: Function reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions)
- [MDN: Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
- [MDN: Function constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function)
