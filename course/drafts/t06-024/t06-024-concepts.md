# TypeScript modules, declaration files, and augmentation — Core concepts and how they fit together

## Learning objectives

- Distinguish a TypeScript module from a script and understand `moduleDetection`.
- Choose between runtime imports, type-only imports, and import-type queries.
- Explain the roles and limitations of `.d.ts`, ambient declarations, and augmentation.
- Trace module resolution from compiler mode through package metadata to a declaration file.
- Publish declarations and package metadata that agree with runtime exports.

## Prerequisites

Know JavaScript imports/exports (t06-019), TypeScript types and interfaces, and basic package.json/npm concepts. Node.js runtime module semantics are assumed but taught in the Node track; this lesson describes TypeScript's model of them.

## Core concepts

### Module files and script files

A file with a top-level `import` or `export` is an external module. Its declarations are local to that module unless exported. A file without such syntax may be a script whose declarations contribute to a shared global scope. `moduleDetection` can also classify files according to heuristics such as package scope and JSX context; `force` treats all non-declaration source files as modules, `auto` uses contextual cues, and `legacy` relies on import/export syntax. Avoid accidentally publishing global names from ordinary source files.

### Type and value dependencies

TypeScript tracks both type meanings and JavaScript values, but emitted JavaScript only needs runtime dependencies. `import type`/`export type` unambiguously mark type-only dependencies; `typeof import("pkg")` queries a module's value shape in a type position without creating an import. `import X = require("x")` and `export = X` represent TypeScript's CommonJS/UMD-oriented compatibility syntax and are not interchangeable with ESM default exports.

With `verbatimModuleSyntax`, type-marked imports/exports are erased and non-type-marked module syntax is preserved. This makes source intent explicit but means an import that exists only for a type should be marked `type`; a type-only use does not necessarily erase an unmarked import. The option replaces older import-elision controls. [TypeScript 5.0 notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html)

### Declarations describe runtime APIs

A `.d.ts` file supplies signatures and shapes to the checker; it emits no runtime implementation. `declare` says a value is provided elsewhere. Ambient variable, function, class, and namespace declarations describe such existing values. A declaration that lies about a package or global can make type checking pass while the application fails at runtime.

A `.d.ts` file can itself be a module (with top-level import/export) or an ambient script/global declaration. `/// <reference types="..." />` adds a type-package dependency; `/// <reference path="..." />` includes a declaration file by path. In modern package projects, imports, `types`, and `types` compiler configuration are usually clearer than reference directives.

### Augmentation and declaration merging

Declaration merging combines declarations with the same mergeable name according to specific rules. Interfaces merge compatible members; namespaces can merge with supported classes, functions, and enums. This is static composition, not runtime patching. Module augmentation adds declarations to an existing named export and is resolved like an import. It cannot introduce arbitrary new top-level exports or augment a default export. `declare global` augments the global scope from within a module. Both require runtime code to perform any promised behavior.

### Resolution must match the host

`module` describes the output/module syntax model and influences which package conditions are selected. `moduleResolution` models the host's lookup rules. NodeNext follows current Node rules; fixed Node modes model fixed versions; bundler models common bundler behavior and permits extensionless relative imports. `classic` is removed in TypeScript 6.0 and `node10` is deprecated in 6.0 and removed in 7.0. Do not use these legacy modes for new projects. [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html) · [module reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)

### Package declarations and conditions

The package `types` (historically also `typings`) field points to a declaration entry point. `exports` defines public package subpaths and conditional entry points; a `types` condition can select declaration files alongside runtime `import`/`require` branches. `imports` defines package-private `#` specifiers. `typesVersions` can redirect declaration resolution for compiler versions in supported cases, but it does not override `exports`. Package authors must test the packed artifact because a local source tree can hide missing published files.

TypeScript 6.0 deprecates `baseUrl` as a lookup root and `node10` module resolution, removes `classic`, and adopts modern defaults such as `strict: true` and `module: "esnext"`; TypeScript 7.0 carries these changes forward. In 7.1 beta, import attributes are supported in ambient module declarations; wait for stable adoption before depending on beta-only behavior. [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## Mechanisms and relationships

1. Resolve a source specifier using the importing file's format and selected mode.
2. Apply package `exports`/`imports` conditions and package metadata to find a runtime path and corresponding type path.
3. Substitute TypeScript source or declaration extensions for checking while preserving the runtime specifier rules.
4. Apply import elision/preservation rules to determine emitted syntax.
5. During declaration emit, produce public type descriptions and optionally maps; ensure referenced declarations are included in the package.

The central invariant is correspondence: the runtime must expose the members promised by the declarations. TypeScript can check declaration relationships but cannot prove that JavaScript package contents match them.

## Worked examples

### Explicit type-only dependency

```ts
import type { User } from "./user.js";
export function displayName(user: User): string { return user.name; }
```

The import is erased because the interface/type is not a runtime value. The `./user.js` spelling is still chosen according to the runtime host and module mode.

### Ambient declaration for a real global

```ts
export {};
declare global {
  interface Window { analytics?: { track(name: string): void } }
}
```

This makes the type environment aware of `window.analytics`; it does not create `analytics`. A script must install it before use.

### Module augmentation plus runtime implementation

```ts
import { Observable } from "./observable.js";
declare module "./observable.js" {
  interface Observable<T> { map<U>(f: (value: T) => U): Observable<U> }
}
```

The augmentation can inform consumers, but a separately loaded implementation must add `map` to the runtime class/prototype. [Declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)

## Misconceptions and edge cases

- `import type` does not load a module at runtime; an ordinary import with a type-only use may still be preserved under `verbatimModuleSyntax`.
- A wildcard ambient module such as `declare module "*.css"` describes imports matching a pattern; it does not load styles or validate their contents.
- A `.d.ts` declaration may be discovered by configuration or package metadata, but it is never the JavaScript implementation.
- `paths` helps TypeScript resolve a specifier but does not rewrite it in emitted code. Configure the bundler/runtime to implement the same alias.
- `exports` encapsulation can make deep package imports inaccessible even if a file exists; `typesVersions` does not bypass that package boundary.
- NodeNext and bundler can choose different conditional branches for the same package because they model different hosts.
- Augmentation changes compile-time knowledge only. It cannot patch a default export and cannot add a new top-level export.
- Triple-slash references are directives with specific inclusion semantics, not comments that alter runtime loading.

## Knowledge checks with answers

1. **What marks an external module?** A top-level import/export; `moduleDetection` can also infer module status from context.
2. **Does `import type` create a runtime dependency?** No; its import is erased.
3. **Does a `.d.ts` file create the described value?** No, it only describes a value implemented elsewhere.
4. **Can module augmentation add any new export or augment `default`?** No; it patches existing named exports.
5. **Why can bundler resolution accept a path Node rejects?** It models common bundler behavior, including extensionless relative imports.
6. **Does `paths` rewrite import specifiers?** No, it only affects TypeScript lookup.
7. **What does declaration emit create?** `.d.ts` descriptions, optionally with declaration maps, not runtime implementation.
