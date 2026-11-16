# TypeScript compiler, TSConfig options, project references, and build modes — Reference: JavaScript support, JSX, interoperability, and decorators options

## Scope and version

This lesson explains 26 supplied names in the javascript support, jsx, interoperability, and decorators options group. The current stable compiler is TypeScript 7.0; TypeScript 7.1 is beta as of 2026-11-16. CLI summaries follow the TypeScript 7.1.0-beta compiler help and beta package declarations. Preview-only claims are labeled beta. Do not generalize beta defaults or APIs to TypeScript 7.0. [TypeScript 7.0](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/) · [TypeScript 7.1 beta](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/) · [beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta)

## How this group fits the mental model

This group shapes which source languages and ambient environments join a program and how JSX/decorators are interpreted. JS checking, type-package inclusion, JSX transform choice, and legacy decorators are separate decisions; do not treat one flag as a universal framework setup.

## Supplied names explained

Each row corresponds to one exact manifest item. For CLI and config names, the description, default, and allowed values follow the compiler own --all help where available.

| Supplied name | What it does and why it matters |
|---|---|
| `allowJs` | Allow JavaScript files to be a part of your program. Use the 'checkJs' option to get errors from these files. default: `false`, unless `checkJs` is set |
| `checkJs` | Enable error reporting in type-checked JavaScript files. default: false |
| `maxNodeModuleJsDepth` | Specify the maximum folder depth used for checking JavaScript files from 'node_modules'. Only applicable with 'allowJs'. default: 0 |
| `disableSizeLimit` | Remove the 20mb cap on total source code size for JavaScript files in the TypeScript language server. default: false |
| `plugins` | Specify a list of language service plugins to include. one or more: default: undefined |
| `allowSyntheticDefaultImports` | Allows a default-import form even if the module lacks a declared default export. It is true by default in this compiler generation and cannot be set to false in TypeScript 6 or 7. |
| `erasableSyntaxOnly` | Do not allow runtime constructs that are not part of ECMAScript. default: false |
| `esModuleInterop` | Enables interop emit for CommonJS imports and also enables synthetic default-import checking. It is true by default and TypeScript 6/7 no longer permits setting it to false. |
| `forceConsistentCasingInFileNames` | Ensure that casing is correct in imports. default: true |
| `isolatedDeclarations` | Require sufficient annotation on exports so other tools can trivially generate declaration files. default: false |
| `isolatedModules` | Ensure that each file can be safely transpiled without relying on other imports. default: false |
| `preserveSymlinks` | Disable resolving symlinks to their realpath. This correlates to the same flag in node. default: false |
| `verbatimModuleSyntax` | Do not transform or elide any imports or exports not marked as type-only, ensuring they are written in the output file's format based on the 'module' setting. default: false |
| `emitDecoratorMetadata` | Emit design-type metadata for decorated declarations in source files. default: false |
| `experimentalDecorators` | Enable experimental support for legacy experimental decorators. default: false |
| `jsx` | Specify what JSX code is generated. one of: preserve, react-native, react-jsx, react-jsxdev, react default: undefined |
| `jsxFactory` | Specify the JSX factory function used when targeting React JSX emit, e.g. 'React.createElement' or 'h'. default: `React.createElement` |
| `jsxFragmentFactory` | Specify the JSX Fragment reference used for fragments when targeting React JSX emit e.g. 'React.Fragment' or 'Fragment'. default: React.Fragment |
| `jsxImportSource` | Specify module specifier used to import the JSX factory functions when using 'jsx: react-jsx*'. default: react |
| `lib` | Specify a set of bundled library declaration files that describe the target runtime environment. one or more: es5, es6/es2015, es7/es2016, es2017, es2018, es2019, es2020, es2021, es2022, es2023, es2024, es2025, es2026, esnext, dom, dom.iterable, dom.asynciterable, webworker, webworker.importscripts, webworker.iterable, webworker.asynciterable, scripthost, es2015.core, es2015.collection, es2015.generator, es2015.iterable, es2015.promise, es2015.proxy, es2015.reflect, es2015.symbol, es2015.symbol.wellknown, es2016.array.include, es2016.intl, es2017.arraybuffer, es2017.date, es2017.object, es2017.sharedmemory, es2017.string, es2017.intl, es2017.typedarrays, es2018.asyncgenerator, es2018.asynciterable/esnext.asynciterable, es2018.intl, es2018.promise, es2018.regexp, es2019.array, es2019.object, es2019.string, es2019.symbol/esnext.symbol, es2019.intl, es2020.bigint/esnext.bigint, es2020.date, es2020.promise, es2020.sharedmemory, es2020.string, es2020.symbol.wellknown, es2020.intl, es2020.number, es2021.promise, es2021.string, es2021.weakref/esnext.weakref, es2021.intl, es2022.array, es2022.error, es2022.intl, es2022.object, es2022.string, es2022.regexp, es2023.array, es2023.collection, es2023.intl, es2024.arraybuffer, es2024.collection, es2024.object/esnext.object, es2024.promise, es2024.regexp/esnext.regexp, es2024.sharedmemory, es2024.string/esnext.string, es2025.collection, es2025.float16/esnext.float16, es2025.intl, es2025.iterator, es2025.promise, es2025.regexp, es2026.array/esnext.array, es2026.collection/esnext.collection, es2026.error/esnext.error, es2026.iterator, es2026.json, es2026.math, es2026.typedarrays/esnext.typedarrays, esnext.iterator, esnext.promise, esnext.date, esnext.decorators, esnext.disposable, esnext.intl, esnext.modulesource, esnext.sharedmemory, esnext.temporal, decorators, decorators.legacy default: undefined |
| `libReplacement` | Enable lib replacement. default: false |
| `moduleDetection` | Control what method is used to detect module-format JS files. one of: auto, legacy, force default: "auto": Treat files with imports, exports, import.meta, jsx (with jsx: react-jsx), or esm format (with module: node16+) as modules. |
| `noLib` | Disable including any library files, including the default lib.d.ts. default: false |
| `reactNamespace` | Specify the object invoked for 'createElement'. This only applies when targeting 'react' JSX emit. default: `React` |
| `target` | Set the JavaScript language version for emitted JavaScript and include compatible library declarations. one of: es6/es2015, es2016, es2017, es2018, es2019, es2020, es2021, es2022, es2023, es2024, es2025, es2026, esnext default: es2026 |
| `useDefineForClassFields` | Emit ECMAScript-standard-compliant class fields. default: `true` for ES2022 and above, including ESNext. |

## Cross-item comparison

allowJs adds JavaScript inputs; checkJs enables diagnostics for them. jsx selects a transform, while jsxFactory/jsxImportSource choose its runtime convention. Decorator emit metadata and decorator syntax are distinct concerns.

allowJs adds JavaScript inputs; checkJs enables diagnostics for them. jsx selects a transform, while jsxFactory/jsxImportSource choose its runtime convention. Decorator emit metadata and decorator syntax are distinct concerns.

## Examples

`allowJs` includes `.js` files; `checkJs` reports type errors in them. React automatic JSX uses a `react-jsx` mode and `jsxImportSource` to choose the runtime package; classic JSX uses a configured factory. These settings do not install React or its types.

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

- allowJs includes JavaScript, but does not by itself guarantee the level of diagnostics desired; understand checkJs and project policy.
- JSX transform options do not install a React-like runtime or its type declarations.
- Legacy experimental decorators and standard decorators are separate language/compiler paths.

## Knowledge checks with answers

1. Which option allows JavaScript files to enter the program? allowJs.
2. Which option reports errors in those JS files? checkJs.
3. Do JSX options install the rendering runtime? No.

Sources: [official TypeScript configuration reference](https://www.typescriptlang.org/tsconfig/), [compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html), [TypeScript 6.0 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html), [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/), [TypeScript 7.1 beta announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-1-beta/), [TypeScript 7.1 beta package](https://www.npmjs.com/package/typescript/v/7.1.0-beta).
