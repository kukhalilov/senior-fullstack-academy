<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# JavaScript linting, formatting, and source maps — Reference: Formatting and source-map artifacts

# Scope and version

This reference explains the seventeen supplied formatter/parser/plugin/ignore/source-map terms using current Prettier, Biome, and ECMA-426 documentation. It includes the complete common source-map field set and distinguishes standard fields from bundler delivery conventions. See [Prettier configuration](https://prettier.io/docs/configuration), [Biome configuration](https://biomejs.dev/reference/configuration/), [Biome v2 migration](https://biomejs.dev/installation/upgrade-to-biome-v2/), and [ECMA-426](https://tc39.es/ecma426/2024/).

# How this group fits the mental model

Formatters parse source and print it under chosen style rules. Plugins broaden parsers/languages or add tool-specific capabilities. A source map is a JSON relation between generated and original locations. The map's generated file and link must match the artifact the debugger or error service actually loads.

# Supplied names explained

- `Prettier parser` — Parser selected or inferred for a file, such as Babel/TypeScript/HTML/CSS parsers built into Prettier. Parser choice determines syntax support and printer behavior; an unknown extension may need an explicit parser or plugin.
- `Prettier plugins` — Installed plugins that add language parsers/printers or extend Prettier capabilities. They are configured in project settings or API use and should be pinned with the tool so formatting is reproducible.
- `Prettier ignore file` — `.prettierignore`, containing patterns for files that the CLI/editor integrations should not format. Prettier also reads `.gitignore` by default in CLI contexts; specify ignore paths deliberately in monorepos or custom workflows.
- `Biome formatter` — Biome's formatting engine, configurable by file selection, indentation, line width, quote style and language-specific settings. It is independent from linter correctness diagnostics.
- `Biome linter` — Biome's rule engine configured through `linter` and rule groups/presets. Rules and support differ from ESLint; do not assume one tool's plugin/rule names port directly.
- `Biome organize imports` — Biome assist that organizes import/export declarations. In v2 it is configured at `assist.actions.source.organizeImports` with values such as `"on"`; v1 used a separate `organizeImports` configuration shape. Review order changes because they can affect side-effectful module evaluation.
- `Source Map v3` — The established JSON mapping format standardized by ECMA-426. The field `version` remains integer `3`; the standard's edition and the map's version are separate concepts.
- `Source map version field` — Required format marker with numeric value `3` in this standard. It is not a semver value such as `"3.2.1"` and is not the version of a bundler.
- `Source map file (.map)` — Common convention for storing a separate JSON source map beside generated JS/CSS/Wasm. The extension itself is not what gives a file map semantics; valid structure and a retrieval/linking mechanism do.
- `file field` — Optional name of the generated file associated with the map. It does not fetch or validate that file and can be omitted.
- `sourceMappingURL directive` — A generated-code annotation such as `//# sourceMappingURL=app.js.map` that links to the map. ECMA-426 generators emit `//#`; consumers accept legacy `//@` where specified. Relative URLs resolve against the generated source's origin, and inline data URLs are possible.
- `HTTP sourcemap header` — The HTTP response header named `sourcemap` can identify a map URL. Under ECMA-426 it takes precedence over an annotation when both exist. Older `x-sourcemap` naming is deprecated.
- `sourceRoot field` — Optional source URL prefix combined with entries in `sources`. Relative source URLs are then resolved according to the source-map location/URL rules.
- `sources field` — List of original source names/URLs referenced by mapping segments. Entries may be relative or null when unknown. The order determines numeric source indices in `mappings`.
- `sourcesContent field` — Optional list, aligned with `sources`, containing original source text or null. Embedding can make debugging self-contained but may disclose code if the map is publicly accessible.
- `names field` — Optional list of original symbol/name strings that mapping segments can reference by index. It assists developer tools; not every mapping needs a name.
- `mappings field` — Compact string encoding generated-to-original positions. Semicolons separate generated lines, commas separate segments, and Base64 VLQ encodes relative zero-based offsets/indices. Segments can describe unmapped generated code or mapped positions with/without names.
- `ignoreList field` — Optional list of indices into `sources` marking files that developer tools may treat as third-party code and de-emphasize during stepping. It affects debugging presentation, not execution or source security.
- `Deprecated x_google_ignoreList field` — Legacy extension used by some browser tooling before ECMA-426 standardized `ignoreList`. New maps should use `ignoreList`; consumers may still recognize the old field when the standard field is absent.
- `sections field` — Array of offset/map sections used by indexed maps. Offsets are ordered, non-overlapping generated positions; each embedded map is complete and does not inherit values from the outer map.
- `Indexed source map` — A map using `sections` to combine multiple submaps at generated-line/column offsets, useful for concatenated output. Sections must be sorted and not overlap.
- `Inline source map` — Delivery convention where the map is embedded, usually in a `data:` URL in `sourceMappingURL`. It increases generated file size and can expose `sourcesContent` directly.
- `External source map` — Separate map resource referenced through an annotation or HTTP header. Access controls, cache/version alignment, and deployment determine whether developer tools can retrieve it.
- `Hidden source map` — Bundler convention in which a map is emitted without the generated file's public sourceMappingURL comment. Teams often upload it privately to an error service; “hidden” is not a map-format privacy control.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| Inline vs external map | Embedded data URL versus a separately fetched JSON resource. |
| External vs hidden map | External is a separate resource; hidden generally omits the public output annotation, while the map file may still exist or be uploaded. |
| `sources` vs `sourcesContent` | Original source identifiers versus optional embedded source text aligned to those identifiers. |
| `names` vs `mappings` | Names are a lookup table; mapping segments encode positions and can refer to name indices. |
| `sections` vs ordinary map fields | Indexed map composes embedded maps by generated offsets; a basic map stores one top-level mappings string. |
| Prettier parser vs plugin | Parser selects syntax grammar; plugin can supply parser/printer or related capabilities. |

# Examples

Simplified external source map link:

```js
//# sourceMappingURL=app.js.map
```

Simplified map shape (the mapping string is illustrative, not a hand-authored useful mapping):

```json
{
  "version": 3,
  "file": "app.js",
  "sourceRoot": "../src",
  "sources": ["main.ts"],
  "sourcesContent": ["const answer = 42;"],
  "names": ["answer"],
  "mappings": "AAAAA",
  "ignoreList": []
}
```

The map's numeric indices refer to the `sources` and `names` arrays. Mapping segments use zero-based lines and columns; JavaScript/CSS columns count UTF-16 code units. A real generator should produce and validate the encoded mappings rather than hand-writing them.

An indexed map holds `sections`, each with an `offset` and embedded `map`. It is not valid to overlap or reorder the generated ranges.

# Common mistakes

- Treating `.map` file extension as a guarantee that a debugger can discover the map.
- Publishing `sourcesContent` without checking whether original source disclosure is acceptable.
- Uploading a map from one build while serving JavaScript from another.
- Treating `ignoreList` as a security or execution exclusion.
- Misreading `mappings` as absolute coordinates; VLQ segment values are mostly deltas.
- Forgetting UTF-16 code-unit columns when computing JS/CSS offsets.
- Assuming every generated token has a one-to-one authored token.
- Calling a map hidden while leaving its location publicly discoverable.
- Confusing Source Map `version: 3` with ECMA-426 edition or a tool's release number.
- Assuming Biome v1 import sorting/config remains current after v2 migration.

# Knowledge checks with answers

1. **What exact value appears in a conforming source-map `version` field?** Integer 3.
2. **What is the purpose of `sourcesContent`?** Optional embedded original source content.
3. **What does `ignoreList` affect?** Developer-tool treatment of selected source files, not program execution.
4. **How is an indexed map represented?** Ordered, non-overlapping `sections` with offsets and embedded maps.
5. **Which wins if the HTTP header and annotation both identify a map?** The `sourcemap` header.
6. **Does hidden map output guarantee secrecy?** No; deployment and upload/access controls determine exposure.

# Sources

- [Prettier configuration](https://prettier.io/docs/configuration)
- [Prettier ignore files](https://prettier.io/docs/ignore/)
- [Prettier CLI](https://prettier.io/docs/cli)
- [Biome configuration](https://biomejs.dev/reference/configuration/)
- [Biome quick start](https://biomejs.dev/installation/quick-start/)
- [Biome v2 migration](https://biomejs.dev/installation/upgrade-to-biome-v2/)
- [ECMA-426 Source Map format](https://tc39.es/ecma426/2024/)
