
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Big-picture orientation and mental model

# Problem and purpose

Accessibility means people with different sensory, motor, cognitive, speech, and learning needs can perceive, understand, navigate, and operate web content across devices and assistive technologies. Accessibility is not a single attribute or a passing scan. It is an interaction contract created by content, semantics, visual design, keyboard behavior, browser accessibility APIs, and testing.

# Plain-language mental model

Start with native HTML. A real `<button>` already has a role, keyboard activation, focus behavior, and state mapping understood by browsers and assistive technologies. A `<div role="button">` adds a role description but does not automatically implement those behaviors. ARIA can expose semantics and state where native HTML is insufficient; it does not implement the widget for you.

Use WCAG as a testable set of requirements, organized by four principles: Perceivable, Operable, Understandable, and Robust. WCAG 2.2 is the current stable Recommendation used here. WAI-ARIA 1.2 is a Recommendation. WAI-ARIA 1.3 is a Working Draft, so draft roles and APIs in this curriculum are explicitly marked and must not be treated as a stable support guarantee.

# How the parts fit together

1. Choose meaningful HTML and content that communicates structure and purpose.
2. Ensure visual information has an equivalent or programmatic representation when needed.
3. Make all functionality operable by supported input mechanisms, with visible and predictable focus.
4. Use ARIA only to add needed role, name, state, or relationship semantics; implement the corresponding behavior and keep state synchronized.
5. Test automated rules, keyboard interaction, zoom/reflow, contrast, motion, screen-reader output, and real tasks.
6. Evaluate the applicable WCAG criteria against the claimed level and scope; an automated score alone cannot establish conformance.

# Concept map

| Layer | Question | Example |
| --- | --- | --- |
| Content | Is meaningful information available in an accessible form? | Useful alternative for informative image |
| Semantics | Can the browser expose names, roles, relationships, and states? | Native label associated with input |
| Interaction | Can users reach and operate it with keyboard and other input? | Escape closes dialog and focus returns logically |
| Presentation | Can users distinguish, resize, zoom, and adapt content? | Contrast, reflow, text spacing, visible focus |
| Conformance | Which testable requirements apply to this scope? | WCAG 2.2 AA review of representative page states |
| Verification | What can automation find and what needs human review? | Scan plus keyboard and screen-reader pass |

# End-to-end walkthrough

Consider a custom search combobox. Native `<label>` and `<input>` semantics provide a stable starting point. If suggestions form a popup, the widget needs a supported role, an accessible name, correct expanded/controls/active-descendant state, and a deliberate keyboard model. Arrow keys move among options, Enter selects, Escape closes, and focus behavior must remain coherent. A scan may identify a missing name or invalid ARIA, but only interactive testing can reveal whether suggestions are actually navigable, announced, and useful.

# When to use it and tradeoffs

Prefer a native element when it expresses the required behavior. Use a custom ARIA pattern only when the product needs interaction not available from a native control and the team can implement and test its full behavior. WCAG provides a common evaluation baseline, but passing criteria does not ensure every individual user's needs are met. Include people with disabilities and assistive technology in evaluation where possible.

# What later lessons cover

The concepts lesson ties the four WCAG principles to semantics and interaction. Reference lessons cover each criterion group, the current/draft ARIA vocabulary, APG patterns, focus management, and test methods. Practice uses realistic failures; interview questions focus on judgment, conformance scope, and verification.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA 1.2 Recommendation](https://www.w3.org/TR/wai-aria-1.2/)
- [WAI-ARIA 1.3 Working Draft, 4 June 2026](https://www.w3.org/TR/2026/WD-wai-aria-1.3-20260604/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [APG: Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
