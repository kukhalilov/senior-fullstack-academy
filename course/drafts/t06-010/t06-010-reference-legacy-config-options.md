# TypeScript compiler, TSConfig options, project references, and build modes — Reference: Historical and unsupported TSConfig option names

## Scope and version

This lesson explains 11 supplied names in the historical and unsupported tsconfig option names group. The current stable compiler is TypeScript 7.0; TypeScript 7.1 is beta as of 2026-11-16. CLI summaries follow the TypeScript 7.1.0-beta compiler help and beta package declarations. Preview-only claims are labeled beta. Do not generalize beta defaults or APIs to TypeScript 7.0. [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) · [beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta)

## How this group fits the mental model

These names are retained only to recognize old configurations and explain migrations. The current TypeScript 7 compiler does not accept the legacy settings; do not copy them into a new project. TypeScript 6 allowed `ignoreDeprecations: "6.0"` as a transition only, while `outFile` was removed already in 6.0.

## Supplied names explained

Each row corresponds to one exact manifest item. CLI and config descriptions follow TypeScript's own `--all` help where applicable.

| Supplied name | What it does and why it matters |
|---|---|
| `charset` | Historical setting with no supported role in the current compiler. Remove it rather than expecting it to affect source encoding. |
| `importsNotUsedAsValues` | Historical import-elision control. Modern TypeScript uses `verbatimModuleSyntax` for explicit type/value import behavior; this legacy name is not a current option. |
| `keyofStringsOnly` | Historical type-system behavior switch; it is not a current TypeScript 7 compiler option. Remove old configuration that depends on it and rewrite types deliberately. |
| `noImplicitUseStrict` | Historical emit control for strict-mode directives. Current compiler behavior assumes strict mode and does not support turning it off. |
| `noStrictGenericChecks` | Historical relaxation of generic function checking. It is unsupported in the current compiler; address the type incompatibility rather than relying on this switch. |
| `out` | Legacy output naming setting, not supported by the current compiler. Use current output settings or a bundler appropriate to the project. |
| `outFile (removed in TypeScript 6.0)` | TypeScript 6.0 removed concatenating emit through `outFile`; TypeScript 7.1 beta reports TS5102 when it is passed. Use a bundler for bundled JavaScript. |
| `preserveValueImports` | Historical import-preservation control replaced by the more coherent `verbatimModuleSyntax` model; not supported by current TypeScript. |
| `suppressExcessPropertyErrors` | Historical escape hatch for excess-property diagnostics; unsupported now. Correct the object shape or use a deliberate type boundary. |
| `suppressImplicitAnyIndexErrors` | Historical suppression for implicit-any index access errors; unsupported now. Model index signatures and indexed reads explicitly. |
| `ignoreDeprecations` | Transition setting accepted by TypeScript 6.0 to silence certain 6.0 deprecation warnings. It does not restore removed behavior and is not a TypeScript 7 migration strategy. |

## Cross-item comparison

These names have different histories. `ignoreDeprecations` is a TypeScript 6 transition aid; `outFile` was removed in 6.0.

## Examples

On a TypeScript 6 migration, remove `outFile` and let a bundler bundle JavaScript. Replace `baseUrl`-based aliases with project-root-relative `paths`, and remove deprecated flags rather than suppressing warnings permanently.



## Common mistakes

- Do not copy old names into new configs or treat them as current options.
- The names have different histories; do not assign one deprecation or removal release to all of them.
- ignoreDeprecations is not a way to restore removed behavior or bypass TypeScript 7 migration.

## Knowledge checks with answers

1. Can ignoreDeprecations bring back outFile? No.
2. Which legacy option was removed in TypeScript 6.0? outFile.
3. Should deprecated and removed settings be copied into a TypeScript 7 config? No.

Sources: [official TypeScript configuration reference](https://www.typescriptlang.org/tsconfig/), [compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html), [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [TypeScript 7.1 beta announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/), [TypeScript 7.1 beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta).
