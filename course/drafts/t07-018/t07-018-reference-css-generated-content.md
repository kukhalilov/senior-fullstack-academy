<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Generated Content properties

# Scope and version

This reference explains all 2 supplied names in **CSS Generated Content properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 2 supplied names have an MDN Baseline label, 0 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Generated-content properties and counters style list numbering and content inserted by CSS pseudo-elements. The `content` grammar includes strings, images, counters, quotes, attribute values, and in newer syntax an alternative-text component after a slash. Generated text is presentation; essential content and control labels belong in the document or accessible name. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `content` | The content CSS property replaces content with a generated value. It can be used to define what is rendered inside an element or pseudo-element. For elements, the content property specifies whether the element renders normally (normal or none) or is replaced with an image (and associated "alt" text). For pseudo-elements and margin boxes, content defines the content as images, text, both, or none, which determines whether the element renders at all. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content) |
| `quotes` | The CSS quotes property sets how the browser should render quotation marks that are automatically added to the HTML <q> element or added using the open-quotes or close-quotes (or omitted using the no-open-quote and no-close-quote) values of the of the CSS content property. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/quotes) |

# Cross-item comparison

`content` creates pseudo-element content and can change marker generation; counter properties maintain nested custom numbering, while `quotes` chooses language-sensitive quote pairs. CSS Content drafts define alternative text for some generated content, but support and accessibility-tree mapping vary, so essential information should remain in DOM content.

| Item | How to interpret it |
| --- | --- |
| `content` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `quotes` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Use a real heading or button label for essential wording; reserve `::before` content for decorative symbols or supplementary formatting.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Putting essential instructions only in `content`.
- Assuming CSS-generated text is always announced or copied.
- Forgetting counter scope and reset/increment ordering.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `content`, `quotes`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
