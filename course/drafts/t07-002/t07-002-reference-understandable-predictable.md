<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: WCAG 2.2 success criteria: understandable predictable

# Scope and version

This reference covers six success criteria in WCAG 2.2 Guideline 3.2. The criteria address changes of context, consistent navigation and identification, and predictable help placement. WCAG 2.2 added 3.2.6 at Level A. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

# How this group fits the mental model

Predictability reduces surprises that can disorient people who navigate incrementally or rely on stable controls. A context change can include a new window, focus movement, or substantial change of content; not every state update is a context change. Explicit activation and advance warning let users retain control.

# Supplied names explained

- `3.2.1 On Focus (A)` — Receiving focus alone does not initiate a change of context.
- `3.2.2 On Input (A)` — Changing a setting of a UI component does not automatically cause a context change unless users are advised of the behavior before using it.
- `3.2.3 Consistent Navigation (AA)` — Repeated navigational mechanisms appear in the same relative order on pages in a set, unless the user initiates a change.
- `3.2.4 Consistent Identification (AA)` — Components with the same functionality within a set of pages are identified consistently.
- `3.2.5 Change on Request (AAA)` — Changes of context are initiated only by user request or users can turn them off.
- `3.2.6 Consistent Help (A)` — If help mechanisms occur on multiple pages in a set, they appear in the same relative order with respect to other page content, unless the user initiates a change. Help examples include human contact details, human contact mechanism, self-help options, and a fully automated contact mechanism.

# Cross-item comparison

3.2.1 concerns focus; 3.2.2 concerns changing a component value; both prevent unannounced context changes. 3.2.3 and 3.2.4 stabilize repeated page mechanisms and functionally equivalent components. 3.2.6 extends consistent placement to help mechanisms and is Level A in WCAG 2.2.

# Examples

Focusing a select control should not immediately navigate away. Changing a country selection may update dependent fields, but if it submits or navigates automatically, tell users beforehand. Keep the site’s help link in a consistent relative location across pages, even when some pages use different content.

# Common mistakes

- Treating every dynamic text update as a change of context.
- Automatically submitting when a radio button changes without advance notice.
- Reordering navigation because one page’s layout is slightly different when users did not initiate the change.
- Omitting help from a page and assuming consistent placement criterion requires a help feature on every page; it applies when the help mechanism appears on multiple pages in the set.

# Knowledge checks with answers

1. **Which WCAG 2.2 criterion standardizes help location?** 3.2.6, Level A.
2. **Does a focus event alone authorize navigation?** No, not under 3.2.1.
3. **What is the scope of consistent identification?** Components with the same functionality across pages in a set.

# Sources

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
