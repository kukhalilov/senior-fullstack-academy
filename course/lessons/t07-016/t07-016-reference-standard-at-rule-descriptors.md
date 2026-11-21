# CSS selectors at-rules cascade values and box model — Reference: Standard at-rule descriptors

## Scope and version

Names are taken from the pinned [MDN at-rule data](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/at-rules.json). Descriptors belong to their named parent at-rule; the same-looking identifier elsewhere may not be valid. Consult each module's current specification and browser support before depending on newer descriptors.

## How this group fits the mental model

Descriptors configure resources and grouped rules such as fonts, counter styles, page output, color-font palettes, and view transitions. They are declarations inside a specific at-rule grammar, not normal element styling properties. A descriptor can be ignored when invalid without invalidating unrelated rules, though invalid at-rule structure may affect parsing.

## Supplied names explained

### `@counter-style` descriptors

- **`@counter-style additive-symbols`** — Defines descending symbol/weight pairs for an additive numbering system, such as Roman numerals. Weights must follow the grammar/order constraints.
- **`@counter-style fallback`** — Names the counter style to use when the current style cannot represent a value.
- **`@counter-style negative`** — Provides prefix and optional suffix symbols for negative values.
- **`@counter-style pad`** — Gives a minimum length for the counter's initial representation and a symbol to prepend when it is shorter, useful for zero-padding. The length counts grapheme clusters before negative/prefix/suffix additions; a multi-cluster pad symbol can produce unintuitive widths.
- **`@counter-style prefix`** — Adds a symbol before the generated counter representation.
- **`@counter-style range`** — Restricts the integer ranges represented by the style; a value outside all declared ranges uses the fallback counter style. Bounds must form valid ranges and are subject to implementation limits.
- **`@counter-style speak-as`** — Controls speech rendering hints for assistive technologies where supported; do not assume consistent AT behavior.
- **`@counter-style suffix`** — Adds a symbol after the generated representation, commonly punctuation/spacing.
- **`@counter-style symbols`** — Supplies symbols used by cyclic, numeric, alphabetic, symbolic, or fixed counter systems.
- **`@counter-style system`** — Selects the counter algorithm, such as cyclic, numeric, alphabetic, symbolic, additive, or fixed, with its required parameters.

### `@font-face` descriptors

- **`@font-face ascent-override`** — Overrides the font's ascent metric as a percentage, helping align fallback and web-font line metrics.
- **`@font-face descent-override`** — Overrides the descent metric; incorrect tuning can clip glyphs or shift line layout.
- **`@font-face font-display`** — Chooses this face's font-display timeline strategy (`auto`, `block`, `swap`, `fallback`, or `optional`), which controls whether fallback text is shown during the block and swap periods and how a late font is handled.
- **`@font-face font-family`** — Names the face for later selection; it is a descriptor, not a selector for an element.
- **`@font-face font-feature-settings`** — Supplies initial low-level OpenType feature-tag settings for text rendered with this face. Element-level font properties can override the face defaults; prefer higher-level typography properties for common features because they compose and cascade more usefully.
- **`@font-face font-style`** — Declares supported normal/italic/oblique styles and, where applicable, an oblique angle range for face matching.
- **`@font-face font-stretch`** — Declares the stretch value or supported range for the face so the font-matching algorithm can match requests such as condensed or expanded text. It describes the face's capabilities; it does not horizontally scale glyphs like a transform.
- **`@font-face font-variation-settings`** — Supplies initial low-level OpenType/TrueType variation-axis tag and numeric-value settings for this face. It does not describe the face's matching range or affect font selection; use descriptors such as `font-weight`, `font-stretch`, and `font-style` for matching ranges, and use their element-level properties for common registered axes.
- **`@font-face font-weight`** — Declares the weight or range served by the resource so font matching can select it accurately.
- **`@font-face line-gap-override`** — Overrides the font line-gap metric as a percentage, affecting line box metrics.
- **`@font-face size-adjust`** — Scales glyph outlines and associated metrics by a percentage to tune fallback/web-font metric compatibility.
- **`@font-face src`** — Lists local or URL sources and optional format/technology hints; source order and actual resource availability affect selection.
- **`@font-face unicode-range`** — Limits which code points a face claims, enabling subset loading; inaccurate ranges can lead to missing glyphs or surprising fallback.

### `@font-feature-values` descriptor

- **`@font-feature-values font-display`** — In the current CSS Fonts Level 4 editor draft, sets the default `font-display` policy for `@font-face` rules targeting the named font family when those rules omit their own `font-display`. A face-level descriptor takes precedence. This newer descriptor is distinct from the established `@font-face font-display` descriptor and should be treated according to browser support.

### `@font-palette-values` descriptors

- **`@font-palette-values base-palette`** — Selects a base palette index/name from a color font, subject to available palettes.
- **`@font-palette-values font-family`** — Identifies the color font family to which the named palette definition applies.
- **`@font-palette-values override-colors`** — Replaces selected palette entries with author-chosen colors; indices and colors must match the font's palette model.

### `@page` descriptors

- **`@page bleed`** — Specifies the page bleed area beyond the page box for print workflows; printer/export support varies.
- **`@page marks`** — Requests crop and/or registration marks in paged output where supported.
- **`@page page-margin-safety`** — In the current Paged Media Level 3 draft, controls how page and page-margin-box margins avoid the printer's unprintable edge area: `none`, `clamp`, or `add` (initial `auto`). It may apply only to margins along sheet edges, and support depends on the print user agent and output path.
- **`@page page-orientation`** — Uses `upright`, `rotate-left`, or `rotate-right` to rotate the laid-out page in output when supported. Prefer `size` with portrait/landscape when choosing page dimensions/orientation during layout; this descriptor is for post-layout output rotation.
- **`@page size`** — Sets page-box size and/or named paper size and orientation for paged media; browser print dialogs and output backends can override or constrain it.

### `@property` descriptors

- **`@property inherits`** — Sets whether the registered custom property inherits (`true` or `false`).
- **`@property initial-value`** — Supplies a typed initial value; where required it must be computationally independent of other values.
- **`@property syntax`** — Defines the accepted value grammar, using a supported syntax string such as `<length>` or `*`.

### `@view-transition` descriptors

- **`@view-transition navigation`** — In the Level 2 draft, accepts `auto` or `none` (initial `none`). `auto` opts in to eligible automatic cross-document transitions and must be present in both old and new documents; the draft excludes cross-origin redirects and some navigation types, including browser-UI navigation and reloads.
- **`@view-transition types`** — Sets the custom transition-type identifiers active for the document's cross-document transition. It applies only to the document where declared; authors must use matching types in both documents when their transition styling depends on them. The identifier cannot be `none` or begin with the reserved `-ua-` prefix.

## Cross-item comparison

Counter-style `system` chooses the algorithm and `symbols`/`additive-symbols` supply its data; `fallback` and `range` govern cases it cannot represent. Font metric overrides adjust layout compatibility while `font-display` governs loading behavior and `src` identifies resources. `font-stretch` contributes to face matching; `size-adjust` scales a face, while ascent/descent/line-gap overrides tune individual metrics. The draft `@font-feature-values font-display` supplies a family-level default that a face-level setting can override. `@property` descriptors define a custom property's contract; they do not assign a value to an element. `@page size` chooses page dimensions, whereas `page-orientation` concerns orientation of the page box. View-transition descriptors govern navigation participation and type metadata, not the actual snapshot animation rules.

## Examples

```css
@counter-style circled-decimal {
  system: numeric;
  symbols: "⓪" "①" "②" "③" "④" "⑤" "⑥" "⑦" "⑧" "⑨";
  suffix: " ";
  fallback: decimal;
}

@font-face {
  font-family: "Academy Sans";
  src: url("/fonts/academy.woff2") format("woff2");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF;
}

@property --card-gap {
  syntax: "<length>";
  inherits: false;
  initial-value: 1rem;
}

@page { size: A4 portrait; marks: none; }
```

Use actual font files and valid descriptors in real code. Test print output, fallback metrics, loading under slow networks, and assistive-technology behavior rather than assuming the declaration alone guarantees the result.

## Common mistakes

- Writing descriptors outside their defining at-rule.
- Declaring a variable font range inaccurately, causing font matching to select the wrong face.
- Using `font-feature-settings` for routine typographic goals already represented by higher-level CSS properties.
- Assuming `unicode-range` downloads only glyphs that are needed without checking resource partitioning and actual font setup.
- Treating `@property initial-value` like an ordinary `var()` fallback; registration and custom-property substitution have different semantics.
- Expecting print descriptors to override user print settings or physical printer capabilities.
- Assuming `speak-as` has identical behavior across browser/screen-reader combinations.

## Knowledge checks with answers

1. **Where is `font-display` valid?** As a descriptor inside `@font-face`.
2. **What do `system` and `symbols` do in a counter style?** `system` selects the formatting algorithm; `symbols` supplies symbols for algorithms that use them.
3. **Why must a registered custom property have a syntax?** The syntax defines accepted values and allows typed parsing/interpolation; `*` requests the universal token-stream grammar.
4. **Does `@page size` guarantee physical paper dimensions?** No; browser print settings and output hardware can constrain the produced result.
5. **How do the two `font-display` descriptors differ?** `@font-face font-display` sets the policy for that face; the draft `@font-feature-values font-display` supplies a default for matching family faces that omit it.

## Sources and maturity

- [Pinned MDN at-rule data](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/at-rules.json) defines this lesson's controlled descriptor list; [CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) distinguishes specification maturity from browser adoption.
- [CSS Counter Styles Level 3 Editor's Draft](https://drafts.csswg.org/css-counter-styles-3/) defines the counter descriptor grammars, validity constraints, fallback, padding, and speech representations.
- [CSS Fonts Level 4 Editor's Draft](https://drafts.csswg.org/css-fonts-4/) defines face matching, loading and metric descriptors, low-level feature/variation settings, palette descriptors, and the newer family-level `@font-feature-values font-display` descriptor.
- [CSS Paged Media Level 3 Editor's Draft](https://drafts.csswg.org/css-page-3/) defines page-context values, bleed and marks, output rotation, and evolving `page-margin-safety` behavior; print-engine support varies.
- [CSS Properties and Values API Level 1 Working Draft](https://www.w3.org/TR/css-properties-values-api-1/) defines registered-property descriptor grammar and when `initial-value` is required and valid.
- [CSS View Transitions Level 2 Editor's Draft](https://drafts.csswg.org/css-view-transitions-2/) defines the cross-document `navigation` opt-in and document-scoped transition `types`; it remains work in progress.
