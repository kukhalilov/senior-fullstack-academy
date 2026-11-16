<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: MathML properties

# Scope and version

This reference explains all 2 supplied names in **MathML properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 2 supplied names have an MDN Baseline label, 0 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

These CSS properties style MathML layout and mathematical presentation. MathML structure carries mathematical relationships; CSS should not replace that structure with visually positioned ordinary text. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `math-depth` | The math-depth property describes a notion of depth for each element of a mathematical formula, with respect to the top-level container of that formula. This is used to scale the computed value of the font-size of elements when font-size: math is applied. **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/math-depth) |
| `math-style` | The math-style property indicates whether MathML equations should render with normal or compact height. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/math-style) |

# Cross-item comparison

Use the specified MathML properties only on relevant MathML layout boxes. Browser support and exact behavior vary by implementation; verify equations with assistive technology as well as visual rendering.

| Item | How to interpret it |
| --- | --- |
| `math-depth` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `math-style` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Keep a semantic MathML expression and use these properties only for its presentation; provide a textual explanation for complex notation when the surrounding lesson needs it.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Assuming visual math layout alone exposes equation structure.
- Applying MathML-specific properties to unrelated HTML boxes.
- Treating emerging MathML styling support as universal.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `math-depth`, `math-style`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
