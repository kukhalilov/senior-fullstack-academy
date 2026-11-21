<!-- FACTUALLY REVIEWED: core animation properties checked against CSS Animations; trigger family remains draft-only. -->

## Scope and version

# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Reference: CSS Animations properties

This reference covers the 21 supplied animation names. Core keyframe animation behavior is defined in CSS Animations Level 1, whose current editor draft is dated 13 September 2026; CSS Animations Level 2 is a delta editor’s draft dated 18 August 2026. The newer trigger properties belong to the separate Animation Triggers Level 1 editor’s draft (including `animation-trigger`, moved out of Animations Level 2). These drafts are works in progress. The 2026-11-16 MDN support snapshot is a separate source capture, not a conformance guarantee.

## How this group fits the mental model

A keyframe animation has a named effect (`@keyframes` and `animation-name`), a timing model (duration, delay, easing, iteration, direction), and rules for which sampled values apply before/during/after it (fill mode), whether its clock advances (play state), and how simultaneous effects combine (composition). Multiple comma-separated animations can affect one element. The cascade’s animation origin overrides normal declarations but is overridden by important declarations; when animations conflict on a property, later animations in the animation-name list win under the core model. CSS animations are declarative and time-based by default; scroll/view timelines and trigger properties are separate, newer draft mechanisms.

A transition reacts to a change in underlying style; a keyframe animation runs an explicitly named sequence. Neither mechanism makes essential information available only while moving. Respect reduced-motion preferences and preserve a clear static state.

## Supplied names explained

### Core animation selection and timing

- `animation-name`: `none | <keyframes-name>#`; initial `none`; non-inherited. Selects one or more matching `@keyframes` rules by case-sensitive identifier or string. An absent/invalid matching rule means no keyframe effect. `@keyframes` names use `<custom-ident> | <string>`; selectors are `from`, `to`, or percentages from 0% to 100%. If a property is omitted at a keyframe, the animation system may use underlying values; duplicate selectors are combined according to keyframe processing rules. Name the effect and define its keyframes; the name alone does not create keyframes.
- `animation-duration`: non-negative `<time>#`; initial `0s`; non-inherited. Sets each cycle length. Zero duration is valid: the animation is instantaneous but can still dispatch lifecycle events and fill according to its other settings. Level 2 adds/changes special timeline interactions; do not transfer those draft details to every implementation.
- `animation-delay`: in the Level 1 model, `<time>#`; initial `0s`; non-inherited. Positive delay waits before active progress. Negative delay starts immediately as if the animation clock had already advanced by the absolute delay, so it appears partway through. During positive delay, fill mode controls whether a keyframe value is applied. The current Level 2 draft refactors this as a shorthand for `animation-delay-start` and `animation-delay-end`: one value sets the start delay and resets end delay, while two values set both. The Level 2 end delay accepts non-negative time; this addition is draft-only and should not be assumed supported.
- `animation-timing-function`: `<easing-function>#`; initial `ease`; non-inherited. Controls progress between keyframes, not the keyframe values themselves. It accepts the CSS easing function grammar (including `linear`, cubic Bézier, steps, and piecewise `linear()` forms as defined by CSS Easing); reverse direction reverses timing progression. A timing function declared inside a keyframe controls the segment from that keyframe to the next, not the preceding segment.
- `animation-iteration-count`: `<number [0,∞]> | infinite`, comma-separated; initial `1`; non-inherited. Fractions end partway through a cycle; `0` is valid and produces an instantaneous effect. `infinite` repeats indefinitely. Active duration is duration times iteration count (with timeline-driven behavior separately defined in newer specs).
- `animation-direction`: `normal | reverse | alternate | alternate-reverse`; initial `normal`; non-inherited. `reverse` plays each iteration backward; `alternate` reverses on every other iteration, beginning forward; `alternate-reverse` begins backward then alternates. Direction also affects the easing direction and which keyframe is considered first/last for fill.
- `animation-fill-mode`: `none | forwards | backwards | both`; initial `none`; non-inherited. `backwards` applies the first keyframe appropriate to the direction during delay; `forwards` retains the effect’s end-of-active-phase value after completion; `both` does both. Fill affects the animation effect, not the underlying style after the animation is removed. A forwards-filled animation may retain rendering side effects similar to `will-change` while active/filling; avoid keeping expensive effects alive unnecessarily.
- `animation-play-state`: `running | paused`; initial `running`; non-inherited. Pausing preserves the animation’s current progress and pauses its delay clock too; switching back to running resumes. This CSS toggle is distinct from changing playback through the Web Animations API.

### Composition and shorthand

- `animation-composition`: `replace | add | accumulate`, comma-separated; initial `replace`; non-inherited. Selects how each animation effect combines with the underlying value and effects earlier in composite order. `replace` substitutes the effect value; `add` combines it with the underlying value using property-specific addition; `accumulate` combines with iteration accumulation semantics. Not all property value types support meaningful addition/accumulation, so an unsupported composite operation can behave like replacement. Multiple effects also have composite order; this property is not a z-index or paint-order control.
- `animation`: comma-separated list of single-animation definitions. Core components include duration, easing, start delay, iteration count, direction, fill mode, play state, keyframe name, and (in the Level 2 draft) timeline. The first time-like token is duration and the next is start delay; order matters for names that resemble keywords. Omitted components reset to their initial values. `animation-trigger` is a reset-only subproperty in the triggers draft. Prefer longhands when you need to preserve unrelated settings; do not assume draft shorthand extensions are implemented merely because the property name parses.

### Draft trigger properties

These properties configure named trigger relationships, usually connecting a timeline boundary on one element to an animation on another. They are not the same as `animation-timeline`: a timeline maps progress to animation time, while a trigger changes animation state/actions when a trigger becomes active or inactive. The syntax below is from Animation Triggers Level 1 and must be treated as draft syntax, not portable baseline CSS.

- `timeline-trigger-name`: `none | <dashed-ident>#`; initial `none`; non-inherited. Declares one or more named timeline triggers on an element. Repeated names within a list are resolved by the draft’s duplicate-name rule (only the last effective definition remains).
- `timeline-trigger-source`: `none | auto | [<dashed-ident> | scroll() | view()]+`, comma-separated; initial `auto`; non-inherited. Selects the associated named/anonymous scroll or view timeline. `none` leaves no timeline source, so the trigger cannot observe timeline progress.
- `timeline-trigger-activation-range`: shorthand for `timeline-trigger-activation-range-start` and `...-end`; uses the range syntax of `animation-range`; omitted components reset according to longhand initial values. The activation range determines when a timeline trigger becomes active.
- `timeline-trigger-activation-range-start` and `timeline-trigger-activation-range-end`: `normal | <length-percentage> | <timeline-range-name> <length-percentage>?`, comma-separated; initial `normal`; non-inherited. Set entry boundaries relative to the named timeline range or whole timeline. The exact named range vocabulary follows scroll-driven animation range definitions.
- `timeline-trigger-active-range`: shorthand for `timeline-trigger-active-range-start` and `...-end`; defines the interval during which the trigger stays active after activation. By default the active range matches the activation range; the draft constrains the active range to include the activation range.
- `timeline-trigger-active-range-start` and `timeline-trigger-active-range-end`: `auto | normal | <length-percentage> | <timeline-range-name> <length-percentage>?`; initial `auto`; non-inherited. They define the active interval’s boundaries; `auto` matches the corresponding activation boundary. Distinguish the active interval from the activation threshold: this allows an action to start near one point and remain active until a later point.
- `timeline-trigger`: `none | <timeline-trigger-name> <timeline-trigger-source> <timeline-trigger-range>?`, comma-separated. It sets the name, source, and optionally both ranges. `none` is equivalent to `none none normal`. Components must appear in this specified order because the syntax is ambiguous.
- `trigger-scope`: `none | all | <dashed-ident>#`; initial `none`; non-inherited. Limits where matching trigger names are visible within the flat-tree subtree. `all` scopes all relevant names in the subtree; dashed identifiers select names. Name scoping interacts with shadow/tree scopes, so it is not simply JavaScript lexical scope.
- `animation-trigger`: `none | [<dashed-ident> <animation-action>+]+`, comma-separated; initial `none`; non-inherited. Associates an animation with named triggers and describes actions for trigger entry/exit. The current draft action keywords are `none`, `play`, `play-once`, `play-forwards`, `play-backwards`, `pause`, `reset`, and `replay`. Action arity depends on trigger type, and an invalid number can leave a trigger ineffective despite syntactically valid CSS. It is a reset-only subproperty of `animation` in the draft. Verify exact current action list and semantics before shipping because the design is actively changing.

## Lists, cascade, and event behavior

The core longhands are comma-separated lists coordinated by `animation-name`. If a related list is shorter than the number of animation names, its values repeat to match; excess values beyond the number of names do not create animations. Shorthand entries avoid accidental mismatched list lengths. Animations sit above normal cascade declarations but below `!important` declarations. If multiple animations specify the same property, later list entries win in the core ordering. CSS animation events (`animationstart`, `animationiteration`, `animationend`, `animationcancel`) correspond to animations, not each individual animated property; negative delay affects elapsed-time reporting, pausing excludes paused time, and cancellation is not an `animationend`.

```css
@keyframes notice-in {
  from { opacity: 0; transform: translateY(.5rem); }
  to   { opacity: 1; transform: translateY(0); }
}
.notice {
  animation: notice-in 180ms ease-out both;
}
@media (prefers-reduced-motion: reduce) {
  .notice { animation: none; }
}
```

Provide a visible static state if motion is removed. For layout performance, prefer properties that can be animated without repeated layout when appropriate, but profile: compositing is an implementation detail and `transform`/`opacity` are not automatically free.

## Examples

```css
@keyframes notice-in {
  from { opacity: 0; transform: translateY(.5rem); }
  to   { opacity: 1; transform: translateY(0); }
}
.notice { animation: notice-in 180ms ease-out both; }
@media (prefers-reduced-motion: reduce) { .notice { animation: none; } }
```

Keep core content available even when motion is removed. This example does not use draft trigger properties.

## Cross-item comparison

| Question | Relevant properties | Distinction |
| --- | --- | --- |
| Which effect runs? | `animation-name` | Must match a valid `@keyframes` rule. |
| How long/how often? | `animation-duration`, `animation-delay`, `animation-iteration-count` | Duration is one cycle; delay offsets start; count controls cycles. |
| How does it move between frames? | `animation-timing-function`, `animation-direction` | Easing shapes progress; direction changes playback order. |
| What appears outside active progress? | `animation-fill-mode` | Backwards applies during delay; forwards after completion. |
| What happens when effects overlap? | `animation-composition` | Combines values; it does not choose stacking order in painting. |
| How does scrolling map to progress? | `animation-timeline` (outside this inventory) | Timeline drives animation time. |
| What starts/stops an animation from a named condition? | `timeline-trigger*`, `animation-trigger`, `trigger-scope` | Draft trigger system changes state/actions and is not broadly portable. |

## Common mistakes

- Forgetting that `animation: ...` resets omitted shorthand components.
- Confusing a negative delay with negative duration: negative delay is valid; negative duration is invalid.
- Assuming `forwards` permanently changes the underlying style after the animation is removed.
- Expecting `animationiteration` after the final cycle or treating cancellation as completion.
- Assuming animation lists are independently matched without repetition/truncation rules.
- Treating `animation-composition: add` as universally meaningful for every CSS value type.
- Equating scroll-driven timeline progress with a trigger’s active/inactive state.
- Shipping trigger properties because they appear in MDN’s index; they remain draft features and can change.
- Making essential state or content visible only during animation, or ignoring reduced motion.
- Assuming transform and opacity animations are free of performance cost.

## Knowledge checks with answers

1. What does a negative `animation-delay` do? It starts the effect immediately at a progress offset as if its clock began in the past.
2. What is the difference between `animation-fill-mode: backwards` and `forwards`? Backwards applies the starting keyframe during delay; forwards retains the end-phase effect after completion.
3. Does `animation-composition: add` guarantee a sum for any property? No. Composition depends on property-specific support for additive values.
4. Do animation events correspond to each animated property? No. They correspond to each animation name/effect.
5. How does a timeline differ from a timeline trigger? A timeline supplies animation progress; a trigger changes animation state/actions when range conditions activate or deactivate.
6. What maturity should be assumed for `animation-trigger` and `timeline-trigger*`? Draft-only; verify the current spec and browser implementation separately.

## Sources

- [CSS Animations Module Level 1 Editor’s Draft](https://drafts.csswg.org/css-animations-1/)
- [CSS Animations Module Level 2 Editor’s Draft](https://drafts.csswg.org/css-animations-2/)
- [Animation Triggers Level 1 Editor’s Draft](https://drafts.csswg.org/animation-triggers-1/)
- [Scroll-driven Animations Module Level 1](https://drafts.csswg.org/scroll-animations-1/)
- [CSS Easing Functions Module Level 1](https://www.w3.org/TR/css-easing-1/)
- [W3C CSS Snapshot 2026](https://www.w3.org/TR/css-2026/)
- [MDN CSS property reference index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties)
