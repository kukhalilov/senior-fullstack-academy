# JavaScript bundlers, build pipelines, and development servers — Reference: Primary configuration entry points

## Scope and version

This lesson explains all 17 supplied interfaces. It shows the main place each tool is configured, not every option or plugin. Vite 8.3/Rolldown migration details and Turbopack's Next.js limitations are noted because apparently similar configuration APIs are not fully interchangeable. [Vite guide](https://vite.dev/guide/) · [Rspack configuration](https://rspack.rs/guide/start/introduction) · [Turbopack configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack)

## How this group fits the mental model

Configuration declares entry points, target, resolution, transforms, plugins, and output. CLI tools, config files, JavaScript APIs, and framework-owned configs expose different subsets. Begin with the actual host/framework, then choose the tool's supported configuration surface instead of copying config from a similarly named product.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `vite.config.ts` | Vite's project config file, commonly exporting a config object or function. It can configure plugins, server, build, resolution, CSS, and more. The TypeScript config file is loaded by Vite's config loader; its syntax/types do not make Vite itself a type checker. |
| `Vite defineConfig` | Helper from `vite` that provides inference/context for a Vite config and supports a config callback receiving command/mode. It improves authoring; it does not validate that plugins support Vite 8/Rolldown. [Vite config](https://vite.dev/config/) |
| `Vite server/build/optimizeDeps configuration` | `server` configures the dev server/proxy; `build` controls production output; `optimizeDeps` configures development dependency optimization. With Vite 8.3, Rolldown powers unified bundling and deprecated/changed esbuild optimizer settings should be migrated per the versioned guide. |
| `Webpack configuration object` | CommonJS/ESM config object with fields such as `entry`, `output`, `mode`, `module.rules`, `resolve`, `plugins`, and `optimization`. Webpack config is powerful and explicit; load environment-specific values intentionally. [Webpack concepts](https://webpack.js.org/concepts/) |
| `Webpack loader` | Resource transform configured in `module.rules` with `test`, `use`, and optional chaining/options. Loaders typically transform a matched resource into a module; ordering and `pitch`/normal execution rules matter. A loader is not a broad compiler lifecycle plugin. |
| `Webpack plugin` | An object with `apply(compiler)` that taps compiler/compilation hooks to extend broad build behavior such as assets, optimization, or environment injection. Plugin compatibility can depend on Webpack version and internals. |
| `webpack-dev-server configuration` | Companion server settings under `devServer`, including host/port, static content, proxy, history fallback, and HMR options. HMR behavior uses Webpack's runtime; from webpack-dev-server v4 it is enabled by default unless disabled. [DevServer](https://webpack.js.org/configuration/dev-server/) |
| `Rollup configuration object` | Common config typically specifies `input`, `output`, plugins, external modules, and treeshaking options. It can be exported as one or multiple configurations to build several targets/formats. [Rollup introduction](https://rollupjs.org/introduction/) |
| `Rollup plugin` | Plugin object hooks into resolution, loading, transform, build, and output phases. Hooks have ordering/parallelism conventions and Rollup-specific semantics; Vite/Rolldown compatibility depends on the subset and version. |
| `esbuild BuildOptions` | Options passed to `build()`/CLI such as `entryPoints`, `bundle`, `platform`, `format`, `target`, `outdir`, `loader`, `define`, `plugins`, and `splitting`. Code splitting currently requires ESM output and an output directory. [esbuild API](https://esbuild.github.io/api/) |
| `esbuild context API` | `context(options)` creates a reusable build context with `watch()`, `serve()`, `rebuild()`, and `dispose()`. It enables incremental workflows and serving, but not HMR by itself. Use the async JS API for plugins. [esbuild contexts](https://esbuild.github.io/api/#incremental) |
| `Parcel CLI` | Commands such as `parcel src/index.html`, `parcel build src/index.html`, and `parcel watch ...` select development, production, or watch workflows. Parcel 2 discovers many transformations automatically; `.parcelrc` and package targets configure specialized behavior. CLI behavior differs between Parcel 2 and alpha Parcel 3. [Parcel CLI](https://parceljs.org/features/cli) |
| `Parcel targets` | Package `targets` configuration describes output environments/formats and package entry points for library/multi-target builds. Target behavior works with Parcel's package and browser assumptions; verify generated formats and externalization for the consumer. [Parcel targets](https://parceljs.org/features/targets) |
| `Rspack configuration object` | Webpack-shaped configuration for entries, output, rules/loaders, plugins, optimization, resolve, dev server, and cache. Rspack 2.3.3 preserves broad ecosystem compatibility but its migration docs list changes; its HTTP module lockfile format changed in 2.3.3, so regenerate old-format files before frozen builds. Test plugins and defaults before migrating. [Rspack intro](https://rspack.rs/guide/start/introduction) · [2.3 release](https://rspack.rs/blog/announcing-2-3) · [releases](https://github.com/web-infra-dev/rspack/releases) |
| `Turbopack configuration in next.config.js` | The top-level `turbopack` object in Next.js config controls root, resolve aliases/extensions, and supported loader rules. It does not accept webpack plugins. The former `experimental.turbo` name is legacy; use `turbopack` for current Next.js config. Next.js 16 uses Turbopack by default for dev/build, with `--webpack` available as an opt-out. [Turbopack config](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack) |
| `Rolldown configuration and plugin API` | Standalone Rolldown configuration uses input/output/build options and Rollup-compatible-style plugins with additional features. Vite 8 embeds Rolldown through Vite's config/plugin surface, but not every Rolldown option or hook is exposed/compatible identically. [Rolldown guide](https://rolldown.rs/guide/) · [Vite plugin API](https://v8.vite.dev/guide/api-plugin) |
| `Bun.build options` | `Bun.build({ entrypoints, outdir, target, format, splitting, plugins, ... })` returns a promise with output artifacts/logs; Bun also offers `bun build`. Target, runtime, plugin, declaration, and splitting limitations are option-specific; inspect the current API before relying on a feature. [Bun bundler](https://bun.sh/docs/bundler) |

## Cross-item comparison

Webpack and Rspack share much of the config shape, but Rspack's compatibility is not a blanket guarantee. Webpack loaders and plugins serve different scopes. Next.js Turbopack may run supported loaders through its adapter but does not accept webpack plugins. Vite's plugin interface shares concepts with Rollup, and Vite 8 uses Rolldown, but version-specific migration notes still matter.

An esbuild JavaScript `BuildOptions` object is a direct API to a build engine; its `context` adds reusable incremental/watch/serve behavior. Parcel CLI emphasizes command and package config rather than a webpack-style config object. Bun.build is also a JavaScript API but is tied to Bun. Match the config surface to the exact installed tool/version and runtime. [esbuild API](https://esbuild.github.io/api/) · [Parcel CLI](https://parceljs.org/features/cli) · [Bun bundler](https://bun.sh/docs/bundler)

## Examples

### Vite configuration shape

```ts
import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => ({
  server: { proxy: { "/api": "http://localhost:3000" } },
  build: { sourcemap: mode === "development" },
  define: { __DEV__: command === "serve" },
}));
```

This demonstrates config shape only; verify current option names and migration status before copying an old optimizer option. Do not put secret values in `define` when building browser code.

### Webpack loader vs plugin shape

```js
export default {
  module: {
    rules: [{ test: /\.svg$/, use: ["some-svg-loader"] }],
  },
  plugins: [new SomeBuildPlugin()],
};
```

The loader transforms matching resources. The plugin participates in the broader compiler lifecycle. The specific package must be installed and compatible with the selected Webpack/Rspack runtime.

### Turbopack belongs in Next config

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: { "@ui": "./src/ui" },
  },
};

export default nextConfig;
```

This config is interpreted by Next.js; it is not a standalone Turbopack config and cannot register webpack plugins.

## Common mistakes

- Copying Webpack config fields into Vite/Rolldown or Next/Turbopack without checking their APIs.
- Calling a loader a plugin or assuming the reverse.
- Assuming a webpack plugin works in Rspack or Turbopack because the config looks similar.
- Using deprecated Vite 8 esbuild optimizer options instead of the migration guidance.
- Expecting `esbuild.context().serve()` to provide HMR.
- Treating Parcel 3 alpha config as stable Parcel 2 syntax.
- Exposing secrets through `define`/environment replacement.
- Assuming API names remain stable across major/minor tool releases without migration review.

## Knowledge checks with answers

1. **Where are Webpack loaders configured?** Under `module.rules`, typically with a file-matching test and a loader chain.
2. **What lifecycle does a Webpack plugin access?** Compiler/compilation hooks across broader build behavior.
3. **Can Next.js Turbopack use Webpack plugins?** No; it supports selected webpack loaders but not webpack plugins.
4. **Does esbuild's context provide HMR?** No, it provides incremental build/watch/serve APIs.
5. **What changed in Vite 8 optimizer setup?** The dependency optimizer uses Rolldown; migrate old esbuild-specific settings according to Vite's guide.

Sources: [Vite config](https://vite.dev/config/), [Vite migration](https://vite.dev/guide/migration), [Webpack concepts](https://webpack.js.org/concepts/), [webpack-dev-server](https://webpack.js.org/configuration/dev-server/), [Rollup](https://rollupjs.org/introduction/), [esbuild](https://esbuild.github.io/api/), [esbuild contexts](https://esbuild.github.io/api/#incremental), [Parcel CLI](https://parceljs.org/features/cli), [Parcel targets](https://parceljs.org/features/targets), [Rspack](https://rspack.rs/guide/start/introduction), [Turbopack config](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack), [Rolldown](https://rolldown.rs/guide/), [Vite plugin API](https://v8.vite.dev/guide/api-plugin), [Bun](https://bun.sh/docs/bundler).
