<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Shapes properties

# Scope and version

This reference audits all three supplied properties: `shape-outside`, `shape-image-threshold`, and `shape-margin`. The current CSS Shapes Module Level 1 Editor’s Draft is dated 16 November 2026 and remains work in progress. Its latest published snapshot is the 12 June 2025 Candidate Recommendation Draft. MDN reports the three properties as Baseline Widely available since January 2020, but separately warns that some `shape-outside` parts vary in support. Do not infer support for each shape function or shape-box from the property-level Baseline label.

The current Editor’s Draft differs from the published 2025 snapshot in at least two explicit ways: it adds `half-border-box` as a shape box and defines shape-box contours using the border contour path, which includes the current corner-shape model. It also states that `shape-outside` applies to initial-letter boxes as well as floats; MDN’s current formal applicability summary lists floats. Treat these newer draft details as version-sensitive and check the target engine. The current Level 1 draft includes `shape()` and `path()` among its basic shapes; do not confuse presence in a grammar with universal implementation.

# How this group fits the mental model

CSS Shapes changes a float’s **float area**—the exclusion region that inline text must flow around. The float still determines its position and occupies its normal float layout box. The shape does not clip or mask the pixels painted by the float, and it does not cause content to wrap inside the float’s shape. If the shape is smaller than the visible image, text may occupy part of the float’s box and overlap visible artwork. Use `clip-path` or masking for paint clipping; use float layout and `shape-outside` for text wrapping.

The three properties form one sequence: `shape-outside` selects a geometric or image-derived contour; `shape-image-threshold` selects which alpha pixels form that contour when the value is an image; `shape-margin` expands the resulting contour outward before the float area is used. For floats, a final limit matters: the shape is clipped to the float’s margin box, so `shape-margin` alone cannot expand the float area past that box. Adjust the float’s actual margin when more space is required.

# Supplied names explained

## `shape-outside`

**Purpose and grammar.** Defines the float-area contour used for wrapping. Current grammar: `none | [ <basic-shape> || <shape-box> ] | <image>` (plus CSS-wide keywords). Initial value `none`; non-inherited. The current Editor’s Draft applies it to floats and initial-letter boxes; the commonly documented, well-established case is floats. Its computed value follows the basic-shape and optional shape-box rules, resolves an image as an image value, or preserves the keyword. Basic shapes can animate according to their shape interpolation rules; other forms animate discretely.

### Basic-shape forms

The current `<basic-shape>` set is:

- Rectangle-like: `inset()`, `rect()`, and `xywh()`; `inset()` can take one to four insets and optional rounded corners, `rect()` accepts edge coordinates or `auto`, and `xywh()` defines x/y offsets and width/height.
- Curved: `circle()` and `ellipse()`, with an optional radial size and `at <position>`.
- Point list or path: `polygon()` with optional fill rule and rounded corners; `path()` with an optional fill rule and an SVG path-data string; `shape()` with an optional fill rule, starting `<position>`, and shape commands.

Shape coordinates originate at the reference box’s top-left, with x increasing rightward and y downward. Percentages in a basic shape resolve against the used dimensions of that reference box. If `<shape-box>` is omitted after a basic shape, the reference box defaults to `margin-box`. A supplied shape box determines the reference geometry for that shape.

The current `<shape-box>` set is `<visual-box> | margin-box | half-border-box`. The visual-box values are `content-box`, `padding-box`, and `border-box`. A shape-box by itself creates a contour from that box; the current draft defines these contours through the element’s border contour path, so border radii and `corner-shape` can affect it. `half-border-box` is halfway between border-box and padding-box. The `half-border-box` and updated contour definition are newer Editor’s Draft material than the June 2025 published snapshot.

### Image forms and fallback

The `<image>` branch accepts CSS image values, not only a literal `url()`: examples include URL images, gradients, image functions, image sets, cross-fades, and element images as defined by CSS Images. The shape is derived from the image alpha channel using `shape-image-threshold`. The browser fetches URL resources using anonymous CORS mode; if fetching fails and no valid fallback image is available, the shape behaves as `none`. An opaque image typically yields a rectangular contour unless its alpha data or another applicable image behavior changes it.

`none` leaves the float area unaffected by a custom shape. A missing or invalid external image is not a substitute for a deliberate fallback declaration; write a simpler prior declaration when a specific fallback contour is needed.

## `shape-image-threshold`

**Purpose and grammar.** Sets the alpha cutoff used when `shape-outside` derives a shape from an image. Grammar: `<opacity-value>` (number or percentage; plus CSS-wide keywords). Initial value `0`; applies to floats; not inherited; computed numeric value is clamped to `[0, 1]`; animates by computed value.

A pixel belongs to the extracted shape when its alpha is **greater than** the threshold. Thus `0.5` (or `50%`) includes pixels more than half opaque; `0` excludes fully transparent pixels but includes any pixel with alpha above zero; `1` includes no pixel because no alpha can be greater than one. This property reads alpha, not visible color or luminance, and has no effect when `shape-outside` uses a basic shape or shape-box instead of an image. It does not change the image’s opacity or the rendered pixels.

## `shape-margin`

**Purpose and grammar.** Expands a shape outward before calculating the float area. Grammar: `<length-percentage [0,∞]>` (plus CSS-wide keywords); initial `0`; applies to floats and, in the current Editor’s Draft, initial-letter boxes; not inherited. Percentages are relative to the containing block’s **inline size**, not to the float or source image dimensions. The computed value is a computed length-percentage and the property animates by computed value.

Expansion is a geometric offset from the shape. At smooth edges it extends in the outward perpendicular direction; at sharp points or line ends, the shape expands around the point. Only non-negative lengths and percentages are valid. The resulting shape is clipped to the float’s margin box, so increasing `shape-margin` may have no effect at an edge already touching that limit. Add physical/flow-relative margin to the float when extra exterior space is needed.

# Cross-item comparison

| Decision | Property | Reference/input | Common confusion |
| --- | --- | --- | --- |
| What contour controls text exclusion? | `shape-outside` | Basic shape, shape-box, or CSS image | It changes the float area, not paint clipping or float placement. |
| Which image pixels define that contour? | `shape-image-threshold` | Alpha channel of the selected image | It does not inspect luminance or change image opacity. |
| How far outside the contour should text stay? | `shape-margin` | Non-negative length or percentage of containing-block inline size | It is clipped at the float margin box. |

The normal float has its own box-based wrapping behavior. `shape-outside: margin-box` can make the box-based contour explicitly follow rounded corners, while a basic shape can be smaller, larger before clipping, or otherwise non-rectangular within the margin-box limit. `clip-path` controls which pixels paint; `shape-outside` controls where adjacent inline text can flow. These can be used together, but their geometries are separate and should be kept deliberately aligned.

# Examples

```css
.profile-photo {
  float: left;
  inline-size: 12rem;
  block-size: 12rem;
  margin: 0 1.25rem 1rem 0;
  border-radius: 50%;
  object-fit: cover;

  /* Shape and visible crop are separate; this defines only text wrapping. */
  shape-outside: circle(50% at 50% 50%);
  shape-margin: 0.75rem;
}

.alpha-art {
  float: right;
  inline-size: 14rem;
  block-size: 11rem;
  margin-inline-start: 1rem;
  background: url("/images/irregular-mark.png") center / contain no-repeat;
  shape-outside: url("/images/irregular-mark.png");
  shape-image-threshold: 0.25;
  shape-margin: 0.5rem;
}

.ribbon-float {
  float: left;
  inline-size: 10rem;
  block-size: 8rem;
  shape-outside: polygon(0 0, 100% 0, 55% 50%, 100% 100%, 0 100%);
}
```

Ensure the text flow remains readable when the float is removed, the window is narrow, fonts differ, or the image fails to load. With an alpha-derived image shape, verify the threshold against the actual asset and confirm CORS works in production. Compare the wrapping contour with the visible artwork: shape-outside does not trim the image’s transparent padding or crop the paint itself.

# Common mistakes

- Expecting `shape-outside` to affect an ordinary non-floated block as a general layout shape. Level 1 is principally float-based; the current draft additionally identifies initial-letter boxes.
- Expecting text to wrap inside the shape. The shape is the float’s exclusion contour; inline text remains outside it.
- Confusing wrapping geometry with `clip-path`, `mask`, `border-radius`, or `object-fit`. Those affect painting, clipping, or replaced content, not the float exclusion area.
- Forgetting that the default reference box for a basic shape without `<shape-box>` is `margin-box`.
- Assuming a basic shape’s percentages refer to the content box in all cases. They use the chosen reference box, which defaults to margin-box here.
- Assuming `shape-image-threshold` means “50% visible color.” It tests image alpha strictly greater than the cutoff; it does not use luminance.
- Setting `shape-image-threshold` with a basic shape and expecting the contour to change. It only applies to image-derived shapes.
- Assuming `shape-margin` can extend a float’s exclusion region beyond its margin box. The constructed float shape is clipped to that limit.
- Using a negative `shape-margin` to pull text closer; the grammar permits only non-negative values.
- Assuming percentage `shape-margin` is relative to the float or image. It is relative to the containing block’s inline size.
- Ignoring CORS on cross-origin image URLs and then debugging a missing shape as though the geometry were wrong.
- Treating Baseline support for the property as proof that newer `shape()` syntax, `half-border-box`, initial-letter applicability, or every image function is equally supported.
- Treating `shape-inside` as part of this Level 1 inventory. The current module does not define that property.

# Knowledge checks with answers

1. **What must an element be for the common Level 1 `shape-outside` use?** It must be a float; the current Editor’s Draft also lists initial-letter boxes. Test the latter separately because browser references still commonly list floats only.
2. **If the image is fully opaque, what does `shape-image-threshold: 0.5` usually produce?** The alpha-derived contour includes the opaque pixels and is usually rectangular; thresholding does not trace visible color edges.
3. **Which reference box does `circle(50%)` use when no shape box follows it?** `margin-box`.
4. **Does `shape-outside: polygon(...)` clip the float’s image to the polygon?** No. It changes the float area for text wrapping. Use `clip-path` or masking for paint clipping.
5. **Why might `shape-margin: 30px` fail to create 30px more space at one edge?** The expanded shape is clipped to the float’s margin box; add margin to the float if its exterior area must grow.
6. **What is the threshold test for a pixel with alpha 0.25 at a threshold of 25%?** It is not included, because the pixel’s alpha must be strictly greater than the threshold.
7. **What changed in the current Editor’s Draft after the June 2025 published CRD?** It added `half-border-box` and changed shape-box contour definition to use border-contour paths; the lesson labels these as newer draft details.

# Sources

- [CSS Shapes Module Level 1 Editor’s Draft](https://drafts.csswg.org/css-shapes-1/) — 16 November 2026 work in progress; property grammar and behavior, basic shapes, image-derived shapes, shape-boxes, margin clipping, and recent changes.
- [CSS Shapes Module Level 1 Candidate Recommendation Draft](https://www.w3.org/TR/2025/CRD-css-shapes-1-20250612/) — 12 June 2025 published snapshot for comparison with current Editor’s Draft additions.
- [MDN: `shape-outside`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/shape-outside), [MDN: `shape-image-threshold`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/shape-image-threshold), and [MDN: `shape-margin`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/shape-margin) — property summaries, syntax, and compatibility entry points.
- [CSS Box Model Module Level 4 Editor’s Draft](https://drafts.csswg.org/css-box-4/) — box and visual-box terminology.
- [CSS Borders Module Level 4 Editor’s Draft](https://drafts.csswg.org/css-borders-4/) — border contour paths, border radii, and corner shapes used by the latest shape-box definition.
- [CSS Images Module Level 4 Editor’s Draft](https://drafts.csswg.org/css-images-4/) — image values and image functions accepted by `shape-outside`.
- [CSS Color Module Level 4 Editor’s Draft](https://drafts.csswg.org/css-color-4/) — opacity-value grammar used by `shape-image-threshold`.
- [CSS Values and Units Module Level 4 Editor’s Draft](https://drafts.csswg.org/css-values-4/) — length-percentage and percentage value types.
