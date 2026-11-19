# CSS properties typography colors backgrounds surfaces effects motion and specialized features — Exercises and worked solutions

## Goals

Practice applying CSS property knowledge to real rendering problems. For each case, explain the mechanism, state assumptions, choose a resilient fallback, and identify how you would verify behavior. The exercises draw on text wrapping, keyboard focus, scroll progress and trigger animation, registered custom properties, rendering hints, and SVG stroke features.

## Worked example

A card’s background and transform declarations are:

    .card {
      background: white;
      background-color: #fff;
      transform: translateY(-2px);
    }

The background shorthand sets its constituent background longhands; the later background-color declaration replaces only that component. The transform changes the card’s rendered position without changing normal-flow space, so neighboring elements do not move to fill or follow that offset. However, transforms can establish a stacking context and affect containing blocks for positioned descendants. If the transform is animated, check reduced-motion preferences, clipping, focus indication, and stacking interactions.

A quick trace is: parse declarations, apply the cascade in order and across origins/layers/specificity, compute values, then observe layout and paint. A valid declaration is not proof that it changes pixels: the value may equal the initial value, not apply to the box, be overridden, or depend on unsupported behavior.

## Exercises

1. A profile card contains a long user-supplied identifier with no spaces. It overflows at narrow widths. Choose a wrapping policy, compare it with word-break, and describe any effect on min-content sizing.
2. A button removes its outline and changes background only on hover. Identify the accessibility problem and provide a keyboard-visible focus treatment, including a forced-colors consideration.
3. A product team asks for a card to animate with scroll progress and then start or pause another animation when an item enters a viewport range. Distinguish progress timelines from trigger behavior. Specify how the design should behave when support or motion preference is absent.
4. A theme stores an accent color in --accent and wants it to transition smoothly. Explain what registration adds, how an unregistered custom property animates, and what the syntax/inheritance options control.
5. A developer adds will-change: transform to every card permanently to “make animations faster.” Explain possible costs and give a safe profiling workflow.
6. An SVG icon declares stroke-color: currentColor, but the target browser ignores it. Diagnose the likely issue, state a broadly established alternative, and explain how to enhance conditionally.

## Progressive hints

1. Distinguish emergency wrapping of an otherwise unbreakable token from rules that alter normal breaking between words or scripts.
2. Pointer hover does not establish keyboard focus. An outline does not consume layout space; preserve an obvious indicator in forced-colors mode.
3. A progress timeline maps an animation’s progress to scroll/view progress. A trigger responds to a timeline range or event to change playback. The trigger specification is separate and remains experimental.
4. Registration gives the browser a declared syntax and inheritance behavior; typed registered values can interpolate by computed value. Unregistered custom properties animate discretely.
5. will-change is a hint with resource and rendering side effects, not a command to accelerate. Measure first, scope it narrowly, and remove it when no longer needed.
6. Check support in the exact browser and whether the draft property is implemented. SVG stroke is established; stroke-color is a newer draft property.

## Complete solutions

1. Use overflow-wrap: anywhere on the component if breaking a long token at otherwise unavailable soft-wrap positions is acceptable:

       .identifier {
         overflow-wrap: anywhere;
       }

   This still prefers ordinary break opportunities and only breaks an unbreakable sequence when needed. The added opportunities are considered when calculating min-content intrinsic size, which can prevent an oversized grid or flex item from forcing overflow. word-break changes line-breaking behavior more broadly; for example, break-all permits breaking between characters even when a word could otherwise move intact. Do not use break-all for identifiers unless splitting at arbitrary character boundaries is the desired behavior. Test URLs, punctuation, non-Latin text, and flex/grid min-width constraints. If the string is semantically indivisible, a scrollable overflow treatment or wrapping the container may be preferable to splitting it.

2. Do not remove keyboard focus indication. Use a visible focus style and retain a strong non-color cue:

       button:focus-visible {
         outline: 3px solid currentColor;
         outline-offset: 2px;
       }

       @media (forced-colors: active) {
         button:focus-visible {
           outline-color: Highlight;
         }
       }

   Hover styling only applies to pointer interaction and is not a replacement for keyboard focus. Outline does not reserve space in layout, so the offset can still be clipped by an ancestor with overflow clipping; inspect the focused control at zoom and in high-contrast/forced-colors mode. Check that the indicator is visible against adjacent surfaces and does not rely on color alone.

3. animation-timeline associates a CSS animation with a timeline, such as a scroll-progress or view-progress timeline. Its progress follows the timeline rather than wall-clock time. A trigger is different: the separate Animation Triggers draft defines mechanisms for starting, pausing, restarting, or otherwise controlling animation playback in response to timeline ranges or events. Names such as timeline-trigger and animation-trigger are not part of the stable scroll-timeline mechanism; do not assume a browser supporting animation-timeline also supports trigger behavior.

   Keep essential information and state changes available without the animation. Guard optional CSS enhancements with feature queries where useful, provide a normal static layout fallback, and respect prefers-reduced-motion by disabling or simplifying nonessential motion. Test nested scroll containers, timeline source/axis, keyboard access, reduced-motion, unsupported browsers, and the exact target versions. Do not use animation as the only way to reveal content.

4. Register the custom property with the Properties and Values API:

       @property --accent {
         syntax: "<color>";
         inherits: true;
         initial-value: #2457d6;
       }

   syntax declares the type constraint, inherits selects whether descendants receive the parent’s value, and initial-value supplies the registered property’s default. A color-typed registered property can interpolate between compatible color values. An unregistered custom property is an untyped token sequence and its animation is discrete rather than a smooth color interpolation. Registration does not make every arbitrary value valid: values must conform to the syntax, and unsupported or invalid declarations need a sensible fallback. Test the actual transition and registration support in target browsers.

5. Remove the permanent global hint. will-change can prompt pre-optimization, but browsers may allocate extra memory or create rendering side effects such as a stacking context depending on the value. It is not a guarantee of faster frames, and too many promoted layers can make performance worse.

   First profile the interaction in representative devices and inspect whether transform is the bottleneck. If measurements justify it, apply the hint to the small set of elements that are about to change, then remove it after the interaction or transition. Prefer normal CSS and compositor-friendly animation when they solve the problem without a hint. Re-profile memory, paint, compositing, and frame timing. Do not apply will-change to every item preemptively.

6. The exercise’s symptom is consistent with lack of support for the experimental CSS stroke-color property. Check the property’s current browser data and the target browser’s computed style; a browser may ignore an unknown declaration without affecting the rest of the stylesheet. For broadly established SVG behavior, use the SVG/CSS stroke property:

       .icon {
         stroke: currentColor;
         fill: none;
       }

   This uses the element’s current text color for the stroke while retaining a transparent fill. If the experimental property is specifically needed, use it only as progressive enhancement after support testing, and keep the established stroke declaration as the baseline. A property’s appearance in a draft or reference index does not itself establish interoperable browser support.

## Tests and edge cases

Use a focused browser matrix rather than checking only one desktop browser:

- Resize narrow and wide; test long tokens, natural word breaks, grid/flex min-content sizing, and bidirectional/CJK text.
- Navigate with keyboard only; verify focus-visible, forced-colors, zoom, contrast, clipping, and reduced-motion behavior.
- For scroll effects, test the intended scrolling ancestor, timeline axis and source, fallback, and reduced-motion mode. Confirm content remains available if no animation runs.
- Check custom property registration with valid and invalid typed values, inherited and non-inherited cases, transitions, and unsupported browsers.
- Profile will-change before and after on memory-constrained devices, not only on a high-end desktop.
- For SVG, inspect computed stroke, fill, currentColor inheritance, external SVG versus inline SVG constraints, and the fallback in browsers without the experimental declaration.

## Reflection questions

- Which declaration wins after cascade, layer, and shorthand-reset rules are applied?
- Is this a layout, paint, compositing, text-shaping, or animation-timeline effect?
- Which part is standardized, experimental, implementation-specific, or unsupported?
- What useful behavior remains when the browser ignores the enhancement?
- Which test would reveal an accessibility, intrinsic-sizing, typography, or performance regression?
- What measurement or browser evidence would justify keeping an optimization hint?

## Sources

- [MDN: overflow-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow-wrap) (emergency wrapping behavior)
- [MDN: word-break](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/word-break) (contrasting line-break rules)
- [MDN: outline](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/outline) (focus indicator styling)
- [MDN: animation-timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timeline) (progress-timeline association)
- [Animation Triggers Editor’s Draft](https://drafts.csswg.org/animation-triggers-1/) (separate, experimental trigger model)
- [MDN: Registering custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Properties_and_values_API/Registering_properties) (syntax, inheritance, initial value, and interpolation)
- [MDN: will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change) (performance guidance and side effects)
- [CSS Fill and Stroke Level 3 Editor’s Draft](https://drafts.csswg.org/fill-stroke/) (status and definition of stroke-color)
- [MDN: stroke](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/stroke) (established SVG stroke property)
