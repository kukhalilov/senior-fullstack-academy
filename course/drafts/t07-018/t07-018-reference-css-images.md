<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Images properties

# Scope and version

This reference explains all 4 supplied names in **CSS Images properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 4 supplied names have an MDN Baseline label, 0 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Image properties define image values, gradients, image resolution/rendering, and replaced-element fitting/positioning. They control painted content but do not provide HTML alternative text or document semantics. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `image-orientation` | The image-orientation CSS property specifies a layout-independent correction to the orientation of an image. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/image-orientation) |
| `image-rendering` | The image-rendering CSS property sets an image scaling algorithm. The property applies to an element itself, to any images set in its other properties, and to its descendants. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/image-rendering) |
| `object-fit` | The object-fit CSS property sets how the content of a replaced element, such as an <img> or <video>, should be resized to fit its container. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit) |
| `object-position` | The object-position CSS property specifies the alignment of the selected replaced element's contents within the element's box. Areas of the box which aren't covered by the replaced element's object will show the element's background. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-position) |

# Cross-item comparison

`object-fit` sizes replaced content inside its box; `object-position` chooses the alignment/crop position. `image-rendering` controls scaling quality hints. Gradients are image values and can be layered like external images.

| Item | How to interpret it |
| --- | --- |
| `image-orientation` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `image-rendering` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Pair `object-fit: cover` with an intentional `object-position` when cropping an image, and provide meaningful alternative text in HTML when the image conveys information.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Confusing visual crop with semantic alternative text.
- Assuming a gradient is a solid color for contrast calculations.
- Ignoring intrinsic image ratio and object positioning.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `image-orientation`, `image-rendering`, `object-fit`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
