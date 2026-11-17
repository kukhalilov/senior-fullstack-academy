# JavaScript bundlers, build pipelines, and development servers — Interview questions and reasoning

## Core questions

1. What is a module graph, and how does it shape bundling?
2. Distinguish watch mode, incremental rebuild, a dev server, live reload, and HMR.
3. What are tree shaking and code splitting? How are they different from minification?
4. Why can a bundler accept TypeScript syntax while the project still has type errors?
5. Compare Vite 8.3, Webpack 5, Rollup, esbuild, Parcel 2, Rspack 2.3, Turbopack, Rolldown, Bun.build, and tsc by role.
6. What changed internally in Vite 8, and why should a plugin be rechecked?
7. What are the important Webpack 5 changes from Webpack 4?
8. Is Parcel 3 ready as a stable replacement for Parcel 2? What does its alpha status imply?
9. How do Rspack and Turbopack differ in their relationship to Webpack APIs?
10. What does sideEffects metadata do, and how can it break production output?
11. Why is putting an environment variable into a browser bundle not a secret-management strategy?
12. How do content hashes and preview servers participate in deployment without replacing deployment testing?

## Concise interview answers

1. It is the set of resolved source/asset modules and dependency edges reachable from entries. The bundler uses it to transform, invalidate, split, optimize, and emit outputs.
2. Watch detects changes; incremental rebuild reuses work; a dev server serves resources; live reload refreshes a page; HMR applies accepted updates through a runtime without full reload.
3. Tree shaking removes statically unused code; code splitting separates output into chunks; minification rewrites output for size/performance. They are separate stages and can interact.
4. Many bundlers strip TypeScript syntax but do not perform full semantic type checking. Run tsc --noEmit or another checker separately.
5. Vite is an integrated frontend workflow; Webpack a configurable loader/plugin system; Rollup an ESM-focused tree-shaker; esbuild a fast transform/build API without HMR; Parcel an integrated low-config tool; Rspack a webpack-compatible Rust bundler; Turbopack the Next.js 16 default bundler for dev/build; Rolldown a standalone Rollup-compatible Rust bundler; Bun.build is runtime-coupled; tsc type-checks/emits but does not bundle the app graph.
6. Vite 8 unified development and production bundling on Rolldown with Oxc-based transforms. Some Rollup/esbuild hooks/options differ or are unsupported, so test the specific plugin and output. [Vite 8](https://vite.dev/blog/announcing-vite8.html) · [Migration](https://vite.dev/guide/migration)
7. Webpack 5 added persistent filesystem caching, Module Federation, improved tree shaking, native asset modules, and stopped automatic browser Node-core polyfills. [Webpack 5](https://webpack.js.org/blog/2020-10-10-webpack-5-release/)
8. No. Parcel 3 was alpha as of 2026-11-18, with declaration generation, custom bundler plugins, and programmatic JavaScript API listed as incomplete. Parcel 2.15 remained the stable line. [Parcel 3 alpha](https://v3.parceljs.org/blog/v3-alpha/)
9. Rspack intentionally offers broad webpack API compatibility but still has migration gaps. Turbopack is tied to Next.js, is default for dev/build in Next.js 16, and supports some webpack loaders through an adapter but not webpack plugins. [Rspack](https://rspack.rs/guide/start/introduction) · [Turbopack](https://nextjs.org/docs/pages/api-reference/turbopack)
10. It tells the optimizer which modules are safe to omit when exports are unused. Incorrectly marking CSS/polyfills as side-effect-free can delete required behavior.
11. Browser bundles are public artifacts; build-time replacement embeds values that users can inspect. Keep credentials on the server.
12. Content hashes give changed assets new URLs for cache invalidation. Preview inspects built files locally, but production hosts/CDNs may differ in base paths, routing, headers, and caching.

## Deep follow-up answers

### Why isn't HMR just a fast page reload?

HMR sends updates to a runtime that replaces modules and handles disposal/acceptance boundaries. A full reload starts the page from its entry point and normally resets application state. HMR only works for module types/framework boundaries with an update strategy; otherwise updates bubble or trigger a reload. A watcher/server alone does not implement that protocol. [Webpack HMR](https://webpack.js.org/concepts/hot-module-replacement)

### Why can bundler plugin migration be difficult?

Plugins may depend on hook availability, ordering, internal data shapes, module IDs, resolution conditions, or runtime assumptions. Two tools can expose similarly named hooks yet differ in semantics. Vite 8's Rolldown migration and Turbopack's loader adapter have documented differences; Rspack's goal of webpack compatibility does not promise every plugin. Test each integration and emitted behavior rather than compiling config alone.

### Why can tree shaking make an app incorrect?

The optimizer needs to know which modules have side effects. Package metadata or annotations can assert that unused modules may be skipped. CSS imports, polyfills, registration, locale initialization, and global setup may perform effects without exporting a used symbol. An overly broad purity claim lets the optimizer remove them. Keep metadata precise and inspect production output.

### How should tool benchmarks be compared?

Use the same machine, project, dependency graph, target, plugin set, source map/minifier settings, and cache state. Separate cold start from warm incremental rebuild and compare output size and runtime behavior as well as elapsed time. Vendor benchmarks are useful evidence about that workload, not a universal ranking.

### How would you choose a bundler for a library?

Start with consumer formats, external dependencies, tree-shaking expectations, declaration generation, and package export paths. Rollup is a common ESM-oriented choice; Webpack/Rspack can handle broader app/library pipelines; Bun or Parcel can provide integrated workflows. Emit only formats the package promises, and test an independent consumer against the packed artifact. Type declarations need a separate or integrated declaration pipeline; tsc alone does not bundle runtime code.

## Scenario questions

### CSS vanishes only in production

The development server shows styles, but a production bundle omits them after package metadata changed. Explain how sideEffects can cause this and propose an output-level check.

### “Works in Vite but fails in Node”

An extensionless relative import builds successfully under bundler-style resolution and then fails when Node loads output. Explain how the host resolution model and output target differ and what to check in emitted specifiers.

### Plugin disappears in a migration

A Next.js app moves to Turbopack and a Webpack plugin stops running. Explain the tool boundary and identify whether a supported loader, native option, or Webpack fallback is appropriate.

### The build passed but types are wrong

A tool transpiles TypeScript quickly but CI did not run type checking. Explain the missing step and propose a build script/CI command.

## Scenario answer outlines

### CSS vanishes only in production

A broad `sideEffects: false` declaration tells the optimizer that package files may be dropped when their exports are unused. CSS imports perform effects, so list the relevant CSS files/patterns as side-effectful (or narrow the metadata) and inspect the production bundle/output HTML to confirm the stylesheet is emitted and loaded.

### “Works in Vite but fails in Node”

Bundler-style resolution can permit extensionless relative imports and rewrite/resolve them as part of a build, while native Node ESM generally requires a runtime-resolvable specifier. Identify whether Node runs emitted files or a bundler output, inspect the actual emitted imports and extensions, and choose TypeScript/module settings and source specifiers that match the deployment host.

### Plugin disappears in a migration

Turbopack is a Next.js-integrated bundler; its compatibility adapter supports selected webpack loaders but not webpack plugins. Check whether the needed behavior has a documented native `turbopack` option or supported loader. If it relies on a webpack plugin with no equivalent, retain the `--webpack` build path or replace the integration before switching.

### The build passed but types are wrong

A syntax transformer may erase TypeScript syntax without semantic checking. Add a separate checker such as `tsc --noEmit` to the build/CI pipeline, with the project's actual tsconfig and a failing exit code, alongside the bundler command.

## Tradeoffs and alternatives

- Use Webpack when its broad ecosystem/configuration is required; use Rspack when webpack-like migration benefits are real and integrations pass.
- Use Vite 8 for its integrated modern frontend workflow when the Rolldown migration and plugins fit.
- Use Rollup for statically analyzable library bundles and esbuild for fast transform/build tasks with separate HMR/type-checking needs.
- Use Parcel 2 for integrated auto-discovery; evaluate Parcel 3 alpha separately until its APIs/features are stable.
- Use Turbopack within Next.js when supported; retain Webpack for features Turbopack does not support.
- Use tsc for type checking/declaration emit, not as a substitute for application bundling.
- Treat performance, plugin compatibility, and output correctness as workload-specific verification questions.

## Common weak answers

- “HMR is just a watcher.” It requires runtime update handling and acceptance.
- “Tree shaking and minifying are the same.” They are distinct operations.
- “The bundler compiled TypeScript, so there are no type errors.” Syntax transform may not type-check.
- “Vite 8 uses Rollup in production.” It uses Rolldown.
- “All Vite plugins work in Vite 8.” Migration docs list unsupported/changed behavior.
- “Turbopack supports Webpack plugins.” It does not; loader support is partial.
- “Rspack is a drop-in replacement in every project.” Verify each integration and output.
- “Parcel 3 is the latest stable Parcel.” It is alpha in this snapshot; Parcel 2 remains stable.
- “Environment variables are private if injected at build time.” Client output is inspectable.

## Self-check rubric

Score each response 0–2: **0** for confusing tool capabilities; **1** for correct labels but missing runtime/plugin caveats; **2** for explaining the exact pipeline stage, host/version assumptions, and how to verify. Aim for 18/24 with no zero on HMR, type checking, and current Vite/Parcel/Turbopack status.
