# JavaScript bundlers, build pipelines, and development servers — Core concepts and how they fit together

## Learning objectives

- Trace entry points and assets through a module graph to output chunks.
- Distinguish dev servers, file watching, incremental builds, live reload, and HMR.
- Explain tree shaking, code splitting, transformation, minification, and content naming separately.
- Select a tool based on workload, ecosystem compatibility, host, and output needs.
- Avoid confusing bundling/transpilation with TypeScript type checking.

## Prerequisites

Know JavaScript modules, npm scripts, browser/Node runtimes, and basic package metadata. Package-manager and dependency-graph behavior is covered in t06-025; source-map concepts in t06-027.

## Core concepts

### The module graph and transform pipeline

An entry point anchors graph traversal. Imports create edges; assets such as CSS, images, fonts, JSON, and HTML may also become graph nodes. Resolution maps specifiers to files. A transform or loader converts a file into a form the bundler understands. Plugins may participate in resolution, loading, transformation, chunk generation, and output stages. Different tools expose different hooks; “plugin compatible” never means every plugin works without qualification.

### Development is a feedback loop

A development server serves application resources and may proxy API requests. Watch mode notices changes. Incremental rebuild reuses prior work. Lazy compilation builds resources when requested. HMR attempts to replace modules while retaining page/application state; it only works when the changed module and its import chain accept the update. A failed/unaccepted update can cause a full reload. A tool that serves rebuilt files is not automatically an HMR implementation.

Vite traditionally serves native ESM during development and pre-bundles dependencies to reduce many-file/network overhead. Vite 8 unifies bundling with Rolldown and uses Oxc-based transforms; its migration guide documents changed options and unsupported hooks. Webpack HMR is mediated by its runtime and dev-server companion. Parcel integrates dev serving/hot reload. esbuild supplies serve/watch contexts but not HMR. Turbopack incrementally and lazily bundles within Next.js. [Vite 8 migration](https://vite.dev/guide/migration) · [Webpack HMR](https://webpack.js.org/concepts/hot-module-replacement) · [esbuild API](https://esbuild.github.io/api/)

### Production output

Production builds choose output targets and formats, transform syntax/assets, split code, remove unused statements/modules, minify, and often create content-hashed filenames for cache invalidation. These are distinct steps. Tree shaking relies on static module/export information and side-effect assumptions. Incorrect `sideEffects` metadata may drop required CSS/polyfills or retain unnecessary modules. Dynamic `import()` creates a potential async boundary, but exact chunking/loading decisions vary across tools.

### Tool roles, not a single feature checklist

- **Vite 8** is an integrated development/build tool whose bundler is Rolldown; most ecosystem plugins are compatible, but migration docs describe exceptions.
- **Webpack 5** offers a broad configurable application pipeline through loaders and plugins, with `webpack-dev-server` as a companion.
- **Rollup** focuses on ES module analysis and tree shaking, often for library output; external module formats/support may require plugins.
- **esbuild** focuses on speed and combines transform/build APIs. Its code splitting is ESM-only in current docs; serve/watch is not HMR.
- **Parcel 2** emphasizes automatic discovery and integrated processing for HTML/apps/libraries.
- **Rspack 2** aims at webpack API compatibility with a Rust implementation, but compatibility and migration still need checks; Rsbuild is its higher-level counterpart.
- **Turbopack** is built into Next.js. It supports webpack loaders through a compatibility layer but not webpack plugins.
- **Rolldown** is a standalone Rust bundler with a largely Rollup-compatible plugin API and its own additional features/maturity caveats.
- **Bun.build** is Bun's API/CLI, with target-specific and evolving runtime-coupled features.
- **`tsc`** parses, type-checks, and emits source/declarations; it does not bundle an application dependency graph into chunks. [TypeScript modules](https://www.typescriptlang.org/docs/handbook/modules/reference.html)

## Mechanisms and relationships

1. Resolve specifiers according to tool/host rules; mismatches can make output fail at runtime.
2. Transform source and assets; transpiling TypeScript syntax alone does not guarantee type safety.
3. Construct chunks around entries and async boundaries, sometimes extracting shared modules.
4. Tree-shake code only where static analysis and side-effect metadata justify removal.
5. Minify after transformations; minification is not type checking and does not guarantee smaller output in every case.
6. Develop using watch/incremental/lazy builds; HMR additionally requires runtime update acceptance.
7. Serve and preview locally; production hosting, caching headers, routing, and CDN behavior are separate deployment concerns.

## Worked examples

### esbuild serves and watches, but does not provide HMR

```js
import * as esbuild from "esbuild";

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outdir: "dist",
});
await context.watch();
const server = await context.serve({ servedir: "dist" });
```

The context supports incremental work, file watching, and local serving. A browser reload can fetch updated output, but HMR needs an update runtime/protocol that this API does not supply by itself. [esbuild API](https://esbuild.github.io/api/)

### TypeScript checking is a separate pipeline step

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "vite build"
  }
}
```

The bundler transforms TypeScript syntax for output; `tsc --noEmit` checks types. Some tools integrate checkers, but do not assume syntax transformation reports all type errors.

## Misconceptions and edge cases

- HMR is not synonymous with watch, incremental rebuild, or live reload.
- Development dependency pre-bundling and production tree shaking solve different problems.
- Tree shaking is not arbitrary dead-code magic; module format and side-effect declarations matter.
- Dynamic imports are potential split points, not a guarantee of a particular number/name of chunks.
- A plugin API can be similar while hook ordering, data, or unsupported hooks differ (notably across Vite 8/Rolldown migration).
- Bundler compatibility does not imply Node/browser runtime compatibility; test the generated target.
- TypeScript/JSX transformation does not necessarily type-check code.
- Environment replacement can put values in public bundles; never inline secrets.
- Preview server behavior does not reproduce production infrastructure automatically.
- Vendor performance numbers depend on codebase, cache, hardware, plugin set, and output requirements.

## Knowledge checks with answers

1. **What is a module graph?** The resolved dependency nodes/edges reachable from entry points, including supported assets.
2. **Does esbuild serve/watch imply HMR?** No; it can rebuild/serve but has no HMR runtime protocol by itself.
3. **Why can tree shaking remove required CSS?** Incorrect side-effect metadata can tell the optimizer that CSS imports are safe to drop.
4. **Does a bundler's TS transform prove the code type-checks?** Not necessarily; run `tsc` or another checker separately.
5. **Is Turbopack a standalone Webpack replacement?** No; it is integrated with Next.js and lacks webpack plugin support.
6. **What changed in Vite 8?** Rolldown became its unified bundler, replacing the prior esbuild/Rollup split; migration exceptions remain.
