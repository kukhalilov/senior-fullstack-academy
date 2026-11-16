# CSS selectors at-rules cascade values and box model — Reference: Standard CSS data types

## Scope and version

The type names follow the pinned [MDN data types inventory](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/types.json) and its [length reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length). A type is a grammar category, not a property; a property accepts a defined combination of types and keywords. Some entries are internal or module-specific and have limited direct author use.

## How this group fits the mental model

CSS parses a declaration against the grammar for that property. Data types constrain valid tokens, operations, and value resolution. Types compose: a property may accept a length-percentage, a list of transform functions, or a keyword alternative. A value can be syntactically valid as one type but invalid for the consuming property.

## Supplied names explained

- **`angle`** — Angular measure such as degrees, radians, gradians, or turns; unitless zero is commonly accepted.
- **`angle-percentage`** — A value that can be an angle or percentage where a grammar defines both alternatives.
- **`basic-shape`** — Geometric shape values such as inset, circle, ellipse, polygon, rect, and xywh in properties like clipping.
- **`blend-mode`** — A keyword selecting how source and backdrop colors combine, used by blending properties.
- **`color`** — A CSS color value, including named, hexadecimal, functional, system, and relative color forms.
- **`custom-ident`** — An author-defined identifier subject to exclusions for CSS-wide/default keywords and grammar-specific reserved words.
- **`dashed-ident`** — An identifier beginning with `--`, commonly used for custom names such as custom properties and named timelines.
- **`dimension`** — A number with a dimension unit; dimensional arithmetic controls which units can combine.
- **`display-box`** — The box-generation part of `display` grammar, including values such as `contents` and `none`.
- **`display-inside`** — The inner layout model part of `display`, such as flow, flow-root, flex, grid, table, or ruby.
- **`display-internal`** — Specialized display values used to express internal table/ruby structure rather than ordinary outer display.
- **`display-legacy`** — Legacy combined display keywords such as inline-block/inline-flex/inline-grid, retained for compatibility.
- **`display-listitem`** — The list-item behavior component, which may combine with outer/inner display values.
- **`display-outside`** — The outer participation role, typically block or inline.
- **`easing-function`** — Timing-function values such as linear, cubic Bézier, steps, and piecewise linear functions.
- **`filter-function`** — Image filter operations such as blur, brightness, contrast, drop-shadow, hue rotation, and opacity in filter grammars.
- **`flex`** — A flex factor accepted by flex/grid track grammars in specific contexts; it is not a length even though it describes a share of available space.
- **`frequency`** — Frequency values such as Hz/kHz, primarily in speech/audio-related CSS grammars.
- **`frequency-percentage`** — A frequency or percentage where a specific property grammar allows either.
- **`gradient`** — A generated image produced by gradient functions.
- **`ident`** — An identifier token, including CSS keywords and custom names depending on the consuming grammar.
- **`image`** — An image value such as URL/image-set/gradient/cross-fade, or supported image-producing function.
- **`integer`** — A whole numeric value, including signed forms where accepted.
- **`length`** — A distance such as `px`, `rem`, viewport/container units, or absolute physical units; relative units resolve against defined contexts.
- **`length-percentage`** — A length or percentage, or compatible calculation combining them, where the property grammar allows unresolved percentage dependence.
- **`line-style`** — Border/outline line style values such as solid, dotted, dashed, double, groove, ridge, inset, outset, or none/hidden as defined by the property.
- **`number`** — A real numeric value, generally unitless; whether negative, fractional, or range-limited is property-specific.
- **`overflow`** — Values controlling how overflowing content is handled, such as visible, hidden, clip, scroll, and auto in applicable grammars.
- **`percentage`** — A proportion relative to a property-specific reference; its basis is not universally the viewport or parent width.
- **`position`** — A coordinate pair or position value used by image/gradient and layout-related grammars; axis keywords and percentages resolve by context.
- **`ratio`** — A numeric proportion such as `16 / 9`, used by aspect-ratio and related grammars.
- **`resolution`** — Pixel density such as dpi, dpcm, or dppx, mainly used for resolution media queries and image selection.
- **`string`** — A quoted CSS string token; it is distinct from identifiers and is commonly used by generated content/font names.
- **`text-edge`** — A typographic edge value used in newer text layout/alignment grammars; implementation and property context are specialized.
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
