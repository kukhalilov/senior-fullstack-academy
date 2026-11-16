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
- **`@counter-style pad`** — Specifies a minimum rendered digit length and a padding symbol, useful for zero-padding numeric output.
- **`@counter-style prefix`** — Adds a symbol before the generated counter representation.
- **`@counter-style range`** — Restricts the integer range represented by the style; outside it, fallback behavior applies.
- **`@counter-style speak-as`** — Controls speech rendering hints for assistive technologies where supported; do not assume consistent AT behavior.
- **`@counter-style suffix`** — Adds a symbol after the generated representation, commonly punctuation/spacing.
- **`@counter-style symbols`** — Supplies symbols used by cyclic, numeric, alphabetic, symbolic, or fixed counter systems.
- **`@counter-style system`** — Selects the counter algorithm, such as cyclic, numeric, alphabetic, symbolic, additive, or fixed, with its required parameters.

### `@font-face` descriptors

- **`@font-face ascent-override`** — Overrides the font's ascent metric as a percentage, helping align fallback and web-font line metrics.
- **`@font-face descent-override`** — Overrides the descent metric; incorrect tuning can clip glyphs or shift line layout.
- **`@font-face font-display`** — Chooses the font-display timeline strategy (`auto`, `block`, `swap`, `fallback`, or `optional`) that controls block/swap behavior during loading.
- **`@font-face font-family`** — Names the face for later selection; it is a descriptor, not a selector for an element.
- **`@font-face font-feature-settings`** — Low-level OpenType feature tags for the face; prefer higher-level typography properties when they express the intent.
- **`@font-face font-style`** — Declares supported normal/italic/oblique styles and, where applicable, an oblique angle range for face matching.
- **`@font-face font-variation-settings`** — Declares low-level variation axis settings/ranges; use registered high-level properties such as weight/width where suitable.
- **`@font-face font-weight`** — Declares the weight or range served by the resource so font matching can select it accurately.
- **`@font-face line-gap-override`** — Overrides the font line-gap metric as a percentage, affecting line box metrics.
- **`@font-face size-adjust`** — Scales glyph outlines and associated metrics by a percentage to tune fallback/web-font metric compatibility.
- **`@font-face src`** — Lists local or URL sources and optional format/technology hints; source order and actual resource availability affect selection.
- **`@font-face unicode-range`** — Limits which code points a face claims, enabling subset loading; inaccurate ranges can lead to missing glyphs or surprising fallback.

### `@font-palette-values` descriptors

- **`@font-palette-values base-palette`** — Selects a base palette index/name from a color font, subject to available palettes.
- **`@font-palette-values font-family`** — Identifies the color font family to which the named palette definition applies.
- **`@font-palette-values override-colors`** — Replaces selected palette entries with author-chosen colors; indices and colors must match the font's palette model.

### `@page` descriptors

- **`@page bleed`** — Specifies the page bleed area beyond the page box for print workflows; printer/export support varies.
- **`@page marks`** — Requests crop and/or registration marks in paged output where supported.
- **`@page page-margin-safety`** — Defines a safety distance for page-margin content relative to page edges in the applicable paged-media model; implementation support is limited.
- **`@page page-orientation`** — Requests orientation of the page box relative to the sheet (for example, rotating a page); distinguish it from choosing a page size with swapped dimensions.
- **`@page size`** — Sets page-box size and/or named paper size and orientation for paged media; browser print dialogs and output backends can override or constrain it.

### `@property` descriptors

- **`@property inherits`** — Sets whether the registered custom property inherits (`true` or `false`).
- **`@property initial-value`** — Supplies a typed initial value; where required it must be computationally independent of other values.
- **`@property syntax`** — Defines the accepted value grammar, using a supported syntax string such as `<length>` or `*`.

### `@view-transition` descriptors

- **`@view-transition navigation`** — Configures whether a document participates in eligible same-origin cross-document navigations (`auto` or `none` in the applicable model); it complements rather than replaces the View Transition API.
- **`@view-transition types`** — Associates transition types with a navigation transition, allowing typed transition matching and styles where supported.

## Cross-item comparison

Counter-style `system` chooses the algorithm and `symbols`/`additive-symbols` supply its data; `fallback` and `range` govern cases it cannot represent. Font metric overrides adjust layout compatibility while `font-display` governs loading behavior and `src` identifies resources. `size-adjust` scales a face, while ascent/descent/line-gap overrides tune individual metrics. `@property` descriptors define a custom property's contract; they do not assign a value to an element. `@page size` chooses page dimensions, whereas `page-orientation` concerns orientation of the page box. View-transition descriptors govern navigation participation and type metadata, not the actual snapshot animation rules.

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
