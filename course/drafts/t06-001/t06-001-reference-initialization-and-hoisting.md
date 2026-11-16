<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript declarations, bindings, scope, and closures — Reference: Declaration instantiation and initialization behavior

# Scope and version

This reference covers the eight supplied declaration-instantiation, initialization, and hoisting terms for ECMAScript 2026. “Hoisting” is used only as informal shorthand; the specification distinguishes binding creation, initialization, and execution of initializers. See [ECMAScript declarations](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html), [ECMAScript scripts and modules](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html), and [MDN `let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let).

# How this group fits the mental model

Before a code region executes, its declarations can establish bindings. Some bindings are immediately initialized to `undefined` or to a function object; lexical declarations remain unavailable until their evaluation point. This is why a declaration can be visible to scope analysis before a successful read is possible.

# Supplied names explained

- `Declaration instantiation` — The specification process that determines and creates bindings before executing a Script, Module, function body, or other code region. It checks declaration conflicts and initializes some declaration kinds. It is not source text being physically moved.
- `function declaration hoisting` — Informal shorthand for function declarations being instantiated and initialized according to their containing scope before ordinary statement execution. Calling one before its textual location often works, but scope matters: a block function is not universally a top-level binding, and Annex B may add legacy behavior in eligible non-strict scripts.
- `var binding initialization` — A `var` binding is created and initialized to `undefined` as part of variable declaration instantiation. Its initializer expression executes only when control reaches the declaration. Thus a read before the statement produces `undefined`, while side effects in an initializer have not happened yet.
- `lexical binding initialization` — A `let`, `const`, or class binding is created for its lexical scope but remains uninitialized until its declaration is evaluated. Initializer evaluation occurs then. `let x;` initializes `x` to undefined when reached; `const` requires an initializer in ordinary declaration syntax.
- `temporal dead zone` — The interval after a lexical binding is established for its scope and before it is initialized. Reading the binding in this interval throws `ReferenceError`; `typeof` also throws for that in-scope uninitialized binding. A truly unresolvable identifier is a different case.
- `re-declaration early errors` — Static syntax checks reject conflicting declarations before executing the code, such as duplicate `let` in one lexical scope or a lexical declaration conflicting with a `var` declaration in the same applicable script/function scope. Separate nested blocks may declare shadowing names. `var` redeclarations are often permitted, but not through every lexical conflict.
- `global object binding for var` — In classic Script global declaration instantiation, eligible top-level `var` bindings use the global environment's object component and are normally exposed as properties of the global object. Existing non-configurable properties and declaration checks can prevent a declaration; modules and wrapped script environments differ.
- `global lexical binding` — A top-level `let`, `const`, or class binding in a classic Script is maintained by the global environment's declarative component, not as a property on the global object. It can conflict with later global declarations even though `globalThis.name` does not expose it.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `Declaration instantiation` vs execution of initializer | Instantiation establishes bindings; the initializer's expression runs when its declaration executes. |
| `var binding initialization` vs `lexical binding initialization` | `var` starts as undefined; lexical bindings start uninitialized and reject access in the TDZ. |
| `function declaration hoisting` vs `var` behavior | Function declarations are initialized to function objects per scope rules; `var` initializes to undefined, then may receive a later assignment. |
| `global object binding for var` vs `global lexical binding` | Object component/property interaction versus declarative component binding. |
| `re-declaration early errors` vs runtime assignment | A syntax error prevents execution; assignment changes an already initialized mutable binding at runtime. |

# Examples

```js
console.log(typeof earlyVar); // "undefined"
var earlyVar = "now initialized by assignment";

// console.log(typeof laterLexical); // ReferenceError: TDZ, not "undefined"
let laterLexical = 1;
```

```js
function outer() {
  // The `var` binding is initialized, although its initializer has not run.
  console.log(value); // undefined
  if (false) {
    var value = 8;
  }
}
outer();
```

The braces do not make `value` block-scoped. The binding belongs to `outer`'s variable environment; the initializer is unreachable, so its value remains undefined.

In a classic browser script, `var` can interact with global-object properties, while `let` uses a separate global lexical binding. Do not copy classic-script snippets into modules and assume the same global behavior.

# Common mistakes

- Explaining hoisting as if source statements are textually moved.
- Assuming `var x = expression` evaluates the expression before earlier statements run.
- Saying a lexical name does not exist in the TDZ rather than saying it exists but is uninitialized.
- Assuming `typeof` suppresses every `ReferenceError`.
- Assuming `function f` inside any braces creates a whole-program function binding.
- Treating a global lexical binding as a global-object property.
- Assuming all redeclarations fail or all redeclarations succeed; binding kind and scope determine early errors.
- Confusing a redeclaration `SyntaxError` with a runtime assignment `TypeError`.

# Knowledge checks with answers

1. **Why can `console.log(x); var x = 4;` log undefined?** The binding is initialized to undefined before statement execution, but assignment waits until that declaration is reached.
2. **What does `typeof x` do when `let x` is in the current TDZ?** It throws `ReferenceError`.
3. **Does `function f(){}` inside a block always become global?** No; modern block semantics scope it to the block, subject to limited Annex B web compatibility in eligible scripts.
4. **Can a global-script top-level `let` be read as `globalThis.x`?** No.
5. **When does `let x;` initialize `x`?** When execution evaluates the declaration, at which point its value becomes undefined.

# Sources

- [ECMAScript 2026: Declarations and the Variable Statement](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [ECMAScript 2026: Scripts and Modules](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html)
- [MDN: `let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
- [MDN: `var`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)
