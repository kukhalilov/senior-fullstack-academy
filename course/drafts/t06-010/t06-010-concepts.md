# TypeScript compiler, TSConfig options, project references, and build modes — Core concepts and how they fit together

## Learning objectives

- Trace how a configuration becomes a compiler program and why imported files can join the project.
- Choose module, library, and emit settings based on the runtime and build tool.
- Explain project references, incremental state, watch mode, and build orchestration.
- Diagnose configuration mistakes without treating every compiler switch as a fix.
- Identify TypeScript 7.0 stable behavior separately from the 7.1 beta API.

## Prerequisites

You should know basic TypeScript imports/exports, JavaScript modules, package `exports`/`imports`, and the difference between type checking and running JavaScript. A bundler transforms and packages files; the TypeScript compiler checks types and may emit files, but TypeScript alone does not make an emitted import resolve at runtime.

## Core concepts

### A project is a file graph

A config file does not simply mean “all files under this folder.” `files` is an explicit root list. `include` discovers roots by patterns; `exclude` filters that discovery, but does not prevent a matching file from entering through an import, a `files` entry, or a reference. Imported dependencies are then part of the program. `extends` inherits options and file-selection rules with path resolution relative to the config that declared them. Read the resolved configuration and file list when results differ from your expectation.

### Resolution, target, and libraries answer different questions

`module` chooses the module form TypeScript understands or emits. `moduleResolution` models how import specifiers map to files and package metadata. They must be a compatible pair: `nodenext` models Node’s dual module behavior; `bundler` models bundler-oriented ESM resolution. `paths` adds compiler lookup mappings but does not rewrite imports or configure a runtime resolver.

`target` selects the JavaScript syntax level to emit and, absent an explicit `lib`, influences standard-library declarations. `lib` describes APIs available to type checking; it does not install polyfills. If a program types against `Promise` or a DOM API, the runtime still needs to provide it. Browser, Node, and custom environments may need different declaration packages and explicit `types` entries.

### Strictness is a family with interactions

The `strict` switch enables a family of checks, including null handling, implicit `any`, function compatibility, and property initialization. Individual strictness flags let a team stage or specialize the policy. `exactOptionalPropertyTypes` distinguishes a missing optional property from a property explicitly set to `undefined`; `noUncheckedIndexedAccess` adds `undefined` to uncertain indexed reads. These options affect static reasoning, not JavaScript runtime checks.

### Emit is a pipeline decision

TypeScript can emit JavaScript, declarations, maps, or no output. `noEmit` is common when a framework bundler or runtime transpiler is responsible for output. Declaration emit is a separate product for package consumers. `noEmitOnError` controls whether errors block emit, while `noEmit` disables it outright. Source maps map generated positions to authored files; declaration maps do the analogous job for `.d.ts` output. None of these settings bundles the application.

### Project references define scale boundaries

A referenced project generally needs `composite`, which imposes constraints that make its outputs addressable by other projects. A solution-style config can list references but no source files of its own. Build mode (`tsc --build`) discovers references, builds dependencies first, and may reuse `.tsbuildinfo` state. Incremental compilation caches information for a project; it is not a substitute for declaring the project dependency graph. Build parallelism multiplies with per-project checker parallelism, so memory use can grow quickly.

### Diagnostics and watch are observability tools

Start with `--showConfig`, `--listFilesOnly`, `--explainFiles`, `--traceResolution`, or diagnostics flags to answer a concrete question. `--watch` recompiles after changes; watch options tune file-system observation and exclusions. `skipLibCheck` skips checks within `.d.ts` files, not all application checking. Profiling flags can create large artifacts; use them intentionally.

### Version boundaries matter

TypeScript 7.0 is a native Go port and adopts TypeScript 6.0 defaults. It does not ship a programmatic compiler API. The 7.1 beta introduces a new API, not a continuation of the old TypeScript 6 API; it models API objects that cross the Go/JavaScript boundary as disposable resources. The beta also adds content mappers, which can execute third-party code only when explicitly allowed with `--runExternalCode`. [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## Mechanisms and relationships

The normal CLI path is: locate config → parse config and options → find roots → resolve references/imports/types/libs → construct program → check → optionally emit. Build mode adds a project graph around that path. A TypeScript 7.1 beta API host supplies some of these inputs directly, can model a virtual filesystem, and can create a new snapshot after edits. Snapshots preserve prior views; do not mix objects obtained from different snapshot versions, and dispose snapshots/programs when finished.

## Worked examples

### Why `exclude` does not keep an imported file out

Given `include: ["src/**/*.ts"]`, `exclude: ["src/generated/**"]`, and `src/main.ts` importing `./generated/schema`, the import can still add `schema.ts` to the program. To keep generated code out, change the import/build boundary or generated-file placement; `exclude` is not an access-control rule.

### Why `paths` can pass checking and still fail at runtime

If `paths` maps `@app/*` to `./src/*`, the compiler can type-check `import { load } from "@app/load"`. The emitted specifier may remain `@app/load`; configure the bundler or runtime package mapping separately, or choose relative imports. The compiler’s success proves static resolution under its config, not runtime loading.

### Why check-only and build output are separate

A frontend package may use `noEmit: true` and run Vite for output. A library package may use `declaration: true`, `emitDeclarationOnly: true`, and a separate bundler for JavaScript. One config can serve either pattern, but each tool’s ownership should be explicit so CI does not consume stale artifacts.

## Misconceptions and edge cases

- `exclude` only narrows pattern-based root discovery; it does not block imports.
- `target` does not install runtime APIs or polyfills. `lib` only supplies declarations.
- `paths` does not rewrite module specifiers.
- `skipLibCheck` can hide declaration conflicts but does not mean “skip type-checking my project.”
- `incremental` and project references are related but distinct: a cache does not create a dependency graph.
- `types: []` prevents automatic inclusion of visible `@types` packages; imported package declarations still participate.
- The stable target default is version-specific: 7.0 used ES2025; the 7.1 beta supports ES2026. Avoid saying “the default is ES2026” without naming the compiler build.
- `tsc file.ts` and config discovery are version-sensitive. In 6.0+, a config in the current directory makes explicit file arguments an error unless `--ignoreConfig` is supplied.
- A 7.1 beta `contentMappers` config can run third-party code only with `--runExternalCode`; review and trust those packages as executables.

## Knowledge checks with answers

1. **Does `exclude` prevent imported files from joining a program?** No. It filters include-pattern discovery only.
2. **Does setting `target: "es2022"` make `Array.fromAsync` exist at runtime?** No. It controls syntax and library declarations, not runtime polyfills. Select an appropriate library and supply a runtime implementation where needed.
3. **What does `paths` guarantee?** Compiler lookup mapping only. It does not rewrite emitted imports or configure runtime resolution.
4. **What is the purpose of a solution-style config?** It coordinates project references/builds and generally has no source roots of its own.
5. **Can a TypeScript 6 compiler plugin assume it can import the same API from TypeScript 7?** No. 7.0 has no API and 7.1 beta introduces a new one; tooling compatibility must be checked separately.
