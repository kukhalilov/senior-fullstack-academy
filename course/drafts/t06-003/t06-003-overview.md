<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript function forms, parameters, and return behavior — Big-picture orientation and mental model

# Problem and purpose

Functions package repeatable behavior and provide boundaries for arguments, local bindings, and results. JavaScript has several function forms because a reusable named operation, a short callback, an object method, asynchronous work, and lazy production have different needs. The form affects whether a function has its own name binding, receiver behavior, construction ability, and return protocol. Parameters initialize local bindings from supplied argument values; return communicates a normal result, while fall-through produces `undefined`.

# Plain-language mental model

Think of a function as a callable recipe. Calling it creates a fresh execution with its own parameter bindings. Each parameter receives a value from the call, or a default/destructured value when the syntax says so. An ordinary function call produces one normal value; an async function produces a Promise for a value; a generator call produces a paused iterator; an async generator produces an asynchronous iterator.

Functions are values: they can be stored, passed to another function, and returned. A callback is simply a function supplied for another operation to call. Higher-order functions accept or return functions. This lets code separate *what work should happen* from *when/how it is called*.

# How the parts fit together

1. Choose a form: declaration for a scoped named binding, expression for a value, arrow for a concise lexical callback, method syntax for object behavior, or async/generator forms for different completion protocols.
2. A call expression evaluates a callable and supplies argument values.
3. Formal parameters bind those values; default initializers run only for missing/undefined arguments, and rest collects remaining values into an Array.
4. The body runs. `return expression` completes with that value; bare return or reaching the end completes with `undefined`.
5. Async and generator forms wrap or suspend that execution using their distinct protocols.
6. Function metadata such as inferred name and length helps debugging but does not define behavior or enforce arity.

# Concept map

| Need | Common form | Result shape |
| --- | --- | --- |
| Name a reusable operation | Function declaration | Ordinary return value |
| Create a function value inline | Function expression | Ordinary return value |
| Concise callback with lexical context | Arrow function | Ordinary return value |
| Attach behavior to an object | Method definition | Ordinary return value |
| Await asynchronous work | Async function | Promise |
| Produce values lazily | Generator function | Generator iterator |
| Produce async values lazily | Async generator function | Async generator iterator |
| Accept optional / many inputs | Defaults, destructuring, rest | Local parameter bindings |

# End-to-end walkthrough

```js
function summarize(label, ...values) {
  if (values.length === 0) return `${label}: empty`;
  const total = values.reduce((sum, value) => sum + value, 0);
  return `${label}: ${total}`;
}

const scores = [4, 7, 9];
const message = summarize("scores", ...scores);
console.log(message); // "scores: 20"
```

`label` receives the first supplied argument. Rest collects every remaining argument into a real Array. The function returns a string explicitly. If the guard were removed and the body reached its end without a return, the call would produce `undefined`.

# When to use it and tradeoffs

Use declarations when a stable local name improves reading and recursive calls. Use expressions when a function is a value in a larger expression. Arrows suit short callbacks that should inherit surrounding lexical context; ordinary functions suit dynamic receiver behavior or construction. Use default and destructured parameters to make a function's input contract visible. Prefer rest over the legacy `arguments` object for new code. Use async functions for promise-based sequential logic, generators for lazy synchronous sequences, and async generators for lazy asynchronous sequences. Avoid the Function constructor unless dynamic code generation is truly required.

# What later lessons cover

The concepts lesson compares callable forms and traces argument initialization. Reference lessons enumerate all forms, parameter/argument mechanisms, and call/return/composition behavior. Practice predicts scope, defaults, actual arguments, and completion outcomes. Interview questions emphasize choosing a function form and explaining edge cases.

# Sources

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [MDN: Functions guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
- [MDN: Function reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions)
