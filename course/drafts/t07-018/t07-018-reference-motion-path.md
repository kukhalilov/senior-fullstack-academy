<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: Motion Path properties

# Scope and version

This reference explains all 6 supplied names in **Motion Path properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 6 supplied names have an MDN Baseline label, 0 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Motion-path properties place and orient an element along a path. Offset distance and anchor define position, while rotation and path geometry determine orientation and the route. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `offset` | The offset CSS shorthand property sets all the properties required for animating an element along a defined path. The offset properties together help to define an offset transform, a transform that aligns a point in an element (offset-anchor) to an offset position (offset-position) on a path (offset-path) at various points along the path (offset-distance) and optionally rotates the element (offset-rotate) to follow the direction of the path. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/offset) |
| `offset-anchor` | The offset-anchor CSS property specifies the point inside the box of an element traveling along an offset-path that is actually moving along the path. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/offset-anchor) |
| `offset-distance` | The offset-distance CSS property specifies a position along an offset-path for an element to be placed. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/offset-distance) |
| `offset-path` | The offset-path CSS property specifies a path for an element to follow and determines the element's positioning within the path's parent container or the SVG coordinate system. The path is a line, a curve, or a geometrical shape along which the element gets positioned or moves. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/offset-path) |
| `offset-position` | The offset-position CSS property defines the initial position of an element along a path. This property is typically used in combination with the offset-path property to create a motion effect. The value of offset-position determines where the element gets placed initially for moving along an offset path if an offset-path function such as path() does not specify its own starting position. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/offset-position) |
| `offset-rotate` | The offset-rotate CSS property defines the orientation/direction of the element as it is positioned along the offset-path. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/offset-rotate) |

# Cross-item comparison

Motion-path placement is distinct from a transform translation: it follows path geometry and can rotate with the tangent. Motion effects change visual position, not normal-flow allocation.

| Item | How to interpret it |
| --- | --- |
| `offset` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `offset-anchor` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Use a short decorative motion path for a nonessential icon, and preserve a static readable state when animation is reduced or unavailable.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Assuming path movement changes surrounding layout.
- Animating motion without reduced-motion consideration.
- Confusing `offset-*` with unrelated logical inset properties.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `offset`, `offset-anchor`, `offset-distance`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
