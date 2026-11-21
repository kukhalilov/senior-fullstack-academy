
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Interview questions and reasoning

# Scope

Use these answers as reasoning frameworks rather than memorized slogans. A strong response names user impact, relevant criterion or platform behavior, a concrete implementation, and how it would be verified. WCAG 2.2 is the current cited Recommendation here; WAI-ARIA 1.3 is a Working Draft and must be identified as such. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) · [WAI-ARIA 1.3 Working Draft](https://www.w3.org/TR/2026/WD-wai-aria-1.3-20260604/)

# Core questions

These questions progress from foundational semantics to implementation tradeoffs and verification.

# Concise interview answers

## 1. What is the first choice when making a control accessible?

Use the appropriate native HTML element. Native controls provide semantics, keyboard behavior, focusability, and form integration. Add ARIA only when native HTML cannot express the needed semantics; ARIA does not implement behavior.

## 2. Explain role, name, state, and value.

Role tells users what a component is; name identifies it; state reports current condition such as expanded or checked; value reports a value such as a slider position. All need to agree with visible UI and actual interaction. Descriptions provide supporting detail, not the primary identity.

## 3. How do you implement a keyboard-accessible composite widget?

Start with the relevant APG pattern and native alternatives. Define one Tab entry point, movement and activation keys, disabled behavior, focus strategy (roving tabindex or active descendant), visible focus, and exit behavior. Implement the corresponding states and test the complete task using keyboard alone and representative AT/browser combinations.

## 4. What changed in WCAG 2.2?

It added nine criteria, including focus not obscured, focus appearance, dragging movements, minimum target size, consistent help, redundant entry, and accessible authentication criteria. 4.1.1 Parsing was removed. Distinguish the AA criteria from AAA additions and cite the normative version.

## 5. What is the difference between WCAG 2.5.5 and 2.5.8?

2.5.5 is the AAA 44×44 CSS-pixel enhanced target-size criterion. 2.5.8 is the AA 24×24 CSS-pixel minimum with spacing and other explicit exceptions. Neither should be reduced to a universal rule without applying the full criterion.

## 6. How do you test an accessible form?

Check visible and programmatic labels, instructions, required status, keyboard order, error identification and suggestions, preserved values, focus handling, and success messages. Test errors and valid submission with automation, keyboard, screen reader, zoom/reflow, and actual task completion. Consequential submissions may need review, correction, reversal, or confirmation safeguards.

## 7. What can automated accessibility tools prove?

They can find some detectable failures and help prevent regressions. They cannot establish meaning, usability, complete keyboard behavior, caption accuracy, or all WCAG conformance. Report criterion-specific manual evidence as well.

## 8. How do `aria-live` and `role="status"` differ from moving focus?

They expose a status update for assistive technology without moving DOM focus. Choose polite versus assertive behavior based on urgency; excessive messages disrupt users. Test the result in supported screen-reader/browser combinations.

## 9. How should you approach a modal dialog?

Give it an accessible name; move focus to an appropriate element; make background content unavailable while modal; keep keyboard navigation in the dialog; provide a clear close route; and restore focus to the invoker or a logical successor. `aria-modal="true"` describes modality but does not create it.

Draft definitions may change and implementations can vary. Separate stable 1.2 Recommendation features from draft-only APIs/roles, check support, and provide resilient behavior if a draft feature is unavailable.

# Deep follow-up answers

For a composite widget, explain both roving tabindex and `aria-activedescendant`, including DOM focus and AT exposure differences. For a modal dialog, explain the visual overlay, inert background, keyboard containment, dismissal, and focus restoration. For WCAG, distinguish normative criteria from informative techniques and automated checks from conformance evidence.

# Scenario questions

1. **A test tool reports no issues, but a screen-reader user cannot identify a search result count. What next?** Inspect the status semantics and actual announcement; tool success does not establish 4.1.3 behavior.
2. **A custom menu works with a mouse but not arrows or Escape. How do you respond?** Compare against the appropriate APG pattern, implement the full keyboard model, and test entry, exit, and focus return.

# Tradeoffs and alternatives

Prefer native elements because their behaviors are implemented by the platform. Custom ARIA widgets can support specialized interaction, but increase implementation and testing work. A polite live region can be less disruptive than moving focus for a routine status, while an urgent alert may justify interruption. Choose the least complex design that fully supports the task.

# Common weak answers

- “Add ARIA” without naming the role, name, state, behavior, or test.
- “The scanner passes, so it is accessible.”
- “ARIA modal traps focus” without implementing focus containment or background inertness.
- Treating all WCAG 2.2 additions as AA or omitting their exceptions.
- Presenting WAI-ARIA 1.3 draft features as stable and universally supported.

# Self-check rubric

# Follow-up prompts

- Name the specific criterion and conformance level that applies.
- What is the actual user-visible and accessibility-tree behavior before and after the fix?
- Which states and edge cases would you test?
- Which checks are automated, and what still requires manual evidence?
- What browser, operating system, and assistive technology combinations matter for this audience?

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA 1.2 Recommendation](https://www.w3.org/TR/wai-aria-1.2/)
- [Dated WAI-ARIA 1.3 Working Draft](https://www.w3.org/TR/2026/WD-wai-aria-1.3-20260604/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
