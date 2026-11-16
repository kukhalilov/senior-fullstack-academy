# frontend tests accessibility browser automation and Playwright — Exercises and worked solutions

# Goals

Practice designing frontend tests that express what users see and do, synchronize on observable asynchronous results, isolate data, and combine accessibility and visual evidence without overstating what any one test proves.

# Worked example

A product search page contains a labeled textbox, a submit button, a loading message, and a list of results. Use a component test for many search states and a browser test for the most important real navigation flow. Control the network response so the tests do not depend on a live catalog service.

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ProductSearch from './ProductSearch';

test('shows the matching product after a search', async () => {
  const user = userEvent.setup();
  render(<ProductSearch />);

  await user.type(screen.getByRole('textbox', { name: 'Search products' }), 'tea');
  await user.click(screen.getByRole('button', { name: 'Search' }));

  const result = await screen.findByRole('heading', { name: 'Green tea' });
  expect(result).toBeInTheDocument();
});
```

The test locates controls by role and accessible name, performs user-level typing/clicking, waits for the expected result, and asserts document presence. In a full suite, configure the request boundary to return a deterministic result, and also test empty/error states. This example assumes the test runner provides JSX transformation.

# Exercises

## Exercise 1: Query selection

Choose a query strategy for each assertion and explain the expected match count and timing:

1. The form has one textbox named “Email” immediately after render.
2. A save confirmation appears after an asynchronous request.
3. No “Access denied” message should be present after a successful request.
4. A page has two tables, each with a “Details” button; act on the button in the “Pending orders” table.
5. A password input has a placeholder, but no associated label.

## Exercise 2: Fix a flaky wait

A test clicks “Search,” sleeps for 500 ms, and then checks for a result. CI fails intermittently. Rewrite the test strategy, identify how the server response should be controlled, and explain where the assertion belongs.

## Exercise 3: Diagnose state leakage

Two Playwright tests use separate contexts, but one test sees the other test’s order in the backend. The tests use different cookies but share one account and fixed order ID. Explain the isolation boundary and propose a fix.

## Exercise 4: Select the mock seam

Pick between component-level MSW, Playwright `page.route`, and a real backend for each case:

1. Show an error component when the API returns a 503.
2. Verify the page sends the required query and updates the URL.
3. Verify the actual backend authorization policy rejects a user without permission.

## Exercise 5: Accessibility plan

A modal passes axe-core scanning, but keyboard users cannot reach its close button and a screen reader announces no dialog name. Write the missing checks and explain why the scan passed.

## Exercise 6: Visual regression diagnosis

A screenshot diff changes on CI after a font update. Spacing also appears different, but no component source changed. List the rendering controls you would check before updating the screenshot baseline, and say what a visual baseline can never prove.

## Exercise 7: Fake clock decision

A search input debounces requests. The test uses fake timers and a request handler but hangs when it waits for result content. Explain how timer control and async waiting can interact, and propose two clear test designs.

# Progressive hints

1. Use the query semantics that match presence now, later appearance, absence, and scope.
2. Waiting on a timer is not the same as waiting on the UI condition. Make the response deterministic and assert inside the test after the condition appears.
3. A browser context isolates browser storage, not a backend account or server-side record.
4. Select the seam closest to the claim: component response rendering, browser request interception, or the actual authorization system.
5. Scan results are limited to detectable rules and the state that was scanned; reveal and test interactive states.
6. Control viewport, browser/device scale, font load, animations, dynamic content, and color scheme.
7. One option is a real clock plus deterministic request and wait on UI state; another is fake timers advanced explicitly with async waits designed for that clock.

# Complete solutions

## Exercise 1 solution

1. A synchronous semantic query for the textbox by role/name is appropriate because one is expected immediately.
2. An asynchronous role/name query such as `findByRole` is appropriate; it waits for one result rather than assuming response timing.
3. A synchronous absence query such as `queryByText` can return `null`; assert the absence after the success state is known to have completed.
4. Scope queries with `within` on the “Pending orders” table, then find the “Details” button inside it. This expresses context and avoids a global duplicate match.
5. The placeholder can locate the element in a narrow test, but the missing associated label is an accessibility defect to fix. The primary test should query it by a proper accessible label after correcting the markup.

## Exercise 2 solution

Remove the fixed sleep. Use a deterministic request handler for the expected results, perform the user interaction, and wait for the result heading/text with an asynchronous query. Put an assertion after the result appears. Do not put the click or request-triggering action inside a retry callback. Test the loading/disappearance state separately if it is an explicit requirement.

## Exercise 3 solution

The contexts isolate cookies and browser storage, but both tests still act as the same server-side account and use the same order ID. Give each test a unique record identifier, use separate test accounts, or reset data under a concurrency-safe fixture. Keep cleanup owned by the test and ensure one test cannot delete the other’s state.

## Exercise 4 solution

1. Component-level MSW is a good fast choice for deterministic rendering of a 503 response.
2. `page.route` can inspect/control the browser request while the browser flow asserts the URL and rendered result. If the query construction alone is the target, a component-level request test may also be adequate.
3. Use the real backend authorization logic in an integration/browser test against a controlled identity and data setup. A mocked response cannot establish that the actual authorization policy is configured correctly.

## Exercise 5 solution

The scan only evaluates rules it can detect in the rendered state and cannot verify all keyboard or screen-reader interaction. Add keyboard-only steps proving focus enters the modal, reaches the close control, remains in the dialog appropriately while it is open, and returns to the trigger when closed. Check that the dialog has an accessible name in the accessibility tree and run a screen-reader smoke test. If the modal was closed during scanning, open it and scan that state too.

## Exercise 6 solution

Check that baseline and CI use the same browser/build, viewport, device scale, color scheme and page data. Confirm that the new font actually loads before capture; fallback fonts change wrapping and dimensions. Stabilize animation and wait for dynamic content. Review the pixel diff before updating the baseline. A visual baseline cannot prove accessible names, semantic roles, keyboard operability, screen-reader announcements, or business correctness.

## Exercise 7 solution

Fake timers control scheduled time and may affect date/performance behavior or utilities that retry asynchronously. A wait that expects the fake clock to advance can hang if the test does not move it; a wait that advances timers can fire more than expected. Two clear designs are:

1. Use real time for the component test, make the debounce interval short but realistic, intercept the request deterministically, and wait for result content.
2. Use fake timers specifically for the debounce contract, trigger input, advance the clock by the intended interval, and assert that the request boundary was reached; test eventual rendered response in a separate async case with the clock configuration chosen deliberately.

Do not use broad “run every timer” behavior when recurring timers exist. Restore real timers afterward.

# Tests and edge cases

Review each planned test against this checklist:

- It names a user-visible outcome and the reason it can fail.
- Semantic locators are preferred; test IDs/placeholder lookups have a specific justification.
- Async behavior uses condition-based waiting, not arbitrary sleeps.
- Retry callbacks contain assertions rather than repeated side effects.
- API responses are controlled at a boundary appropriate to the test.
- Each browser context has unique backend data or account ownership.
- Timers, globals, environment, mocks and runtime handlers are restored.
- Accessibility states are actually rendered before scanning.
- Keyboard and assistive-technology checks supplement automated scans.
- Visual baselines use stable rendering inputs and updates are reviewed.
- Traces and screenshots are protected if they contain user or authentication data.

# Reflection questions

1. Which test in your project relies on a CSS selector or test ID even though a role/name query could express the user behavior?
2. Where does the suite assume that a request finishes within a fixed duration?
3. Which backend records are shared even though browser contexts are isolated?
4. Which accessibility behavior in the product is not detectable by an automated scan?
5. What environmental change can shift your screenshot output without a component source change?

# Sources

- [Testing Library queries](https://testing-library.com/docs/queries/about/)
- [Testing Library async behavior](https://testing-library.com/docs/guide-disappearance/)
- [Vitest timers](https://vitest.dev/guide/mocking/timers)
- [Playwright isolation](https://playwright.dev/docs/browser-contexts)
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
- [Playwright screenshot testing](https://playwright.dev/docs/test-snapshots)
