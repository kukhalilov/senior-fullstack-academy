<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Core concepts and how they fit together

# Learning objectives

Explain the cascade and computed-value pipeline; distinguish CSS property families and status; read a property reference; understand inheritance, logical axes, shorthands, list-valued properties, animation, rendering side effects, and progressive enhancement; and evaluate a declaration in real browsers.

# Prerequisites

Know HTML selectors, rules, declarations, common layout concepts, responsive design, and basic browser DevTools. The exact property names are supplied in the reference lessons so study can focus on meaning and relationships.

# Core concepts

## A declaration is more than a name/value pair

A property definition has a grammar and semantic constraints. First the cascade selects the cascaded value from declarations. Defaulting then handles cases such as `inherit`, `initial`, and `unset`, producing a specified value. At computed-value time, values such as `var()` references are substituted and relative values are resolved as the property’s rules require; later stages determine used and actual values. These stages are not interchangeable, and the exact computed-value rules are property-specific. A declaration can parse successfully yet become invalid at computed-value time, or have no visible effect in the current layout context.

## The cascade, inheritance, and custom values

Origin and importance establish the broad cascade priority; layer order, specificity, scoping proximity where applicable, and order of appearance then resolve competing declarations within that priority. Important declarations have special reversed precedence across layers and origins, so “more specific” or “later” is not a universal winner rule. Inheritance supplies values to descendants for inherited properties; CSS-wide keywords such as `inherit`, `initial`, `unset`, `revert`, and `revert-layer` have defined defaulting or rollback behavior. Unregistered custom properties inherit by default and substitute token streams with `var()`; registration with `@property` adds a declared syntax and controls inheritance and initial value.

## Shorthands and list-valued properties

A shorthand sets a related group of longhands; components omitted from its value generally reset to the initial values defined by that shorthand’s expansion. Animation, background, transition, and font-related properties have their own list grammars, and their list matching is not one universal rule. Background image layers are matched with corresponding background longhands and may repeat or truncate; animation shorthand items describe coordinated animation records, while animation longhand lists can differ in length; transition lists are matched by index using `transition-property` as the controlling list and other lists repeat or truncate as specified. Font-family lists select among families rather than forming background-style layers. Editing a shorthand can unintentionally reset another longhand setting, so inspect the exact shorthand definition and its list rules.

## Logical properties and writing modes

Physical terms such as left/right/top/bottom refer to physical edges. Logical terms such as inline-start/block-end refer to writing-mode axes. Logical properties support international layouts, but their meaning depends on the element's writing mode and direction. Do not mechanically translate one axis into a physical side without knowing context.

## Layout, text, and paint have different effects

Some properties affect intrinsic sizing and layout; transforms change visual rendering without changing normal-flow placement of neighboring boxes, though they can affect overflow, stacking, containing blocks, and hit testing. Opacity, filters, masks, and blending each have their own painting and stacking rules rather than one shared “compositing” behavior. Generated content can affect rendered presentation, but pseudo-element content is not a substitute for meaningful source structure; its accessibility-tree exposure can vary with the content and platform. These distinctions help predict reflow, overlap, overflow, input behavior, and rendering cost, but the property’s own specification determines the exact effect.

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

The unregistered custom property participates in the cascade and inherits by default. Its `var()` fallback is selected when the referenced custom property has the guaranteed-invalid value (for example, because it is missing or invalidated by a cycle); the fallback does not repair an existing token sequence that becomes invalid for `background-color` after substitution. The focus outline is painted outside the border edge and does not reserve layout space; it can still be clipped or visually obscured. Verify contrast, forced-colors behavior, and keyboard focus.

```css
@media (prefers-reduced-motion: no-preference) {
  .card { transition: transform 160ms ease; }
  .card:hover { transform: translateY(-3px); }
}
```

The transform changes visual rendering rather than normal-flow allocation, and can create overlap or scrollable overflow. The media query supplies the transition only when the user agent reports `no-preference`; the essential state remains understandable without it. It does not assert that all motion elsewhere in the page has been removed.

# Misconceptions and edge cases

- “A property list is a list of stable features.” It can include aliases, prefixes, drafts, and unsupported names.
- “A shorthand only changes the values I write.” It resets omitted longhands in its shorthand set.
- “Transform changes the layout position.” It does not change normal-flow placement or reflow neighbors, but it can affect stacking, containing blocks, overflow, and hit testing.
- “Logical properties always mean left and top.” Their edges depend on writing mode and direction.
- “A valid CSS declaration must visibly work.” Applicability, layout context, computed-value validity, and support can prevent an effect.
- “A CSS reset is harmless.” It can remove focus indicators and native affordances or override useful user-agent styles; audit keyboard, forced-colors, and platform behavior.
- “A W3C Snapshot is a browser support table.” It reflects specification stability, not adoption.
- “Vendor-prefixed means browser-safe.” Prefixes can describe legacy or proprietary behavior.

# Knowledge checks with answers

1. **What does a property grammar tell you?** Which values and combinations are valid for that property.
2. **What can a shorthand do to omitted longhands?** Reset them to their initial values.
3. **Does transform reflow neighboring boxes?** No; its normal-flow placement is unchanged, although its painted result can overlap content, affect overflow, stacking, containing blocks, and hit testing.
4. **What is the difference between CSS Snapshot status and browser support?** Specification stability versus implementation availability.
5. **When is a logical property useful?** When layout should adapt to writing direction and writing mode.

# Sources

- [CSS Cascading and Inheritance Level 5 Editor’s Draft](https://drafts.csswg.org/css-cascade-5/) — cascade sorting, layers, defaulting, and value processing; work in progress.
- [CSS Values and Units Level 4 Editor’s Draft](https://drafts.csswg.org/css-values-4/) — shared value stages and syntax; work in progress.
- [CSS Writing Modes Level 4 Editor’s Draft](https://drafts.csswg.org/css-writing-modes-4/) — logical axes; work in progress.
- [CSS Backgrounds and Borders Level 3 Editor’s Draft](https://drafts.csswg.org/css-backgrounds/) — background layers and longhand list behavior; work in progress.
- [CSS Animations Level 1 Editor’s Draft](https://drafts.csswg.org/css-animations/) and [CSS Transitions Level 1 Editor’s Draft](https://drafts.csswg.org/css-transitions/) — animation-list records and transition-list matching; work in progress.
- [CSS Transforms Level 1 Editor’s Draft](https://drafts.csswg.org/css-transforms/) — transforms’ rendering model, overflow, stacking, and containing blocks; work in progress.
- [Compositing and Blending Level 1](https://www.w3.org/TR/compositing-1/), [Filter Effects Level 1](https://www.w3.org/TR/filter-effects-1/), and [CSS Masking Level 1](https://www.w3.org/TR/css-masking-1/) — distinct painting and compositing models.
- [Media Queries Level 5 Editor’s Draft](https://drafts.csswg.org/mediaqueries-5/) — user-preference queries; work in progress.
- [CSS Color Adjustment Module Level 1](https://drafts.csswg.org/css-color-adjust/) — forced-colors and user-agent color adjustments; work in progress.
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/) — specification maturity, not browser support.
- [MDN CSS properties reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties) and [W3C CSS property index](https://www.w3.org/Style/CSS/all-properties.en.html) — inventory navigation only.
