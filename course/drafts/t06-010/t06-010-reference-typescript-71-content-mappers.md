# TypeScript compiler, TSConfig options, project references, and build modes — Reference: TypeScript 7.1 beta embedded-content mapper support

## Scope and version

This lesson explains 2 supplied names in the typescript 7.1 beta embedded-content mapper support group. The current stable compiler is TypeScript 7.0; TypeScript 7.1 is beta as of 2026-11-16. CLI summaries follow the TypeScript 7.1.0-beta compiler help and beta package declarations. Preview-only claims are labeled beta. Do not generalize beta defaults or APIs to TypeScript 7.0. [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) · [beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta)

## How this group fits the mental model

This is a TypeScript 7.1 beta feature, not a TypeScript 7.0 capability. A content mapper supplies a virtual TypeScript view of embedded code and maps diagnostics/tooling positions back to the original file. Loading a mapper executes third-party code, so the CLI requires an explicit opt-in and the editor has its own workspace-trust controls.

## Supplied names explained

Each row corresponds to one exact manifest item. For CLI and config names, the description, default, and allowed values follow the compiler own --all help where available.

| Supplied name | What it does and why it matters |
|---|---|
| `contentMappers` | A top-level TypeScript 7.1 beta config entry registering third-party virtual source mappers by package and file extension. The mapper returns source plus span mappings for embedded code; it is not an ordinary compilerOptions switch. |
| `tsc --runExternalCode` | Allow loading external content mapper plugins that execute code during compilation. |

## Cross-item comparison

contentMappers registers a virtual-source transform; runExternalCode authorizes running its package. A declaration file alone types an import but cannot perform this transformation.

contentMappers registers a virtual-source transform; runExternalCode authorizes running its package. A declaration file alone types an import but cannot perform this transformation.

## Examples

The 7.1 beta announcement illustrates a top-level contentMappers entry for an illustrative package named @vue/content-mapper (the announcement states it is not on npm). It registers the .vue extension and passes an options object. The compiler applies it to files that enter the project through files, include, or imports. Run tsc --runExternalCode only after reviewing and trusting the actual mapper package; an ambient declaration alone does not create this virtual source behavior.



## Common mistakes

- The 7.1 contentMappers feature is beta; do not present it as a stable TypeScript 7.0 capability.
- Review mapper packages as executable code before enabling --runExternalCode.
- Editor workspace trust/permissions are separate from the CLI opt-in.

## Knowledge checks with answers

1. Where is contentMappers configured? At the top level of the beta config shape, not under compilerOptions.
2. What authorizes mapper code in the CLI? --runExternalCode.
3. Does a declaration for .vue files itself transform the embedded script? No.

Sources: [official TypeScript configuration reference](https://www.typescriptlang.org/tsconfig/), [compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html), [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [TypeScript 7.1 beta announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/), [TypeScript 7.1 beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta).
