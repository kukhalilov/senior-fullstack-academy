# CSS selectors at-rules cascade values and box model — Big-picture orientation and mental model

## Problem and purpose

CSS describes how a document is presented. It matches elements with selectors, assigns declarations, resolves conflicts through the cascade, computes values, and participates in layout, paint, and rendering. Understanding the cascade and box model turns “why is this style not working?” into a sequence of testable questions.

## Plain-language mental model

Think of a stylesheet as a set of proposals. A selector proposes which elements a rule applies to. Each declaration proposes a property value. The cascade first removes irrelevant declarations, then resolves the remainder using origin and importance (including animation and transition levels), layer order, special treatment for element-attached styles and encapsulation contexts, specificity, scoping proximity, and source order. This is a useful debugging checklist rather than the full formal algorithm. The selected value is resolved through CSS value stages. Layout then uses dimensions, units, and box geometry to compute rendered output.

## How the parts fit together

A selector can be a compound selector made of simple selectors, or a complex selector that connects compounds with combinators. Pseudo-classes represent state/structure, and pseudo-elements target generated or otherwise special parts. At-rules structure stylesheets or attach conditions such as media, supports, layer, scope, container, and keyframes. Descriptors configure particular at-rules. Functions build values from calculations, colors, images, transforms, filters, counters, or environment data. Data types and units define the grammar accepted by properties. The box model separates content, padding, border, and margin. `box-sizing` controls whether specified width/height applies to the content box or border box; margins remain outside that dimension.

The [CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) describes standards maturity; MDN's [CSS reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference) gives practical definitions and compatibility data. Specification status and browser support are separate questions.

## Concept map

| Need | CSS mechanism | Key question |
|---|---|---|
| Match elements | Selectors and combinators | Which nodes match, and with what specificity? |
| Resolve conflicts | Cascade origins, importance, layers, scopes, order | Which applicable declaration wins? |
| Structure/condition styles | At-rules and descriptors | Is the rule active, and what does its container configure? |
| Express values | Functions, data types, units | Is the value valid, resolvable, and compatible with the property? |
| Determine geometry | Box model and box-sizing | Does width describe content or border box? |

## End-to-end walkthrough

Suppose a component's width is unexpectedly 360px although its rule says `width: 320px`. First verify the selector matches and the rule is relevant. In DevTools, inspect competing declarations and the cascade winner; an unlayered normal rule can outrank normal layered rules, while important layer order reverses. Check whether an important declaration, animation, or active transition participates; these occupy distinct cascade priority levels, and a running transition can temporarily outrank even important declarations. Then inspect computed and used values. With `content-box`, padding and border are added outside the declared width; with `border-box`, they are included, while margin remains outside both. A parent constraint or intrinsic sizing may also affect the used geometry. Fix the cause at the right stage instead of appending another `!important` rule.

## When to use it and tradeoffs

Use this mental model to debug cascade conflicts, responsive rules, selector behavior, and sizing. Prefer predictable low-specificity selectors and deliberate layers over escalating specificity. Experimental names in the catalog are separate from stable interoperable features; check the target browsers and provide fallbacks. Layout and typography are covered in adjacent CSS topics, so this module focuses on the foundational language mechanisms.

## What later lessons cover

Reference lessons cover selector primitives, pseudo-classes/elements, at-rules/descriptors, box properties, value functions, types, units, and cascade stages. Practice asks you to diagnose a conflict and compute box dimensions; interview questions test why a declaration wins and what a computed value means.
