
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Core concepts and how they fit together

# Learning objectives

Explain accessibility as a whole-user experience; distinguish WCAG principles, guidelines, success criteria, and informative techniques; choose native semantics before ARIA; reason about accessible names, descriptions, focus, and input modes; identify WCAG 2.2 additions and removed criteria; and design a mixed-method test plan.

# Prerequisites

Know semantic HTML, forms, links, focusable elements, CSS, and basic JavaScript event handling. Accessibility is a quality of the rendered experience and interaction, not just the DOM source or a single compliance score.

# Core concepts

## People use different ways to perceive and operate a page

Users may rely on screen readers, magnification, high-contrast settings, captions, switch access, speech recognition, keyboard-only navigation, reduced motion, simplified language, or combinations. The same user may use different devices or modes in different contexts. Design for perceivable information, operable functionality, understandable behavior, and robust semantics.

These four names form POUR: **Perceivable**, **Operable**, **Understandable**, and **Robust**. WCAG guidelines group the testable success criteria beneath these principles. A conformance claim names a level (A, AA, or AAA) and a scope; it is not implied by a page being “accessible” in a general sense. AAA criteria are not universal requirements for every site, and some are not practical for all content.

## Semantics are a contract with browser accessibility APIs

Native HTML elements communicate purpose and often include interaction behavior. An anchor navigates; a button activates; a label names a form control; a heading contributes structure. Use the native element whose behavior matches the task.

ARIA lets authors provide or refine a role, accessible name, description, state, or relationship in the accessibility tree. It does not create keyboard focus, event behavior, validation, selection, or visual feedback. If a custom element uses `role="checkbox"`, it still needs focusability, Space behavior, and synchronized checked state. Adding a redundant or contradictory role to a native element can make the accessibility tree worse.

## Names, descriptions, and visual labels must agree

An accessible name is the concise label assistive technology uses to identify a control. It can come from native HTML, visible text, or supported ARIA naming mechanisms. An accessible description supplies additional explanation. Prefer visible, programmatically associated labels; use `aria-labelledby` to reference existing visible naming text when that produces the right name. `aria-label` can supply a name when no suitable visible label exists, but it can replace a visible label and create speech-control mismatches.

WCAG 2.5.3 Label in Name requires that where a component has a visible text label, its accessible name contain that visible text. This helps users who speak visible labels to voice control. Names and descriptions should not be used as a substitute for visible instructions, status, or error feedback.

## Keyboard focus is a state machine, not decoration

Every operable function needs keyboard access unless the underlying task inherently depends on path-based movement. Focus order should preserve meaning and operation. The focus indicator must remain visible and not be hidden by sticky content, overlays, or dialogs. A custom composite widget usually keeps only one child in the normal Tab sequence and uses arrow keys internally; its pattern determines the precise behavior.

Roving `tabindex` moves DOM focus among widget items. `aria-activedescendant` keeps DOM focus on a container while exposing which descendant is active. These are different strategies; neither automatically implements key handling, selection, announcement, or focus restoration. When a modal closes, return focus to a logical trigger or fallback. Avoid focus traps unless the component's modal interaction contains focus and provides a predictable exit.

## Input modality independence matters

Do not require multi-point/path gestures or motion actuation when a simpler pointer operation or UI control can provide the same function. Do not commit an irreversible action on pointer-down if users need the ability to cancel before release. Support concurrent input mechanisms rather than disabling keyboard access when touch is available. Provide a non-drag single-pointer alternative where dragging is required and the criterion applies.

## WCAG 2.2 is a normative Recommendation; ARIA 1.3 here is draft

WCAG 2.2 adds nine success criteria, including focus not obscured, focus appearance, dragging movements, target size minimum, consistent help, redundant entry, and accessible authentication. It removes 4.1.1 Parsing from its active criteria; do not continue to count 4.1.1 as a WCAG 2.2 success criterion. W3C maintains WCAG 2.0 and 2.1 as Recommendations too, but recommends using the most current version for new work.

WAI-ARIA 1.2 remains a Recommendation; the 1.3 document used here is a June 2026 Working Draft. It includes proposed additions such as `sectionheader`/`sectionfooter`, `ariaNotify()`, and a document-root `aria-hidden` restriction. These are not stable baseline promises: check browser and assistive-technology support, label them as draft, and do not depend on them for essential access.

## Testing is a layered process

Automated scans are good at repeatable, rule-based issues: some missing names, invalid attributes, contrast calculations where colors are computable, and certain structural mistakes. They cannot determine whether an image alternative is meaningful, a reading order makes sense, a control's spoken name is usable, or a custom widget works in the user's actual task.

Use automation as one pass, then test keyboard-only, visible focus, zoom and reflow, text spacing, contrast, reduced motion, captions, accessibility-tree output, and representative screen readers. Test every important dynamic state: dialogs open/closed, errors, loading, expanded content, validation, and responsive layouts. Tool/version coverage differs; record unresolved manual-review items instead of treating a clean scan as conformance.

# Mechanisms and relationships

| Concept | Native-first approach | ARIA/custom fallback responsibility |
| --- | --- | --- |
| Name | `<label>`, heading, link/button text | Name computation and visible-text match |
| Role | Correct HTML element | Role must match behavior and be supported |
| State | Native checked/disabled/expanded controls | Keep ARIA state synchronized with real state |
| Keyboard | Browser's built-in behavior | Implement focus, keys, exit, and restoration |
| Error/status | Associated text and native form semantics | Programmatic relationship/live announcement where needed |
| Conformance | Evaluate applicable WCAG criteria | Test context, states, and exceptions carefully |

# Worked examples

```html
<label for="email">Work email</label>
<input id="email" name="email" type="email" autocomplete="work email" required>
```

The native label supplies a visible and programmatic name. Native input behavior supports keyboard and browser form APIs. If validation fails, the page still needs to identify the error and help the user correct it; `required` alone does not explain a server-side rejection.

```html
<button type="button" aria-expanded="false" aria-controls="help-panel">
  Show help
</button>
<div id="help-panel" hidden>Choose the account associated with this request.</div>
```

The button already provides keyboard behavior. JavaScript must update `aria-expanded` and the panel's visibility together. ARIA does not perform the toggle.

# Misconceptions and edge cases

- “ARIA makes any element accessible.” It changes exposed semantics; behavior must still be implemented.
- “A passing automated audit proves WCAG conformance.” Many criteria require contextual/manual evaluation.
- “A role implies browser keyboard support.” Native HTML often supplies behavior; custom ARIA does not.
- “Every criterion applies at every conformance level.” Each criterion has a level and the claimed scope matters.
- “WCAG 2.2 still contains 4.1.1 Parsing.” It was removed from the active 2.2 success criteria.
- “ARIA 1.3 draft features are current interoperable APIs.” They are working-draft material and support varies.
- “An accessible name and visible label can safely contradict.” Label-in-Name and speech input make mismatch harmful.
- “Focus styling is cosmetic.” Visible, predictable focus is necessary to operate the interface.
- “A screen-reader test replaces keyboard and visual checks.” Each method reveals different failures.

# Knowledge checks with answers

1. **What does POUR stand for?** Perceivable, Operable, Understandable, Robust.
2. **What does ARIA add to a custom widget by itself?** Accessibility-tree semantics, not interaction or visual behavior.
3. **What should be used before custom ARIA if it fits?** Native semantic HTML.
4. **Which version is the stable ARIA Recommendation here?** WAI-ARIA 1.2; 1.3 is explicitly a Working Draft.
5. **Is 4.1.1 Parsing an active WCAG 2.2 criterion?** No.
6. **Can an automated scan establish complete WCAG conformance?** No; context-sensitive criteria and user tasks need additional evaluation.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA 1.2 Recommendation](https://www.w3.org/TR/wai-aria-1.2/)
- [WAI-ARIA 1.3 Working Draft, 4 June 2026](https://www.w3.org/TR/2026/WD-wai-aria-1.3-20260604/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [APG: Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [WAI evaluation tools](https://www.w3.org/WAI/test-evaluate/tools/)
