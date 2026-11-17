<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript linting, formatting, and source maps — Exercises and worked solutions

# Goals

Practice separating lint, type-check, formatting, and mapping concerns; repair flat-config misunderstandings; choose type-aware coverage safely; and inspect source-map structure and deployment risks.

# Worked example

A CI job fails because `src/app.ts` is not included in the nearest TypeScript project, but ESLint applies `recommendedTypeChecked` to all `**/*.ts` files. The problem is not necessarily bad application code: the typed lint config requests project information that does not exist for this file. Either include/configure the file in the intended TS project, narrow the type-aware `files` scope, or use syntax-only rules for that file. Do not globally disable parser errors and assume typed checks still ran.

# Exercises

Predict the issue and propose a repair before reading the solutions.

## Exercise 1: choose a tool for each task

A team wants consistent quotes and line breaks, warnings for suspicious code, and detection of floating Promises using TypeScript types. Which jobs belong to a formatter, a linter, and type-aware linting? Does a clean ESLint run replace `tsc`?

## Exercise 2: ESLint 9-to-10 migration

A repository still has `.eslintrc.json` and uses `ESLINT_USE_FLAT_CONFIG=false`. What changed in ESLint 9 and 10, and what must happen before upgrading to 10?

## Exercise 3: rule severity

```js
rules: {
  "no-alert": "warn",
  "no-debugger": "error",
  "no-console": "off",
}
```

What does each severity mean? Does `"error"` cause a runtime exception?

## Exercise 4: flat-config ignores

```js
export default [
  {
    ignores: ["dist/**"],
    files: ["src/**/*.js"],
    rules: { semi: "error" },
  },
];
```

Is `dist/**` necessarily a global ignore? How can a project express global ignores clearly in current ESLint?

## Exercise 5: TypeScript project service

`recommendedTypeChecked` reports that `scripts/release.ts` was not found by the project service. What should you check before disabling the rule?

## Exercise 6: competing formatters

ESLint's stylistic rule changes quote style to single quotes, while Prettier rewrites it to double quotes on every save. What responsibility/configuration conflict is present, and how should the team resolve it?

## Exercise 7: Biome v1-to-v2 migration

An old configuration contains:

```json
{ "organizeImports": { "enabled": true } }
```

What is the current Biome v2 configuration area for the corresponding assist action?

## Exercise 8: source-map fields

Match each field to its role: `sources`, `sourcesContent`, `names`, `mappings`, `ignoreList`, `sections`.

## Exercise 9: source map delivery

Generated JavaScript ends with `//# sourceMappingURL=app.js.map`; its HTTP response also sends a `sourcemap` header naming another map. Which URL has precedence under ECMA-426? What did older `x-sourcemap` clients use?

## Exercise 10: hidden map privacy

A bundler emits `main.js.map` but leaves out a sourceMappingURL comment. Is the map necessarily private? What should the team inspect?

## Exercise 11: mappings and columns

Why should a tool not count JavaScript source-map columns as UTF-8 bytes or Unicode grapheme clusters? What does the `version` value 3 identify?

# Progressive hints

1. **Exercise 1:** Formatting produces stable layout; linting reports rule diagnostics; typed lint uses project analysis.
2. **Exercise 2:** ESLint 9 made flat config the default; ESLint 10 removed eslintrc and the legacy opt-out. Migrate config before upgrading.
3. **Exercise 3:** Severity controls diagnostic level and CI policy, not browser behavior.
4. **Exercise 4:** An `ignores` entry alongside rules/files is local to that config object.
5. **Exercise 5:** Check nearest TSConfig, include/exclude, file globs, and whether typed rules should apply.
6. **Exercise 6:** Two tools are both claiming formatting authority.
7. **Exercise 7:** Look under `assist.actions.source`.
8. **Exercise 8:** Identifiers/text, source text, symbol names, encoded locations, third-party source indices, composed maps.
9. **Exercise 9:** The standard gives precedence to one mechanism.
10. **Exercise 10:** Hiding the annotation is not access control.
11. **Exercise 11:** ECMA-426 defines JS/CSS columns using UTF-16 code units.

# Complete solutions

## Solution 1

Use Prettier or Biome formatter for stable layout. Use ESLint or Biome linter for suspicious-code/style rules. Use TypeScript-aware lint rules with typescript-eslint project service for checks that need type information. Run `tsc` according to the project's TypeScript configuration as well; ESLint's type-aware lint layer does not replace the TypeScript compiler.

## Solution 2

ESLint 9 made flat config the default while temporarily retaining the legacy system. ESLint 10 removed eslintrc support and the legacy opt-out, so migrate to `eslint.config.*` and verify representative effective configurations before upgrading.

## Solution 3

`warn` reports a warning; `error` reports an error-level diagnostic; `off` disables that rule. Whether warnings fail CI depends on command options and pipeline policy. A lint `error` is not a JavaScript runtime exception and does not change code execution.

## Solution 4

The ignore is combined with `files` and `rules`, so it applies to that configuration object rather than necessarily excluding `dist/**` from all configurations. Use a config object containing only `ignores` (and optional name metadata) for global ignore patterns, or the current `globalIgnores(["dist/**"])` helper from `eslint/config`.

## Solution 5

Inspect which `tsconfig.json` is nearest to `scripts/release.ts`, whether its include/files patterns include that file, and whether the file should be checked with type-aware rules. If it should not belong to a project, narrow the type-checked `files` pattern or use syntax-only rules there. Avoid suppressing an error that means the rule never got its intended type information.

## Solution 6

Both ESLint and Prettier claim formatting authority. Choose one formatter as the source of layout rewrites. A common approach is Prettier for formatting and ESLint for non-formatting correctness rules; alternatively, configure one integrated tool and remove conflicting rules. Keep editor and CI commands consistent.

## Solution 7

In Biome v2, configure the assist under `assist.actions.source.organizeImports`, for example `{ "assist": { "actions": { "source": { "organizeImports": "on" } } } }`. The migration changes import/export ordering behavior in addition to configuration shape, so review the diff after migration.

## Solution 8

`sources` lists original source names/URLs. `sourcesContent` optionally embeds their source text in matching order. `names` holds optional symbol names. `mappings` encodes generated-to-original location segments. `ignoreList` identifies source indices developer tools may treat as third-party. `sections` composes an indexed map using generated offsets and embedded maps.

## Solution 9

The HTTP `sourcemap` header takes precedence over the source annotation. The older `x-sourcemap` spelling is deprecated. If both are present and disagree, consumers following the standard should resolve using the header.

## Solution 10

No. A generated map could still be fetched if the path is known, appear in a manifest, be exposed by static hosting, or be uploaded elsewhere. Check deployment/static files, response headers, CDN access, source contents embedded via `sourcesContent`, and private error-service upload configuration. “Hidden” usually only describes omission of the generated-code annotation.

## Solution 11

ECMA-426 defines JavaScript/CSS columns as zero-based UTF-16 code-unit offsets. A multi-unit character can occupy more than one column, and byte offsets/grapheme counts differ. The integer `version: 3` identifies the source-map data format, not a tool release or standard edition.

# Tests and edge cases

Configuration should be tested with the real installed tool versions. A minimal check is to lint one JavaScript file, one TypeScript file in the intended project, a file outside that project, and an ignored generated file; inspect the effective config for each. Format a sample twice and confirm the second run has no diff. For source maps, load the map from the deployed output URL and verify at least one generated stack location maps to the expected authored file and line.

```js
const severity = { off: 0, warn: 1, error: 2 };
console.log(severity.warn); // 1: illustrative config data, not ESLint runtime semantics
```

# Reflection questions

1. Which tool owns each diagnostic or rewrite, and is that ownership explicit in CI?
2. Are type-aware rules running on every intended TS file and no unintended config/generated files?
3. Does the map correspond to the exact artifact being served?
4. Is original source embedded or publicly retrievable?
5. Did a major tool upgrade change config keys, default file matching, or import sorting?

# Sources

- [ESLint configuration files](https://eslint.org/docs/latest/use/configure/configuration-files)
- [ESLint migration guide](https://eslint.org/docs/latest/use/configure/migration-guide)
- [ESLint 10 migration guide](https://eslint.org/docs/latest/use/migrate-to-10.0.0)
- [typescript-eslint typed linting](https://typescript-eslint.io/getting-started/typed-linting/)
- [Prettier configuration](https://prettier.io/docs/configuration)
- [Biome v2 migration](https://biomejs.dev/installation/upgrade-to-biome-v2/)
- [ECMA-426 Source Map format](https://tc39.es/ecma426/2024/)
