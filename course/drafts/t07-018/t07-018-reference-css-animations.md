<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Animations properties

# Scope and version

This reference explains all 21 supplied names in **CSS Animations properties**. Property names and short descriptions were captured for offline use from the linked property references on 2026-11-16. 10 supplied names have an MDN Baseline label, 11 are marked Limited availability, and 11 are explicitly marked Experimental in the 2026-11-16 capture. Each row preserves the individual status; an absent Baseline label does not by itself prove absence of every implementation. The CSS Snapshot 2026 describes specification stability rather than browser adoption. [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)

# How this group fits the mental model

Animation properties define named keyframes, timeline, duration, delay, iteration, direction, fill, easing, composition, and newer triggers. The `animation` shorthand combines several longhands; list-valued longhands align by list position and repetition rules. Each property definition still has its own value grammar, applicability, inheritance, computed-value rules, and browser support. Read the name together with its linked reference; do not infer a full grammar from the name alone.

# Supplied names explained

| Exact inventory name | Meaning |
| --- | --- |
| `animation` | The animation CSS shorthand property applies an animation between styles. It is a shorthand for animation-name, animation-duration, animation-timing-function, animation-delay, animation-iteration-count, animation-direction, animation-fill-mode, animation-play-state, and animation-timeline. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation) |
| `animation-composition` | The animation-composition CSS property specifies the composite operation to use when multiple animations affect the same property simultaneously. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-composition) |
| `animation-delay` | The animation-delay CSS property specifies the amount of time to wait from applying the animation to an element before beginning to perform the animation. The animation can start later, immediately from its beginning, or immediately and partway through the animation. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-delay) |
| `animation-direction` | The animation-direction CSS property sets whether an animation should play forward, backward, or alternate back and forth between playing the sequence forward and backward. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-direction) |
| `animation-duration` | The animation-duration CSS property sets the length of time that an animation takes to complete one cycle. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-duration) |
| `animation-fill-mode` | The animation-fill-mode CSS property sets how a CSS animation applies styles to its target before and after its execution. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-fill-mode) |
| `animation-iteration-count` | The animation-iteration-count CSS property sets the number of times an animation sequence should be played before stopping. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-iteration-count) |
| `animation-name` | The animation-name CSS property specifies the names of one or more @keyframes at-rules that describe the animation to apply to an element. Multiple @keyframes at-rules are specified as a comma-separated list of names. If the specified name does not match any @keyframes at-rule, no properties are animated. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-name) |
| `animation-play-state` | The animation-play-state CSS property sets whether an animation is running or paused. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-play-state) |
| `animation-timing-function` | The animation-timing-function CSS property sets how an animation progresses through the duration of each cycle. **Support snapshot:** Baseline. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timing-function) |
| `animation-trigger` | The animation-trigger CSS property specifies whether CSS animations declared on an element are triggered animations (or not) and, if so, what their triggers are and how they should behave when the trigger becomes active or inactive. This is used to create scroll-triggered animations. **Support snapshot:** Limited availability; MDN marks the feature experimental. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-trigger) |
| `timeline-trigger` | The timeline-trigger CSS shorthand property defines a scroll-triggered animation trigger on an element. **Support snapshot:** Limited availability; MDN marks the feature experimental. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/timeline-trigger) |
| `timeline-trigger-activation-range` | The timeline-trigger-activation-range CSS shorthand property specifies the start and end of a scroll-triggered animation trigger's activation range. **Support snapshot:** Limited availability; MDN marks the feature experimental. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/timeline-trigger-activation-range) |
| `timeline-trigger-activation-range-end` | The timeline-trigger-activation-range-end CSS property specifies the end of a scroll-triggered animation trigger's activation range. **Support snapshot:** Limited availability; MDN marks the feature experimental. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/timeline-trigger-activation-range-end) |
| `timeline-trigger-activation-range-start` | The timeline-trigger-activation-range-start CSS property specifies the start of a scroll-triggered animation trigger's activation range. **Support snapshot:** Limited availability; MDN marks the feature experimental. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/timeline-trigger-activation-range-start) |
| `timeline-trigger-active-range` | The timeline-trigger-active-range CSS shorthand property specifies a scroll-triggered animation trigger's active range. **Support snapshot:** Limited availability; MDN marks the feature experimental. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/timeline-trigger-active-range) |
| `timeline-trigger-active-range-end` | The timeline-trigger-active-range-end CSS property specifies the end of a scroll-triggered animation trigger's active range. **Support snapshot:** Limited availability; MDN marks the feature experimental. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/timeline-trigger-active-range-end) |
| `timeline-trigger-active-range-start` | The timeline-trigger-active-range-start CSS property specifies the start of a scroll-triggered animation trigger's active range. **Support snapshot:** Limited availability; MDN marks the feature experimental. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/timeline-trigger-active-range-start) |
| `timeline-trigger-name` | The timeline-trigger-name CSS property specifies a scroll-triggered animation trigger's identifier(s). **Support snapshot:** Limited availability; MDN marks the feature experimental. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/timeline-trigger-name) |
| `timeline-trigger-source` | The timeline-trigger-source CSS property specifies the timeline that will trigger a scroll-triggered animation. **Support snapshot:** Limited availability; MDN marks the feature experimental. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/timeline-trigger-source) |
| `trigger-scope` | The trigger-scope CSS property can be used to limit the scope of a scroll-triggered animation trigger name to a document subtree. **Support snapshot:** Limited availability; MDN marks the feature experimental. [MDN/spec reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/trigger-scope) |

# Cross-item comparison

Time-based animations use a document timeline; scroll/view timelines map progress to scroll state. Animation trigger properties are draft-level evolving syntax. `animation-fill-mode` controls styles outside the active interval, not whether the animation runs.

| Item | How to interpret it |
| --- | --- |
| `animation` | See its individual linked definition above; apply its property-specific value grammar and context. |
| `animation-composition` | See its individual linked definition above; apply its property-specific value grammar and context. |

# Examples

A short opacity animation can signal a nonessential appearance change; content must remain available without waiting for it.

```css
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }
.notice { animation: fade 180ms ease-out both; }
```

The example is a starting point for reasoning, not a support guarantee. Inspect the computed style and test the rendered result in the browsers and writing modes relevant to the project.

# Common mistakes

- Assuming `animation` shorthand retains previous longhand values; omitted shorthand components reset to their initial values.
- Animating expensive layout properties without measuring performance.
- Ignoring reduced-motion preferences or making essential information available only during motion.
- Treating animation-trigger properties as a stable baseline.
- Assuming a property listed by an index is a stable or interoperable standard.
- Treating a shorthand, alias, vendor extension, or draft property as interchangeable with its neighboring names.
- Skipping value grammar, inheritance, cascade, and applicable-box details in the linked definition.

# Knowledge checks with answers

1. **Which exact names are representative of this group?** `animation`, `animation-composition`, `animation-delay`. Consult each linked row for its specific behavior.
2. **Does inclusion in this inventory prove support?** No; check the linked reference and target browser support data.
3. **What should be checked before using one of these properties?** Its grammar, applicability, inheritance, status, interactions, and fallback needs.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
