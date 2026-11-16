# Frontend component testing unit integration end-to-end and accessibility — Core concepts and how they fit together

## Learning objectives

Choose a test level; write user-observable component tests; select semantic queries; simulate interactions and await async UI; mock dependencies at boundaries; use Playwright auto-waiting and traces; and combine automated accessibility checks with manual evaluation.

## Prerequisites

Know React components, DOM roles/labels, promises, and browser navigation. **Test isolation** means each test controls its own data and does not depend on another test's order. A **flaky test** passes or fails unpredictably without a relevant code change.

## Core concepts

### Match test level to risk

Unit tests isolate deterministic logic. Component tests render React and verify DOM behavior. Integration tests connect multiple modules such as a component, router, and mocked network boundary. End-to-end tests run a browser against the application and verify critical journeys. These are not rigid boxes; choose the smallest layer that represents the failure risk. Avoid duplicating low-level assertions in slow E2E suites.

### Test behavior, not implementation

Arrange the needed state/fixture, act like a user, and assert visible behavior. Prefer role/name and label queries because they reflect semantics and expose accessible-name problems. `getBy...` expects an immediate match and throws if missing; `queryBy...` returns null for absence assertions; `findBy...` retries asynchronously and returns a Promise. Use test IDs when semantic/user-facing selectors cannot express the target reliably. [Queries](https://testing-library.com/docs/queries/about/)

### Interactions have layers

`user-event` simulates a complete interaction, including multiple events and interactability checks; its async APIs should be awaited. `fireEvent` dispatches a lower-level DOM event and is appropriate when the exact event itself is the behavior under test. Neither is a real browser; use E2E for layout, browser navigation, and platform integration. [user-event](https://testing-library.com/docs/user-event/intro/)

### Async UI should be awaited by condition

Await user interactions. Use `findBy...` for an element expected to appear, `waitFor` to retry an assertion/condition, and `waitForElementToBeRemoved` for disappearance. Do not put side effects inside `waitFor` because its callback may run repeatedly. Fixed sleeps slow suites and still fail under variable latency. [Async methods](https://testing-library.com/docs/dom-testing-library/api-async/)

### Mocks should isolate a boundary

Mock network requests, clock, or external services only where control is needed. Keep the component rendering real and assert the UI result of the response. Over-mocking hooks, child components, or internal calls ties tests to implementation and can hide integration defects. Restore spies/global stubs/timers and isolate test data.

### E2E requires resilient user-facing selectors

Playwright locators such as role/name and label are preferred; actions and web-first assertions auto-wait for actionable/expected state. Use fixtures for reusable setup, projects for browser/config variations, network interception for deterministic external boundaries, and Trace Viewer to inspect failures. Do not use fixed sleeps or brittle CSS/XPath selectors for ordinary interaction. [Locators](https://playwright.dev/docs/locators) [Assertions](https://playwright.dev/docs/test-assertions) [Trace Viewer](https://playwright.dev/docs/trace-viewer)

### Accessibility cannot be certified by a scan

Role/label queries validate some semantics, axe-core detects a subset of automated rule violations, and `@axe-core/playwright` integrates those scans in browser tests. Keyboard-only interaction checks focus order/activation. Screen-reader testing evaluates announcements and navigation. Contrast, visual layout, context, and user experience need human evaluation. Automated checks are useful but cannot guarantee WCAG conformance. [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)

## Mechanisms and relationships

| Goal | Technique |
|---|---|
| Verify pure logic | Unit test with direct inputs/outputs |
| Verify accessible component behavior | RTL render + role/name/label query + user-event |
| Wait for async UI | findBy/waitFor/removal query and awaited actions |
| Isolate a backend response | Mock/intercept network boundary |
| Verify critical user journey | Playwright E2E with resilient locators |
| Inspect flaky browser failure | Trace Viewer, screenshots, logs |
| Measure untested code | Line/branch coverage report plus review |

## Worked examples

### React Testing Library behavior test

```tsx
it('shows a confirmation after saving', async () => {
  const user = userEvent.setup();
  render(<ProfileForm />);
  await user.type(screen.getByRole('textbox', { name: /name/i }), 'Ada');
  await user.click(screen.getByRole('button', { name: /save/i }));
  expect(await screen.findByRole('status')).toHaveTextContent(/saved/i);
});
```

The test uses observable DOM behavior. In actual project setup, control the network boundary and ensure cleanup/fixture reset.

### Playwright browser test

```ts
test('user can open the project', async ({ page }) => {
  await page.goto('/projects');
  await page.getByRole('link', { name: 'Atlas' }).click();
  await expect(page.getByRole('heading', { name: 'Atlas' })).toBeVisible();
});
```

The locator and assertion auto-wait; no fixed sleep is needed.

## Misconceptions and edge cases

- A high coverage percentage does not prove important behavior is asserted.
- `getByRole` is not always the right query if the element has no role/name; fix semantics when appropriate.
- `waitFor` may run its callback repeatedly; keep it assertion-only.
- `user-event` is not a full browser and may not model every platform edge.
- E2E tests need deterministic seed/reset data and isolation when run in parallel.
- A green axe scan does not establish full accessibility or WCAG conformance.
- Fake timers can conflict with async user-event unless configured and advanced deliberately.

## Knowledge checks with answers

1. **When should `findByRole` be used?** When a matching accessible role is expected asynchronously.
2. **What is the difference between user-event and fireEvent?** Interaction simulation versus low-level DOM event dispatch.
3. **Why avoid fixed sleeps?** They are slow and still race variable response times.
4. **What does a trace provide?** A replayable record of browser actions/state useful for debugging.
5. **Do automated accessibility checks guarantee conformance?** No; manual keyboard/screen-reader/visual evaluation remains needed.
