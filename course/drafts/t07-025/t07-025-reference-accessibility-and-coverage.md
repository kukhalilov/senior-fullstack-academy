# Frontend component testing unit integration end-to-end and accessibility — Reference: Accessibility verification, coverage, and CI quality

## Scope and version

This lesson covers the supplied accessibility and quality concepts. Automated scans are one layer of evaluation, not WCAG certification. [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing) [axe-core](https://github.com/dequelabs/axe-core)

## How this group fits the mental model

Automated tests can detect missing semantics, keyboard failures, and known rule violations, but accessibility is an interaction between markup, behavior, content, visual presentation, and assistive technology. Combine automated checks with human testing.

## Supplied names explained

- `Semantic role query` uses a role and accessible name to find a control as users/assistive technology perceive it. It also gives feedback when an element lacks expected semantics.
- `Accessible name assertion` checks the name announced for a control, such as the label of a button or textbox. A role without a useful name may be insufficient.
- `Keyboard-only interaction test` operates the interface without a pointer using Tab, Shift+Tab, Enter, Space, arrows, and Escape where appropriate. Verify both access and expected activation/exit behavior.
- `Focus order check` follows sequential focus to confirm order is logical, visible, and consistent with task flow. DOM order and visual order should not conflict unexpectedly.
- `Automated accessibility rule check` runs machine-detectable rules against rendered DOM, catching some issues such as missing names or invalid ARIA patterns. It cannot understand all context or usability.
- `axe-core` is an accessibility rules engine that can be run directly or through integrations. It reports violations with rule/help context; interpret and fix findings rather than suppressing them broadly.
- `@axe-core/playwright` integrates axe-core checks into Playwright browser tests, allowing scans of rendered pages/states. Scan relevant interactive states, not only initial page load.
- `Coverage report` shows which source locations were executed by tests according to instrumentation. It helps locate untested code but does not evaluate assertion quality or user importance.
- `Line coverage` measures executed lines; it can miss untested branches/conditions even when line coverage is high.
- `Branch coverage` measures exercised control-flow branches; it still does not prove tests assert correct outcomes.
- `CI test execution` runs tests in a repeatable build workflow with stable dependencies, environment, reports, and failure artifacts. Keep unit/component feedback fast and run browser suites on critical paths.
- `Browser console error check` detects uncaught browser errors/warnings relevant to application behavior. Filter only known harmless noise; do not silence genuine errors.
- `Manual screen-reader verification` uses real assistive technology to assess names, roles, state announcements, reading/navigation order, and dynamic updates. Behavior differs among screen readers/browsers.
- `Automated accessibility checks are not a conformance guarantee` means a clean scan cannot establish full WCAG conformance or usability. Manual keyboard, screen-reader, visual, contrast, and expert evaluation are still needed.

## Cross-item comparison

Coverage measures code execution; accessibility scanning checks a rule set; keyboard and screen-reader testing evaluate user interaction. They answer different questions and none substitutes for the others.

## Examples

In Playwright, open a page state, run axe against the rendered document, then separately tab through the dialog and use a screen reader to inspect its accessible name, focus entry, Escape behavior, and focus return. Record automated violations and manual observations independently.

## Common mistakes

- Treating zero axe violations as WCAG conformance.
- Testing only initial page state when dialogs/menus/errors alter semantics.
- Raising coverage thresholds without adding meaningful assertions.
- Ignoring branch coverage for validation/error paths.
- Suppressing console errors globally.
- Assuming a role query proves keyboard interaction works.
- Testing screen-reader behavior only with a simulated accessibility tree.

## Knowledge checks with answers

1. Can axe-core prove accessibility? No; it finds only issues its rules can detect.
2. What does branch coverage add beyond line coverage? Whether control-flow alternatives were exercised.
3. Why run axe on interactive states? Dialogs/errors/menus change rendered semantics and focus behavior.
4. What should manual screen-reader verification assess? Announced name/role/state, navigation, dynamic changes, and focus.
5. Does high coverage prove strong tests? No; assertions may be weak or missing.

## Sources

- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [axe-core](https://github.com/dequelabs/axe-core)
- [Playwright Test](https://playwright.dev/docs/intro)
