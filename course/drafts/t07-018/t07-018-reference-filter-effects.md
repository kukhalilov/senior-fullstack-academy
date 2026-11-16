<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: Filter Effects properties

# Scope and version

This reference explains all 6 supplied names in **Filter Effects properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 6 supplied names have an MDN Baseline label, 0 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Filter Effects properties connect CSS filter functions and SVG filter-paint values. Filters can create a new compositing context, increase rendering cost, and change visual contrast or stacking behavior. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `backdrop-filter` | The backdrop-filter CSS property lets you apply graphical effects such as blurring or color shifting to the area behind an element. Because it applies to everything behind the element, to see the effect the element or its background needs to be transparent or partially transparent. **Support snapshot:** Baseline 2024. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter) |
| `color-interpolation-filters` | The color-interpolation-filters CSS property specifies the color space for imaging operations performed via SVG filter effects. If explicitly declared, the value of the CSS property overrides any value given in the element's color-interpolation-filters attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-interpolation-filters) |
| `filter` | The filter CSS property applies graphical effects like blur or color shift to an element. Filters are commonly used to adjust the rendering of images, backgrounds, and borders. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/filter) |
| `flood-color` | The flood-color CSS property defines the color of the current filter primitive subregion in <feFlood> and <feDropShadow> elements within a <filter>. If present, it overrides the element's flood-color attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flood-color) |
| `flood-opacity` | The flood-opacity CSS property defines the opacity of the current filter primitive subregion in <feFlood> and <feDropShadow> elements within a <filter>. If present, it overrides the element's flood-opacity attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flood-opacity) |
| `lighting-color` | The lighting-color CSS property defines the color of the light source for the <feDiffuseLighting> and <feSpecularLighting> SVG lighting filter primitives within an SVG <filter>. If present, it overrides the element's lighting-color attribute. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/lighting-color) |

# Cross-item comparison

`filter` affects the element and its rendered descendants as a filtered image; `backdrop-filter` samples pixels behind a translucent element. SVG filter primitives have distinct inputs, color interpolation, and output effects.

| Item | How to interpret it |
| --- | --- |
| `backdrop-filter` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `color-interpolation-filters` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

A subtle `backdrop-filter: blur(8px)` overlay needs a readable fallback background for browsers that do not support backdrop filtering.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Confusing foreground filtering with backdrop filtering.
- Using filters as the sole conveyance of state or meaning.
- Applying large animated blur/filter surfaces without performance checks.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `backdrop-filter`, `color-interpolation-filters`, `filter`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
