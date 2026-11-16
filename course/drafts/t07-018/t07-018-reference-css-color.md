<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Color properties

# Scope and version

This reference explains all 6 supplied names in **CSS Color properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 4 supplied names have an MDN Baseline label, 2 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

CSS Color covers color values, interpolation, color spaces, opacity, profiles, contrast, and newer wide-gamut/HDR functionality. Color behavior depends on the selected space and rendering environment. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `color` | The color CSS property sets the foreground color value of an element's text and text decorations, and sets the currentColor value. currentColor may be used as an indirect value on other properties and is the default for other color properties, such as border-color. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color) |
| `color-scheme` | The color-scheme CSS property allows an element to indicate which color schemes it can comfortably be rendered in. User agents change the following aspects of the UI chrome to match the used color scheme: **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme) |
| `dynamic-range-limit` | The dynamic-range-limit CSS property specifies the maximum luminance allowed for High Dynamic Range (HDR) content. **Support snapshot:** Limited availability. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/dynamic-range-limit) |
| `forced-color-adjust` | The forced-color-adjust CSS property allows authors to opt certain elements out of forced colors mode. This then restores the control of those values to CSS. **Support snapshot:** Limited availability. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/forced-color-adjust) |
| `opacity` | The opacity CSS property sets the opacity of an element. Opacity is the degree to which content behind an element is hidden, and is the opposite of transparency. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/opacity) |
| `print-color-adjust` | The print-color-adjust CSS property sets what, if anything, the user agent may do to optimize the appearance of the element on the output device. By default, the browser is allowed to make any adjustments to the element's appearance it determines to be necessary and prudent given the type and capabilities of the output device. **Support snapshot:** Baseline 2025. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/print-color-adjust) |

# Cross-item comparison

Legacy sRGB syntax remains interoperable; modern syntax can express wider gamuts and perceptual spaces. `color` applies foreground color, while `opacity` composites the entire element group. Relative color functions derive channels from another color; gamut mapping may affect displayed values.

| Item | How to interpret it |
| --- | --- |
| `color` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `color-scheme` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Provide robust foreground/background contrast and test colors on target displays; a numerically valid wide-gamut color can appear differently after gamut mapping.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Assuming all devices display every color space identically.
- Using color alone to communicate status.
- Confusing element opacity with alpha in one color value.
- Treating experimental color/HDR properties as universally supported.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `color`, `color-scheme`, `dynamic-range-limit`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
