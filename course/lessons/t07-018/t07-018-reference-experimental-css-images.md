
# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS image-resolution and object-view-box properties

# Scope and version

This reference covers the two inventoried properties, `image-resolution` and `object-view-box`. Their names sound similar, but one controls the preferred pixel density used to interpret raster-image dimensions while the other selects a rectangular subview of a replaced element’s contents. They are separate, experimental-stage features, not alternatives to `object-fit`, `object-position`, `image-set()`, or responsive image markup.

The current CSS Images Level 4 Editor’s Draft is dated 3 November 2026; its latest published W3C Working Draft is dated 30 September 2025. `image-resolution` is defined there, but MDN’s current compatibility data says no browsers support it and labels it experimental. `object-view-box` is defined in the current CSS Images Level 5 Editor’s Draft, dated 23 October 2026; CSS Images Level 5 has no published W3C draft yet (the `/TR/` URL is not a publication). MDN marks `object-view-box` Limited availability. Neither property is a safe cross-browser dependency without verification. Use `image-set()`/responsive image sources for density selection, and `object-fit`/`object-position`, clipping, or a preprocessed crop for broadly supported image presentation.

# How this group fits the mental model

A raster file has pixel dimensions. CSS must interpret those image pixels as a natural size in CSS units; the image’s intrinsic resolution can affect that mapping. `image-resolution` can request the resolution used for that interpretation and optionally align mapping to device pixels. It affects raster images painted by content or decoration; it does not increase image detail or create a higher-resolution source.

A replaced element such as `<img>` or `<video>` has a box allocated by layout and content with natural dimensions/aspect ratio. `object-view-box` defines which rectangular region of the content acts as the object’s view. Conceptually, it selects the source window before the usual replaced-content fitting/positioning rules place that view inside the element’s allocated box. It can crop, zoom, or pan while the element’s outer layout box remains in place. It is not a CSS overflow clip on arbitrary HTML children.

# Supplied names explained

## `image-resolution`

**Grammar:** `[ from-image || <resolution> ] && snap?`, plus CSS-wide keywords. `||` means the listed components can appear in either order; `&&` means the resolution/from-image combination and optional `snap` may occur in any order subject to the grammar. **Initial:** `1dppx` (one image pixel per CSS pixel). **Applies:** all elements. **Inherited:** yes. **Computed value:** the specified keyword(s) and/or resolution, possibly adjusted for `snap`. **Animation:** discrete.

### `<resolution>`

A `<resolution>` such as `96dpi`, `300dpi`, `2dppx`, or `40dpcm` explicitly gives the preferred number of image pixels per physical/CSS length unit. A dot here is an image pixel. Changing it can change the image’s natural CSS dimensions; it does not change the element’s CSS `width`/`height` declarations or resample the source into new detail. When the same raster is displayed at a chosen CSS size, the browser still scales the pixels to paint it.

### `from-image`

Uses the natural resolution declared by the image format, when the format supplies it. If there is no usable image resolution, a separate explicit `<resolution>` in the same declaration is the fallback; otherwise the fallback is `1dppx`. For example, `image-resolution: from-image 300dpi` means use embedded resolution when present, else `300dpi`. The order `300dpi from-image` is also valid.

### `snap`

Rounds the specified or image-provided resolution to the nearest resolution that maps one image pixel to an integer number of device pixels. For example, `image-resolution: 300dpi snap` can adjust the requested density so each source pixel maps to an integral device-pixel count. When paired with `from-image`, the natural resolution is similarly adjusted. It is not a general “make image sharp” filter and cannot recover detail absent from the file.

### Affected images and limits

The property’s definition covers raster images used as replaced/content images, generated content, SVG filter image inputs, CSS backgrounds, and other decorative image values. Since it is inherited, a declaration can affect raster images on descendants as well. Vector images such as SVG do not have a natural raster resolution in this sense, so this property has no effect on them. The current draft raises an unresolved interaction with `image-set()`, which can itself determine the natural resolution of the selected image candidate; do not assume the two mechanisms combine identically across engines. In practice `image-set()` or HTML `srcset`/`sizes` is the interoperable mechanism for selecting appropriately dense assets, whereas this property is currently unsupported by browsers according to MDN.

## `object-view-box`

**Grammar:** `none | <basic-shape-rect>`, plus CSS-wide keywords. `<basic-shape-rect>` is `inset() | rect() | xywh()`. **Initial:** `none`. **Applies to:** replaced elements. **Inherited:** no. **Computed value:** specified keyword or computed shape function. **Animation:** interpolates as a basic shape when possible; otherwise discrete.

### `none`

The element has no additional CSS view box. This is the initial value and preserves the replaced element’s normal intrinsic sizing/fitting behavior.

### `<basic-shape-rect>` and coordinates

The shape resolves against a reference box formed from the replaced element’s natural width and height. The resulting rectangle becomes the view box. For purposes of natural size/aspect ratio, the element is treated as having the view box’s width and height/aspect ratio; `object-fit` and `object-position` then operate on that view box. The visible content is scaled/translated to preserve its relationship to the resulting view, and the view is presented in the outer box the layout already reserved. Thus a box crop can cause zoom without moving the image’s element in surrounding layout.

The functions are related but use different ways to specify rectangle edges:

- **`inset(<length-percentage>{1,4} [round <border-radius>]?)`** takes one to four inward offsets from the reference box edges using the same top/right/bottom/left expansion rules as the `inset()` basic shape. `round` optionally rounds the view-box corners. A rounded view-box edge clips the selected content to that rounded rectangle.
- **`rect(<top>, <right>, <bottom>, <left>)`** supplies four edge coordinates in top/right/bottom/left order. These are edge distances/coordinates in the basic-shape coordinate model, not x/y/width/height. Do not transpose them into `xywh()` order.
- **`xywh(<length-percentage>{2} <length-percentage [0,∞]>{2} [round <border-radius>]?)`** supplies x, y, width, and height in that order; widths and heights are nonnegative. The first two coordinates identify the view-box origin and the last two its dimensions. `round` is optional.

The resolved shape must define a useful rectangle. Zero-area/invalid view-box behavior is an edge case whose precise handling remains under discussion in the Level 5 draft. If the element lacks natural width or height, the shape has no effect and behaves like `none`. Built-in view-box behavior in formats such as SVG is not replaced; where the element has its own intrinsic view box, this CSS view-box applies on top of the content’s normal intrinsic sizing unless another specification says otherwise.

### Cropping, zooming, panning, and interaction with other properties

If the view-box dimensions match the intrinsic dimensions, the content can appear at its natural scale in the element’s available box (subject to normal fitting). A smaller view box selects less source content; fitting that smaller region into the same outer element appears zoomed in. A larger view box appears zoomed out. Changing x/y while keeping w/h fixed pans the source window. `object-fit` chooses how the view box’s intrinsic-size representation fits the replaced element’s content box; `object-position` positions that fitted view. These operations can be composed, so do not assume `object-view-box` replaces `object-fit` or `object-position`.

The shape is animatable when the two values are compatible basic shapes; otherwise animation is discrete. A `xywh()` animation with fixed width/height and moving x/y can pan. Keep image alt text meaningful: cropping changes presentation but does not change accessible image semantics. Avoid using an animated crop as the only way to reveal important content.

# Cross-item comparison

| Need | Appropriate mechanism | Difference from these properties |
| --- | --- | --- |
| Pick a high-density file for a device | HTML `srcset`/`sizes`, or CSS `image-set()` | Chooses a source candidate; `image-resolution` changes preferred density interpretation of the chosen raster and is unsupported in current browsers. |
| Crop/fit an image into a box | `object-fit` and `object-position` | Controls fitting/positioning within the box; broadly supported. `object-view-box` adds a source subview before those rules. |
| Clip arbitrary HTML to a shape | `clip-path` / overflow | Clips painted content or descendants; `object-view-box` applies to replaced-element content and alters its intrinsic view. |
| Display a separate pre-cropped asset | `<img>` with a crop generated upstream | Broadly reliable but duplicates assets; unlike `object-view-box`, does not calculate the crop in CSS. |
| Improve low-resolution source quality | Provide a higher-resolution image candidate | Neither property creates new source detail. |

# Examples

## Request embedded resolution with a fallback (experimental)

```css
/* This property currently has no browser support according to MDN. */
.print-art {
  image-resolution: from-image 300dpi;
}

@media print {
  .print-art {
    image-resolution: 300dpi snap;
  }
}
```

The first rule uses the file’s density when present and otherwise requests 300dpi. `snap` adjusts resolution to an integral image-pixel/device-pixel mapping. Provide appropriate high-density image assets as the real-world fallback; the declaration alone cannot add detail or guarantee a print result.

## Crop and zoom a replaced image with `xywh()`

```html
<img class="portrait" src="portrait.jpg" alt="A person standing beside a flowering tree">
```

```css
.portrait {
  inline-size: 18rem;
  block-size: 18rem;
  object-view-box: xywh(120px 40px 360px 360px);
  object-fit: cover;
  object-position: center;
}
```

The property selects the source rectangle; `object-fit` and `object-position` then fit/position that view inside the allocated square. Unsupported browsers ignore the unknown property and show the ordinary image, so ensure that default crop is still acceptable or supply a separate cropped asset. This feature has limited availability.

## Use `inset()` and rounded source-view corners

```css
.thumbnail {
  object-view-box: inset(10% 18% 10% 18% round 1rem);
}
```

This insets the four sides of the natural-size reference box and rounds the view-box corners. Test against the actual natural image dimensions and browser implementation; do not expect an identical crop if engines differ in support.

# Common mistakes

- Assuming `image-resolution` is implemented because the syntax is in CSS Images Level 4; MDN currently reports no browser support.
- Using `image-resolution` as if it selected a high-density candidate or increased image detail.
- Forgetting that `image-resolution` is inherited and can affect descendant raster backgrounds/content images.
- Expecting `image-resolution` to do anything to vector images such as SVG.
- Assuming `image-set()` and `image-resolution` interactions are settled; the current draft explicitly calls out the question.
- Treating `object-view-box` as an element box crop or a general `clip-path` replacement; it applies to replaced-element content.
- Mixing `rect(top right bottom left)` with `xywh(x y width height)` coordinate order.
- Forgetting that `object-view-box` changes the intrinsic view dimensions/aspect ratio that `object-fit` and `object-position` use.
- Assuming a source crop changes the outer CSS layout box; it generally changes the rendered view inside the box already laid out.
- Expecting `inset()` or `xywh()` to work when a replaced element lacks natural width/height.
- Relying on a limited-support property without a fallback image composition and a meaningful alt description.

# Knowledge checks with answers

1. **What does `image-resolution` control?** The preferred resolution used to interpret raster-image pixels as natural dimensions; it does not choose a higher-quality file or create detail.
2. **What does `from-image 300dpi` mean?** Use embedded image resolution if available; otherwise use the explicit 300dpi fallback.
3. **What does `snap` do?** Adjusts the effective resolution so one image pixel maps to an integer number of device pixels.
4. **Does `image-resolution` affect SVG vector content?** No; vectors do not have intrinsic raster resolution in this model.
5. **Where is `object-view-box` defined?** CSS Images Module Level 5, currently an Editor’s Draft; no published W3C Level 5 draft exists yet.
6. **What is the difference between `rect()` and `xywh()`?** `rect()` takes top/right/bottom/left coordinates; `xywh()` takes x/y origin and nonnegative width/height.
7. **How do `object-view-box` and `object-fit` relate?** The former selects the source view and affects its intrinsic dimensions/aspect ratio; the latter fits that view into the allocated content box.
8. **Can `object-view-box` zoom without changing surrounding layout?** Yes. It changes the view rendered within the replaced element’s allocated outer box.
9. **What is the broadly supported fallback for a source crop?** Use `object-fit`/`object-position` where sufficient or provide a pre-cropped image asset.

# Sources

- [CSS Images Module Level 4 Editor’s Draft](https://drafts.csswg.org/css-images-4/) — current `image-resolution` grammar/metadata and raster-resolution behavior; work in progress.
- [W3C CSS Images Module Level 4 Working Draft](https://www.w3.org/TR/css-images-4/) — latest published Level 4 draft (30 September 2025).
- [CSS Images Module Level 5 Editor’s Draft](https://drafts.csswg.org/css-images-5/) — current `object-view-box` grammar and view-box sizing behavior; work in progress. There is no published `/TR/css-images-5/` version as of this review.
- [CSS Images Module Level 3 Editor’s Draft](https://drafts.csswg.org/css-images-3/) and [W3C CSS Images Level 3 Candidate Recommendation Draft](https://www.w3.org/TR/css-images-3/) — image types, intrinsic image dimensions, and image metadata context.
- [MDN: `image-resolution`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/image-resolution) — syntax, value behavior, experimental label, and current report that no browsers support it.
- [MDN: `object-view-box`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-view-box) — exact rectangle function syntax, interaction with intrinsic sizing/fitting, examples, and support status.
- [MDN: `object-fit`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit) and [MDN: `object-position`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-position) — fitting and positioning comparison.
