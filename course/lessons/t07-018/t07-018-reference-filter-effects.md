<!-- FACTUALLY REVIEWED: Filter Effects Level 1 and backdrop-filter draft distinguished. -->

## Scope and version

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: Filter Effects properties

This reference explains the six supplied names. The `filter` property, filter functions, SVG filter primitives, and SVG presentation properties are described by [Filter Effects Level 1](https://www.w3.org/TR/filter-effects-1/). `backdrop-filter` is specified separately in the current Filter Effects Level 2 Editor’s Draft, which is still work in progress and explicitly has unresolved design issues. The six MDN Baseline labels in the 2026-11-16 inventory capture describe browser availability snapshots; they do not establish that every specification detail is interoperable.

## How this group fits the mental model

Treat a filter as an image-processing step in painting. CSS first lays out the element and its descendants; the filter operates on their rendered image and paints the result. It does not change the target’s layout geometry, but it can paint beyond the border box, create a stacking context and containing block, and affect compositing cost. SVG filters expose a graph of primitives; CSS filter functions provide common effects through a compact list. `filter` processes the element’s own rendered group. `backdrop-filter` processes pixels painted behind an element, subject to the backdrop-root boundary. Color-space selection affects SVG filter primitives, but CSS filter functions themselves operate in sRGB.

## Supplied names explained

### `filter`

Grammar: `none | [ <filter-function> | <url> ]+`; initial `none`; applies to all elements (with SVG applicability rules); not inherited. Supported functions are `blur()`, `brightness()`, `contrast()`, `drop-shadow()`, `grayscale()`, `hue-rotate()`, `invert()`, `opacity()`, `sepia()`, and `saturate()`. A filter list is applied in written order: each operation receives the previous operation’s output. A URL references an SVG `<filter>` element; a missing or wrong-kind reference causes the filter chain to have no effect.

The element and descendants are rendered as a group, then the filter is applied. A non-`none` filter creates a stacking context and a containing block for absolute and fixed positioned descendants (subject to the document-root exception). It does not change CSS box geometry, but blur and shadows can extend painted pixels outside the border box. Filtering has no effect on hit testing. `color-interpolation-filters` does not control these CSS functions; they operate in sRGB.

Function details worth remembering:

- `blur(<length>)`: Gaussian blur; the default amount is zero. A large radius can greatly expand painted bounds and processing work.
- `brightness(<number-percentage>)`, `contrast(<number-percentage>)`, and `saturate(<number-percentage>)`: 1 or 100% is the identity amount; values below/above that reduce/increase the relevant component. They do not guarantee contrast accessibility.
- `grayscale()`, `invert()`, and `sepia()`: their amount defaults to 1; zero is the identity and one requests the full named effect. `opacity()` also defaults to 1, but its amount directly scales alpha: one is identity and zero makes the filtered image fully transparent. Filter-function opacity is distinct from the element’s `opacity` property.
- `hue-rotate(<angle>)`: rotates hue; zero is identity. It does not preserve semantic color meaning or guarantee legibility.
- `drop-shadow(<color>? && <length>{2,3})`: projects a shadow from the input’s alpha shape; unlike `box-shadow`, it follows transparent image contours. It does not accept spread radius or `inset`.
- `<url>`: uses an SVG filter graph, whose primitives can name prior results, combine channels and use explicit filter regions. A too-small SVG filter region clips effects even when CSS overflow is visible.

The filter value list also accepts CSS-wide keywords. Invalid filter-function parameters invalidate that function/declaration according to CSS value parsing; test the computed style rather than assuming a partially valid chain.

### `backdrop-filter`

Grammar in the current Level 2 draft: `none | <filter-value-list>`; initial `none`; applies to all elements (and certain SVG elements); not inherited. It filters the backdrop image behind the element, not the element’s own foreground. The element usually needs a transparent or translucent background to reveal the processed backdrop. Its backdrop is bounded by the nearest applicable **backdrop root**, not necessarily the whole page; ancestor opacity, filters, blending, masks, and other specified effects can establish boundaries. The result is then clipped and composited according to the property’s painting rules.

It creates a stacking context when non-`none`, does not change normal-flow layout, and can require expensive backdrop readback and reprocessing as content scrolls or animates. Put an opaque, readable fallback background first and apply the effect only when supported:

```css
.glass-panel {
  background: rgb(20 28 44 / 92%);
}
@supports (backdrop-filter: blur(8px)) {
  .glass-panel {
    background: rgb(20 28 44 / 55%);
    backdrop-filter: blur(8px) saturate(1.2);
  }
}
```

`@supports` confirms parsing, not performance, compositing correctness, or accessibility. Keep foreground text contrast adequate over likely backdrops.

### `color-interpolation-filters`

Grammar: `auto | sRGB | linearRGB`; initial `linearRGB`; applies to filter primitives; inherited. It selects the color space for imaging/color operations performed by SVG filter primitives. `auto` lets the user agent choose; `sRGB` requests the gamma-encoded sRGB space; `linearRGB` requests linearized RGB values. Because interpolation in linear light differs from interpolation in sRGB, blur, lighting, and color-matrix results can look different. The initial value is intentionally different from the general `color-interpolation` property’s sRGB initial value.

It has no effect on primitives that do not perform color operations, including `feOffset`, `feImage`, `feTile`, and `feFlood`; and it does not affect CSS filter functions, which use sRGB. This property is also an SVG presentation attribute; a CSS declaration participates in the cascade and can override the corresponding presentation attribute.

### `flood-color`

Grammar: `<color>`; initial `black`; applies to SVG `feFlood` and `feDropShadow`; not inherited. It sets the color used to fill a filter primitive’s subregion. The color is not a page-wide CSS fill and does not independently make a flood visible: the primitive’s output and the filter graph determine whether that region reaches the final result. It is an SVG presentation attribute, so ordinary cascade rules determine whether a CSS declaration overrides the attribute. If the chosen color has an alpha channel, that alpha is multiplied by `flood-opacity`.

### `flood-opacity`

Grammar: `<alpha-value>`; initial `1`; applies to `feFlood` and `feDropShadow`; not inherited. It sets the opacity applied across the primitive subregion. The computed value is converted to a number and clamped to [0, 1]. The flood color’s own alpha is multiplied by this value, so two partial alpha settings compound. It is an SVG presentation attribute and is subject to the CSS cascade when set as a CSS property.

### `lighting-color`

Grammar: `<color>`; initial `white`; applies to `feDiffuseLighting` and `feSpecularLighting`; not inherited. It sets the light color used by the SVG lighting primitives. Those primitives use the input alpha channel as a bump map and compute lighting from the surface and source geometry; they do not simply tint the original image. The result is an opaque light map that is commonly composited with a texture. It is an SVG presentation attribute. Legacy SVG 1.1 also lists `currentColor`; check the target SVG/CSS implementation when relying on that legacy form.

## Cross-item comparison

| Property | Image being processed | Typical use |
| --- | --- | --- |
| `filter` | Element’s rendered group | Blur, grayscale, shadow, or SVG filter graph |
| `backdrop-filter` | Backdrop behind the element, up to its backdrop root | Frosted/translucent surface effect |
| `color-interpolation-filters` | Color calculations inside SVG filter primitives | Choose sRGB versus linear-light operation |
| `flood-color` / `flood-opacity` | The colored region emitted by flood/shadow primitives | Add a solid or translucent source into an SVG graph |
| `lighting-color` | SVG lighting output | Color diffuse/specular lighting primitives |

The two opacity concepts are distinct: `flood-opacity` colors a filter primitive’s output; `opacity` changes the opacity of the whole element group. Likewise, `drop-shadow()` is a CSS function and `feDropShadow` is an SVG primitive whose inputs and graph position are explicit.

## Examples

Use foreground filtering for a disabled-looking image only when the semantic state is represented separately; a visual filter does not disable the underlying control.

```css
.thumbnail { filter: grayscale(1); }
.thumbnail:hover { filter: none; }
```

Use an SVG graph when multiple named intermediate results or channel operations are needed. Keep the filter region large enough for blur and shadow output, because SVG regions can clip those pixels.

## Common mistakes

- Confusing `filter` (foreground group) with `backdrop-filter` (pixels behind the element).
- Assuming backdrop filtering samples the entire page through ancestor backdrop-root boundaries.
- Assuming filters change layout geometry or hit testing; they change painted output and stacking behavior.
- Using `filter: opacity()` as if it were identical in cascade and compositing effects to the `opacity` property.
- Expecting `color-interpolation-filters` to affect CSS filter functions or `feFlood`.
- Forgetting that SVG filter-region bounds can clip blur and shadow output.
- Treating a filter effect as an accessible disabled state or as a substitute for sufficient text contrast.
- Animating large filtered surfaces without measuring rendering cost on target devices.
- Treating a draft’s `backdrop-filter` definition as settled merely because an implementation supports the property.

## Knowledge checks with answers

1. What does `filter` process? The element’s rendered group, including its content and descendants, then applies the filter list in order.
2. What does `backdrop-filter` process? The painted backdrop behind the element, bounded by the applicable backdrop root.
3. Does `color-interpolation-filters: linearRGB` change `blur()`? No. CSS filter functions operate in sRGB; the property applies to SVG filter color operations.
4. How do `flood-color` alpha and `flood-opacity` combine? The color’s alpha is multiplied by the flood-opacity value.
5. Does `filter` move neighboring layout boxes? No. It can change painted bounds and stacking/containing-block behavior but not the target’s CSS box geometry.

## Sources

- [Filter Effects Module Level 1](https://www.w3.org/TR/filter-effects-1/)
- [Filter Effects Module Level 2 Editor’s Draft](https://drafts.fxtf.org/filter-effects-2/)
- [SVG 1.1 Second Edition](https://www.w3.org/TR/SVG11/)
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property reference index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
