# Frontend component testing unit integration end-to-end and accessibility — Reference: React Testing Library render and semantic querying

## Scope and version

React Testing Library builds on DOM Testing Library. This reference covers the supplied render/query/async APIs; exact options depend on installed versions. [RTL intro](https://testing-library.com/docs/react-testing-library/intro/) [RTL API](https://testing-library.com/docs/react-testing-library/api/) [Queries](https://testing-library.com/docs/queries/about/)

## How this group fits the mental model

Render actual React into a DOM and query the result like a user. Prefer role/name and labels; choose query variants by expected timing/absence.

## Supplied names explained

- `render(ui, options?)` renders a React element into a DOM container and returns query/helper methods plus container/root information. Use a wrapper option for providers; use the returned result when working with that render's container.
- `screen` exposes DOM Testing Library queries bound to `document.body`, convenient when `render` mounts into the normal document.
- `within(element)` binds queries to a particular DOM subtree, useful for a dialog, table row, or repeated group.
- `getByRole` finds an element by implicit/explicit accessible role and optional accessible name; best default for interactive/content roles. It throws if missing or ambiguous.
- `queryByRole` is the role query returning null when absent, useful for asserting an element is not present.
- `findByRole` returns a Promise and retries the role query until it succeeds or times out, useful for async appearance.
- `getByLabelText` finds a form control through its associated label/aria label; it verifies usable labeling.
- `getByText` finds visible text content. Use when text is the user-facing way to identify the content and role is not a better fit.
- `getByPlaceholderText` finds by placeholder, but placeholders are not a substitute for a persistent label.
- `getByDisplayValue` finds form controls by their current displayed value; avoid relying on it when a label/role expresses intent better.
- `getByAltText` finds image/element by alt text, useful for meaningful image alternatives.
- `getByTitle` queries title attribute; title is not a reliable replacement for accessible names and may not be available consistently to users.
- `getByTestId` queries the configured test ID attribute. Use only when semantic/user-facing queries cannot express the target; test IDs do not validate accessibility.
- `ByRole accessible name option` lets role queries filter by accessible name, which can be a string or regex. It makes tests align with what assistive technology exposes.
- `ByRole hidden option` controls inclusion of elements excluded from the accessibility tree. Default queries generally exclude hidden content; set hidden only when the test intentionally needs it.
- `waitFor(callback, options?)` repeatedly invokes a callback until it stops throwing or times out. Keep side effects outside the callback because it can run more than once.
- `waitForElementToBeRemoved(callback, options?)` waits until the selected existing element(s) disappear; the element should exist before waiting.
- `cleanup()` unmounts rendered React trees and removes containers. It is often auto-registered by the test environment; explicit calls are useful only when the setup requires them.
- `act(callback)` ensures React updates related to a test operation are processed before assertions. Testing Library helpers wrap common operations in act; use it directly for lower-level React updates not already wrapped.

## Cross-item comparison

`getByRole`/`getByLabelText` express semantics; `getByTestId` expresses a test-only hook. `getBy...` fails immediately when absent; `queryBy...` is for absence; `findBy...` waits for appearance. `waitFor` retries a condition, while `waitForElementToBeRemoved` specifically waits for disappearance.

## Examples

```tsx
render(<Dialog open={false} />);
expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

render(<SaveStatus />);
expect(await screen.findByRole('status')).toHaveTextContent(/saved/i);
```

Use a fresh render per test, and query within a dialog when multiple repeated controls exist.

## Common mistakes

- Using `getBy...` for content that appears asynchronously.
- Using `queryBy...` to wait for appearance.
- Putting clicks or state changes inside `waitFor`.
- Using test IDs when role/name/label is available.
- Querying hidden elements by default and misrepresenting what users can access.
- Calling cleanup unnecessarily while automatic cleanup already runs and can mask test ownership.
- Using `act` around every Testing Library helper when those helpers already wrap updates.

## Knowledge checks with answers

1. Which query waits for a role to appear? `findByRole`.
2. Which role query returns null for absence? `queryByRole`.
3. Why prefer an accessible name option? It matches user/assistive-technology identification.
4. What should `waitFor` callbacks contain? Retried assertions/conditions, not repeated side effects.
5. Does `getByTestId` verify accessibility? No.

## Sources

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [React Testing Library API](https://testing-library.com/docs/react-testing-library/api/)
- [About queries](https://testing-library.com/docs/queries/about/)
- [Async methods](https://testing-library.com/docs/dom-testing-library/api-async/)
