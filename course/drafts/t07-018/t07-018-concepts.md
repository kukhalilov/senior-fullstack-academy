<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Core concepts and how they fit together

# Learning objectives

Explain the cascade and computed-value pipeline; distinguish CSS property families and status; read a property reference; understand inheritance, logical axes, shorthands, list-valued properties, animation, rendering side effects, and progressive enhancement; and evaluate a declaration in real browsers.

# Prerequisites

Know HTML selectors, rules, declarations, common layout concepts, responsive design, and basic browser DevTools. The exact property names are supplied in the reference lessons so study can focus on meaning and relationships.

# Core concepts

## A declaration is more than a name/value pair

A property definition has a grammar and semantic constraints. The cascade selects a specified value; variables and substitutions are resolved; inheritance/defaulting and value computation produce computed/used values; layout and painting consume them. A syntactically accepted declaration may still be invalid at computed-value time or have no visual effect in the current layout context.

## The cascade, inheritance, and custom values

Origin, importance, cascade layer, specificity, scope, and source order determine precedence. Inheritance supplies values to descendants only for inherited properties unless a CSS-wide keyword changes behavior. Custom properties participate in this same cascade, usually inherit, and substitute token streams with `var()`; registration with `@property` adds typing and defined inheritance/initial behavior.

## Shorthands and list-valued properties

A shorthand sets a related group of longhands and resets omitted components to their initial values. Animation, background, transition, and font properties often accept comma-separated layers/lists; corresponding longhands align by list position and have defined repetition behavior. Editing one shorthand can unintentionally erase another longhand setting.

## Logical properties and writing modes

Physical terms such as left/right/top/bottom refer to physical edges. Logical terms such as inline-start/block-end refer to writing-mode axes. Logical properties support international layouts, but their meaning depends on the element's writing mode and direction. Do not mechanically translate one axis into a physical side without knowing context.

## Layout, text, and paint have different effects

Some properties affect intrinsic sizing and layout; transforms can move painting without moving normal-flow neighbors; filters, masks, and opacity change compositing; generated content can affect presentation without supplying reliable document semantics. The distinction predicts reflow, stacking, overflow, hit-testing, and performance effects.

## Standards status and implementation support are separate

CSS modules progress independently through drafts and Recommendations. The CSS Snapshot describes specification maturity; it does not guarantee all browser engines implement every included feature. MDN data also includes vendor extensions, aliases, and experimental properties. Use feature queries and graceful fallbacks where support varies, then test actual target browsers.

## Brief version history

| Period | Major change in how CSS evolved |
| --- | --- |
| CSS 1 and CSS 2 | Core features were defined in a small number of large specifications. |
| CSS 3 onward | The CSS Working Group moved to independently versioned modules, so there is no single universal CSS 3 feature set or later monolithic CSS version. |
| Modern CSS modules | Custom properties, flexbox/grid, logical properties, wide-gamut color, container queries, scroll-driven animation, and view transitions arrived through separate modules and support timelines. |
| CSS Snapshot 2026 | W3C publishes a stable specification profile; this is a snapshot of module maturity, not a browser release or a “CSS 2026” language edition. |

# Mechanisms and relationships

| Mechanism | What it determines | Check |
| --- | --- | --- |
| Cascade | Winning declaration | Importance, origin, layer, specificity, order |
| Value processing | Computed/used value | Substitutions, inheritance, percentages, containing block |
| Formatting model | Geometry | Layout participation, writing mode, intrinsic sizing |
| Painting/compositing | Pixels and stacking | Background layers, transform/filter/opacity contexts |
| Timeline/interpolation | Change over time/progress | Animatable type, timeline source, motion preference |
| Support | Whether target browser implements it | Baseline/compatibility data and runtime feature query |

# Worked examples

```css
:root { --accent: #375fe8; }
.button { color: white; background: var(--accent, navy); }
.button:focus-visible { outline: 3px solid currentColor; outline-offset: 2px; }
```

The custom property participates in cascade and inheritance. `var()` supplies a value at substitution time; its fallback is used when the custom property is missing/invalid under the substitution rules. The focus outline does not occupy layout space and is intentionally visible. Verify contrast, forced-colors behavior, and keyboard focus.

```css
@media (prefers-reduced-motion: no-preference) {
  .card { transition: transform 160ms ease; }
  .card:hover { transform: translateY(-3px); }
}
```

The transform changes visual painting rather than normal-flow allocation. The media query avoids adding motion for users who request reduced motion; essential state must remain clear without the transition.

# Misconceptions and edge cases

- “A property list is a list of stable features.” It can include aliases, prefixes, drafts, and unsupported names.
- “A shorthand only changes the values I write.” It resets omitted longhands in its shorthand set.
- “Transform changes the layout position.” It changes painting and can affect stacking/containing blocks, but does not reflow neighbors.
- “Logical properties always mean left and top.” Their edges depend on writing mode and direction.
- “A valid CSS declaration must visibly work.” Applicability, layout context, computed-value validity, and support can prevent an effect.
- “A CSS reset is harmless.” It can remove focus and native affordances or override useful user-agent styles.
- “A W3C Snapshot is a browser support table.” It reflects specification stability, not adoption.
- “Vendor-prefixed means browser-safe.” Prefixes can describe legacy or proprietary behavior.

# Knowledge checks with answers

1. **What does a property grammar tell you?** Which values and combinations are valid for that property.
2. **What can a shorthand do to omitted longhands?** Reset them to their initial values.
3. **Does transform reflow neighboring boxes?** No; it changes the transformed element's rendered position and can create other rendering side effects.
4. **What is the difference between CSS Snapshot status and browser support?** Specification stability versus implementation availability.
5. **When is a logical property useful?** When layout should adapt to writing direction and writing mode.

# Sources

- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS properties reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
- [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html)
