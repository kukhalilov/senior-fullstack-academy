<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Exercises and worked solutions

# Goals

Practice tracing property values through the cascade, selecting a suitable property family, recognizing shorthand and layout side effects, writing a robust fallback, and evaluating draft/vendor support.

# Worked example

```css
.card { background: white; background-color: #fff; transform: translateY(-2px); }
```

The background shorthand appears first and sets/reset its included background longhands; the later `background-color` overrides that component. The transform visually moves the card but does not move adjacent flow boxes. Check stacking, focus indicators, contrast, and reduced motion.

# Exercises

1. A long unbroken user-supplied identifier overflows a card. Choose a text wrapping approach and explain the difference between `overflow-wrap` and `word-break`.
2. A button uses `outline: none` and changes only its background on hover. Identify the problem and provide a keyboard focus style.
3. A design asks to animate a card on scroll using `animation-timeline` and `timeline-trigger`. Distinguish progress timelines from trigger features and plan support fallback.
4. A theme uses `--accent` and expects it to animate as a typed color. Explain why registration may matter and which behavior differs from an unregistered custom property.
5. A team wants `will-change: transform` on every card to prevent jank. Explain why this is risky and how to investigate.
6. An SVG icon uses `stroke-color` and fails in stable browsers. Diagnose status and suggest a supported alternative.

# Progressive hints

1. Find the modern standard property and consider whether breaks are permitted at arbitrary positions.
2. Hover is not keyboard focus; outlines do not allocate layout space.
3. A scroll timeline maps progress; a trigger activates at a condition. These draft additions need feature checks.
4. Unregistered custom properties preserve tokens; registration can provide syntax and interpolation behavior.
5. Hints are not guarantees and can use memory/stacking resources.
6. Check whether the property is only present in a First Public Working Draft.

# Complete solutions

1. Use `overflow-wrap: anywhere` where arbitrary long-token breaks are acceptable. `word-break` changes line-break opportunities more broadly; `word-wrap` is a legacy alias of `overflow-wrap`. Test long URLs and multilingual text.
2. Provide a visible `:focus-visible` indicator that remains clear in forced colors, e.g. `outline: 3px solid currentColor; outline-offset: 2px`. Do not rely only on hover or color.
3. `animation-timeline` associates progress with a scroll/view timeline; `timeline-trigger*` draft properties define activation behavior. Guard nonessential effects with support checks, honor reduced motion, and keep content understandable without animation.
4. `@property` can specify a syntax, inheritance, and initial value, which makes typed interpolation possible for supported values. An unregistered custom property is an untyped token sequence; it does not necessarily interpolate as a color.
5. `will-change` is a hint with memory and rendering costs, not a promise of acceleration. Profile first, scope to the few elements about to change, and remove the hint afterward.
6. `stroke-color` belongs to a W3C First Public Working Draft. Use established SVG `stroke`/`color` mechanisms for reliable behavior and verify actual implementation support before progressive enhancement.

# Tests and edge cases

Inspect computed values and cascade layers; test RTL and vertical writing modes for logical properties; zoom/reflow and forced colors for UI; no-prefers-motion and reduced-motion states; unsupported-property fallback; print output; long/untrusted text; and representative browser engines. Profile complex animations and filters on constrained devices.

# Reflection questions

- Which declaration won and why?
- Is the property stable, vendor-specific, aliased, experimental, or merely included in a draft index?
- What changes in layout versus only paint/compositing?
- What does the fallback do when the browser ignores the declaration?
- Which tests confirm usability as well as visual appearance?

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS properties reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
