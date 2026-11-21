# frontend tests accessibility browser automation and Playwright — Big-picture orientation and mental model

# Problem and purpose

Frontend tests answer a range of questions: does a component expose the right interface, does an interaction change visible state, does an application work in a real browser, and can people use it with different input and assistive technologies? These are related goals, but no single test environment answers all of them.

A simulated DOM makes component tests fast and easy to control. It does not render layout like a real browser, implement every browser behavior, or prove a screen reader experience. A browser test runs the application in a browser and can cover navigation, storage, layout, and network behavior. Automated accessibility scans can find known rule violations, while keyboard and assistive-technology checks uncover other barriers. Visual snapshots detect pixel differences but say little about whether the interface is usable or accessible.

The aim is layered evidence: use the fastest realistic layer that can establish a behavior, and use a more complete environment when the behavior depends on that environment.

# Plain-language mental model

Imagine testing a restaurant. A component test checks that a menu item is labeled and an order button updates the displayed total. A browser test walks through the actual restaurant’s ordering flow with a browser. An accessibility review checks whether people using different ways to navigate can find and use the controls. A screenshot comparison checks whether the page looks unexpectedly different. Each test observes a different surface.

For user-facing tests, search for controls the way users recognize them: by role, accessible name, label, or visible text. A test identifier is useful when the interface has no stable user-facing locator, but it does not prove that users can perceive the element. For asynchronous UI, wait for the expected visible state instead of sleeping for an arbitrary duration.

# How the parts fit together

```text
component behavior
  └─ Testing Library + simulated DOM
       ├─ semantic queries (role/name, label, text)
       ├─ user-like interactions
       └─ observable state and accessibility assertions

application behavior in a browser
  └─ Playwright Test + isolated browser context
       ├─ navigation and resilient locators
       ├─ controlled network/API responses
       ├─ browser state and permissions
       └─ traces, screenshots, and reports on failure

accessibility and visual evidence
  ├─ axe-core automated rules + keyboard/manual assistive-tech checks
  └─ stable visual snapshots + reviewed baseline changes
```

The component layer provides fast feedback on many states. Browser tests cover the seams the simulated DOM cannot represent. Accessibility is a quality property across both layers: semantic component tests catch missing accessible names early, while browser and human checks validate more of the rendered experience. Visual regression is a separate signal and needs a stable comparison environment.

# Concept map

| Question | Useful first tool | Evidence it provides | Important limit |
| --- | --- | --- | --- |
| Is the component’s user-visible state correct? | Testing Library in a simulated DOM | Rendered content, accessible queries, interaction outcome | Not full layout, browser, or assistive-technology behavior |
| Does an interaction lead to an async UI state? | `findBy...`, `waitFor`, user-event | The expected condition eventually appears/disappears | Poorly chosen waits can still hide races or wait on the wrong thing |
| Does the app work in an actual browser? | Playwright Test | Browser navigation, browser APIs, real DOM/layout and selected network behavior | Does not automatically isolate backend data or test every browser/AT combination |
| Is a known accessibility rule violated? | axe-core scan | Some detectable accessibility rule failures | Cannot establish complete WCAG conformance or usability |
| Can keyboard users complete the flow? | Keyboard-only test, browser automation and human review | Focus order, operability, visible focus, traps | Automated checks do not replace full assistive-tech review |
| Did pixels change unexpectedly? | Visual regression snapshot | Differences under a controlled viewport/render environment | A visual match can still be inaccessible or semantically wrong |

# End-to-end walkthrough

Consider a search form that submits a query and displays results:

1. In a component test, render the form and locate the textbox and submit control by their accessible labels/names. This makes missing labels visible as a test failure.
2. Use a user-level interaction to enter a query and submit. Assert that a loading message appears, then wait for the expected result content rather than pausing for a guessed number of milliseconds.
3. Intercept the API at a controlled boundary so the test can cover success, empty results, and server error deterministically. A component test can use Mock Service Worker; a Playwright test can use browser route interception.
4. In a browser test, navigate to the page, use resilient locators, and verify URL/title and visible result behavior. The browser context isolates cookies and local storage for that test, but the backend database and account still need their own test-data isolation.
5. Run an accessibility rule scan and keyboard through the form, results, and error state. Check visible focus and whether the result announcement is usable; a clean automated scan is not a complete accessibility audit.
6. Capture a visual snapshot only if layout regressions matter. Fix the viewport, fonts, animation, browser settings, and dynamic content. Review any baseline update as a code change.

The process builds confidence from several independent signals rather than asking one screenshot or scan to prove everything. [Testing Library query priorities](https://testing-library.com/docs/queries/about/) [Playwright best practices](https://playwright.dev/docs/best-practices) [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)

# When to use it and tradeoffs

Use component tests for many interaction/state variations because they are fast and localize failures. Prefer accessible queries and user-event interactions so tests reinforce semantic UI. Use a browser test when browser behavior, routing, layout, storage, permissions, or integration across the app matters. Keep browser tests focused because startup and diagnosis cost more.

Use automated accessibility scanning as one repeatable check in development/CI. Pair it with keyboard checks, semantic review, and targeted assistive-technology testing. Use visual snapshots for appearance that matters and can be rendered consistently; prefer targeted snapshots over large, noisy page captures.

The more realistic the environment, the more dependencies and sources of flakiness it introduces. Isolation, deterministic network responses, readiness, stable viewports, and actionable traces keep realism useful. A test suite should state which user behavior and boundary each test protects.

# What later lessons cover

The concepts lesson describes query choice, test layers, waiting, mocking, browser contexts, and accessibility evidence. The Testing Library reference explains exact query, interaction, rendering, and cleanup names. The runner reference covers Vitest/Jest lifecycle and mocks, fake timers, and MSW. The Playwright reference covers fixtures, locators, assertions, network interception, storage and diagnostics. The accessibility reference covers semantics, axe-core, keyboard review, and screenshot stability. Practice and interview lessons apply the decisions to realistic UI flows.

# Sources

- [Testing Library query priority](https://testing-library.com/docs/queries/about/)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Playwright browser-context isolation](https://playwright.dev/docs/browser-contexts)
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
