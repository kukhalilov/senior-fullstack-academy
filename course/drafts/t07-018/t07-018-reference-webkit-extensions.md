<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: WebKit Extensions properties

# Scope and version

This reference explains all 4 supplied names in **WebKit Extensions properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. These are vendor-prefixed extensions/compatibility names, not a single standard module. Check whether a modern unprefixed equivalent is available. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

These are WebKit-prefixed extensions and compatibility names. Some remain implemented for web compatibility; others are legacy, unsupported, or have an unprefixed/logical replacement. They are not one coherent standardized module. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `-webkit-text-fill-color` | Vendor-prefixed extension: The -webkit-text-fill-color CSS property specifies the fill color of characters of text. If this property is not set, the value of the color property is used. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/-webkit-text-fill-color) |
| `-webkit-text-stroke` | Vendor-prefixed extension: The -webkit-text-stroke CSS shorthand property specifies the width and color of strokes for text characters. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/-webkit-text-stroke) |
| `-webkit-text-stroke-color` | Vendor-prefixed extension: The -webkit-text-stroke-color CSS property specifies the stroke color of characters of text. If this property is not set, the value of the color property is used. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/-webkit-text-stroke-color) |
| `-webkit-text-stroke-width` | Vendor-prefixed extension: The -webkit-text-stroke-width CSS property specifies the width of the stroke for text. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/-webkit-text-stroke-width) |

# Cross-item comparison

Prefer the unprefixed interoperable property or modern logical/flexbox equivalent when it matches the need. A prefixed declaration can be a narrowly tested fallback, but must not be the only implementation unless the target environment explicitly requires it.

| Item | How to interpret it |
| --- | --- |
| `-webkit-text-fill-color` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `-webkit-text-stroke` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Use `text-overflow`, `line-clamp`, or modern flexbox features where they satisfy the goal; verify each legacy alias and target browser instead of assuming every `-webkit-` property is supported.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Treating a vendor prefix as proof of current support or standardization.
- Copying a prefix-only snippet from an old example.
- Using physical-direction aliases when a logical property is correct.
- Assuming two prefixed names with similar spelling are equivalent.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `-webkit-text-fill-color`, `-webkit-text-stroke`, `-webkit-text-stroke-color`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
