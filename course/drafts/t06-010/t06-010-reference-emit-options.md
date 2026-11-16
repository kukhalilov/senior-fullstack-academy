# TypeScript compiler, TSConfig options, project references, and build modes — Reference: JavaScript, declaration, and source-map emit options

## Scope and version

This lesson explains 20 supplied names in the javascript, declaration, and source-map emit options group. The current stable compiler is TypeScript 7.0; TypeScript 7.1 is beta as of 2026-11-16. CLI summaries follow the TypeScript 7.1.0-beta compiler help and beta package declarations. Preview-only claims are labeled beta. Do not generalize beta defaults or APIs to TypeScript 7.0. [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) · [beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta)

## How this group fits the mental model

The key decision is which tool owns each artifact. `noEmit` turns TypeScript into a checker; declaration emit creates package type surfaces; maps support debugger navigation. TypeScript 7 rejects `downlevelIteration`, and a target setting cannot supply missing runtime polyfills.

## Supplied names explained

Each row corresponds to one exact manifest item. For CLI and config names, the description, default, and allowed values follow the compiler own --all help where available.

| Supplied name | What it does and why it matters |
|---|---|
| `declaration` | Generate .d.ts files from TypeScript and JavaScript files in your project. default: `false`, unless `composite` is set |
| `declarationDir` | Specify the output directory for generated declaration files. |
| `declarationMap` | Create sourcemaps for d.ts files. default: false |
| `downlevelIteration` | Historical helper-based iteration lowering for older targets. It is unsupported in TypeScript 7; choose a supported modern target rather than relying on this flag. [TypeScript 7 changes](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) |
| `emitBOM` | Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files. default: false |
| `emitDeclarationOnly` | Only output d.ts files and not JavaScript files. default: false |
| `importHelpers` | Allow importing helper functions from tslib once per project, instead of including them per-file. default: false |
| `inlineSourceMap` | Include sourcemap files inside the emitted JavaScript. default: false |
| `inlineSources` | Include source code in the sourcemaps inside the emitted JavaScript. default: false |
| `mapRoot` | Specify the location where debugger should locate map files instead of generated locations. |
| `newLine` | Set the newline character for emitting files. one of: crlf, lf |
| `noEmit` | Disable emitting files from a compilation. default: false |
| `noEmitHelpers` | Disable generating custom helper functions like '__extends' in compiled output. default: false |
| `noEmitOnError` | Disable emitting files if any type checking errors are reported. default: false |
| `outDir` | Specify an output folder for all emitted files. |
| `preserveConstEnums` | Disable erasing 'const enum' declarations in generated code. default: false |
| `removeComments` | Disable emitting comments. default: false |
| `sourceMap` | Create source map files for emitted JavaScript files. default: false |
| `sourceRoot` | Specify the root path for debuggers to find the reference source code. |
| `stripInternal` | Disable emitting declarations that have '@internal' in their JSDoc comments. default: false |

## Cross-item comparison

Emit controls are orthogonal: JavaScript, declarations, source maps, and no-output are separate outcomes.

noEmit disables output; noEmitOnError only blocks output when diagnostics exist. declaration emit creates package type declarations, while sourceMap and declarationMap map different outputs.

## Examples

A Vite app commonly uses `noEmit: true`; a library may use `declaration: true`, `declarationMap: true`, `emitDeclarationOnly: true`, and `outDir`. `noEmit` disables all compiler output; `noEmitOnError` only blocks output after an error.

```json
{
  "compilerOptions": {
    "strict": true,
    "module": "preserve",
    "moduleResolution": "bundler",
    "rootDir": "./src",
    "noEmit": true,
    "types": []
  },
  "include": ["src/**/*.ts"]
}
```

After changing the configuration, inspect tsc --showConfig and tsc --listFilesOnly. The first answers which settings won after inheritance; the second answers which files became roots/inputs. For resolution differences use tsc --traceResolution.

## Common mistakes

- target and lib do not install polyfills.
- noEmit and noEmitOnError have different meanings.
- TypeScript 7 no longer supports downlevelIteration; do not recommend it as a modern setting.

## Knowledge checks with answers

1. Does noEmitOnError disable all output? No; noEmit does, while noEmitOnError blocks output after diagnostics.
2. Do target and lib polyfill runtime APIs? No.
3. Which setting creates consumer-facing type output? declaration.

Sources: [official TypeScript configuration reference](https://www.typescriptlang.org/tsconfig/), [compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html), [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [TypeScript 7.1 beta announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/), [TypeScript 7.1 beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta).
