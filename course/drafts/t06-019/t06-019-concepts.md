<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# ECMAScript modules, imports, exports, and module loading semantics — Core concepts and how they fit together

# Learning objectives

Explain how modules differ from classic scripts; distinguish static import, re-export, and dynamic import; predict how live bindings behave; describe linking, evaluation, cycles, and top-level `await`; and separate ECMAScript guarantees from host-specific module resolution and metadata.

# Prerequisites

You should understand lexical bindings, functions, promises, strict mode, and the temporal dead zone. A module binding is a name in a module's own environment. An import declaration creates a local binding that refers to an export; it is not ordinary assignment.

# Core concepts

## A module has private scope and explicit connections

Each module has its own top-level scope and is strict code. Its top-level declarations do not automatically become properties of a host global object. A module has an explicit interface made of exports. A static import declaration is legal only at module top level and is resolved as part of the dependency graph rather than conditionally executing like a function call.

Static requests are analyzed before the importing module body evaluates. This lets a host load the graph and the language link imported names to exported bindings. A syntax-valid specifier does not itself guarantee that a host can locate a file or package.

## Imports are read-only live bindings

An imported name cannot be assigned by the importing module. It is an indirect binding to the exporter’s binding: if the exporter changes a mutable export, importers read the updated value. The importer does not receive an independent copy. If the exported value is an object, the imported binding cannot be replaced, but the importer may mutate that object when it is itself mutable.

Default exports also need care. `export default expression` initializes the module's default binding from the expression value. If the expression reads a local variable, later reassignment of that local does not turn the default export into an alias of the local binding. `export { localName as default }` exports the local binding itself, so later changes remain visible through that binding.

## Linking precedes evaluation

The host loads module records for the requested graph. Linking initializes module environments and resolves each requested export name, including indirect and star exports. A missing or ambiguous export fails before normal body evaluation completes. Evaluation then runs module code once for that loaded module graph according to cycle-aware rules. A module's side effects therefore occur as part of graph evaluation, not each time a name is imported.

The specification defines module records, linking, and evaluation mechanics. It delegates how a specifier maps to loaded source and how resources are fetched to the host. Browsers and Node have different loading systems; do not assume a relative-looking string has identical package/path rules everywhere.

## Cycles preserve bindings, but initialization order matters

Cycles are permitted. The loader tracks visited modules so it does not recursively load forever, and evaluation handles strongly connected module records according to the specification. Imports remain live across a cycle. However, a module can read another module's lexical binding before that binding has initialized; that read can throw a `ReferenceError`. `var` and function declarations have different initialization timing, so the exact cycle matters. Avoid cycles when they make the initialization contract obscure.

## Static import, dynamic import, and top-level await

Static imports describe unconditional graph edges and cannot be placed inside branches or functions. `import()` is an expression; it accepts a specifier (and current import options) and returns a promise for the module namespace object. Use it for conditional loading or code paths that should be requested later, and handle its rejection.

Top-level `await` is permitted in modules, not ordinary classic scripts. It makes a module's evaluation asynchronous. Modules depending on it wait for its evaluation to settle; this can delay the whole dependent path. Use it deliberately because startup now depends on asynchronous work and cycles with asynchronous evaluation are harder to reason about.

## Import attributes and JSON modules

The current syntax is `with { key: "value" }`, for example `import data from "./settings.json" with { type: "json" };`. The attribute is metadata attached to the module request. The host declares supported attribute keys; unsupported keys are rejected consistently, while the meaning of supported keys and actual loading are host-specific. The `type: "json"` attribute is commonly used for JSON modules, but JSON module support and whether the attribute is required depend on the target host/runtime. Do not use the old `assert { ... }` spelling in current examples.

## Module namespace and metadata objects

A module namespace object exposes the module's exported names, including indirect exports, through a special non-extensible object with a null prototype. Reading a namespace property follows the corresponding export binding. Although its property descriptors report `writable: true` as required for live values, the exotic object's write operation rejects assignment; assignment from strict module code throws. It is not a mutable plain-object copy of exports.

`import.meta` is created for module code with a null prototype; the host may add properties. `import.meta.url` is common in browser and Node hosts but its availability/value is host-defined. `import.meta.resolve()` is likewise a host-provided resolution facility; its exact support and rules vary. Do not claim either property or method is guaranteed by the core ECMAScript language alone.

# Mechanisms and relationships

| Stage | What happens | Typical failure |
| --- | --- | --- |
| Parse | Parse module syntax and static import/export forms | Syntax error, such as misplaced static import |
| Load | Host maps module requests and supplies module records | Missing resource or unsupported attribute |
| Link | Resolve imports to exports and initialize environments | Missing/ambiguous export |
| Evaluate | Execute module bodies in graph order | Runtime exception or rejected asynchronous evaluation |
| Dynamic load | `import()` requests a graph and returns a promise | Promise rejection for load, link, or evaluation error |

`HostLoadImportedModule` is the current specification hook for host loading. Older editions used the name `HostResolveImportedModule`; it is not the current hook name. `HostGetSupportedImportAttributes`, `HostGetImportMetaProperties`, and `HostFinalizeImportMeta` are additional host hooks that define supported request attributes and how metadata is supplied. These are specification integration points, not functions application code calls.

# Worked examples

## Default expression versus a live alias

```js
// values.js
let count = 0;
export { count };
export function next() { count++; }
export default count;
```

```js
// consumer.js
import initialCount, { count, next } from "./values.js";
next();
console.log(count);        // 1: imported live binding
console.log(initialCount); // 0: default expression was initialized earlier
```

## Dynamic loading

```js
async function loadOptional(featureEnabled) {
  if (!featureEnabled) return null;
  const moduleNamespace = await import("./optional-feature.js");
  return moduleNamespace.activate();
}
```

The expression returns a promise. The caller must await or otherwise handle its eventual rejection and result.

# Misconceptions and edge cases

- **Imports copy values.** They are read-only live bindings to exported bindings.
- **Static import is a function that runs at its source line.** It creates a dependency request processed in the module graph before body evaluation.
- **All exports named `default` are aliases of local variables.** A default expression initializes a separate default binding; an export list can expose a local binding directly.
- **Cycles are always rejected.** Cycles are supported, but reads before lexical initialization can fail.
- **A module specifier is a filesystem path by definition.** Resolution is host-defined; browsers and Node apply different rules.
- **`import.meta.url` is an ECMAScript guarantee.** The metadata object is standardized, but its properties are supplied by the host.
- **Dynamic import throws synchronously for all load errors.** The request returns a promise that can reject for load/link/evaluation failure.
- **`with { type: "json" }` guarantees universal runtime support.** It is standard syntax, but host feature support and deployment compatibility still need checking.
- **Top-level `await` is just function-level `await`.** It affects asynchronous evaluation of the module graph and its dependents.

# Knowledge checks with answers

1. **Can an importing module assign to an imported binding?** No; the import is a read-only local binding.
2. **If the exporter increments a mutable exported binding, what does the importer observe?** The new value, because the binding is live.
3. **Does a module cycle necessarily fail?** No, but reading an uninitialized lexical export during evaluation can throw.
4. **What does `import()` return?** A promise for the imported module's namespace object.
5. **Who defines how `./file.js` maps to source?** The host loader, within the constraints of the relevant host specification.
6. **Is `HostResolveImportedModule` the current ES2026 hook?** No; the current hook is `HostLoadImportedModule`.

# Sources

- [ECMAScript 2026 modules](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html)
- [ECMAScript 2026 import expressions and metadata](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)
- [ECMAScript 2026 namespace objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [WHATWG HTML module loading and import metadata](https://html.spec.whatwg.org/multipage/webappapis.html)
- [Node.js ECMAScript modules](https://nodejs.org/api/esm.html)
- [MDN JavaScript modules guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
