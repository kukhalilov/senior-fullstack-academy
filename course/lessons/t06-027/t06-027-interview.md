
# JavaScript linting, formatting, and source maps — Interview questions and reasoning

## Core questions

1. How do linting, formatting, type checking, and source maps differ?
2. What is the current ESLint config format, and what did ESLint 10 remove?
3. What roles do `languageOptions`, `linterOptions`, `files`, and ignores serve?
4. How does typed TypeScript linting obtain project information, and what does it cost?
5. How do ESLint, Prettier, and Biome compare?
6. What is encoded in a source map's main fields?
7. How can source maps be delivered, and what does “hidden” mean?
8. How would you diagnose a debugger showing the wrong authored source location?

## Concise interview answers

1. Linting reports configured pattern/rule diagnostics; formatting rewrites layout; type checking analyzes type relationships; source maps map generated locations to authored sources.
2. Flat config became default in ESLint v9; ESLint v10 removed legacy eslintrc support. Current configs export objects/arrays from `eslint.config.*`; matching, ignores, plugin objects, and language options differ from legacy config.
3. `files` selects a config's target files; `languageOptions` controls parser/language/globals; `linterOptions` controls lint-engine behavior; ignores can be global or scoped to a config object.
4. typescript-eslint can enable `projectService` and type-aware presets such as `recommendedTypeChecked`. It analyzes TypeScript project information, which is slower and requires correct TSConfig coverage.
5. ESLint is an extensible linter; Prettier is an opinionated formatter; Biome bundles formatter, linter, and assist actions. Their rules and output differ, so assign clear ownership.
6. `sources`, optional `sourcesContent`, `names`, and Base64 VLQ `mappings`, plus fields such as `version: 3`, optional `file`, `sourceRoot`, `ignoreList`, or indexed `sections`.
7. A map may be inline in a data URL, external by annotation/header, or emitted without a public annotation by a bundler's hidden-map convention. Hidden output is not access control.
8. Verify the map belongs to the exact deployed artifact, the resolved map URL/header is correct, source paths/content align, and transforms preserved useful mappings.

## Deep follow-up answers

**Why not simply enable every type-aware rule everywhere?** Type-aware rules incur project analysis time and need files in a TypeScript project. Config files, generated code, scripts, or test files may belong to different projects. Apply the intended rules to deliberate file groups and make the compiler/type-check step explicit.

**Why can ESLint show no errors while TypeScript fails?** ESLint's syntax and rule layer is distinct from `tsc`. Even type-aware lint rules are a selected set of lints and may use project data differently from a full compiler run. Keep both commands when the project requires both guarantees.

**How would you migrate to flat config?** Inventory old envs, parser, parserOptions, plugins, extends, overrides, ignores, and inline-disable policy; translate them to flat config objects and file matches; set globals explicitly; test effective config for representative files; and remove deprecated flags/config assumptions. For ESLint 10, migrate fully because eslintrc is no longer supported. The migrator can provide a starting point but must be reviewed.

**What changed in Biome v2 import organization?** It moved into assist actions at `assist.actions.source.organizeImports`; the old standalone v1 shape is not current. v2 can also alter sorting/organize exports behavior, so migration should inspect resulting import order and side-effect assumptions.

**What makes a map inaccurate even if it parses?** A stale map for another build, a wrong URL/sourceRoot, incomplete mappings, missing original sources, or a transform that discarded location relationships. Validate against an actual deployed stack location, not just JSON syntax.

**What are the privacy considerations?** A map can expose filenames, names, and `sourcesContent`. Separate public maps from private error-monitor uploads if source disclosure is unacceptable, and treat hidden-link behavior as discoverability convention rather than an authorization mechanism.

## Scenario questions

1. Formatting changes happen in opposite directions on save. Identify the competing formatter/config ownership and propose a one-owner policy.
2. `projectService` reports a file is outside a project. Explain what project matching must be inspected and when to narrow typed rules.
3. CI passes ESLint but `tsc --noEmit` fails. Explain why this is possible and how the pipeline should represent both checks.
4. A browser shows minified locations despite a valid `.map`. Check linking, response header precedence, deployed artifact alignment, and source URLs.
5. A source map is called hidden but its path is public. Explain the difference between omission of an annotation and access control.

## Tradeoffs and alternatives

Prettier minimizes format-policy debate and reduces style diffs; Biome offers an integrated toolchain with a different feature/plugin surface; ESLint has a mature customizable rule ecosystem and supports syntax/type-aware integrations. Typed lint adds depth at analysis cost. Source maps improve production diagnostics but add deployment, cache/version, and exposure decisions. Choose based on language support, required checks, team workflow, CI time, and how generated code is debugged.

## Common weak answers

- “Linting proves correctness.” Rules are bounded checks, not a proof.
- “ESLint replaces `tsc`.” They have different roles.
- “A formatter catches bugs.” It makes layout consistent; semantic checks are separate.
- “All ESLint ignores are global.” Scope depends on the config object/helper.
- “Type-aware lint is free.” It builds project type information and costs time.
- “Biome is a drop-in identical combination of ESLint and Prettier.” Coverage/config/output differ.
- “Source map v3 means the compiler is on v3.” It is the data format marker.
- “Hidden source maps cannot be obtained.” Their deployment path may still be accessible.
- “A valid map guarantees correct debugging.” It must correspond to the served artifact and include useful mappings.

## Self-check rubric

Score 0 (missing), 1 (partly correct), or 2 (clear and accurate): four tool responsibilities; flat-config file matching/ignores; type-aware project requirements; formatter ownership; major ESLint/Biome migrations; source-map fields; mapping limitations; map delivery/privacy. Strong answers score at least 13/16 and can explain one concrete debugging failure end to end.

## Sources

- [ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files · [ESLint 10 migration](https://eslint.org/docs/latest/use/migrate-to-10.0.0))
- [ESLint migration guide](https://eslint.org/docs/latest/use/configure/migration-guide)
- [typescript-eslint typed linting](https://typescript-eslint.io/getting-started/typed-linting/)
- [Prettier configuration](https://prettier.io/docs/configuration)
- [Biome v2 migration](https://biomejs.dev/installation/upgrade-to-biome-v2/)
- [ECMA-426 Source Map format](https://tc39.es/ecma426/2024/)
