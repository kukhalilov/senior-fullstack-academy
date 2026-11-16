# TypeScript compiler, TSConfig options, project references, and build modes — Reference: TSConfig project inputs and inheritance

## Scope and version

This lesson explains 11 supplied names in the tsconfig project inputs and inheritance group. The current stable compiler is TypeScript 7.0; TypeScript 7.1 is beta as of 2026-11-16. CLI summaries follow the TypeScript 7.1.0-beta compiler help and beta package declarations. Preview-only claims are labeled beta. Do not generalize beta defaults or APIs to TypeScript 7.0. [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) · [beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta)

## How this group fits the mental model

Start by separating root-file discovery from dependency closure. An `exclude` entry cannot prevent an imported file from entering the program. Config inheritance and file lists are resolved relative to their declaring config; inspect `tsc --showConfig` and `tsc --listFilesOnly` before changing rules.

## Supplied names explained

Each row corresponds to one exact manifest item. For CLI and config names, the description, default, and allowed values follow the compiler own --all help where available.

| Supplied name | What it does and why it matters |
|---|---|
| `tsconfig.json` | The project configuration file. `tsc` discovers it in the current directory when invoked without source file arguments; it defines compiler settings and project roots. |
| `files` | An explicit list of root files. Relative paths resolve from the config file, and imported dependencies can still add more files. |
| `include` | Glob patterns that discover root files. It is a discovery rule, not a complete description of every dependency in the final program. |
| `exclude` | Filters files discovered through `include`; it does not block a file reached through an import, `files`, or project reference. |
| `extends` | Inherits another config. Paths are resolved relative to the config in which they were written; child options override inherited options. |
| `references` | Declares dependencies on other TypeScript projects. It enables build-graph behavior when paired with compatible referenced-project settings. |
| `compilerOptions` | The collection of checks, resolution rules, environment declarations, and output behavior applied to the project. |
| `watchOptions` | Controls filesystem watching behavior for watch mode; it does not define the source-file set. |
| `Project reference` | A typed build boundary to another project, normally consuming its declaration output instead of rechecking its implementation as one large project. |
| `Solution-style tsconfig` | A coordinating config with `files: []` and references to subprojects. It gives `tsc --build` a graph entry point without compiling a combined source program. |
| `Referenced project redirect` | An editor/compiler behavior that can use a referenced project’s source instead of generated declarations in selected scenarios; it is a development convenience, not a replacement for a correct build graph. |

## Cross-item comparison

files and include determine roots differently: one enumerates paths and one expands patterns. exclude only applies to the pattern expansion; references add a separate build dependency edge. extends shares common policy without merging all path bases into one directory.

files and include determine roots differently: one enumerates paths and one expands patterns. exclude only applies to the pattern expansion; references add a separate build dependency edge. extends shares common policy without merging all path bases into one directory.

## Examples

A package with `src/main.ts` importing `src/generated/schema.ts` still checks the generated file even if `exclude` mentions `src/generated/**`. Move it behind a separate referenced project or change the import boundary. Use `extends` for shared options, but keep package-specific roots and output paths local.

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

- Do not treat exclude as a dependency deny-list; imports can still add files to the program.
- Do not assume every inherited path is relative to the extending config; each path follows its own config resolution rules.
- Check showConfig and listFilesOnly before broadening or narrowing project globs.

## Knowledge checks with answers

1. Does exclude block imported files? No; it only filters roots discovered by include.
2. What reveals the resolved config after extends? tsc --showConfig.
3. What explains unexpected program membership? tsc --listFilesOnly or tsc --explainFiles.

Sources: [official TypeScript configuration reference](https://www.typescriptlang.org/tsconfig/), [compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html), [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [TypeScript 7.1 beta announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/), [TypeScript 7.1 beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta).
