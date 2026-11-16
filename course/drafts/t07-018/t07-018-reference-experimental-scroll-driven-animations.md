<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Scroll-Driven Animations properties

# Scope and version

This reference explains all 11 supplied names in **CSS Scroll-Driven Animations properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 11 supplied names have an MDN Baseline label, 0 are marked Limited availability, and 0 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Scroll-driven animation properties connect animation progress to scroll or view progress rather than elapsed time. Timeline source, axis, insets, and ranges determine how progress maps. In the 2026-11-16 MDN capture, the supplied scroll/view timeline and range names are marked Baseline 2026; older browsers may lack them, and specification status remains module-specific. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `animation-range` | The animation-range CSS shorthand property is used to set the start and end of an animation's attachment range along its timeline, i.e., where along the timeline an animation will start and end. **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-range) |
| `animation-range-end` | The animation-range-end CSS property sets the point on the timeline where an animation should end. **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-range-end) |
| `animation-range-start` | The animation-range-start CSS property sets the point on the timeline where an animation should start. **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-range-start) |
| `scroll-timeline` | The scroll-timeline CSS shorthand property is used to define a named scroll progress timeline, which is progressed through by scrolling a scrollable element (scroller) between top and bottom (or left and right). **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-timeline) |
| `scroll-timeline-axis` | The scroll-timeline-axis CSS property is used to specify the scrollbar direction that will be used to provide the timeline for a scroll driven animation, which is progressed through by scrolling a scrollable element (scroller). **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-timeline-axis) |
| `scroll-timeline-name` | The scroll-timeline-name CSS property is used to define the name of a named scroll progress timeline. **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-timeline-name) |
| `timeline-scope` | The timeline-scope CSS property modifies the scope of a named animation timeline. **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/timeline-scope) |
| `view-timeline` | The view-timeline CSS shorthand property defines a named view progress timeline's name, direction, and inset values. **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-timeline) |
| `view-timeline-axis` | The view-timeline-axis CSS property specifies the scroll direction to be used for a named view progress timeline. **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-timeline-axis) |
| `view-timeline-inset` | The view-timeline-inset CSS property is used to specify one or two values representing an adjustment to the position of the scrollport (see Scroll container for more details) in which the subject element of a named view progress timeline animation is deemed to be visible. Put another way, this allows you to specify start and/or end inset (or outset) values that offset the position of the timeline. **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-timeline-inset) |
| `view-timeline-name` | The view-timeline-name CSS property specifies the names of one or more named view progress timelines associated with the element. **Support snapshot:** Baseline 2026. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/view-timeline-name) |

# Cross-item comparison

Document timelines advance with time; scroll timelines advance with a scroll container; view timelines track a subject through a scrollport. Scroll triggers can activate at ranges, while progress timelines continuously map progress.

| Item | How to interpret it |
| --- | --- |
| `animation-range` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `animation-range-end` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

Prototype a nonessential progress animation with `@supports (animation-timeline: scroll())`, and ensure the content is understandable without the effect.



The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Assuming every scroll animation is a trigger or every trigger is a progress timeline.
- Ignoring nested scroll containers and axis selection.
- Treating experimental `timeline-trigger*` properties as a stable cross-browser baseline.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `animation-range`, `animation-range-end`, `animation-range-start`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
