<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript function forms, parameters, and return behavior — Exercises and worked solutions

# Goals

Practice choosing function forms, tracing defaults and argument counts, distinguishing returned values from throws, reasoning about closures/callbacks, and predicting async/generator result shapes.

# Worked example

```js
function makeMultiplier(factor = 2) {
  return function multiply(value) {
    return value * factor;
  };
}

const triple = makeMultiplier(3);
console.log(triple(4)); // 12
```

The outer function receives `factor` and returns a named function expression. The inner function closes over the `factor` binding from that call. Calling `triple` later uses the preserved binding. Neither function depends on a global variable.

# Exercises

Predict the results first. Unless stated, assume modern ECMAScript.

## Exercise 1: defaults, destructuring, and rest

```js
function format(name, { upper = false } = {}, ...tags) {
  const shown = upper ? name.toUpperCase() : name;
  return [shown, tags, arguments.length];
}
console.log(format("Mina", undefined, "new", "staff"));
console.log(format("Mina", { upper: null }));
```

## Exercise 2: defaults only for undefined

```js
function pick(value = "fallback") { return value; }
console.log(pick(), pick(undefined), pick(null), pick(false), pick(0));
```

## Exercise 3: function forms and return

```js
const concise = value => value * 2;
const block = value => { value * 2; };
function fallsThrough() {}
console.log(concise(3), block(3), fallsThrough());
```

What is the difference between the arrow bodies?

## Exercise 4: return line terminator

```js
function getValue() {
  return
  { ok: true };
}
console.log(getValue());
```

Why is the object not returned? Rewrite it correctly.

## Exercise 5: arguments and rest

Run this as a classic sloppy script (not a module):

```js
function simple(a) {
  a = 8;
  return [arguments[0], arguments.length];
}
function nonSimple(a = 1) {
  a = 8;
  return [arguments[0], arguments.length];
}
console.log(simple(2, 3));
console.log(nonSimple(2, 3));
```

Which function has mapped arguments and why?

## Exercise 6: named expression and inference

```js
const worker = function repeat(n) {
  return n <= 1 ? 1 : n * repeat(n - 1);
};
console.log(worker(4), typeof repeat, worker.name, worker.length);
```

## Exercise 7: async and generator forms

```js
async function value() { return 7; }
function* sequence() { yield 1; return 2; }
console.log(value() instanceof Promise);
const iterator = sequence();
console.log(iterator.next(), iterator.next());
```

What does calling each function return before its body/result is fully consumed?

## Exercise 8: Function constructor scope

```js
function make() {
  const local = 5;
  return Function("return typeof local");
}
console.log(make()());
```

Why does the generated function not read the caller's local binding?

# Progressive hints

1. **Exercise 1:** The second formal is defaulted because undefined was supplied; rest begins after that formal position.
2. **Exercise 2:** Check for undefined, not truthiness.
3. **Exercise 3:** An expression-body arrow returns implicitly; a block body needs `return`.
4. **Exercise 4:** JavaScript inserts a semicolon after the line containing `return`.
5. **Exercise 5:** Simple means plain identifiers only; default parameters make a list non-simple.
6. **Exercise 6:** The internal name is scoped to the function expression, not the surrounding code.
7. **Exercise 7:** Async calls return Promise; generator calls return suspended iterators.
8. **Exercise 8:** The Function constructor creates source in the global environment, not the caller's lexical scope.

# Complete solutions

## Solution 1

The first output is `["Mina", ["new", "staff"], 4]`. The second is `["Mina", [], 2]`: `upper: null` is retained but falsy, so it selects the unchanged name. The first call supplies four actual arguments, including explicit undefined; `arguments.length` counts all four.

## Solution 2

The values are `"fallback"`, `"fallback"`, `null`, `false`, and `0`. A default is selected only when the parameter value is undefined, whether absent or explicitly passed.

## Solution 3

The result is `6 undefined undefined`. The concise arrow expression implicitly returns `value * 2`. The block arrow only evaluates the expression and has no return. The ordinary function falls through and also returns undefined.

## Solution 4

It returns undefined. Automatic semicolon insertion treats the line break after `return` as the end of the statement. Write `return { ok: true };` on one line, or `return ({ ok: true });` to make the returned object clear.

## Solution 5

The outputs are `[8, 2]` and `[2, 2]`. In the non-strict classic script, `simple` has a simple parameter list, so its mapped arguments object reflects assignment to `a`. `nonSimple` has a default parameter, so the arguments object is unmapped and retains the original first actual argument. Both report two actual arguments.

## Solution 6

The result is `24 "undefined" "worker" 1`. The name `repeat` is available inside the named function expression for recursion but is not an outer binding. The variable context provides the inferred `.name` `worker`. The function has one formal parameter, so its length is 1.

## Solution 7

The first output is `true`: invoking an async function immediately returns a Promise, fulfilled with 7. Calling the generator returns a suspended generator object without running its body yet. The first `next()` starts it and yields `{ value: 1, done: false }`; the second resumes, returns the body value 2, and completes as `{ value: 2, done: true }`.

## Solution 8

It prints `"undefined"`. Function constructor bodies are compiled in a global environment and do not capture the `make` call's lexical environment. This is one reason the constructor is not a normal way to create closures.

# Tests and edge cases

```js
import assert from "node:assert/strict";

function f(a, b = 2, ...rest) { return [a, b, rest, arguments.length]; }
assert.deepEqual(f(1, undefined, 3), [1, 2, [3], 3]);
assert.equal((() => 1)(), 1);
assert.equal((() => { 1; })(), undefined);

async function asyncValue() { return 3; }
assert.ok(asyncValue() instanceof Promise);
```

In a module or strict function, arguments are unmapped even for a simple parameter list. Do not use the sloppy-mapped behavior in new designs; rest parameters are explicit and portable. Async Promise behavior and generator protocols have their own deeper lessons.

# Reflection questions

1. Would this operation be clearer as a declaration, expression, arrow, or method?
2. Does a default distinguish undefined from null in the way the API needs?
3. Should variadic input use rest instead of `arguments`?
4. Does a callback depend on an outer binding that can change before invocation?
5. Is this function supposed to return a value, a Promise, or an iterator?

# Reflection answers

1. Use a declaration for a stable named operation, an expression when a function value is needed, an arrow when lexical context is desired, and method syntax for object behavior that needs a method home object or `super`.
2. A default initializer runs only for missing or `undefined` arguments. If `null` should also select a fallback, handle it explicitly with a nullish check or `??` in the body.
3. Rest creates a real Array containing the remaining arguments and is usually clearer. `arguments` is useful for legacy APIs or inspecting all actual arguments in ordinary functions, with strictness/mapped behavior caveats.
4. A closure reads the current captured binding when invoked. If that binding can change, pass a stable copied value or redesign the callback contract when snapshot behavior is required.
5. The function form determines the completion shape: an ordinary function returns a value (or `undefined`), an async function returns a Promise, and a generator or async generator returns its corresponding iterator object.

# Sources

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [MDN: Default parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters)
- [MDN: The arguments object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments)
- [MDN: Function constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function)
