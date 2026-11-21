# frontend tests accessibility browser automation and Playwright — Reference: Accessibility semantics, automated scans, keyboard checks, and visual regression

# Scope and version

This lesson covers the exact accessibility and visual-testing names supplied for this group. WCAG 2.2 contains testable success criteria at several conformance levels, but a tool scan does not establish conformance. Playwright’s accessibility guide uses axe-core as an example and explicitly cautions against treating automated checks as complete. Sources were rechecked 2026-11-21, including WCAG conformance requirements for full pages and all success criteria at the claimed level. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing) [axe-core](https://github.com/dequelabs/axe-core)

# How this group fits the mental model

Accessibility checks ask whether content and controls can be perceived, understood, and operated through different input modes and assistive technologies. Visual checks ask whether rendered appearance changed under a controlled environment. They overlap in some issues—such as visible focus or contrast—but neither replaces the other. Use automated rules for repeatable detection, keyboard review for operability, assistive technology for real interaction, and screenshots for pixel differences.

# Supplied names explained

- `Accessible name` — The computed label by which an assistive technology can identify an element, such as a button’s visible text or a form control’s associated label. A control should have a name that makes its purpose clear in context.
- `Accessible description` — Additional explanatory text associated with an element beyond its name, often used to provide instructions or help. Do not use a description as a substitute for a missing name.
- `ARIA role` — A semantic role exposed through the accessibility tree, describing what an element is or does. Prefer native HTML semantics when they provide the required behavior; adding a role alone does not implement keyboard behavior or state management.
- `Label-control association` — The programmatic relationship between a form label and its control. It lets users and assistive technology identify what information belongs in a field; visible proximity alone may not establish that relationship.
- `Keyboard-only navigation` — Completing a task using keyboard input without a mouse or touch. Check that every interactive control is reachable and operable, and that users can move away from each control.
- `Visible focus indicator` — A perceivable visual cue identifying the currently focused element. Removing the browser outline without an adequate replacement makes keyboard location difficult to track.
- `Focus order` — The sequence in which focus moves through interactive content. It should preserve meaning and operability; DOM order and visual order should not create a confusing or impossible navigation path.
- `Focus trap` — A deliberate focus boundary used in some modal interactions to keep keyboard focus inside the active dialog until it closes, then return focus appropriately. An accidental trap blocks users from leaving a region and is a serious barrier.
- `Skip link` — A keyboard-accessible link that lets users bypass repeated navigation and move to the main content. It should become visible when focused and lead to a meaningful destination.
- `WCAG 2.2 Level A` — The minimum WCAG 2.2 conformance level. A conformance claim applies to a full page and requires satisfying every Level A success criterion (or a conforming alternate version); a passing automated scan is not enough.
- `WCAG 2.2 Level AA` — Conformance requires satisfying all Level A and Level AA success criteria for the full page (or a conforming alternate version). Many legal or organizational standards specify a target level, but the applicable requirement depends on jurisdiction and policy; this term alone does not state which obligation applies.
- `axe-core` — Deque’s open-source accessibility testing engine that evaluates a rendered DOM against rules it can automate. It can detect many common issues, but cannot determine all context-dependent barriers or replace human checks.
- `AxeBuilder` — The Playwright integration’s builder used to configure and run axe-core analysis for a page. Use a focused page/state and report actionable violations; do not treat a passing scan as full conformance.
- `@axe-core/playwright` — The package that integrates axe-core scanning with Playwright pages through `AxeBuilder`. Keep its version aligned with the accessibility rules and browser setup used by the project.
- `axe.run` — The axe-core entry point for analyzing a selected document or context. Scope the scan to the relevant rendered state and interpret results using the project’s WCAG target and context.
- `Automated accessibility rule scan` — A repeatable tool check for accessibility patterns that can be evaluated from page structure and computed properties. It catches a subset of potential barriers, not all WCAG requirements or usability problems.
- `Accessibility tree` — The browser-exposed representation of interface elements, roles, names, descriptions, states and relationships used by assistive technologies. It differs from a raw DOM tree because not every DOM node is exposed in the same way.
- `Color contrast check` — An evaluation of text or meaningful visual indicators against their background according to applicable contrast criteria. Check actual rendered colors and states; an automated tool may not resolve gradients, images, overlays or contextual meaning reliably.
- `Reduced motion preference` — A user or operating-system preference indicating that motion should be reduced. Interfaces should respect it when animation could cause discomfort or interfere with use; check both the reduced and default presentation when motion is significant.
- `Screen-reader smoke test` — A short, focused check with a screen reader to confirm that a critical path can be understood and operated. It is not a complete assistive-technology compatibility matrix, but can reveal failures an automated scan cannot.
- `Manual assistive technology check` — Human evaluation using relevant assistive technologies and interaction modes. Select combinations based on the supported user population and product risk; one screen reader/browser pairing cannot represent every setup.
- `Visual regression test` — A test that compares rendered pixels or regions with an accepted image baseline. It can reveal unintended appearance changes but cannot prove semantic correctness or keyboard behavior.
- `Screenshot baseline` — The reference image used by a visual comparison. It represents an intentional expected rendering and should be reviewed, versioned, and updated deliberately when the design change is approved.
- `Pixel-diff threshold` — A tolerance for pixel differences when comparing screenshots. A larger threshold can hide real regressions; a smaller one can flag harmless antialiasing variation. Tune it narrowly and review the image diff, not just the pass/fail result.
- `Viewport normalization` — Fixing viewport dimensions and related rendering settings across runs so layout comparisons are meaningful. Include browser/device scale and color scheme when they affect the rendered output.
- `Font-loading stabilization` — Ensuring the intended fonts have loaded before capturing a screenshot. A fallback font can change wrapping, dimensions and pixel output even when application styles are unchanged.
- `Animation disablement` — Suppressing or waiting for animations/transitions before a screenshot comparison. Disable only for capture stability; keep separate behavior tests if motion or transitions are part of the product requirement.
- `Intentional snapshot update` — A reviewed change to the expected screenshot baseline after confirming the design difference is expected. An updated baseline is a changed test expectation and should be reviewed alongside source changes.

# Cross-item comparison

**Name and description:** The accessible name identifies the control; the description adds instructions or context. Both should be concise and meaningful. A label-control association is one common way to provide a form control name.

**Automated scan vs human review:** axe-core checks detectable rules for the rendered state. Keyboard review checks reachability, focus visibility and operability. Screen-reader smoke tests verify selected announcement/interaction paths. Each can find issues the others miss; none alone proves complete conformance. [Playwright accessibility guide](https://playwright.dev/docs/accessibility-testing)

**Accessibility vs visual regression:** A screenshot can reveal a missing focus outline or a clipped control, but it cannot confirm the accessibility tree or keyboard behavior. An automated rule scan can find semantic issues without detecting an unintended visual shift. No within-group comparison applies to a single item.

# Examples

### Combined accessibility review for a dialog

For a dialog flow, check that the dialog has a meaningful accessible name and any additional description is associated appropriately. Use keyboard-only navigation to verify focus enters the dialog, remains contained while the modal is open, and returns to the triggering control when it closes. Confirm the visible focus indicator remains clear. Run an automated rule scan on both the open and closed states, then perform a targeted screen-reader smoke test for the primary workflow. Do not infer full WCAG 2.2 AA conformance from a scan result.

### Stabilizing a screenshot test

Set a fixed viewport and browser/device scale, wait for fonts, disable nonessential animation during capture, and use deterministic page data. Keep the same browser/rendering environment for baseline and comparison. Review the pixel diff when it fails; only update the screenshot baseline after deciding the changed appearance is intentional. If contrast, focus, or text clipping matters, pair the visual check with semantic and keyboard assertions.

### Reporting a scan result

Store the rule identifier, affected component/target and a short explanation rather than snapshotting a large raw result that includes implementation markup. A focused report makes an accessibility regression easier to repair and reduces failures caused by unrelated DOM refactoring. [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)

# Common mistakes

- Adding an ARIA role but omitting the expected keyboard behavior and state.
- Treating `Accessible description` as a substitute for an `Accessible name`.
- Removing visible focus without providing an equivalent indicator.
- Creating a focus trap that cannot be exited or does not return focus after closing.
- Treating a successful axe-core scan as proof of `WCAG 2.2 Level A` or `WCAG 2.2 Level AA` conformance.
- Checking contrast only from design tokens rather than the actual rendered state.
- Using one screen-reader smoke test to claim complete assistive-technology support.
- Accepting a large pixel-diff threshold that hides meaningful visual regressions.
- Updating the screenshot baseline automatically without reviewing the changed image.
- Comparing screenshots before fonts load or while animation/dynamic content changes.

# Knowledge checks with answers

1. **How does a name differ from a description?** The name identifies the element; a description adds supplementary explanation.
2. **Does `axe.run` passing establish WCAG 2.2 AA conformance?** No. It checks automatable rules on a selected state; full conformance includes requirements and context not completely automatable.
3. **What does keyboard-only navigation reveal?** Whether a user can reach and operate controls, understand focus movement, see focused location, and escape interactions.
4. **Why normalize fonts and viewport for screenshot comparisons?** They change line wrapping, dimensions and pixels, creating noise or masking real visual changes.
5. **What makes a focus trap valid?** It is intentional for a modal-like interaction, keeps focus within it while open, and lets users close it and return focus appropriately.

# Sources

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [Playwright screenshot testing](https://playwright.dev/docs/test-snapshots)
- [axe-core](https://github.com/dequelabs/axe-core)
- [axe-core with Playwright package](https://www.npmjs.com/package/@axe-core/playwright)
