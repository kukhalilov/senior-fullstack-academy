# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Fill and Stroke stroke-color properties

## Scope and version

This reference covers the one supplied name, `stroke-color`, from CSS Fill and Stroke Level 3. The latest published W3C text is a First Public Working Draft dated 2017-04-13. The current CSSWG Editor’s Draft is dated 2026-03-04 and remains a work in progress. The current compatibility dataset reports Safari support from 11.1, but no support in Chrome, Edge, or Firefox. Sources checked on 2026-11-20.

## How this group fits the mental model

A stroke paints along the outline of a shape or text glyphs; a fill paints the interior. CSS Fill and Stroke Level 3 is designing a richer paint model with separate longhands for paint color, paint images, geometry, opacity, and positioning. In that model, `stroke-color` supplies one or more color layers; it does not specify the stroke’s thickness or shape.

This is different from the familiar, widely implemented SVG `stroke` presentation property/CSS property. In current browsers, `stroke: rebeccapurple` typically assigns one legacy SVG paint value. The new Fill and Stroke draft defines `stroke` as a shorthand for several new stroke painting properties. Do not assume that a browser which supports legacy `stroke` also implements this new shorthand or `stroke-color`.

## Supplied names explained

This inventory contains one CSS property: `stroke-color`.

### Exact grammar and property definition

The current Editor’s Draft defines:

```css
stroke-color: <color>#;
```

The hash means a comma-separated list with one or more `<color>` values. Any valid CSS `<color>` is available, subject to the CSS Color grammar supported by the user agent. The property definition is:

| Descriptor | CSS Fill and Stroke Level 3 Editor’s Draft |
| --- | --- |
| Initial | `transparent` |
| Applies to | Text and SVG shapes |
| Inherited | Yes |
| Percentages | Not applicable |
| Computed value | The computed color |
| Animation | By computed value |
| Media | Visual |

The property sets stroke colors for an element. It does not by itself create a visible outline: a stroke also needs nonzero stroke geometry (such as a width) and a visible paint result. With its initial transparent color, no visible solid-color layer is supplied by default.

### Color layers and image interaction

A single color is the common case. Multiple values create multiple stroke layers. The first listed color is painted on top (closest to the viewer); later colors are painted behind earlier ones. Thus the list order is visually significant.

Color layers work alongside `stroke-image`, not as an overlay on top of every image. For each layer, a color is drawn only when the corresponding `stroke-image` is `none` or an invalid image. If the image is valid, it wins and the color for that same layer is not painted. This makes the color a fallback for its layer, including the legacy SVG `stroke` fallback behavior that the draft is designed to model.

The number of stroke layers is the larger of the number of comma-separated `stroke-color` values and `stroke-image` values; `none` still counts as an image layer. If the lists differ in length, they align from the end. Missing front `stroke-color` values are transparent; missing front image values are `none`. This matters when layering only some of the paints: it can change which color is visible and which layer sits on top.

## Examples

### Example under the draft model

```css
/* Existing paint fallback for browsers using legacy SVG stroke behavior. */
.icon path {
  fill: none;
  stroke: #302b63;
  stroke-width: 12px;
}

/* Draft longhands: narrow purple stroke in front of a wider gold stroke. */
@supports (stroke-color: rebeccapurple) {
  .icon path {
    stroke-color: rebeccapurple, gold;
    stroke-width: 4px, 12px;
  }
}
```

This illustrates intended CSS Fill and Stroke behavior, not a promise that a given browser implements it. Browser implementations can differ in whether they parse and apply the draft property. Verify both the support condition and the rendered result. The legacy `stroke` declaration is a fallback for its supported SVG paint behavior; it does not reproduce arbitrary multi-layer stroke-color lists.

## Cross-item comparison

`stroke-color` controls solid stroke-paint layers. `stroke-image` supplies image paint; `stroke-width` and `stroke-opacity` control geometry and transparency; `fill-color` paints interiors. The legacy SVG `stroke` property is a separate, broadly implemented interface with different practical behavior from the newer draft shorthand.

## Related paint and geometry controls

Use the property that matches the part of the drawing you intend to change:

- `stroke-color` supplies solid colors for stroke paint layers.
- `stroke-image` supplies image or SVG paint-server layers; valid images take precedence over colors for matching layers.
- `stroke-width` controls thickness, not color.
- `stroke-opacity` controls opacity of stroke painting.
- `stroke-align`, `stroke-linecap`, and `stroke-linejoin` control placement, line ends, and corners in the newer draft model.
- `fill-color` paints shape/text interiors, not outlines.
- Legacy SVG `stroke` remains the practical fallback for a simple color or paint server on SVG elements where supported. For text-only outlines, `-webkit-text-stroke` is a separate compatibility feature with its own support and syntax.

The Editor’s Draft proposes `stroke` as a shorthand that resets its stroke-paint longhands. Existing browsers have historically treated `stroke` as a direct analogue of the SVG presentation attribute instead of implementing that new shorthand behavior. This means shorthand/longhand relationships in the draft do not describe every browser’s current behavior; check the feature’s support independently.

## Support and production use

MDN’s browser compatibility data marks `stroke-color` experimental. The current data says Safari added it in 11.1, with the corresponding iOS and WebView entries mirroring Safari; Chrome, Edge, and Firefox are marked unsupported. That partial record does not establish implementation of every evolving detail, such as multi-layer interactions or the newer `stroke` shorthand.

For common cross-browser SVG strokes, prefer the established `stroke` color and width declarations, and keep a tested visual fallback. Use `stroke-color` only after verifying the required value and layering behavior in each target browser. If a feature is essential, test the actual path, text, paint layers, and fallback behavior rather than relying only on a CSS property support query.

## Common mistakes

- Treating `stroke-color` as an alias for the current widely implemented SVG `stroke` paint property.
- Assuming support for legacy SVG `stroke` means support for the proposed Fill and Stroke `stroke` shorthand or its longhands.
- Forgetting that `stroke-color` accepts a comma-separated list, with the first color painted on top.
- Expecting a color to show through a valid corresponding `stroke-image`; the image wins that layer.
- Assuming the initial `transparent` value creates a visible stroke.
- Using `stroke-color` to change width, opacity, cap, join, or fill.
- Treating the Editor’s Draft as a stable, interoperable browser contract.

## Knowledge checks with answers

1. **What is the complete value shape?** One or more comma-separated CSS `<color>` values: `<color>#`.
2. **Which listed color is on top?** The first; subsequent colors are behind it.
3. **When is a layer’s color drawn instead of its image?** When that corresponding `stroke-image` is `none` or invalid. A valid image wins.
4. **Does `stroke-color` set the stroke width?** No; width is a separate geometry property.
5. **Does legacy browser support for `stroke` guarantee support for `stroke-color`?** No. Compatibility data distinguishes the experimental longhand from the legacy paint behavior.
6. **What is the safe practical approach for a simple SVG outline?** Use the established `stroke` paint and `stroke-width` behavior as the baseline, then test any draft longhands and layered result separately.

## Sources

- [CSS Fill and Stroke Module Level 3 Editor’s Draft, §4.1 and §4.4.1](https://drafts.csswg.org/fill-stroke/#stroke-color) (layer model, exact property grammar, descriptors, paint fallback)
- [CSS Fill and Stroke Module Level 3, First Public Working Draft](https://www.w3.org/TR/fill-stroke-3/) (published status and earlier published text)
- [MDN Browser Compatibility Data: `stroke-color`](https://github.com/mdn/browser-compat-data/blob/main/css/properties/stroke-color.json) (current engine support data)
- [MDN: `stroke` CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/stroke) (legacy SVG stroke behavior and implementation differences)
- [CSS Color Module Level 4](https://drafts.csswg.org/css-color-4/) (CSS `<color>` type)
