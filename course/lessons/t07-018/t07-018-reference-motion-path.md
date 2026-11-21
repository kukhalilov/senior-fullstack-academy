
# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: Motion Path properties

# Scope and version

This reference covers all six supplied names: `offset`, `offset-anchor`, `offset-distance`, `offset-path`, `offset-position`, and `offset-rotate`. The primary source is the CSS Motion Path Module Level 1 Editor’s Draft dated 28 April 2026; it is explicitly work in progress and may change. Its latest published version is a Working Draft, not a Recommendation. Treat the syntax below as the current specification model, and check implementation support for the browsers and graphics contexts you target. Standards maturity and browser support are separate questions.

# How this group fits the mental model

Motion Path adds a transform to an element after layout. It aligns one chosen point on the element (the anchor) to a point on a geometric path, optionally rotating the element along the path. Animate `offset-distance` to move that alignment point. The surrounding layout does not reflow to follow the visual movement; the transformed element can overlap or leave its original space, and transform effects such as stacking-context creation apply.

Keep the decisions distinct: `offset-path` defines geometry; `offset-position` supplies a starting position only when the path form needs one; `offset-distance` chooses a location along the path; `offset-anchor` chooses which point of the element is placed there; `offset-rotate` sets path-following or fixed rotation. The `offset` shorthand resets these longhands together. Motion Path is 2D and is composed after the individual `translate`, `rotate`, and `scale` properties but before `transform`.

# Supplied names explained

## `offset-path`

**Purpose and grammar.** Selects the geometric path for the offset transform. Current grammar: `none | <offset-path> || <coord-box>`, where `<offset-path>` is `<ray()> | <url> | <basic-shape>` (plus CSS-wide keywords). It applies to transformable elements, is not inherited, has initial value `none`, and computes as specified. `none` means there is no offset transform. A coordinate box by itself creates a path around that box; when omitted it defaults to `border-box`.

`<basic-shape>` uses the equivalent path of a supported CSS shape function such as `path()`, `circle()`, `ellipse()`, `inset()`, `polygon()`, `rect()`, `xywh()`, or `shape()` where defined and implemented. If a basic shape accepts an `at <position>` argument and it is omitted, the offset starting position can supply it; otherwise that shape function’s default applies. A URL references an SVG shape element and uses its equivalent path. The current draft specifies a zero-length `path("m 0 0")` fallback when the reference does not resolve to a valid shape element. A coordinate box sizes the path: in CSS contexts it refers to boxes from the element establishing the containing block; SVG contexts use `view-box` behavior.

**`ray()` details.** Its current grammar is `ray( <angle> && <ray-size>? && contain? && [ at <position> ]? )`. The ray begins at its origin and extends in the angle’s direction. CSS angles use the usual bearing convention: `0deg` points upward and positive angles turn clockwise. Ray-size choices are `closest-side`, `closest-corner`, `farthest-side`, `farthest-corner`, and `sides`; they choose an extent relative to the reference box. `contain` adjusts the ray path so the element’s reference box can be contained within the containing block, changing the available path length. It is not a general clipping or overflow guarantee for painted effects, descendants, or later transforms.

When the path component is omitted, the current draft defines an inset path based on the border radius of the element that establishes the containing block; this is not equivalent to spelling `none`. A geometry-box path determines its own start and can make `offset-position` irrelevant. Coordinate-box keywords and shape-function availability are specification- and implementation-sensitive; check the cited modules and target browser support before relying on newer functions.

## `offset-position`

**Purpose and grammar.** Sets a starting position used by path forms that do not provide their own. Grammar: `normal | auto | <position>`; initial `normal`; applies to transformable elements; not inherited. Percentages refer to the containing block. `normal` supplies no offset starting position. `auto` means the top-left corner of the element’s own box, not the containing block’s top-left. An explicit `<position>` resolves a zero-by-zero object area inside the containing block.

This value matters only when the selected path construction consumes an offset starting position. For example, a basic shape that permits an omitted `at <position>` can use it. It is ignored when a path form already determines its own start, including a geometry-box-only path. Do not confuse this with `top`/`left`, normal-flow placement, or `offset-anchor`: each decides a different coordinate.

## `offset-distance`

**Purpose and grammar.** Selects how far along the path the offset position lies. Grammar: `<length-percentage>`; initial `0`; applies to transformable elements; not inherited. A percentage is relative to the total path length, not the element’s size or the containing block. If there is no effective offset path, this property has no effect. It is commonly animated from `0%` to `100%`.

Distance handling depends on path topology. A finite open path clamps the used distance into its range, so negative or over-length values land at an endpoint. A closed loop wraps modulo its total length, including for negative distances; a zero-length closed path uses distance zero. An unbounded ray does not behave like a finite closed loop. With `ray(... contain)`, the path extent is adjusted for containment. These distinctions are why “negative distances always move backward” and “100% always means the same endpoint” are unsafe blanket rules.

## `offset-anchor`

**Purpose and grammar.** Chooses the point on the element aligned with the path’s offset position. Grammar: `auto | <position>`; initial `auto`; applies to transformable elements; not inherited. Percentage components resolve against the width and height of the element’s reference box. `auto` uses the point indicated by the computed `transform-origin`; an explicit position resolves against the element reference box. Thus `offset-anchor: center` places the element’s center on the path point, while `left top` places its top-left there. This is not the path’s origin and does not change path length.

## `offset-rotate`

**Purpose and grammar.** Controls rotation as part of the offset transform. Grammar: `[ auto | reverse ] || <angle>`; initial `auto`; applies to transformable elements; not inherited. `auto` aligns the element with the path direction at its current point. `reverse` follows that direction and adds 180 degrees. An angle by itself adds a fixed rotation without following the tangent; when combined with `auto` or `reverse`, the angle is added to the path-based rotation. The artwork may need an additional fixed angle because its forward direction may not be its positive x-axis.

## `offset`

**Purpose and grammar.** The shorthand sets `offset-position`, `offset-path`, `offset-distance`, `offset-rotate`, and `offset-anchor`. Current grammar:

```text
[ <'offset-position'>? [ <'offset-path'> [ <'offset-distance'> || <'offset-rotate'> ]? ]? ]! [ / <'offset-anchor'> ]?
```

The slash introduces the anchor. Omitted longhands reset to their initial values, as with other CSS shorthands. For example, `offset: path("M 0 0 L 100 0") 50% auto / center;` supplies a path, distance, path-following rotation, and center anchor while resetting the omitted position to `normal`. Do not assume values in the shorthand preserve earlier longhand declarations.

# Cross-item comparison

| Decision | Property | Reference frame | Frequent confusion |
| --- | --- | --- | --- |
| What route? | `offset-path` | Selected path and optional coordinate box | `offset-position` is not the path itself. |
| Where does an implicit path start? | `offset-position` | Containing block or element’s own top-left for `auto` | It is not `offset-anchor`. |
| Where on the route? | `offset-distance` | Path length | Percentages are not relative to the box size. |
| Which point of the element follows it? | `offset-anchor` | Element reference box | `auto` follows `transform-origin`. |
| Which way does it face? | `offset-rotate` | Path tangent plus optional angle | A bare angle does not track the path tangent. |
| Set/reset the group? | `offset` | The five longhands | Omitted components reset to initial values. |

Transform composition order is consequential. Individual transform properties (`translate`, `rotate`, `scale`) apply before the offset transform; the `transform` property applies after it. A geometry-box path follows its box outline and ignores `offset-position` as its path start. For a shape-function path, an omitted `at <position>` can instead use the offset starting position. Inspect the path form rather than treating all values as one generic coordinate system.

# Examples

```css
.orbiting-icon {
  offset-path: ellipse(42% 30% at 50% 50%);
  offset-distance: 0%;
  offset-anchor: center;
  offset-rotate: auto;
  animation: orbit 8s linear infinite;
}

@keyframes orbit {
  to { offset-distance: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .orbiting-icon {
    animation: none;
    offset-distance: 0%;
    offset-rotate: 0deg;
  }
}

/* Polar direction from the ray's origin. */
.marker {
  offset-path: ray(45deg closest-side);
  offset-distance: 100%;
  offset-anchor: center;
  offset-rotate: 0deg;
}
```

The `ellipse()` example’s omitted `at` position uses the applicable offset starting position when defined; otherwise the shape function’s own default applies. Test responsive dimensions and target engines because path geometry changes with its reference box and not every current draft value has universal support. Keep an understandable static position and honor reduced-motion preferences; do not make essential information available only through movement.

# Common mistakes

- Treating the path point as the element’s top-left; `offset-anchor` determines which point aligns.
- Assuming `offset-position: auto` means the containing block’s top-left; it refers to the element’s own box.
- Assuming `offset-position` always affects the path; geometry-box paths and paths with explicit starts can ignore it.
- Treating `offset-distance: 100%` as a universal endpoint rule; open finite paths clamp, closed paths wrap, and rays have their own behavior.
- Using `offset-rotate: 30deg` when the intent is tangent-following plus 30 degrees; use `auto 30deg` for that combination.
- Forgetting that `offset` resets omitted longhands, or treating `/ <offset-anchor>` as meaningless punctuation.
- Expecting motion transforms to reserve layout space or move siblings; they visually transform the element without reflowing surrounding layout.
- Assuming `ray(... contain)` guarantees every painted pixel remains visible after shadows, descendants, transforms, or overflow are considered.
- Ignoring transform order: `translate`/`rotate`/`scale`, then offset transform, then `transform`.
- Making an essential control or message continuously move without a stationary alternative or reduced-motion treatment.

# Knowledge checks with answers

1. **What should change to move a centered icon along a curve while keeping its center on the curve?** Define the curve with `offset-path`, animate `offset-distance`, and set `offset-anchor: center`.
2. **Does `offset-position: auto` mean the containing block’s top-left?** No. It means the top-left of the element’s own box; an explicit `<position>` uses the containing block.
3. **Why can `-25%` and `125%` behave differently on an open path and a closed loop?** A finite open path clamps the used distance to endpoints; a closed loop wraps modulo its length.
4. **How do you make an object follow a curve but face 20 degrees ahead of its natural tangent?** Use `offset-rotate: auto 20deg` (and account for the artwork’s forward axis if needed).
5. **If `scale` and `transform: rotate(...)` are both set, where does the motion transform occur?** After individual `scale` and before the `transform` property.
6. **Why might `offset-position` have no visible effect with `offset-path: padding-box`?** A geometry-box path defines its own outline and ignores offset-position as its path start.

# Sources

- [CSS Motion Path Module Level 1 Editor’s Draft](https://drafts.csswg.org/motion-1/) — current work in progress; grammars, distance handling, anchor and position semantics, shorthand, transform calculation and composition.
- [CSS Motion Path Module Level 1, published Working Draft (5 November 2024)](https://www.w3.org/TR/2024/WD-motion-1-20241105/) — published snapshot for comparison; also a draft, not a Recommendation.
- [CSS Transforms Module Level 2 Editor’s Draft](https://drafts.csswg.org/css-transforms-2/) — individual transform properties and transformation-matrix composition.
- [CSS Shapes Module Level 1 Editor’s Draft](https://drafts.csswg.org/css-shapes-1/) — `<basic-shape>` functions and reference boxes.
- [CSS Box Model Module Level 3 Editor’s Draft](https://drafts.csswg.org/css-box-3/) — coordinate-box concepts.
- [SVG 2](https://www.w3.org/TR/SVG2/) — SVG shape elements and equivalent paths.
