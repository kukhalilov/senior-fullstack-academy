
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: Accessibility model, POUR principles, and WCAG guidelines

# Scope and version

This reference covers the thirty supplied model, principle, and interaction terms. WCAG 2.2 is treated as the current stable Recommendation; WAI-ARIA 1.2 is a Recommendation and WAI-ARIA 1.3 is a Working Draft. Criteria names and conformance status come from [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [ARIA](https://www.w3.org/TR/wai-aria-1.2/), and the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/).

# How this group fits the mental model

An interface is accessible when its information and operations can be perceived, operated, understood, and interpreted robustly by users and their technologies. WCAG supplies testable criteria; semantic HTML and ARIA expose structure and state; focus and keyboard behavior make interactions operable; testing checks the rendered experience.

# Supplied names explained

- `Accessibility as support for diverse user needs` — Design must account for differences in vision, hearing, movement, cognition, speech, learning, and situational context. A standard is a useful baseline, not proof that every individual need has been met.
- `Perceivable` — Information and interface components must be presentable through the senses available to users. Text alternatives, captions, structure, contrast, and resizing support this principle.
- `Operable` — Interface components and navigation must be usable with available input methods and sufficient time. Keyboard access, focus management, bypass mechanisms, and gesture alternatives are examples.
- `Understandable` — Information and operation must be comprehensible and predictable. Page/part language, consistent navigation, labels, and error guidance are examples.
- `Robust` — Content should interoperate with current and evolving user agents and assistive technologies. Programmatic names, roles, states, and valid relationships are important.
- `1.1 Text Alternatives` — Guideline group requiring text alternatives for non-text content so it can be changed into forms people need, such as large print, braille, speech, symbols, or simpler language.
- `1.2 Time-based Media` — Guideline group for alternatives to prerecorded/live audio and video, including captions, transcripts/media alternatives, sign language, and audio description at specified levels.
- `1.3 Adaptable` — Guideline group ensuring information, structure, and relationships conveyed visually or audibly can be programmatically determined or supplied in text, and presentation can adapt without losing meaning.
- `1.4 Distinguishable` — Guideline group for making information easier to see/hear, including color alternatives, contrast, resizing, reflow, spacing, and content appearing on hover/focus.
- `2.1 Keyboard Accessible` — Guideline requiring functionality to be operable through a keyboard interface, with no keyboard trap and controlled character shortcuts.
- `2.2 Enough Time` — Guideline group for adjustable limits, moving/updating content, interruptions, reauthentication, and timeouts.
- `2.3 Seizures and Physical Reactions` — Guideline group limiting dangerous flashes and allowing motion triggered by interaction to be reduced where applicable.
- `2.4 Navigable` — Guideline group for finding content, determining location, meaningful focus order, headings/labels, and visible/unobscured focus.
- `2.5 Input Modalities` — Guideline group for alternative pointer gestures, cancellation, label/name alignment, motion input, target size, dragging alternatives, and multiple input mechanisms.
- `3.1 Readable` — Guideline group for programmatically identifying the page language and language changes, with additional AAA support for unusual words, abbreviations, reading level, and pronunciation.
- `3.2 Predictable` — Guideline group limiting unexpected context changes and keeping navigation, identification, and help consistent.
- `3.3 Input Assistance` — Guideline group for identifying errors, providing labels/instructions and suggestions, preventing serious submission errors, reducing redundant entry, and accessible authentication.
- `4.1 Compatible` — Guideline for compatibility with current and future user agents, especially programmatically determinable names/roles/values and status messages. WCAG 2.2 removes the former 4.1.1 Parsing criterion; the active group contains 4.1.2 and 4.1.3.
- `Semantic HTML before ARIA` — Prefer HTML elements and attributes that already convey the intended role and behavior. ARIA cannot repair wrong element behavior and redundant ARIA can conflict with native mappings.
- `Native controls before custom widgets` — Prefer `<button>`, `<input>`, `<select>`, and other native controls when their behavior fits. Custom widgets require authored keyboard, focus, state, and assistive-technology behavior.
- `Accessibility tree` — The platform representation browsers expose to assistive technologies, derived from DOM, styles, HTML semantics, ARIA, and browser/platform mapping. It is related to, but not the same as, the DOM.
- `Accessible name` — The computed concise label identifying a control or landmark. It can come from native labels/content or ARIA naming sources; use naming rules and visible text deliberately.
- `Accessible description` — Supplemental explanation associated with a control, often via native descriptive content or `aria-describedby`. A description does not replace the accessible name or visible instruction.
- `Keyboard focus order` — The order in which sequential keyboard navigation reaches focusable components. It should preserve meaning and operation; visual position, DOM order, and positive `tabindex` manipulation can diverge.
- `Visible focus` — A sufficiently perceivable indication of the currently focused component. Do not remove browser outlines without replacing them with an equally useful indicator across themes and forced-colors settings.
- `Keyboard operability` — Every function available by pointer must also be available via keyboard unless the underlying task inherently requires path-dependent movement. Focusable custom elements must handle appropriate keys.
- `Input modality independence` — Avoid making an operation depend exclusively on touch, mouse, multipoint gestures, or device motion when equivalent alternative input can support it. Keep input mechanisms available concurrently.
- `Reduced motion` — Respect user preferences and provide controls/alternatives for nonessential motion where applicable. WCAG 2.2 includes AAA 2.3.3 for animation from interactions; platform preference support is a design mechanism, not a substitute for criterion-specific evaluation.
- `Text alternatives` — Text equivalents for meaningful non-text content, including functional images and controls. Decorative content should not create redundant announcements; complex content may need a concise alternative plus a fuller adjacent explanation.
- `Error prevention and recovery` — Identify errors in text, provide labels/instructions and suggestions where possible, preserve entered data, and support review, correction, reversal, or confirmation for covered high-impact submissions.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| Principle vs guideline | A principle is a broad outcome; a guideline organizes related testable success criteria. |
| Success criterion vs technique | A criterion is normative/testable; techniques and examples explain possible ways to satisfy it. |
| Accessible name vs description | Name identifies the component; description adds supporting information. |
| DOM vs accessibility tree | DOM represents document nodes; the accessibility tree exposes platform semantics and may omit or transform nodes. |
| Native control vs custom ARIA widget | Native control supplies built-in semantics and behavior; a custom widget requires explicit behavior and testing. |

# Examples

```html
<h1>Payment details</h1>
<label for="card-number">Card number</label>
<input id="card-number" inputmode="numeric" autocomplete="cc-number">
<p id="card-help">Enter the number printed on the card.</p>
```

The heading exposes document structure. The input receives its name from an associated visible label. Supplemental instructions can be programmatically associated as a description. The control remains a native input; ARIA should be added only when a needed relationship or state is not already expressed.

# Common mistakes

- Treating POUR as four separate disability categories; each principle supports overlapping needs.
- Treating a technique or automated rule as the normative WCAG success criterion.
- Assuming AAA criteria automatically apply to a claimed AA scope.
- Equating the accessibility tree with the DOM or believing every hidden node is exposed.
- Using an accessible description where the control has no name.
- Adding ARIA to native controls without verifying whether native semantics already provide it.
- Treating WCAG 2.2 as including active criterion 4.1.1 Parsing.
- Claiming that a WCAG pass covers every human accessibility need.

# Knowledge checks with answers

1. **What does POUR stand for?** Perceivable, Operable, Understandable, Robust.
2. **Which is normative: a success criterion or an informative technique?** The success criterion; techniques are informative ways to meet it.
3. **What identifies a control, its name or description?** Its accessible name; the description adds context.
4. **Does ARIA implement a custom control's keys?** No.
5. **Is 4.1.1 part of active WCAG 2.2 criteria?** No; it was removed in WCAG 2.2.
6. **Does a clean accessibility scan prove the page is accessible?** No; manual/contextual evaluation remains necessary.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WAI: What's new in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [WAI-ARIA 1.2 Recommendation](https://www.w3.org/TR/wai-aria-1.2/)
- [WAI-ARIA 1.3 Working Draft, 4 June 2026](https://www.w3.org/TR/2026/WD-wai-aria-1.3-20260604/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
