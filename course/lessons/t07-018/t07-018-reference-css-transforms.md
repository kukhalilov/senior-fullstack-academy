<!-- FACTUALLY REVIEWED: CSS Transforms Levels 1 and 2 checked; Level 2 marked as editor draft. -->

## Scope and version

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Transforms properties

This lesson covers the ten supplied transform properties. CSS Transforms Level 1 defines the core 2D transform model; the current Level 2 document is an Editor’s Draft adding 3D rendering details and the individual `translate`, `rotate`, and `scale` properties. Those draft definitions are widely implemented, but the document remains work in progress. MDN’s 2026-11-16 Baseline snapshot is separate from specification maturity.

## How this group fits the mental model

Layout first determines a box’s normal position and size. A transform then maps that box’s local coordinates to a different painted position/orientation/shape. The surrounding flow is not recomputed, but the visual overflow can grow and scrollbars may appear. Transforms also create stacking contexts; in many cases they establish containing blocks for positioned descendants. This explains why transformed content can overlap neighbors without pushing them away, and why a fixed descendant may behave as if fixed to a transformed ancestor.

For 2D composition, function order matters because matrices are multiplied: `translate(...) scale(...)` is not equivalent to `scale(...) translate(...)`. Transform origin and reference box determine where that matrix is anchored. 3D transforms add a Z axis; perspective sets the viewing projection, while `transform-style: preserve-3d` allows descendants to share a 3D rendering context instead of flattening into a plane.

## Supplied names explained

### `transform`

Grammar: `none | <transform-list>`; initial `none`; non-inherited; applies to transformable elements. A transform list is an ordered list of functions: the 2D functions include `matrix()`, `translate()`, `translateX()`, `translateY()`, `scale()`, `scaleX()`, `scaleY()`, `rotate()`, `skew()`, `skewX()`, and `skewY()`; Level 2 adds/defines 3D forms such as `matrix3d()`, `translate3d()`/`translateZ()`, `scale3d()`/`scaleZ()`, `rotate3d()`/`rotateX()`/`rotateY()`/`rotateZ()`, and `perspective()`. Each function’s own grammar constrains its arguments; angle units are required except legacy unitless zero, and translation percentages use the transform reference box’s width/height.

The functions are applied in the order written. `transform-origin` is translated to, the function matrices are multiplied, then the origin translation is undone. A non-`none` transform establishes a local coordinate system and stacking context; it does not reflow neighboring boxes. It can extend, but does not shrink, the overflow area. If the resulting transformation matrix is non-invertible, the element and its contents are not displayed. Use `transform` for a deliberately ordered transform sequence or where compatibility requires a single property.

### Individual 2D/3D properties: `translate`, `rotate`, `scale`

These Level 2 properties express common transforms separately. They are non-inherited, apply to transformable elements, and have initial value `none`. Where individual properties and `transform` are set, their relative composition order is **translate, rotate, scale, then the `transform` list**. The separate motion-path `offset` property participates between `scale` and `transform`; it is outside this inventory. This means an individual `rotate` does not simply append to the end of the `transform` function list. Each non-`none` individual property also participates in transform rendering and stacking behavior.

- `translate`: `none | <length-percentage> [ <length-percentage> <length>? ]?`. One value translates X; two translate X and Y; a third length translates Z. Percentages resolve against the reference box width for X and height for Y. It is useful for small positional changes without rewriting a larger `transform` declaration.
- `rotate`: `none | <angle> | [ x | y | z | <number>{3} ] && <angle>`. A lone angle rotates about Z; an axis keyword or 3-number axis vector sets the rotation axis. The axis vector is normalized for the operation. It is useful for independent rotation and can represent 3D rotation.
- `scale`: `none | [ <number> | <percentage> ]{1,3}`. One value scales X and Y equally; two values set X and Y; an optional third sets Z. Percentages are permitted by the Level 2 draft. A negative factor reflects across that axis; zero collapses the dimension and can make the transform matrix singular.

### `transform-origin`

Grammar: a position with an optional third `<length>` for Z; initial `50% 50%`; non-inherited; applies to transformable elements. One coordinate defaults the other to center; the Z component is a length, not a percentage. The origin is the pivot point: the browser translates to it, applies the transform, then translates back. Percentages and keywords such as `left`, `center`, `right`, `top`, and `bottom` resolve against the reference box chosen by `transform-box`. SVG elements without a CSS layout box have special initial/used-value behavior, so do not assume HTML’s centered default applies unchanged to every SVG object.

### `transform-box`

Grammar: `content-box | border-box | fill-box | stroke-box | view-box`; initial `view-box`; non-inherited; applies to transformable elements. It selects the reference box for `transform`, individual transform properties, and `transform-origin`. For CSS layout boxes, `content-box` and `border-box` select the corresponding CSS boxes; SVG graphics can use the painted fill bounds, stroke bounds, or SVG view box. For elements with CSS layout boxes, `view-box` has a used-value mapping to the CSS border box. This property is often the missing explanation when percentage translations or origins look different between HTML and SVG.

### 3D camera and face properties

- `perspective`: `none | <length [0,∞]>`; initial `none`; non-inherited; applies to transformable elements. When placed on a parent, it projects that parent’s 3D-transformed children using a shared viewer distance. Smaller positive distances exaggerate perspective; larger distances make it subtler. Values below 1px are treated as 1px for rendering, while the underlying value remains unchanged. It differs from the `perspective()` transform function, which is part of the element’s own transform list. The property also establishes a stacking context and containing block under the Level 2 rendering model.
- `perspective-origin`: `<position>`; initial `50% 50%`; non-inherited; applies to transformable elements. It chooses the X/Y point from which the viewer appears to look at the children and therefore shifts the perspective vanishing point. Percentages are relative to the reference box. It has an effect when a perspective property applies; it does not itself create perspective.
- `backface-visibility`: `visible | hidden`; initial `visible`; non-inherited; applies to transformable elements. A 3D-transformed plane has front and back faces; by default the reverse face remains visible as mirrored content. `hidden` suppresses the element when its back face faces the viewer in a 3D rendering context. It does not disable or remove the element’s semantics, events, or layout box.
- `transform-style`: `flat | preserve-3d`; initial `flat`; non-inherited; applies to transformable elements; discrete. `flat` renders descendants flattened into the element’s plane. `preserve-3d` lets transformed descendants participate in a shared 3D rendering context. It is not inherited, so each intermediate transformed ancestor that should preserve the scene must be set accordingly. Certain grouping effects force the used value to `flat` even when the computed value says `preserve-3d`; examples include overflow other than `visible` or `clip`, opacity below 1, filters, non-auto clipping, clip paths, masks, isolation, paint containment, and non-normal blending. Check these flattening triggers when depth ordering appears not to work.

```css
.scene {
  perspective: 700px;
  perspective-origin: 50% 40%;
}
.card {
  transform-style: preserve-3d;
  rotate: y 18deg;
}
.card__face { backface-visibility: hidden; }
```

## Cross-item comparison

| Need | Property | Practical difference |
| --- | --- | --- |
| Compose a sequence of transforms | `transform` | Ordered transform-function list. |
| Change one common component independently | `translate`, `rotate`, `scale` | Fixed composition order; the separate `offset` property follows scale, then `transform`. |
| Select the pivot and coordinate box | `transform-origin`, `transform-box` | Origin is a point; box determines the coordinate reference used to resolve it and percentages. |
| Project children in a shared 3D scene | `perspective`, `perspective-origin`, `transform-style` | Distance, vanishing point, and preservation of descendant depth are separate controls. |
| Hide the reverse side of a 3D plane | `backface-visibility` | Changes painting of the back face, not interaction semantics. |

`perspective: 700px` on a parent and `transform: perspective(700px) ...` on a child are not interchangeable: the former gives sibling/descendant transforms a shared camera; the latter adds a projection function to that element’s matrix.

## Examples

Use a 2D transform for a visual hover lift without changing the card’s flow position:

```css
.card {
  transition: transform 160ms ease;
}
.card:hover {
  transform: translateY(-4px) scale(1.02);
  transform-origin: center;
}
```

Neighboring boxes keep their layout positions; check that the transformed card does not cover nearby controls or get clipped by an ancestor.

## Common mistakes

- Expecting transformed boxes to reflow neighbors; only their painting and overflow change.
- Reordering transform functions or individual properties without recalculating the matrix result.
- Confusing `perspective` with `perspective()` or placing the property on the wrong element for a shared scene.
- Assuming `preserve-3d` is inherited or survives grouping properties that force flattening.
- Forgetting `transform-origin` percentages depend on `transform-box` and may have SVG-specific resolution.
- Assuming `backface-visibility: hidden` disables a flipped control or removes it from assistive technology.
- Using transform scaling as a substitute for responsive layout, text zoom, or reflow.
- Applying many large transforms without checking overflow, scrollbars, stacking, fixed descendants, and hit targets.

## Knowledge checks with answers

1. Does a transform change normal-flow layout? No. It changes the rendered coordinate mapping and may expand overflow, but does not reposition neighboring flow boxes.
2. In what order do individual transform properties combine with `transform`? `translate`, then `rotate`, then `scale`, then the `transform` list.
3. What does `transform-box` change? The reference box used to resolve transform coordinates, transform origin, and percentages.
4. What roles do `perspective` and `perspective-origin` play? Perspective sets viewer distance; perspective-origin chooses the viewer’s X/Y position.
5. Why might `transform-style: preserve-3d` still flatten descendants? Grouping properties can force its used value to `flat`.
6. Does hiding a backface disable the element? No. It only affects whether the reverse face is painted.

## Sources

- [CSS Transforms Module Level 1](https://drafts.csswg.org/css-transforms-1/)
- [CSS Transforms Module Level 2 Editor’s Draft](https://drafts.csswg.org/css-transforms-2/)
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property reference index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
