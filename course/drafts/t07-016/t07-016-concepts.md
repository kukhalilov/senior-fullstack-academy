# CSS selectors at-rules cascade values and box model — Core concepts and how they fit together

## Learning objectives

Explain selector matching and specificity, apply cascade order including layers and scope proximity, distinguish CSS value stages, reason about box sizing, and separate standards maturity from browser support.

## Prerequisites

Know basic HTML elements, attributes, and the DOM tree. This lesson does not teach flexbox, grid, positioning, typography, or CSSOM JavaScript APIs.

## Core concepts

**Rules match before they compete.** A selector determines whether a style rule applies. Combinators relate elements; pseudo-classes test state/structure; pseudo-elements target generated/special content. A syntactically valid selector can match nothing. Selector lists and nesting have specificity rules that should be read from the specification rather than guessed from visual complexity.

**The cascade is ordered, not “most specific always wins.”** First declarations are filtered for relevance. The winning declaration is then chosen by origin and importance, encapsulation context, style attribute, layer ordering, specificity, scoping proximity, and source order. Transitions have highest precedence; animations outrank normal declarations but are below important declarations; important user/UA declarations can outrank author rules. Normal unlayered author declarations beat normal declarations in explicit layers; important layer ordering reverses. `!important` changes cascade priority and can make overrides harder; it is not a universal debugging fix. See [CSS Cascading and Inheritance Level 6](https://www.w3.org/TR/css-cascade-6/) for the ordering and [Selectors Level 4](https://www.w3.org/TR/selectors-4/) for selector semantics.

**At-rules shape rule context.** Some define declarations or descriptors, some group rules under conditions, and others define keyframes, layers, or registrations. A descriptor is not an ordinary property declaration. Experimental rules and functions may be in a reference index without broad browser support.

**Values pass through stages.** Declared values are syntactically valid proposals. Cascaded values are winners after conflict resolution. Specified values resolve inheritance and initial values. Computed values resolve dependencies not requiring layout; used values account for layout; actual values reflect user-agent/device constraints. DevTools panels may display particular stages, not a complete causal history.

**The box model controls dimensions.** A box includes content, padding, border, and margin. Under `content-box`, specified width/height apply to content; padding and border add to the outer border-box size. Under `border-box`, the declared dimensions include content, padding, and border. Margins remain outside both. Intrinsic sizing, min/max constraints, and writing modes can change the final used geometry.

**Types and units constrain values.** Lengths, percentages, angles, times, resolutions, colors, images, transforms, gradients, identifiers, and other CSS types have distinct grammars. Relative units resolve against font, viewport, container, or root contexts; a unit being syntactically valid does not mean it is meaningful for every property.

## Mechanisms and relationships

For a given element/property, trace in this order: does the selector match? Is the declaration relevant under media/supports/conditions? Which origin/importance and layer wins? What is specificity? Is scope proximity relevant? If tied, what is later in source order? Then ask whether inheritance, CSS-wide keywords, functions, or relative units affect the specified/computed value. Finally, understand layout constraints and box sizing before attributing a visual dimension to the declaration alone.

## Worked examples

```css
@layer reset, components, overrides;
@layer components {
  :where(.card) { box-sizing: border-box; width: 20rem; padding: 1rem; }
}
.card { width: 22rem; }
```

Both selectors match a card. The latter rule is unlayered author CSS and, for normal declarations, outranks the layered component rule before specificity is considered. `:where()` itself adds zero specificity. Its `box-sizing` property still applies from the layer unless another winning declaration changes it. With `border-box`, the 22rem width includes padding and border.

## Misconceptions and edge cases

- Specificity is considered only after origin/importance, context, and layer order.
- Important declarations in earlier layers beat important declarations in later layers; normal layer order goes the other direction.
- An invalid declaration is discarded; an unsupported feature may be ignored while fallback declarations remain.
- `initial`, `inherit`, `unset`, `revert`, and `revert-layer` have different cascade/value semantics.
- Width can be `auto`, intrinsic, constrained, or percentage-based; computed and used widths may differ.
- Percentages resolve according to the property and containing context, not always the viewport.
- Standards snapshots profile maturity; they do not certify every browser implementation.

## Knowledge checks with answers

1. **Does a high-ID selector always win?** No; origin/importance and layer order precede specificity.
2. **What does `:where()` contribute to specificity?** Zero for itself and its selector list.
3. **What does `box-sizing: border-box` include in width?** Content, padding, and border; margin stays outside.
4. **Why can computed width differ from visible outer width?** Value resolution, layout constraints, box sizing, padding, and border affect different stages.
