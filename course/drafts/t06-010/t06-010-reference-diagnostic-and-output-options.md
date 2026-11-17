# TypeScript compiler, TSConfig options, project references, and build modes — Reference: Diagnostics, output formatting, and library checking options

## Scope and version

This lesson explains 14 supplied names in the diagnostics, output formatting, and library checking options group. The current stable compiler is TypeScript 7.0; TypeScript 7.1 is beta as of 2026-11-16. CLI summaries follow the TypeScript 7.1.0-beta compiler help and beta package declarations. Preview-only claims are labeled beta. Do not generalize beta defaults or APIs to TypeScript 7.0. [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) · [beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta)

## How this group fits the mental model

Use diagnostic switches to answer a question: which files entered, why did a module resolve, where is time spent, or what was emitted? `skipLibCheck` saves work by omitting declaration-file checking, but can hide mismatches. In TypeScript 7, stable type ordering is built in.

## Supplied names explained

Each row corresponds to one exact manifest item. CLI and config descriptions follow TypeScript's own `--all` help where applicable.

| Supplied name | What it does and why it matters |
|---|---|
| `diagnostics` | Output compiler performance information after building. default: false |
| `explainFiles` | Print files read during the compilation including why it was included. default: false |
| `extendedDiagnostics` | Output more detailed compiler performance information after building. default: false |
| `generateCpuProfile` | Emit a v8 CPU profile of the compiler run for debugging. default: profile.cpuprofile |
| `generateTrace` | Generates an event trace and a list of types. |
| `listEmittedFiles` | Print the names of emitted files after a compilation. default: false |
| `listFiles` | Print all of the files read during the compilation. default: false |
| `noCheck` | Disable full type checking (only critical parse and emit errors will be reported). default: false |
| `traceResolution` | Log paths used during the 'moduleResolution' process. default: false |
| `noErrorTruncation` | Disable truncating types in error messages. default: false |
| `preserveWatchOutput` | Disable wiping the console in watch mode. default: false |
| `pretty` | Enable color and formatting in TypeScript's output to make compiler errors easier to read. default: true |
| `skipDefaultLibCheck` | Skip type checking .d.ts files that are included with TypeScript. default: false |
| `skipLibCheck` | Skip type checking all .d.ts files. default: false |

## Cross-item comparison

`listFiles`/`explainFiles` reveal program membership, `traceResolution` explains a module lookup, and performance flags measure compiler work. `skipDefaultLibCheck` is narrower than `skipLibCheck`.

## Examples

If an import is unresolved, run `tsc --traceResolution`; if a file appears unexpectedly, use `--explainFiles`; if emit location is surprising, use `--listEmittedFiles`. For slow builds, collect `--extendedDiagnostics` before changing options.



## Common mistakes

- Use the narrowest diagnostic switch that answers a concrete question; traces and profiles can produce substantial output.
- skipLibCheck skips declaration-file checking broadly and can hide conflicting package types.
- A performance report is evidence about one machine and project, not a universal compiler-cost prediction.

## Knowledge checks with answers

1. Which option traces a specific module lookup? traceResolution.
2. Which option explains why files entered? explainFiles.
3. Is skipDefaultLibCheck as broad as skipLibCheck? No.

Sources: [official TypeScript configuration reference](https://www.typescriptlang.org/tsconfig/), [compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html), [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [TypeScript 7.1 beta announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/), [TypeScript 7.1 beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta).
