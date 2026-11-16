# JavaScript bundlers, build pipelines, and development servers — Reference: Build, development server, and output capabilities

## Scope and version

This lesson covers all 28 supplied capabilities. Exact behavior varies by tool and version. The current Vite 8, Webpack, esbuild, Parcel, and Next.js/Turbopack documentation is used for examples. [Vite migration](https://vite.dev/guide/migration) · [Webpack concepts](https://webpack.js.org/concepts/) · [esbuild API](https://esbuild.github.io/api/)

## How this group fits the mental model

A tool may offer only some phases of the pipeline, and similarly named features can have different semantics. Watch, serve, live reload, and HMR are distinct; transforms differ from type checking; tree shaking differs from minification; and development output differs from production output.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Development server` | Serves application resources locally and may provide proxying, diagnostics, and file watching. It is a development aid, not automatically the production server or hosting environment. |
| `Hot Module Replacement` | Applies accepted module updates to a running app without a full page reload. The runtime/framework must know how to accept the change; unaccepted updates can bubble to a boundary or force reload. It is more than rebuilding files. [Webpack HMR](https://webpack.js.org/concepts/hot-module-replacement) |
| `Production build` | Produces deployment-oriented output using configured targets, graph transforms, splitting, optimization, and assets. Verify the actual output in the target runtime and hosting environment. |
| `Module graph` | Nodes represent resolved source modules and supported assets; edges arise from imports, references, and tool-specific dependencies. The graph informs invalidation, splitting, reachability, and optimization. |
| `Development dependency pre-bundling` | Vite's development dependency optimization reduces the cost of serving packages and normalizes dependencies. In Vite 8 the optimizer uses Rolldown rather than its prior esbuild role; this is not the same as the final production bundle. |
| `Native ESM development serving` | Vite development traditionally serves modules as browser-consumable ESM and transforms on demand rather than creating one production bundle first. Browsers still fetch a graph of requests; dependency optimization and HTTP caching address costs. Verify current Vite version behavior and do not generalize it to every tool. [Vite guide](https://vite.dev/guide/) |
| `Tree shaking` | Statically removes unused exports/statements when module syntax and side-effect analysis make removal safe. It can fail to remove dynamic/opaque code, and bad metadata may remove required side effects. It is not simply minification. [Webpack tree shaking](https://webpack.js.org/guides/tree-shaking/) |
| `Code splitting` | Divides output into entry/shared/async chunks to control initial download and reuse. Chunk graphs are tool-specific; excessive splits can add requests/runtime overhead. |
| `Dynamic import chunking` | `import()` marks an asynchronous loading boundary that many tools can emit as a lazy chunk. It does not guarantee a separate chunk in every mode/tool; esbuild, for example, requires splitting and ESM output in its documented support. [esbuild splitting](https://esbuild.github.io/api/#splitting) |
| `Asset and CSS processing` | Resolves imported images/fonts/styles and applies loaders/transforms/extraction/inlining rules. Output may be emitted files, URLs, data URIs, or injected styles; CSS cascade order and side effects matter. |
| `HTML entry processing` | Treats HTML and its script/style/asset references as part of the graph, rewrites URLs, and emits deployable markup/assets. Parcel and Vite support HTML entry workflows; semantics differ by tool. |
| `Source transformation` | Converts TypeScript, JSX, CSS, or newer JavaScript syntax into target syntax or bundler modules. A transform may strip types but skip semantic type checking. |
| `Minification` | Shortens/rewrites output to reduce bytes or improve parsing. It follows or accompanies other optimization passes, can affect debugging, and does not guarantee smaller output in all cases. |
| `Plugin API` | Hooks into broader stages such as resolving, loading, transforming, building, or emitting. Hook names may look similar across tools without matching ordering, data, or lifecycle guarantees. Verify compatibility against the tool/version. |
| `Loader API` | Usually maps matching files to transformations/module representations. Webpack loaders are commonly chained and focused on a resource; plugin APIs span broader build lifecycle. Other tools use different terminology/interfaces. |
| `Watch mode` | Observes files and triggers rebuilds when inputs change. It does not imply an HTTP server, browser reload, or HMR. |
| `Incremental rebuild` | Reuses graph/transform/cache work from a previous build. Invalidation correctness is essential; edits to config, environment, or dependencies may require broader rebuilds. |
| `Lazy compilation` | Defers compiling modules/routes until requested, reducing cold startup work. Turbopack uses lazy bundling in Next.js; this changes when diagnostics/work occur. |
| `Content-hashed output names` | Includes a content-derived hash in filenames so changed output gets a new URL and unchanged files can be cached longer. Ensure HTML/manifests reference the new hashed assets and configure cache headers consistently. |
| `Output target and format` | Chooses runtime environment and module form, such as browser/Node/Bun and ESM/CJS/IIFE. A target controls syntax/polyfills/resolution expectations; it does not automatically make APIs exist in the deployment runtime. |
| `Side-effect metadata` | Hints that files/packages are safe to omit when exports are unused. Incorrect `sideEffects` declarations can drop CSS, polyfills, registration code, or global initialization; test production output. [Webpack tree shaking](https://webpack.js.org/guides/tree-shaking/) |
| `Environment variable replacement` | Replaces selected references with build-time values or flags. Browser bundles are public, so only intentionally public values may be injected; never inline secrets. |
| `Development proxy` | Forwards local development requests to another server, often avoiding CORS setup. It does not necessarily configure production reverse proxies or deployment routing. |
| `Preview server` | Locally serves already-built output for inspection. It is useful for checking production assets but may not reproduce CDN headers, edge/server rendering, URL base paths, or hosting rewrites. |
| `Library mode` | Builds distributable packages with selected entry points/formats/externals instead of a single application site. Consumers' module systems and package exports must match generated files. |
| `Multiple entry points` | Builds several independent roots, pages, or library entry modules. Shared dependencies may be extracted or duplicated according to tool/output settings. |
| `Type checking versus transpilation` | Transpilation transforms syntax; type checking analyzes TypeScript relationships and diagnostics. Many bundlers use fast per-file transforms without full checking, so a separate `tsc --noEmit` or equivalent is often needed. |
| `Persistent build cache` | Stores reusable work across process restarts. Cache keys/invalidation must account for inputs, config, tool/plugin versions, environment, and dependencies. Webpack 5 added filesystem cache; Rspack 2.3 introduced an experimental new cache. |

## Cross-item comparison

Watch mode triggers work; incremental rebuild optimizes repeated work; a dev server serves results; live reload refreshes a page; HMR replaces accepted modules. They can be combined, but one does not imply another. Webpack HMR uses a runtime/update mechanism; esbuild watch+serve does not provide HMR; Parcel/Vite/Next integrate different reload/update behavior. [Webpack HMR](https://webpack.js.org/concepts/hot-module-replacement) · [esbuild contexts](https://esbuild.github.io/api/#incremental)

Tree shaking removes code using usage/side-effect analysis. Code splitting changes file/chunk boundaries. Minification rewrites output. Content hashes change asset URLs for caching. These can all affect output size or loading but solve different problems. Browser deployment must preserve the generated reference graph and cache policy.

## Examples

### Build and serve with esbuild context

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

This enables incremental watch and serving. It does not inject an HMR client/runtime; browser updates may require reload or another tool. [esbuild API](https://esbuild.github.io/api/)

### Vite and TypeScript check separation

```json
{
  "scripts": {
    "dev": "vite",
    "typecheck": "tsc --noEmit",
    "build": "npm run typecheck && vite build",
    "preview": "vite preview"
  }
}
```

The explicit typecheck makes the CI contract clear. `vite preview` serves a local production build; deployment still needs the correct base path, routes, headers, and host behavior.

### Unsafe side-effect declaration

```json
{
  "sideEffects": false
}
```

This can let an optimizer omit files that appear unused, including CSS or polyfill imports. If some files have side effects, list them with appropriate package patterns or avoid a broad false claim. [Webpack tree shaking](https://webpack.js.org/guides/tree-shaking/)

## Common mistakes

- Equating a file watcher with a dev server or HMR.
- Assuming an `import()` always creates one separate chunk.
- Treating dependency pre-bundling as final production optimization.
- Marking an entire package side-effect-free without checking CSS/polyfills/registration code.
- Confusing minification with tree shaking or type checking.
- Injecting private environment values into browser bundles.
- Treating preview as production hosting verification.
- Ignoring content-hash asset references and cache-control headers.
- Selecting output formats without checking the actual runtime and package consumer.

## Knowledge checks with answers

1. **Does watch mode imply reload?** No; it only notices changes and rebuilds unless another layer refreshes the client.
2. **What does HMR add?** A runtime protocol to apply accepted module updates without full reload.
3. **Are tree shaking and minification the same?** No; one removes unused code based on analysis, the other rewrites output for size/performance.
4. **Why can sideEffects metadata be dangerous?** False claims can cause required modules to be dropped.
5. **Does a TS transform prove types are correct?** No; run a type checker separately when the bundler does not perform full semantic checking.

Sources: [Vite guide](https://vite.dev/guide/), [Vite migration](https://vite.dev/guide/migration), [Webpack HMR](https://webpack.js.org/concepts/hot-module-replacement), [Webpack tree shaking](https://webpack.js.org/guides/tree-shaking/), [esbuild API](https://esbuild.github.io/api/), [Parcel docs](https://parceljs.org/docs/), [Next.js Turbopack](https://nextjs.org/docs/pages/api-reference/turbopack), [Rspack 2.3](https://rspack.rs/blog/announcing-2-3).
