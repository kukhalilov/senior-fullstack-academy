<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Transitions properties

# Scope and version

This reference explains all 6 supplied names in **CSS Transitions properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 5 supplied names have an MDN Baseline label, 1 is marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Transition properties interpolate between computed values when a property changes. They control property selection, duration, delay, easing, and newer discrete-transition behavior; transitions are triggered by state changes rather than keyframe timelines. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `transition` | The transition CSS shorthand property for transition-property, transition-duration, transition-timing-function, transition-delay, and transition-behavior. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition) |
| `transition-behavior` | The transition-behavior CSS property specifies whether transitions will be started for properties whose animation behavior is discrete. **Support snapshot:** Limited availability. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-behavior) |
| `transition-delay` | The transition-delay CSS property specifies the duration to wait before starting a property's transition effect when its value changes. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-delay) |
| `transition-duration` | The transition-duration CSS property sets the length of time a transition animation should take to complete. By default, the value is 0s, meaning that no animation will occur. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-duration) |
| `transition-property` | The transition-property CSS property sets the CSS properties to which a transition effect should be applied. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-property) |
| `transition-timing-function` | The transition-timing-function CSS property sets how intermediate values are calculated for CSS properties being affected by a transition effect. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-timing-function) |

# Cross-item comparison

Transitions need a before/after computed value and usually run when style changes. Animations define keyframes and can repeat or run independently. `transition-behavior` controls whether discrete properties may transition where supported.

| Item | How to interpret it |
| --- | --- |
| `transition` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `transition-behavior` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Transition opacity between two computed states while keeping content and controls usable in either state.

```css
.panel { opacity: 0; transition: opacity 160ms ease; }
.panel.is-open { opacity: 1; }
```

The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Assuming nonanimatable properties interpolate continuously.
- Using a transition duration without a reduced-motion alternative.
- Forgetting shorthand values reset omitted transition longhands.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `transition`, `transition-behavior`, `transition-delay`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
