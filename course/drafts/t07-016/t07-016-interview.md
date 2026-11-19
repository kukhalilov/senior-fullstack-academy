# CSS selectors at-rules cascade values and box model — Interview questions and reasoning

Use [CSS Cascading and Inheritance Level 6](https://drafts.csswg.org/css-cascade-6/) for current cascade sorting and `@scope`, [Level 5](https://drafts.csswg.org/css-cascade-5/) for cascade layers and `revert-rule`, and [Selectors Level 4](https://www.w3.org/TR/selectors-4/) for selector answers. For applied box-sizing and value-stage behavior, consult [MDN's box model guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Box_model/Introduction) and [property value processing guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Property_value_processing). The newest index additions should be treated as compatibility-sensitive; the [current MDN selector index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-classes) distinguishes experimental scroll and interest features.

## Core questions

1. What are the stages of the CSS cascade, and why is “specificity always wins” wrong?
2. How do cascade layers affect normal and important declarations?
3. Compare `:is()` and `:where()` specificity.
4. Explain the difference between child, descendant, next-sibling, and subsequent-sibling combinators.
5. What is the difference between computed, used, and actual values?
6. How does `box-sizing` change width calculations?
7. What is a shorthand property, and what risk does it carry?
8. How do `initial`, `inherit`, `unset`, `revert`, `revert-layer`, and `revert-rule` differ?
9. What does `@scope` add to the cascade?
10. How do you decide whether an experimental CSS feature is safe to use?

## Concise interview answers

1. Relevance is filtered first, followed by origin/importance, encapsulation context, attached-style precedence, layers, specificity, scope proximity, and order. Origin precedence, highest first, is transitions, important user-agent, important user, important author, animations, normal author, normal user, then normal user-agent. Encapsulation context, attached-style precedence, and layers are resolved before specificity; specificity matters only after earlier criteria tie.
2. Later layers win among normal declarations; earlier layers win among important declarations; important unlayered rules rank below explicit important layers. Normal unlayered author rules outrank normal layered rules.
3. `:is()` takes the specificity of its most specific argument; `:where()` and its arguments contribute zero.
4. Child is direct parent-child; descendant allows any depth; next sibling is the immediately following element; subsequent sibling is any later element sibling sharing a parent.
5. Computed values are resolved before layout-dependent details; used values reflect layout; actual values reflect user-agent/device constraints.
6. Content-box width excludes padding/border; border-box width includes content, padding, and border; margin is outside both.
7. A shorthand sets multiple longhands and can reset omitted components, potentially overwriting declarations that appeared elsewhere.
8. `initial` uses the property's initial value; `inherit` copies the parent's computed value; `unset` chooses inherit or initial based on inheritance; `revert` rolls back origin; `revert-layer` rolls back layer; `revert-rule` ignores the current style rule.
9. It scopes rules to a root and optional limits; the prelude does not add selector specificity, and the closest scoping root can win after earlier cascade criteria.
10. Check specification status, MDN compatibility data, target browser matrix, fallback behavior, and real user impact; “in a standard index” does not guarantee support.

## Deep follow-up answers

**Why can an unlayered rule beat a more specific layered rule?** Layer ordering is resolved before specificity. Among normal declarations in one origin/context, unlayered rules occupy a higher-priority position than explicit layers. A more specific selector cannot bypass an earlier cascade criterion.

**Why does a fixed width not equal the rendered box width?** The declaration may describe the content box; padding and borders add to the border box under `content-box`. Layout constraints, intrinsic contributions, min/max sizing, writing modes, and device rounding can further affect used/actual dimensions.

**Can a transition make a value appear to ignore a declaration?** Yes. An active transition has high cascade precedence while it runs, so the animated value can temporarily win. Inspect the transition state and computed styles before changing specificity.

**What should a maintainable cascade look like?** Establish a small layer order for reset/base/components/utilities/overrides, keep selectors modest, scope component rules, and reserve important declarations for genuinely necessary overrides. Ensure team conventions explain where unlayered rules belong.

## Scenario questions

1. A component rule is inside a layer, while a global unlayered selector overrides it. Why, and what are two durable fixes?
2. A box measures 310px despite `width: 300px`. It has 4px borders and 1px padding on each side. Which box-sizing mode is likely, and what would border-box produce?
3. An element changes color despite the winning static rule. What runtime CSS mechanisms would you inspect?
4. A newer selector or `revert-rule` appears in MDN but fails in one target browser. How do you preserve behavior without blocking deployment?

## Tradeoffs and alternatives

Layers offer predictable global organization but cannot repair incoherent ownership or conflicting unlayered styles. More specific selectors can target precisely but create override friction. Physical properties can be straightforward for fixed horizontal interfaces; logical properties adapt better to localization and writing modes. Experimental features can simplify architecture but require support measurement and fallback.

Primary references: [CSS Cascade 5](https://drafts.csswg.org/css-cascade-5/), [CSS Cascade 6](https://drafts.csswg.org/css-cascade-6/), [Selectors 4](https://www.w3.org/TR/selectors-4/), [CSS Box Sizing 3](https://drafts.csswg.org/css-sizing-3/), and [CSS Variables 1](https://drafts.csswg.org/css-variables-1/). Check current compatibility data for newer features such as `revert-rule`.

## Common weak answers

- “The most specific selector always wins.”
- “`!important` beats everything.”
- “Computed value is what the user sees in pixels.”
- “`border-box` includes margin.”
- “CSS functions are supported because they appear in the reference index.”

## Self-check rubric

Score each from 0 (missing) to 2 (clear and correct): cascade order; layer behavior; selector specificity; value stages; box geometry; runtime causes; feature-support strategy. A strong answer scores at least 11/14 and uses a concrete rule conflict to explain the order.
