
# JavaScript declarations, bindings, scope, and closures — Reference: Scope, environments, and closure behavior

# Scope and version

This reference explains the fifteen supplied environment, scope, and closure terms for ECMAScript 2026. Environment Record names are specification concepts for describing identifier bindings; source code cannot access an Environment Record directly. See [ECMAScript execution contexts and Environment Records](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html) and [MDN closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures).

# How this group fits the mental model

An Environment Record stores or provides access to bindings for a particular execution region. Lexical environments link the current record to an outer one, enabling lexical name lookup. A function's closure semantics preserve access to the lexical surroundings where that function was created, even if the function is called later.

# Supplied names explained

- `Global Environment Record` — The global environment used to evaluate a Script. It combines an Object Environment Record associated with the global object and a Declarative Environment Record for global lexical declarations. The record also tracks global declaration names and checks conflicts. This split explains why `globalThis.x` does not expose every global identifier.
- `Module Environment Record` — A Declarative Environment Record specialized for module code. It provides the module's local bindings and imported bindings; imports are live, immutable indirect bindings to exports, not copied values. Each module has its own environment and strict-mode semantics.
- `Function Environment Record` — The function-call environment record used for function-specific state, including `this`/`super`/`new.target` behavior and arguments where applicable, with bindings for parameters and function-scoped declarations. Exact function forms differ; arrows do not create all of the ordinary-function-specific bindings.
- `Declarative Environment Record` — A binding store for declarations such as lexical declarations, function-related names, and catch parameters. It models name-to-binding associations rather than requiring one property per binding on an object.
- `Object Environment Record` — An Environment Record that uses an object as the binding source. It is used for the object component of the global environment and for `with` semantics in eligible non-strict code. `with` is forbidden in strict code and is generally avoided because it makes lookup difficult to reason about.
- `Lexical Environment` — Specification machinery that pairs an Environment Record with a reference to an outer lexical environment. Execution contexts use these links to resolve names. It is not an inspectable JavaScript object or a promise about an engine's physical memory layout.
- `Variable Environment` — The execution-context environment used to determine where `var` and certain function declarations are instantiated. It often corresponds to a function scope or a global script's variable scope. It may differ from the current Lexical Environment when blocks introduce lexical declarations.
- `lexical scope` — The source-code-based region where a lexical binding can be referenced, such as a block, loop, switch, catch block, function, or module. Lookup follows enclosing lexical structure, not the caller's dynamic stack.
- `block scope` — Scope introduced by a statement block for `let`, `const`, class, and block-level function declarations. `var` is not contained by an ordinary block. A switch statement has one lexical scope for its clauses, so brace case bodies when independent lexical scopes are required.
- `function scope` — Scope of `var` declarations associated with a function's variable environment. Nested functions create their own call environments; blocks inside a function do not create new `var` scope. Top-level classic scripts also have global variable scope, and module top levels are module scope.
- `scope chain` — Informal name for the lexical environments searched when resolving an identifier: current environment, then outer environment, until resolution succeeds or the reference is unresolvable. A local binding shadows an outer binding with the same name.
- `outer environment reference` — The link from an Environment Record to its enclosing lexical environment. It represents lexical nesting. If no outer environment exists, the link is null. This is specification vocabulary, not a JavaScript property.
- `closure` — The combination of a function object and its lexical access to surrounding bindings. A closure lets a function use outer locals after the outer call returns. It does not freeze every captured value at function creation; reads normally consult the binding's current value.
- `captured binding` — A binding accessible to a nested function through its lexical environment. If the binding is reassigned, a closure reading it can observe the new value. Capturing an object binding also means observing the same object identity unless the program explicitly copies it.
- `live lexical binding` — A lexical binding whose current value is consulted when referenced. This is a useful description of closures and especially module imports, whose imported bindings reflect exporter updates while remaining non-assignable by the importer.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `Lexical Environment` vs `Environment Record` | The lexical environment includes a record and an outer link; the record holds/provides the bindings. |
| `Variable Environment` vs `Lexical Environment` | Variable Environment determines `var`/function instantiation; Lexical Environment also tracks the current nested lexical scope. |
| `Global Environment Record` vs `Module Environment Record` | Script-global environment includes object and declarative components; a module has module-local declarative bindings. |
| `closure` vs `captured binding` | Closure describes the function's preserved lexical access; a captured binding is one of the names it can access. |
| `function scope` vs `block scope` | `var` scope follows the function/global variable environment; lexical declarations follow explicit blocks/loops/etc. |

# Examples

```js
function makeState(initial) {
  let state = initial;
  return {
    read() { return state; },
    write(next) { state = next; },
  };
}
const state = makeState("draft");
state.write("published");
console.log(state.read()); // "published"
```

Both methods resolve the same captured binding. They are not reading two copies of the initial string.

```js
const readers = [];
for (let index = 0; index < 3; index += 1) {
  readers.push(() => index);
}
console.log(readers.map(read => read())); // [0, 1, 2]
```

The loop's per-iteration lexical binding gives each closure a distinct `index`. With `var`, all three closures would access one shared binding after the loop.

# Common mistakes

- Treating Environment Records as objects available through reflection.
- Saying closures snapshot values; closure behavior follows bindings.
- Saying closures use the caller's locals; lookup is lexical, not dynamic.
- Assuming all global names are properties of the global object.
- Assuming every function form creates an ordinary function environment with the same bindings.
- Assuming lexical scope means every variable is physically retained in memory; implementation storage is not specified.
- Using `with` as normal scope control; it is strict-mode-incompatible and obscures resolution.

# Knowledge checks with answers

1. **Can source code evaluate `someFunction.[[Environment]]`?** No; internal slots and Environment Records are not ordinary properties.
2. **Which binding does a closure use when the caller has a same-named local?** Its lexically enclosing binding, unless a nearer binding inside the closure shadows it.
3. **Do two closures from one factory call necessarily share a captured binding?** If both close over that same binding, yes; separate factory calls create separate call environments.
4. **Is an imported module binding assignable by the importer?** No; it is an immutable indirect binding whose observed export value can be live.
5. **Does a block contain `var`?** No; it remains in the applicable variable environment.

# Sources

- [ECMAScript 2026: Executable Code and Execution Contexts](https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html)
- [ECMAScript 2026: Scripts and Modules](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html)
- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures)
