<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Big-picture orientation and mental model

# Problem and purpose

CSS has hundreds of properties because visual presentation spans layout, text, color, painting, interaction, motion, and specialized media. Learning a property as an isolated name is ineffective: each property participates in the cascade, has a value grammar, applies to particular boxes, and interacts with browser rendering and other properties.

# Plain-language mental model

Think of a stylesheet as a set of declarations competing through the cascade to compute values for elements and pseudo-elements. A property name selects the kind of behavior; its value chooses the specific behavior. The browser then applies module rules to layout and paint. The same declaration may behave differently when inheritance, writing mode, containing blocks, animation, or browser support changes.

This curriculum uses the pinned MDN property dataset for the names, individual MDN property descriptions for the short explanations, and W3C CSS Snapshot 2026 for specification status. CSS modules evolve independently. The 2026 snapshot is a stable specification profile, not a single “CSS 2026” release and not a browser support matrix. Vendor-prefixed, alias, and experimental entries are explicitly called out.

# How the parts fit together

1. Read the property's purpose and accepted grammar.
2. Check whether it is a shorthand, longhand, alias, vendor extension, or experimental entry.
3. Determine which elements/boxes it applies to, whether it inherits, and how its computed value is formed.
4. Identify interactions with related properties, writing modes, stacking, layout, and animations.
5. Check target-browser support and provide a fallback when required.
6. Inspect the computed result and test responsive, accessibility, performance, and reduced-motion behavior.

# Concept map

| Family | Question | Typical concerns |
| --- | --- | --- |
| Cascade and variables | Which declaration wins and how are values reused? | Specificity, layers, custom properties, invalid substitutions |
| Typography and inline layout | How are glyphs shaped and arranged into lines? | Font fallback, baselines, wrapping, language, line boxes |
| Color and painting | What is drawn and how are layers combined? | Color spaces, backgrounds, borders, filters, masks, blending |
| Motion and transforms | How does presentation change over time or space? | Stacking, compositing, scroll timelines, reduced motion |
| Specialized modules | Which domain-specific model applies? | SVG, MathML, ruby, printing, shapes, view transitions |

# End-to-end walkthrough

Suppose a card needs a responsive image, readable title, subtle hover lift, and a branded surface. Use an image-fitting property for the replaced image, text/font properties for the heading, a transform for the lift, and background/border properties for the surface. Check that the transform does not change the flow, the image crop preserves the subject, focus styles remain visible, contrast holds across the background, motion is optional, and unsupported effects retain a usable fallback.

# When to use it and tradeoffs

Prefer the simplest standardized property that expresses the desired behavior. Shorthands reduce repetition but reset omitted longhands; logical properties adapt to writing modes but require understanding inline/block axes; powerful filters and animations can cost performance; experimental entries may not interoperate. Treat the W3C status and implementation support as separate facts.

# What later lessons cover

The concepts lesson teaches how property families fit together. Each reference covers an exact supplied property group with concise individual explanations, comparisons, examples, and pitfalls. Practice applies the cascade, text/layout, painting, and motion model; interview questions test tradeoffs and support judgment.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS properties reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
