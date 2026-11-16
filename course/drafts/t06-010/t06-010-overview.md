# TypeScript compiler, TSConfig options, project references, and build modes — Big-picture orientation and mental model

## Problem and purpose

TypeScript is useful only when the tools agree about which files belong to a project, how imports resolve, which JavaScript features are allowed, and what output should be produced. The compiler turns that collection of decisions into diagnostics and, optionally, JavaScript, declaration files, and source maps. A `tsconfig.json` makes those decisions repeatable for editors, command-line builds, and CI.

This topic uses TypeScript 7.0 stable as the current stable compiler and labels TypeScript 7.1 as beta. The 7.0 release is a native Go port with parallel work; 7.1 beta adds a different programmatic API and content mappers. Beta claims below are explicitly marked and are not a stable-upgrade recommendation. [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## Plain-language mental model

Think of a compiler project as a recipe and a dependency graph. The root `tsconfig.json` says which files enter the recipe and which settings apply. Module resolution follows each import to another file or package. Type checking compares uses against declarations. Emit then writes selected outputs—or is disabled when another tool owns the build.

A project reference is a boundary between recipes: one project publishes declarations for another project to consume. Build mode reads those links, schedules projects in dependency order, and may reuse incremental state. Diagnostics and tracing are the compiler’s explanation of what it read, decided, and emitted.

TypeScript 7.1 beta also introduces a redesigned programmatic compiler API. That API is preview-only and is outside this lesson set, which focuses on compiler configuration, CLI use, and project builds. [7.1 beta API overview](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## How the parts fit together

1. **Select project inputs.** `files`, `include`, `exclude`, and `extends` determine the starting file set and configuration inheritance. Imports and triple-slash references can add dependencies.
2. **Resolve modules and libraries.** `module`, `moduleResolution`, `paths`, `types`, and `lib` shape how names and ambient declarations are found. TypeScript does not implement runtime aliases for a bundler just because `paths` is configured.
3. **Check the program.** Strictness options control which mistakes become diagnostics. `skipLibCheck` changes checking of declaration files, not the correctness of your application types.
4. **Choose output.** `noEmit`, declaration settings, source maps, and output directories determine whether the compiler writes artifacts. A bundler may own JavaScript output while `tsc` performs checking.
5. **Scale across projects.** `references`, `composite`, `incremental`, and `tsc --build` establish build boundaries and cached work. Parallelism settings trade memory and scheduling complexity for throughput.
6. **Inspect and diagnose.** CLI diagnostics explain which files, settings, and resolutions the command-line compiler used.

## Concept map

```text
files + tsconfig inheritance
            │
            ▼
      source program ◄──── imports + package metadata + lib/types
            │
       type checking
       ┌────┴────┐
       ▼         ▼
  diagnostics   emit policy
                   │
           JS / .d.ts / maps

project references ──► build graph ──► incremental + watch + parallel work

7.1 beta host API ──► API ──► snapshot/filesystem ──► program + diagnostics + emit
```

## End-to-end walkthrough

Suppose a small app has `src/main.ts` and a package of browser code. A deliberately explicit config can look like this:

```json
{
  "compilerOptions": {
    "target": "es2025",
    "module": "preserve",
    "moduleResolution": "bundler",
    "rootDir": "./src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "types": []
  },
  "include": ["src/**/*.ts"]
}
```

The target controls syntax lowering and the default library selection only when `lib` is not supplied; it does not polyfill runtime APIs. `moduleResolution: bundler` models bundler-style imports, but the bundler must still implement runtime loading. `noEmit` means this invocation checks without writing JS. Explicit `rootDir` and `types` avoid surprising changes when upgrading from TypeScript 5.9: TypeScript 6 changed these defaults, and TypeScript 7 adopts the 6.0 defaults. The 7.1 beta also produced TS5011 for a project with a common `src` root unless `rootDir` was set, so keep that beta behavior distinct. [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html) · [TypeScript 7.0 changes](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)

A team can inspect the effective config with `tsc --showConfig`, list included files with `tsc --listFilesOnly`, and trace a troublesome import with `tsc --traceResolution`. If there are separate `shared` and `app` packages, give each a composite config and declare a project reference from `app` to `shared`; invoke `tsc --build` at the solution config. That uses the dependency graph instead of asking one invocation to guess project boundaries.

## When to use it and tradeoffs

Use one straightforward `tsconfig.json` for a small app; add project references when independent packages need clear build order and reusable declaration boundaries. Use `noEmit` when another tool owns runtime bundling, and emit declarations when publishing a typed library. Turn on diagnostics selectively when investigating a slow or confusing build.

More flags are not automatically safer. `skipLibCheck` can shorten checks while hiding inconsistencies between declarations; `paths` can make type resolution succeed while runtime resolution still fails; broad `include` globs can pull tests or generated files into a production build. Prefer the smallest configuration that describes the actual runtime and build pipeline.

## What later lessons cover

The following lessons move from project inputs to checking, resolution, emit, JS/JSX behavior, diagnostics, watch/build options, historical settings, CLI commands, and the separately versioned 7.1 beta content-mapper preview. The reference lessons explain every supplied name; this overview intentionally gives the mental model first.
