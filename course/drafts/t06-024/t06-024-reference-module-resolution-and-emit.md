# TypeScript modules, declaration files, and augmentation — Reference: Module resolution, declaration emit, and package interop

## Scope and version

This lesson explains all 24 supplied resolution and emit names. TypeScript 7.0 is stable; the 7.1 beta is not a baseline. In TypeScript 6.0, `classic` was removed and `node10`/`baseUrl` were deprecated; TypeScript 7.0 removes deprecated legacy options. [Modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html) · [TypeScript 6.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html) · [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)

## How this group fits the mental model

Resolution follows the host: TypeScript consults the emitted module form, file extension, package scope, and metadata to find both a runtime branch and its declarations. Configuration that type-checks but disagrees with Node or a bundler can produce successful builds that fail when run.

## Supplied names explained

| Supplied name | Role, behavior, and practical use |
|---|---|
| `NodeNext module resolution` | Tracks current Node.js ESM/CommonJS rules, including package `exports`/`imports`, file format, and import-vs-require condition selection. Because NodeNext evolves with Node and TypeScript, a future upgrade may change its modeled behavior. |
| `Node16 module resolution` | Models Node 16's ESM/CJS resolution rules, paired with `module: "node16"`. It is a fixed historical target rather than a mode that automatically follows current Node behavior. |
| `Node18 module mode` | `module: "node18"` models Node 18's module semantics and uses the corresponding Node-aware resolver behavior. It is appropriate when that specific Node baseline matters; do not pair it with bundler resolution. |
| `Node20 module mode` | `module: "node20"` models Node 20's supported module behavior and corresponding resolution. Choose it only when its fixed behavior matches the deployment target; NodeNext is the moving current-Node mode. |
| `Bundler module resolution` | Models common bundler lookup: package `exports`/`imports` plus extensionless relative imports and directory modules. Pair with `module: "esnext"` or `"preserve"`; it can accept imports that native Node ESM rejects. |
| `Classic module resolution` | Historical pre-Node resolution strategy; removed in TypeScript 6.0. Do not use it for new code; migrate to a Node-aware or bundler mode. |
| `Node10 module resolution (deprecated)` | The legacy `node`/`node10` CommonJS-era algorithm. Deprecated in TypeScript 6.0 and removed in TypeScript 7.0; it does not model modern package `exports`/`imports`. |
| `package.json type field` | In Node package scope, `"type": "module"` or `"commonjs"` influences how `.js` files are interpreted and therefore TypeScript's Node-aware file format decisions. `.mts` and `.cts` use explicit ESM/CJS intent. |
| `package.json types field` | Points to a package's default declaration entry file (with `typings` as a legacy alias). It does not define runtime resolution and must point to a file in the published package. |
| `package.json exports field` | Defines public package subpaths and conditional runtime/type entry points. In resolution modes that support it, it encapsulates unlisted deep paths. TypeScript resolves the matching declaration branch and does not treat file existence alone as permission to import. |
| `package.json imports field` | Defines package-private specifiers beginning with `#`, resolved from within that package in supported Node/bundler modes. TypeScript mirrors the host's mapping; runtime support is still required. |
| `typesVersions resolution` | Uses `typesVersions` to redirect declaration paths for compiler version ranges and package subpaths in supported resolution contexts. It does not replace runtime routing and generally does not supersede `exports`. |
| `types conditional export` | A `"types"` condition inside `exports` routes TypeScript to a declaration file alongside runtime conditions. Put declarations in the condition order and branches recommended by the package-resolution docs; test ESM and CJS consumers separately. |
| `Declaration emit` | `declaration: true` emits `.d.ts` descriptions from source. `emitDeclarationOnly` emits declarations without JavaScript. This describes the public type surface; it is not runtime code generation. |
| `Declaration map` | `declarationMap: true` emits source maps for declaration files, improving editor navigation from a consumer's `.d.ts` view to source. It does not affect type compatibility or runtime behavior. |
| `esModuleInterop` | Enables compatibility helpers/checking for CommonJS-style exports when compiling to formats that transform imports. In TypeScript 6.0 it can no longer be set to `false`; with preserve mode it has type-checking implications but no import transform. |
| `verbatimModuleSyntax` | Preserves non-type import/export syntax and erases syntax explicitly marked `type`. It prevents use of ESM syntax that would need silent rewriting to CommonJS and makes runtime intent visible. Added in TypeScript 5.0. |
| `preserveValueImports (deprecated)` | Legacy option intended to preserve imports used only as values in certain transformed scenarios. Deprecated in favor of `verbatimModuleSyntax`; avoid it in new projects and follow compiler upgrade diagnostics. |
| `importsNotUsedAsValues (removed)` | Older import-elision policy option, deprecated in favor of explicit `type` modifiers and `verbatimModuleSyntax`; removed from current TypeScript. |
| `resolvePackageJsonExports setting` | Controls package `exports` lookup in supported modern modes. Defaults are enabled in Node16/NodeNext/Bundler modes; disabling it can make TypeScript diverge from a host that enforces exports. |
| `resolvePackageJsonImports setting` | Controls package `imports` lookup in supported modern modes, enabled by default there. Disabling it changes TypeScript's understanding of `#` specifiers and can diverge from runtime. |
| `customConditions setting` | Adds condition names to those considered when resolving package `exports`/`imports`, alongside mode-specific conditions. The runtime or bundler must use corresponding custom conditions or type/runtime branches can differ. |
| `paths mapping` | Maps specifier patterns to lookup paths for TypeScript. It does not rewrite emitted import strings; configure a bundler/runtime alias in parallel. Package `exports` may constrain package subpaths independently. |
| `baseUrl option (deprecated)` | Historically made a directory a bare-specifier lookup root and prefixed `paths` targets. Deprecated in TypeScript 6.0 and no longer a lookup root in 7.0. Prefer explicit relative paths in `paths`; avoid accidental bare-specifier capture. |

## Cross-item comparison

NodeNext models current Node behavior; Node16/18/20 are fixed target modes. Bundler understands modern package conditions but deliberately allows relative paths that native Node ESM may reject. The `module` option affects whether a source import is emitted as `import` or `require`, which in turn affects the package condition TypeScript selects. [Modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)

Package `types` is a default declaration pointer. A `types` export condition supports per-branch/per-subpath declarations, and `typesVersions` provides compiler-version redirects in supported cases. The `exports` map is a package boundary; `paths` is only a TypeScript lookup alias and is not emitted. Keep runtime and type maps aligned.

## Examples

### Node ESM package with declarations

```json
{
  "name": "@acme/ids",
  "type": "module",
  "exports": {
    ".": {
      "import": { "types": "./types/index.d.mts", "default": "./dist/index.js" },
      "require": { "types": "./types/index.d.cts", "default": "./dist/index.cjs" }
    }
  }
}
```

The declaration variants model their corresponding runtime formats. Confirm the exact condition order and package layout against the official publishing guidance and test consumers under NodeNext. A `types` condition is a type resolver signal; Node itself selects the runtime branch.

### Bundler alias must exist twice

```json
{
  "compilerOptions": {
    "module": "preserve",
    "moduleResolution": "bundler",
    "paths": { "@app/*": ["./src/*"] }
  }
}
```

The TypeScript compiler can now resolve `@app/view`, but `paths` does not rewrite that specifier. Configure the bundler's alias to the same target. [Paths option](https://www.typescriptlang.org/tsconfig/paths.html)

### Declaration-only library build

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "./dist/types"
  },
  "include": ["src/**/*.ts"]
}
```

The output contains declarations and maps, not JavaScript. A separate runtime build must produce files matching the package's export map.

## Common mistakes

- Selecting `bundler` and assuming the resulting imports are valid in native Node ESM.
- Using NodeNext while ignoring package `type`, extensions, or conditional exports.
- Assuming `paths` changes emitted imports or package `exports`.
- Assuming a package's `types` field grants access to every deep path.
- Using `typesVersions` as a runtime compatibility switch.
- Setting a custom condition only in TypeScript while runtime selects another branch.
- Treating declaration emit as runtime emit or forgetting to publish the generated files.
- Disabling `resolvePackageJsonExports`/`Imports` and unknowingly modeling behavior that the host will reject.
- Keeping deprecated `baseUrl`, `node10`, `classic`, or legacy import-elision options in new configurations.

## Knowledge checks with answers

1. **Which mode follows current Node behavior?** NodeNext; fixed Node modes represent particular Node baselines.
2. **Why can bundler mode accept an import Node rejects?** It permits common bundler extensionless-path behavior.
3. **Does `paths` rewrite emitted imports?** No.
4. **Can `typesVersions` bypass an `exports` boundary?** No; exports-aware resolution governs the public package map.
5. **What does `declarationMap` change?** Navigation from declarations to source, not runtime output.
6. **What does `verbatimModuleSyntax` do with `import type`?** Erases it; non-type syntax is preserved.
7. **Which old resolution settings are no longer appropriate?** `classic` is removed, and `node10` is deprecated in 6.0 and removed in 7.0.

Sources: [module reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html), [module theory](https://www.typescriptlang.org/docs/handbook/modules/theory.html), [TSConfig paths](https://www.typescriptlang.org/tsconfig/paths.html), [TSConfig customConditions](https://www.typescriptlang.org/tsconfig/customConditions.html), [TSConfig resolvePackageJsonExports](https://www.typescriptlang.org/tsconfig/resolvePackageJsonExports.html), [TSConfig resolvePackageJsonImports](https://www.typescriptlang.org/tsconfig/resolvePackageJsonImports.html), [TypeScript 6.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/).
