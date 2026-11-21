# JavaScript bundlers, build pipelines, and development servers — Reference: Current mainstream bundlers and build platforms

## Scope and version

This lesson explains all 11 supplied tools. Snapshot checked 2026-11-20: Vite 8.3 is the current supported minor line (latest checked patch 8.3.8), building on the Vite 8 architecture; Webpack 5, Parcel 2.15 as stable with Parcel 3 alpha labeled separately, Rspack 2.3.3, and Next.js 16/Turbopack docs. Exact minor versions and compatibility can change; follow each product's release and migration docs. [Vite releases](https://vite.dev/releases) · [Vite 8.1](https://vite.dev/blog/announcing-vite8-1) · [Rolldown releases](https://github.com/rolldown/rolldown/releases) · [Rspack 2.3.3](https://rspack.rs/blog/announcing-2-3) · [Parcel 3 alpha](https://v3.parceljs.org/blog/v3-alpha/)

## How this group fits the mental model

These tools overlap in resolving and transforming module graphs, but differ in host integration, APIs, plugin compatibility, and whether they provide a full development workflow. Compare the capabilities required by a project rather than treating the word “bundler” as a compatibility promise.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Vite 8.3 (current supported Vite 8 line)` | Integrated frontend dev/build tool. Vite 8 unified its dev and production bundling on Rolldown and uses Oxc-based transforms. Migration notes enumerate unsupported/changed Rollup and esbuild options/hooks; broad API compatibility does not mean every plugin works unchanged. [Vite migration](https://vite.dev/guide/migration) |
| `Webpack 5` | Configurable application bundler with a mature ecosystem. Loaders transform modules; plugins participate in broader compiler lifecycle/build tasks. `webpack-dev-server` is a companion. Compared with v4, v5 added persistent filesystem caching, Module Federation, improved tree shaking, asset modules, and stopped automatically polyfilling Node core modules for browser builds. [Webpack 5 release](https://webpack.js.org/blog/2020-10-10-webpack-5-release/) |
| `Rollup` | ES module-centric bundler known for static analysis and tree shaking, often selected for libraries and multiple output formats. CommonJS loading and Node-like resolution are available through plugins rather than being the complete default core model. [Rollup introduction](https://rollupjs.org/introduction/) |
| `esbuild` | Fast Go-based transform/build tool with CLI and JavaScript API, watch/serve/context APIs, and plugin support in its async JS API. It does not implement HMR. Its documented code splitting remains work in progress and supports ESM output only. [esbuild API](https://esbuild.github.io/) |
| `Parcel 2` | Stable Parcel line in this snapshot (v2.15.0). It aims for integrated, low-configuration asset discovery, HTML entry handling, dev server/hot reload, caching, and target-based builds. It has its own plugin and configuration model rather than webpack loader/plugin equivalence. [Parcel docs](https://parceljs.org/docs/) · [Parcel 2.15](https://v3.parceljs.org/blog/v2-15-0/) |
| `Parcel 3 alpha` | Announced 2026-11-04 as a Rust rewrite with native plugin ABI, embedded QuickJS for JavaScript plugins, centralized configuration, and changed library/bundling behavior. It is alpha, not stable; its announcement lists declaration generation, custom bundler plugins, and a programmatic JavaScript API as incomplete. Use Parcel 2 for the stable baseline and evaluate v3 only as a pinned experiment. [Parcel 3 alpha](https://v3.parceljs.org/blog/v3-alpha/) |
| `Rspack 2.3` | Latest stable patch checked: 2.3.3. Rspack is a Rust bundler with broad webpack API compatibility for migration/performance; 2.0 modernized defaults, and 2.3 adds SWC Next parser integration, memory/build and split-chunk optimizations, and an experimental cache. Rspack 2.3.3 changes HTTP module lockfiles and content-cache filenames to match webpack; files in the previous Rspack format must be deleted and regenerated before enabling frozen builds. Check migration docs for changed defaults and unsupported plugins/loaders. Rsbuild is the higher-level tool for an integrated experience. [Rspack 2.3 release](https://rspack.rs/blog/announcing-2-3) · [Rspack releases](https://github.com/web-infra-dev/rspack/releases) · [Rspack migration](https://rspack.rs/guide/migration/rspack_1.x) |
| `Turbopack in Next.js` | Incremental Rust bundler integrated into Next.js. Next.js 16 makes it the default for development and builds; `--webpack` opts out. It is not a general standalone webpack replacement. It executes supported webpack loaders through a compatibility layer, but does not support webpack plugins and has documented gaps. Use it when Next.js supports the required feature; fall back with `--webpack` where a missing capability is essential. [Turbopack](https://nextjs.org/docs/pages/api-reference/turbopack) · [configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack) |
| `Rolldown 1.3` | Standalone Rust bundler with a largely Rollup-compatible plugin API, built-in transforms, and additional features. It is not identical to Rollup, and some features remain experimental/work in progress. Vite 8 uses it internally as the unified bundler; standalone Rolldown 1.3.2 is current in this snapshot, but do not force a Rolldown version override into Vite because Vite pins a compatible release. [Rolldown introduction](https://rolldown.rs/guide/introduction) |
| `Bun.build` | Bun's bundler exposed through a CLI and `Bun.build()` API, integrated with Bun's runtime and plugin system. Options such as target, splitting, environment replacement, declaration output, and executable generation have feature-specific constraints. Verify runtime target and maturity before using it as a generic browser/Node build pipeline. [Bun bundler](https://bun.sh/docs/bundler) |
| `TypeScript compiler emit (tsc)` | Type-checks and emits JavaScript and/or declaration files according to compiler options. It does not bundle an application dependency graph into optimized chunks. Pair it with a bundler when a bundled asset graph is required; keep type checking distinct from a transform-only bundler pipeline. [TypeScript modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html) |

## Cross-item comparison

Vite is an integrated application workflow; Webpack is a highly configurable core with a broad loader/plugin ecosystem; Rollup emphasizes static ESM analysis; esbuild focuses on speed and primitive build/context operations; Parcel optimizes for automatic integrated workflows; Rspack targets webpack-shaped projects; Turbopack is tied to Next.js and is the Next.js 16 default for dev/build; Rolldown is a standalone modern bundler; Bun.build is runtime-coupled; and `tsc` is a compiler/type checker rather than a bundler. These are role distinctions, not a ranking.

Vite 7 to 8 is a major internal pipeline change from the prior esbuild/Rollup split to Rolldown plus Oxc transforms. Vite 8.1 adds experimental bundled development mode (still experimental in Vite 8.3); Vite 8.3 is the currently supported minor line, not the default. Webpack 5's major changes from 4 included persistent cache, Module Federation, asset modules, improved tree shaking, and no automatic browser Node polyfills. Rspack 2.0 modernized defaults and output while 2.3 adds parser, split-chunk, and cache changes; 2.3.3 also changes HTTP module lockfile/cache naming, so migrate old generated files before frozen builds. Next.js 16 makes Turbopack default for dev and build, with `--webpack` opt-out. Parcel 3's Rust rewrite is still alpha, so its new plugin model and incomplete APIs must not be described as stable Parcel 2 behavior. [Vite migration](https://vite.dev/guide/migration) · [Webpack 5 release](https://webpack.js.org/blog/2020-10-10-webpack-5-release/) · [Rspack 2.3 release](https://rspack.rs/blog/announcing-2-3) · [Rspack releases](https://github.com/web-infra-dev/rspack/releases) · [Parcel 3 alpha](https://v3.parceljs.org/blog/v3-alpha/)

## Examples

### Choose a browser app tool by requirements

```text
Need existing webpack plugins and loader recipes?       → Webpack 5
Need an integrated Vite workflow and accept Rolldown?    → Vite 8
Need automatic HTML/assets processing with low config?   → Parcel 2 stable
Need webpack-shaped migration with native implementation? → Rspack 2.3.3; test each plugin
Need Next.js 16's default framework bundler?             → Turbopack if feature gaps fit
Need only a fast transform/build API?                     → esbuild, with separate HMR/type-checking needs
```

This is a decision starting point, not a universal recommendation. Confirm target support, plugin compatibility, framework integrations, deploy behavior, and team knowledge.

### Separate type checking from bundling

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "vite build"
  }
}
```

The build transforms/bundles assets; the explicit typecheck catches TypeScript errors. A tool may integrate a checker, but verify that it checks the whole project and fails CI on type errors.

## Common mistakes

- Assuming Vite 8 still uses Rollup for production; it uses Rolldown.
- Calling Vite's plugin compatibility “perfect” despite documented migration gaps.
- Saying esbuild provides HMR because it has serve/watch APIs.
- Treating Parcel 3 alpha as stable or as having complete declaration/plugin APIs.
- Treating Rspack as perfectly interchangeable with Webpack, or Turbopack as a standalone webpack clone.
- Assuming Rollup's default resolver handles all CommonJS/Node behavior without plugins.
- Assuming Bun.build's runtime-specific features automatically target browser/Node deployments.
- Treating `tsc` as an application bundler or a bundler's TypeScript transform as full type checking.
- Comparing speed numbers without matching cold/warm cache, hardware, source maps, plugins, targets, and minification.

## Knowledge checks with answers

1. **What bundler powers Vite 8?** Rolldown, unified for development and production.
2. **Which listed tool provides no HMR itself despite serving/watch support?** esbuild.
3. **Which Parcel line is alpha, and what should learners assume?** Parcel 3; label it experimental and use Parcel 2 as the stable baseline here.
4. **What is Turbopack tied to?** Next.js; in Next.js 16 it is the default for dev/build, and it is not a general standalone webpack replacement.
5. **What is `tsc`'s role?** Type checking and emit, not application graph bundling.

Sources: [Vite releases](https://vite.dev/releases), [Vite 8.1](https://vite.dev/blog/announcing-vite8-1), [Rolldown releases](https://github.com/rolldown/rolldown/releases), [Vite migration](https://vite.dev/guide/migration), [Webpack concepts](https://webpack.js.org/concepts/), [Webpack 5 release](https://webpack.js.org/blog/2020-10-10-webpack-5-release/), [Rollup](https://rollupjs.org/introduction/), [esbuild](https://esbuild.github.io/), [Parcel 2 docs](https://parceljs.org/docs/), [Parcel 3 alpha](https://v3.parceljs.org/blog/v3-alpha/), [Rspack 2.3.3](https://rspack.rs/blog/announcing-2-3), [Turbopack](https://nextjs.org/docs/pages/api-reference/turbopack), [Rolldown](https://rolldown.rs/guide/introduction), [Bun.build](https://bun.sh/docs/bundler), [TypeScript modules](https://www.typescriptlang.org/docs/handbook/modules/reference.html).
