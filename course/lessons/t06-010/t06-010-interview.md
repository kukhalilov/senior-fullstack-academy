# TypeScript compiler, TSConfig options, project references, and build modes — Interview questions and reasoning

## Core questions

1. What does `tsconfig.json` control, and what remains the responsibility of a runtime or bundler?
2. How do `files`, `include`, and `exclude` differ?
3. What are `target`, `lib`, `module`, and `moduleResolution` responsible for?
4. Why can a `paths` mapping type-check but fail at runtime?
5. What is the difference between `noEmit` and `noEmitOnError`?
6. What do project references and `tsc --build` provide that `incremental` alone does not?
7. What changed between TypeScript 6, TypeScript 7.0, and the 7.1 beta for compiler defaults and API consumers?

## Concise interview answers

1. The config selects project inputs and compiler behavior: checking, module resolution, libraries, and output. It does not bundle the app, install polyfills, or guarantee runtime module resolution.
2. `files` names roots explicitly; `include` discovers roots by patterns; `exclude` filters that pattern discovery, but imports can still add excluded files.
3. `target` selects emitted syntax and influences the default library set; `lib` supplies declarations; `module` selects module semantics/output; `moduleResolution` describes how imports map to files and package metadata.
4. `paths` changes TypeScript’s lookup behavior but does not rewrite emitted specifiers. The bundler/runtime needs its own matching alias or import map.
5. `noEmit` disables output. `noEmitOnError` permits output unless errors are reported; it does not disable checking.
6. Incremental state caches work for a compilation. References declare a graph of project boundaries and outputs; build mode orders and updates that graph.
7. TypeScript 7.0 is a native Go port and adopts TypeScript 6 defaults, with many 6.0 deprecations becoming hard errors. It has no programmatic API; 7.1 beta introduces a different API and beta-only content mappers. [7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## Deep follow-up answers

### Why does an excluded file appear in diagnostics?

`exclude` is applied when expanding `include` patterns. A file referenced from a root source file can enter the program anyway. Check the actual file list and import graph, then move the source or adjust the project boundary rather than treating glob exclusion as access control.

### Should every project use `skipLibCheck`?

Not automatically. It can reduce work by skipping declaration-file checking, but it may hide conflicting declarations or an incorrectly selected type package. Enable it as a deliberate performance/compatibility tradeoff and retain other checks on application code.

### How would you investigate a missing global or unresolved package?

First inspect `--showConfig` and `--listFilesOnly`; then check `types`, `typeRoots`, `lib`, package metadata, and `moduleResolution`. Use `--traceResolution` for a particular import. Fix the source of the mismatch instead of adding broad `paths` patterns that only satisfy the checker.

### What is the migration risk in TypeScript 7?

There are two migrations: config/language behavior and programmatic tooling. TypeScript 7 adopts 6.0 defaults and rejects deprecated settings/constructs. The old compiler API is not provided in 7.0; 7.1 beta’s redesigned API is not a drop-in replacement and includes disposable cross-runtime objects. Test editor integrations, framework plugins, and build tooling separately.

## Scenario questions

- A new app needs modern browser output and Vite owns bundling. Which settings separate type checking from runtime output, and what must happen to aliases?
- A solution build is unexpectedly slow or memory-heavy. How do you inspect the dependency graph before adjusting checker and builder concurrency?
- A package upgrade causes globals to disappear. Which TS6/7 default should you inspect, and how would you make it explicit?
- A 7.1 beta content mapper is proposed for `.vue` files. What trust and compatibility questions must be answered before enabling it?

## Tradeoffs and alternatives

A single project is simpler and is usually right for a small app. Project references add declaration boundaries and build coordination but require disciplined outputs and dependency edges. `noEmit` plus a bundler avoids duplicate transformations but demands matching resolver configuration. `skipLibCheck` saves work but weakens checks of declaration dependencies. TS7 parallelism may improve throughput while increasing memory use; measure it. Beta APIs can unlock integrations early, but stable APIs and ecosystem compatibility are more appropriate for production-critical tooling.

## Common weak answers

- “`exclude` keeps a file out.” It only filters include-pattern discovery.
- “`target` controls which APIs exist at runtime.” It does not polyfill.
- “`paths` rewrites imports.” It does not.
- “Incremental means monorepo support.” It caches one project’s work; references describe project dependencies.
- “TypeScript 7 is just faster TypeScript 6.” The native port preserves much behavior, but defaults, removed options, JS analysis, API availability, and ecosystem integrations have migration consequences.
- “The TS7 API is the same as TypeScript 6.” It is not; 7.1 beta is a redesigned interface.

## Self-check rubric

A strong answer separates compiler guarantees from runtime/build-tool responsibilities, names relevant TypeScript versions, explains file inclusion and resolution causally, and proposes diagnostics before changing settings. For monorepos, it distinguishes caches from project graphs and discusses concurrency cost. For 7.1 beta, it names preview status, API incompatibility, and explicit code execution for content mappers.
