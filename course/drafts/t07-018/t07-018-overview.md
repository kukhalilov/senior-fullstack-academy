<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Big-picture orientation and mental model

# Problem and purpose

CSS has many properties because a rendered page involves several kinds of work: choosing values, laying out boxes and text, painting colors and images, and responding to interaction or time. It is tempting to memorize property names in isolation, but a declaration only makes sense when you know which box it affects, how its value is produced, and how it interacts with the rest of the page.

This lesson is the map for the following references. It explains a practical way to reason about a declaration; it does not attempt to teach every property or value. The pinned property inventory and the assigned reference lessons define the exact name coverage.

# Plain-language mental model

Read a CSS declaration as a request with three parts: **which property**, **which value**, and **which element or pseudo-element**. For example, `color: navy` asks the browser to use a color value for text; `padding-inline: 1rem` asks for logical inner spacing; `object-fit: cover` asks how replaced image content fits an already-sized box. The browser does not simply execute declarations from top to bottom. It determines the cascaded value, resolves inheritance and variables, computes values according to the relevant property rules, performs layout where needed, and then paints.

Use this sequence when a style does not behave as expected:

1. **Check the selector and target.** Is the rule matching the intended element, pseudo-element, or state? Does the property apply to the relevant box type?
2. **Check whether the declaration is accepted.** The property must exist in the implementation, and the value must match its grammar. Custom-property substitution can defer this validation until computed-value time.
3. **Find which declaration wins.** The cascade considers origin and importance, cascade layers, specificity, scoping proximity where relevant, and source order. A later rule is not automatically the winner if an earlier rule has greater cascade priority.
4. **Follow the value.** A property can inherit, use an initial value, depend on another property, or resolve relative units and percentages only after layout context is known. “Computed value” and “used value” are different stages in CSS value processing.
5. **Check the effect at the right stage.** Some properties change layout, some affect painting, and some affect interaction or animation. A transform can change where something is painted without reserving new normal-flow space; many other effects follow different rules.
6. **Test the environment.** Check the targeted browser engines, viewport sizes, writing modes, input methods, print needs, and user preferences that matter to the product. A specification’s maturity and a support label are not substitutes for that check.

# How the parts fit together

## Concept map

| Family | First question to ask | Examples of interactions to look for |
| --- | --- | --- |
| Cascade, inheritance, and custom properties | Which value reaches this element, and where did it come from? | Importance, layers, specificity, inherited values, `var()` substitution, invalid-at-computed-value-time declarations |
| Typography and inline layout | How are characters shaped, sized, and arranged into lines? | Font fallback, language, writing mode, whitespace processing, line breaking, baselines, text decoration |
| Color and painting | What is painted, in what order, and how are layers combined? | Color spaces, opacity, backgrounds, borders, masks, filters, blending, forced-colors mode |
| Box, image, and specialized layout | What are the boxes and which model sizes their contents? | Intrinsic size, aspect ratio, replaced elements, SVG, MathML, shapes, ruby, paged media |
| Motion and transforms | Which value changes over time or along a path? | Transform reference boxes, stacking contexts, animation composition, scroll timelines, reduced-motion preferences |
| User-interface properties | How does the control respond to users and platform conventions? | Focus visibility, keyboard and pointer input, native appearance, selection, resizing |

These families are a learning aid, not isolated systems. A font affects line layout; a transform can create a stacking context; filters and blending can change painting relationships; and an image’s intrinsic dimensions can affect layout before it is painted.

# End-to-end walkthrough

Suppose a product card needs a responsive thumbnail, a readable title, a subtle hover effect, and a branded surface. First define the card and image boxes using layout properties. Choose whether the full image or a filled crop matters; for a crop, `object-fit: cover` sizes image content inside the box and `object-position` chooses the visible focal area. Text and font properties then shape the title and its line breaks. Background and border properties paint the surface. A transform can create a hover lift without making normal-flow space for the transformed position, so check overlap and stacking. Preserve a visible keyboard focus state, keep text contrast adequate across the actual surface, and respect motion preferences when the movement is nonessential. Each choice answers a different question; no single “card style” property does all of this.

# When to use it and tradeoffs

- **Shorthand versus explicit longhands:** shorthands are compact, but omitted components can reset longhands. Use them when the reset is intended and inspect the expanded computed result when debugging.
- **Physical versus logical properties:** physical properties name top/right/bottom/left. Logical properties name inline/block start/end and adapt to writing mode and direction. Pick according to whether the design is physically oriented or should follow the text flow.
- **Visual effect versus layout:** visual appearance does not prove that the layout box changed. Inspect box geometry and painted output separately.
- **Convenience versus control:** filters, masks, gradients, animations, and transitions are powerful but can affect performance, readability, contrast, stacking, or accessibility. Prefer the smallest effect that meets the design need.
- **New draft versus interoperable behavior:** a property can appear in an editor’s draft, reference index, or browser without every value being consistently implemented. Label a feature’s maturity accurately and test the actual support requirement.
- **Examples versus contracts:** an example shows one valid use in one context. It does not replace the property’s grammar, applicability, inheritance, computed-value rules, or support data.

# What later lessons cover

The concepts lesson connects the cascade, property value processing, layout, painting, interaction, and animation. Each reference lesson audits its exact supplied names with value behavior, applicability, inheritance, interactions, examples, and pitfalls. Separate practice and interview lessons ask you to diagnose styles and justify tradeoffs. The inventory is the coverage boundary for reference names; linked specifications and version notes explain which behavior is stable, changing, or still a draft.

# Common mistakes

- Assuming CSS declarations are applied in simple source order without cascade priority.
- Assuming an element’s property always changes the element’s outer box. A property may style content inside the box or only change painting.
- Treating inherited values, initial values, and unset values as synonyms. Their effects depend on the property’s inheritance behavior and cascade keywords.
- Assuming a syntactically accepted declaration is guaranteed to have the intended effect. Applicability, computed-value-time validation, layout context, and implementation support still matter.
- Using physical properties when the intended design should follow inline/block direction, or using logical properties without checking the desired writing-mode behavior.
- Assuming a W3C Editor’s Draft is a stable standard, or that a standards publication date tells you browser support.
- Treating examples as support guarantees or as a substitute for checking the exact assigned inventory and property definitions.
- Removing focus indicators, forcing motion, or relying on color alone because a visual example looked correct on one screen.

# Knowledge checks with answers

1. **Why can a declaration written later lose to one written earlier?** Cascade priority is not source order alone; importance, origin, layers, specificity, and scoping rules can outrank later placement.
2. **What should you inspect if `object-fit: cover` does not crop the page background?** It applies to replaced-element content, not a CSS background; background images use `background-size` and `background-position`.
3. **Does a transform normally make surrounding elements reserve space for its painted position?** No. Transforms change visual rendering of the transformed box while normal-flow layout uses its untransformed position; inspect overlap and stacking separately.
4. **How should you choose between `margin-left` and `margin-inline-start`?** Use the physical side when the design intentionally names a screen edge; use the logical side when the spacing should follow the inline text direction.
5. **What does a standards status tell you, and what does it not tell you?** It tells you about the specification’s maturity; it does not establish that a target browser supports every value or behaves identically.
6. **Why read an exact property reference after learning the family overview?** Each property defines its own grammar, applicability, inheritance, value computation, interactions, and status; family membership does not imply shared behavior.

# Sources

- [CSS Cascading and Inheritance Level 5 Editor’s Draft](https://drafts.csswg.org/css-cascade-5/) — cascade order, layers, specificity, scopes, and source order; work in progress.
- [CSS Values and Units Level 4 Editor’s Draft](https://drafts.csswg.org/css-values-4/) — specified, computed, used, and actual value processing; work in progress.
- [CSS Writing Modes Level 4 Editor’s Draft](https://drafts.csswg.org/css-writing-modes-4/) — logical inline/block axes and direction; work in progress.
- [CSS Transforms Level 1](https://drafts.csswg.org/css-transforms-1/) — visual transforms and their relationship to layout and stacking; work in progress.
- [Media Queries Level 5 Editor’s Draft](https://drafts.csswg.org/mediaqueries-5/) — user-preference media features including reduced motion; work in progress.
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) — publication snapshot and specification maturity context.
- [MDN CSS properties reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties) and [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html) — inventory navigation, not evidence of support for every browser/value.
