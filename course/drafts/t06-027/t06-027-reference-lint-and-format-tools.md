<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript linting, formatting, and source maps — Reference: Current JavaScript and TypeScript lint/format tools

# Scope and version

This reference covers the sixteen supplied tool and configuration names, using current official documentation checked 16 November 2026. It describes the main responsibilities and configuration surfaces rather than every individual lint rule or formatter option. See [ESLint configuration](https://eslint.org/docs/latest/use/configure/), [Prettier configuration](https://prettier.io/docs/configuration), [Biome quick start](https://biomejs.dev/installation/quick-start/), and [typescript-eslint typed linting](https://typescript-eslint.io/getting-started/typed-linting/).

# How this group fits the mental model

Choose the tool that owns each job. ESLint primarily evaluates configurable rules. typescript-eslint connects TypeScript syntax and project type information to ESLint. Prettier formats. Biome provides formatting, linting, and assist actions in an integrated tool. A project can combine tools, but overlapping rewrite jobs should have one clear owner.

# Supplied names explained

- `ESLint` — An extensible JavaScript lint engine. It parses selected files, applies configured rules, and reports diagnostics. It can support TypeScript through parser/plugin integration; it is not by itself the TypeScript compiler or a full formatter.
- `typescript-eslint` — The project that supplies TypeScript parsing, ESLint integration, shared configurations, and TypeScript-aware rules. It includes a convenient `typescript-eslint` package as well as separately published parser/plugin packages. Versioned configuration and flat-config patterns should follow the installed release's docs.
- `Prettier` — An opinionated code formatter with language parsers and optional plugins. It discovers configuration upward from the file location and intentionally has no global configuration, so repository policy can be shared across machines.
- `Biome` — A toolchain with a formatter, linter, and assist actions. It overlaps with ESLint and Prettier but does not have identical language coverage, plugins, rules, or formatting choices. Biome v2 uses `assist.actions.source.organizeImports` for import organization.
- `ESLint flat config` — ESLint's current configuration system based on an array of configuration objects exported from an `eslint.config.*` file. It is the default from ESLint v9. Config objects compose according to file matching and order/extension behavior; this differs from legacy `.eslintrc` merging.
- `eslint.config.js` — A common flat-config file name. Its module interpretation follows Node/package settings; `.mjs` and `.cjs` alternatives make module format explicit. ESLint searches from target-file directories upward unless configuration is selected explicitly.
- `defineConfig` — A helper exported by `eslint/config` in current flat config that accepts configuration objects/arrays and normalizes composition such as `extends`. Use the API available in the installed ESLint version.
- `globalIgnores` — Current ESLint helper from `eslint/config` for declaring patterns that globally exclude files from linting. A config object's plain `ignores` with no other configuration similarly has global behavior; `ignores` alongside other settings applies only to that config object.
- `languageOptions` — Flat-config area for language settings, including `ecmaVersion`, `sourceType`, `globals`, `parser`, and `parserOptions`. JavaScript syntax version and module/script mode affect parsing; TypeScript syntax needs its parser.
- `linterOptions` — Flat-config area for linter-level controls such as `noInlineConfig` and `reportUnusedDisableDirectives`. It is distinct from source language options and from rule settings.
- `plugins` — Flat-config plugin map from namespace keys to plugin objects. Plugins add rules and can expose configs, processors, or languages. In flat config, plugin object registration replaces some legacy string-array/plugin-name resolution assumptions.
- `processor` — A plugin-provided pre/postprocessor used to extract or transform code regions for linting (for example, embedded scripts in another file format), then map reported locations/results back. A processor is not a parser and does not guarantee semantic analysis of the host language.
- `rules` — Rule identifiers mapped to severity and optional rule-specific options. Severity is `off`, `warn`, or `error`. A rule configuration is policy; it is not a JavaScript language feature.
- `settings` — Shared plugin-specific configuration data available to rules. ESLint itself does not assign one universal meaning to arbitrary settings keys; the consuming plugin defines them.
- `Prettier configuration file` — Project configuration in supported package keys or formats such as `.prettierrc`, `prettier.config.*`, or TOML. Resolution is relative to the formatted file and walks parent directories. TypeScript config files require the documented runtime/support setup; do not assume every config extension works in every Node release.
- `Biome configuration file` — Usually `biome.json` or `biome.jsonc`, with a versioned schema reference and sections such as `formatter`, `linter`, `javascript`, and `assist`. Its supported keys change between major versions; use the schema for the installed version.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| `ESLint` vs `Biome` | ESLint is a composable linter; Biome bundles a linter, formatter, and assists with a different ecosystem and rule set. |
| `Prettier` vs `Biome` formatter | Both format supported syntax but can produce different output and have different configuration, parser/plugin, and language coverage. |
| `ESLint flat config` vs legacy eslintrc | Flat config uses JavaScript config objects, explicit file matching, and changed ignore/plugin/parser configuration behavior. |
| `defineConfig` vs a config file | The helper normalizes flat configuration; `eslint.config.js` is the module that exports the configuration. |
| `languageOptions` vs `linterOptions` | Parser/language/global context versus behavior of the linter and inline configuration. |

# Examples

```js
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist/", "coverage/"]),
  {
    files: ["src/**/*.js"],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
    },
    rules: {
      "no-console": "warn",
    },
  },
]);
```

This illustrates current API shapes, not an exact version-independent starter configuration. Confirm helper exports and supported values against the installed ESLint release.

A simplified Prettier project config could be `.prettierrc.json`; a `.prettierignore` file excludes generated files from the CLI and integrations. Prettier parser plugins are installed/configured when support for a syntax is not built into core.

Biome v2 uses an assist configuration such as:

```json
{
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

# Common mistakes

- Copying old `.eslintrc` keys into flat config without migration.
- Treating `files` and ignores as generic glob lists independent of config scope/base path.
- Registering a plugin as a legacy string rather than a flat-config plugin object.
- Expecting ESLint to perform TypeScript type checking without project service/type-aware rules.
- Enabling type-aware rules on files that are outside all configured TS projects.
- Running ESLint stylistic rules and Prettier with conflicting formatting ownership.
- Assuming Biome's diagnostics or formatting are exactly interchangeable with ESLint plus Prettier.
- Using a Biome v1 import organizer setting in a v2 configuration.
- Assuming Prettier's TypeScript configuration file loads on every supported Node version without extra setup.

# Knowledge checks with answers

1. **Which current ESLint file format is default?** Flat config via `eslint.config.*` (default since ESLint v9).
2. **Where do parser and global settings go in flat config?** Under `languageOptions`.
3. **Where do `noInlineConfig` and unused-disable behavior go?** Under `linterOptions`.
4. **What does a processor do?** It preprocesses/postprocesses nonstandard or embedded code for linting; it is distinct from parser selection.
5. **Does Prettier configuration normally come from a global machine file?** No; it is project-discovered from the file upward.
6. **Where is Biome v2 organize-imports configured?** `assist.actions.source.organizeImports`.

# Sources

- [ESLint configuration](https://eslint.org/docs/latest/use/configure/)
- [ESLint configuration files](https://eslint.org/docs/latest/use/configure/configuration-files)
- [ESLint language options](https://eslint.org/docs/latest/use/configure/language-options)
- [ESLint migration guide](https://eslint.org/docs/latest/use/configure/migration-guide)
- [typescript-eslint typed linting](https://typescript-eslint.io/getting-started/typed-linting/)
- [Prettier configuration](https://prettier.io/docs/configuration)
- [Prettier ignore files](https://prettier.io/docs/ignore/)
- [Biome quick start](https://biomejs.dev/installation/quick-start/)
- [Biome configuration](https://biomejs.dev/reference/configuration/)
- [Biome v2 migration](https://biomejs.dev/installation/upgrade-to-biome-v2/)
