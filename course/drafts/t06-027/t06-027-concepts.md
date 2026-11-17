<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript linting, formatting, and source maps — Core concepts and how they fit together

# Learning objectives

Separate linting, formatting, type checking, and source mapping; configure ESLint flat config with file scopes and language options; understand typed linting costs and project service; compare ESLint, Prettier, and Biome; and reason about how source maps link generated code to source.

# Prerequisites

Know JavaScript/TypeScript files, package scripts, a project directory, and basic build output. A **diagnostic** reports a rule finding. A **formatter** transforms code layout. A **source map** is metadata relating locations in generated output to locations in source inputs.

# Core concepts

## Four jobs, four kinds of result

Linting analyzes patterns under a rule set and produces diagnostics. It can identify suspicious code, enforce team conventions, or prohibit known hazards, but a clean lint run proves only that enabled checks found nothing. Formatting chooses a stable representation of code. It may reduce stylistic diffs, but it does not prove the program correct. Type checking reasons about declared/inferred types; ESLint does not perform full TypeScript type checking by default. Source maps support debugging transformed code; they neither change execution nor validate source.

Keep these jobs explicit in scripts, CI and editor settings. If ESLint formatting rules and Prettier both rewrite the same whitespace, they can disagree. Common choices are Prettier as the formatter with ESLint for non-formatting rules, or a deliberate Biome configuration for its supported formatter/linter/assist functionality.

## ESLint flat config composes matching configuration objects

ESLint 9 made flat config the default; ESLint 10 removed legacy eslintrc support, so current ESLint 10 projects must use flat config. A project exports config objects from an `eslint.config.js` family file. A config object can select files, set `basePath`, extend shared configurations, choose `languageOptions` (parser, parser options, globals), install `plugins`, attach a `processor`, define `rules`, and provide `settings` or `linterOptions`. More than one object may apply to a file, so the final configuration depends on matching and order/extension rules.

Rule severities are `off` (disabled), `warn` (warning), and `error` (error). Inline disable comments can suppress matching diagnostics; `linterOptions.reportUnusedDisableDirectives` can report stale suppressions, and `noInlineConfig` can disallow inline configuration. Prefer narrow suppressions with an explanation so a waiver does not silently outlive the issue.

Flat-config ignores have two useful forms. A config object containing only `ignores` defines global ignore patterns (apart from optional naming metadata); an `ignores` property alongside rules or language options filters only that config object. Current ESLint also exposes `globalIgnores()` as an explicit helper. Do not copy `.eslintignore` expectations into flat config blindly; matching details and dotfile defaults differ from the legacy system.

## TypeScript linting needs parser and project alignment

ESLint needs TypeScript syntax support from the typescript-eslint parser/integration. Syntax-only rules can analyze the AST without complete type information. Type-aware rules request TypeScript's type checker, often through `languageOptions.parserOptions.projectService: true` and a type-checked preset such as `tseslint.configs.recommendedTypeChecked`.

This deeper analysis is slower because TypeScript must build project information. Files outside the nearest `tsconfig.json` project may trigger project-service errors; either include/configure the file deliberately or avoid type-aware rules for it. Typed linting complements `tsc`; it does not replace the project's compiler settings or type-check command.

## ESLint, Prettier, and Biome have different scopes

ESLint is an extensible linter whose rule, parser, plugin, processor, and configuration surfaces are composed for a project. Prettier is an opinionated formatter: configuration is discovered from the file's directory upward, and the project can pin it so contributors get the same result. It supports parser selection/plugins and ignore files, but does not decide whether code passes semantic lint rules.

Biome bundles a formatter, linter, and assist actions, including import organization. Its set of rules and formatting decisions is not identical to ESLint plus Prettier. Biome v2 moved import organization into `assist.actions.source.organizeImports`; older v1 configuration samples use a different top-level shape. Pick tools based on required language support, plugin ecosystem, CI speed, rules, and migration costs; avoid running competing formatters over the same files without a clear precedence.

## Source maps encode a relation, not a copy of the program

ECMA-426 specifies the Source Map v3 JSON format. A map's `version` field is fixed at integer `3`; it is not a semver string. `sources` lists original sources, optionally with `sourceRoot`; `sourcesContent` can embed source text; `names` stores names used by mapping segments; and `mappings` encodes generated-to-original positions using Base64 VLQ. `file` is optional. `ignoreList` marks source entries treated as third-party by developer tools. `sections` compose an indexed map from ordered, non-overlapping offsets and embedded maps.

JavaScript and CSS map columns use zero-based UTF-16 code-unit offsets. A mapping can omit generated regions or lack a name, so stepping may jump or show generated code. The map must correspond to the exact deployed output, and `sources` resolution depends on the map/source origin.

Generated code can link to a map through a `//# sourceMappingURL=...` annotation or the HTTP `sourcemap` response header; ECMA-426 says the header takes precedence if both are present. The header spelling is `sourcemap`, not the older `x-sourcemap`. Inline maps commonly use a data URL; external maps are separate resources. “Hidden source map” is a bundler delivery convention: the map can be emitted without a public annotation. It is not a fourth mapping syntax.

# Mechanisms and relationships

| Concern | Typical mechanism | Main tradeoff |
| --- | --- | --- |
| Project lint | ESLint rules/plugins | Broad ecosystem, but config complexity and rule maintenance |
| Type-aware lint | typescript-eslint project service | Deeper checks, slower project analysis |
| Formatting | Prettier or Biome formatter | Deterministic diffs, but one style must own rewrites |
| Organize imports | Biome assist or a dedicated plugin/action | Can change import/export ordering; review side-effect-sensitive changes |
| Debug generated output | Source map with correct URL/artifact | Better source locations, but publishing embedded sources has exposure risk |

# Worked examples

An illustrative ESLint flat config for JavaScript plus typed TypeScript files:

```js
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist/", "coverage/"]),
  {
    files: ["**/*.{js,ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: { parserOptions: { projectService: true } },
  },
]);
```

The first matching configuration applies broad JavaScript rules; the TypeScript-specific object adds typed rules only to TS/TSX. Real projects need to validate parser packages, project membership, generated-file ignores, and the exact tool versions.

An illustrative source map may contain `version: 3`, `sources`, `sourcesContent`, `names`, and `mappings`. A generated segment maps a generated column to a source index plus original line/column, optionally including a name index. Those indices and coordinates are encoded as relative Base64 VLQ values to reduce file size.

# Misconceptions and edge cases

- “Lint passing means correct.” It means configured rules reported no blocking findings.
- “ESLint type-checks TypeScript by itself.” Typed linting requires TypeScript parser/project integration; use `tsc` too.
- “Formatting and linting are one job.” A formatter selects layout; lint rules diagnose selected patterns.
- “ESLint config files use the same rules as `.eslintrc`.” Flat config changed shape, matching, and ignore behavior.
- “ESLint 10 can still be switched back to `.eslintrc`.” ESLint 10 removed the legacy configuration system.
- “`recommendedTypeChecked` works without a TypeScript project.” Type-aware rules need project information and may report files outside it.
- “Prettier uses a machine-wide global config.” It intentionally discovers project configuration and does not support global configuration.
- “Biome v2 still uses the v1 `organizeImports` field.” The action moved into `assist.actions.source.organizeImports`.
- “Source map version means tool version.” The map's `version` field is the integer 3.
- “A source map contains a guaranteed exact mapping for every generated character.” Maps can be sparse or lose source correspondence through transforms.
- “Hidden means the map is private.” It usually means generated code omits the public link; deployment/upload choices determine exposure.
- “`sourcesContent` is harmless metadata.” It may embed proprietary or sensitive original code.

# Knowledge checks with answers

1. **What does ESLint rule severity `warn` change?** It reports a warning rather than an error; it does not alter runtime behavior.
2. **Why can a typed ESLint rule run more slowly?** It requests TypeScript project/type information.
3. **What does Prettier primarily decide?** Consistent code formatting, not semantic correctness.
4. **Where is Biome v2 import organization configured?** Under `assist.actions.source.organizeImports`.
5. **What does a source-map `version` of 3 mean?** It identifies the fixed Source Map v3 data format.
6. **What does `sourcesContent` contain?** Optional embedded original source texts aligned with sources.
7. **Which source-map link wins if both header and annotation exist?** The ECMA-426 HTTP `sourcemap` header.
8. **Can an ESLint 10 project rely on `.eslintrc`?** No; migrate to flat config.

# Sources

- [ESLint configuration](https://eslint.org/docs/latest/use/configure/)
- [ESLint flat configuration files](https://eslint.org/docs/latest/use/configure/configuration-files)
- [ESLint 10 migration guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0)
- [ESLint language options](https://eslint.org/docs/latest/use/configure/language-options)
- [typescript-eslint typed linting](https://typescript-eslint.io/getting-started/typed-linting/)
- [Prettier configuration](https://prettier.io/docs/configuration)
- [Biome configuration](https://biomejs.dev/reference/configuration/)
- [Biome v2 migration](https://biomejs.dev/installation/upgrade-to-biome-v2/)
- [ECMA-426 Source Map format](https://tc39.es/ecma426/2024/)
