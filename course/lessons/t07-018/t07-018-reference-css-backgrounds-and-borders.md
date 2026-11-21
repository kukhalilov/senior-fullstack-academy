# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Backgrounds and Borders properties

## Scope and version

## How this group fits the mental model

Think of an element as a box with a painted interior and an edge. Its background can be a stack of image layers plus one color. The border is drawn around the box and can be a simple line, a sliced image, or (in a newer draft) a custom shape. Rounded corners affect the border edge and related painting. Shadows extend the visual silhouette but do not reserve layout space.

This mental model answers most practical questions: **background properties decide what is painted behind content and where; border properties decide how the edge is drawn; radius/shape properties change the contour; shadow adds paint around that contour.** These properties do not replace layout, intrinsic content, or accessible foreground imagery. If an image communicates essential information, put it in the document (for example, an `img`) rather than only in CSS.

### Standards status

The established background layer model and most classic border behavior are specified in [CSS Backgrounds and Borders Level 3](https://drafts.csswg.org/css-backgrounds-3/). The 2026 [CSS Borders and Box Decorations Level 4 editor’s draft](https://drafts.csswg.org/css-borders-4/) defines newer corner-shape and border-shape features, among other extensions. The editor’s draft is work in progress; a name in a property index is not evidence of broad browser support or a finalized Recommendation. Check target-browser compatibility before using draft features. The [CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) describes the state of CSS specifications, not a guarantee that every browser implements each feature.

The frozen inventory here contains 61 names. The CSS Backgrounds Level 4 draft additionally develops `background-repeat-x`, `background-repeat-y`, `background-repeat-block`, `background-repeat-inline`, `background-position-inline`, `background-position-block`, and `background-tbd` (a background-layer shorthand that omits the color). It extends `background-clip` with `text` and `border-area`; when both are specified, the draft paints within their union. These additions are not among the 61 names and remain draft material; consult [that specification](https://drafts.csswg.org/css-backgrounds-4/) and support data separately. Do not mistake experimental/draft additions for the stable Level 3 baseline.

The CSS Borders Level 4 draft also describes additions outside this frozen list: logical and physical border-radius/corner shorthands (including `corner`, `corner-block`, `corner-inline`, `corner-top`, `corner-right`, `corner-bottom`, `corner-left`, and per-corner shorthands); `border-limit` and side-specific `border-*-clip` partial-border controls; `box-shadow-*` longhands; and one-dimensional image values for border colors. These are draft extensions, not implicit parts of the 61-name inventory. The two Level 4 families explicitly inventoried here are `corner-*-shape` and `border-shape`.

## Supplied names explained

The supplied names are covered below by behavior family. The explicit inventory checklist is: `background`, `background-attachment`, `background-clip`, `background-color`, `background-image`, `background-origin`, `background-position`, `background-position-x`, `background-position-y`, `background-repeat`, `background-size`; `border`, `border-bottom`, `border-bottom-color`, `border-bottom-left-radius`, `border-bottom-right-radius`, `border-bottom-style`, `border-bottom-width`, `border-color`, `border-image`, `border-image-outset`, `border-image-repeat`, `border-image-slice`, `border-image-source`, `border-image-width`, `border-left`, `border-left-color`, `border-left-style`, `border-left-width`, `border-radius`, `border-right`, `border-right-color`, `border-right-style`, `border-right-width`, `border-shape`, `border-style`, `border-top`, `border-top-color`, `border-top-left-radius`, `border-top-right-radius`, `border-top-style`, `border-top-width`, `border-width`; `box-shadow`; `corner-block-end-shape`, `corner-block-start-shape`, `corner-bottom-left-shape`, `corner-bottom-right-shape`, `corner-bottom-shape`, `corner-end-end-shape`, `corner-end-start-shape`, `corner-inline-end-shape`, `corner-inline-start-shape`, `corner-left-shape`, `corner-right-shape`, `corner-shape`, `corner-start-end-shape`, `corner-start-start-shape`, `corner-top-left-shape`, `corner-top-right-shape`, and `corner-top-shape`.

### Backgrounds: a stack of layers

### Painting order and shorthand rules

Comma-separated background values describe layers. The **first image listed is painted on top**, the next below it, and so on. The background color is painted beneath all image layers and is not itself a repeatable layer. If an image is `none`, fails to load, or has transparent pixels, lower layers and ultimately the color can show through. Backgrounds are behind the element’s content and border; they do not add dimensions to the box.

The `background` shorthand combines `background-color`, `background-image`, `background-position`, `background-size`, `background-repeat`, `background-origin`, `background-clip`, and `background-attachment`. A slash separates position from size (`center / cover`). Each shorthand layer first resets its omitted layer longhands to their initial values, then applies the values written. The final layer may include the color. Consequently, a later `background: ...` declaration can erase a `background-size` or attachment set earlier. Longhands with fewer comma-separated values repeat their list to cover the image layers; surplus values do not create additional images. This list matching is why a multi-layer rule should be read by index, not as independent global settings.

```css
.card {
  background:
    url("grain.png") repeat,
    linear-gradient(135deg, #172554, #0f766e) center / cover no-repeat,
    #102030;
}
```

Here the texture is the topmost layer and repeats; the gradient lies below it; the color is the fallback below both. The image order is the reverse of the usual “back-to-front” mental shorthand.

#### The 11 background names

| Property | What it controls and what to watch |
| --- | --- |
| `background` | Shorthand for color and image-layer longhands. Omitted pieces reset; `/` introduces size after position. |
| `background-image` | A comma-separated list of `<image>` values or `none`; gradients are images too. The first listed image is topmost. An image is decorative paint, not semantic replacement for content. |
| `background-color` | One color, initially transparent, painted beneath all image layers. It is the reliable fallback when images are absent, transparent, or unavailable. |
| `background-attachment` | Per-layer `scroll` (background is fixed relative to the element’s box and does not move with its scrollable contents), `fixed` (positioned relative to the viewport, subject to transforms and other containing-block effects), or `local` (moves with the element’s scrollable contents). `fixed` has special/limited behavior in some environments, including print and mobile; test it. |
| `background-origin` | Chooses the positioning area: `border-box`, `padding-box` (initial), or `content-box`. It determines the box against which position and size are resolved. |
| `background-clip` | Chooses the painting area: `border-box` (initial), `padding-box`, or `content-box`. It does not change the image’s positioning area. Draft Level 4 adds further values; verify support before using them. |
| `background-position` | Sets each layer’s initial position in its positioning area. One/two-value forms set horizontal/vertical position; edge-offset forms can anchor from right/bottom. Percentages position the corresponding point of the image at the same percentage of the available leftover space: `100%` means the image’s right edge aligns with the area’s right edge, not “move it 100% of its own width.” Negative lengths and percentages are useful and valid. |
| `background-position-x` | Horizontal component of the position list, including horizontal keywords/offset forms and lengths/percentages. Its comma-separated list pairs by layer with other background longhands. |
| `background-position-y` | Vertical component, with the same layer-list behavior. It is not a separate positioning area. |
| `background-size` | Per-layer `auto`, one/two lengths or percentages, `cover`, or `contain`. `cover` preserves aspect ratio while fully covering the positioning area (cropping may occur); `contain` preserves it while fitting the whole image (empty space may remain). A one-value size sets width and leaves height `auto`. Percentages resolve against the positioning area. Intrinsic dimensions/ratio affect `auto` sizing; gradients have no intrinsic size. |
| `background-repeat` | Per-layer repeat mode: `repeat`, `no-repeat`, `space`, `round`, or axis combinations; `repeat-x` and `repeat-y` are shorthand keywords for axis behavior. `space` distributes whole tiles with gaps; `round` adjusts tile size so an integral number fits. Repetition is based on the positioning area and image size, not the visible crop alone. |

`background-origin` and `background-clip` answer different questions: **where is the image positioned/sized?** versus **where is it allowed to paint?** Changing one does not imply changing the other. A common pattern is `background-origin: border-box` with `background-clip: padding-box`, which positions relative to the outer box but hides paint under the border.

### Borders: line, side, and shorthand behavior

#### Core family (30 names)

`border` sets all four sides’ width, style, and color, and also resets the `border-image` family. Side shorthands `border-top`, `border-right`, `border-bottom`, and `border-left` set those three components for one physical side. The order of components is flexible because width, style, and color have distinguishable grammars. Any omitted component resets to its initial value; in particular, `border: 1px solid` resets a previously specified border color to `currentColor` and clears a previously set border image. Put `border` before `border-image` when both are used.

The matching `border-width`, `border-style`, and `border-color` shorthands accept one to four values using the standard top/right/bottom/left expansion: one = all sides; two = vertical/horizontal; three = top/horizontal/bottom; four = clockwise from top. Their side longhands (`border-top-width`, `border-right-width`, `border-bottom-width`, `border-left-width`; likewise `*-style` and `*-color`) address a single physical side.

Widths accept nonnegative lengths or `thin`, `medium`, `thick`; the keyword pixel mapping is implementation-defined, so do not use it for precise geometry. Style values include `none`, `hidden`, `solid`, `dotted`, `dashed`, `double`, `groove`, `ridge`, `inset`, and `outset`. `none` and `hidden` have zero used border width; `hidden` additionally participates in table border conflict resolution as a suppressor. Color defaults to `currentColor`, the element’s current text color, and can be any valid CSS color. A border style of `none` is why setting only `border-width` commonly appears to do nothing.

Classic border properties apply to boxes, but specifications contain applicability exceptions for ruby-related boxes. Physical side names remain top/right/bottom/left regardless of writing mode. Logical border properties are a separate family and should be used when the design means block/inline start/end rather than physical directions.

#### Rounded corners (5 names)

`border-radius` sets top-left, top-right, bottom-right, and bottom-left radii in that order, with the same one-to-four expansion pattern. A slash separates horizontal radii from vertical radii, creating elliptical corners: `border-radius: 24px 8px / 12px 4px`. The four corner longhands (`border-top-left-radius`, `border-top-right-radius`, `border-bottom-right-radius`, `border-bottom-left-radius`) accept one or two nonnegative length/percentage radii. Percentages refer to the corresponding dimensions of the border box (horizontal radius to width, vertical to height).

When requested radii would overlap along an edge, the browser scales them down proportionally until they fit; it does not let adjacent radii cross. Radius changes affect the border contour and interact with background clipping, outlines, shadows, and overflow clipping. `border-radius` does not turn an image into a circle unless the box geometry and clipping make that result; circular avatars generally need a square box and `border-radius: 50%` plus suitable image fitting.

### Border images: slice a source into edge pieces

The six names are `border-image`, `border-image-source`, `border-image-slice`, `border-image-width`, `border-image-outset`, and `border-image-repeat`. Imagine cutting a source image with four lines into a 3×3 grid. The corner pieces map to corners, edge pieces stretch or tile along sides, and the center is discarded unless `fill` is included in `border-image-slice`.

- `border-image-source` is an image or `none`; gradients can be used. If no usable image is available, the ordinary border remains the fallback.
- `border-image-slice` takes one to four numbers or percentages, expanded like other four-side values, and optional `fill`. Numbers are source-image units; percentages are relative to the source image dimensions. The slices define the nine regions; they do not directly set the rendered border thickness.
- `border-image-width` sets the rendered image-edge widths using lengths, percentages, numbers (multipliers of the corresponding border width), or `auto` (derived from slice values). It does not change the layout border widths.
- `border-image-outset` extends the painted border image beyond the border box. It accepts lengths or numbers multiplied by border width; it does not enlarge the layout box.
- `border-image-repeat` controls side and center treatment with `stretch`, `repeat`, `round`, or `space` (horizontal/vertical can differ). `round` scales tiles to fit an integer count; `space` distributes gaps.
- `border-image` is the shorthand for these components. Slash syntax separates slice, width, and outset. Omitted values reset to their initial values, so shorthand use can clear prior longhands.

When a border image is available and applies, it replaces ordinary border-style rendering; when its source is `none` or cannot be displayed, ordinary border styles are used. Keep a visible `border-style`/color fallback so a failed image does not leave an essential edge invisible. Border-image geometry affects painting, not the CSS box dimensions.

### Shadows and newer corner/border shapes

`box-shadow` accepts `none` or a comma-separated list of shadows. Each shadow has horizontal and vertical offsets, optional blur radius, optional spread radius, optional color, and optional `inset`. Blur cannot be negative; spread can be negative. The first listed shadow is painted on top. An inset shadow is drawn inside the box; an outer shadow follows the border contour. Shadows do not affect layout or hit testing, and can be clipped by ancestor overflow. If a shadow seems missing, inspect ancestor clipping and stacking/painting context before changing its geometry. The Level 4 draft decomposes this shorthand into additional `box-shadow-*` longhands; those are outside this frozen inventory.

The inventory’s newer names are `corner-shape`, its 16 physical/logical edge and corner longhands, and `border-shape`. In the current Level 4 draft, `corner-shape` accepts one to four shape values (initial `round`), expanded to the corners like a four-side shorthand. Shape values use a superellipse family: `round` is the ordinary rounded corner; `squircle`, `scoop`, `bevel`, `notch`, and `square` are named choices, with `superellipse(<number>)` for controlled interpolation. A corner shape modifies the curve inside the area defined by `border-radius`; zero radius still gives no corner area to reshape. Physical (`corner-top-left-shape`, `corner-top-right-shape`, `corner-bottom-left-shape`, `corner-bottom-right-shape`) and logical (`corner-start-start-shape`, `corner-start-end-shape`, `corner-end-start-shape`, `corner-end-end-shape`) names target one corner; edge shorthands target both corners on an edge. Their physical/logical mapping follows writing mode and direction. The inventory also includes `corner-top-shape`, `corner-bottom-shape`, `corner-left-shape`, `corner-right-shape`, `corner-inline-start-shape`, `corner-inline-end-shape`, `corner-block-start-shape`, and `corner-block-end-shape` for those paired corners. The exact draft syntax and support can change.

`border-shape` is more experimental: the draft gives it `none` or one/two `<basic-shape>` values, optionally paired with a geometry box. It can define a stroked border path or inner/outer shapes for a filled border region. This is not just a fancier radius: it changes the border contour, with defined interactions for shadows and clipping and draft-specific layout details. Do not assume ordinary border/radius behavior or broad browser support. Consult the corner-shaping and border-shaping sections in [CSS Borders and Box Decorations Level 4](https://drafts.csswg.org/css-borders-4/).

The 16 shape longhands present here are exactly: `corner-top-left-shape`, `corner-top-right-shape`, `corner-bottom-right-shape`, `corner-bottom-left-shape`; `corner-start-start-shape`, `corner-start-end-shape`, `corner-end-start-shape`, `corner-end-end-shape`; `corner-top-shape`, `corner-right-shape`, `corner-bottom-shape`, `corner-left-shape`; `corner-inline-start-shape`, `corner-inline-end-shape`, `corner-block-start-shape`, and `corner-block-end-shape`. The two remaining inventory names in this shape family are the `corner-shape` shorthand and `border-shape`.

## Cross-item comparison

| Need | Prefer | Why / limitation |
| --- | --- | --- |
| Decorative texture or gradient behind content | `background-image` (often via `background`) | Layered paint; no semantic image alternative or intrinsic layout size. |
| Solid fallback behind image layers | `background-color` | Painted underneath every image layer. |
| Position an image relative to padding/content/border area | `background-origin` plus `background-position`/`background-size` | Origin selects the positioning area; clip selects the painting area. |
| Draw an edge that affects box geometry | `border` and side/component longhands | Border width participates in the box model according to `box-sizing`; style must be visible. |
| Rounded rectangular corners | `border-radius` | Well-established; radii are reduced when they would overlap. |
| Image texture around the edge | `border-image-*` | Nine-slice painting; does not set layout size. |
| Soft/decorative halo | `box-shadow` | Paint only; no layout space and may be clipped by ancestors. |
| Non-round corner curves or arbitrary edge contour | `corner-shape` / `border-shape` | Level 4 draft; compatibility and syntax maturity require checking. |

## Examples

The examples above illustrate image-layer order and background shorthand; these families work together but remain independent controls. A background shorthand can reset its own layers, while border, radius, image-border, and shadow declarations affect edge painting. Use the right-hand columns in the comparison table to choose which mechanism controls the visible behavior.

## Common mistakes

1. **Expecting `background-size` to size the element.** It sizes the background image, not the box.
2. **Reversing layer priority.** The first listed image is closest to the viewer.
3. **Confusing origin and clip.** Positioning area and painting area are independent controls.
4. **Using a shorthand without noticing resets.** `background` and `border-image` reset omitted components; `border` also resets the entire `border-image` effect.
5. **Thinking `background-position: 100%` means shift by one image width.** It aligns the image’s far edge with the area’s far edge.
6. **Setting width but no border style.** Initial style is `none`, so no visible border is painted.
7. **Expecting border images or shadows to reserve room.** They paint outside/over the box; layout size is not increased.
8. **Treating Baseline or an index entry as a promise for every browser.** Check the actual engines and versions used by the product, especially for Level 4 shapes.

## Worked checks

**Why does the background show through a rounded corner?** With the initial `background-clip: border-box`, background paint may extend under a transparent border. Set `background-clip: padding-box` when paint must stop at the padding edge; remember this is separate from the radius that shapes the contour.

**Why did a gradient disappear after adding a color?** A later `background: #fff` shorthand resets `background-image` to `none`. Use `background-color: #fff` if only the color should change.

**How do you create an image with a centered crop?** Give the box explicit dimensions, then use `background-image`, `background-position: center`, `background-size: cover`, and an appropriate fallback color. This preserves image ratio while allowing crop; choose an `<img>` with `object-fit: cover` when the image is meaningful content.

**How do you separate a decorative glow from the border?** Use `box-shadow`, optionally multiple layers. It will not affect layout; test whether any ancestor clips it.

**How can a border-image center tile?** Include `fill` in `border-image-slice` to paint the center, then configure `border-image-repeat`. Without `fill`, the center is not painted.

## Knowledge checks with answers

1. In `background: url(a), url(b), black`, which image is topmost? **`a`; first layer is on top.**
2. Which property chooses the image positioning box and which chooses where it paints? **`background-origin` chooses positioning; `background-clip` chooses painting.**
3. Why can `border-width: 4px` render no border? **The initial border style is `none`; specify a visible style.**
4. What does `border-image-width` change? **Image-edge painting width, not the layout border width.**
5. Do shadows reserve space? **No; they are paint and can be clipped by ancestors.**
6. What should you verify before relying on `corner-shape` or `border-shape`? **Current specification syntax and target-browser implementation, because these are Level 4 draft features.**

## Source map

- [CSS Backgrounds and Borders Level 3](https://drafts.csswg.org/css-backgrounds-3/): background painting order, layer model and longhands; border-image; radius and shadow behavior.
- [CSS Backgrounds Level 4](https://drafts.csswg.org/css-backgrounds-4/): draft additions beyond this frozen inventory, including extra position/repeat longhands and clip values.
- [CSS Borders and Box Decorations Level 4](https://drafts.csswg.org/css-borders-4/): current draft syntax for corner-shape and border-shape and their rendering interactions.
- [CSS Snapshot 2026](https://www.w3.org/TR/css-2026/): status overview; it does not establish browser support.
