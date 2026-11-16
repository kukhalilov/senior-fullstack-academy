# frontend tests accessibility browser automation and Playwright — Interview questions and reasoning

# Core questions

1. How do you divide frontend tests between component tests and browser tests?
2. Why prefer semantic queries such as role and accessible name over implementation selectors?
3. Compare the `getBy...`, `queryBy...`, and `findBy...` query families.
4. Why prefer user-event interactions over directly dispatching a DOM event?
5. How do you test asynchronous UI without fixed sleeps?
6. What is the difference between Vitest fake timers and mocking a network request?
7. What does MSW’s Node `setupServer` do, and what does it not do?
8. What does a Playwright browser context isolate?
9. Why are Playwright locators and web-first assertions less flaky than fixed selectors and sleeps?
10. How would you combine automated accessibility tests with manual checks?
11. Why does an axe-core pass not prove WCAG conformance?
12. What makes visual regression tests unstable, and how should baselines be updated?
13. How do you keep parallel browser tests from interfering with each other?
14. When would you use `page.route` instead of the real backend?

# Concise interview answers

1. Cover many component states quickly in a simulated DOM; use browser tests for important paths that depend on real browser behavior, navigation, storage, layout or integration.
2. They reflect how people and assistive technology identify controls, make tests resilient to internal refactors, and can reveal missing semantics.
3. `getBy...` expects a unique match now and throws otherwise; `queryBy...` returns `null` for absence; `findBy...` retries asynchronously until a unique match appears or times out.
4. User-event models a higher-level interaction sequence; dispatching one event can bypass intermediate browser behavior.
5. Control the network/timer boundary and wait for the observable condition, such as expected content appearing or a loading state disappearing.
6. Fake timers control scheduled time; network mocking controls the request/response boundary. They solve different nondeterminism and should not be conflated.
7. It intercepts outgoing requests within the Node process. It does not open a network listener or verify the real API.
8. Browser storage such as cookies, local storage and session storage; it does not isolate backend accounts or records.
9. Locators are re-resolved and actions wait for actionability; web-first assertions retry the expected state until a timeout. Fixed sleeps assume a duration without proving readiness.
10. Combine automated rule scans with keyboard-only navigation, semantic checks, and targeted screen-reader/assistive-technology review for critical flows.
11. Automated rules cover only issues detectable in the rendered state. WCAG conformance requires broader evaluation of success criteria and context.
12. Browser/render versions, viewport, fonts, scale, animation, dynamic data and color scheme can change pixels. Stabilize them and review every baseline change intentionally.
13. Use Playwright’s per-test contexts and unique server-side data/accounts; context isolation does not prevent backend collisions.
14. Use `page.route` for deterministic responses or to test UI handling of specific network cases. Use the real backend when its behavior, authorization or integration is the claim.

# Deep follow-up answers

## “Why not use browser tests for everything?”

Browser tests offer important realism but run slower and fail for more environmental reasons. Many component states can be covered more quickly in a simulated DOM. Use browser tests for a small set of critical journeys where browser behavior or end-to-end wiring is essential; use component tests for broader state permutations. The split should follow risk, not a rigid percentage.

## “A role-based query fails, but a test ID passes. What would you do?”

First inspect whether the interface actually exposes the intended role and accessible name. If it is an interactive control with no semantic name, correct the UI and retain the role-based query. If no user-facing concept exists—for example, a purely structural region—an explicit test ID can be justified. Avoid using a test ID simply to silence an accessibility failure.

## “When are fake timers appropriate?”

When scheduled time is the behavior: debounce, delayed feedback or interval logic. They make timing deterministic but also alter clock behavior and can interact with asynchronous retry utilities. I keep timer tests narrow, advance only the intended duration, restore the real clock, and separately test request/result behavior if mixing fake clocks with async UI waits becomes confusing.

## “What is the accessibility test strategy?”

Use semantic component queries and accessible-name assertions early; run automated scans on representative rendered states; verify keyboard reachability, focus order, visible focus and modal behavior; and perform targeted assistive-technology checks for critical tasks. Automated rules catch a valuable subset but do not establish complete WCAG conformance or usability.

## “How do you manage screenshot snapshots?”

Make viewport, browser/device scale, fonts, motion and data stable; capture at a meaningful UI state; and inspect diffs rather than blindly accepting them. Updating the baseline changes the expected product output, so it should be reviewed and committed intentionally. Pixel equality is not a semantic or accessibility assertion.

# Scenario questions

## Scenario: “A test uses `getByTestId` for every element.”

Explain that this can be stable under markup refactors but does not show whether the UI exposes accessible roles/names. Replace the lookup for user controls with role/name or label queries. Retain a test ID only where there is no suitable user-facing selector.

## Scenario: “A `waitFor` test sometimes clicks twice.”

The callback likely contains the click, and retries repeat it. Move the action outside the callback, then wait only for the resulting assertion or use an asynchronous element query.

## Scenario: “Playwright tests pass individually but fail in parallel.”

Browser contexts may be isolated while tests still share backend accounts, records, rate limits, or external state. Use unique server-side data, explicit cleanup, and independent setup. Check shared test fixtures, environment state, and route overrides as well.

## Scenario: “Axe reports no violations, but users report an inaccessible modal.”

Automated scanning may not test keyboard focus behavior, announcement quality, or an unopened modal state. Open the modal before scanning and add keyboard and assistive-technology checks for its name, focus entry/containment/return, and close control.

## Scenario: “Visual diffs fail after CI image changes.”

Verify browser version, device scale, viewport, fonts, animation, color scheme and dynamic page content before updating a baseline. Inspect the diff; if the change is expected, commit the reviewed baseline with the design change.

# Tradeoffs and alternatives

| Technique | Best evidence for | Main limitation |
| --- | --- | --- |
| Testing Library in simulated DOM | Component state and interaction cases | Does not reproduce real layout/browser/assistive-tech behavior |
| Playwright Test | Browser navigation and integrated user flows | More setup/runtime; backend data still requires isolation |
| User-event | Higher-level user interaction | Does not simulate a physical device or every browser/AT behavior |
| `fireEvent` | A specific low-level event | Can bypass realistic interaction sequences |
| MSW | Deterministic HTTP behavior at a request boundary | Node interception is in-process; not real network/backend verification |
| `page.route` | Browser request interception and response control | Does not prove real server behavior |
| axe-core scan | Automatically detectable accessibility rules | Cannot check every WCAG issue or replace human review |
| Keyboard/assistive-tech review | Operability and selected real user workflows | Needs chosen combinations and human time; not every configuration is covered |
| Visual snapshot | Pixel-level appearance changes | Sensitive to rendering environment; no semantic correctness proof |

# Common weak answers

- “The test passes, so the control is accessible.” A brittle selector can pass while the control has no accessible name.
- “`findBy...` is just a query with a delay.” It retries and has specific behavior for absent or duplicate matches.
- “The network mock means the API works.” It means the UI handled the mock response.
- “Browser contexts make tests completely isolated.” Backend state and external services can still be shared.
- “Axe proves WCAG AA.” It scans only detectable rules in the current rendered state.
- “A screenshot snapshot is a visual accessibility test.” Pixels cannot establish the accessibility tree or keyboard operability.
- “Increase the timeout until the test passes.” First determine whether it is waiting on the right condition and whether data/network setup is deterministic.
- “Accept the new baseline to fix CI.” Review the visual change and rendering environment before changing the expected output.

# Self-check rubric

Score each item from 0 to 2: 0 = missing/incorrect, 1 = partly explained, 2 = clear and bounded.

- Chooses component vs browser tests from the behavior’s required boundary.
- Uses semantic queries and explains when a test ID is justified.
- Correctly distinguishes immediate, absence, and asynchronous query behavior.
- Separates user interactions from low-level event dispatch.
- Waits for observable state and controls asynchronous dependencies.
- Explains fake timers and request mocks as different controls.
- Distinguishes browser-context storage isolation from backend data isolation.
- Combines automated accessibility scans with keyboard and human checks.
- Explains the limitations of WCAG automation and visual snapshots.
- Describes stable screenshot conditions and intentional baseline review.

**Interpretation:** 17–20 means the test strategy is interview-ready; 12–16 means revisit async behavior, isolation and accessibility evidence; below 12 means practice explaining what each test layer can actually prove.

# Sources

- [Testing Library queries](https://testing-library.com/docs/queries/about/)
- [Testing Library user-event](https://testing-library.com/docs/user-event/intro/)
- [Vitest mocking](https://vitest.dev/guide/mocking.html)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Playwright browser contexts](https://playwright.dev/docs/browser-contexts)
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
