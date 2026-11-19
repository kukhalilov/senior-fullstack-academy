# CSS selectors at-rules cascade values and box model — Reference: Standard CSS data types

## Scope and version

The type names follow the pinned [MDN data types inventory](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/types.json) and its [length reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length). “Standard” here identifies the curriculum's pinned inventory group; it does not imply that every type is mature, implemented, or accepted by every browser. A type is a grammar category, not a property; a property accepts a defined combination of types and keywords. Some entries are module-specific or draft-defined and have limited direct author use.

## How this group fits the mental model

CSS parses a declaration against the grammar for that property. Data types constrain valid tokens, operations, and value resolution. Types compose: a property may accept a length-percentage, a list of transform functions, or a keyword alternative. A value can be syntactically valid as one type but invalid for the consuming property.

## Supplied names explained

- **`angle`** — Angular measure such as degrees, radians, gradians, or turns; unitless zero is commonly accepted.
- **`angle-percentage`** — A value that can be an angle or percentage where a grammar defines both alternatives.
- **`basic-shape`** — The basic-shape grammar used by properties such as `clip-path`, `shape-outside`, and `offset-path`. It includes forms such as `inset()`, `circle()`, `ellipse()`, `polygon()`, `rect()`, `xywh()`, and, in current Shapes drafts, `path()` and `shape()`; check the status/support of newer forms separately.
- **`blend-mode`** — A keyword selecting how source and backdrop colors combine, used by blending properties.
- **`color`** — A CSS color value, including named, hexadecimal, functional, system, and relative color forms.
- **`custom-ident`** — An identifier supplied by the author, excluding CSS-wide keywords and `default`; a consuming grammar can reserve additional names (and some grammars explicitly allow values such as `none`).
- **`dashed-ident`** — An identifier beginning with `--`, commonly used for custom names such as custom properties and named timelines.
- **`dimension`** — A number with a dimension unit; dimensional arithmetic controls which units can combine.
- **`display-box`** — The `contents` and `none` alternatives in `display`'s box-generation component. `contents` suppresses the element's principal box; `none` omits its subtree from the box tree. These visual effects do not generally change document-language semantics.
- **`display-inside`** — The inner layout model part of `display`: `flow`, `flow-root`, `table`, `flex`, `grid`, or `ruby` in the current Display 3 grammar.
- **`display-internal`** — Specialized internal table and ruby display roles (such as table rows/cells and ruby bases/annotations), not ordinary outer display roles.
- **`display-legacy`** — Legacy combined display keywords such as `inline-block`, `inline-table`, `inline-flex`, and `inline-grid`, retained for compatibility and mapped to modern outer/inner combinations.
- **`display-listitem`** — The `list-item` behavior in `display`; it can combine with outer/inner display roles and generates a marker in addition to the principal box.
- **`display-outside`** — The outer participation role, `block`, `inline`, or the specified `run-in` value. `run-in` has limited/non-interoperable implementation; do not infer support from its presence in the grammar.
- **`easing-function`** — Timing functions used by animation/transition grammars: the `linear` keyword, `cubic-bezier()`, `steps()`, and the piecewise `linear()` function. Property grammars also constrain where these values apply.
- **`filter-function`** — Filter operations such as `blur()`, `brightness()`, `contrast()`, `drop-shadow()`, `grayscale()`, `hue-rotate()`, `invert()`, `opacity()`, `saturate()`, and `sepia()`. A filter list can also accept `url()` references, which are a separate alternative, not a filter function.
- **`flex`** — A flexible length written with the `fr` unit, used for CSS Grid track sizing. It represents a share of leftover grid space, is not a `<length>`, and is not the numeric `flex-grow`/`flex-shrink` factor used by Flexbox.
- **`frequency`** — Frequency values such as `Hz` and `kHz`; the type remains defined even though few current CSS properties expose it.
- **`frequency-percentage`** — A frequency or percentage where a specific property grammar allows either.
- **`gradient`** — A generated image produced by gradient functions.
- **`ident`** — The CSS identifier-token grammar. It can represent keywords or names; the consuming grammar decides whether reserved words and author-defined names are accepted.
- **`image`** — An image value such as `url()`, `image-set()`, a gradient, or `cross-fade()` where the module supports it; the precise alternatives and support depend on the consuming property/specification.
- **`integer`** — A whole numeric value, including signed forms where accepted.
- **`length`** — A distance such as `px`, `rem`, viewport/container units, or absolute physical units; relative units resolve against defined contexts.
- **`length-percentage`** — A length or percentage, or compatible calculation combining them, where the property grammar allows unresolved percentage dependence.
- **`line-style`** — Border/outline line style values such as solid, dotted, dashed, double, groove, ridge, inset, outset, or none/hidden as defined by the property.
- **`number`** — A real numeric value, generally unitless; whether negative, fractional, or range-limited is property-specific.
- **`overflow`** — The `visible`, `hidden`, `clip`, `scroll`, and `auto` choices for handling overflow in the relevant overflow properties. `hidden` and `clip` differ: hidden content remains programmatically scrollable, while clip does not create a scroll container.
- **`percentage`** — A proportion relative to a property-specific reference; its basis is not universally the viewport or parent width.
- **`position`** — A one- or two-axis position grammar, including edge keywords, lengths, percentages, and supported combinations, used by properties such as `background-position` and gradients. Percentage bases and two-to-four-value edge-offset interpretation are defined by the consuming grammar.
- **`ratio`** — A numeric proportion such as `16 / 9`, used by aspect-ratio and related grammars.
- **`resolution`** — Pixel density such as dpi, dpcm, or dppx, mainly used for resolution media queries and image selection.
- **`string`** — A quoted CSS string token; it is distinct from identifiers and is commonly used by generated content/font names.
- **`text-edge`** — A typographic edge grammar used by newer inline-layout features such as `text-box-trim`/`text-box-edge` to select text metrics (for example, text versus cap/ideographic/hanging edges). It is draft/limited-support territory; check the current Inline Layout definition and target browsers.
- **`time`** — Duration such as seconds or milliseconds; negative values and ranges depend on the consuming property.
- **`time-percentage`** — A time or percentage in grammars that allow timeline-relative proportions.
- **`transform-function`** — A transform operation such as rotate, scale, translate, matrix, or perspective.
- **`url`** — A URL value referencing a resource; loading and security behavior depend on context, origin, and policy.

## Cross-item comparison

`length`, `percentage`, and `length-percentage` differ in whether the value is an absolute/relative distance, proportional quantity, or property grammar accepting either/compatible mixtures. `number`, `integer`, and `dimension` differ by units and whole-number constraints. `ident`, `custom-ident`, `dashed-ident`, and `string` differ in token syntax and reserved-name behavior. `image` is a broad type that includes `gradient`; a `gradient` is generated and is not a URL. `display-outside`, `display-inside`, `display-box`, and `display-listitem` describe components of the display model; actual allowed combinations depend on the property grammar and legacy mappings.

## Examples

```css
.poster {
  aspect-ratio: 16 / 9;           /* ratio */
  inline-size: clamp(20rem, 70%, 60rem); /* length-percentage calculations */
  background-image: linear-gradient(90deg, navy, skyblue); /* image/gradient */
  transition-timing-function: cubic-bezier(.2, .8, .2, 1); /* easing-function */
}

.icon { transform: translate(0.5rem, 0) rotate(12deg); }
```

The comments identify broad type categories; each property still defines its exact accepted grammar and allowed ranges.

## Common mistakes

- Assuming a type's general definition overrides a specific property's grammar.
- Treating percentages as universally relative to the containing block's width.
- Confusing `ident` and quoted `string` values.
- Assuming every `custom-ident` can use CSS-wide keywords or a property-reserved name.
- Treating `fr` as a length or `flex` as a general-purpose dimension.
- Assuming valid syntax guarantees a supported feature or a meaningful computed value.

## Knowledge checks with answers

1. **Does `<length-percentage>` mean every percentage resolves against the same dimension?** No; the consuming property defines its percentage basis.
2. **Is a gradient a URL?** No; it is a generated image value, though both can be accepted by image-valued properties.
3. **Why can `1fr` be invalid for `width`?** The flex fraction belongs to grid track sizing grammar, not general width grammar.
4. **What distinguishes a `string` from an `ident`?** A string is quoted; an identifier is an unquoted CSS token subject to identifier grammar and reserved keywords.

Primary module references: [CSS Values and Units 4](https://drafts.csswg.org/css-values-4/), [CSS Display 3](https://drafts.csswg.org/css-display-3/), [CSS Grid Layout 2](https://drafts.csswg.org/css-grid-2/), [CSS Shapes 1](https://drafts.csswg.org/css-shapes-1/), [CSS Color 4](https://drafts.csswg.org/css-color-4/), [CSS Images 4](https://drafts.csswg.org/css-images-4/), [Filter Effects 1](https://drafts.csswg.org/filter-effects-1/), [CSS Easing Functions 2](https://drafts.csswg.org/css-easing-2/), [CSS Inline Layout 3](https://drafts.csswg.org/css-inline-3/), and [CSS Transforms 1](https://drafts.csswg.org/css-transforms-1/). These specifications have different maturity levels; a link to a grammar is not a browser support statement.
