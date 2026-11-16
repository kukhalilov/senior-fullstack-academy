<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: Pointer Events properties

# Scope and version

This reference explains all 1 supplied names in **Pointer Events properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 1 supplied name has an MDN Baseline label, 0 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

The `pointer-events` property controls whether an element can be the target of pointer hit testing, with SVG-specific values and HTML applicability rules. It does not disable keyboard focus, events dispatched by script, or accessibility semantics. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `touch-action` | The touch-action CSS property sets how an element's region can be manipulated by a touchscreen user (for example, by zooming features built into the browser). **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/touch-action) |

# Cross-item comparison

Use native disabled state for disabled form controls, not `pointer-events: none`. A transparent overlay may still affect pointer targeting according to its value and stacking position.

| Item | How to interpret it |
| --- | --- |
| `touch-action` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

If a decorative overlay should not intercept clicks, apply pointer-events behavior to that decoration while leaving the actual controls operable.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Treating `pointer-events: none` as a complete disabled state.
- Forgetting keyboard users can still focus an element.
- Using SVG-only values as if they were consistently meaningful on HTML.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `touch-action`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
