# CSS layout flexbox grid positioning and responsive design — Interview questions and reasoning

# Core questions

Explain what layout model you would choose, how you would debug an overflow, and how you distinguish current browser support from specification status.

# Concise interview answers

1. **Flexbox or grid?** Flexbox when one primary axis is central; grid when two-dimensional placement/shared tracks are central. Either can size content responsively, so decide from the relationship rather than a slogan.
2. **Why does `1fr` overflow?** The track’s automatic minimum may reflect min-content size. Set a suitable min track sizing function and content wrapping/minimum policy.
3. **What does `min-inline-size: 0` do in a flex/grid item?** It permits the item to shrink below its automatic minimum along the inline axis; a wrapping or overflow strategy must then handle content.
4. **How does absolute differ from relative positioning?** Absolute removes the box from normal flow; relative offsets it while retaining its flow allocation.
5. **What is the difference between scroll padding and scroll margin?** One adjusts the container snapport; the other expands the target’s snap area.
6. **Why use container queries?** They let reusable descendants adapt to an ancestor’s size rather than assuming the viewport predicts their available space.
7. **Does CSS Snapshot 2026 establish browser support?** No. It is a W3C Group Note profiling specification maturity.

# Deep follow-up answers

Flex sizing has a base size, grow/shrink distribution, and min/max constraints; items may freeze and free space be recalculated. Grid track sizing coordinates explicit and implicit tracks and incorporates intrinsic contributions, spanning items, and flexible fractions. Alignment’s subject and axis vary by formatting context. A positioned element’s containing block is not automatically its nearest DOM parent; inspect transforms, containment, and positioned ancestors. Scroll containers, snap ports, and scroll chains interact with input and browser decisions. For each claim about support, use dated compatibility data and test the actual target browsers.

# Scenario questions

1. **A sidebar disappears at a particular viewport, but the component is also reused in a narrow panel.** Use a query container for component-local layout if the condition is the component’s own available size; retain viewport queries for environment-level changes.
2. **A popup has a large `z-index` but remains behind another overlay.** Inspect stacking-context ancestry and top-layer membership; a child cannot outrank an ancestor context.
3. **A horizontally scrollable carousel cannot be used by keyboard.** Preserve native scrolling, ensure scrollable content is focusable/reachable and controls have accessible labels, and provide real links/buttons rather than relying only on experimental generated markers.

# Tradeoffs and alternatives

Grid and flexbox can overlap in capability but express different constraints. Absolute overlays offer precise anchoring but do not reserve space; in-flow grid/flex areas can prevent overlap. Clipping can simplify visual boundaries but can hide content or focus. Viewport breakpoints are simple for page-wide changes; container queries better match reusable components. Draft features can reduce code but require feature support checks and a complete fallback.

# Common weak answers

- “Grid is always for two dimensions and flexbox can never wrap.”
- “`1fr` always shrinks.”
- “A high `z-index` fixes any overlap.”
- “Hidden overflow means inaccessible content is gone.”
- “A CSS draft is supported because it appears on MDN.”
- “Use a mobile breakpoint” without identifying the actual constrained box.

# Self-check rubric

Score 0–2 for each answer: correct model selection; sizing/axis reasoning; overflow reachability; clear explanation of source order and writing mode; exact distinction between spec maturity and implementation support; and a testable fallback. Strong answers identify the box/axis/containing block before proposing a declaration.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
- [CSS Flexible Box Layout Level 2 draft](https://drafts.csswg.org/css-flexbox-2/)
- [CSS Overflow Level 5 draft](https://drafts.csswg.org/css-overflow-5/)
