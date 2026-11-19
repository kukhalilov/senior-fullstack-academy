# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Masking properties

## Scope and version

This reference covers all 19 supplied names in the CSS Masking inventory. The W3C published [CSS Masking Module Level 1](https://www.w3.org/TR/css-masking-1/) as a Candidate Recommendation Draft in 2021; the current [CSSWG Editor’s Draft](https://drafts.csswg.org/css-masking-1/) is dated 2026-08-18 and remains work in progress. They define the standards model, not uniform browser support. The border-mask family and some SVG-related details have narrower implementation support, so test the exact feature and browsers you target. The [CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) describes spec status, not deployment.

## How this group fits the mental model

The browser first lays out the element normally. It then paints the element and its descendants, applies filter effects, clipping, masking, and opacity in that order. These effects change what is visible, not the element’s inherent layout geometry.

- **Clipping** is a geometric gate: paint inside the clip region is shown, and paint outside is removed. By default, clipped-out regions do not receive pointer events.
- **Masking** multiplies the painted group’s alpha by values from an image or SVG `<mask>`. It can make regions fully visible, partially transparent, or invisible. CSS image masks do not change CSS-box hit-testing.
- Both can create a stacking context. Neither is a substitute for semantic HTML, accessibility state, or actually removing sensitive content.

A non-`none` `clip-path` creates a stacking context. A non-`none` `mask-image` also creates one and masks the element together with its descendants as a rendered group. These effects are applied after layout, so they do not reclaim the clipped/masked space.

Clipping is generally the simpler tool for a crisp shape. Use a mask when you need a gradual fade, transparent artwork, luminance control, or compositing of multiple images.

## Supplied names explained

The 19 supplied names are `clip-path`, `clip-rule`, `mask`, `mask-border`, `mask-border-mode`, `mask-border-outset`, `mask-border-repeat`, `mask-border-slice`, `mask-border-source`, `mask-border-width`, `mask-clip`, `mask-composite`, `mask-image`, `mask-mode`, `mask-origin`, `mask-position`, `mask-repeat`, `mask-size`, and `mask-type`.

### Clipping geometry

`clip-path` accepts `none` (initial), a URL reference to an SVG `<clipPath>`, or a `<basic-shape>` optionally paired with a geometry box. With a basic shape and no reference box, the border box is used. A geometry box alone clips to its edges, including existing corner shaping; with a basic shape it provides the coordinate reference. CSS boxes can use `margin-box`, `border-box`, `padding-box`, or `content-box`, while SVG also uses `fill-box`, `stroke-box`, and `view-box`. The last refers to the nearest SVG viewport and its `viewBox` coordinate system. Invalid fragment references produce no clipping. Clipping does not resize or reflow the element, and normally removes pointer targeting outside the visible clip.

The current CSS Shapes Level 1 draft defines basic shape functions including `inset()`, `xywh()`, `rect()`, `circle()`, `ellipse()`, `polygon()`, `path()`, and `shape()`. `shape()` is a CSS-friendly path-command form that can use normal CSS units and math; `path()` uses SVG path-data syntax. Their exact grammar is defined by [CSS Shapes Level 1](https://drafts.csswg.org/css-shapes-1/), not by the clipping property itself. Shapes interpolate only when their types and command structures are compatible; do not assume every pair of arbitrary paths animates smoothly.

`clip-rule` chooses `nonzero` (initial) or `evenodd` winding behavior for SVG graphics elements that define the silhouette inside a `<clipPath>`. It is inherited and applies to the graphics that make up the clip path; putting it only on the element that references the clip does not change the clip’s child geometry. It does not apply to CSS `<basic-shape>` functions. The distinction matters for self-intersecting paths or compound paths with holes.

### Mask layers: how visibility is calculated

`mask-image` is a comma-separated list of mask references: image values (including gradients) or URLs to SVG `<mask>` sources; `none` is the initial value. The first listed layer is visually on top. `mask-mode` chooses how each layer produces its mask value; it accepts a comma-separated list of `alpha`, `luminance`, or `match-source` (initial):

- `alpha` uses the image alpha; RGB color is ignored. Opaque black and opaque white therefore reveal equally under alpha mode.
- `luminance` derives a value from color brightness and alpha. White is fully revealing, black is hiding, gray is partial, and transparent pixels remain hiding because luminance is multiplied by alpha. The SVG mask’s `color-interpolation` setting determines whether its colors are converted to `linearRGB` before luminance calculation.
- `match-source` (initial) uses the referenced SVG `<mask>` element’s `mask-type` for a mask source; ordinary CSS image sources default to alpha.

`mask-type` applies to SVG `<mask>` elements and selects `luminance` (initial) or `alpha` as the source’s preferred mode. A non-default `mask-mode` on the element consuming the SVG mask overrides that preference. `mask-type` does not affect image/gradient masks or mask-border images; `mask-mode` does not change mask-border interpretation either. For an SVG `<mask>` source, the SVG mask element controls its own region and content coordinate systems; the CSS `mask-position`, `mask-size`, `mask-repeat`, `mask-origin`, and `mask-clip` used values do not reposition or resize that source.

Mask layers align by list position, like background layers. The comma-separated longhands describe each layer’s source, mode, repeat, position, size, origin, clip, and composite operation. Shorter lists repeat to match the number of mask images; a `none` entry still occupies a layer and may matter to compositing. Uncovered image regions act as transparent black, producing mask value zero.

`mask-composite` controls how each current layer combines with the layers below it. Its operators correspond to Porter–Duff operations:

| Value | Intuitive result for the current (top) mask and the already-composited lower masks |
| --- | --- |
| `add` (initial) | Source-over: place the current mask over the lower result. |
| `subtract` | Source-out: keep current-mask coverage outside the lower result. |
| `intersect` | Source-in: keep only current-mask coverage overlapping the lower result. |
| `exclude` | XOR: keep the non-overlapping portions of both. |

The lower layers are combined first, then the current layer’s operator is applied. An operator with no lower layer to combine is ignored. Mask layers combine with each other in an isolated group; they do not composite with the element’s content or the content behind it. This property’s keywords are not interchangeable with the legacy WebKit `-webkit-mask-composite` vocabulary.

### Position, sizing, repeat, origin, and clip

These properties borrow the background-image model but affect the mask image, not the element’s box:

| Property | Behavior |
| --- | --- |
| `mask-position` | A repeatable `<position>` list, initially `0% 0%`. Percentages are resolved from mask painting area size minus image size, so `100% 100%` aligns the image’s bottom-right corner to the area’s bottom-right corner. Edge-offset forms such as `right 1rem bottom 2rem` are valid. |
| `mask-size` | A repeatable background-size grammar, initially `auto`: lengths/percentages, `auto`, `cover`, or `contain`. `cover` fills the positioning area while preserving aspect ratio and can crop; `contain` fits the entire image and can leave unused space. One explicit dimension leaves the other `auto`. |
| `mask-repeat` | A repeatable background-repeat grammar, initially `repeat`; values include `repeat`, `no-repeat`, `repeat-x`, `repeat-y`, `space`, and `round`. Tiling happens after sizing and positioning. |
| `mask-origin` | Selects the positioning area; initial `border-box`. Accepts `margin-box`, `border-box`, `padding-box`, `content-box`, and SVG-oriented `fill-box`, `stroke-box`, `view-box`. For fragmented boxes, `box-decoration-break` affects which fragments define the area. |
| `mask-clip` | Selects the mask painting area; initial `border-box`. Accepts `margin-box`, `border-box`, `padding-box`, `content-box`, `fill-box`, `stroke-box`, `view-box`, and `no-clip`. Unlike origin, it controls the area affected by the mask. For a URL that references an SVG `<mask>`, this CSS property has no effect because the SVG mask’s own region controls the area. |

The same box can serve as both origin and clip when a shorthand layer contains one geometry-box. With two boxes, the first sets `mask-origin` and the second sets `mask-clip`; `no-clip` can be used after an origin box to avoid clipping. Keep this distinction clear: origin positions the mask, clip limits where the masking operation applies.

### Mask-border: a nine-slice mask around the box

`mask-border-source` is an image or `none` (initial). The source is divided into four corners, four edges, and a center; the pieces are sized and tiled to fit the mask-border image area, normally based on the border box.

- `mask-border-slice` takes one to four numbers/percentages and optional `fill`; initial `0`. It defines inward cuts from the image edges. Without `fill`, the center is treated as fully opaque white (it does not mask the covered content); with `fill`, the center is used as part of the mask.
- `mask-border-width` accepts lengths/percentages, numbers relative to the corresponding border width, or `auto`; initial `auto`. Percentages resolve against the mask-border image area.
- `mask-border-outset` extends that image area beyond the border box with lengths or border-width multipliers. Negative values are invalid. This changes the masked painting extent, not layout dimensions.
- `mask-border-repeat` accepts `stretch`, `repeat`, `round`, or `space`; one/two values control horizontal/vertical sides, with the second defaulting to the first. Initial `stretch`.
- `mask-border-mode` selects `alpha` (initial) or `luminance` interpretation for the border image. It is independent of `mask-mode` and `mask-type`.
- `mask-border` is the shorthand for source, slice, width, outset, repeat, and mode. Omitted values reset to initial values.

If the source is empty, missing, fails to load, or cannot be displayed, it is ignored and does not mask the element. `mask-border-source` and `mask-image` are independent; when both apply, both masking operations are applied, with the same result regardless of their order. A non-`none` mask-border source creates a stacking context and does not change the box geometry or hit-testing.

The `mask` shorthand parses each comma-separated layer using this structure:

```text
<mask-reference> || <position> [ / <bg-size> ]? || <repeat-style>
|| <geometry-box> || [ <geometry-box> | no-clip ]
|| <compositing-operator> || <masking-mode>
```

The first geometry box sets both origin and clip; with two geometry boxes, the first sets origin and the second clip. The separate `no-clip` form lets the layer set an origin without clipping. The shorthand sets the mask-image layer properties and also resets the entire mask-border family to its initial state. A later `mask: ...` can therefore clear `mask-border` values set earlier. `mask` is not a shorthand for `clip-path` or `clip-rule`.

## Cross-item comparison

| Choose | When | Pointer/geometry effect |
| --- | --- | --- |
| `clip-path` | Crisp geometric boundary from a basic shape or SVG clip path | No layout reflow; clipped-out areas normally do not receive pointer events. |
| `mask-image` with `mask-mode` | Gradual alpha or luminance transparency, image masks, or multiple composited layers | Visual group effect only; does not change CSS-box hit-testing. |
| `mask-border-*` | A mask image needs to stretch/tile around the perimeter using nine-slice rules | Visual masking only; does not alter layout geometry or box hit-testing. |
| `clip-rule` | A compound SVG clip-path geometry needs a winding rule | Affects the SVG clip silhouette, not CSS basic-shape functions. |
| `mask-type` | Set the preferred alpha/luminance mode on an SVG `<mask>` source | Applies to that SVG source; `mask-mode` can override when consumed. |

## Examples

An alpha fade uses changing opacity, not black-to-white brightness:

```css
.fade-out {
  mask-image: linear-gradient(to bottom, black 65%, transparent);
  mask-mode: alpha;
  mask-repeat: no-repeat;
}
```

Intersect two masks to keep only the circular region. The image values may be black because alpha mode looks at opacity:

```css
.avatar {
  mask-image: radial-gradient(circle, black 68%, transparent 70%),
              linear-gradient(black, black);
  mask-mode: alpha;
  mask-composite: intersect;
}
```

A clip path is a better fit for a crisp shape and its outside region is not pointer-targeted by default:

```css
.badge {
  clip-path: polygon(50% 0, 100% 25%, 82% 100%, 18% 100%, 0 25%);
}
```

For an SVG clip path with a hole, put the winding rule on the SVG path inside the `<clipPath>`:

```html
<svg aria-hidden="true" class="clip-defs">
  <clipPath id="ring" clipPathUnits="objectBoundingBox">
    <path clip-rule="evenodd" d="M0 0h1v1H0z M.3 .3v.4h.4V.3z" />
  </clipPath>
</svg>
```

```css
.ring-window { clip-path: url(#ring); }
```

## Common mistakes

1. **Treating black as transparent in every mask.** In alpha mode, opaque black reveals just as opaque white does; in luminance mode, black hides and white reveals.
2. **Expecting `mask-mode` to change `mask-border`.** Border masks have their own `mask-border-mode`.
3. **Putting `clip-rule` on the clipped HTML element.** Put it on the SVG graphics that form the clip path; it does not affect CSS basic shapes.
4. **Assuming `mask-origin` is the same as `mask-clip`.** One positions the mask; one defines its painting area.
5. **Forgetting `mask` resets mask-border.** Put the `mask` shorthand before any `mask-border` declarations that should remain active.
6. **Expecting a mask to alter click targets or remove content from assistive technology.** CSS image masks do not change box hit-testing or semantic exposure; clipping has a distinct pointer-event rule.
7. **Using a mask as a security or content-removal mechanism.** Masked pixels remain in the document and can remain available to other interfaces or tools.
8. **Assuming every URL will load.** Mask/clip source fetching uses anonymous CORS-enabled fetches; a network error makes the effect behave as `none`. Keep a deliberate fallback and test deployment URLs.

## Knowledge checks with answers

1. **What is the key difference between a clip and a mask?** A clip is a geometric inside/outside boundary; a mask supplies per-pixel alpha or luminance values and can make partial transparency.
2. **Does `clip-path` change layout size?** No. It changes painting; the underlying geometry remains.
3. **In alpha mode, what do opaque black and opaque white do?** Both fully reveal because RGB is ignored and alpha is fully opaque.
4. **What does `match-source` do?** It uses `mask-type` for an SVG mask source and alpha for ordinary image sources.
5. **Which operator keeps only overlapping mask coverage?** `intersect` (Porter–Duff source-in).
6. **Does `clip-rule` control `polygon()`?** No. It controls SVG graphics inside a `<clipPath>`; CSS basic shapes define their own fill-rule where applicable.
7. **What does a mask-border center do without `fill`?** It is opaque white and therefore does not mask the center; `fill` includes that center image region.
8. **Can a later `mask` shorthand preserve an earlier mask-border?** No. The shorthand resets mask-border and its longhands.

## Source map

- [CSS Masking Module Level 1, current Editor’s Draft](https://drafts.csswg.org/css-masking-1/): property grammars, rendering order, clipping, winding rules, mask processing, layer compositing, mask-border, SVG mask source behavior, and resource fetching.
- [CSS Masking Module Level 1, W3C publication](https://www.w3.org/TR/css-masking-1/): published status snapshot and base module definition.
- [CSS Shapes Module Level 1](https://drafts.csswg.org/css-shapes-1/): current basic-shape functions and geometry used by `clip-path`.
- [CSS Snapshot 2026](https://www.w3.org/TR/css-2026/): specification-status context only.
