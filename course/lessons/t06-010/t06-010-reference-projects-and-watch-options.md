# TypeScript compiler, TSConfig options, project references, and build modes — Reference: Incremental project and watch compiler options

## Scope and version

This lesson explains 13 supplied names in the incremental project and watch compiler options group. The current stable compiler is TypeScript 7.0; TypeScript 7.1 is beta as of 2026-11-16. CLI summaries follow the TypeScript 7.1.0-beta compiler help and beta package declarations. Preview-only claims are labeled beta. Do not generalize beta defaults or APIs to TypeScript 7.0. [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) · [beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta)

## How this group fits the mental model

Watch settings tune file observation; incremental settings persist per-project state; references define dependency boundaries. The mechanisms can combine but are not interchangeable. Correct references and composite outputs come before tuning filesystem polling.

## Supplied names explained

Each row corresponds to one exact manifest item. CLI and config descriptions follow TypeScript's own `--all` help where applicable.

| Supplied name | What it does and why it matters |
|---|---|
| `composite` | Enable constraints that allow a TypeScript project to be used with project references, including requiring its implementation files to be covered by the project inputs. It also forces declaration generation and defaults incremental mode on; `tsBuildInfoFile` can select the cache path. default: false |
| `disableReferencedProjectLoad` | Reduce the number of projects loaded automatically by TypeScript. default: false |
| `disableSolutionSearching` | Opt a project out of multi-project reference checking when editing. default: false |
| `disableSourceOfProjectReferenceRedirect` | Disable preferring source files instead of declaration files when referencing composite projects. default: false |
| `incremental` | Save .tsbuildinfo files to allow for incremental compilation of projects. default: `false`, unless `composite` is set |
| `tsBuildInfoFile` | Specify the path to .tsbuildinfo incremental compilation file. default: .tsbuildinfo |
| `assumeChangesOnlyAffectDirectDependencies` | In incremental watch mode, assume a changed file only affects its direct dependents, skipping some downstream rechecks for speed. This is a performance trade-off that can defer diagnostics until a fuller build. default: false |
| `watchFile` | The strategy for watching individual files: fixedPollingInterval, priorityPollingInterval, dynamicPriorityPolling, useFsEvents (default), or useFsEventsOnParentDirectory. Polling can use more resources; native events can have platform or watcher-limit constraints. [watchFile](https://www.typescriptlang.org/tsconfig/watchFile.html) |
| `watchDirectory` | The strategy for watching directory trees on systems without recursive native watching: fixed polling, dynamic priority polling, or native useFsEvents (default). [watchDirectory](https://www.typescriptlang.org/tsconfig/watchDirectory.html) |
| `fallbackPolling` | The polling strategy used when native file events are unavailable or watcher limits are exhausted. It supports fixed, priority, and dynamic-priority polling; synchronousWatchDirectory is another related setting. [fallbackPolling](https://www.typescriptlang.org/tsconfig/fallbackPolling.html) |
| `synchronousWatchDirectory` | On platforms without recursive watching, synchronously invokes callbacks and updates directory watcher state instead of deferring briefly to coalesce several file edits. [synchronousWatchDirectory](https://www.typescriptlang.org/tsconfig/synchronousWatchDirectory.html) |
| `excludeDirectories` | Excludes selected directories from watch observation; useful to reduce the number of open file watchers. It does not remove source files from the TypeScript program. [excludeDirectories](https://www.typescriptlang.org/tsconfig/excludeDirectories.html) |
| `excludeFiles` | Excludes selected individual files from watch observation; this is not the same as exclude for include-pattern discovery and does not prevent imports from entering the program. [excludeFiles](https://www.typescriptlang.org/tsconfig/excludeFiles.html) |

## Cross-item comparison

Build graph, cache, and watcher solve different scaling problems.

incremental stores reusable work; composite imposes constraints that support project references. Watch options tune file observation, not build dependency order.

## Examples

A root solution config can contain `files: []` and references to `packages/core` and `apps/site`. Mark referenced packages `composite`, build from the solution with `tsc --build`, and use incremental metadata to avoid repeating unchanged work.



## Common mistakes

- incremental caching does not define dependency order; references do.
- Watch exclusions change observation and do not remove files from type checking.
- Polling trades responsiveness and watcher compatibility against CPU use; measure before forcing a strategy.

## Knowledge checks with answers

1. Which option stores incremental build state? incremental.
2. Which option enables project-reference constraints? composite.
3. Does excludeFiles keep a source file out of type checking? No; it only excludes it from watch observation.

Sources: [official TypeScript configuration reference](https://www.typescriptlang.org/tsconfig/), [compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html), [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [TypeScript 7.1 beta announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/), [TypeScript 7.1 beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta).
