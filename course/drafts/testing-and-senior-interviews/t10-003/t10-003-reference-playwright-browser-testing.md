# frontend tests accessibility browser automation and Playwright — Reference: Playwright Test, browser contexts, resilient locators, assertions, and API setup

# Scope and version

This lesson explains the exact Playwright Test and browser-testing names supplied for this group. Follow the installed `@playwright/test` version’s documentation when configuring a project. The current documentation describes per-test browser contexts, locator auto-waiting, and retrying assertions; this snapshot was checked 2026-11-17. [Playwright Test API](https://playwright.dev/docs/api/class-test) [Page API](https://playwright.dev/docs/api/class-page) [Best practices](https://playwright.dev/docs/best-practices)

# How this group fits the mental model

Playwright Test runs a test against an actual browser page. Fixtures give each test the objects it needs; browser contexts provide isolated browser storage; locators find elements; assertions wait for observable outcomes. Network interception and API setup help make the flow repeatable. Reports, traces and screenshots preserve evidence when it fails.

# Supplied names explained

- `Playwright Test` — Playwright’s test runner and automation framework. It provides test declarations, fixtures, lifecycle hooks, assertions and reporting for browser tests.
- `@playwright/test` — The package that provides Playwright Test’s runner and APIs. Keep the package and browser binaries/configuration aligned as described by its installation guidance.
- `Playwright test function` — The test declaration used to register a browser test. Its callback can receive fixtures such as the page or request context; keep each test independently understandable.
- `Playwright expect function` — The assertion function used for Playwright’s web-first assertions. These assertions retry the condition until it passes or reaches the timeout, so they are usually more stable than an immediate snapshot of a transient state.
- `page fixture` — A ready browser page supplied by the runner for the test. It belongs to that test’s browser context by default; use it for navigation and user-visible operations.
- `browser fixture` — A browser instance fixture. It can be used when a test needs browser-level setup; avoid manual lifecycle work when a built-in per-test fixture already expresses the need.
- `context fixture` — The test’s browser context. It isolates browser storage such as cookies and local storage from other test contexts, but does not isolate server-side accounts or database rows.
- `test.extend` — Extends the runner’s fixture set with project-specific fixtures. Use it to encapsulate reusable setup/teardown with clear ownership; avoid hiding unique test behavior behind a large fixture.
- `test.use` — Configures fixtures/options for a test scope. Keep configuration scoped to suites that need it so defaults remain predictable.
- `test.beforeEach` — A hook run before each test in its scope. Use it for deterministic, repeatable setup; tests should still be runnable independently.
- `test.afterEach` — A hook run after each test. Use it for cleanup that belongs to the test; do not rely on it to erase shared backend state unless that cleanup is complete and concurrency-safe.
- `test.describe` — Groups related tests and scopes hooks/configuration. Keep groups shallow and focused so the test name clearly identifies a behavior.
- `test.step` — Adds a named step within a test for reporting and diagnosis. Steps organize a flow; they do not replace assertions or make a test more isolated.
- `test.skip` — Marks a test or condition as skipped. Use only for an intentional, explained condition; a skip must not become a quiet way to ignore a regression.
- `test.fail` — Marks an expected-failure test condition. It is useful while documenting a known failure, but remove or update the expectation once behavior changes so unexpected passes/failures remain visible.
- `testInfo` — The current test’s metadata and execution context. It helps fixtures/tests create diagnostics and respond to status without coupling the test to global process state.
- `testInfo.outputPath` — Produces a path in the test’s output directory for artifacts. Use it for per-test files so parallel tests do not overwrite one another; protect any artifact containing sensitive data.
- `page.goto` — Navigates the page to a URL. An assertion after navigation should check the expected rendered state; navigation completion alone does not prove the app’s async data has loaded.
- `page.getByRole` — Finds page elements using their semantic role and accessible name/state. It is generally the preferred locator for controls because it tracks the interface users perceive.
- `page.getByLabel` — Finds a form control through its associated label. It helps expose a missing or incorrect label and is appropriate for form interaction.
- `page.getByText` — Finds visible text. Use it for content assertions; use a role or label locator for interactive controls when possible.
- `page.getByPlaceholder` — Finds an element by placeholder. Placeholder text is not a replacement for a persistent label, so use this only when the placeholder itself is the relevant behavior or no better locator fits.
- `page.getByTestId` — Finds an element by the configured test ID. Use as a fallback when user-facing semantics do not identify the element. It does not verify accessibility.
- `page.locator` — Creates a locator from a selector. It is flexible, but selectors based on CSS structure or implementation details are more brittle than semantic locators.
- `Locator` — A deferred description of how to find one or more elements. Locator operations re-resolve against the current page and Playwright applies actionability checks to relevant operations.
- `Locator.filter` — Narrows a locator by conditions such as matching text or containing another locator. It helps scope repeated controls to the correct row/card without relying on fragile global position.
- `Locator.nth` — Selects an element by zero-based position within locator matches. Use only when order is part of the UI contract; otherwise positional selection can silently target a different element after a layout change.
- `Locator.click` — Clicks the uniquely matched target after Playwright’s relevant actionability checks pass (such as visible, stable, enabled and receiving events). A timeout is useful evidence that the user could not perform the interaction under the test conditions.
- `Locator.fill` — Replaces a fillable control’s content with a value. It is efficient for text-entry state; use keyboard-driven interaction when typing sequence or key behavior is itself important.
- `Locator.press` — Sends a keyboard key to the located element, such as Enter. Use it to test keyboard submission or activation and assert the resulting user-visible effect.
- `Locator.check` — Checks a checkbox/radio-like control when it is actionable and in a checkable state. Assert the resulting state or UI consequence, not only that the action completed.
- `Locator.selectOption` — Selects an option in a select control. Use it to test the chosen value and downstream behavior; verify keyboard interaction separately if it matters.
- `Locator.waitFor` — Waits for the locator to reach a requested state. Prefer web-first assertions when the test’s intent is to assert a condition; do not add redundant waits that slow diagnosis.
- `expect(locator).toBeVisible` — A retrying assertion that the located element becomes visible. It provides clearer async behavior than an immediate visibility check followed by a fixed sleep.
- `expect(locator).toHaveText` — A retrying assertion for expected text. Keep the expected text focused on the contract and avoid matching unrelated, volatile content.
- `expect(page).toHaveURL` — A retrying assertion that the page URL matches the expected URL. Use it for navigation state and verify rendered content as well; URL matching alone does not prove the destination page is correct.
- `expect(page).toHaveTitle` — A retrying assertion that the page has the expected document title. It does not prove the body content is correct.
- `page.route` — Intercepts matching browser requests so a test can fulfill, modify or control responses. It is useful for deterministic UI behavior and failure scenarios, but does not test the real backend.
- `page.on` — Registers a listener for a page event. Use sparingly for diagnostics or events that are part of the behavior; remove or scope listeners so they do not create cross-test effects.
- `APIRequestContext` — An API request client for HTTP setup or assertions outside a page interaction. It can prepare backend data or check an endpoint, but direct API setup does not prove the UI flow works.
- `request fixture` — A Playwright fixture providing an API request context. Use it to create/clean test data through supported APIs and keep data ownership unique per test.
- `page.screenshot` — Captures the current page as an image artifact. It is useful for failure diagnosis or a one-off visual review, but a manually viewed screenshot is not a semantic assertion.
- `toHaveScreenshot` — A visual comparison assertion that captures and compares screenshot output against a stored baseline. Control viewport and rendering conditions; inspect the diff and deliberately review baseline updates.
- `BrowserContext.storageState` — Reads or writes browser storage state for reuse, commonly for authenticated test setup. Treat the state as credential material, restrict access, and expire/recreate it as appropriate.
- `BrowserContext.grantPermissions` — Grants browser permissions in a context for a test, such as a capability the user would approve. Scope permission changes to the context and verify behavior in both granted/denied scenarios where relevant.
- `BrowserContext.addCookies` — Adds cookies to a context. Use only for explicit setup; manually injecting authentication state can bypass the login flow, which should be tested separately if it is important.
- `Playwright HTML Reporter` — A report output presenting test results and diagnostics in an HTML interface. Reports may include screenshots, traces, URLs and text; handle them according to the project’s data policy.
- `trace viewer` — A tool for inspecting a Playwright trace, including actions and related browser evidence. Capture traces on useful conditions such as failure/retry and avoid publishing sensitive trace contents.

# Cross-item comparison

**Semantic locator vs selector:** `page.getByRole`/`page.getByLabel` describe how users identify controls. `page.locator` can express broader selectors but may couple tests to markup structure. `Locator.filter` can scope by meaningful content; `Locator.nth` depends on order and should be used only when order is meaningful.

**Action vs assertion:** `Locator.click`, `fill`, `press`, `check`, and `selectOption` perform actions after actionability checks. `expect(locator)...` assertions retry the expected condition. A completed click does not prove the correct result; assert the visible outcome.

**Browser state vs backend state:** A `context fixture` isolates cookies/storage; `request fixture` can set up backend data. Each needs its own isolation and cleanup because context reset does not remove server-side records.

**Route interception vs real API:** `page.route` controls requests made by the page. `APIRequestContext` and `request fixture` can directly prepare/test HTTP setup. Neither by itself proves the deployed service’s user journey. No within-group comparison applies to a single item.

# Examples

This Playwright test uses the page fixture, semantic location, a user action and a retrying visible assertion. It assumes a page with a button named “Save” and visible confirmation text.

```ts
import { expect, test } from '@playwright/test';

test('shows confirmation after saving', async ({ page }) => {
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Settings saved')).toBeVisible();
});
```

For repeated controls, scope to a meaningful region rather than selecting the third matching button:

```ts
const row = page.getByRole('row').filter({ hasText: 'Order 42' });
await row.getByRole('button', { name: 'Cancel' }).click();
await expect(page.getByText('Order canceled')).toBeVisible();
```

The second example uses `Locator.filter` to scope a row; if the page contains duplicate “Order 42” rows, the test should expose that ambiguity rather than silently choosing one by index. [Playwright locator best practices](https://playwright.dev/docs/best-practices) [Actionability](https://playwright.dev/docs/actionability)

# Common mistakes

- Using CSS selectors for every control and coupling tests to DOM structure.
- Using `Locator.nth` to silence a duplicate-locator failure rather than scoping correctly.
- Adding fixed sleeps instead of relying on auto-waiting actions and retrying assertions.
- Assuming a fresh browser context isolates backend rows or a shared test account.
- Using `page.route` and claiming the production API was exercised.
- Saving shared authentication state in an artifact without treating it as a credential.
- Updating screenshot baselines automatically without reviewing what changed.
- Capturing traces/screenshots that expose private application data and then uploading them without access controls.
- Treating an API setup request as evidence that the UI renders and interacts correctly.

# Knowledge checks with answers

1. **Why prefer `page.getByRole` for a button?** It expresses the semantic role and accessible name that users/assistive technology rely on and fails when that contract is missing.
2. **When is `Locator.nth` justified?** When position in an ordered UI is itself part of the intended contract; otherwise scope using meaningful content.
3. **Does Playwright’s browser context isolate backend state?** No. It isolates browser storage; server-side accounts/data need separate isolation.
4. **What does a successful `Locator.click` establish?** That the action could complete after actionability conditions; assert the intended resulting state separately.
5. **What does `page.route` not prove?** That the real backend returned the response or that the deployed network/service works.

# Sources

- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Playwright Page API](https://playwright.dev/docs/api/class-page)
- [Playwright assertions](https://playwright.dev/docs/test-assertions)
- [Playwright best practices](https://playwright.dev/docs/best-practices)
- [Browser contexts and isolation](https://playwright.dev/docs/browser-contexts)
- [Actionability and auto-waiting](https://playwright.dev/docs/actionability)
- [Playwright snapshots](https://playwright.dev/docs/test-snapshots)
