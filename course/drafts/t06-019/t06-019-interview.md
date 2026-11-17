<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# ECMAScript modules, imports, exports, and module loading semantics — Interview questions and reasoning

# Core questions

1. How do ECMAScript modules differ from classic scripts?
2. What is the difference between a static import and dynamic `import()`?
3. What is a live import binding?
4. How do named and default exports differ?
5. What is the difference between `export default value` and `export { value as default }`?
6. What do linking and evaluation do?
7. How can cycles work, and when do they fail?
8. What does a module namespace object represent?
9. What does top-level `await` change?
10. Who resolves a module specifier?
11. What are import attributes used for?
12. What is the current host loading hook, and what changed from earlier editions?

# Concise interview answers

1. Modules have their own scope, strict semantics, and explicit import/export dependencies; classic scripts do not use the same module graph semantics.
2. Static imports declare graph edges before body evaluation; dynamic import is an expression returning a promise for the namespace object.
3. It is a read-only imported binding that refers to the exporting module's binding, so later exporter changes are observed.
4. Named exports expose names; a default export exposes the distinguished `default` name. A module can have many named exports and one default binding.
5. The expression form initializes a default binding from a value; the export-list alias exposes the local binding itself.
6. Linking resolves names and initializes module environments; evaluation executes module bodies.
7. The loader handles cycles, but reading a lexical export before initialization can throw a temporal-dead-zone ReferenceError.
8. A special non-extensible object exposing the exported names with reads tied to live bindings.
9. Evaluation can be asynchronous; dependent modules wait for the awaited module to settle.
10. The host loader applies its own resolution/loading model; ECMAScript does not define universal file/package lookup rules.
11. They attach metadata such as `{ type: "json" }` to an import request; the host determines supported keys and handling.
12. ECMAScript 2026 uses `HostLoadImportedModule`; earlier specs used a narrower `HostResolveImportedModule` hook model.

# Deep follow-up answers

## Why are imported bindings read-only but live?

The importing module receives an indirect binding to the exporter’s environment. It cannot assign to that binding, preserving ownership, but reading it resolves the export's current value. If the exported value is an object, the importer may still mutate the object itself when that object is mutable; binding immutability is not deep immutability.

## How are linking and evaluation separate?

Loading obtains module records according to the host. Linking initializes module environments and resolves imports to exported bindings; this catches missing or ambiguous names. Evaluation executes bodies and side effects. Separating these phases lets the module graph be checked and evaluated with cycle-aware ordering. Dynamic import returns a promise that represents loading, linking, and evaluation outcomes.

## Why can an ESM cycle throw even though the names resolve?

Linking can establish a live binding before its lexical declaration has initialized. If evaluation follows a path that reads a `let`, `const`, or class export during that interval, the binding is in its temporal dead zone and the read throws. Function declarations initialize earlier, but changing declaration forms is not a substitute for designing a clear dependency graph.

## Which default export form is live?

`export { local as default }` aliases the local binding. `export default local` evaluates the expression and initializes the default binding with that value; later reassignment of `local` does not update the separate default binding. An imported default binding remains read-only in either case.

## How do hosts fit into the standard?

The language defines module syntax, request records, linking, evaluation, and host hooks. The host controls how a specifier is mapped/fetched and which import-attribute keys it supports. Unsupported keys are rejected consistently, while supported-key meanings and concrete loading are host-specific. The current loading integration uses `HostLoadImportedModule`. `import.meta` is created by the language and host hooks can populate/finalize it; properties such as `url` and a method such as `resolve()` are host-specific.

## What happens with JSON imports?

The current syntax uses `with { type: "json" }`. The attribute marks the request; the host must support that attribute and JSON modules. Do not generalize the exact policy or availability from one runtime to another. A JSON module exposes its default value rather than named bindings.

# Scenario questions

1. **Two modules import each other and one immediately reads an exported `const`.** Inspect evaluation order and initialization timing; the cycle can link yet throw if the read occurs before initialization.
2. **A heavy feature is rarely used.** Use dynamic `import()` on the feature path, await the promise, and handle rejection. This is a loading decision, not merely a different spelling of static import.
3. **A consumer wants to mutate an imported `let`.** Move the state-changing operation behind an exported function or another module-owned API; the consumer cannot assign the imported binding.
4. **A package imports `./settings.json` successfully in one environment and fails in another.** Check host JSON module and `with { type: "json" }` support; the host determines loading policy.
5. **A path-like specifier resolves differently in two hosts.** That is expected at the language boundary: inspect the host loader and its resolution rules.
6. **A module uses `import.meta.url` in an embedded host.** Confirm that host provides `url`; ECMAScript itself permits host-defined metadata properties rather than requiring that specific field.

# Tradeoffs and alternatives

| Choice | Strength | Cost/constraint |
| --- | --- | --- |
| Static import | Explicit dependency graph and early linking | Not conditional within the module body |
| Dynamic `import()` | Conditional asynchronous loading | Promise handling and runtime failure path |
| Named exports | Clear multi-value interface and rename on import | More names to curate |
| Default export | Convenient single primary interface | One distinguished default can encourage inconsistent import names |
| Re-export/barrel | Centralizes a public entry point | Can hide dependency direction or create cycles |
| Host-provided resolution | Integrates modules with browser/Node loading | Same specifier may not mean the same thing across hosts |

# Common weak answers

- “Imports are copied once.” They are read-only live bindings.
- “The browser defines all module resolution because the feature is JavaScript.” Resolution is a host responsibility; Node has its own loader rules.
- “Cycles are syntax errors.” They are supported, though early reads can fail.
- “`export *` re-exports everything.” It does not re-export default and can create ambiguous names.
- “Dynamic import is just static import inside an `if`.” It is an asynchronous expression with a promise result.
- “`import.meta.url` is in ECMAScript.” The meta object is; specific fields are host-provided.
- “The current host hook is HostResolveImportedModule.” ES2026 uses HostLoadImportedModule.
- “With a JSON attribute, every runtime must load a JSON file the same way.” Attribute support and runtime policies remain host-specific.
- “The namespace object is an ordinary object of copied exports.” It is exotic and exposes live module bindings.

# Self-check rubric

Score one point for each ability you can demonstrate without notes:

- Explain module scope and explicit dependencies.
- Distinguish static imports from dynamic `import()`.
- Explain live, read-only imported bindings.
- Predict the default expression versus default alias behavior.
- Describe loading, linking, and evaluation as distinct responsibilities.
- Explain how cycles interact with lexical initialization.
- Explain namespace-object behavior.
- Describe top-level await's effect on dependent evaluation.
- Separate ECMAScript behavior from host resolution and metadata.
- Explain import attributes and JSON-module host support.
- Identify `HostLoadImportedModule` as the current hook and historical change.

Nine to eleven points indicates readiness; revisit the lesson section corresponding to any missed item.

# Sources

- [ECMAScript 2026 modules and import attributes](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html)
- [ECMAScript 2026 dynamic import and `import.meta`](https://tc39.es/ecma262/2026/multipage/ecmascript-language-expressions.html)
- [ECMAScript 2026 module namespace objects](https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html)
- [ECMAScript 2022 module loading](https://tc39.es/ecma262/2022/multipage/ecmascript-language-scripts-and-modules.html)
- [ECMAScript 2023 module loading](https://tc39.es/ecma262/2023/multipage/ecmascript-language-scripts-and-modules.html)
- [WHATWG HTML module loading](https://html.spec.whatwg.org/multipage/webappapis.html)
- [Node.js ECMAScript modules](https://nodejs.org/api/esm.html)
