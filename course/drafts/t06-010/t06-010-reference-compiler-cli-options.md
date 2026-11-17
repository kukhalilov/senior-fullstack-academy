# TypeScript compiler, TSConfig options, project references, and build modes — Reference: Compiler command-line actions and diagnostics

## Scope and version

This lesson explains all 12 supplied names in the compiler command-line actions and diagnostics group. The separate content-mappers lesson covers the beta-only `--runExternalCode` permission. The current stable compiler is TypeScript 7.0; TypeScript 7.1 is beta as of 2026-11-16. CLI summaries follow the TypeScript 7.1.0-beta compiler help and beta package declarations. Preview-only claims are labeled beta. Do not generalize beta defaults or APIs to TypeScript 7.0. [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) · [beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta)

## How this group fits the mental model

Choose a project-oriented invocation intentionally. Bare `tsc` reads config; explicit source-file arguments normally bypass config and TypeScript 6+ requires `--ignoreConfig` to make that opt-out explicit. Diagnostic switches are observation tools, while `--runExternalCode` authorizes execution of content-mapper packages in 7.1 beta.

## Supplied names explained

Each row corresponds to one exact manifest item. CLI and config descriptions follow TypeScript's own `--all` help where applicable.

| Supplied name | What it does and why it matters |
|---|---|
| `tsc --all` | Show all compiler options. |
| `tsc --help` | Print this message. |
| `tsc --init` | Initializes a TypeScript project and creates a tsconfig.json file. |
| `tsc --version` | Print the compiler's version. |
| `tsc --ignoreConfig` | Ignore the tsconfig found and build with command-line options and files. |
| `tsc --project` | Compile the project given the path to its configuration file, or to a folder with a 'tsconfig.json'. |
| `tsc --showConfig` | Print the final configuration instead of building. |
| `tsc --watch` | Watch input files. |
| `tsc --listFilesOnly` | Print names of files that are part of the compilation and then stop processing. |
| `tsc --locale` | Set the language of the messaging from TypeScript. This does not affect emit. |
| `tsc --pprofDir` | Generate pprof CPU/memory profiles to the given directory. |
| `tsc --quiet` | Do not print diagnostics. |

## Cross-item comparison

project loads a selected config, while ignoreConfig explicitly bypasses a discovered one. showConfig inspects settings; listFilesOnly inspects project membership. runExternalCode is a beta execution permission.

--project selects and loads a config; --ignoreConfig deliberately ignores it for explicit file arguments. --showConfig inspects settings, while --listFilesOnly inspects selected inputs. --runExternalCode is a trust decision for beta content mappers, not just a performance toggle. See [7.1 beta content mappers](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/).

## Examples

Use `tsc --showConfig` to inspect normalized settings, `tsc --listFilesOnly` to inspect project members, and `tsc --project packages/api` to select a project. In a folder with `tsconfig.json`, `tsc src/a.ts` must be an explicit config bypass using `tsc --ignoreConfig src/a.ts`.



## Common mistakes

- Do not pass source file arguments while assuming the discovered tsconfig remains active; use --ignoreConfig only when deliberately bypassing it.
- quiet suppresses reporting, not the underlying compiler checks or failure status.
- --runExternalCode is an explicit code-execution decision for the beta mapper feature.

## Knowledge checks with answers

1. How do you deliberately ignore a discovered config when compiling explicit files? Use --ignoreConfig.
2. Which command prints normalized configuration without compiling? tsc --showConfig.
3. Does --quiet disable errors? No; it affects diagnostics output.

Sources: [official TypeScript configuration reference](https://www.typescriptlang.org/tsconfig/), [compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html), [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [TypeScript 7.1 beta announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/), [TypeScript 7.1 beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta).
