# JavaScript bundlers, build pipelines, and development servers — Exercises and worked solutions

## Goals

Practice choosing a build architecture by runtime and capability, then verify the resulting graph/output instead of relying on option names. Tool behavior targets the official docs checked 2026-11-17; Vite 8.1 bundled dev mode is experimental, Next.js 16 defaults to Turbopack, and Parcel 3 is treated as alpha. [Vite 8.1](https://vite.dev/blog/announcing-vite8-1) · [Next.js Turbopack](https://nextjs.org/docs/pages/api-reference/turbopack) · [Parcel 3 alpha](https://v3.parceljs.org/blog/v3-alpha/)

## Worked example

A team has a Vite 7 application and upgrades to Vite 8. It relied on esbuild-specific dependency optimizer configuration and a Rollup plugin hook. The safe workflow is:

1. Read Vite's Vite 8 migration guide and identify the options/hooks that changed or are unsupported.
2. Migrate optimizer settings to the documented Rolldown equivalent where one exists.
3. Check plugin compatibility against Vite 8/Rolldown rather than assuming Rollup compatibility.
4. Run dev, production build, tests, and a production-output smoke test.
5. Keep a rollback path until the actual framework and plugins work under the new pipeline.

Vite 8's major change is the unified Rolldown bundler and Oxc-based transforms; it is not accurate to say “Vite still uses Rollup for production.” [Vite 8](https://vite.dev/blog/announcing-vite8.html) · [Migration guide](https://vite.dev/guide/migration)

## Exercises

1. **Separate the terms.** For a tool that watches files, rebuilds, serves output, and refreshes the browser, classify which capabilities are watch mode, incremental rebuild, dev server, live reload, and HMR. State what additional mechanism HMR needs.
2. **Select the tool.** Choose an option for (a) a legacy app depending on Webpack plugins, (b) a Next.js application, (c) a small build needing fast transforms but no HMR, and (d) a library requiring ESM/CJS outputs. Give one caveat per choice.
3. **Vite 8 migration.** Explain the major Vite 7→8 internal change and how you would verify a plugin using a Rollup hook that is listed as unsupported by migration notes.
4. **Parcel release status.** A team wants to adopt Parcel 3 because its alpha announcement claims faster builds. Summarize the architectural change and name at least three alpha limitations that should affect the decision.
5. **Rspack migration.** A Webpack project uses five third-party plugins and custom loaders. Explain why Rspack's webpack compatibility is helpful but insufficient evidence to migrate without testing.
6. **HMR or rebuild?** A dev server returns new files after a save, but the current page does not update state-preservingly. Diagnose what may be happening and propose a test that distinguishes HMR from full reload.
7. **TypeScript build architecture.** Set up a pipeline that type-checks TS and bundles browser assets. Explain why a fast TS transform alone does not provide the same guarantee.
8. **Tree shaking.** A production build loses imported CSS after the package metadata sideEffects false was added. Explain the metadata error and a safer correction.
9. **Async chunks.** A route uses a dynamic import of ./admin, but the output has no separate chunk. List configuration/format reasons to inspect and explain why a dynamic import is not an unconditional chunk guarantee.
10. **Content hashes.** Explain how hashed asset filenames support caching and what must update when a file changes.
11. **Secrets.** A frontend build uses an environment replacement to inline an API secret. Explain why this is unsafe and how to structure public configuration versus server-only credentials.
12. **Local preview.** A production build works under a local preview server but fails when deployed under /app/ behind a CDN. Name infrastructure/build details that could differ.

## Progressive hints

1. A file watcher only detects changes; HMR needs a runtime update path and acceptance boundary.
2. Consider each tool's ecosystem and whether it is a framework integration or standalone engine.
3. Vite 8 replaces the older two-bundler split; check current migration docs and each plugin hook.
4. Parcel 3 is Rust-based but alpha; its own announcement lists unfinished APIs/features.
5. Compatibility is per API/hook/loader, not binary based on similar config shape.
6. The page may simply reload or the module update may be unaccepted and bubble to a reload boundary.
7. Add an explicit project type-check step, usually tsc --noEmit.
8. CSS import has a side effect; list it as side-effectful instead of claiming all files are pure.
9. Check splitting enabled, output format, target, and whether the bundler recognizes the boundary.
10. HTML/manifests must reference new names; deploy cache headers must differ for hashed versus entry HTML.
11. Anything in browser output is visible to users.
12. Base path, fallback routing, server-side routes, compression, headers, and CDN URL behavior can differ.

## Complete solutions

1. Watch mode observes files; incremental rebuild reuses work; a dev server serves current resources; live reload refreshes the page; HMR replaces modules through an update runtime when boundaries accept changes. HMR needs a client/runtime protocol and module/framework integration. esbuild's context watch/serve does not itself implement HMR. [Webpack HMR](https://webpack.js.org/concepts/hot-module-replacement) · [esbuild API](https://esbuild.github.io/api/)
2. (a) Webpack 5 is likely the least disruptive because it supports the ecosystem directly; still check plugin compatibility/version. (b) Use Next.js 16's default Turbopack if required features work; use `--webpack` when a needed plugin is unsupported. (c) esbuild is a reasonable fast transform/build tool, but add a separate HMR/dev workflow if needed. (d) Rollup is common for library output and multiple formats; CommonJS support may require plugins. Alternatives can be valid depending on constraints. [Webpack](https://webpack.js.org/concepts/) · [Next.js Turbopack](https://nextjs.org/docs/pages/api-reference/turbopack) · [Rollup](https://rollupjs.org/introduction/)
3. Vite 8 unifies development and production bundling on Rolldown and uses Oxc-based transforms instead of the previous esbuild-development/Rollup-production split. Vite 8.1 adds experimental bundled dev mode, which is not the default. For an unsupported hook, find a supported hook/alternative or replace the plugin; validate output behavior with actual build fixtures. Do not assume a Vite plugin works because it worked with Rollup in Vite 7. [Vite 8.1](https://vite.dev/blog/announcing-vite8-1) · [Migration](https://vite.dev/guide/migration)
4. Parcel 3 alpha is a Rust rewrite, with a native plugin ABI, embedded QuickJS for JS/TS plugins, centralized configuration, and changed bundling/library output. The announcement lists declaration generation, custom bundler plugins, and a programmatic JS API as incomplete; it is an alpha and may have known issues. Use Parcel 2.15 for a stable baseline, and evaluate alpha only in a pinned branch with migration tests. [Parcel 3 alpha](https://v3.parceljs.org/blog/v3-alpha/) · [Parcel 2.15](https://v3.parceljs.org/blog/v2-15-0/)
5. Rspack is designed for broad webpack API compatibility and may reduce migration effort, but compatibility is not complete. Test each plugin and loader against the exact Rspack 2.3 version; inspect changed defaults and output semantics; run production and dev workflows; and keep webpack fallback until critical behavior is verified. [Rspack 2.3](https://rspack.rs/blog/announcing-2-3) · [Migration](https://rspack.rs/guide/migration/rspack_1.x)
6. The server may rebuild and serve fresh assets while causing a full reload; HMR may also be disabled, unsupported for a module type, or fail to find an accepting boundary. Add a state counter, edit a component, and observe whether state survives; inspect the HMR client/update logs. A hard reload resets state, while HMR may preserve it depending on framework boundaries.
7. Use tsc --noEmit (or an equivalent type checker) as a separate CI step and the selected bundler for output. Transpilation removes/rewrites syntax but may skip whole-program semantic type analysis. Type checking and bundling have different jobs.
8. The sideEffects false metadata says every file can be skipped when unused. Imported CSS is a side effect; list CSS files/patterns in the sideEffects array or adjust metadata so the optimizer retains them. Inspect emitted CSS in production mode. [Webpack tree shaking](https://webpack.js.org/guides/tree-shaking/)
9. Verify splitting is enabled, the target/output format supports it, the build is in production/bundle mode, the import expression remains analyzable, and shared/async chunk output rules are not folding it into another file. esbuild splitting currently requires ESM output and an output directory. Different tools may choose chunk boundaries differently. [esbuild splitting](https://esbuild.github.io/api/#splitting)
10. A content hash changes an asset's URL when bytes change, allowing long-lived caching for immutable hashed assets. The HTML/manifest/runtime references must point to the new filename. HTML/entry documents usually need shorter/revalidation caching so clients can discover new hashes.
11. Client bundles are public and can be downloaded or inspected. Expose only explicitly public values (for example a public API base URL); keep credentials on a server and proxy/authorize requests there. Build-time replacement is not secret storage.
12. A subpath deployment may require a base/public path; CDN origin and path rewriting can differ; server fallback/SPA routing may not be configured; headers/compression/caching can differ; server-rendered routes may require a Node/server runtime not provided by static preview. Test the exact deployment shape or a faithful local equivalent.

## Tests and edge cases

- Compare a cold build and warm build separately; caching changes the measurement.
- Run type checking and production bundling as separate CI jobs or commands and ensure both fail the build on errors.
- Inspect generated chunk graph/metafile and asset requests, not only build success.
- Test HMR state preservation and full-reload fallback distinctly.
- Verify CSS, polyfills, registration, and other side effects remain after production optimization.
- Test the exact target (browser/Node/Bun) and deployed base path.
- Pin alpha/beta tooling in a separate experiment; do not confuse it with stable release behavior.
- Re-run plugin compatibility checks after major bundler migrations and plugin upgrades.

## Reflection questions

- Which parts of your current feedback loop are watch, rebuild, serve, reload, or HMR?
- Does the selected bundler's plugin API cover your required integrations?
- How do you prove tree shaking retained important side effects?
- Which build values may safely appear in a public client artifact?
- Does local preview match your production routes, base path, and cache behavior?
