<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript declarations, bindings, scope, and closures — Core concepts and how they fit together

# Learning objectives

Explain the difference between declaration and initialization; compare `var`, `let`, `const`, function, class, script-global, and module bindings; trace lexical name resolution; explain the temporal dead zone and common redeclaration errors; and reason about closures as access to live lexical bindings.

# Prerequisites

Know identifiers, expressions, functions, blocks, objects, and basic control flow. A **binding** associates an identifier with a value location. A **scope** determines where that identifier can be resolved. Initialization gives a newly created binding its first value.

# Core concepts

## A binding is created before it is necessarily initialized

JavaScript parses declarations and establishes bindings according to the containing code's declaration-instantiation rules. `var` bindings are initialized to `undefined` during instantiation. Their assignment expression runs only when control reaches the declaration:

```js
console.log(status); // undefined
var status = "ready";
console.log(status); // "ready"
```

`let`, `const`, and class declarations also have bindings established for their lexical scope, but those bindings remain uninitialized until the declaration is evaluated. Accessing one before then throws `ReferenceError`. This interval is called the **temporal dead zone (TDZ)**:

```js
// console.log(mode); // ReferenceError, even though the declaration is below
let mode = "fast";
```

`typeof` does not rescue a read of a lexical name in its TDZ. This differs from `typeof` on a truly undeclared identifier, which returns the string `"undefined"`.

## Scope follows syntax, not the call stack

Lexical scope is determined by where code is written. Identifier lookup starts in the current environment and follows outer-environment links; a function called by another function does not gain access to the caller's locals merely because of that call. It can access names from its own lexical surroundings.

`var` is scoped to the nearest function or, in a classic script, the script's variable environment; blocks such as `if` and `for` do not contain it. `let` and `const` are block-scoped. A `for (let i = ...)` loop gets per-iteration bindings so closures can remember their iteration values. A `for (var i = ...)` loop uses one shared function/global binding.

```js
const callbacks = [];
for (let i = 0; i < 3; i += 1) callbacks.push(() => i);
console.log(callbacks.map(callback => callback())); // [0, 1, 2]
```

Each callback resolves the per-iteration `i` binding. Replacing `let` with `var` makes each callback resolve the same binding, which is `3` when the callbacks are called after the loop.

## `const` protects the binding, not an object graph

`const` requires initialization (with specific grammar forms such as `for (const item of iterable)` where the loop supplies the per-iteration initialization). It prevents later assignment to that binding; it does not deep-freeze its value:

```js
const settings = { theme: "light" };
settings.theme = "dark"; // allowed
// settings = {};         // TypeError
```

Choose `const` or `let` based on reassignment, not on whether the referenced data can change. `Object.freeze` is a separate, shallow object operation and is outside this topic.

## Functions close over their lexical environment

A closure lets a function keep resolving bindings from the place it was created, even after that outer invocation returns. It captures access to bindings, not automatically a snapshot of their current values:

```js
function makeReader() {
  let current = "first";
  return {
    read: () => current,
    update: value => { current = value; },
  };
}
const reader = makeReader();
reader.update("second");
console.log(reader.read()); // "second"
```

The closures share the same `current` binding. When a closure retains a large object or a DOM node, that reachable state may remain alive; avoid retaining more than needed. Engines may optimize storage, so a closure's language semantics do not require physically preserving every local variable.

## Global scripts and modules are different environments

A classic script's global environment has an object component and a declarative component. Top-level `var` and eligible function declarations can interact with the global object, subject to global declaration checks; top-level `let`, `const`, and `class` create global lexical bindings that are not properties of `globalThis`. A module instead has a module environment: its top-level declarations are module-local, and modules are strict. Imported bindings are live read-only views of exports, not ordinary copied local values.

Consequently, `globalThis.name` is not a reliable way to inspect every global binding. Environment Record terminology in the specification describes the semantics; ordinary JavaScript does not expose these records as objects.

## “Hoisting” is shorthand, not a complete rule

The word often hides two separate operations: a binding is established before a region executes, and some declaration kinds initialize their binding during instantiation. `var` is initialized to `undefined`; function declarations are initialized according to their scope; lexical declarations remain uninitialized until evaluated. There is no single “move every declaration to the top” transformation.

Function declarations in blocks are block-scoped in modern semantics. Annex B adds selected web-compatibility behavior for eligible non-strict scripts, so examples that work in a browser classic script may differ from modules or strict code. Prefer explicit blocks and avoid relying on Annex B behavior.

# Mechanisms and relationships

| Mechanism | Binding scope | State before declaration executes | Reassignment |
| --- | --- | --- | --- |
| `var x` | Nearest function or global-script variable environment | Initialized to `undefined` | Allowed |
| `let x` | Lexical block/loop/switch scope | Exists but is uninitialized (TDZ) | Allowed after initialization |
| `const x = value` | Lexical block/loop/switch scope | Exists but is uninitialized (TDZ) | Binding cannot be reassigned |
| `function f() {}` | Containing declaration scope | Instantiated per scope rules | Binding rules depend on scope/form |
| `class C {}` | Lexical scope | Exists but is uninitialized (TDZ) | Binding cannot be reassigned |
| Module declaration | Module environment | Determined by declaration kind | Not a global-object property |

# Worked examples

```js
function makePair(initial) {
  let value = initial;
  return {
    get: () => value,
    set: next => { value = next; },
  };
}

const pair = makePair(10);
pair.set(12);
console.log(pair.get()); // 12
```

`makePair` creates a new lexical environment for each call. Both arrows resolve the `value` binding in that environment. Assigning a new value updates that binding, so the reader observes the change.

# Misconceptions and edge cases

- “`let` does not exist before its line.” The binding exists but is uninitialized in the TDZ.
- “`typeof` is always safe for an unavailable name.” A lexical binding in its TDZ throws.
- “`const` makes an object immutable.” It prevents reassignment of the binding only.
- “`var` is block-scoped.” It uses a function/global variable environment.
- “Closures capture a value snapshot.” They normally retain access to the binding and see later assignments.
- “Every top-level binding is on `globalThis`.” Script globals are split across environment components; modules are module-scoped.
- “All function declarations behave identically in blocks, scripts, and modules.” Scope and Annex B legacy rules matter.
- “A closure necessarily keeps every local variable physically allocated.” That is not a language guarantee; observable reachable bindings must behave correctly.
- `const` without an initializer is invalid in an ordinary declaration, but `for (const item of iterable)` is valid because each iteration supplies its binding value.
- A lexical declaration cannot be the unbraced body of an `if` or loop statement; use a block.

# Knowledge checks with answers

1. **What does `var x; console.log(x);` print?** `undefined`; the binding is initialized before execution reaches the declaration.
2. **What does reading a `let` before its declaration do?** It throws `ReferenceError` during the TDZ.
3. **Can a `const` object property change?** Yes, unless the object is separately made non-writable/frozen by an applicable operation.
4. **Why do closures in a `let` loop often see distinct values?** Each iteration has its own lexical binding.
5. **Does a module's top-level `const config` become `globalThis.config`?** No.
6. **Does a closure save the value that a captured `let` had when the closure was created?** No; it accesses the binding, which can later be assigned.

# Sources

- [ECMAScript 2026: Executable Code and Execution Contexts](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)
- [ECMAScript 2026: Declarations and the Variable Statement](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [ECMAScript 2026: Scripts and Modules](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html)
- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures)
