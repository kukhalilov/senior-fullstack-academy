
# JavaScript linting, formatting, and source maps — Reference: Core lint configuration and rule controls

# Scope and version

This reference covers the nineteen supplied rule, matching, plugin, and TypeScript integration terms using current ESLint and typescript-eslint flat-config documentation. It is not an exhaustive catalog of individual lint rules. See [ESLint config files](https://eslint.org/docs/latest/use/configure/configuration-files), [ESLint language options](https://eslint.org/docs/latest/use/configure/language-options), and [typed linting](https://typescript-eslint.io/getting-started/typed-linting/).

# How this group fits the mental model

ESLint first selects applicable configuration for a file, establishes parser and language behavior, then runs configured plugins/processors/rules. The diagnostic severity controls reporting, not runtime. Type-aware rules add a TypeScript project-analysis stage and therefore require the file to belong to an available project.

# Supplied names explained

- `ESLint rule severity off` — A rule setting that disables that rule for the applicable files. It may override a shared config, but frequent broad disabling can hide useful checks.
- `ESLint rule severity warn` — Reports a warning. Projects commonly allow warnings in local development or fail CI based on a separate warning-count policy; severity alone is not a language runtime behavior.
- `ESLint rule severity error` — Reports an error-level lint diagnostic. CI commonly treats it as failure, depending on the command and configuration.
- `ESLint parser` — The parser converts source into an AST ESLint rules can analyze. `languageOptions.parser` selects a parser object; JavaScript defaults and TypeScript parsing have different syntax support. A parser does not itself guarantee type checking.
- `ESLint parserOptions` — `languageOptions.parserOptions` configure parser behavior such as ECMAScript version, source type, or parser-specific options. Do not confuse parser options with TypeScript compiler options in `tsconfig.json`; the parser/project integration uses TypeScript project config for type information.
- `ESLint globals` — Names available in the file's runtime host, configured in `languageOptions.globals` as read-only/writable values or via a globals package. Declaring a global only informs lint analysis; it does not create that value at runtime.
- `ESLint files matching` — A config object's `files` patterns select files to which that object applies. Patterns use ESLint's glob semantics and can be affected by `basePath`; several config objects may apply to one file. Files not matched by relevant configurations can receive only default behavior or be reported as ignored depending on invocation.
- `ESLint ignores` — A flat-config `ignores` list excludes paths. When an object contains only `ignores` (and optional name metadata), it establishes global ignore patterns; combined with other settings it scopes exclusions to that object. Current `globalIgnores()` is the clearer helper for global exclusions.
- `ESLint basePath` — A flat-config property that sets the directory base for that config object's `files` and `ignores` patterns. Relative paths are resolved relative to the configuration file (or the working directory for an alternate `--config` file) under ESLint's documented rules.
- `ESLint extends` — A flat-config property that composes other configuration objects or arrays for the matching config object (through current `defineConfig`/flat-config support). It is not the same string-resolution scheme as legacy shareable-config names in every context.
- `ESLint shareable config` — Reusable set of config objects/rules distributed by a package. Flat-config packages often export config objects directly; `@eslint/js` supplies core recommended configurations, while plugins commonly export their own presets.
- `ESLint plugin` — A plugin object registered in the flat config's `plugins` map. It can expose rules, configurations, processors, and sometimes language integrations. Rule IDs use the configured namespace.
- `ESLint processor` — Plugin integration that preprocesses a file into lintable blocks and postprocesses diagnostics, such as extracting embedded code. Use a parser for syntax grammar; a processor handles file/block adaptation.
- `ESLint inline disable directive` — A comment directive such as `// eslint-disable-next-line no-alert` that changes lint configuration for nearby code. Keep it as narrow as possible and explain intentional exceptions; it does not suppress TypeScript compiler diagnostics or runtime errors.
- `ESLint reportUnusedDisableDirectives` — `linterOptions.reportUnusedDisableDirectives` controls reporting of disable comments that suppress no currently reported problem. These may be warnings/errors/off according to supported configuration; removing stale disables prevents future problems from being silently exempted.
- `ESLint noInlineConfig` — `linterOptions.noInlineConfig` disables inline comments that modify ESLint configuration. It is useful where repository policy must be controlled centrally; it does not disable ordinary explanatory comments.
- `typescript-eslint parser` — `@typescript-eslint/parser` parses TypeScript syntax into an ESLint-compatible AST and can provide parser services. It is not the TypeScript compiler and does not automatically give every rule type information.
- `typescript-eslint.configs.recommendedTypeChecked` — The current flat-config shared preset for recommended rules that require type checking. Pair it with project service/type information and ensure only appropriate files receive it; its exact rule list follows the installed typescript-eslint release.
- `typescript-eslint project service` — `languageOptions.parserOptions.projectService: true` asks typescript-eslint to obtain type information through TypeScript's project service, generally using the nearest `tsconfig.json` similarly to editor behavior. Files not included in the project may need configuration or a non-type-checked rule set. Type-aware linting costs additional analysis time.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `ESLint parser` vs processor | Parser understands a language grammar; processor adapts a file or embedded blocks into lintable source and maps results back. |
| `ESLint globals` vs runtime definition | Globals tells lint analysis a name exists; application/runtime setup must still provide it. |
| Global ignores vs per-object ignores | Global ignores remove files from all config matching; local ignores only prevent that config object from applying. |
| Syntax-only lint vs type-aware lint | AST-based rules can work without whole-project types; type-aware rules require project analysis and cost more. |
| typescript-eslint parser vs TypeScript compiler | The parser integrates syntax/services with ESLint; `tsc` performs compiler/type-check behavior. |

# Examples

```js
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist/", "coverage/"]),
  {
    files: ["src/**/*.{js,ts}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: { console: "readonly" },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
    },
  },
  {
    files: ["src/**/*.ts"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: { parserOptions: { projectService: true } },
  },
]);
```

This is a shape example, not a universal preset. Confirm package versions, file coverage, and project inclusion. If `src` files are outside a TSConfig or the config file itself is linted unexpectedly, adjust the matching/project setup rather than suppressing parser errors globally.

# Common mistakes

- Putting parser/global settings in legacy top-level keys instead of `languageOptions`.
- Assuming a global declaration creates a host API at runtime.
- Assuming a config's `ignores` is always global.
- Assuming `basePath` is relative to the current terminal directory in all invocation modes.
- Treating a processor as a parser or a parser as a type checker.
- Enabling type-checked presets without `projectService` or another valid project-information setup.
- Applying type-aware rules to generated/config files that are not in any TypeScript project.
- Using broad inline disables that mask future violations.
- Expecting `noInlineConfig` to remove comments or disable compiler directives.

# Knowledge checks with answers

1. **What do `off`, `warn`, and `error` change?** Rule reporting severity.
2. **Where are ESLint parser options and globals configured in flat config?** In `languageOptions`.
3. **Does a global name declaration install that API in Node or a browser?** No, it only informs lint analysis.
4. **What does project service provide?** TypeScript project/type information for type-aware rules.
5. **What does a processor handle?** Nonstandard files or embedded blocks and result mapping.
6. **Can a local `ignores` entry remove a file from every config?** Not when it appears with other config properties; use global ignore semantics/helper.

# Sources

- [ESLint configuration files](https://eslint.org/docs/latest/use/configure/configuration-files)
- [ESLint language options](https://eslint.org/docs/latest/use/configure/language-options)
- [typescript-eslint typed linting](https://typescript-eslint.io/getting-started/typed-linting/)
- [typescript-eslint project service troubleshooting](https://typescript-eslint.io/troubleshooting/typed-linting/)
