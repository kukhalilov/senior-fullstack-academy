# TypeScript compiler, TSConfig options, project references, and build modes — Reference: Build orchestration and parallelism command-line options

## Scope and version

This lesson explains 9 supplied names in the build orchestration and parallelism command-line options group. The current stable compiler is TypeScript 7.0; TypeScript 7.1 is beta as of 2026-11-16. CLI summaries follow the TypeScript 7.1.0-beta compiler help and beta package declarations. Preview-only claims are labeled beta. Do not generalize beta defaults or APIs to TypeScript 7.0. [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) · [beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta)

## How this group fits the mental model

Build mode coordinates project-reference dependencies. `--checkers` controls type-checker workers within a project; `--builders` controls concurrent referenced projects. Their product can be much larger than either value, so tune memory and CPU together. `--singleThreaded` is a reproducibility/debugging/resource control.

## Supplied names explained

Each row corresponds to one exact manifest item. For CLI and config names, the description, default, and allowed values follow the compiler own --all help where available.

| Supplied name | What it does and why it matters |
|---|---|
| `tsc --build` | Build one or more projects and their dependencies, if out of date |
| `tsc --force` | Build all projects, including those that appear to be up to date. |
| `tsc --dry` | Show what would be built (or deleted, if specified with '--clean') |
| `tsc --clean` | Delete the outputs of all projects. |
| `tsc --verbose` | Enable verbose logging. |
| `tsc --checkers` | Set the number of checkers per project. |
| `tsc --builders` | Set the number of projects to build concurrently. |
| `tsc --singleThreaded` | Run in single threaded mode. |
| `tsc --stopBuildOnErrors` | Skip building downstream projects on error in upstream project. |

## Cross-item comparison

Per-project checkers and project builders have multiplicative concurrency.

The --checkers switch scales checking work inside each project, while --builders schedules project nodes in the reference graph. Four of each may permit sixteen checkers at once, which can exceed a CI runner memory budget. --singleThreaded is a whole-compiler control for debugging or strict resource constraints. See the [TypeScript 7.0 parallelism guide](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/).

## Examples

For a graph build, begin with `tsc --build --dry --verbose`; then use `tsc --build` for real output. Increase `--checkers` for within-project parallel checking or `--builders` for multiple references; avoid setting both aggressively because their concurrency multiplies.



## Common mistakes

- High builders and checkers values multiply and can exhaust memory.
- Use --dry before a clean operation when project outputs matter.
- A build should begin with correct project references and outputs before parallelism is tuned.

## Knowledge checks with answers

1. Which flag controls parallel checkers inside a project? --checkers.
2. Which flag controls concurrent referenced project builds? --builders.
3. How can concurrency grow unexpectedly? The worker counts multiply.

Sources: [official TypeScript configuration reference](https://www.typescriptlang.org/tsconfig/), [compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html), [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [TypeScript 7.1 beta announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/), [TypeScript 7.1 beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta).
