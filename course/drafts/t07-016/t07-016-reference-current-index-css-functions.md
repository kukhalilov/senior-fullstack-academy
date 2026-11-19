# CSS selectors at-rules cascade values and box model — Reference: Additional functions in the current MDN CSS reference, checked 2026-11-19

## Scope and version

This reference covers only the 18 names assigned to the `current-index-css-functions` inventory in the manifest. They were collected from MDN's live CSS function index as a supplement to the curriculum's pinned MDN data snapshot. A reference entry means the syntax is documented; it does not mean the feature is standardized at a stable level or implemented in browsers. Several functions below are defined only in CSS Working Drafts or Editor's Drafts. Check the linked module and target-browser support before depending on one.

## How this group fits the mental model

A CSS function is parsed as part of a property or at-rule value. The consuming grammar matters: `repeat()` is for grid track lists, font alternates belong to `font-variant-alternates`, and `dynamic-range-limit-mix()` belongs to the `dynamic-range-limit` property. Other functions produce colors, math values, shapes, or values derived from the element tree. Some have only draft definitions. CSS does not make an unsupported function work through a fallback branch automatically; use ordinary earlier declarations when progressive enhancement is appropriate.

## Supplied names explained

### Color and dynamic-range policy

- **`contrast-color(color)`** — Resolves to either `white` or `black`, whichever the user agent's algorithm judges to give greater text contrast when the input is a solid background; a tie resolves to white. CSS Color 5 leaves the precise selection algorithm user-agent-defined. This convenience cannot guarantee WCAG contrast or legibility for transparency, compositing, font size, or surrounding colors. It is a CSS Color 5 Editor's Draft feature.
- **`device-cmyk(c, m, y, k [, alpha])`** — Represents device-dependent CMYK channels (numbers in 0–1 or percentages in 0–100%, with out-of-range channels clamped at computed-value time); modern syntax can include alpha. CMYK values have no device-independent colorimetric meaning by themselves. With a usable `@color-profile device-cmyk` ICC profile and processing support, conversion uses that profile; otherwise CSS Color 5 specifies a naive sRGB conversion. Do not confuse this with an automatic fallback-color argument: provide alternate colors separately, for example with color-gamut media queries or the module's color fallback mechanisms. Device CMYK cannot be used directly in interpolation/compositing operations that require a colorimetric value before conversion. This is a CSS Color 5 Editor's Draft feature.
- **`dynamic-range-limit-mix(value percentage, …)`** — Mixes one or more `<dynamic-range-limit>` policy values, whose current keywords are `standard`, `constrained`, and `no-limit`, with percentages. It controls HDR luminance-range policy and is accepted for the `dynamic-range-limit` property; it is not a general color mixer. Percentages are normalized, and privacy rules avoid exposing the display's actual HDR headroom as a directly observable computed result. Defined in CSS Color HDR Level 1, an Editor's Draft.

### Conditional and mathematical values

- **`if(condition: value; …)`** — Selects the value from the first true branch; an optional `else` branch handles the no-match case. The current CSS Values 5 draft defines boolean conditions including `supports()`, `media()`, and `style()` tests. It is a value-selection notation, not a general-purpose scripting language; the selected tokens still have to parse in the consuming property's grammar. Draft syntax and support can change.
- **`progress(value, start, end)`** — Computes `(value - start) / (end - start)` using consistently typed numbers, dimensions, or percentages. By default the result is clamped to [0, 1]; the `no-clamp` option permits values outside that interval. If start and end are equal, the default result is 0; with `no-clamp`, the result is 0, negative infinity, or positive infinity according to whether value equals, is below, or is above that shared value. Defined in CSS Values 5, an Editor's Draft.
- **`random([random-key,] min, max [, step])`** — Produces a CSS pseudo-random value in an inclusive range with compatible argument types; an optional positive step restricts the possible values to `min + N × step`. When `max` is below `min`, the draft treats it as equal to `min`. The optional key controls reuse: it defaults to `auto`; explicit cache keys can be dashed identifiers with `element-scoped`, `property-scoped`, or `property-index-scoped` behavior, while `fixed <number>` supplies a fixed base value. CSS evaluation is declarative, so a given cache identity resolves consistently rather than promising a new value on every repaint. The draft does not promise cryptographic strength; never use it for secrets, security tokens, or application data. Defined in CSS Values 5, an Editor's Draft.

### Grid, geometry, and corner shape

- **`shape()`** — Defines a path-like basic shape using CSS-friendly commands and values, including CSS units and math functions. The command set includes `from`, `move`, `line`, horizontal/vertical lines, curves, arcs, and close-path operations. It can be used where `<basic-shape>` is accepted, such as `clip-path` and shape-related properties; it supports interpolation with `path()` only when the path command lists correspond. This is a CSS Shapes Level 1 Editor's Draft addition; do not assume uniform support.
- **`superellipse(K)`** — Defines a quarter-superellipse corner curve using exponent `2^K`; it is a `<corner-shape-value>` for `corner-shape` and related corner-shape properties in CSS Borders and Box Decorations Level 4. Useful reference points: `superellipse(0)` is bevel, `superellipse(1)` is circular/round, `superellipse(-1)` is a concave scoop, and positive infinity approaches a straight corner. This is a Working Draft feature. It is not a general-purpose path or basic-shape function.

### Values derived from the element tree

- **`sibling-count()`** — Produces the integer count of child elements in the parent of the element on which it resolves. It includes that element when it is among those children. CSS Values 5 defines tree-scoped behavior: references that cannot resolve across a shadow-tree boundary yield zero. Pseudo-elements resolve against their associated real or ultimate originating element according to the draft's rules. It does not filter siblings with an `of <selector>` clause.
- **`sibling-index()`** — Produces the element's one-based index among its inclusive siblings, similar in numbering to `:nth-child()` but as an integer value usable in calculations. It is not a selector and does not select/filter elements. Tree-scoping and pseudo-element resolution follow CSS Values 5; an inaccessible cross-shadow reference yields zero. Both tree-counting functions remain CSS Values 5 Editor's Draft features.

### Font-provided glyph alternates

These functions are values of `font-variant-alternates`, not instructions to draw or transform arbitrary glyphs. They request OpenType alternates supplied by the selected font. Names generally need mappings established by `@font-feature-values`; a font may not provide the requested feature, so verify the actual font and fallback behavior.

- **`stylistic(name)`** — Requests a font-specific stylistic alternate (`salt`).
- **`styleset(name, …)`** — Requests one or more stylistic sets (`ss01`–`ss20` in OpenType).
- **`character-variant(name, …)`** — Requests character variants (`cv01`–`cv99` in OpenType); exact glyph behavior depends on the font's feature data.
- **`swash(name)`** — Requests a swash alternate (`swsh`), often a decorative flourish where available.
- **`ornaments(name)`** — Requests an ornament alternate (`ornm`) where supplied by the font.
- **`annotation(name)`** — Requests an annotation alternate (`nalt`) where supplied by the font.

### Custom-function type syntax

- **`type(syntax)`** — Wraps a CSS Properties and Values API syntax definition when CSS custom-function parameter or return types need a compound syntax. In the CSS Custom Functions and Mixins Level 1 draft, a single syntax component such as `<length>` can be written without `type()`, while a syntax combinator such as `<number> | <percentage>` must be wrapped, for example `type(<number> | <percentage>)`. This is signature grammar for `@function`, not a standalone value that can be assigned to ordinary properties. The feature remains an Editor's Draft.

## Cross-item comparison

`contrast-color()` chooses black or white relative to a background; the established filter function `contrast()` alters rendered image contrast. `device-cmyk()` describes device-dependent color channels, whereas `dynamic-range-limit-mix()` mixes HDR output policies. `progress()` normalizes a position and `random()` generates presentation values with CSS-defined reuse behavior. `shape()` describes path geometry; `superellipse()` describes a corner curve. The font functions request existing font glyph variants. `sibling-index()` and `sibling-count()` derive integers from tree position/count, while `:nth-child()` is a selector. `if()` chooses CSS tokens conditionally; `type()` describes a custom-function signature.

## Examples

```css
/* Keep the ordinary declaration first for browsers without the newer function. */
.badge { color: white; }
.badge { color: contrast-color(var(--badge-background)); }

/* repeat() belongs to grid track sizing; it is documented in the standard-functions lesson. */
.grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }

/* A font alternate works only when the font has the requested feature mapping. */
.title { font-variant-alternates: stylistic(ornate-title); }

/* Tree-counting outputs can feed ordinary math where the draft function is supported. */
.item { --position: sibling-index(); }
```

The `repeat()` declaration is shown only as a context comparison; `repeat()` is intentionally not part of this lesson's assigned inventory. For experimental or draft-only functions, check current support and retain an established fallback if the behavior is important. A prior declaration is useful only when the later declaration is rejected as unsupported; it cannot rescue a supported declaration whose computed result is unusable.

The font alternate names in this inventory are `stylistic()`, `styleset()`, `character-variant()`, `swash()`, `ornaments()`, and `annotation()`.

Primary specifications: [CSS Values 5](https://drafts.csswg.org/css-values-5/), [CSS Color 5](https://drafts.csswg.org/css-color-5/), [CSS Color HDR 1](https://drafts.csswg.org/css-color-hdr-1/), [CSS Shapes 1](https://drafts.csswg.org/css-shapes-1/), [CSS Borders 4](https://drafts.csswg.org/css-borders-4/), [CSS Fonts 4](https://drafts.csswg.org/css-fonts-4/), and [CSS Custom Functions and Mixins 1](https://drafts.csswg.org/css-mixins-1/). The [MDN CSS function index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/Functions) is an index, not the normative definition or a support guarantee.

## Common mistakes

- Treating appearance in the MDN reference as proof of stable standardization or broad browser support.
- Assuming `contrast-color()` guarantees an accessibility threshold or accounts for transparency and compositing.
- Treating `device-cmyk()` as having universal RGB-equivalent color or an implicit fallback argument.
- Using `dynamic-range-limit-mix()` as a color-mixing function or assuming it reveals the display's HDR headroom.
- Assuming `progress()` always clamps, or overlooking the equal-start/end special case.
- Expecting `random()` to change on each paint, to be cryptographically secure, or to share values without considering its key.
- Using `shape()` as ordinary string path syntax; its CSS command grammar differs from SVG `path()` even though compatible command lists can interpolate.
- Treating `superellipse()` as a general shape function rather than a corner-shape value.
- Confusing tree-count functions with selector matching, flat-tree order, or accessibility order.
- Assuming font alternate names work across fonts without `@font-feature-values` mappings and matching font support.
- Using `type()` in an ordinary property value rather than a custom-function signature.

## Knowledge checks with answers

1. **Does `contrast-color()` guarantee WCAG-compliant text contrast?** No. The CSS Color 5 draft leaves the exact black/white selection algorithm user-agent-defined, and contrast alone does not guarantee legibility.
2. **How does `progress()` differ with and without `no-clamp`?** Without it, the fraction is clamped to [0, 1]; with it, the result can extend beyond that range, including the defined equal-endpoint infinities.
3. **Why can two `random()` calls return the same value?** The random-key/cache identity can make CSS random functions share a base value; the default `auto` is scoped to produce distinct identities across instances, properties, and elements.
4. **What does `sibling-index()` return, and is it a selector?** It returns a one-based integer position among inclusive siblings where the tree-scoped reference resolves; it is a value function, not a selector.
5. **When is `type()` needed in the custom-function syntax described here?** For compound syntax definitions that use syntax combinators, such as `<number> | <percentage>`; one syntax component can be written directly.
