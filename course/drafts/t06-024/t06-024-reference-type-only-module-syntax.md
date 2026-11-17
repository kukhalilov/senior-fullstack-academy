# TypeScript modules, declaration files, and augmentation — Reference: TypeScript imports, exports, and module declarations

## Scope and version

This lesson covers all 14 supplied names. It focuses on TypeScript's module/type behavior; ECMAScript import/export grammar is treated in t06-019. Current stable behavior is TypeScript 7.0; TypeScript 7.1 beta changes are labeled. [Modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html) · [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)

## How this group fits the mental model

Module syntax determines file boundaries and whether dependencies represent runtime values or only types. The runtime/bundler still executes value imports; declaration syntax informs the checker. Resolver configuration and package conditions determine what those specifiers describe.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `TypeScript external module` | A source file with top-level import/export is isolated as a module; its unexported declarations are local. Contextual `moduleDetection` can also classify some files as modules. |
| `Type-only import` | An import whose purpose is a type rather than a runtime value. Prefer explicit `import type` for predictable erasure, especially with `verbatimModuleSyntax`. |
| `Type-only export` | Exports a type from a module without exporting a runtime binding. Use `export type` or an `export { type T }` specifier. |
| `import type declaration` | Syntax such as `import type { User } from "./user.js"`; it is erased from emitted JavaScript and cannot be used as a runtime value. |
| `export type declaration` | Syntax such as `export type { User } from "./user.js"`; it forwards type namespace information only and emits no runtime re-export. |
| `Import type query (typeof import)` | Type query `typeof import("pkg")` obtains the type of a module's exported value namespace without creating a runtime import. It differs from `import type`, which binds names. |
| `Import equals declaration` | `import x = require("pkg")` or `import x = Namespace.Member` creates a TypeScript alias compatible with CommonJS/namespace patterns. Its use and emit depend on module mode; it is not an ESM default import. |
| `export = assignment` | Exports a single CommonJS-style value from a module, commonly paired with `import x = require("pkg")`. It cannot be freely combined with ESM `export default`/named exports. |
| `Ambient external module declaration` | `declare module "pkg" { ... }` gives an untyped or JavaScript module a type shape without implementing it. In a script declaration file it names a module; inside a module file the same syntax can instead be an augmentation. |
| `Ambient module wildcard declaration` | Pattern declaration such as `declare module "*.css" { const classes: Record<string, string>; export default classes; }` types matching specifiers. It does not load or validate the resource. |
| `Import attributes in ambient module declarations (TypeScript 7.1 beta)` | A beta-only form such as `declare module "*" with { type: "text" } { const content: string; export default content; }` can require an import attribute and choose a declaration shape. Matching specifiers are not checked against files on disk, and these declarations are not supplied by TypeScript's built-in libraries. The runtime/bundler still implements the attribute and resource loading. |
| `Node.js module resolution mode` | A Node-aware resolver uses package metadata and whether an import will be emitted as ESM import or CommonJS require to choose matching conditions. Use Node modes when Node itself resolves the output. |
| `Package type condition` | A conditional `types` entry in `exports` selects declarations for a matching import/require branch. Place and test conditions so the checker and runtime choose corresponding variants. |
| `moduleDetection setting` | `legacy` looks for imports/exports, `auto` also uses contextual cues such as package type/JSX, and `force` treats source files as modules. It controls global-vs-module scope, not runtime loading. [moduleDetection](https://www.typescriptlang.org/tsconfig/moduleDetection.html) |
| `module preserve mode` | Preserves each import/export form as written rather than converting the whole file to one module format; it implies bundler resolution and is suited to tools that handle raw TypeScript or mixed module forms. It still relies on the actual host for execution. [Module reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html) |

## Cross-item comparison

`import type` binds type names, while `typeof import()` queries a module namespace type. Both are type-side operations, but the latter does not introduce a local import binding. `import = require` and `export =` describe CommonJS-style interop; ESM `import`/`export` syntax follows different runtime semantics.

An ambient external module declaration describes a named module in a declaration script. A module augmentation patches a module already brought into scope and is limited to existing named exports. A wildcard ambient module maps a specifier pattern to a declaration, often for assets; it provides no resource loader. TypeScript 7.1 beta can key such declarations on import attributes, but the compiler still does not validate that a matching file exists. [Declaration files: modules](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html) · [modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)

## Examples

```ts
// consumer.ts
import type { User } from "./user.js";
import { createUser } from "./user.js";
type UserModule = typeof import("./user.js");

export type { User };
export { createUser };
```

`User` and `UserModule` are type-side references; `createUser` is a runtime value import/export. With `verbatimModuleSyntax`, explicit type markers make the emit boundary clear.

```ts
// legacy-style interop example; valid only with a compatible module target
import legacy = require("legacy-package");
export = legacy;
```

This pair is for CommonJS-style module contracts. Do not rewrite it as a default import without checking the package's actual export shape and interop configuration.

```ts
// TypeScript 7.1 beta only
declare module "*" with { type: "text" } {
  const content: string;
  export default content;
}
```

This declaration makes the attribute part of the type lookup. It neither verifies that the file exists nor tells Node or a bundler how to load it. Keep this beta syntax out of stable 7.0 assumptions.

## Common mistakes

- Treating `typeof import()` as a runtime import.
- Forgetting `import type` is erased and therefore cannot provide a runtime side effect.
- Leaving type-only names unmarked under `verbatimModuleSyntax` and expecting import elision.
- Combining `export =` with ESM export declarations as if the forms were interchangeable.
- Assuming an ambient module declaration installs code or proves a package exists.
- Placing an augmentation in a script context and accidentally creating a new ambient module declaration instead.
- Using `moduleDetection` as though it changed a bundler's runtime behavior.
- Assuming `module: "preserve"` bundles or executes a file; it describes preservation and checking.

## Knowledge checks with answers

1. **What does `import type` emit?** No JavaScript import.
2. **Does `typeof import("pkg")` load `pkg`?** No, it is a type query.
3. **Which form pairs with CommonJS `export =`?** Commonly `import x = require("pkg")`.
4. **What does `moduleDetection: "force"` affect?** It treats source files as modules for scope/type analysis; it does not install runtime behavior.
5. **Can a wildcard module declaration transform CSS into JavaScript?** No; a loader/bundler must do that.
6. **What do TypeScript 7.1 beta ambient import-attribute declarations provide?** They select or require a type shape based on attributes; they do not verify files or implement runtime loading.

Sources: [modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html), [module detection](https://www.typescriptlang.org/tsconfig/moduleDetection.html), [declaration files for modules](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html), [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/).
