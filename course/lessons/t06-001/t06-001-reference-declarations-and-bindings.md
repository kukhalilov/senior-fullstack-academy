
# JavaScript declarations, bindings, scope, and closures — Reference: Declaration forms and binding kinds

# Scope and version

This reference explains the ten supplied declaration and binding names for ECMAScript 2026. It distinguishes declaration syntax from the environment and initialization behavior it produces. See [ECMAScript declarations](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html), [ECMAScript scripts and modules](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html), and [MDN closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures).

# How this group fits the mental model

Declarations establish identifiers in a scope; execution initializes lexical bindings and evaluates initializer expressions. The same familiar word “global” can mean a classic script's global environment or a module's separate environment, so context matters when reasoning about browser properties and cross-file visibility.

# Supplied names explained

- `var declaration` — `var count = 0;` declares in the nearest function variable environment or the global script variable environment. It is not limited by braces such as `if` or `for`. Its binding is initialized to `undefined` during instantiation, while the assignment to `0` occurs when execution reaches it. Repeated `var` declarations of the same binding are generally permitted within applicable scopes.
- `let declaration` — `let count = 0;` declares a mutable lexical binding in the current block, loop, or switch lexical scope. It cannot be read until initialization at the declaration is evaluated. A block can define a distinct same-named `let` binding inside a nested scope.
- `const declaration` — `const endpoint = value;` creates a lexical binding that must be initialized as part of the declaration and cannot later be reassigned. Its value may refer to a mutable object; the declaration does not freeze that object. `for (const item of iterable)` and `for (const key in object)` are valid because the iteration mechanism initializes a fresh binding each time.
- `function declaration` — A declaration such as `function parse(text) {}` creates a function binding under the rules for its containing scope. A top-level module declaration is module-local; a classic-script top-level declaration participates in global declaration instantiation. Block function declarations are block-scoped in modern semantics, with selected Annex B compatibility behavior in eligible non-strict web scripts.
- `class declaration` — `class Model {}` creates a lexical class binding. The binding is in its TDZ until evaluation of the class declaration. The class's internal name and the outer binding are related but not identical in every expression/declaration form; detailed class internals are in t06-018.
- `lexical declaration` — The grammar category containing `let`, `const`, and class declarations. Lexical declarations are scoped to a lexical environment and participate in early-error checks for conflicting declarations. They cannot appear as the unbraced direct body of a single-statement control-flow clause; write a block.
- `variable declaration` — The grammar/API-level declaration grouping covering `var` declarations and, broadly, declarations that bind variable names. In everyday discussion, distinguish `var` declarations from lexical declarations because their scope and initialization differ. A declaration without an initializer does not mean every binding type begins in the same state.
- `binding identifier` — A name introduced by a binding position, for example `item` in `let item = value`, a function name, or a parameter. It is different from an arbitrary identifier reference that reads an existing binding. Destructuring can introduce multiple bound names; its detailed patterns belong with binding-pattern/parameter topics.
- `global declaration` — A declaration evaluated at the top level of a classic Script using a Global Environment Record. Global declaration instantiation checks conflicts before execution. Eligible top-level `var` and function bindings can be represented on the global object's object component; lexical declarations use the declarative component instead. This term does not mean every such name is a property of `globalThis`.
- `module-level declaration` — A declaration at the top level of a Module. It is bound in that module's Module Environment Record and is not installed as a property on the global object. Imports are live read-only bindings to exports. Modules are strict code and each module has its own scope.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `var declaration` vs `let declaration` | Variable-environment/function scope and early `undefined` initialization versus block lexical scope and TDZ initialization. |
| `let declaration` vs `const declaration` | Both are lexical; `let` permits rebinding and may omit its initializer in ordinary declarations, while `const` requires initialization and forbids rebinding. |
| `global declaration` vs `module-level declaration` | Classic-script global environment and its object/declarative split versus module-local bindings. |
| `function declaration` vs `class declaration` | Function initialization follows function-declaration instantiation rules; class declarations remain uninitialized until evaluated and are lexical. |

# Examples

```js
function example() {
  if (true) {
    var shared = "function scoped";
    let local = "block scoped";
  }
  console.log(shared); // "function scoped"
  // console.log(local); // ReferenceError: outside the block
}
```

In a classic script, test the global distinction in a fresh page/script context:

```js
var scriptVar = 1;
let scriptLexical = 2;
console.log(globalThis.scriptVar);     // normally 1 in a browser classic script
console.log(globalThis.scriptLexical); // undefined
```

Do not reuse this expectation for modules or for environments that wrap scripts differently. `globalThis` is the standardized global-this value; not every binding in the global environment is a property on it.

# Common mistakes

- Assuming braces scope `var`; only function/global variable environments do.
- Assuming `const` deeply freezes the object it references.
- Calling every top-level declaration a global-object property.
- Applying browser classic-script global rules to ES modules or CommonJS wrappers.
- Describing block function declaration behavior without the modern block rule and Annex B boundary.
- Treating “declaration” and “initialization” as one moment for every binding kind.
- Assuming redeclaring a lexical binding in the same scope is allowed because `var` redeclarations often are.

# Knowledge checks with answers

1. **Can `var` be read before its initializer runs?** Yes; the binding already contains `undefined`.
2. **Can a normal `const x;` declaration omit its initializer?** No; iteration forms are a separate grammar case.
3. **Does a module-level `function run(){}` become `globalThis.run`?** No.
4. **Is `class` declaration a `var` binding?** No; it is lexical and has TDZ behavior.
5. **Does `let` introduce a binding when parsing/instantiating its scope?** Yes, but the binding is uninitialized until declaration evaluation.

# Sources

- [ECMAScript 2026: Declarations and the Variable Statement](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [ECMAScript 2026: Scripts and Modules](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html)
- [MDN: `let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let)
- [MDN: `var`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)
- [MDN: `const`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const)
