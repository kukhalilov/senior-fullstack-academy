<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# ECMAScript modules, imports, exports, and module loading semantics — Big-picture orientation and mental model

# Problem and purpose

Modules divide a program into files with explicit dependencies and public exports. The loader can build a dependency graph before executing module bodies. This gives tools and hosts a stable structure for resolving dependencies, detecting invalid imports, and evaluating each module according to its place in the graph.

# Plain-language mental model

Think of each module as a room with private local names and selected doors. `export` labels the names available through those doors; `import` connects a local binding to a door in another module. The connection is live: it refers to the exporting module's binding rather than copying its current value. A loader starts from an entry module, finds its dependency graph, links names, then evaluates modules. JavaScript specifies much of linking/evaluation behavior, while the host decides how a module specifier maps to a loaded module.

# How the parts fit together

1. **Declare dependencies.** Static imports and re-exports place requests in the module graph before the importing body runs.
2. **Declare the public interface.** Named/default exports expose bindings; locals that are not exported stay module-private.
3. **Load and link.** The host interprets module specifiers and loads records. Linking resolves each import to an exported binding and creates module environments.
4. **Evaluate.** The graph executes with cycle-aware ordering. A cycle is not automatically an error, but reading a lexical export before initialization can trigger a temporal-dead-zone error.
5. **Load conditionally when needed.** `import()` is an expression returning a promise for a module namespace object; it can be used when a dependency is needed only on a particular path.
6. **Wait for async module work.** Top-level `await` suspends module evaluation; dependent modules wait for asynchronous dependencies.

# Concept map

| Question | Module feature | Main idea |
| --- | --- | --- |
| What can another module access? | Export declaration | Public bindings are explicit |
| Which dependency is needed? | Static import | Declared in the graph before evaluation |
| Need conditional loading? | Dynamic `import()` | Asynchronous expression that resolves to a namespace |
| Is imported data copied? | Live import binding | Reads the exporter’s binding, but cannot be reassigned by importer |
| Why do browsers/Node resolve names differently? | Host loading hook | ECMAScript does not prescribe URL/package lookup rules |
| Need a module-specific URL? | `import.meta` | Host-provided metadata object in module code |

# End-to-end walkthrough

`counter.js` owns a mutable binding and exports it. `reader.js` imports that binding and observes later updates:

```js
// counter.js
export let count = 0;
export function increment() {
  count++;
}
```

```js
// reader.js
import { count, increment } from "./counter.js";
increment();
console.log(count); // 1
```

The import is not a snapshot of zero. It is a read-only imported binding that reflects the exported `count` binding. The relative specifier is interpreted by the host environment.

# When to use it and tradeoffs

Use static imports for normal dependencies so the graph is explicit and tools can analyze it. Use dynamic import for genuinely conditional or deferred loading, remembering that it is asynchronous and can reject on load/link/evaluation failure. Many small modules improve ownership and testing boundaries, while excessive fragmentation can make dependency flow harder to follow. Cycles are supported by the language model but make initialization order harder to reason about; remove them where practical.

# Recent version changes

Top-level `await` became part of ECMAScript 2022. Import attributes use the `with { ... }` form in ECMAScript 2025; hosts define which attribute keys they support, and JSON module behavior depends on host rules. The `assert` spelling is historical. See [ECMAScript modules](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html).

# What later lessons cover

The concepts lesson explains module graph construction, linking, evaluation, bindings, and cycles. Reference lessons explain each import, export, metadata, and loading name in the manifest. Practice builds small modules and reasons about dynamic loading; interview questions cover live bindings, cycles, and host-defined resolution.

# Sources

- [ECMAScript 2026 scripts and modules](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html)
- [ECMAScript 2026 expressions and import metadata](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)
- [MDN JavaScript modules guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
