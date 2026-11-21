# Frontend component testing unit integration end-to-end and accessibility — Reference: Playwright end-to-end tests and browser verification

## Scope and version

This lesson covers the supplied Playwright Test API surface, checked against Playwright 1.65 (2026-11-20). Version 1.65 added Bun test-runner support, but Bun has documented differences such as no watch mode and TypeScript options not being applied by Playwright. It also changed TypeScript class-field semantics to follow `useDefineForClassFields`, made actions wait for inert elements to become actionable, and aligned cookie matching with RFC 6265. Its support notice says Node.js 20 is no longer tested and lists 22, 24, and 26. Use current documentation for exact options and browser support; the course does not reproduce the full Playwright API. [Playwright intro](https://playwright.dev/docs/intro) [Locators](https://playwright.dev/docs/locators) [Assertions](https://playwright.dev/docs/test-assertions) [Release notes](https://playwright.dev/docs/release-notes)

## How this group fits the mental model

Playwright Test launches browser contexts, runs isolated tests, locates user-facing elements, performs actions, and uses web-first assertions that retry until success/timeout. Fixtures provide test setup and teardown.

## Supplied names explained

- `Playwright Test` is Playwright's test runner with browser projects, fixtures, parallel execution, assertions, tracing, and reporting.
- `test(name, callback)` defines a browser test. The callback receives fixtures such as `page`, and can be async.
- `expect(locator)` creates web-first locator assertions; these retry automatically until the condition passes or times out.
- `page.goto(url)` navigates the browser page to a URL; configure `baseURL` or use an absolute URL. Wait for the expected UI state rather than assuming navigation completion means app data is ready.
- `page.getByRole(role, options?)` locates by semantic role and optional accessible name; preferred for user-facing controls.
- `page.getByLabel(text)` locates form controls by associated label/accessibility name.
- `page.getByText(text)` locates visible text; use for content when no semantic role is more appropriate.
- `page.getByTestId(testId)` locates by the configured test ID; use as a last resort when user-facing semantics do not identify the element.
- `Locator.click()` clicks an element after auto-waiting for relevant actionability checks, such as visible/enabled/stable and receiving events.
- `Locator.fill(value)` focuses an editable element and replaces its value. Use `pressSequentially`/keyboard APIs when per-key behavior is part of the test.
- `Locator.press(key)` focuses the locator and sends a keyboard key/shortcut.
- `Locator assertions with auto-waiting` retry conditions like visibility/text/value until success or timeout, reducing race conditions.
- `Browser project` is a configured test project for a browser/device/environment; projects can run the same suite across browser configurations.
- `Playwright fixture` is an injected resource/setup value such as `page`, `context`, or a custom test-data helper, with controlled setup/teardown lifetime.
- `Network interception` routes, fulfills, modifies, or observes requests to isolate external services and make tests deterministic. Avoid mocking application internals unnecessarily.
- `Trace Viewer` opens a trace containing actions, snapshots, logs, and network details for debugging. Configure trace capture on failure or retry based on storage/cost needs.
- `Screenshot on failure` saves visual evidence when a test fails. Screenshots are useful diagnostics but can contain sensitive test data; make fixtures safe.
- `Web-first assertion` is a retrying assertion on browser-observable state, such as `await expect(locator).toBeVisible()`, rather than reading once and comparing immediately.

## Cross-item comparison

Role/label locators express user-facing semantics; test IDs are implementation hooks. Locator actions auto-wait for actionability; web-first assertions auto-wait for expected state. A fixed sleep does neither reliably. Fixtures isolate setup; network interception controls an external boundary.

## Examples

```ts
test('opens a project', async ({ page }) => {
  await page.goto('/projects');
  await page.getByRole('link', { name: 'Atlas' }).click();
  await expect(page.getByRole('heading', { name: 'Atlas' })).toBeVisible();
});
```

## Common mistakes

- Using `page.waitForTimeout()` instead of waiting for an observable condition.
- Selecting by CSS structure that changes during harmless refactors.
- Using `fill` when key-by-key input is the behavior under test.
- Sharing one account/data record across parallel tests without isolation.
- Treating `page.goto` as proof all asynchronous app data is ready.
- Capturing screenshots/traces with real credentials or personal data.
- Retrying flaky tests without diagnosing the cause.

## Knowledge checks with answers

1. Which locator is preferred for a submit button? Role plus accessible name.
2. What does `Locator.fill` do? Replaces editable value; it does not model each keystroke.
3. Why use web-first assertions? They retry expected browser state instead of racing one immediate read.
4. What does a fixture provide? Reusable scoped setup/teardown resources.
5. What is a trace useful for? Replaying actions and inspecting snapshots/logs/network on failure.

## Sources

- [Playwright Test introduction](https://playwright.dev/docs/intro)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright assertions](https://playwright.dev/docs/test-assertions)
- [Playwright trace viewer](https://playwright.dev/docs/trace-viewer)
