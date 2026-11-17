<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# ECMAScript modules, imports, exports, and module loading semantics — Reference: Module metadata and asynchronous loading

# Scope and version

This reference covers the supplied module metadata, import/evaluation, namespace, binding, cycle, and host-loading names through ECMAScript 2026. Top-level `await` entered the standard in ES2022; import attributes use `with` in ES2025. Host-specific APIs are labeled as such. See [ECMAScript modules](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html), [expressions and metadata](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html), and [HTML module loading](https://html.spec.whatwg.org/multipage/webappapis.html).

# How this group fits the mental model

This group covers what happens after import/export syntax establishes dependency requests: hosts supply module records, the language links imports, and evaluation runs the graph. It also explains dynamic loading, top-level asynchronous evaluation, the namespace view of exports, and the host metadata object available inside a module.

# Supplied names explained

- `import.meta` — A module-only meta property that produces one cached object for the module. ECMAScript creates it with a null prototype, then asks the host to provide/finalize its properties.
- `import.meta.url` — A commonly provided property containing a module's base URL/path. Browser HTML modules and Node provide it, but core ECMAScript does not require every host to define this property.
- `Dynamic import()` — The `import(specifier[, options])` expression works in modules and classic scripts and returns a promise for a module namespace object. It can be conditional and used outside static module declarations; load, link, or evaluation failures reject the promise. Options can carry import attributes through a `with` object.
- `Top-level await` — Allows `await` directly in module code. The module's evaluation becomes asynchronous, and dependents wait for it. It was standardized in ECMAScript 2022.
- `Module namespace exotic object` — Special object exposing the module's exported names. It has a null prototype, is non-extensible, and lists export names in sorted order. Reads observe live bindings. Descriptors report `writable: true`, but its special write operation rejects assignment so the importer cannot change the export; this descriptor detail supports the live value semantics rather than ordinary object mutation.
- `Live import binding` — An imported name is an immutable indirect binding to the exporting module's binding. The importer cannot assign it, but later reads observe changes made by the exporter.
- `Cyclic module dependency` — A dependency path that returns to a module already in the graph. The language tracks cycles and can evaluate them; reading an uninitialized lexical binding during the cycle can throw a ReferenceError.
- `Module linking` — Resolves requested import names to exported bindings and initializes module environments before evaluation. Missing or ambiguous exports are linking failures.
- `Module evaluation` — Executes a linked module graph. Each loaded module record's body is evaluated once, with prior completion/failure remembered; top-level await may make completion asynchronous.
- `Module specifier` — String text that identifies a requested dependency. ECMAScript does not define universal path, URL, or package lookup rules; the host resolves it relative to its loading model.
- `HostLoadImportedModule` — Current host hook that supplies the Module Record for a request and integrates loading with the graph. Its process of I/O, resolution, and mapping is host-defined.
- `import.meta.resolve()` — Host-provided method for resolving a specifier relative to the current module in environments that implement it. Browser/Node behavior and support should be checked; it is not a core ECMAScript method guaranteed everywhere.
- `HostGetImportMetaProperties` — Host hook that supplies property keys/values for the `import.meta` object. The default provides none; hosts commonly add location metadata.
- `HostFinalizeImportMeta` — Host hook that can perform final host-specific preparation of `import.meta` before it is exposed to code.
- `HostGetSupportedImportAttributes` — Host hook listing supported import-attribute keys. An unsupported key causes a module-loading error rather than silently changing the request's meaning.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| Static import vs `import()` | Static request is part of the graph before body execution; dynamic request is an expression returning a promise |
| Live binding vs copied value | An import follows the exported binding; a copied value would not reflect later reassignment |
| Linking vs evaluation | Linking resolves names/environments; evaluation executes module bodies |
| Module resolution vs evaluation | Host-specific selection/loading of the module record versus language execution of that record |
| `HostLoadImportedModule` vs old `HostResolveImportedModule` model | The current hook encompasses loading; older editions described a resolution hook separately/narrowly |

# Examples

```js
// state.js
export let status = "starting";
export function markReady() { status = "ready"; }
```

```js
// app.js
import * as state from "./state.js";
console.log(state.status); // "starting"
state.markReady();
console.log(state.status); // "ready"
console.log(import.meta.url); // host-provided module URL/path in common hosts
```

```js
async function loadIfNeeded(needed) {
  if (!needed) return null;
  const namespace = await import("./optional.js");
  return namespace.activate();
}
```

The import expression's promise represents asynchronous module loading/evaluation. The local `namespace` is the imported module namespace object.

# Common mistakes

- Treating module namespace properties as independent mutable copies.
- Assuming a module namespace is a plain extensible object.
- Calling `import.meta` from a classic script; it is module-only syntax.
- Treating `import.meta.url` or `import.meta.resolve()` as guaranteed by ECMAScript in every host.
- Calling the pre-2023 `HostResolveImportedModule` name the current hook; current ES2026 uses `HostLoadImportedModule`.
- Assuming the language defines how a bare or relative module specifier maps to a file.
- Treating dynamic import errors as synchronous exceptions in all cases; the returned promise rejects for request failures.
- Forgetting that import attributes are part of the module request and the host controls supported keys.
- Assuming top-level await affects only one module; dependents wait for asynchronous graph evaluation.
- Assuming a cycle always fails or is always safe; early reads of uninitialized bindings can fail.

# Knowledge checks with answers

1. **What does a module namespace expose?** The module's exported names through a special non-extensible object with live reads.
2. **Can an importer assign to `state.status` when it is an imported binding?** No; only the exporting module can update its binding.
3. **What does `import()` resolve to?** A module namespace object, delivered through a promise.
4. **Who defines how a specifier maps to a file/resource?** The host loader.
5. **Is `HostResolveImportedModule` the current host hook name?** No; it is historical. The ES2026 name is `HostLoadImportedModule`.
6. **Does top-level await make the module graph synchronous?** No; it makes evaluation asynchronous and dependent modules wait.

# Further reading

- [ECMAScript 2026 module loading and evaluation](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html)
- [ECMAScript 2026 import expressions and host metadata hooks](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)
- [ECMAScript 2026 module namespace exotic objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [WHATWG HTML module loading and `import.meta`](https://html.spec.whatwg.org/multipage/webappapis.html)
- [Node.js ECMAScript modules](https://nodejs.org/api/esm.html)
