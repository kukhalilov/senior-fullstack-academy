<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS View Transitions properties

# Scope and version

This reference explains all 3 supplied names in **CSS View Transitions properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 2 supplied names have an MDN Baseline label, 1 is marked Limited availability, and 1 is explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

View-transition properties coordinate visual snapshots between document states or navigations. They work with the View Transition API and pseudo-elements; CSS naming and animation rules style snapshots, not the underlying semantic content. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `view-transition-class` | The view-transition-class CSS property provides the selected elements with one or more identifying classes (<custom-ident>s), providing an additional method of styling the view transitions for those elements. **Support snapshot:** Baseline 2025. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-transition-class) |
| `view-transition-name` | The view-transition-name CSS property specifies the view transition snapshot that selected elements will participate in. This enables you to animate those elements separately from the rest of the page, which uses the default cross-fade animation during a view transition. You can then define custom animation styles for these elements. **Support snapshot:** Baseline 2025. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-transition-name) |
| `view-transition-scope` | The view-transition-scope CSS property enables the discoverability of elements with view-transition-name values set on them (and therefore the creation of view transition snapshots) to be isolated to a specific element subtree. **Support snapshot:** Limited availability; MDN marks the feature experimental. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-transition-scope) |

# Cross-item comparison

A transition can be same-document or cross-document depending on API and navigation support. `view-transition-name` associates elements across states; group/image-pair/old/new pseudo-elements expose snapshot layers. Support and navigation integration vary.

| Item | How to interpret it |
| --- | --- |
| `view-transition-class` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `view-transition-name` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Keep navigation and content updates correct without animation first; add a view transition as progressive enhancement and honor reduced-motion preferences.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Assuming a CSS property alone starts a view transition.
- Using duplicate transition names in a snapshot when the API requires unique association.
- Making essential state understandable only through the visual animation.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `view-transition-class`, `view-transition-name`, `view-transition-scope`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
