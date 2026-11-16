<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Paged Media properties

# Scope and version

This reference explains all 1 supplied names in **CSS Paged Media properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 1 supplied name has an MDN Baseline label, 0 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Paged-media properties control page boxes and page-dependent margins for print or other paginated output. They have limited or varying browser support and may behave differently in print engines. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `page` | The page CSS property is used to specify the named page, a specific type of page defined by the @page at-rule. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/page) |

# Cross-item comparison

Screen layout uses a continuous viewport; paged media creates page fragments with page size, margins, and breaks. Use fragmentation properties for break behavior and paged-media properties for page context.

| Item | How to interpret it |
| --- | --- |
| `page` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Test print styles through the actual browser/renderer used by the audience; do not assume screen preview matches page boxes and printed output.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Assuming every browser supports all page-margin features.
- Using page-size rules to fix screen layout.
- Forgetting links, contrast, and content order in printed output.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `page`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
