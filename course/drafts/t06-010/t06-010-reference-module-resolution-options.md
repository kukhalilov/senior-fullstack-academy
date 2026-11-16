# TypeScript compiler, TSConfig options, project references, and build modes — Reference: Module resolution, paths, and package metadata options

## Scope and version

This lesson explains 20 supplied names in the module resolution, paths, and package metadata options group. The current stable compiler is TypeScript 7.0; TypeScript 7.1 is beta as of 2026-11-16. CLI summaries follow the TypeScript 7.1.0-beta compiler help and beta package declarations. Preview-only claims are labeled beta. Do not generalize beta defaults or APIs to TypeScript 7.0. [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) · [beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta)

## How this group fits the mental model

Select module kind and resolution together based on the runtime. `nodenext` models Node package rules; `bundler` models bundler-oriented resolution. `paths` only teaches the compiler where to look, not how to rewrite or execute an import. TypeScript 7 rejects `baseUrl`; use project-root-relative mappings.

## Supplied names explained

Each row corresponds to one exact manifest item. For CLI and config names, the description, default, and allowed values follow the compiler own --all help where available.

| Supplied name | What it does and why it matters |
|---|---|
| `allowArbitraryExtensions` | Enable importing files with any extension, provided a declaration file is present. default: false |
| `allowImportingTsExtensions` | Allow imports to include TypeScript file extensions. Requires '--moduleResolution bundler' and either '--noEmit' or '--emitDeclarationOnly' to be set. default: false |
| `allowUmdGlobalAccess` | Allow accessing UMD globals from modules. default: false |
| `baseUrl` | Historical base directory for non-relative names; deprecated in TypeScript 6 and unsupported in TypeScript 7. Remove it and make paths entries relative to the project root. [TypeScript 6 migration](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html) |
| `customConditions` | Conditions to set in addition to the resolver-specific defaults when resolving imports. |
| `deduplicatePackages` | Deduplicate packages with the same name and version. default: true |
| `module` | Specify what module code is generated. one of: commonjs, es6/es2015, es2020, es2022, esnext, node16, node18, node20, nodenext, preserve default: undefined |
| `moduleResolution` | Specify how TypeScript looks up a file from a given module specifier. one of: node16, nodenext, bundler default: `nodenext` if `module` is `nodenext`; `node16` if `module` is `node16` or `node18`; otherwise, `bundler`. |
| `moduleSuffixes` | List of file name suffixes to search when resolving a module. |
| `noResolve` | Disallow 'import's, 'require's or '<reference>'s from expanding the number of files TypeScript should add to a project. default: false |
| `noUncheckedSideEffectImports` | Check side effect imports. default: true |
| `paths` | Specify a set of entries that re-map imports to additional lookup locations. default: undefined |
| `resolveJsonModule` | Enable importing .json files. default: false |
| `resolvePackageJsonExports` | Use the package.json 'exports' field when resolving package imports. default: `true` when 'moduleResolution' is 'node16', 'nodenext', or 'bundler'; otherwise `false`. |
| `resolvePackageJsonImports` | Use the package.json 'imports' field when resolving imports. default: `true` when 'moduleResolution' is 'node16', 'nodenext', or 'bundler'; otherwise `false`. |
| `rewriteRelativeImportExtensions` | Rewrite '.ts', '.tsx', '.mts', and '.cts' file extensions in relative import paths to their JavaScript equivalent in output files. default: false |
| `rootDir` | Sets the source root that controls relative output layout. TypeScript 7.0 stable defaults it to the project directory; TypeScript 7.1.0-beta reported a computed root and emitted TS5011 in a project with a common ./src directory unless rootDir was explicit. Set it deliberately when upgrading or building from a beta. [7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [7.1 beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta) |
| `rootDirs` | Allow multiple folders to be treated as one when resolving modules. one or more: string default: Computed from the list of input files |
| `typeRoots` | Specify multiple folders that act like './node_modules/@types'. |
| `types` | Specify type package names to be included without being referenced in a source file. |

## Cross-item comparison

Resolution answers where a specifier points; it does not configure the runtime loader.

module describes module semantics; moduleResolution describes lookup. types picks ambient packages while typeRoots changes the search directories. paths affects compiler lookup but requires separate runtime mapping.

## Examples

For a bundler app, `module: "preserve"` plus `moduleResolution: "bundler"` models preserved imports. If `paths` maps `@app/*` to `./src/*`, configure the bundler alias too; emitted imports keep the alias unless another tool rewrites it.

```json
{
  "compilerOptions": {
    "strict": true,
    "module": "preserve",
    "moduleResolution": "bundler",
    "rootDir": "./src",
    "noEmit": true,
    "types": []
  },
  "include": ["src/**/*.ts"]
}
```

After changing the configuration, inspect tsc --showConfig and tsc --listFilesOnly. The first answers which settings won after inheritance; the second answers which files became roots/inputs. For resolution differences use tsc --traceResolution.

## Common mistakes

- Do not pair a module kind with an incompatible resolution strategy.
- paths does not rewrite imports or configure the runtime loader.
- baseUrl is unsupported in TypeScript 7; migrate mappings to project-root-relative paths.

## Knowledge checks with answers

1. Does paths rewrite imports? No.
2. Which setting models how specifiers are found? moduleResolution.
3. Can TypeScript 7 use baseUrl? No; migrate paths to project-root-relative entries.

Sources: [official TypeScript configuration reference](https://www.typescriptlang.org/tsconfig/), [compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html), [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [TypeScript 7.1 beta announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/), [TypeScript 7.1 beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta).
