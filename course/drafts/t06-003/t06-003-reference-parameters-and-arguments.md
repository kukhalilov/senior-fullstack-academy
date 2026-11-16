<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript function forms, parameters, and return behavior — Reference: Parameter syntax and argument access

# Scope and version

This reference explains the ten supplied parameter and argument terms in ECMAScript 2026. It contrasts declared parameter bindings with actual call arguments and covers the mapped/unmapped `arguments` distinction. See [ECMAScript functions and parameter lists](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html), [MDN default parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters), and [MDN the arguments object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments).

# How this group fits the mental model

At invocation, JavaScript initializes formal parameter bindings from the supplied argument values, in order. Defaults fill only `undefined`; destructuring unpacks objects/iterables; rest collects remaining actual arguments. The `arguments` object is a separate legacy-like view of actual arguments available to ordinary functions, with linkage behavior depending on strictness and parameter-list shape.

# Supplied names explained

- `Formal parameter` — A binding name/pattern in the function's declared parameter list. It receives the corresponding actual argument value or an initialized default. Extra actual arguments do not create extra named parameters.
- `Simple parameter list` — A list of plain identifiers with no defaults, rest, or destructuring. This syntax affects duplicate-name early errors and, in a non-strict ordinary function, whether the arguments object can be mapped to parameter bindings. Strict code and non-simple lists use unmapped arguments behavior.
- `Default parameter` — A parameter initializer such as `limit = 10`. It runs at each call only when the supplied argument is `undefined` or absent. `null` and other falsy values are kept. Defaults are evaluated left-to-right; earlier parameters are available to later initializers.
- `Rest parameter` — A final parameter written `...items` that gathers remaining actual arguments into a new real Array. It must be last and contains only arguments after preceding formal parameters. In an ordinary function, use `arguments` when you need to inspect every actual argument, including those matched to earlier parameters.
- `Array destructuring parameter` — A pattern such as `[first, second = 0]` that extracts values from an iterable argument into local bindings. If the whole argument can be missing, use a whole-parameter default such as `[first] = []` to avoid trying to destructure `undefined`.
- `Object destructuring parameter` — A pattern such as `{ id, active = true }` that reads named properties into local bindings. The pattern object must be supplied or defaulted; defaults apply to `undefined` property values, not null. Destructuring reads properties and may invoke getters.
- `Parameter initializer` — The expression after `=` in a default parameter. It runs only when needed, at call time, and can refer to earlier parameters. Parameter initializers execute in a separate parameter environment; an earlier initializer cannot access later parameter bindings before initialization.
- `arguments object` — An array-like object created for many ordinary function calls, with indexed actual arguments and a `length`. It is not an Array and has no array methods such as `.map` unless borrowed or converted. Arrows create no own arguments object; they resolve an outer `arguments` binding if one exists.
- `arguments.length` — The number of actual arguments supplied to this invocation, even when fewer or more than the formal parameter count. It is not the declared function's `.length` metadata.
- `arguments.callee (legacy, forbidden in strict mode)` — A deprecated property that once referenced the currently executing function. Access is forbidden in strict mode and throws; do not use it. Name a function for recursion or pass the function explicitly. Avoid `callee` for recursion, stack inspection, or API design.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `Rest parameter` vs `arguments object` | Rest is a real Array of remaining arguments after preceding formals; arguments-like view contains all actual arguments and is not an Array. |
| `Default parameter` vs `Parameter initializer` | The default parameter is the syntactic binding form; its initializer is the expression evaluated when that binding receives undefined. |
| `Array destructuring parameter` vs `Object destructuring parameter` | Array patterns consume indexed/iterable positions; object patterns read named properties. |
| `Simple parameter list` vs non-simple list | Plain identifiers only versus any defaults/rest/destructuring; this changes strictness/arguments behavior and some early errors. |

# Examples

```js
function describe(required, optional = required + 1, ...rest) {
  return {
    required,
    optional,
    rest,
    actual: arguments.length,
  };
}
describe(4, undefined, "x", "y");
// { required: 4, optional: 5, rest: ["x", "y"], actual: 4 }
```

```js
function readOptions({ mode = "safe" } = {}) {
  return mode;
}
readOptions();                 // "safe"
readOptions({ mode: undefined }); // "safe"
readOptions({ mode: null });      // null
```

The outer default handles an absent/undefined whole argument. The inner default handles an undefined property. A null property is an intentional supplied value.

```js
function simple(a) { a = 9; return arguments[0]; }
function withDefault(a = 1) { a = 9; return arguments[0]; }
simple(2);      // in a sloppy classic script: 9 (mapped arguments)
withDefault(2); // 2 (unmapped arguments)
```

The mapped example applies only to a non-strict ordinary function with a simple parameter list. In strict code or module code, the arguments object is unmapped. The second function has a non-simple list because it has a default.

# Common mistakes

- Using `value || fallback` when only missing/undefined should trigger a default; this also replaces `0`, `false`, `""`, and NaN.
- Destructuring a missing whole argument without a default object/array.
- Treating a default initializer as a one-time definition-time expression; it runs per applicable call.
- Forgetting a rest parameter is a real Array but includes only trailing arguments.
- Treating `arguments.length` as declared parameter count or `fn.length`.
- Assuming every ordinary function's `arguments[index]` tracks its parameter. Mapping is limited to non-strict simple-parameter functions.
- Assuming arrows have their own arguments object.
- Using deprecated `arguments.callee` in strict code or recursion.
- Assuming object destructuring copies properties; it reads named properties and may run getters.

# Knowledge checks with answers

1. **Does `x = 5` use 5 when `x` is passed as null?** No; only undefined or a missing argument uses the default.
2. **What is the type of a rest parameter value?** An Array.
3. **What is `arguments.length`?** The number of actual values passed to that ordinary function invocation.
4. **Can an arrow use its own `arguments`?** It creates none; it may resolve one from an enclosing function.
5. **When can changing a parameter update `arguments[0]`?** In a non-strict ordinary function with a simple parameter list, due to mapped arguments semantics.
6. **Why avoid `arguments.callee`?** It is deprecated/forbidden in strict mode and has safer named-function alternatives.

# Sources

- [ECMAScript 2026 parameter lists and function semantics](https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html)
- [MDN: Default parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters)
- [MDN: The arguments object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments)
- [MDN: Functions guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)
