
# JavaScript function forms, parameters, and return behavior — Interview questions and reasoning

## Core questions

1. How do function declarations and expressions differ in binding and evaluation?
2. When is an arrow appropriate, and what capabilities does it lack?
3. Which values activate a default parameter, and how are initializers evaluated?
4. How do rest parameters and `arguments` differ, including mapped arguments rules?
5. What does a function's `.length` describe, and does it constrain calls?
6. What values result from an explicit return, fall-through, or a line break after `return`?
7. What does an async function, generator, or async generator call return immediately?
8. What scope does a function created with the `Function` constructor use?

## Concise interview answers

1. A declaration creates a binding according to its scope and declaration-instantiation rules. An expression evaluates to a function value. A named expression's internal name supports self-reference without creating an equivalent outer binding.
2. Arrows inherit surrounding `this` and related lexical behavior, have no own `arguments`, are not constructible, and lack an own `.prototype`. Use ordinary functions/methods when dynamic `this` or construction is needed.
3. Only absent/undefined arguments trigger defaults. Initializers run left-to-right; an earlier initializer cannot read a later parameter before initialization.
4. Rest is a real Array of trailing arguments. `arguments` is array-like and contains all supplied arguments; mapping occurs only for non-strict ordinary functions with simple parameter lists. Arrows have no own arguments object.
5. It is descriptive metadata, generally counting formal parameters before the first default or rest parameter. It does not impose a call arity check.
6. A value expression is returned; bare return and fall-through produce undefined. A line terminator directly after return ends that return statement.
7. Async functions return Promises; generators return suspended generator objects; async generators return async generator objects.
8. The generated function uses the global environment rather than closing over the caller's local lexical environment.

## Deep follow-up answers

**Are all function declarations hoisted to the top of a script?** No. Binding and initialization depend on the declaration's containing scope and form. Block-level declarations, module semantics, and Annex B web-legacy rules make a blanket statement inaccurate.

**Can an earlier default refer to a later parameter?** It can contain such a reference syntactically, but evaluating it before the later binding initializes throws a `ReferenceError`. A later initializer may use an earlier initialized parameter.

**Why are mapped arguments surprising?** In a non-strict ordinary function with a simple parameter list, formal parameters and certain indexed properties of the arguments object are linked. Strict mode and non-simple lists use an unmapped object, so changing one does not update the other. Prefer rest parameters for new variadic APIs.

**Does an async function returning a Promise return that same raw value?** The async call returns a Promise and adopts the returned value's eventual state through Promise resolution/thenable assimilation; a thrown exception becomes a rejection.

**Why avoid `Function` for ordinary program logic?** It parses strings dynamically, cannot capture caller locals, can conflict with CSP, and makes code harder to analyze and optimize. Lexical closures express local dependencies directly.

## Scenario questions

1. A callback reads the wrong `this`. Explain when an arrow fixes the issue and when it would hide a needed dynamic receiver.
2. An API defaults a parameter for `null` as well as `undefined`. Explain why a parameter initializer alone does not meet that requirement.
3. A helper's `arguments[0]` seems to change when a formal parameter is assigned. Identify the mode and parameter-list conditions.
4. A function's `.length` is 1 although it declares more parameters. Explain the default/rest boundary and why this does not reject extra call arguments.
5. A caller expects a generator call to produce the first value immediately. Explain the suspended-start behavior and the role of `.next()`.
6. Dynamically created code cannot see a local variable. Explain the Function constructor's environment choice.

## Scenario answers

1. An arrow inherits lexical `this`, which helps when a callback should retain its surrounding receiver. Use an ordinary function or concise method when the API should supply a dynamic receiver; arrows cannot be rebound with `call`/`apply` and are not constructors.
2. A default parameter applies only when the argument is absent or `undefined`. To default both nullish values, use a body check or `value ?? fallback`.
3. The aliasing behavior occurs in a non-strict ordinary function with a simple parameter list. Strict functions, modules, arrows, and non-simple parameter lists do not provide a mapped arguments object in that way.
4. `.length` counts formal parameters only up to the first default initializer or rest parameter. It is metadata and does not enforce arity; actual supplied count is available as `arguments.length` in an ordinary function.
5. Calling a generator creates a generator object in the suspended-start state; the body begins when `.next()` (or another generator method) resumes it.
6. `Function` constructor source is compiled against the function's realm global environment, not the caller's lexical scope, so it cannot capture caller-local bindings.

## Tradeoffs and alternatives

Arrows are concise and preserve lexical context, but are poor substitutes for methods that need dynamic receivers or constructors. Rest parameters are explicit and array-friendly, while `arguments` exposes all actual arguments and retains legacy mapped behavior under narrow conditions. Named function expressions provide a stable self-reference; a declaration may be clearer for a top-level operation. Async and generator forms represent different control-flow contracts, so choose according to whether the caller consumes a Promise or iterator. Avoid choosing solely by syntax length.

## Common weak answers

- “All functions have their own `this` and `arguments`.” Arrows do not.
- “A default applies to every falsy value.” It applies only to `undefined`.
- “Rest and `arguments` are interchangeable.” Their shape, coverage, and mapping differ.
- “`.length` tells you how many arguments a call must provide.” Calls are not arity-checked that way.
- “Async functions return the raw value.” They return a Promise.
- “A generator runs when called.” Its body begins when the iterator is advanced.
- “Every declaration is hoisted to the top of the script.” Scope and declaration form matter.

## Self-check rubric

Score 0 (missing), 1 (partly correct), or 2 (clear and accurate): function form/binding distinction; arrow capabilities; default initialization; rest/arguments mapping; `.length`; return completion; async/generator return shapes; Function constructor scope. A strong answer scores at least 13/16 and states the conditions for mapped arguments without presenting that behavior as a recommended pattern.

## Sources

- [ECMAScript 2026 functions and classes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [ECMAScript 2026 fundamental objects](https://tc39.es/ecma262/2026/multipage/fundamental-objects.html)
- [MDN: Functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
- [MDN: Default parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters)
- [MDN: The arguments object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments)
