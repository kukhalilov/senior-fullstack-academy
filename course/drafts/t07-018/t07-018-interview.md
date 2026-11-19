# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Interview questions and reasoning

## Core questions

1. You see a CSS declaration in source but not in the rendered result. How do you trace what happened?
2. What does a shorthand declaration do to related longhands that are not written explicitly?
3. How do custom properties differ from ordinary named CSS properties, and when would you register one with @property?
4. What changes when an element receives transform: translateX(20px)? What does not change?
5. How do you decide whether a newly listed CSS property is safe to use in a production interface?
6. What is the difference between a scroll-driven animation timeline and an animation trigger?
7. Why can will-change make performance worse when applied broadly?
8. How would you preserve keyboard focus visibility when a design removes the browser’s default outline?
9. What does text-spacing-trim do, and why should a team check both the font and browser?
10. How would you make a design resilient when an experimental effect is unsupported or reduced motion is requested?

## Concise interview answers

1. Inspect the matched declarations and cascade, then check computed values and whether the property applies to the generated box. Continue through layout, paint, compositing, and clipping as relevant.
2. A shorthand sets its defined constituent longhands; omitted components receive the shorthand’s defined defaults, generally their initial values. This can reset values set earlier.
3. Custom properties participate in the cascade and usually inherit as token sequences. @property registers a syntax, inheritance flag, and initial value, enabling type validation and typed animation behavior.
4. The element is visually shifted, but its normal-flow layout position and the space reserved for it remain unchanged. A transform can create a stacking context and containing block effects.
5. Check the normative definition and maturity, exact browser support and values, real behavior on target devices, fallback, accessibility, and whether the feature is necessary.
6. A scroll timeline maps scroll/view progress to animation progress. A trigger starts or changes playback when a configured timeline range or event condition occurs; the trigger model is a separate experimental specification.
7. It can prompt extra memory use and rendering side effects such as stacking-context creation. It is a hint, not a promise of acceleration.
8. Keep a strong visible focus indicator, test keyboard navigation and forced-colors mode, and ensure ancestor clipping does not hide the indicator.
9. It controls contextual fullwidth/halfwidth spacing for CJK punctuation at line edges and between eligible adjacent punctuation. Font metrics/features and incomplete cross-browser support affect the result.
10. Keep essential content and state available without the effect, provide a static fallback, feature-detect optional enhancements where useful, and respect prefers-reduced-motion.

## Deep follow-up answers

### 1. Debugging an invisible declaration

Start with the actual element and pseudo-element in developer tools. Check whether the stylesheet loaded, the selector matches, and the declaration is syntactically valid. Follow the cascade, including origin, importance, cascade layers, specificity, and source order. Then inspect custom-property substitution and computed style. If the computed value is present, ask whether the property applies to that box and whether the selected value differs from the initial or used value. Finally check layout constraints, writing mode, clipping/overflow, stacking, paint, and compositing. For an experimental property, verify actual support and behavior rather than relying only on a successful parse or a computed-style string.

### 2. Shorthand resets

A later shorthand can erase earlier longhand settings even when the shorthand text does not mention them. For example, setting background resets the background longhands that it controls before applying the supplied background components. The same risk exists with animation and other shorthands. When debugging, inspect the shorthand’s full longhand set and declaration order. Prefer longhands when the intended change should preserve other components.

### 3. Custom-property registration

An unregistered custom property is a token sequence that var() substitutes into another property’s value processing. It normally inherits, and the browser does not know it is a color, length, or other typed value. Its animation is discrete. Registration declares a syntax such as <color>, whether it inherits, and a valid initial value. A compatible registered type can interpolate by computed value; invalid assignments do not become valid simply because they are stored in a custom property. Registration support and syntax constraints should be tested in target browsers.

### 4. Transform and rendering consequences

Transforms operate after normal-flow layout, so surrounding boxes are not laid out around the transformed visual position. The transformed element may paint over another element or be clipped by an ancestor. A non-none transform establishes a stacking context and can establish a containing block for positioned descendants, including fixed-position descendants in the relevant cases. It can still change the scrollable overflow area. Distinguish “does not reflow siblings” from “has no layout or scrolling consequences.”

### 5. Standards status and deployment

A property may be described by a Working Draft, be in an Editor’s Draft only, or have a stable specification and limited implementations. A property index is a discovery aid, not a guarantee of implementation. Read the property’s exact syntax and algorithm, inspect a current compatibility source for each needed value, and try the feature in the engines and platforms that matter. Use @supports to guard syntax-level enhancements when appropriate, but do not mistake parsing support for complete interoperable behavior. Keep a useful baseline when unsupported, and retest after browser or specification updates.

### 6. Progress timelines and triggers

animation-timeline associates a CSS animation with a timeline such as a scroll or view progress timeline; the animation progress is linked to that timeline rather than ordinary elapsed time. The Animation Triggers draft defines playback controls that respond to triggers, including timeline ranges and events. The trigger properties were moved out of CSS Animations Level 2 into a separate draft. Support for one mechanism does not imply support for the other. Keep content understandable without animation and test nested scrollers, reduced motion, and the exact trigger implementation status.

### 7. Performance hints

will-change may prompt the browser to prepare for a change, but it can consume resources, affect stacking, and make the page slower when applied to many elements. First record a performance profile that identifies the actual bottleneck. If there is evidence a hint helps, scope it to a few elements shortly before the change and remove it afterward. Compare frame timing, memory, paint, and compositing after the change; do not infer success from the declaration alone.

### 8. Focus indication

Hover is not keyboard focus. Use :focus-visible or an equivalent focus treatment, preserve a visible non-color cue, and test contrast in the actual surroundings. Forced-colors mode may remap author colors, so test it and choose suitable system colors when needed. An outline does not consume layout space but can be clipped by an ancestor’s overflow. Check zoom and keyboard-only navigation as well as mouse use.

### 9. CJK punctuation spacing

text-spacing-trim is not letter-spacing. It selects whether relevant fullwidth opening/closing punctuation and adjacent punctuation spacing are kept fullwidth or trimmed according to line position and character classes. The current CSS Text Level 4 draft defines values and edge behavior, but the feature is Experimental/Limited availability and the draft reports spotty test coverage. Font metrics affect whether a glyph can safely be trimmed; the current draft discusses halt/vhal and prohibits substituting halfwidth glyph forms using hwid. Verify the target font, writing mode, browser, and line wrapping.

### 10. Fallback and motion preference

Progressive enhancement means the static state already communicates the information and remains usable when an optional property is ignored. Use feature queries when they meaningfully guard an optional syntax. For motion, retain a nonanimated state and use prefers-reduced-motion to remove or simplify nonessential movement. A fallback is a product behavior decision, not just a parser workaround.

## Scenario questions

1. **A computed style shows a value but the control appears unchanged.** Trace applicability, used value, layout context, writing mode, clipping, and browser implementation. Determine whether the value is equivalent to the initial value or whether the effect depends on a font or containing block.
2. **A later background declaration unexpectedly removes a gradient position or repeat setting.** Identify which shorthand reset the longhand and replace it with explicit longhands if preserving the other components is intended.
3. **A new text-spacing-trim rule works in Chromium but not Safari.** Check current compatibility data and the exact required values, retain readable source text and fallback behavior, and avoid shipping it as a cross-browser requirement.
4. **A scroll-linked animation works in one browser, but a trigger does not.** Treat these as separate capabilities. Keep the progress animation optional and the trigger-dependent behavior nonessential until its own support is verified.
5. **An animation becomes slower after adding will-change globally.** Remove the broad hint, profile a representative device, scope the hint to the element and time window where measured benefit exists, and compare resource and frame metrics.
6. **A custom color variable jumps rather than interpolates.** Check whether the property is registered with a compatible syntax, whether the transition targets the custom property, and whether the browser supports registration.
7. **Keyboard users cannot see focus after a visual redesign.** Restore a prominent focus-visible indicator and inspect forced colors, zoom, adjacent contrast, and overflow clipping.
8. **An experimental SVG stroke color is ignored.** Keep stroke: currentColor as the baseline, then use compatibility data and feature detection before relying on stroke-color.

## Tradeoffs and alternatives

- Shorthands reduce repetition but can hide resets; longhands make partial overrides explicit.
- Logical properties adapt to writing modes and localization; physical properties may be simpler when a design is deliberately tied to a physical edge.
- Browser defaults can reduce maintenance and preserve platform conventions; resets provide control but may remove useful focus, form, or text behavior.
- Registered custom properties provide typed constraints and interpolation; they also impose a global registration contract and syntax that consumers must follow.
- Scroll-linked effects can communicate progress without a timer; they depend on scrolling context and should not carry essential content or create motion barriers.
- A rendering hint can help a measured bottleneck; an unnecessary hint adds cost and implementation complexity.
- Experimental typography controls can improve a carefully chosen CJK treatment; font and browser differences require progressive enhancement.

## Common weak answers

- “It is in the source, so it must apply.”
- “A shorthand only changes the values I wrote.”
- “A custom property is just a JavaScript variable.”
- “Transform has no layout consequences at all.”
- “The W3C published a draft, so the feature is production-ready.”
- “@supports proves the behavior works correctly.”
- “Animation timeline and animation trigger mean the same thing.”
- “will-change always makes animation faster.”
- “Hover is enough because keyboard users can tab.”
- “text-spacing-trim is just letter-spacing for Japanese.”
- “The visual effect is optional, so a reduced-motion mode is unnecessary.”

## Self-check rubric

Score each answer from 0 to 2 in five areas:

1. **Mechanism:** distinguishes cascade, computed values, layout, paint, and compositing accurately.
2. **Scope:** identifies the exact property, shorthand resets, relevant value grammar, and whether a claim is draft-defined.
3. **Evidence:** checks the specification and the target browser/value instead of relying on the property name.
4. **Resilience:** gives a useful fallback and keeps essential content available.
5. **User impact:** considers keyboard focus, forced colors, zoom, writing systems, and reduced motion where relevant.

A strong interview answer explains the cause, gives one concrete example, states the important limitation, and describes how it would be verified.

## Sources

- [CSS Cascade Level 5 Editor’s Draft](https://drafts.csswg.org/css-cascade-5/) (cascade and layer ordering)
- [CSS Transforms Module Level 1](https://drafts.csswg.org/css-transforms-1/) (transform effects on layout, stacking, and containing blocks)
- [CSS Custom Properties for Cascading Variables](https://drafts.csswg.org/css-variables-1/) (custom property substitution and inheritance)
- [MDN: Registering custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Properties_and_values_API/Registering_properties) (registered types and animation)
- [Scroll-driven Animations Editor’s Draft](https://drafts.csswg.org/scroll-animations-1/) (scroll and view progress timelines)
- [Animation Triggers Editor’s Draft](https://drafts.csswg.org/animation-triggers-1/) (separate experimental trigger model)
- [CSS Will Change Module Editor’s Draft](https://drafts.csswg.org/css-will-change/) (resource guidance and rendering side effects)
- [MDN: text-spacing-trim](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-spacing-trim) (status and implementation caveats)
- [CSS Mobile Text Size Adjustment Editor’s Draft](https://drafts.csswg.org/css-size-adjust/) (draft scope and behavior)
- [CSS Fill and Stroke Editor’s Draft](https://drafts.csswg.org/fill-stroke/) (SVG stroke properties and maturity)
- [MDN: outline](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/outline) (focus styling)
