<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Shapes properties

# Scope and version

This reference explains all 3 supplied names in **CSS Shapes properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 3 supplied names have an MDN Baseline label, 0 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

CSS Shapes changes the float exclusion shape so inline content can wrap around nonrectangular geometry. It does not create a general-purpose arbitrary layout engine; shape geometry interacts with floats, margins, and box dimensions. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `shape-image-threshold` | The shape-image-threshold CSS property sets the alpha channel threshold used to extract the shape using an image as the value for shape-outside. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/shape-image-threshold) |
| `shape-margin` | The shape-margin CSS property sets a margin for a CSS shape created using shape-outside. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/shape-margin) |
| `shape-outside` | The shape-outside CSS property defines a shape—which may be non-rectangular—around which adjacent inline content should wrap. By default, inline content wraps around its margin box; shape-outside provides a way to customize this wrapping, making it possible to wrap text around complex objects rather than rectangular boxes. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/shape-outside) |

# Cross-item comparison

`shape-outside` defines the wrapping contour; `shape-margin` expands the exclusion boundary; `shape-image-threshold` interprets image alpha for contours. The float still occupies its normal box and controls where the shape applies.

| Item | How to interpret it |
| --- | --- |
| `shape-image-threshold` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `shape-margin` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Use a circular float with `shape-outside: circle()` for a text wrap, and ensure the reading order remains meaningful without the visual contour.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Expecting shapes to affect non-floated elements as a general layout feature.
- Confusing the visible shape with the float’s actual box.
- Using image alpha without checking the threshold and fallback.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `shape-image-threshold`, `shape-margin`, `shape-outside`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
