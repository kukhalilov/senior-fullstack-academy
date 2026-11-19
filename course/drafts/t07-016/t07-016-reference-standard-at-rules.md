# CSS selectors at-rules cascade values and box model — Reference: Standard CSS at-rules

## Scope and version

The inventory is pinned in [MDN's at-rule data](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/at-rules.json) and profiled by the [CSS Snapshot](https://www.w3.org/TR/css-2026/). At-rule availability and grammar can vary by browser and by CSS module maturity; check the relevant specification and compatibility data for the actual use case.

## How this group fits the mental model

At-rules begin with `@` and control stylesheet parsing, define descriptor-based resources, group rules under conditions, or establish named structures such as layers and keyframes. They are not declarations and do not all have the same block grammar. Their placement can affect parsing and cascade behavior.

## Supplied names explained

### Encoding declarations, imports, and namespaces

- **`@charset`** — Despite its spelling and MDN index classification, the current CSS Syntax specification says there is no actual `@charset` at-rule. It is a narrowly recognized byte sequence at the very beginning of a stylesheet (an optional BOM may precede it) used in fallback-encoding detection. A normal CSS parser drops occurrences as unrecognized rules. Encoding is determined using the stylesheet byte-order mark, protocol metadata, this declaration, then fallback rules; use UTF-8 and correct HTTP metadata in modern web delivery rather than relying on it.
- **`@import`** — Imports a stylesheet. All valid imports must come before every other valid at-rule and style rule, ignoring the special encoding declaration. An initial `@layer` statement may precede imports to establish layer order; an `@layer` block, style rule, or unrelated at-rule may not. Each import may include a layer qualifier, a supports condition, and/or media queries. Invalidly ordered imports are ignored. Imported stylesheets have fetch, dependency, and rendering consequences; bundle or link stylesheets when that better fits the delivery strategy.
- **`@namespace`** — Declares a default namespace or binds a prefix used in namespace-qualified selectors. Its grammar is `@namespace [prefix] <string-or-url>;`. It must follow all `@charset` declarations and `@import` rules and precede every other non-ignored at-rule and style rule. The namespace declaration supplies selector namespace bindings; it does not alter the document's markup.

### Conditional and scoping groups

- **`@media`** — Applies enclosed rules when a media query for the output medium or environment matches. Features include viewport characteristics, input capabilities, display conditions, and user preferences such as reduced motion; a media query does not directly inspect an individual component's size.
- **`@supports`** — Conditionally applies rules when a support condition evaluates true. Common checks test a declaration such as `(display: grid)`; selector tests use `selector(...)` where supported. This is feature detection, not a guarantee that an implementation is bug-free, interoperable, or appropriate. Newer draft checks for fonts, at-rules, named features, and environment variables must be labeled by their actual support and maturity.
- **`@container`** — Applies rules to descendants according to a selected eligible ancestor query container. Depending on the query type and implementation, conditions can inspect size, style, or scroll state; newer drafts also explore anchored-container features. A size query needs a container that establishes the queried containment axis, commonly with `container-type: inline-size` or `size`; style and scroll-state queries have their own eligibility and support rules. A container query does not style the container itself based on its own query.
- **`@scope`** — Limits where its enclosed selectors can match using a scope-start selector and optional scope-end limit. The scope prelude does not add its selectors to the enclosed selector's specificity. When declarations otherwise tie at the relevant cascade stage, scope proximity prefers the nearer scoping root; it is a distinct cascade step, not a specificity increase.
- **`@layer`** — Establishes cascade layers and their order. Among declarations with otherwise comparable origin/context/importance, later layers win for normal declarations and earlier layers win for important declarations. Normal unlayered declarations act as an implicit final layer and therefore outrank layered normal declarations; important declarations reverse that relation. Layer ordering is evaluated within the cascade, not as a simple global rule that overrides origin or importance.

### Font, counters, and page output

- **`@font-face`** — Adds a font face to the document's font matching set using descriptors including `font-family` and `src` (both required for a usable face), plus matching ranges and optional metric overrides. Descriptors are local to that face rule; they do not style document elements. A browser may fetch only faces needed for rendered text, and may disable downloadable fonts.
- **`@font-feature-values`** — Maps author-chosen names to OpenType feature values for a specified family, within recognized nested feature blocks such as `@styleset` or `@swash`. It works with the corresponding `font-variant-alternates` functions; it does not create a font feature that the actual font lacks.
- **`@font-palette-values`** — Defines a named palette for a color font, scoped to a font family and using descriptors such as `base-palette` and `override-colors`. It only has a visible effect when the chosen font supports color palettes and the palette is selected with `font-palette`.
- **`@counter-style`** — Defines a document-scoped named counter representation from an algorithm/system and descriptors such as symbols, additive symbols, negative sign, prefix/suffix, range, fallback, and spoken form. Out-of-range or unrepresentable values use the fallback behavior; prefix and suffix are applied when constructing marker content, not by the `counter()` string-generation algorithm itself.
- **`@page`** — Styles generated page boxes in paged media. The page context has its own allowed properties and page selectors (including `:first`, `:left`, `:right`, and `:blank`); page-margin at-rules define margin boxes such as headers and footers. `size`, orientation, bleed, and marks have support differences among print engines.

### Animation, registration, and startup styles

- **`@keyframes`** — Associates keyframe selectors (percentages or `from`/`to`) with property values under a keyframe name. It defines animation data but does not start an animation; an element still needs `animation-name` or the `animation` shorthand. Keyframes have special cascade behavior: duplicate offsets combine, later duplicate declarations win within an offset, and properties absent from some offsets are interpolated according to animation rules.
- **`@property`** — Registers a custom property with `syntax`, `inherits`, and (for non-universal syntax) a computationally independent `initial-value`. Registration enables typed parsing and can enable interpolation/animation; it does not make all custom properties automatically animatable, nor does it replace the ordinary unregistered custom-property cascade. Invalid descriptors or missing required initial values can invalidate registration.
- **`@starting-style`** — Supplies a starting style for a CSS transition when an element has no prior rendered style, including first rendering or becoming displayed from `display: none`. It is transition starting state, not an animation rule or a substitute for the ordinary destination/default styles and transition declaration. It does not replace reduced-motion handling.
- **`@view-transition`** — In the current Level 2 draft, configures cross-document navigation transitions for a document (for example `navigation: auto`) and optional transition types. It does not by itself create a same-document transition; same-document transitions use the View Transition API. The rule and some of its descriptors are draft-dependent, so use feature detection/fallbacks and keep navigation functional without animation.

## Cross-item comparison

`@media`, `@supports`, and `@container` conditionally apply rules against different inputs: output environment, implementation capability, and a selected ancestor container. `@scope` constrains selector matching and supplies a proximity tie-break. `@layer` defines cascade precedence rather than testing a condition. `@font-face`, `@counter-style`, and `@font-palette-values` define named resources or formatting systems through local descriptors. `@keyframes` defines animation data; `@starting-style` provides the otherwise-missing initial state for a transition. `@import` fetches a stylesheet under strict ordering rules, whereas most grouping rules organize style rules in the current sheet. `@charset` is a legacy encoding byte sequence, not a regular parsed at-rule.

## Examples

```css
@layer reset, components, utilities;

/* @import may follow an @layer statement, but still precedes other rules. */
@import url("tokens.css") layer(tokens);

@media (prefers-reduced-motion: no-preference) {
  @supports (transition-behavior: allow-discrete) {
    .dialog { transition: opacity 180ms, display 180ms allow-discrete; }
    @starting-style { .dialog[open] { opacity: 0; } }
  }
}

@container card (inline-size > 36rem) {
  .card__body { display: grid; grid-template-columns: 1fr 1fr; }
}

@supports selector(:has(*)) {
  .card:has(> img) { --has-image: 1; }
}
```

In production, keep imports before all valid at-rules and style rules (except an initial `@layer` statement and encoding declaration), and ensure the correct ancestor container exists. Feature queries should pair with a functional fallback rather than being treated as a compatibility guarantee. This sample `@supports selector()` syntax itself requires support; omit or guard it if targeting older engines.

## Common mistakes

- Putting `@import` after ordinary rules and expecting it to load.
- Calling `@charset` an ordinary at-rule or assuming it can appear later in a stylesheet; it is a special leading byte sequence and modern web stylesheets should use UTF-8.
- Placing `@namespace` after a style rule or before imports; it follows imports and precedes other non-ignored rules.
- Confusing feature detection in `@supports` with complete compatibility or correct runtime behavior.
- Writing `@container` rules without an eligible query container.
- Assuming normal and important layer ordering are the same.
- Treating descriptors inside resource at-rules as ordinary declarations that work anywhere.
- Assuming every container query type has the same maturity or that a container query styles its own container.
- Assuming `@font-feature-values` can enable a feature missing from the font, or that `@font-palette-values` affects non-color fonts.
- Assuming a `@property` registration is valid without a compatible `syntax`, `inherits`, and required initial value.
- Assuming `@scope` raises specificity; proximity is a distinct later tie-breaker.
- Defining animation keyframes but forgetting the element still needs an animation declaration and reduced-motion behavior.
- Using `@starting-style` without a valid transition or without considering the non-transition initial state.

## Knowledge checks with answers

1. **Which at-rule tests whether a property/selector feature is recognized?** `@supports`; it does not prove full compatibility.
2. **What must exist for a size query in `@container`?** An eligible ancestor query container, typically established with a `container-type` or shorthand declaration.
3. **Does a later normal layer always beat an earlier important layer?** No; importance is resolved before layer ordering, and important declarations reverse layer order within their origin.
4. **What do descriptors configure?** A particular resource/rule such as a font face or counter style, rather than arbitrary elements.

## Sources and maturity

- [MDN CSS at-rules index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules) and [CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) provide the inventory and broad maturity context; the Snapshot is a W3C Group Note and classifies specifications by stability, not browser adoption.
- [CSS Syntax Level 3 Editor's Draft](https://drafts.csswg.org/css-syntax-3/#charset-rule), §8.3: `@charset` is an encoding-detection byte sequence, not a parsed at-rule.
- [CSS Cascading Level 3 Editor's Draft](https://drafts.csswg.org/css-cascade-3/#at-import), §2: import ordering and conditional imports; [CSS Cascading Level 6](https://www.w3.org/TR/css-cascade-6/), §§2.4–2.5: layer order and scope proximity.
- [CSS Namespaces Level 3 Editor's Draft](https://drafts.csswg.org/css-namespaces-3/#declaration), §2: namespace syntax and ordering.
- [CSS Conditional Rules Level 3](https://drafts.csswg.org/css-conditional-3/) and [Level 5 Editor's Draft](https://drafts.csswg.org/css-conditional-5/): `@supports`, container eligibility and query types; Level 5 additions remain draft work.
- [CSS Fonts Level 4 Editor's Draft](https://drafts.csswg.org/css-fonts-4/), sections on `@font-face`, `@font-feature-values`, and palettes: descriptors, font matching, feature mappings and palette selection.
- [CSS Counter Styles Level 3 Editor's Draft](https://drafts.csswg.org/css-counter-styles-3/): counter systems and fallback behavior.
- [CSS Paged Media Level 3 Editor's Draft](https://drafts.csswg.org/css-page-3/): `@page`, page selectors and margin boxes; print implementation support varies.
- [CSS Animations Level 1 Editor's Draft](https://drafts.csswg.org/css-animations-1/) and [MDN `@starting-style`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40starting-style): keyframes and transition starting styles.
- [CSS Properties and Values API Level 1](https://www.w3.org/TR/css-properties-values-api-1/) and MDN's [CSS at-rules index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules): custom property registration grammar and descriptors.
- [CSS View Transitions Level 2 Editor's Draft](https://drafts.csswg.org/css-view-transitions-2/): `@view-transition` navigation and type descriptors; Editor's Draft behavior is not a universal implementation guarantee.
