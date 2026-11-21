
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: WCAG 2.2 success criteria: operable navigable

# Scope and version

This covers WCAG 2.2 Guideline 2.4, including three new Level A/AA focus criteria added in 2.2. The group spans navigation, focus sequence, link purpose, headings, labels, and location cues. Verify the criterion’s level and exceptions rather than treating all thirteen as AA requirements. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

# How this group fits the mental model

Users need to find content, understand where they are, and move through interactive content without losing context. A sound information architecture helps everyone; programmatic structure and keyboard focus make that architecture available to assistive technologies and keyboard users.

# Supplied names explained

- `2.4.1 Bypass Blocks (A)` — Provide a way to bypass repeated blocks of content, such as a skip link or landmark navigation.
- `2.4.2 Page Titled (A)` — Give each web page a title describing its topic or purpose.
- `2.4.3 Focus Order (A)` — If content is navigated sequentially and sequence affects meaning or operation, focus order preserves meaning and operability.
- `2.4.4 Link Purpose (In Context) (A)` — A link’s purpose is determinable from its text alone or its programmatically determined context, with the criterion’s ambiguity exception.
- `2.4.5 Multiple Ways (AA)` — More than one way is available to locate a page within a set of pages, except where it is the result of or a step in a process.
- `2.4.6 Headings and Labels (AA)` — Headings and labels describe topic or purpose.
- `2.4.7 Focus Visible (AA)` — Keyboard-operable interfaces have a mode of operation where the keyboard focus indicator is visible.
- `2.4.8 Location (AAA)` — Information about the user’s location within a set of pages is available.
- `2.4.9 Link Purpose (Link Only) (AAA)` — Link purpose is identifiable from the link text alone, except where purpose is ambiguous to users in general.
- `2.4.10 Section Headings (AAA)` — Section headings organize content.
- `2.4.11 Focus Not Obscured (Minimum) (AA)` — When a component receives keyboard focus, it is not entirely hidden by author-created content (new in WCAG 2.2).
- `2.4.12 Focus Not Obscured (Enhanced) (AAA)` — A focused component is not hidden by author-created content (new in WCAG 2.2; stronger than “not entirely hidden”).
- `2.4.13 Focus Appearance (AAA)` — Keyboard focus indicators meet specified minimum area and contrast change requirements, with exceptions (new in WCAG 2.2).

# Cross-item comparison

| Criteria | Distinction |
| --- | --- |
| 2.4.4 / 2.4.9 | Purpose in context at A versus purpose from link text alone at AAA |
| 2.4.7 / 2.4.11 / 2.4.12 / 2.4.13 | Visible indicator; minimum non-total obscuration; enhanced no obscuration; measurable appearance |
| 2.4.5 / 2.4.8 | Multiple ways to locate a page versus an explicit location cue |

2.4.13’s required focus-indicator area is at least the area of a 2 CSS-pixel-thick perimeter of the unfocused component (or the specified equivalent), and its contrast change is at least 3:1 between the focused and unfocused pixels. Check the normative exceptions and measurement rules.

# Examples

Add a “Skip to main content” link as the first focusable item and ensure its target receives focus or is reached coherently. A sticky header must not completely cover a focused control under 2.4.11; 2.4.12 tightens that to no obscuration. Give each search result link enough text to distinguish it and preserve a logical keyboard path through filters, results, and pagination.

# Common mistakes

- Treating a page’s visual top-to-bottom order as proof that focus order is meaningful.
- Using “click here” repeatedly and assuming surrounding layout always supplies context.
- Treating 2.4.11, 2.4.12, and 2.4.13 as interchangeable.
- Assuming focus visibility means browser defaults must be retained unchanged; a custom indicator is fine if it is visible and meets applicable criteria.
- Applying 2.4.13 as an AA requirement; it is AAA.

# Knowledge checks with answers

1. **Which new criterion requires that focus not be entirely hidden?** 2.4.11 (AA).
2. **Which one requires no obscuration at AAA?** 2.4.12.
3. **What is the level of Focus Appearance?** AAA.
4. **Can a process wizard use one navigation path?** Yes, the Multiple Ways criterion has a process exception.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
