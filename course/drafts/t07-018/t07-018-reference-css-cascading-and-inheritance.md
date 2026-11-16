<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Cascading and Inheritance properties

# Scope and version

This reference explains all 1 supplied names in **CSS Cascading and Inheritance properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 1 supplied name has an MDN Baseline label, 0 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

The `all` shorthand resets most properties on an element to a CSS-wide keyword, but excludes custom properties and directionality/unicode-bidi properties. It is a cascade tool, not a complete reset stylesheet. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `all` | The all CSS shorthand property resets all of an element's properties except unicode-bidi, direction, and CSS Custom Properties. It can set properties to their initial or inherited values, or to the values specified in another cascade layer or stylesheet origin. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/all) |

# Cross-item comparison

`all: initial` applies each property’s initial value; `inherit` forces inherited values; `unset` acts as inherit for naturally inherited properties and initial otherwise; `revert` and `revert-layer` roll back to earlier cascade origins/layers.

| Item | How to interpret it |
| --- | --- |
| `all` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

A component can use `all: unset` only with a clear plan to restore needed display, font, focus, and interaction styles; applying it indiscriminately can remove useful defaults.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Assuming `all` resets custom properties or directionality.
- Confusing `revert` with `initial`.
- Using reset shorthands without restoring accessibility-critical focus styles.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `all`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
