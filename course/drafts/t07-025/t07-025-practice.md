# Frontend component testing unit integration end-to-end and accessibility — Exercises and worked solutions

## Goals

Write behavior-focused React tests, choose query and interaction APIs, await async results, control a network boundary, create a resilient browser test, and plan accessibility checks.

## Worked example

### Async save form

Render the real form, find its textbox by role/name, type with an awaited user-event session, click the save button, and wait for a role=status message. Mock the network boundary to return a deterministic success response, not the form component or its hook. Add a second test for a server validation error.

## Exercises

1. A menu should not be in the DOM before clicking its button and should appear afterward. Choose query variants and interaction API.
2. A textbox receives input and shows an asynchronous validation message. Write the interaction/wait sequence.
3. A callback is called after 500ms. Explain when fake timers are appropriate and how to restore them.
4. An E2E test uses a CSS selector for a nested button and sleeps 2 seconds. Rewrite the strategy.
5. A dialog passes axe with no violations. What additional keyboard/screen-reader checks are needed?
6. A test suite has 95% line coverage but never exercises an error branch. What signal is missing?

## Progressive hints

1. Use `queryByRole` for initial absence; `findByRole` for async appearance; use `user.click`.
2. Await `user.type`, then use `findByRole` or `waitFor` for the validation message.
3. Fake timers only when timer timing is the behavior under test; restore real timers in teardown.
4. Locate by role/name and use a web-first assertion; remove fixed sleep.
5. Test focus entry/order/return, keyboard activation/Escape, announced name/state, and dynamic announcement with actual assistive technology.
6. Branch coverage and meaningful assertions for error behavior.

## Complete solutions

1. `expect(screen.queryByRole('menu')).not.toBeInTheDocument(); await user.click(screen.getByRole('button', {name:/menu/i})); expect(await screen.findByRole('menu')).toBeVisible();`
2. `await user.type(screen.getByRole('textbox',{name:/email/i}), 'bad'); expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i);`
3. Use `vi.useFakeTimers()` only for timer behavior, advance with `vi.advanceTimersByTime(500)`, and call `vi.useRealTimers()` after each test. Avoid combining fake timers with unrelated async user-event flows.
4. `await page.getByRole('button',{name:'Save'}).click(); await expect(page.getByRole('status')).toHaveText(/saved/i);` Auto-waiting removes the arbitrary delay.
5. Tab through the dialog, confirm visible focus and logical order, ensure focus enters/returns correctly, test Escape/activation, and use a screen reader to verify dialog title/role and announcements. Axe is only one layer.
6. Add branch coverage and tests asserting the user-visible validation/error response; coverage alone is not quality.

## Tests and edge cases

- Test initial absence, appearance, and disappearance separately.
- Include ambiguous duplicate role/name cases and scope with `within`.
- Test network rejection, timeout, retry, and stale response behavior.
- Run E2E tests in parallel with isolated accounts/data.
- Capture traces/screenshots on failure using safe test data.
- Run accessibility checks on dialogs, menus, loading, validation, and error states.
- Verify test cleanup restores mocks, globals, timers, and mounted React trees.

## Reflection questions

- Which assertions reflect actual user contracts?
- What should be tested at component level versus browser level?
- Which network boundary should be controlled, and which integration should remain real?
- What limitations remain after a clean automated accessibility scan?

## Sources

- [RTL queries](https://testing-library.com/docs/queries/about/)
- [user-event](https://testing-library.com/docs/user-event/intro/)
- [Vitest guide](https://vitest.dev/guide/)
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
