
# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Images properties

# Scope and version

This reference audits the four supplied properties: `image-orientation`, `image-rendering`, `object-fit`, and `object-position`. The stable specification foundation is CSS Images Module Level 3; the current Level 4 Editor’s Draft extends the module and updates `object-fit`. Both live editor’s drafts can change. The Level 3 draft marks `image-orientation` at risk and says the property is optional to implement. That standards status is distinct from browser support: verify the browsers and media that the project actually targets. The CSS Snapshot describes standards maturity, not whether a particular browser implements a value.

The inventory deliberately does not include all CSS image features. Gradients and image functions such as `image-set()` are image values; `background-size` and `background-position` belong to CSS Backgrounds and Borders; draft properties `image-resolution` and `object-view-box` are covered in the separate experimental CSS Images inventory. `object-fit` and `object-position` deal with a replaced element’s content; they do not configure a CSS background.

# How this group fits the mental model

Think of an image in four stages. First, an image resource may carry orientation metadata. Second, the browser determines the image’s natural dimensions and the element’s layout box. Third, `object-fit` chooses the concrete size of replaced content in that box and `object-position` places it. Finally, when raster pixels must be resampled, `image-rendering` gives the browser a quality hint. These steps answer different questions: correcting orientation does not choose a crop; fitting does not promise a particular interpolation filter; placement does not resize the element’s CSS box.

These properties affect presentation. They do not add alternative text, change the source URL, guarantee image loading, or make a decorative image meaningful to assistive technology. For informative `<img>` content, HTML `alt` remains the semantic text alternative. A CSS background has no HTML `alt` attribute.

# Supplied names explained

## `image-orientation`

**Role and applicability.** This property applies an orthogonal rotation to images before document layout and painting use them. It reaches content images (including replaced and generated content), image sources referenced through SVG, and decorative CSS images such as backgrounds. It does not rotate a browser’s toolbar favicon or other images rendered outside the document. It is inherited, and the Level 3 property definition says it applies to all elements.

**Values and behavior.** The grammar is `from-image | none | <angle> || flip` (plus CSS-wide keywords). The initial value is `from-image`. `from-image` uses orientation metadata such as EXIF when permitted by the image metadata rules; with no usable orientation metadata it behaves as `none`. `none` keeps the encoded orientation without an additional correction. With an angle, positive values rotate clockwise and negative values counterclockwise. Angles are normalized to a quarter turn; if the optional `flip` component is present, the image is flipped horizontally after rotation. The computed angle is rounded to the nearest quarter turn and normalized into one turn.

The image is treated by later layout and rendering as if it had originally been encoded in the corrected orientation. Consequently, natural width and height, the axes to which width and height apply, and such image-relative details as cursor hotspots are based on the rotated image. Other transformations are applied after this orientation correction.

**Status and safe use.** In CSS Images 3, the property is explicitly optional to implement and is listed at risk. Values other than `none` and `from-image` are deprecated and optional to implement except for print-conforming implementations. The spec says the property is intended to correct incorrectly oriented images, not to provide arbitrary rotations or layout flips; use `transform` for visual design transformations. Avoid overriding metadata orientation merely to make one asset look right without checking the source file and all display contexts.

## `image-rendering`

**Role and applicability.** This inherited property hints which visual qualities matter when an image is scaled. It applies to all elements; when set on an element it influences images supplied through that element’s image-valued properties, including backgrounds, list markers, and image content that must be scaled. It does not select the image’s dimensions or crop.

**Values.** The CSS Images 3 grammar is `auto | smooth | high-quality | pixelated | crisp-edges` (plus CSS-wide keywords). The initial value is `auto`; the computed value is the specified keyword. Rendering algorithms remain largely user-agent choices, so a keyword does not promise identical output across engines or devices.

- `auto` leaves the scaling algorithm to the user agent.
- `smooth` asks for scaling that maximizes the image’s appearance; smoothing color transitions, such as bilinear interpolation, is acceptable. It is intended for photographs and similar continuous-tone images.
- `high-quality` has the behavior of `smooth` with a preference for higher-quality scaling. It is a relative resource-allocation hint: under resource pressure, the browser should prioritize these images over other values, but it may still degrade quality. If every image is marked high-quality, there is no relative priority. Reserve it for important imagery and do not treat it as a guaranteed enhancement.
- `pixelated` tries to preserve source pixelation while allowing some smoothing to avoid distortion at non-integer scale ratios. Conceptually, per axis, the image is first scaled by nearest-neighbor to the closest positive integer multiple of its natural size, then smoothly scaled the remaining distance. At integral multiples this matches `crisp-edges`; at other ratios it often makes pixel art look more even, with some smoothing and a two-step rendering cost.
- `crisp-edges` aims to preserve contrast and edges without smoothing or blur. Nearest-neighbor scaling is permitted, but the specification does not require one exact algorithm. It suits pixel art or hard-edged line art when uneven pixel widths at fractional scaling are acceptable.

The former values `optimizeSpeed` and `optimizeQuality` are deprecated but remain valid for compatibility: the spec requires them to behave like `crisp-edges` and `smooth`, respectively. Do not author them in new CSS.

## `object-fit`

**Role and applicability.** `object-fit` controls how the content of a replaced element is sized inside its already-laid-out content box. It applies to replaced elements such as `<img>` and `<video>`, is not inherited, and has initial value `fill`. It does not set the element’s width or height, and it does not size a CSS background; use `background-size` for that separate job.

The current CSS Images 4 Editor’s Draft grammar is `fill | none | [ contain | cover ] || scale-down` (plus CSS-wide keywords). The `||` means that `scale-down` may be combined with `contain` or `cover`; this was added in Level 4. Because this is a developing draft, check implementation support before relying on combined syntax. Familiar single-keyword values remain the broadly established forms.

- `fill` sizes the object to the content box in both dimensions. It may distort the object’s natural aspect ratio.
- `contain` preserves the object’s ratio and scales it so the whole object fits inside the content box. If the ratios differ, unused space remains on one axis.
- `cover` preserves the ratio and scales until the content box is covered. If ratios differ, part of the object lies outside the box and is clipped from view.
- `none` uses the object’s default sizing behavior without a fit constraint from the box. This is not always simply “use intrinsic pixel dimensions”: intrinsic dimensions, intrinsic ratio, default object size, and formats such as SVG participate in the replaced-element sizing rules.
- `scale-down` selects the smaller rendered result between the `none` and `contain` sizing paths. In Level 4 it can also be paired with `cover`, choosing between the none-sized object and the cover-sized object. With `scale-down` alone, the result corresponds to the contain-style scale-down choice.

The object is clipped to the element’s content box; `object-fit` does not enlarge the element to expose overflow. For SVG used as an image, fitting sizes the external object/viewport; SVG’s own `preserveAspectRatio` can separately control how SVG drawing fits inside its internal viewport.

## `object-position`

**Role and applicability.** This property positions the object within the replaced element’s content box when the object’s concrete size does not match that box. It applies to replaced elements, is not inherited, and starts at `50% 50%` (centered). A `<position>` may use horizontal and vertical keywords, percentages, lengths, or edge-offset forms such as `right 12px bottom 8px`; CSS Values defines the shared position grammar. One-value forms have the grammar’s axis-dependent interpretation, so use two explicit components when the intended axes should be immediately clear.

Percentages are not a percentage of the source image’s pixel dimensions. On each axis, the percentage aligns the same percentage point in the object with the same percentage point in the content box. Equivalently, the position offset is the percentage times the difference between the box size and the object size. For example, `100%` aligns the object’s right/bottom edge with the corresponding box edge; when an object is larger than the box, that alignment moves the far edge into view. Negative and greater-than-100% positions can deliberately move the object past an edge.

With `object-fit: cover`, position determines which part of the oversized object is visible, so it is useful for choosing a subject’s focal point. With `contain`, it chooses where the remaining empty area sits. It does not change the crop semantics of the source or affect a CSS background; `background-position` handles backgrounds.

# Cross-item comparison

| Need | Property | What it changes | Common counterpart or distinction |
| --- | --- | --- | --- |
| Correct image metadata orientation | `image-orientation` | Orientation of the image before normal layout/painting | Use `transform` for arbitrary design rotation; do not mistake page/print layout rotation for image orientation. |
| Choose resampling preference | `image-rendering` | Hint for algorithm/quality when an image is scaled | No exact filter is guaranteed; does not define fit or crop. |
| Choose object’s size in a replaced-element box | `object-fit` | Concrete object size relative to the content box | `background-size` sizes a background image instead. |
| Choose object’s alignment within that box | `object-position` | Placement of the object and resulting visible crop/empty space | `background-position` positions background layers instead. |

The common `cover` recipe is a fixed aspect-ratio frame with `object-fit: cover`; adding `object-position` selects the crop. Use `contain` when seeing the complete object matters more than filling the frame. Use `fill` only when distortion is acceptable or intended. CSS `aspect-ratio`, width, and height shape the element’s box; they do not replace the fit decision for the object inside it.

# Examples

```css
/* Product-card thumbnail: stable box, preserved ratio, subject-centered crop. */
.product-card__image {
  display: block;
  inline-size: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  object-position: 50% 35%;
}

/* Logo: show the complete image without stretching it. */
.brand-mark {
  inline-size: 12rem;
  block-size: 4rem;
  object-fit: contain;
  object-position: left center;
}

/* Pixel-art asset: preserve hard edges; fractional sizing can still look uneven. */
.pixel-art {
  image-rendering: crisp-edges;
}

/* A photo with embedded camera orientation should normally use the metadata. */
img {
  image-orientation: from-image;
}
```

Try the same portrait with `cover` and with `contain`: the first fills the frame but clips; the second preserves the whole portrait but leaves space if the ratios differ. Then vary only `object-position` to see that the element’s box stays the same while the visible part changes. For scaled pixel art, compare `pixelated` with `crisp-edges` at both integer and fractional scale factors. Inspect actual target browsers; the rendering hint is not a pixel-perfect cross-engine contract.

# Common mistakes

- Expecting `object-fit` or `object-position` to act on a CSS `background-image`; use `background-size` and `background-position` for backgrounds.
- Assuming `cover` resizes the element itself. It sizes the object within the box established by layout and clips what does not fit.
- Assuming `contain` fills the box or `fill` preserves aspect ratio. The former can leave space; the latter can distort.
- Saying `object-position: 50%` means half of the source image’s intrinsic width. It aligns percentage points across the difference between object and box sizes.
- Treating `image-rendering` as a guaranteed named interpolation filter. It is a hint, and several values intentionally leave the algorithm UA-defined.
- Expecting `crisp-edges` and `pixelated` to be interchangeable at every scale. They agree at integer scale multiples but can differ at fractional ones.
- Using `image-orientation` as a general-purpose transform or ignoring the fact that corrected orientation affects the dimensions used by layout.
- Assuming image orientation metadata changes the file or source bytes. CSS changes document rendering; it does not rewrite the asset.
- Treating `object-position` as a substitute for a good source crop, responsive art direction, or meaningful alternative text.
- Treating the editor’s draft grammar or an MDN Baseline label as a guarantee that every value is implemented consistently in every target browser.

# Knowledge checks with answers

1. **A thumbnail must fill a 4:3 frame without distortion and keep a person’s face visible. What controls each decision?** Set the frame’s dimensions/aspect ratio in layout, use `object-fit: cover` to fill with proportional scaling, and choose a focal alignment with `object-position`.
2. **Why might 50% object positioning appear different after switching from contain to cover?** The object’s concrete size changes, which changes the free-space difference used for percentage alignment; with `cover`, part of the object is clipped.
3. **Does `image-rendering: high-quality` force a specific filter?** No. It expresses a relative preference for quality/resource allocation and remains subject to the user agent and resource constraints.
4. **When should `pixelated` be preferred over `crisp-edges`?** When a pixel-art source may be shown at non-integer scale and the more even, slightly smoothed two-stage result is preferable; test because this tradeoff is visual.
5. **What does `image-orientation: from-image` do when no orientation metadata is available?** It behaves as `none`, so no extra rotation is applied.
6. **Which property changes the image box’s width?** None of these. Layout properties size the element; `object-fit` determines how replaced content fits inside the resulting box.

# Sources

- [CSS Images Module Level 3 Editor’s Draft](https://drafts.csswg.org/css-images-3/) — `image-orientation`, `image-rendering`, object sizing and positioning; work in progress.
- [CSS Images Module Level 4 Editor’s Draft](https://drafts.csswg.org/css-images-4/) — current `object-fit` grammar and Level 4 delta; work in progress.
- [CSS Values and Units Module Level 4 Editor’s Draft](https://drafts.csswg.org/css-values-4/) — shared `<position>` grammar; work in progress.
- [MDN: `image-orientation`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/image-orientation), [MDN: `image-rendering`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/image-rendering), [MDN: `object-fit`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit), and [MDN: `object-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-position) — explanatory cross-checks and compatibility entry points.
