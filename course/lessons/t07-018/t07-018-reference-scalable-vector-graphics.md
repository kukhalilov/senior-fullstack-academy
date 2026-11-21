# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: Scalable Vector Graphics properties

## Scope and version

This lesson explains all 31 supplied CSS property names used with SVG: `cx`, `cy`, `d`, `fill`, `fill-opacity`, `fill-rule`, `marker`, `marker-end`, `marker-mid`, `marker-start`, `paint-order`, `path-length`, `r`, `rx`, `ry`, `shape-rendering`, `stop-color`, `stop-opacity`, `stroke`, `stroke-dasharray`, `stroke-dashoffset`, `stroke-linecap`, `stroke-linejoin`, `stroke-miterlimit`, `stroke-opacity`, `stroke-width`, `text-anchor`, `text-rendering`, `vector-effect`, `x`, and `y`.

The [SVG 2 Recommendation](https://www.w3.org/TR/SVG2/) defines most of the geometry, paint, stroke, path, marker, and rendering-hint behavior below. CSS declarations for geometry and paint properties coexist with SVG presentation attributes: a presentation attribute supplies a lower-priority style input, while a winning CSS declaration can override it through the cascade. These CSS properties do not mutate the SVG attributes or path data in the DOM. The CSS Fill and Stroke Level 3 [Editor’s Draft](https://drafts.csswg.org/fill-stroke-3/) proposes major extensions to multi-layer paint and stroke geometry; label those as draft work, not as behavior defined by the seven assigned fill/stroke properties here.

## How this group fits the mental model

An SVG graphic has geometry in a user-coordinate system and paint operations that render it. Geometry properties position circles, ellipses, rectangles, images, foreign objects, and nested SVG viewports. Paint properties fill an interior, draw an outline, color gradient stops, and control how those operations look. Marker properties place a reusable SVG `<marker>` at vertices of a path or shape. Rendering-hint properties ask the user agent to trade speed, edge crispness, legibility, or precision; they do not guarantee a specific rasterization algorithm.

SVG presentation attributes such as `fill="tomato"` are useful in self-contained markup and can be selected through the CSS cascade. CSS values such as `fill`, `stroke`, or `stroke-width` can also be set in style sheets and animations. A unitless SVG number generally means user units; percentages refer to an SVG viewport or path-specific coordinate system, not automatically the CSS layout box. `viewBox`, nested viewports, and transforms affect where those values land.

These are a selected inventory of 31 names, not every CSS property that can affect SVG. General CSS properties (for example `opacity`, `color`, `transform`, `display`, and font properties), SVG attributes, paint-server elements, and properties from the draft Fill and Stroke module are covered elsewhere or are deliberately kept distinct.

## Supplied names explained

The compact metadata below follows the SVG 2 property definitions. All listed properties accept CSS-wide keywords. Unless called out as inherited, geometry properties are non-inherited. “Discrete” animation switches values; “by computed value” can interpolate compatible numeric/length values under that property’s interpolation rules.

| Exact name | Value and initial value | Applies / inherits | What it controls |
| --- | --- | --- | --- |
| `cx` | `<length-percentage>`; `0` | `circle`, `ellipse`; no | Horizontal center; percentage uses viewport width; negative coordinates are allowed. |
| `cy` | `<length-percentage>`; `0` | `circle`, `ellipse`; no | Vertical center; percentage uses viewport height; negative coordinates are allowed. |
| `r` | `<length-percentage>`; `0` | `circle`; no | Circle radius; percentage uses normalized viewport diagonal; negative values are invalid and act as zero. |
| `rx` | `<length-percentage> | auto`; `auto` | `ellipse`, `rect`; no | Ellipse horizontal radius or rectangle corner radius; percent uses viewport width. |
| `ry` | `<length-percentage> | auto`; `auto` | `ellipse`, `rect`; no | Ellipse vertical radius or rectangle corner radius; percent uses viewport height. |
| `x` | `<length-percentage>`; `0` | `svg`, `rect`, `image`, `foreignObject`; no | Horizontal position; percent uses viewport width; negative values are allowed. |
| `y` | `<length-percentage>`; `0` | `svg`, `rect`, `image`, `foreignObject`; no | Vertical position; percent uses viewport height; negative values are allowed. |
| `d` | `none | <string>`; `none` | `path`; no | Path geometry written using SVG path-data commands; no path data means the path does not render. |
| `path-length` | `none | <length [0,∞]>`; `none` | `path`, `circle`, `ellipse`, `line`, `polygon`, `polyline`, `rect`; no | Author-calibrated total path length for text-on-path positioning, motion distance, and stroke dashing. |
| `fill` | `<paint>`; `black` | Shapes and text content; yes | Paints the interior of a shape or glyphs. |
| `fill-opacity` | `<opacity>`; `1` | Shapes and text content; yes | Alpha for the fill painting operation only, clamped to 0–1. |
| `fill-rule` | `nonzero | evenodd`; `nonzero` | Shapes and text content; yes | Determines which regions inside compound or self-intersecting geometry are filled. |
| `stroke` | `<paint>`; `none` | Shapes and text content; yes | Paints the outline of a shape or glyphs. |
| `stroke-width` | `<length-percentage> | <number>`; `1px` | Shapes and text content; yes | Stroke thickness; unitless numbers are user units; percentages use normalized viewport diagonal. |
| `stroke-opacity` | `<opacity>`; `1` | Shapes and text content; yes | Alpha for stroke painting only, clamped to 0–1. |
| `stroke-dasharray` | `none | [<length-percentage> | <number>]+`; `none` | Shapes and text content; yes | Alternating dash and gap lengths along each subpath. |
| `stroke-dashoffset` | `<length-percentage> | <number>`; `0` | Shapes and text content; yes | Shifts the start phase of the dash pattern. |
| `stroke-linecap` | `butt | round | square`; `butt` | Shapes and text content; yes | Shape at open stroke ends and at zero-length subpaths. |
| `stroke-linejoin` | `miter | round | bevel`; `miter` | Shapes and text content; yes | Shape where stroked path segments meet. |
| `stroke-miterlimit` | non-negative `<number>`; `4` | Shapes and text content; yes | Caps the miter length relative to stroke width; excess miters fall back to bevel. |
| `marker-start` | `none | <url>`; `none` | Shapes; yes | References a marker at the first vertex of the entire shape path. |
| `marker-mid` | `none | <url>`; `none` | Shapes; yes | References markers at intermediate path vertices. |
| `marker-end` | `none | <url>`; `none` | Shapes; yes | References a marker at the last vertex of the entire shape path. |
| `marker` | `none | <marker-ref>`; shorthand | Shapes; yes | Sets `marker-start`, `marker-mid`, and `marker-end` together. |
| `paint-order` | `normal | [fill || stroke || markers]`; `normal` | Shapes and text content; yes | Reorders fill, stroke, and marker painting. |
| `stop-color` | `<color>`; `black` | `<stop>`; no | Color of a gradient stop. |
| `stop-opacity` | `<opacity>`; `1` | `<stop>`; no | Opacity of the gradient-stop color, clamped to 0–1. |
| `shape-rendering` | `auto | optimizeSpeed | crispEdges | geometricPrecision`; `auto` | Shapes; yes | Hint about rendering speed, edge appearance, and geometric precision. |
| `text-anchor` | `start | middle | end`; `start` | SVG text content; yes | Aligns each text chunk relative to its text position. |
| `text-rendering` | `auto | optimizeSpeed | optimizeLegibility | geometricPrecision`; `auto` | `<text>`; yes | Hint about speed, legibility, and geometric precision. |
| `vector-effect` | `none | non-scaling-stroke`; `none` | Graphics elements and `<use>`; no | Modifies selected transform effects; `non-scaling-stroke` keeps the stroke width independent of element scaling and zoom. |

### Geometry, coordinates, and path data

- **`cx` and `cy`** give the center of circles and ellipses. Their percentages are resolved against the width and height of the current SVG viewport respectively. A negative center merely places the center beyond the viewport; it does not invalidate the shape.
- **`r`** is only for `<circle>`. A negative radius is invalid and is treated as zero, so the circle is not rendered. Its percentage basis is the normalized diagonal of the current SVG viewport.
- **`rx` and `ry`** apply to ellipses and rounded rectangles. For a rectangle, the used horizontal and vertical corner radii are capped at half its width and height. `auto` makes one radius use the other radius; if both are `auto`, both resolve to zero. Negative values are invalid and treated as `auto`. SVG 2 extends `auto` behavior to ellipses when one radius is omitted.
- **`x` and `y`** position an SVG viewport, rectangle, image, or foreign object. Their percentage bases are the current viewport width and height. They accept negative coordinates. Do not conflate them with CSS layout `left`/`top` offsets or with the SVG `viewBox`, which maps user space to a viewport.
- **`d`** is a CSS property on `<path>` with grammar `none | <string>`. The string follows SVG path-data syntax: `M/m` moveto, `Z/z` closepath, `L/l`, `H/h`, `V/v` line commands, `C/c` and `S/s` cubic Bézier commands, `Q/q` and `T/t` quadratic commands, and `A/a` elliptical arcs. Uppercase coordinates are absolute; lowercase coordinates are relative to the current point. A compound path can have multiple subpaths. Invalid path data follows SVG’s path error-handling rules; an empty or commandless path does not render. Smooth interpolation of two `d` values requires matching command structure; incompatible structures animate discretely. This property is specified by SVG 2, but check deployment support rather than treating an index label as universal support.
- **`path-length`** is distinct from the SVG `pathLength` attribute, although the attribute maps to this property. CSS accepts `none` or a non-negative length; the attribute’s unitless number maps to a CSS length in px. It scales the user agent’s computed distance along a path by the ratio of author length to computed geometric length. It affects text on a path, motion distance, `stroke-dasharray`, and `stroke-dashoffset`, but not percentage distance calculations. Zero is valid under the specification’s special scaling rules; negative values are invalid. In implementation-sensitive code, verify CSS property support and use the SVG attribute where its broader compatibility is needed.

SVG uses nested viewports and user coordinate systems. A `viewBox` or transform changes the mapping of user units; percentage bases are taken from the relevant current viewport, not necessarily the outermost `<svg>`. For `r`, `stroke-width`, `stroke-dasharray`, and `stroke-dashoffset`, “normalized diagonal” means the SVG viewport diagonal normalized by the SVG distance-calculation rule, not simply CSS `100vw` or `100vh`.

### Paint, filling, opacity, and gradient stops

SVG 2 `<paint>` is `none | <color> | <url> [none | <color>]? | context-fill | context-stroke`. The URL references a paint server, such as `<linearGradient>`, `<radialGradient>`, or `<pattern>`. An optional color or `none` is a fallback if the reference is invalid; without a valid reference or fallback, that layer paints nothing. `context-fill` and `context-stroke` take paint from a referencing context, especially useful inside markers and `<use>` content. These keywords do not produce paint when there is no context element. A paint server is different from a CSS image value and is resolved in SVG paint context.

- **`fill`** paints shape interiors and text glyph interiors. SVG closes open subpaths for the purpose of filling even when the path data has no `Z`. The `fill-rule` determines the inside for compound/intersecting paths: `nonzero` counts signed crossings; `evenodd` toggles inside/outside for each crossing.
- **`fill-opacity`, `stroke-opacity`, and `stop-opacity`** accept the CSS `<opacity>` value (number or percentage) and clamp computed opacity to 0–1. Fill/stroke opacity affects that paint operation, not the whole element. SVG 2 `stop-opacity` is non-inherited and applies to a gradient stop; a transparent stop can still have a color that participates in gradient interpolation. The general CSS `opacity` property groups the element’s rendered result and is not interchangeable with these three.
- **`stop-color`** sets a gradient stop’s color and accepts CSS color syntax. It is non-inherited and applies to `<stop>`; `currentColor` can derive the used paint from the `color` property.

The general `color` property is not in this lesson’s assigned list. In SVG its main role is to supply the indirect `currentColor` value used by paint properties such as `fill`, `stroke`, and `stop-color`.

### Strokes, patterns, and vertex markers

- **`stroke`** paints along the outline of shapes or text. A move-only path has no stroke; zero-length segments are also not visibly stroked with the default `butt` cap. Stroke width, cap, join, dash, and opacity are separate properties.
- **`stroke-width`** accepts lengths, percentages, or numbers (user units). Zero paints no stroke; negative values are invalid. Percentages are viewport-diagonal-relative. `vector-effect: non-scaling-stroke` changes transform treatment but does not mean “always one CSS pixel” in every rendering environment.
- **`stroke-linecap`** changes how each open subpath ends. `butt` stops at the endpoint; `round` adds a half-circle extension; `square` extends by half the stroke width. Zero-length subpaths can render a circle or square for round/square, but not for butt.
- **`stroke-linejoin` and `stroke-miterlimit`** control corners. `round` draws a circular sector; `bevel` clips the corner; `miter` extends the outer edges until they meet. The miter limit is a ratio against stroke width; when exceeded, the miter join becomes bevel. Negative miter limits are invalid. Do not confuse this numeric threshold with a path coordinate.
- **`stroke-dasharray`** alternates dash lengths and gap lengths; values can be comma- or whitespace-separated numbers, lengths, or percentages. Odd-length lists repeat to form an even list. The pattern restarts for each subpath. Any negative entry makes the whole value invalid; an all-zero list paints a solid stroke. `none` also means a solid stroke. It animates but SVG 2 does not support additive animation for it.
- **`stroke-dashoffset`** shifts the phase along the path; negative values are allowed and wrap modulo the total dash pattern length. It uses the same normalized-diagonal percentage basis. `path-length` calibrates distance so authors can choose convenient values.
- **`marker-start`, `marker-mid`, and `marker-end`** reference an SVG `<marker>` by URL; invalid references draw no marker. Start/end are for the first and final vertices of the whole shape path; mid is for intervening vertices. In a closed shape, the coincident first/final vertex can receive both start and end markers. A `<path>` with multiple closed subpaths has distinct subpath vertices, but the start/end properties still target the path data’s first and last vertices. Marker rendering order is start, then mid markers along the path, then end.
- **`marker`** is the shorthand for all three marker longhands. Use it when all vertices share a marker; use the longhands for different start, middle, and end symbols. The referenced `<marker>` element defines the symbol, its reference point, viewport, sizing, units, and orientation. The marker element is not the `marker` property.
- A marker’s `orient="auto"` follows the path tangent; `auto-start-reverse` reverses the orientation only for a start marker. `markerUnits="strokeWidth"` scales its units with the stroke width; `userSpaceOnUse` uses user-space units. `context-stroke` can make an arrowhead inherit the referencing line’s stroke paint. Referenced marker contents are rendered as non-exposed cloned instances; CSS selectors target the original marker subtree, not those conceptual clones.

### Text anchoring, paint order, and renderer hints

- **`text-anchor`** aligns each SVG text chunk at its text position: `start`, `middle`, or `end`. It is not a CSS box alignment or wrapping property. The visual meaning of start/end follows the text direction. A text chunk can be split by positioning and text-layout behavior, so it does not simply align an entire `<text>` element’s rectangular box.
- **`paint-order`** controls the sequence of the fill, stroke, and markers paint operations. `normal` means fill, then stroke, then markers. A partial order such as `stroke` places that item first and appends omitted operations in their normal relative order, so `stroke` is equivalent to `stroke fill markers`. It affects paint only, not geometry or hit-testing semantics.
- **`shape-rendering`** is an implementation hint for SVG shapes: `auto` balances concerns with geometric precision favored; `optimizeSpeed` favors speed; `crispEdges` favors sharp edges and may alter antialiasing or pixel alignment; `geometricPrecision` favors geometric precision. It does not promise a particular algorithm or guarantee pixel-perfect output.
- **`text-rendering`** is a hint for SVG `<text>`: `auto`, `optimizeSpeed`, `optimizeLegibility`, or `geometricPrecision`. A user agent may trade off speed, hinting, antialiasing, and geometric precision; these keywords do not force a specific font or rendering pipeline.
- **`vector-effect`** currently defines `none` and `non-scaling-stroke` in SVG 2. With the latter, stroke outline is computed in the furthest ancestral SVG viewport’s host coordinate space and transformed back, so transforms and zoom do not scale its width in the ordinary way. It is not a general “ignore all transforms” switch; the named vector effect applies to stroke geometry.

## Cross-item comparison

| If the goal is… | Use | Keep in mind |
| --- | --- | --- |
| Place a circle or ellipse | `cx`, `cy`, `r` | The center coordinates may be negative; a negative radius is invalid. |
| Define rectangle or ellipse corner/shape radii | `rx`, `ry` | `auto` couples the two radii; rounded rectangle radii are capped by half the side lengths. |
| Place a rect, image, foreign object, or nested SVG viewport | `x`, `y` | These use SVG viewport coordinate bases and do not replace `viewBox` or transforms. |
| Define or animate a path | `d` | SVG path command grammar is required; compatible command sequences interpolate more smoothly. |
| Calibrate path distances | `path-length` | It scales length-dependent features; it does not change the visible path geometry. |
| Paint an interior or outline | `fill`, `stroke` | Fill and stroke accept paint servers, fallback paint, and context paint; their defaults differ. |
| Make paint transparent | `fill-opacity`, `stroke-opacity`, `stop-opacity` | Each affects one paint operation or stop; general `opacity` affects the composited element/group. |
| Decide which regions fill | `fill-rule` | `nonzero` and `evenodd` differ on compound paths. |
| Draw a dashed or shaped outline | `stroke-*` properties | Width, phase, dash pattern, cap, join, miter cutoff, and opacity are independent controls. |
| Add arrows or symbols to vertices | `marker*` | Define a `<marker>` element and reference it; choose shorthand or position-specific longhands. |
| Align SVG text or choose paint sequence | `text-anchor`, `paint-order` | One aligns text chunks; the other orders fill/stroke/markers. |
| Suggest rendering trade-offs | `shape-rendering`, `text-rendering` | They are hints, not output guarantees. |
| Keep a stroke from scaling with transforms | `vector-effect: non-scaling-stroke` | This is specifically a stroke vector effect. |

## Examples

Geometry and paint attributes remain useful defaults that can also be overridden by CSS:

```html
<svg viewBox="0 0 120 60" role="img" aria-label="A circle with an outlined arrow">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
    </marker>
  </defs>
  <circle class="target" cx="25" cy="30" r="18" />
  <path class="route" d="M 48 30 H 105" />
</svg>
```

```css
.target { fill: #dbeafe; stroke: #1d4ed8; stroke-width: 2; }
.route {
  fill: none;
  stroke: #172554;
  stroke-width: 3;
  stroke-dasharray: 7 3;
  marker-end: url(#arrow);
  vector-effect: non-scaling-stroke;
}
.route { paint-order: stroke fill markers; }
```

The local `<marker>` definition shows the reference coordinate, viewBox, size, automatic orientation, and context paint working together. The `role`/label are only an illustration of providing SVG meaning; real accessible naming depends on context and the SVG’s surrounding semantics.

Even-odd filling is useful when a compound path contains a hole:

```css
.donut { fill-rule: evenodd; }
```

Use `<path pathLength="100">` when authoring dash values against an intentional 0–100 distance scale. That attribute is widely used in SVG and maps to the `path-length` property; CSS-property support should still be checked separately.

## Common mistakes

1. **Assuming all 31 properties apply to every SVG or HTML element.** Geometry properties name applicable SVG elements, paint properties apply to shapes/text, and markers apply to shapes.
2. **Treating presentation attributes as stronger than CSS.** They participate in the cascade as presentation hints; an applicable CSS declaration can override one.
3. **Confusing a paint server with a CSS image.** SVG paint URLs reference paint-server elements and have SVG-specific fallback behavior.
4. **Assuming a fill or stroke paints by default in the same way.** Fill defaults to black; stroke defaults to none.
5. **Using fill opacity as if it were element opacity.** Fill/stroke opacity affect one paint operation; `opacity` affects the composited element/group.
6. **Using `fill-rule` to change the path itself.** It changes inside/outside interpretation, not path coordinates.
7. **Expecting negative radii or stroke widths to work.** Negative values are invalid; they do not mirror or create a reverse shape.
8. **Assuming percentages mean CSS viewport units.** SVG percentages are tied to the relevant SVG viewport and property-specific basis.
9. **Assuming `pathLength` and `path-length` have identical syntax.** The attribute takes a unitless number; the CSS property takes a non-negative length and the attribute maps into px.
10. **Using odd dash lists without understanding repetition.** An odd list repeats in full; subpaths restart the dash sequence.
11. **Expecting marker-start/end on every subpath.** They refer to the first and final vertices of the path data, while `marker-mid` serves intermediate vertices.
12. **Treating `shape-rendering` or `text-rendering` as commands.** They are hints; user agents can make different trade-offs.
13. **Assuming `non-scaling-stroke` freezes all effects.** It changes stroke outline scaling; it does not generally neutralize transforms on the element.
14. **Presenting proposed Fill and Stroke Level 3 extensions as stable.** Multiple fills/strokes, stroke alignment, fill/stroke image layers and related properties are draft work; check current spec and implementation support.

## Knowledge checks with answers

1. **Which assigned property changes the center of a circle?** `cx` and `cy` set its horizontal and vertical center.
2. **What happens when a circle has `r: -4px`?** The negative radius is invalid and is treated as zero, so the circle is not rendered.
3. **What is the difference between `fill-opacity` and `opacity`?** The former affects fill paint only; the latter affects the composited element or group.
4. **How do `nonzero` and `evenodd` differ?** They use signed winding crossings and crossing parity respectively to decide whether a point is inside a compound shape.
5. **What happens to an odd-length `stroke-dasharray` list?** The list repeats to form an even pattern; it restarts at each subpath.
6. **What does `marker-mid` target?** Intermediate vertices, excluding the first and final path-data vertices.
7. **Why can `<marker>` use `context-stroke`?** Marker content has the referencing shape as context, so the marker paint can match that shape’s stroke.
8. **Does `shape-rendering: crispEdges` guarantee no antialiasing?** No. It asks the user agent to favor crisp edges; the implementation chooses the method.
9. **What does `path-length` affect?** Length-dependent calculations such as dash placement, text-path distance, and motion distance; it does not reshape the path.
10. **What is `text-anchor: middle` centering?** Each SVG text chunk is centered on its text position, not the entire SVG viewport or a CSS box.

## Sources

- [SVG 2 Property Index](https://www.w3.org/TR/SVG2/propidx.html) — exact property metadata, values, initial values, inheritance, and applicability.
- [SVG 2 Geometry Properties](https://www.w3.org/TR/SVG2/geometry.html) — `cx`, `cy`, `r`, `rx`, `ry`, `x`, `y`, viewport percentages, auto radii, and invalid negatives.
- [SVG 2 Paths](https://www.w3.org/TR/SVG2/paths.html) — `d` grammar and animation behavior, path errors, `pathLength` calibration, and the `path-length` property.
- [SVG 2 Painting](https://www.w3.org/TR/SVG2/painting.html) — fill, stroke, opacity, winding, line and dash behavior, markers, `paint-order`, color interpolation, vector effects, and renderer hints.
- [SVG 2 Coordinate Systems and Units](https://www.w3.org/TR/SVG2/coords.html) — SVG viewport and user-coordinate mapping and percentage reference systems.
