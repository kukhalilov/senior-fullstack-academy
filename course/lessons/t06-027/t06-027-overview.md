
# JavaScript linting, formatting, and source maps — Big-picture orientation and mental model

# Problem and purpose

Source code benefits from multiple kinds of automated feedback. A linter checks patterns and reports likely mistakes or enforceable rules. A formatter rewrites layout consistently. A type checker analyzes static type relationships. A source map links transformed output locations back to authored sources for debugging. These tools complement one another but do not provide the same guarantee.

# Plain-language mental model

Treat the toolchain as four different questions:

- **Lint:** Is this code suspicious or against a chosen rule?
- **Format:** How should this syntax be laid out consistently?
- **Type-check:** Do the statically known values and operations fit the type model?
- **Map:** If I inspect generated code, where did this location come from?

Configuration decides which files each tool sees and what rules/actions apply. Flat config, TypeScript project discovery, formatter plugins, and source-map publishing all have version-specific behavior, so a working setup should be tied to the actual tool versions in the project.

# How the parts fit together

1. File matching selects source files and assigns language/parser settings.
2. A linter parses those files and applies configured rules at off, warning, or error severity.
3. Type-aware TypeScript lint rules request a TypeScript project and can catch issues that syntax-only rules cannot.
4. A formatter applies deterministic style decisions; import organization is a separate action even when a tool bundles it.
5. A compiler or bundler emits transformed code and an optional source map describing location/name correspondence.
6. The browser, debugger, or error service must load the correct map for the deployed generated file; stale or inaccessible maps produce misleading debugging.

# Concept map

| Tool or artifact | Primary job | Does not guarantee |
| --- | --- | --- |
| ESLint | Rule-driven linting of configured files | Formatting or full TypeScript type checking by default |
| typescript-eslint | TypeScript-aware parsing and lint rules | A replacement for `tsc` type checking |
| Prettier | Opinionated formatting | Whether code is correct or safe |
| Biome | Formatter, linter, and assist actions | Identical rules/format to ESLint plus Prettier |
| Source map | Map generated positions to source positions/names | A one-to-one mapping for every transformed token |

# End-to-end walkthrough

Suppose a TypeScript file is linted and formatted, then bundled and minified. ESLint flat config first needs to match the file and select a TypeScript parser/config. If typed rules are enabled, typescript-eslint asks the TypeScript project service for type information. Prettier or Biome formats the authored source according to one chosen style policy. The bundler then emits `app.min.js` and possibly `app.min.js.map`. A mapping table in the map lets developer tools translate a generated stack location back to the TypeScript source. If the map belongs to a different build, the debugger can show the wrong line even though the map is syntactically valid.

# When to use it and tradeoffs

Use lint rules to make correctness or team conventions visible, and keep formatting rules in a formatter rather than creating duplicate style enforcement. Type-aware linting can find deeper issues but costs analysis time and requires project alignment. Source maps are valuable in development and production error reporting, but publishing `sourcesContent` can expose original code. Pick a clear owner for formatting and understand whether generated maps are public, hidden, or uploaded privately.

# What later lessons cover

The concepts lesson separates responsibilities and traces configuration. Reference lessons enumerate current ESLint/TypeScript/Prettier/Biome surfaces and the ECMA-426 map structure. Practice repairs setup mistakes; interview questions focus on version migration, tradeoffs, and debugging symptoms.

# Sources

- [ESLint configuration](https://eslint.org/docs/latest/use/configure/)
- [typescript-eslint typed linting](https://typescript-eslint.io/getting-started/typed-linting/)
- [Prettier configuration](https://prettier.io/docs/configuration)
- [Biome quick start](https://biomejs.dev/installation/quick-start/)
- [ECMA-426 Source Map format](https://tc39.es/ecma426/2024/)
