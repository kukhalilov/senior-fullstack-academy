# TypeScript modules, declaration files, and augmentation — Exercises and worked solutions

## Goals

Practice tracing source imports to emitted runtime imports and declarations, choosing a module-resolution mode, and diagnosing type/runtime mismatches. Examples target TypeScript 7.0; beta behavior is identified separately. [Modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)

## Worked example

Suppose a Node ESM application has `src/main.ts` importing `./util` and `package.json` contains `"type": "module"`. A bundler-mode check may accept the extensionless relative path, but emitted JavaScript that Node loads as native ESM generally needs an extension such as `./util.js`. Choose `module: "NodeNext"` and `moduleResolution: "NodeNext"` when TypeScript should model Node's actual behavior, then write the source specifier in the runtime-compatible form:

```ts
import { formatId } from "./util.js";
console.log(formatId("a-1"));
```

TypeScript can resolve `./util.js` to `util.ts` for checking while preserving the runtime-valid specifier. Bundler mode is correct when a bundler handles resolution and can implement its extensionless conventions; it is not a general way to make Node accept those paths.

## Exercises

1. **Module or script?** Classify these files: one with no imports/exports, one with `export {}`, and one with a global script variable. Explain how `moduleDetection: "force"` and contextual `auto` can affect classification.
2. **Type-only versus value.** Given a type `User` and runtime function `createUser`, write imports/exports that preserve only the runtime function and erase the type dependency. Explain the behavior under `verbatimModuleSyntax`.
3. **Ambient module.** A JavaScript package `legacy-grid` has `mount(element, options?)`. Sketch a `.d.ts` ambient module declaration. Explain what must exist at runtime and why this declaration must be a script rather than an accidental module augmentation.
4. **Wildcard asset module.** Write the shape for importing `*.css` as a string-to-string class map. Explain what the declaration does not do and which tool must load/transform CSS.
5. **Augmentation.** A named class export needs a `toObservable` method in its types. Describe the declaration shape, required module import context, runtime patch, and why augmenting a default export is unavailable.
6. **Merge rules.** Explain which of interface/interface, function/namespace, class/namespace, and class/interface can merge. For supported function/class namespace merges, name the runtime member attachment that must correspond.
7. **Choose a resolver.** Recommend a TypeScript module/resolution pair for (a) Node ESM and CommonJS package duality, (b) a Vite-like bundler processing source imports, and (c) a project targeting an older fixed Node behavior. Explain the extension rule tradeoff.
8. **Package metadata.** Design a package export for ESM and CommonJS consumers with matching `.d.mts` and `.d.cts` declarations. Explain the purpose/order of the `types`, `import`, `require`, and `default` conditions and test both consumer modes.
9. **TypeScript aliases.** A `paths` alias type-checks but fails at runtime. Diagnose the missing mapping and describe why `baseUrl` is not a modern fix in TypeScript 7.
10. **Declaration publishing.** Configure declaration-only output and declaration maps. Explain what gets emitted and list two package-publishing checks that catch missing declaration files.
11. **Upgrade review.** A TypeScript 5 project uses `moduleResolution: "node"`, `baseUrl`, `importsNotUsedAsValues`, and `preserveValueImports`. For a TypeScript 7 migration, explain the status of each and the modern replacement.
12. **Beta boundary.** Briefly state the TypeScript 7.1 beta change for import attributes in ambient modules and how to use it responsibly while 7.0 is stable.

## Progressive hints

1. Top-level import/export marks module scope; `export {}` is a module marker with no exported value.
2. Use `import type` and `export type` for type-only bindings; use regular syntax for runtime values.
3. `declare module "legacy-grid"` in a declaration script gives a named package a type shape. It emits no implementation.
4. The wildcard is in a module-name pattern; a bundler loader still handles the actual file.
5. Augmentation patches an existing named export. Import the module that executes the implementation patch as well.
6. TypeScript has defined merge pairs and ordering, not arbitrary merging for every same-name declaration kind.
7. `NodeNext` models Node's evolving rules; bundler mode intentionally permits extensionless relative paths.
8. Runtime conditions need executable code; types branches need declaration files that describe the matching branch.
9. `paths` changes compiler lookup only. Configure the bundler/runtime alias separately.
10. `emitDeclarationOnly` can separate API types from JavaScript output; inspect the packed archive.
11. TypeScript 6.0 deprecates `node10` and `baseUrl`; TypeScript 7 removes the legacy resolver, while old import elision controls are replaced by `verbatimModuleSyntax`.
12. Beta features are pre-stable; keep production instructions on 7.0 unless opting into beta deliberately.

## Complete solutions

1. A file with no module syntax is normally a script and may share globals. `export {}` makes a file a module while exporting no runtime value. `moduleDetection: "force"` classifies non-declaration source files as modules; `auto` uses syntax plus contextual signals such as package type/JSX. This changes checker scope, not runtime loading. [moduleDetection](https://www.typescriptlang.org/tsconfig/moduleDetection.html)
2. Use `import type { User } from "./user.js"; import { createUser } from "./user.js"; export type { User }; export { createUser };`. The type import/re-export is erased, while `createUser` remains a runtime dependency. With `verbatimModuleSyntax`, this explicit distinction is the recommended approach. [TypeScript 5.0 notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html)
3. In a declaration script, `declare module "legacy-grid" { export interface Options { ... } export function mount(element: Element, options?: Options): void; }`. This describes a package import and emits no code. The actual module must be installed/available and export `mount`; if this syntax is written inside a module declaration file, it may be interpreted as augmentation instead. [Module declaration template](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html)
4. `declare module "*.css" { const classes: Record<string, string>; export default classes; }` gives matching imports a declared shape. It does not read CSS, generate class names, or inject styles. A bundler or loader must implement those behaviors. [Modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
5. In a module file, use `declare module "./observable.js" { interface Observable<T> { toObservable(): Observable<T> } }` against an existing named export, resolving the same specifier as an import. The runtime patch must actually add the member, and consumers must load that patch. Default exports cannot be augmented because augmentation targets an exported name. [Declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
6. Interface/interface merges when duplicate members are compatible. Function/namespace and class/namespace are supported when the namespace follows the function/class; they describe static-style properties and emitted namespace code attaches runtime values. Class/interface does not generally merge as an arbitrary declaration pair. Namespace non-exported members remain private to their own block. [Declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
7. (a) `module: "NodeNext"`, `moduleResolution: "NodeNext"` for current Node dual format. (b) `module: "preserve"`, `moduleResolution: "bundler"` when a bundler handles raw imports and mixed forms; `esnext` plus bundler is another valid ESM-oriented pairing. (c) a matching fixed mode such as `node16` with `moduleResolution: "node16"`, or `node18` with the Node16 resolver family as documented by the compiler. Native Node ESM generally requires explicit extensions; bundler mode may permit extensionless imports. [Module reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
8. Use `exports` subpaths/conditions so `import` resolves to ESM and `require` to CJS; each branch should provide a corresponding `types` declaration (`.d.mts` and `.d.cts`) and runtime target (`.js`/`.cjs` or corresponding files). Put the `types` condition before a fallback within the condition object so TypeScript can select it; Node ignores the unknown `types` condition and proceeds to its runtime branch. Test with both an ESM and CommonJS consumer and inspect the published package. Exact branches should follow the supported package layout guidance. [Modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
9. `paths` provides a TypeScript lookup mapping only. Add the equivalent mapping to Vite/the chosen bundler or use a runtime-supported package import. `baseUrl` is deprecated in TS6 and no longer acts as a lookup root in TS7; put explicit relative prefixes in `paths` instead. [TypeScript 6.0 notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
10. Set `declaration: true`, `declarationMap: true`, `emitDeclarationOnly: true`, and an output directory. The output is `.d.ts` plus maps, not JavaScript. Build the runtime artifact separately; inspect `npm pack --dry-run` (or the package archive) and compile a separate consumer against the packed artifact to catch absent files or invalid export paths.
11. `moduleResolution: "node"` aliases legacy `node10`, deprecated in 6.0 and removed in 7.0; select NodeNext for Node or bundler for a bundler. `baseUrl` is deprecated/removed as a lookup root; use explicit `paths` targets or imports/exports. `importsNotUsedAsValues` and `preserveValueImports` were deprecated in favor of `verbatimModuleSyntax` and are rejected in current 6+/7 releases; mark type-only imports/exports explicitly.
12. TypeScript 7.1 beta supports import attributes in ambient module declarations. It is beta-only as of the lesson snapshot; use 7.0 stable syntax in baseline production guidance and test beta behavior only in a separately pinned upgrade experiment. [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## Tests and edge cases

- Type-check source under the same `module`/`moduleResolution` pair used for production, not just a permissive editor default.
- Test both import and require consumers when publishing a dual-format package.
- Test a package from its packed archive, since the repository can contain files omitted by the package's `files` field or ignore rules.
- Confirm `types`, `exports`, `imports`, and `typesVersions` point to paths that exist and that exports expose intended subpaths.
- Verify bundler aliases at runtime; TypeScript `paths` alone cannot do so.
- Keep type-only imports explicit under `verbatimModuleSyntax`, and separately test side-effect-only imports when `noUncheckedSideEffectImports` is enabled.
- Treat ambient declarations and augmentations as claims about runtime behavior; test the implementation/load order.

## Reflection questions

- Which tool resolves your application's imports after TypeScript finishes?
- Are your package declaration branches structurally aligned with runtime branches?
- What fails if a type augmentation loads but its runtime patch does not?
- Which migration errors would `tsc --traceResolution` or `--listFiles` help diagnose?
