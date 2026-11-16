<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Web accessibility WCAG semantics keyboard focus ARIA and testing — Exercises and worked solutions

# Goals

These exercises practice applying WCAG 2.2, native semantics, ARIA interaction models, and layered evaluation. State assumptions: the target is an ordinary web application, current stable browser behavior is desired, and the WCAG conformance level is specified per question. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) · [APG](https://www.w3.org/WAI/ARIA/apg/)

# Worked example

Before attempting the exercises, inspect each control using four questions: what role does the browser expose, what is its accessible name, what state/value is exposed, and can it be operated using the required inputs? Validate behavior, not just markup.

## Unlabeled custom action

```html
<div class="save" onclick="save()"><svg aria-hidden="true">...</svg></div>
```

**Identify at least four barriers and propose a native solution.**

**Worked solution:** It is not keyboard focusable by default, lacks button role/name, lacks native Enter/Space activation, and may not expose disabled/pressed state if applicable. Use `<button type="button" class="save" onclick="save()"><svg aria-hidden="true">...</svg><span class="visually-hidden">Save changes</span></button>`. Keep a visible label if the design allows it. Prefer an event listener in application code over inline JavaScript. Verify focus indication and behavior with keyboard and accessibility-tree inspection.

# Exercises

Complete each exercise before reading the solution. For every answer, name the criterion or semantic behavior involved and propose a way to verify the fix.

## Drag-only task

A user must drag rows to reorder a list. They cannot move a row with keyboard or touch alternatives. Which WCAG 2.2 criterion is most directly implicated, and propose a single-pointer alternative.

**Worked solution:** 2.5.7 Dragging Movements (AA) requires the functionality be achievable by a single pointer without dragging unless an exception applies. Add per-row “Move up” and “Move down” buttons, or a destination-selection mechanism. Keyboard accessibility is also required independently. After reorder, preserve focus and announce the updated position appropriately.

## Timed form

A form expires after ten minutes without warning and discards entered values. Describe the review and likely remedies.

**Worked solution:** Evaluate 2.2.1 Timing Adjustable (A), and where applicable 2.2.6 Timeouts (AAA). Determine whether the limit is content-set and whether a listed exception truly applies. Warn before expiry, allow the required repeated extension flow, preserve entered data, and offer re-authentication or recovery. A security rationale alone does not automatically establish an exception.

## Inaccessible dialog

A custom dialog has `role="dialog" aria-modal="true"`, but background controls remain reachable and closing leaves focus at the document start. Explain the defect.

**Worked solution:** `aria-modal` announces modal semantics; it does not implement modality. When the dialog opens, move focus to a meaningful control, keep keyboard interaction within the modal, make background content inert/unavailable while modal, provide an operable close path, and restore focus to the invoker or logical successor. Ensure the dialog has an accessible name.

## Image alternatives

A product image shows the same product name printed beside it. A second image is a complex chart containing data not repeated elsewhere. How should alternatives differ?

**Worked solution:** If the product image is redundant beside an equivalent name, use an empty alternative (`alt=""`) so it does not repeat the name. The chart needs a concise identifying alternative plus a nearby long description, data table, or equivalent content exposing the key relationships and values. Choose based on the image’s purpose in context, not file format.

## ARIA and native controls

An author changes a native checkbox’s visual style and sets `aria-checked`, but toggles an unrelated CSS class on click. What must be kept consistent?

**Worked solution:** The actual checked state, accessible state, visual appearance, and form-submission value must agree. Prefer the native `checked` property and native change event. Do not maintain a parallel state model that can drift. Test mouse, keyboard Space, programmatic reset, and form submission.

## Evaluate a result message

After search, visual text updates from “Searching” to “8 results,” but no focus moves. What should be inspected?

**Worked solution:** Determine whether the result is a status message under 4.1.3 and expose it programmatically (for example, a suitable status/live region). Test announcement timing and avoid duplicate or noisy announcements. Keep focus on the search control unless the task context justifies moving it.

## Contrast and target size

A small icon button has a 20×20 CSS px target and a faint focus outline. The team cites 2.5.8 spacing exception. What else needs review?

**Worked solution:** Verify the actual target-size exception geometry and nearby target spacing. Separately evaluate focus visibility (2.4.7), Focus Not Obscured (2.4.11 at AA), and non-text contrast for component/focus visuals (1.4.11 as applicable). Target size does not excuse a low-contrast or hidden focus indicator.

# Progressive hints

1. Compare a custom action with a native button.
2. Check pointer alternatives as well as keyboard support for dragging.
3. Determine whether the timer is set by content and which exceptions truly apply.
4. Remember that ARIA describes modality but does not implement it.
5. Determine whether an image adds information in context.
6. Compare actual checkbox state, visual state, and exposed state.
7. Consider WCAG 4.1.3 and focus behavior for status messages.
8. Target size and focus contrast are separate questions.

# Complete solutions

The worked solutions appear directly under each exercise so the reasoning can be reviewed immediately after an attempt.

# Tests and edge cases

Retest with keyboard only, pointer/touch, accessibility-tree inspection, and representative screen-reader combinations. Include disabled states, errors, asynchronous updates, zoom/reflow, high contrast, and focus restoration. Automated scans supplement these checks.

# Reflection questions

For each fix, name the actual success criterion, level, relevant state, and evidence. Explain which checks can be automated and which need human interaction testing. A tool result is evidence, not a conformance certificate.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
