<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript declarations, bindings, scope, and closures — Interview questions and reasoning

## Core questions

1. How do `var`, `let`, and `const` differ in scope, initialization, and reassignment?
2. What is the temporal dead zone, and does `typeof` avoid it?
3. What does “hoisting” describe, and why is the metaphor incomplete?
4. How does lexical scope differ from dynamic scope?
5. What is a closure, and does it capture a value snapshot?
6. Why do closures in a `let` loop often behave differently from closures in a `var` loop?
7. How do global classic scripts and modules expose top-level declarations?
8. What are Environment Records, and can application code inspect them?

## Concise interview answers

1. `var` is function/global-script scoped and is initialized to undefined during instantiation. `let` and `const` are lexical and remain uninitialized until declaration evaluation. `let` is reassignable; `const` is not.
2. It is the interval between establishing a lexical binding and initializing it. Reads throw `ReferenceError`, including `typeof` on that in-scope binding.
3. It informally refers to binding creation/initialization before ordinary statement execution. Declarations are not all moved or initialized the same way; scopes and declaration kinds matter.
4. Lexical lookup follows where the code was written. Dynamic scope would follow callers on the runtime call stack; JavaScript identifier lookup does not.
5. A closure is a function with access to its defining lexical environment. It observes the current value of captured bindings rather than freezing a snapshot.
6. A `let` loop creates per-iteration bindings. A `var` loop has one shared binding, so callbacks invoked later all see its final value.
7. Classic-script top-level declarations use a Global Environment Record with object and declarative components. Module declarations are module-local and are not properties of `globalThis`.
8. They are specification abstractions that model bindings and outer links. Ordinary source code cannot inspect an Environment Record directly.

## Deep follow-up answers

**Why can `var x` be read before its line?** Declaration instantiation creates and initializes the binding to undefined before execution reaches the declaration. The assignment expression still runs at its textual execution point.

**Why does a lexical read before the declaration throw?** The binding is established for its scope but left uninitialized until declaration evaluation. A read in this temporal dead zone is an error; `typeof` only has special behavior for an unresolvable reference, not an uninitialized lexical binding.

**Does `const` make a referenced object constant?** It makes the identifier binding non-reassignable. Properties of the referenced object may still change unless separate object operations prevent mutation.

**What exactly does a closure retain?** Semantically it retains access to the lexical environment and bindings needed by its behavior. The specification does not dictate physical memory layout or require retaining every source-level local variable. Reachable objects can remain alive, so closure lifetime still matters for application memory.

**Are block function declarations always portable?** Modern semantics make them block-scoped, but Annex B defines limited web-compatibility extensions in eligible non-strict scripts. A robust explanation names the context instead of asserting universal whole-program hoisting.

## Scenario questions

1. A callback inside a loop prints the same final index several times. Explain the shared binding and repair it with a per-iteration lexical binding.
2. `typeof account` throws even though the code uses `typeof`. Determine whether `account` is an unresolvable name or in a lexical TDZ.
3. `globalThis.config` is undefined while an unqualified `config` identifier works in a classic script. Explain the global environment's split binding components.
4. A module cannot access a variable declared at the top level of another module. Explain module-local scope and how export/import bindings connect them.
5. A `const` reference's object changes despite no reassignment. Explain binding immutability versus object mutability.

## Tradeoffs and alternatives

Use `const` for stable bindings and `let` for intentional reassignment. Use narrow lexical scopes to reduce accidental sharing. Closures work well for callbacks and encapsulated state, while explicit parameters and returned data can make dependencies easier to inspect. If independent iterations are intended, prefer `let`, `for...of`, or a higher-order array operation rather than a shared `var`. Treat Environment Record vocabulary as a model for reasoning, not as a reflective API.

## Common weak answers

- “`let` is not created until its source line.” The binding exists earlier but is uninitialized.
- “`typeof` never throws.” It throws for a lexical TDZ binding.
- “`const` makes the value immutable.” It prevents rebinding.
- “A closure saves the value present when it was created.” It accesses bindings that can change.
- “Every top-level name is a global-object property.” The global environment has multiple components and modules are separate.
- “Hoisting means the compiler moves all declarations to the top.” Binding instantiation and initialization differ by declaration kind and scope.
- “Closures always cause memory leaks.” They can extend object reachability, but retention depends on what remains reachable and implementation details.

## Self-check rubric

Score 0 (missing), 1 (partly correct), or 2 (clear and accurate): `var` versus lexical binding; TDZ including `typeof`; const binding/object distinction; lexical lookup; live closure binding; loop iteration environments; global-script/module distinction; declaration-instantiation terminology. Strong answers score at least 13/16 and explicitly distinguish binding creation from initializer execution.

## Sources

- [ECMAScript 2026: Executable Code and Execution Contexts](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)
- [ECMAScript 2026: Declarations and the Variable Statement](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [ECMAScript 2026: Scripts and Modules](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html)
- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures)
