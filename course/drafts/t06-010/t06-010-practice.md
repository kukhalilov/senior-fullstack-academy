# TypeScript compiler, TSConfig options, project references, and build modes — Exercises and worked solutions

## Goals

Practice selecting project inputs, configuring a realistic check-only build, and diagnosing why a compiler result differs from runtime behavior. All examples assume TypeScript 7.0 stable unless explicitly labelled 7.1 beta.

## Worked example

A repository has `packages/shared` and `apps/web`. `shared` emits declarations; `web` uses Vite for JavaScript output. Keep each package’s inputs and compiler responsibilities explicit.

`packages/shared/tsconfig.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true
  },
  "include": ["src/**/*.ts"]
}
```

`apps/web/tsconfig.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "preserve",
    "moduleResolution": "bundler",
    "target": "es2025",
    "rootDir": "./src",
    "strict": true,
    "noEmit": true,
    "types": []
  },
  "references": [{ "path": "../../packages/shared" }],
  "include": ["src/**/*.ts", "src/**/*.tsx"]
}
```

A root solution config contains `files: []` and references to both packages. Run `tsc --build` from the root. The web app’s bundler owns JavaScript output, while the shared package gives consumers declarations. The web package should use a runtime alias too if it imports through `paths`; the config alone cannot provide that alias.

## Exercises

1. A developer adds `exclude: ["src/generated/**"]`, but `src/main.ts` imports a file under that directory. Explain why the file is still checked and give a better correction.
2. An app uses Vite and wants only type diagnostics from TypeScript. Choose relevant `noEmit`, `module`, and `moduleResolution` settings. Explain what still needs to be configured outside `tsc`.
3. A package has `src/index.ts` and `scripts/generate.ts`, with the config at the package root. After upgrading, output paths gain a `src` segment. Explain the TypeScript 6/7 default change and how to choose the intended `rootDir`.
4. A Node package relies on ambient `process` types but TypeScript 6+ reports missing `process`. Explain `types` default changes and give an explicit config remedy.
5. A large monorepo needs parallel builds. Explain the difference between `--checkers` and `--builders`, including one risk of setting both high.
6. An editor extension uses the TypeScript compiler API. Which migration assumption is unsafe when moving from 6.0 to 7.0/7.1 beta?

## Progressive hints

1. `exclude` is not a deny-list for imports. Look at how roots are discovered and how dependencies are added.
2. Emit ownership is separate from module resolution. The bundler still needs to resolve aliases and load modules.
3. `rootDir` affects the relative directory structure preserved under `outDir`; do not infer it from a folder name alone.
4. `types: []` is not equivalent to “ignore package types after an import.” It prevents automatic global type package inclusion.
5. Per-project checkers and project-reference builders multiply concurrency and memory demand.
6. The 7.1 API is new and different; 7.0 has no compiler API.

## Complete solutions

1. The import adds the file to the program despite the glob exclusion. Remove or redirect the import, generate the file outside the compile boundary, or use a separate project whose references and roots express the intended boundary. Do not rely on `exclude` as a dependency firewall.
2. Use `noEmit: true` with a module/resolution pair that models the actual Vite project, commonly `module: "preserve"` and `moduleResolution: "bundler"`. Configure Vite plugins, aliases, asset handling, and runtime output separately; `tsc` does not install a bundler or rewrite `paths` aliases.
3. TypeScript 6 changed `rootDir` to default to the project directory; TypeScript 7 adopts that default. Set `rootDir: "./src"` if only source files should determine the emitted relative layout. Keep scripts in another project or include them deliberately if they belong in the same output tree.
4. TypeScript 6 changed `types` to default to an empty list. Add the needed visible package explicitly, for example `"types": ["node"]`. Types referenced through imports can still be loaded; this setting concerns automatic global type-package inclusion. [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
5. `--checkers` sets type-checker workers inside a project; `--builders` sets concurrent project-reference builders under `--build`. Their concurrency multiplies, so high values can oversubscribe CPU and memory. Measure on the actual CI runner and graph rather than copying a benchmark setting. [TypeScript 7.0 parallel build controls](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
6. Do not assume source compatibility or a stable TypeScript 7 API. TypeScript 7.0 intentionally ships without one; TypeScript 7.1 beta exposes a redesigned API and remains preview. Keep tooling on TypeScript 6 until its integration supports the exact 7.1 API and release status needed.

## Tests and edge cases

- Run `tsc --showConfig` to inspect inherited, normalized settings.
- Run `tsc --listFilesOnly` or `tsc --explainFiles` to explain an unexpected input file.
- Run `tsc --traceResolution` for a failed or surprising import.
- Run `tsc --build --dry` to inspect a project plan and `tsc --build --clean` only when intentionally removing outputs.
- Validate generated declarations by compiling a small consumer; successful source checking alone does not prove declaration consumers resolve the same modules.
- In TypeScript 7.1 beta, test virtual filesystem behavior and dispose every API object; do not use beta API claims as stable guidance.

## Reflection questions

- Which tool owns JavaScript emit in your application, and how can you make that ownership obvious?
- Do your TypeScript aliases match actual runtime resolution?
- What diagnostics would you collect before changing a strictness or resolution option?
- Which of your workspaces need project references, and which are merely sharing an incremental cache?
