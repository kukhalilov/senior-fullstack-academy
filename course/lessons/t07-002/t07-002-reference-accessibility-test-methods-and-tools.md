
# Web accessibility WCAG semantics keyboard focus ARIA and testing — Reference: Accessibility evaluation methods and tools

# Scope and version

This describes each supplied evaluation method and tool category. Tools change over time; the stable method is to combine automated checks with manual inspection against specific success criteria and real user tasks. No single checker can establish WCAG conformance. [WAI Evaluation Tools](https://www.w3.org/WAI/test-evaluate/tools/) · [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

# How this group fits the mental model

Accessibility evaluation is a layered evidence process: automatic detection finds some machine-testable failures; human review checks meaning and interaction; assistive-technology testing checks actual output; and user testing reveals barriers in real workflows. Tools assist evaluation but do not replace judgment or conformance analysis.

# Supplied names explained

- `Automated rule-based scans` — Detect patterns such as missing names or low contrast in sampled states; can produce false positives/negatives and cannot infer all meaning.
- `Keyboard-only testing` — Complete tasks using keyboard alone; inspect focus visibility/order, keyboard operation, traps, shortcuts, and dismissal.
- `Screen-reader testing` — Check names, roles, states, reading order, announcements, and task flow with supported screen readers; test representative browser/AT combinations.
- `Zoom and text resizing` — Test 200% text resize and browser zoom, checking clipping, overlap, and retained function.
- `Reflow testing` — Check WCAG 2.2 reflow dimensions and any justified two-dimensional content.
- `Contrast testing` — Measure foreground/background ratios and verify the correct text or non-text criterion, state, and exceptions.
- `Reduced-motion testing` — Review motion-triggered animation and honor operating-system reduced-motion preferences while preserving usable feedback.
- `Caption and transcript review` — Evaluate whether captions accurately convey speech and meaningful sounds and whether alternatives preserve the necessary media information.
- `Accessibility tree inspection` — Inspect browser-exposed name, role, value, state, relationships, and hidden status; tree inspection does not prove interaction works.
- `Manual review against WCAG success criteria` — Map each relevant criterion to actual page states and evidence, recording scope, exceptions, and unresolved findings.
- `axe-core` — Open-source automated accessibility engine embeddable in tests and browser tools; results require human triage.
- `WAVE` — Evaluation tool that overlays detected issues and structural information; does not certify conformance.
- `Lighthouse accessibility audit` — Browser audit with automated checks and score; score is not a WCAG conformance claim.
- `Accessibility Insights` — Tooling and guided assessment workflows, including manual checks; workflow coverage still depends on reviewer execution.
- `Browser DevTools accessibility tree` — Inspect computed accessibility properties exposed by a browser; browser and AT support can differ.
- `NVDA` — Screen reader commonly used with Windows and browsers; test version and browser combinations relevant to users.
- `JAWS` — Commercial Windows screen reader; behavior can vary by browser and configuration.
- `VoiceOver` — Apple screen reader across macOS/iOS; keyboard and touch interaction differ by platform.
- `TalkBack` — Android screen reader, commonly navigated with touch gestures and accessibility focus.
- `Orca` — Linux screen reader used with supported desktop environments and applications.

# Cross-item comparison

Automated tools are efficient for repeated regression checks, while manual review is essential for purpose, sequence, keyboard behavior, and task completion. A screen-reader test complements accessibility-tree inspection: the tree reveals exposed semantics; the screen reader reveals how a specific AT presents them. A score is not a conformance certificate; report criterion-level findings and scope.

# Examples

For a checkout page, run an automated scan, then complete checkout by keyboard, test the error and success states with a screen reader, inspect zoom/reflow, verify contrast, and review each applicable criterion. Record the environment and steps so another person can reproduce the finding.

# Common mistakes

- Treating a zero-issue automated report as proof of accessibility.
- Treating a Lighthouse score or tool badge as WCAG certification.
- Testing only the initial page view and skipping dialogs, errors, expanded states, and async updates.
- Assuming one screen reader/browser combination represents every platform.
- Failing to document test conditions and criterion-level evidence.

# Knowledge checks with answers

1. **Can automation prove WCAG conformance by itself?** No; many success criteria require human evaluation.
2. **What does a browser accessibility tree inspection establish?** What semantics that browser exposes for the inspected state, not whether the complete interaction works for every user.
3. **Why test more than one AT/browser combination?** Exposed behavior and support differ across implementations and platforms.

# Sources

- [WAI evaluation tools](https://www.w3.org/WAI/test-evaluate/tools/)
- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WAI captions guidance](https://www.w3.org/WAI/media/av/captions/)
- [WAI audio description guidance](https://www.w3.org/WAI/media/av/description/)
- [WAI images tutorial](https://www.w3.org/WAI/tutorials/images/)
