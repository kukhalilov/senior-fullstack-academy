
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: WCAG 2.2 success criteria: robust compatible

# Scope and version

This covers the active WCAG 2.2 success criteria in Guideline 4.1. A notable version change: 4.1.1 Parsing was removed from WCAG 2.2; it remains relevant when interpreting older WCAG 2.0/2.1 policy claims, but is not an active 2.2 criterion. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

# How this group fits the mental model

Robustness means that user agents and assistive technologies can interpret interface components and changes. Correct names, roles, values, states, and notifications matter more than a markup technology in isolation. Conformance should be evaluated against the current WCAG version and the actual accessibility APIs exposed in supported browser/AT combinations.

# Supplied names explained

- `4.1.2 Name, Role, Value (A)` — For all user-interface components (including forms and generated content), name and role are programmatically determinable; states, properties, and values that users can set are programmatically settable; and notification of changes is available to user agents, including assistive technology. Standard HTML controls satisfy many of these behaviors natively; custom widgets need equivalent exposed semantics and state updates.
- `4.1.3 Status Messages (AA)` — Status messages can be programmatically determined through role or properties so assistive technology can present them without receiving focus. Examples include a search result count, save confirmation, or validation status. Do not move focus to every routine message.

# Cross-item comparison

4.1.2 concerns the exposed interface contract for components; 4.1.3 concerns status messages that arise without a focus change. A live region can help expose a status but must be used with appropriate semantics and timing; excessive announcements can be disruptive. 4.1.1 Parsing is removed from WCAG 2.2, so do not present it as a current 2.2 criterion.

# Examples

Use a native `<button>` for an action so the browser supplies role, focusability, and activation behavior. A custom disclosure must expose its expanded state and update it when toggled. After filtering a list, announce “12 results” in a suitable status region without moving keyboard focus from the filter control.

# Common mistakes

- Adding an ARIA role but omitting the state or behavior users expect for that role.
- Announcing a message visually but not exposing a programmatic status.
- Moving focus to a routine status message unnecessarily.
- Listing 4.1.1 as active under WCAG 2.2.
- Believing valid HTML alone proves complete accessibility or conformance.

# Knowledge checks with answers

1. **What does 4.1.2 require beyond a role?** Programmatic name, role, settable states/properties/values, and notification of changes.
2. **Should a search result count usually steal focus?** No; a programmatically exposed status can be announced without focus movement.
3. **Is 4.1.1 active in WCAG 2.2?** No, it was removed from the 2.2 success criteria.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
