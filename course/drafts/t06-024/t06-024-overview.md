# TypeScript modules, declaration files, and augmentation — Big-picture orientation and mental model

## Problem and purpose

TypeScript source code is compiled or checked in a project whose runtime or bundler must also locate modules. The type checker therefore needs a model of file boundaries, package entry points, and runtime resolution. Separately, declaration files describe JavaScript APIs so TypeScript can understand code that has no TypeScript implementation.

These are related but distinct jobs: module syntax describes dependencies and exports; resolution options select files and package conditions; declaration files supply static descriptions; the runtime or bundler still loads actual code. This lesson reflects TypeScript 7.0 stable, with TypeScript 7.1 beta changes labeled separately as of 2026-11-16. [Modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html) · [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)

## Plain-language mental model

Imagine two maps over the same application. The runtime map says which JavaScript file a specifier loads. The type map says which source or declaration file describes that module to the compiler. Good configuration makes the maps agree. A `.d.ts` file is a label for a real thing; it does not create that thing. An `import type` is a dependency used only by the type map and is removed from emitted JavaScript.

Package metadata can expose different runtime files for `import` and `require`, while TypeScript selects the corresponding declarations using package conditions such as `types`. A bundler may accept extensionless relative imports that Node's native ESM loader rejects, so choosing a resolver by the actual runtime matters.

## How the parts fit together

1. Determine whether each file is a module or a script. Top-level imports/exports mark a module; `moduleDetection` can also infer module status from project context.
2. Decide whether each dependency is needed at runtime, only for types, or as a module value.
3. Pair `module` and `moduleResolution` to reflect Node, a bundler, or another runtime.
4. Follow package metadata: `exports` and `imports` can route subpaths and conditions; declaration entry points use `types` metadata or type conditions.
5. Use `.d.ts` files to describe APIs without implementing them. Augmentation changes the type map and must correspond to real runtime behavior.
6. Emit `.d.ts` and optional declaration maps for library consumers, then verify that published package metadata points to files that actually ship.

## Concept map

```text
source file ── module or script? ──► import/export meaning
     │                                  │
     │                                  ├─ type-only: erased
     │                                  └─ value dependency: runtime/bundler loads it
     ▼
module + moduleResolution ──► package conditions / file lookup
     │                                  │
     ▼                                  ▼
.d.ts describes API              JS runtime implementation
     │                                  │
     └──────── maps must agree ─────────┘
             augmentation adds a type description only
```

## End-to-end walkthrough

```ts
// model.ts — an external module because it has exports
export interface User { id: string; name: string }
```

```ts
// repository.ts
import type { User } from "./model.js";
export function findUser(id: string): User | undefined {
  return id === "u-1" ? { id, name: "Mina" } : undefined;
}
```

Under Node-aware ESM settings, writing the runtime `.js` extension in a relative specifier lets emitted JavaScript run directly in Node; TypeScript resolves that specifier to the source file during checking. Under bundler resolution, extensionless imports may be accepted, but that behavior is not automatically portable to Node ESM. `import type` is erased, so the runtime does not load `model` solely for that type.

## When to use it and tradeoffs

Use NodeNext when modeling Node's current dual ESM/CommonJS behavior, and a fixed Node mode when a package specifically targets that Node version. Use bundler resolution when the actual resolver is a bundler and its looser relative-path rules are intended. Avoid selecting a resolver because it merely removes an error; a successful type check is useful only when emitted or bundled code resolves the same specifier.

Publish declaration files at paths reachable through your package metadata. Add module augmentation only when the runtime extension is genuinely installed. Prefer named exports for extensible APIs; default exports cannot be augmented by name. Keep ambient declarations narrow because they can make nonexistent runtime values appear valid.

## What later lessons cover

The concepts lesson builds the resolution model. The reference lessons enumerate module syntax and import types, ambient declarations and merging, then resolution modes and package/compiler settings. The practice lesson constructs and debugs a small package; interview preparation covers runtime/type-map mismatches and migration decisions. TypeScript 7.1 beta added import attributes in ambient modules; that is explicitly a beta note, not a stable 7.0 guarantee. [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/)
