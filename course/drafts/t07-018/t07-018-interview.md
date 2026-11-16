<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Interview questions and reasoning

# Core questions

Explain how you determine property meaning, maturity, and behavior instead of relying on names or remembered snippets.

# Concise interview answers

1. **What steps occur after a declaration is parsed?** The cascade selects a declaration; value substitution/defaulting and computation produce values that layout/painting consume. Valid syntax alone does not prove a visible effect.
2. **What does a shorthand do?** It sets a defined set of longhands and resets omitted components to their initial values.
3. **How do custom properties differ from ordinary variables in a programming language?** They participate in the CSS cascade and usually inherit; `var()` substitution follows CSS value processing. `@property` can register syntax and inheritance/initial behavior.
4. **Does transform change normal flow?** No; it changes visual rendering and can affect stacking and containing-block behavior.
5. **What does CSS Snapshot 2026 mean?** A W3C Group Note profiling specification stability, not one browser feature release or support table.
6. **How do you handle a newly listed property?** Read its linked specification/MDN definition, identify standards status, check target-browser implementation, use `@supports` when useful, and retain a usable fallback.

# Deep follow-up answers

Shorthand resets matter because a later `animation` or `background` declaration can silently clear earlier longhands. Custom properties defer value substitution, so an invalid token sequence may invalidate a consuming declaration at computed-value time. Logical properties use inline/block axes and therefore adapt to writing mode. Effects that only alter paint (transform, filter, opacity) have different layout and performance consequences than sizing or typography properties. Specification maturity and deployment remain separate dimensions.

# Scenario questions

1. **A property appears in MDN but has no support in the target Safari version. What do you do?** Provide a baseline design using interoperable properties; use the new declaration as progressive enhancement after checking runtime support.
2. **The computed style contains your value but the display looks unchanged. Why?** The property may not apply to the element/box, the value may compute to an equivalent/default result, a later paint/layout rule may dominate, or the property may be unsupported/partially implemented.
3. **A scroll animation is smooth on desktop but causes issues on mobile. What do you inspect?** Timeline source/axis and nested scrollers, compositing and layout cost, reduced-motion behavior, fallback, and target device performance.

# Tradeoffs and alternatives

Shorthands improve concision but hide resets; longhands are clearer for overrides. Logical properties improve localization but require understanding writing modes. Native/browser defaults reduce implementation burden, while resets increase control but can remove useful affordances. New features can simplify code but require progressive enhancement and support testing.

# Common weak answers

- “The property is in CSS so all browsers support it.”
- “The W3C Snapshot means it is widely implemented.”
- “Transform changes layout.”
- “A custom property is a JavaScript variable.”
- “Use a reset to remove unwanted browser styles” without considering focus and accessibility.
- “The animation works on my laptop” without reduced-motion, performance, and support checks.

# Self-check rubric

Score 0–2 for each answer: accurate property meaning; cascade/layout/paint model; version and support distinction; concrete fallback; and meaningful verification. A strong answer separates stable specifications from experimental entries and user-facing behavior from implementation details.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS properties reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
