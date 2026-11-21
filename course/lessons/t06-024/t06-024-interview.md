# TypeScript modules, declaration files, and augmentation — Interview questions and reasoning

## Core questions

1. What makes a TypeScript file a module? How does `moduleDetection` change the answer?
2. How do `import type`, `export type`, and `typeof import()` differ?
3. What does `verbatimModuleSyntax` preserve and erase?
4. What is the difference between a declaration file and a runtime implementation?
5. Distinguish ambient module declarations, module augmentation, and global augmentation.
6. Why can a module augmentation compile but still fail at runtime?
7. Which declaration kinds support merging, and what ordering or compatibility constraints apply?
8. How do NodeNext and Bundler module resolution differ?
9. What roles do package `types`, `exports`, `imports`, `typesVersions`, and the `types` condition serve?
10. What does `paths` do, and what does it not do?
11. What are `declaration` and `declarationMap` outputs for?
12. How did the TypeScript 6/7 transition affect `classic`, `node10`, `baseUrl`, `esModuleInterop`, and legacy import-elision flags?

## Concise interview answers

1. Top-level import/export creates module scope. `moduleDetection` can additionally infer module status from syntax context and can force source files to be modules. It affects checker scope, not runtime loading. [moduleDetection](https://www.typescriptlang.org/tsconfig/moduleDetection.html)
2. `import type` binds names only in the type namespace and erases the import; `export type` re-exports type declarations only; `typeof import("pkg")` queries the module's exported value namespace in a type position without creating an import binding.
3. It erases explicitly type-marked imports/exports and preserves non-type module syntax as written, preventing silent conversion assumptions. Added in TS5.0. [TS5.0 notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html)
4. `.d.ts` describes signatures and shapes to the checker and emits no implementation. A JavaScript runtime value must exist elsewhere.
5. An ambient module declaration gives a named untyped module a shape; module augmentation patches an existing named export; global augmentation patches global declarations from within a module. None executes code.
6. Augmentation is type-only. Unless a real implementation is installed and its module is loaded, the promised member is absent at runtime. Default exports cannot be augmented by name. [Declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
7. Interface declarations merge when compatible. Namespaces merge with namespaces and can merge with functions/classes/enums in specified ordering. Arbitrary class/interface merging is not allowed; runtime values still must match declarations.
8. NodeNext tracks current Node behavior, including module format and conditional exports. Bundler supports modern package maps but also extensionless relative paths common to bundlers, potentially accepting imports Node ESM rejects. [Module reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
9. `types` is a default declaration entry point; `exports` defines public subpaths and conditional branches; `imports` maps internal `#` specifiers; `typesVersions` redirects declaration paths by compiler version in supported cases; a `types` condition selects declarations per export branch.
10. `paths` informs TypeScript lookup but does not rewrite emitted specifiers. The bundler/runtime needs a matching alias.
11. `declaration` emits `.d.ts`; `declarationMap` adds navigation maps to source. Neither supplies runtime JavaScript.
12. TypeScript 6 removed `classic`, deprecated `node10` and `baseUrl` (with legacy resolver removed in 7), and disallowed setting `esModuleInterop` false. `importsNotUsedAsValues`/`preserveValueImports` are deprecated in favor of `verbatimModuleSyntax` and no longer usable in current releases. [TS6.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html) · [TS7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)

## Deep follow-up answers

### Why are `module` and `moduleResolution` a pair?

The output mode determines what the runtime sees: ESM `import`, CommonJS `require`, or preserved input syntax. Node's resolver chooses different package conditions and has stricter relative ESM path requirements. TypeScript must use the appropriate hypothetical emitted form when selecting the `import` or `require` branch. Bundler mode has its own rules and must be paired with `esnext` or `preserve`; preserve implies bundler resolution. A mismatched pair can make the type checker describe a different branch from the deployed runtime. [Modules reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html)

### Why are package declarations easy to get wrong?

The package source tree is not necessarily the published tree. `types`, conditional `types` exports, and `typesVersions` can point to files that are excluded from the archive or misalign with ESM/CJS runtime branches. Deep imports may also be blocked by `exports`. Test a separate consumer against the packed artifact, under each supported module mode, rather than relying only on the package's own source build.

### What does augmentation actually promise?

It tells the checker to treat an existing exported symbol or global as having additional members. It neither patches prototypes nor ensures a side-effect module is loaded. A correct augmentation must reference a real target, use a named export, and be paired with runtime code and a reliable initialization path. If the package cannot guarantee installation, expose an explicit adapter/wrapper instead of globally promising the member.

### What is `typesVersions` for if `exports` exists?

`typesVersions` supports alternate declaration trees for compiler-version ranges in resolution paths where it is consulted. It is not a substitute for runtime conditions and does not bypass the `exports` package boundary. For modern packages, conditional `types` entries under `exports` are usually the more direct way to pair declarations with public runtime branches. Verify the exact resolver behavior for the intended TypeScript versions.

## Scenario questions

### “It compiles but Node cannot find the file”

A project uses `moduleResolution: "bundler"`, imports `./utils`, and then runs emitted ESM directly in Node. Explain the mismatch, recommend the appropriate Node-aware mode and source specifier, and say what bundler mode was modeling.

**Answer:** Bundler mode permits extensionless relative imports commonly rewritten or resolved by bundlers. Native Node ESM generally requires a runtime-resolvable extension. Use a compatible Node-aware `module`/`moduleResolution` pair such as `NodeNext`/`NodeNext`, write `./utils.js` in TypeScript source (which TypeScript can map to `utils.ts` for checking), and ensure the output layout matches. Keep bundler mode when a bundler actually owns that resolution step.

### “The type says the method exists”

A dependency augmentation adds `client.retry()`, but production throws that it is not a function. Explain the missing runtime patch/load-order relationship and outline a safer explicit extension design.

**Answer:** Augmentation only changes TypeScript's model. The package must also install `retry` on the runtime object/prototype, and the importing program must load that patch before calling it. If installation is optional or ordering is fragile, expose a function such as `withRetry(client)` or a wrapper type/value that installs behavior explicitly and can be tested.

### “TypeScript finds the alias; the browser does not”

An import begins `@app/` and `paths` maps it to `src/`. Explain the compiler-only mapping and identify the parallel bundler/runtime configuration to check.

**Answer:** `paths` affects TypeScript lookup and normally leaves the emitted specifier unchanged. Configure the bundler's alias to the same target (and any test runner or runtime resolver that executes the code), or use a host-supported package import where appropriate. Check the final emitted/bundled import and the host's resolution configuration.

### “Types work from source but not after publish”

The package has `types` and `exports` fields. Describe how a missing packed `.d.ts`, an unexported subpath, condition order, or mismatched `.d.mts`/`.d.cts` branches could cause the issue. Recommend inspecting the package archive and testing ESM/CJS consumer fixtures.

**Answer:** Source builds can see declarations that the published archive omits, and an `exports` map can intentionally block a deep path even when its file exists. TypeScript's `types` condition must be reachable in the applicable branch and describe the paired runtime format; `.d.mts` and `.d.cts` signal ESM and CommonJS declaration formats. Inspect `npm pack --dry-run` or the archive, then install it into separate ESM and CommonJS consumer fixtures and resolve both public entry points.

## Tradeoffs and alternatives

- Choose NodeNext for evolving Node semantics; a fixed Node mode gives a more stable model when a specific deployment baseline is part of the contract.
- Choose Bundler when a bundler owns resolution; it accepts conveniences that can reduce direct-Node portability.
- Use module augmentation for ecosystem plugins with an assured runtime patch; prefer explicit wrapper APIs when load order or optional installation makes global promises unreliable.
- Use `types` for a simple declaration entry and conditional exports for per-subpath/per-format public API; keep `typesVersions` for compiler-version compatibility where required.
- Use `paths` only alongside a matching runtime mapping; package `imports` may be a standard package-local alternative for Node-aware environments.
- Generate declarations from source for consistency, then validate their packed public API with a consumer project.

## Common weak answers

- “The compiler finds the import, so Node can run it.” TypeScript and runtime resolvers can differ.
- “A `.d.ts` file contains the implementation.” It contains declarations only.
- “Augmentation adds the method.” It adds only a type description.
- “`paths` is an alias feature in JavaScript.” It affects compiler lookup, not emitted specifiers.
- “Bundler and NodeNext are equivalent.” Bundler may allow extensionless paths and different condition selection.
- “`typesVersions` controls runtime versions.” It redirects declaration lookup only.
- “The repository build passes, so package consumers have types.” The published archive may omit files or expose different paths.
- “`export =` and `export default` are interchangeable.” They represent different module contracts and interop behavior.

## Self-check rubric

Score each answer 0–2: **0** for a wrong rule; **1** for a mostly right answer missing host/configuration/runtime implications; **2** when you state the applicable module mode or declaration rule, explain what the compiler changes, and separate that from runtime behavior. Aim for 18/24, with no zero on resolver mismatch, augmentation, or package publishing.
