<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Ruby properties

# Scope and version

This reference explains all 3 supplied names in **CSS Ruby properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 2 supplied names have an MDN Baseline label, 1 is marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Ruby properties style interlinear annotations commonly used to provide pronunciation or short readings alongside East Asian base text. Ruby markup establishes base/annotation relationships; properties control placement, alignment, spacing, merging, and overhang. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `ruby-align` | The ruby-align CSS property defines the distribution of the different ruby elements over the base. **Support snapshot:** Baseline 2024. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/ruby-align) |
| `ruby-overhang` | The ruby-overhang CSS property specifies whether or not a <ruby> annotation overhangs any surrounding text. **Support snapshot:** Limited availability. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/ruby-overhang) |
| `ruby-position` | The ruby-position CSS property defines the position of a ruby element relative to its base element. It can be positioned over the element (over), under it (under), or to the right (inter-character). **Support snapshot:** Baseline 2024. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/ruby-position) |

# Cross-item comparison

`ruby-position` controls annotation placement; `ruby-align` aligns annotation and base; `ruby-merge` governs shared annotation space for group readings; `ruby-overhang` controls whether annotations can extend. Support varies, especially for advanced values.

| Item | How to interpret it |
| --- | --- |
| `ruby-align` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `ruby-overhang` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Use semantic `<ruby>` markup for base and annotation text, then apply ruby properties only where their supported behavior improves readability.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Styling ruby as unrelated superscript text and losing the association.
- Assuming all ruby values work identically across engines.
- Using merge/overhang behavior without testing line breaks and Japanese compound readings.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `ruby-align`, `ruby-overhang`, `ruby-position`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
