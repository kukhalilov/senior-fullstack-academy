
# JavaScript declarations, bindings, scope, and closures — Big-picture orientation and mental model

# Problem and purpose

JavaScript must decide which declaration a name refers to, when that name becomes readable, and how long an inner function can keep using values from its surrounding code. These rules determine whether a value is shared or isolated, whether a read throws, and whether callbacks in loops see the intended iteration.

# Plain-language mental model

Think of each scope as a set of named storage locations. A declaration chooses a scope and creates a binding there. Some declarations create their binding before the code runs; others also leave it unavailable until execution reaches the declaration. A closure is a function that continues resolving names through the lexical surroundings where the function was created.

The key distinction is **binding versus value**. A `const` binding cannot be reassigned, but an object stored in it can still change. A closure usually refers to a binding, not a frozen copy of the value that binding held at function-creation time.

# How the parts fit together

1. Parsing identifies declarations and their containing scopes.
2. Before the relevant code executes, declaration-instantiation rules create bindings and initialize some of them.
3. Execution evaluates initializers and statements; a lexical binding is unavailable until initialized.
4. When code reads an identifier, lexical resolution searches the current environment and then its outer environments.
5. A nested function uses the lexical environment where it was created, even if it is invoked later from elsewhere.
6. Global scripts and modules have different top-level binding rules; do not assume every top-level name is a property on `globalThis`.

# Concept map

| Declaration / context | Scope and initialization | Common gotcha |
| --- | --- | --- |
| `var` | Function or global-script variable environment; initialized to `undefined` during instantiation | A block does not contain it; initializer still waits until execution reaches it |
| `let` | Lexical scope; uninitialized until declaration evaluation | Reading earlier in the scope's temporal dead zone throws |
| `const` | Lexical scope; initialized once | Object contents can still mutate |
| `function` declaration | Binding established according to containing syntactic scope | Block functions and legacy browser-script rules make “hoisted to the top” too vague |
| Module-level declaration | Module-local environment | Not a property of `globalThis`; modules are strict |
| Closure | Function plus access to its defining lexical environment | Reads live bindings; `var` loop callbacks can share one changing binding |

# End-to-end walkthrough

```js
function makeCounter(start) {
  let value = start;
  return {
    next() {
      value += 1;
      return value;
    },
    current() {
      return value;
    },
  };
}

const first = makeCounter(4);
console.log(first.next(), first.current()); // 5 5
```

Each call to `makeCounter` creates a distinct local `value` binding. The returned methods keep resolving that binding after the outer call has finished. They share it with one another, so the second method sees the update made by the first.

# When to use it and tradeoffs

Use `const` by default when a binding will not be reassigned, `let` when it must change, and `var` mainly when maintaining code that depends on its older function/global scope behavior. Keep scopes small and make initialization order clear. Closures are useful for callbacks, factories, and private state; they can also retain data longer than expected, so avoid capturing large or mutable state without a reason.

# What later lessons cover

The concepts lesson traces declaration creation, initialization, name resolution, and closure capture. The reference lessons enumerate declaration kinds, the specification's environment categories, and hoisting/TDZ/global binding rules. Practice focuses on output prediction and repair; interview prompts focus on explaining edge cases precisely.

# Sources

- [ECMAScript 2026: Executable Code and Execution Contexts](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)
- [ECMAScript 2026: Declarations and the Variable Statement](https://tc39.es/ecma262/2026/multipage/ecmascript-language-statements-and-declarations.html)
- [ECMAScript 2026: Scripts and Modules](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html)
- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures)
