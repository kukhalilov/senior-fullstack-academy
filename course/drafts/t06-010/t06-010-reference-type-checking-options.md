# TypeScript compiler, TSConfig options, project references, and build modes — Reference: Type-checking and strictness compiler options

## Scope and version

This lesson explains 21 supplied names in the type-checking and strictness compiler options group. The current stable compiler is TypeScript 7.0; TypeScript 7.1 is beta as of 2026-11-16. CLI summaries follow the TypeScript 7.1.0-beta compiler help and beta package declarations. Preview-only claims are labeled beta. Do not generalize beta defaults or APIs to TypeScript 7.0. [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) · [beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta)

## How this group fits the mental model

These settings affect static diagnostics, not runtime validation. The flags under `strict` are a family; explicitly setting one can specialize the policy, while `strict: true` is a convenient baseline. In TypeScript 7.0, strict defaults to true and `stableTypeOrdering` is always true.

## Supplied names explained

Each row corresponds to one exact manifest item. CLI and config descriptions follow TypeScript's own `--all` help where applicable.

| Supplied name | What it does and why it matters |
|---|---|
| `allowUnreachableCode` | `undefined` (default) gives editor suggestion warnings for code provably unreachable from JavaScript syntax; `true` ignores it and `false` reports compiler errors. It does not cover code that only appears unreachable through type analysis. |
| `allowUnusedLabels` | `undefined` (default) gives editor suggestion warnings; `true` ignores unused labels and `false` reports compiler errors. |
| `alwaysStrict` | In TypeScript 7, strict mode is assumed and this is always true; setting it false is unsupported. It concerns strict-mode parsing/emit behavior, not the type-checking umbrella alone. [TypeScript 7 changes](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) |
| `exactOptionalPropertyTypes` | Interpret optional property types as written, rather than adding 'undefined'. default: false |
| `noFallthroughCasesInSwitch` | Enable error reporting for fallthrough cases in switch statements. default: false |
| `noImplicitAny` | Enable error reporting for expressions and declarations with an implied 'any' type. default: `true`, unless `strict` is `false` |
| `noImplicitOverride` | Ensure overriding members in derived classes are marked with an override modifier. default: false |
| `noImplicitReturns` | Enable error reporting for codepaths that do not explicitly return in a function. default: false |
| `noImplicitThis` | Enable error reporting when 'this' is given the type 'any'. default: `true`, unless `strict` is `false` |
| `noPropertyAccessFromIndexSignature` | Enforces using indexed accessors for keys declared using an indexed type. default: false |
| `noUncheckedIndexedAccess` | Add 'undefined' to a type when accessed using an index. default: false |
| `noUnusedLocals` | Enable error reporting when local variables aren't read. default: false |
| `noUnusedParameters` | Raise an error when a function parameter isn't read; parameters whose names begin with `_` are exempt. default: false |
| `stableTypeOrdering` | Ensure types are ordered stably and deterministically across compilations. default: true |
| `strict` | Enable all strict type-checking options. default: true |
| `strictBindCallApply` | Check that the arguments for 'bind', 'call', and 'apply' methods match the original function. default: `true`, unless `strict` is `false` |
| `strictBuiltinIteratorReturn` | Built-in iterators are instantiated with a 'TReturn' type of 'undefined' instead of 'any'. default: `true`, unless `strict` is `false` |
| `strictFunctionTypes` | Check function parameter compatibility more safely; under strict checking, function-syntax parameters are contravariant, while method and constructor parameters keep a bivariance exception. Return types are checked in the output direction independently of this option. default: `true`, unless `strict` is `false` |
| `strictNullChecks` | When type checking, take into account 'null' and 'undefined'. default: `true`, unless `strict` is `false` |
| `strictPropertyInitialization` | Check for class properties that are declared but not set in the constructor. default: `true`, unless `strict` is `false` |
| `useUnknownInCatchVariables` | Default catch clause variables as 'unknown' instead of 'any'. default: `true`, unless `strict` is `false` |

## Cross-item comparison

Strictness is a policy bundle, not a safety proof.

strict is an umbrella; individual flags let you make policy more precise. noUncheckedIndexedAccess protects uncertain reads, while exactOptionalPropertyTypes distinguishes an absent property from a present property whose value is undefined.

## Examples

With `noUncheckedIndexedAccess`, `const item = values[i]` is possibly `undefined`, so handle the missing-index case. With `exactOptionalPropertyTypes`, `{ retry: undefined }` is not interchangeable with `{}` when `retry?: number`; that changes assignability, not runtime object semantics.



## Common mistakes

- These switches alter diagnostics and static types, not runtime validation.
- strict is an umbrella; explicit per-option values can change individual checks.
- Do not assume a more permissive setting makes unsafe values safe.

## Knowledge checks with answers

1. Does noUncheckedIndexedAccess perform a runtime bounds check? No; it changes the static result type.
2. What does strict control? A family of type-checking options.
3. Can a project explicitly set an individual strict flag? Yes; use this carefully to stage policy.

Sources: [official TypeScript configuration reference](https://www.typescriptlang.org/tsconfig/), [compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html), [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [TypeScript 7.1 beta announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/), [TypeScript 7.1 beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta).
