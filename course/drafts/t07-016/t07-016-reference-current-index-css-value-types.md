# CSS selectors at-rules cascade values and box model — Reference: Additional data types in the current MDN CSS reference, checked 2026-11-16

## Scope and version

This supplement adds type names in the current [MDN CSS data types index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/Data_types) that were not in the curriculum's pinned [MDN types data](https://github.com/mdn/data/blob/1c90fd0b8d52e93950c5d0ea3e25dad5cd64cc27/css/types.json). The MDN index is expressly not exhaustive of every module-specific grammar; this module covers the complete current named index at the check date, plus the pinned inventory in its companion reference.

## How this group fits the mental model

Types name reusable grammar components in CSS specifications. Many are value categories used inside property grammars, not literal keywords authors type. They overlap and compose: an alignment property may use a position or distribution type, while math functions accept calculated types. Knowing the type tells you the shape of a value; the consuming property still defines where it is valid and what it means.

## Supplied names explained

- **`absolute-size`** — One of the absolute font-size keywords such as `medium` or `large`, as defined by the font sizing grammar.
- **`alpha-value`** — Numeric or percentage opacity component for a color, normally from fully transparent to fully opaque with property/function-specific clamping.
- **`axis`** — A module-specific axis identifier used to select a physical or logical dimension, such as inline/block or x/y depending on the consuming grammar.
- **`baseline-position`** — Alignment value that chooses a baseline alignment mode, including first/last baseline semantics where supported.
- **`box-edge`** — Identifies a reference-box edge such as margin, border, padding, or content edge in geometries that accept a box reference.
- **`calc-keyword`** — A named numeric constant such as `e`, `pi`, `infinity`, or `NaN` used by CSS mathematical expressions; availability depends on the function/specification.
- **`calc-sum`** — A calculation expression made from calculation values joined by addition/subtraction under CSS dimensional rules.
- **`color-interpolation-method`** — Specifies the color space and hue-interpolation strategy used when interpolating colors, such as in gradients or color mixing.
- **`content-distribution`** — Alignment value that distributes free space among multiple subjects, such as `space-between` or `space-around`.
- **`content-position`** — Alignment value positioning a subject within available space, such as start, end, center, or flex-relative positions.
- **`corner-shape-value`** — Shape value controlling a corner's curvature profile, such as rounded, bevel-like, scoop, notch, or superellipse forms.
- **`dashed-function`** — A custom function name beginning with `--`, used by CSS custom functions/mixins grammar; distinct from a custom property identifier even though both use a dashed name.
- **`generic-family`** — A generic font family category such as `serif`, `sans-serif`, `monospace`, `system-ui`, or other defined generic families.
- **`hex-color`** — A hexadecimal color notation with 3, 4, 6, or 8 hex digits after `#`, with short forms expanding to full channel values.
- **`hue`** — A color-wheel angle used in color functions; unitless values are interpreted according to the function's hue grammar.
- **`hue-interpolation-method`** — Selects how hue angles travel around a cylindrical color wheel when colors are interpolated, including shorter/longer/increasing/decreasing paths where defined.
- **`line-width`** — Border/outline line thickness value, typically a non-negative length or a keyword such as thin, medium, or thick.
- **`named-color`** — A predefined CSS color keyword such as `rebeccapurple`; named colors have fixed sRGB values and keyword-specific casing rules are generally ASCII-insensitive.
- **`overflow-position`** — Alignment modifier that controls whether overflow may occur toward the start or end side when an alignment subject does not fit.
- **`position-area`** — Anchor-positioning area value selecting a region around an anchor, often using block/inline sides and spans.
- **`relative-size`** — Font-size keyword relative to the parent's computed size, such as `larger` or `smaller`.
- **`self-position`** — Alignment value positioning an individual alignment subject relative to its container, such as self-start, self-end, center, or stretch in applicable grammars.
- **`shape`** — Broad shape grammar category used by newer shape and corner systems; distinguish it from the narrower `<basic-shape>` type and from the `shape()` function.
- **`system-color`** — A color keyword drawn from the operating system/user-agent color scheme, such as Canvas or CanvasText; it adapts to user preference and forced-colors environments.
- **`timeline-range-name`** — A name identifying a named range within a scroll/view progress timeline, used to address animation attachment/range positions.

## Cross-item comparison

`absolute-size` and `relative-size` are font-size keyword categories, not CSS physical units. `hex-color`, `named-color`, `system-color`, and `alpha-value` are related to color but represent different syntactic components and sources. `content-distribution`, `content-position`, `self-position`, and `baseline-position` are distinct alignment grammars; do not substitute them without checking the property. `box-edge` picks a reference boundary, whereas `position-area` names a region relative to an anchor. `shape` is broader than `basic-shape`; a type name and a function name can share vocabulary but are not interchangeable. `dashed-function` names a function, not a variable.

## Examples

```css
.panel {
  color: CanvasText;                /* system-color */
  border: thick solid #336699cc;    /* line-width and hex-color/alpha */
  justify-content: space-between;  /* content-distribution */
  align-items: first baseline;      /* baseline-position */
}
```

Examples are property-specific: a token's matching type is only one part of grammar validation. Use browser DevTools or a CSS parser to confirm a value is accepted in its intended property and test forced-colors, writing modes, and narrow layouts where relevant.

## Common mistakes

- Treating every type index entry as a standalone property or a literal keyword.
- Confusing `absolute-size` with absolute physical CSS units such as `cm`.
- Confusing generic, named, and system colors; system colors intentionally follow user-agent/OS themes.
- Treating `shape`, `basic-shape`, and `shape()` as synonyms.
- Reusing alignment values across properties without checking their exact grammar.
- Assuming the MDN data-types index enumerates every specification-specific internal type.

## Knowledge checks with answers

1. **Does `relative-size` refer to `em`?** No; it names relative font-size keywords such as `larger`/`smaller`; `em` is a length unit.
2. **What makes `system-color` different from a named color?** It follows the user-agent/OS color scheme and accessibility preferences.
3. **Is `dashed-function` a custom property?** No; it names a CSS custom function with a dashed identifier.
4. **Is `<shape>` interchangeable with `<basic-shape>`?** No; the grammar and consuming features differ.
