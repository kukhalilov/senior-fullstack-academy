<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Masking properties

# Scope and version

This reference explains all 19 supplied names in **CSS Masking properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 11 supplied names have an MDN Baseline label, 7 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Clipping limits painting to a geometric region; masking uses alpha/luminance image data to control visibility. Mask layers combine with positions, sizes, repeats, modes, and compositing operations. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `clip-path` | The clip-path CSS property creates a clipping region that sets what part of an element should be shown. Parts that are inside the region are shown, while those outside are hidden. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/clip-path) |
| `clip-rule` | The clip-rule CSS property determines, when parts of the path overlap other parts, which pixels in a mask's box are inside the clipping shape defined by a clip path and which are outside. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/clip-rule) |
| `mask` | The mask CSS shorthand property hides an element (partially or fully) by masking or clipping a specified area of the image. It is a shorthand for all the mask-* properties. The property accepts one or more comma-separated values, where each value corresponds to a <mask-layer>. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask) |
| `mask-border` | The mask-border CSS shorthand property lets you create a mask along the edge of an element's border. **Support snapshot:** Limited availability. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-border) |
| `mask-border-mode` | The mask-border-mode CSS property specifies the blending mode used in a mask border. **Support snapshot:** no MDN baseline label was captured; check the linked specification and compatibility data. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-border-mode) |
| `mask-border-outset` | The mask-border-outset CSS property specifies the distance by which an element's mask border is set out from its border box. **Support snapshot:** Limited availability. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-border-outset) |
| `mask-border-repeat` | The mask-border-repeat CSS property specifies how the images for the sides and the middle part of the mask border image are scaled and tiled. **Support snapshot:** Limited availability. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-border-repeat) |
| `mask-border-slice` | The mask-border-slice CSS property divides the image set by mask-border-source into regions. These regions are used to form the components of an element's mask border. **Support snapshot:** Limited availability. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-border-slice) |
| `mask-border-source` | The mask-border-source CSS property sets the source image used to create an element's mask border. **Support snapshot:** Limited availability. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-border-source) |
| `mask-border-width` | The mask-border-width CSS property sets the width of an element's mask border. **Support snapshot:** Limited availability. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-border-width) |
| `mask-clip` | The mask-clip CSS property determines the area which is affected by a mask. The painted content of an element must be restricted to this area. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-clip) |
| `mask-composite` | The mask-composite CSS property represents a compositing operation used on the current mask layer with the mask layers below it. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-composite) |
| `mask-image` | The mask-image CSS property sets the image that is used as the mask layer for an element, hiding sections of the element on which the masking image is set based on the alpha channel of the mask image and, depending on the mask-mode property value, the luminance of the mask image's colors. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-image) |
| `mask-mode` | The mask-mode CSS property is set on the element being masked. It sets whether the mask reference defined by the mask-image is treated as a luminance or alpha mask. **Support snapshot:** Limited availability. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-mode) |
| `mask-origin` | The mask-origin CSS property sets the origin of a mask. This property determines the mask positioning area: the area within which a mask image is positioned. HTML elements can have masks contained within their content border box, padding box, or content box, whereas SVG elements (which don't have the associated CSS layout boxes) can have masks contained inside their fill, stroke, or view box. For elements rendered as multiple boxes, such as a <span> of text that spans more than one line, the mask-origin property specifies which boxes the box-decoration-break property operates on to determine the mask positioning area. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-origin) |
| `mask-position` | The mask-position CSS property sets the initial position, relative to the mask position layer set by mask-origin, for each defined mask image. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-position) |
| `mask-repeat` | The mask-repeat CSS property sets how mask images are repeated. A mask image can be repeated along the horizontal axis, the vertical axis, both axes, or not repeated at all. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-repeat) |
| `mask-size` | The mask-size CSS property specifies the sizes of specified mask images. Mask image sizes can be fully or partially constrained to preserve their intrinsic aspect ratios. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-size) |
| `mask-type` | The mask-type CSS property applies to the SVG <mask> element. It defines whether to use the luminance (brightness) or alpha (transparency) content of the mask. This property may be overridden by the mask-mode property. The mask-type property has no effect on image or gradient masks. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/mask-type) |

# Cross-item comparison

`clip-path` produces a hard geometric or path boundary; `mask`/mask-image can provide graded transparency. Masks affect visual rendering, not the underlying DOM, hit testing in all cases, or accessibility exposure.

| Item | How to interpret it |
| --- | --- |
| `clip-path` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `clip-rule` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Keep text and controls usable when decorative masks fail to load; avoid masking essential content without an equivalent fallback.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Treating a visual mask as semantic hiding.
- Assuming masks and clipping have identical hit-testing or edge behavior.
- Forgetting multiple mask layers and list values align by index.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `clip-path`, `clip-rule`, `mask`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
