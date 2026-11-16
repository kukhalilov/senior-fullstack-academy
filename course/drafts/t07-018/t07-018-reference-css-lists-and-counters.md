<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Lists and Counters properties

# Scope and version

This reference explains all 7 supplied names in **CSS Lists and Counters properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 7 supplied names have an MDN Baseline label, 0 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

List-style properties control markers and their placement; counters provide author-defined nested numbering. Native ordered/unordered list markup should communicate list structure; CSS customizes its presentation. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `counter-increment` | The counter-increment CSS property can be used to increase or decrease the value of the named CSS counters by the specified values, or to prevent all counters or an individual counter's value from being changed. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/counter-increment) |
| `counter-reset` | The counter-reset CSS property creates named CSS counters and initializes their values. It can create both regular and reversed counters. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/counter-reset) |
| `counter-set` | The counter-set CSS property sets CSS counters on the element to the given values. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/counter-set) |
| `list-style` | The list-style CSS shorthand property allows you to set all the list style properties at once. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/list-style) |
| `list-style-image` | The list-style-image CSS property sets an image to be used as the list item marker. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/list-style-image) |
| `list-style-position` | The list-style-position CSS property sets the position of the ::marker relative to a list item. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/list-style-position) |
| `list-style-type` | The list-style-type CSS property sets the marker (such as a disc, character, or custom counter style) of a list item element. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/list-style-type) |

# Cross-item comparison

`list-style-position` controls marker placement; `list-style-type` chooses a marker style; `list-style-image` supplies an image marker. Counter reset/set/increment and `counter()`/`counters()` formatting form a separate generated numbering system.

| Item | How to interpret it |
| --- | --- |
| `counter-increment` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `counter-reset` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Prefer `<ol>` for ordered steps, then use CSS counters only when the visual numbering scheme is more specialized than native list markers.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Using visual counters to replace semantic lists.
- Assuming a list-style image is automatically a meaningful text alternative.
- Mis-scoping nested counter resets.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `counter-increment`, `counter-reset`, `counter-set`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
