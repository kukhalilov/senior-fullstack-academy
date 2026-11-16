# TypeScript modules, declaration files, and augmentation — Reference: Declaration files, ambient context, and augmentation

## Scope and version

This lesson explains all 20 supplied declaration names. A declaration is a static description; code, globals, and package exports must still exist at runtime. [Declaration files introduction](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) · [Declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)

## How this group fits the mental model

The runtime supplies JavaScript values; declaration files describe those values to the checker. Ambient syntax says “provided elsewhere.” Merging and augmentation alter the compile-time view, so they are safe only when they match the real implementation and intended loading order.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `Declaration file (.d.ts)` | A file containing type declarations for JavaScript or TypeScript APIs. It is consumed by the checker and emits no implementation. Package authors publish it beside or through metadata pointing to the corresponding runtime API. |
| `declare modifier` | Marks a declaration as describing a value supplied elsewhere, such as `declare const version: string`. It does not initialize, emit, or create that value. |
| `Ambient variable declaration` | `declare const process: ProcessLike` describes a global or module value whose runtime source exists separately. `const`/`let` declare read-only/writable bindings for checking; they do not create them in the ambient file. |
| `Ambient function declaration` | `declare function log(message: string): void` describes a callable provided elsewhere. Its overloads/signature must accurately reflect the runtime function. |
| `Ambient class declaration` | Declares a class-like constructor and instance shape that exist externally. It can describe constructability and members but does not provide a class body or implementation. |
| `Ambient namespace declaration` | Describes a namespace-like object and exported members provided externally, often for UMD/global APIs. New code should generally prefer modules over hand-written namespaces unless matching an existing library format. |
| `Global augmentation` | `declare global { ... }` inside a module adds types to the global scope. It changes checker knowledge only; the program must install the global and ensure load order. |
| `Module augmentation` | `declare module "specifier" { ... }` in a module patches existing named exports, resolved like an import. It cannot add arbitrary top-level declarations or augment a default export. Runtime patching must be loaded separately. |
| `Declaration merging` | Compatible same-name declarations can combine according to specific compiler rules. This is type-level composition, not JavaScript object merging. |
| `Interface merging` | Multiple same-scope interface declarations with the same name combine members; duplicate non-function members must have matching types/modifiers, while function members can form overload sets. |
| `Namespace merging` | Namespace declarations with the same name merge exported members. Non-exported members remain private to their original declaration block. |
| `Function and namespace merging` | A namespace can merge with a function when declared after it, enabling a function value with attached static-style properties. Runtime code must attach those properties. |
| `Class and namespace merging` | A namespace can merge with a class when declared after the class, adding a type-visible namespace of static-style names. It does not instantiate or attach missing runtime properties. |
| `Triple-slash reference directive` | `/// <reference path="./types.d.ts" />` requests inclusion of a declaration file by relative path. It is a compiler directive, not a JavaScript import. |
| `Triple-slash types directive` | `/// <reference types="node" />` requests inclusion of a package's declarations, analogous to a type-package dependency. It does not load the Node runtime. |
| `types package entry` | A package's `types` (legacy alias `typings`) field identifies its declaration entry file for consumers. The target must be published and describe the package's public runtime API. |
| `typesVersions package field` | Package metadata maps compiler-version ranges and declaration subpaths to alternate type files. It can support compiler-specific declaration layouts but is subject to module-resolution/package-export rules. |
| `types field versus typesVersions` | `types` points to a default declaration entry; `typesVersions` conditionally redirects declarations by compiler version and subpath in supported resolution paths. When package `exports` is used, it generally governs resolution and `typesVersions` does not bypass it. |
| `Declaration file module versus script` | A top-level import/export makes a `.d.ts` an external module with scoped exports. Without one it can be an ambient script contributing globals or `declare module` definitions. Add `export {}` when a global augmentation file must itself be a module. |

## Cross-item comparison

An ambient variable/function/class/namespace describes a value. A module declaration describes an importable module; an augmentation edits an already known module's type shape. Declaration merging combines declarations only where TypeScript defines a supported merge pair and ordering. None of these operations inserts runtime code. [Declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)

The package `types` entry is a default declaration pointer. `typesVersions` is a compiler-version mapping for declaration paths; it is not a package runtime routing feature. `exports` and its `types` condition can define declarations per public subpath and runtime condition. Always test the packed package with the intended resolver. [Modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)

## Examples

### Ambient module for a JavaScript package

```ts
// legacy-widget.d.ts — ambient script declaration
declare module "legacy-widget" {
  export interface Options { mode: "compact" | "full" }
  export function mount(target: Element, options?: Options): void;
}
```

This enables type checking for imports from that specifier. A real package named `legacy-widget` must still be installed and expose `mount`.

### Safe-shaped global augmentation

```ts
export {};
declare global {
  interface Window { appBuildId?: string }
}
```

The `export {}` makes this declaration file a module so `declare global` augments the existing global interface. Application bootstrap code must assign `window.appBuildId` if it is expected to exist.

### Merge a function's namespace at runtime and in types

```ts
function decode(value: string): string { return value.trim(); }
namespace decode { export const version = "1"; }

decode.version; // types describe this, and the namespace emit attaches it
```

Supported namespace/function merging is coordinated with emitted JavaScript. For hand-written declarations, make sure the actual runtime API has the merged property. [Declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)

## Common mistakes

- Treating `.d.ts` as executable code or assuming `declare` creates a value.
- Adding global declarations to a module file without `declare global`.
- Writing `declare module "x"` in a script and assuming it augments an existing module; in that context it can define an ambient module instead.
- Attempting to augment a default export or add a new top-level export through augmentation.
- Forgetting to import the module that contains a runtime patch, so the type extension exists but the method does not.
- Creating incompatible interface merges or assuming non-exported namespace members merge across blocks.
- Assuming a `types`/`typesVersions` file is included in the published tarball just because it exists in the repository.
- Using triple-slash directives as runtime imports.

## Knowledge checks with answers

1. **Does `declare const x: T` initialize `x`?** No; it states that the value is provided elsewhere.
2. **Can module augmentation create a new top-level export?** No; it patches existing named exports only.
3. **What does `/// <reference types="node" />` load?** Type declarations, not Node.js runtime code.
4. **When can interfaces merge?** Same-name declarations merge in the same declaration space when duplicate members are compatible.
5. **What does a package `types` field point to?** A declaration entry point that must be present in the published package.

Sources: [declaration files introduction](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html), [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html), [modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html), [module declaration template](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html).
