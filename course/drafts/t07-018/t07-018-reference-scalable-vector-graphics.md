<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: Scalable Vector Graphics properties

# Scope and version

This reference explains all 31 supplied names in **Scalable Vector Graphics properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 29 supplied names have an MDN Baseline label, 1 is marked Limited availability, and 1 is explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

SVG presentation attributes can be styled through CSS when the SVG element and property are applicable. SVG has a separate coordinate, paint, and geometry model; many fill/stroke features are draft additions rather than established browser behavior. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `cx` | The cx CSS property defines the x-axis center point of an SVG <circle> or <ellipse> element. If present, it overrides the element's cx attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/cx) |
| `cy` | The cy CSS property defines the y-axis center point of an SVG <circle> or <ellipse> elements. If present, it overrides the element's cy attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/cy) |
| `d` | The d CSS property defines a path to be drawn by the SVG <path> element. If present, it overrides the element's d attribute. **Support snapshot:** Limited availability. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/d) |
| `fill` | The fill CSS property defines how SVG text content and the interior canvas of SVG shapes are filled or painted. If present, it overrides the element's fill attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/fill) |
| `fill-opacity` | The fill-opacity CSS property defines the opacity of the painting operation (color, gradient, pattern, etc.) applied to SVG shapes or text content elements to fill the element. The property defines the opacity of the element's fill only; it does not affect the stroke. If present, it overrides the element's fill-opacity attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/fill-opacity) |
| `fill-rule` | The fill-rule CSS property defines the rule used to determine which parts of the SVG shape's canvas are included inside a shape to be filled. If present, it overrides the element's fill-rule attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/fill-rule) |
| `marker` | The marker CSS property points to a marker that will be drawn on the first, middle, and last vertices of the element's path; that is, at all of its vertices. The marker must have been defined using an SVG <marker> element, and can only be referenced with a <url> value. The value of the CSS property overrides any values of the marker-start, marker, and marker-end attributes in the SVG. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/marker) |
| `marker-end` | The marker-end CSS property points to a marker that will be drawn on the last vertex of the element's path; that is, at its ending vertex. The marker must have been defined using an SVG <marker> element, and can only be referenced with a <url> value. The value of the CSS property overrides any values of the marker-end attribute in the SVG. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/marker-end) |
| `marker-mid` | The marker-mid CSS property points to a marker that will be drawn on the middle vertices of the element's path; that is, at each of its vertices between the start and end vertices. The marker must have been defined using an SVG <marker> element, and can only be referenced with a <url> value. The value of the CSS property overrides any values of the marker-mid attribute in the SVG. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/marker-mid) |
| `marker-start` | The marker-start CSS property points to a marker that will be drawn on the first vertex of the element's path; that is, at its starting vertex. The marker must have been defined using an SVG <marker> element, and can only be referenced with a <url> value. The value of the CSS property overrides any values of the marker-start attribute in the SVG. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/marker-start) |
| `paint-order` | The paint-order CSS property lets you control the order in which the fill and stroke (and painting markers) of text content and shapes are drawn. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/paint-order) |
| `path-length` | The path-length CSS property specifies a total path length, in user units. All path computations are then scaled using the ratio path-length / (computed value of path length) — this includes text paths, animation paths, and various stroke operations. **Support snapshot:** no MDN baseline label was captured; check the linked specification and compatibility data. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/path-length) |
| `r` | The r CSS property defines the radius of a circle. It can only be used with the SVG <circle> element. If present, it overrides the circle's r attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/r) |
| `rx` | The rx CSS property defines the x-axis, or horizontal, radius of an SVG <ellipse> and the horizontal curve of the corners of an SVG <rect> rectangle. If present, it overrides the shape's rx attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/rx) |
| `ry` | The ry CSS property defines the y-axis, or vertical, radius of an SVG <ellipse> and the vertical curve of the corners of an SVG <rect> rectangle. If present, it overrides the shape's ry attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/ry) |
| `shape-rendering` | The shape-rendering CSS property provides hints to the renderer about what tradeoffs to make when rendering shapes like paths, circles, or rectangles. It only has an effect on the <circle>, <ellipse>, <line>, <path>, <polygon>, <polyline>, and <rect> elements. If explicitly declared, the value of the CSS property overrides the any values of the element's shape-rendering attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/shape-rendering) |
| `stop-color` | The stop-color CSS property defines the color to use for an SVG <stop> element within a gradient. If present, it overrides the element's stop-color attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/stop-color) |
| `stop-opacity` | The stop-opacity CSS property defines the opacity of a given color gradient stop in the SVG <stop> element within an SVG gradient. If present, it overrides the element's stop-opacity attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/stop-opacity) |
| `stroke` | The stroke CSS property defines the color or SVG paint server used to draw an element's stroke. As such, stroke only has an effect on elements that can be given a stroke (for example, <rect> or <ellipse>); see the page on the SVG stroke attribute for a complete list. When declared, the CSS value overrides any value of the element's stroke SVG attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/stroke) |
| `stroke-dasharray` | The stroke-dasharray CSS property defines a pattern of dashes and gaps used in the painting of the SVG shape's stroke. If present, it overrides the element's stroke-dasharray attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/stroke-dasharray) |
| `stroke-dashoffset` | The stroke-dashoffset CSS property defines an offset for the starting point of the rendering of an SVG element's associated dash array. If present, it overrides the element's stroke-dashoffset attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/stroke-dashoffset) |
| `stroke-linecap` | The stroke-linecap CSS property defines the shape to be used at the end of open subpaths of SVG elements' unclosed strokes. If present, it overrides the element's stroke-linecap attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/stroke-linecap) |
| `stroke-linejoin` | The stroke-linejoin CSS property defines the shape to be used at the corners of an SVG element's stroked paths. If present, it overrides the element's stroke-linejoin attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/stroke-linejoin) |
| `stroke-miterlimit` | The stroke-miterlimit CSS property defines a limit on the ratio of the miter length to the stroke-width when the shape to be used at the corners of an SVG element's stroked path is a mitered join. If the limit defined by this property is exceeded, the join is converted from miter to bevel, thus making the corner appear truncated. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/stroke-miterlimit) |
| `stroke-opacity` | The stroke-opacity CSS property defines the opacity of an SVG shape's stroke. The effect is identical to that of opacity, except it is applied only to the stroke, not to the entire element. If present, it overrides the element's stroke-opacity attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/stroke-opacity) |
| `stroke-width` | The stroke-width CSS property defines the width of a stroke applied to the SVG shape. If present, it overrides the element's stroke-width attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/stroke-width) |
| `text-anchor` | The text-anchor CSS property aligns a box containing a string of text where the wrapping area is determined from the inline-size property, and the text is then placed relative to the anchor point of the element, which is defined using the x and y (or dx and dy) attributes. If present, the value of the CSS property overrides any value of the element's text-anchor attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-anchor) |
| `text-rendering` | The text-rendering CSS property provides information to the rendering engine about what to optimize for when rendering text. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-rendering) |
| `vector-effect` | The vector-effect CSS property suppresses specific transformation effects in SVG, thus permitting effects like a road on a map staying the same width no matter how the map is zoomed, or allowing a diagram key to retain its position and size regardless of other transforms. It can only be used with SVG elements that accept the vector-effect attribute. When used, the CSS value overrides any values of the element's vector-effect attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/vector-effect) |
| `x` | The x CSS property defines the x-axis coordinate of the top left corner of the SVG <rect> shape, <image> image, <foreignObject> viewport or nested <svg> viewport relative to the nearest <svg> ancestor's user coordinate system. If present, it overrides the element's x attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/x) |
| `y` | The y CSS property defines the y-axis coordinate of the top left corner of the SVG <rect> shape, <image> image, <foreignObject> viewport and nested <svg> viewport relative to the nearest <svg> ancestor's user coordinate system. If present, it overrides the element's y attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/y) |

# Cross-item comparison

SVG presentation attributes and CSS declarations participate in different precedence positions in the cascade. `fill` paints interiors; `stroke` paints outlines. New stroke geometry/paint properties extend this model but must be treated according to the cited draft and browser support.

| Item | How to interpret it |
| --- | --- |
| `cx` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `cy` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Use `fill` and `stroke` for ordinary SVG shapes, and keep meaningful SVG labels/semantics in the SVG/HTML content rather than relying on paint alone.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Assuming every SVG-specific property applies to HTML boxes.
- Confusing CSS fill/stroke presentation properties with SVG attributes.
- Teaching draft stroke geometry as a widely implemented baseline.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `cx`, `cy`, `d`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
