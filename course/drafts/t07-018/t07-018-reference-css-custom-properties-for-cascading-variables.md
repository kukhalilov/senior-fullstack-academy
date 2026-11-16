<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Custom Properties for Cascading Variables properties

# Scope and version

This reference explains all 1 supplied names in **CSS Custom Properties for Cascading Variables properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. Custom properties are part of the CSS cascade model; registered and unregistered custom properties have different typing and inheritance behavior. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Custom properties participate in the cascade and inherit by default. `var()` substitutes their computed token stream into another declaration; registration with `@property` can add a syntax, inheritance behavior, an initial value, and typed interpolation. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `--*` | Property names that are prefixed with --, like --example-name, represent custom properties that contain a value that can be used in other declarations using the var() function. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/--*) |

# Cross-item comparison

Unregistered custom properties preserve token sequences and can be used in many property values, but invalid substitution can invalidate the consuming declaration at computed-value time. Registered custom properties are typed and may animate by computed value; their inheritance and initial-value rules depend on registration.

| Item | How to interpret it |
| --- | --- |
| `--*` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

A component can inherit one theme value and use a fallback when no custom value is supplied.

```css
:root { --brand: rebeccapurple; }
.button { color: var(--brand, navy); }
```

The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Assuming `var()` is textual preprocessing; substitution occurs in CSS value processing.
- Assuming a fallback is used whenever a custom property is empty or has any unexpected token sequence.
- Forgetting unregistered custom properties inherit and are case-sensitive.
- Using `@property` without a valid syntax and required initial-value/inherits behavior.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `--*`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
