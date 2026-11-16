# frontend tests accessibility browser automation and Playwright — Reference: Testing Library queries, rendering, interaction, async state, and cleanup

# Scope and version

This lesson covers the exact React Testing Library, DOM query, user-event, and jest-dom names supplied for this group. Testing Library’s guiding principle is to test software in ways that resemble how it is used; prefer accessible, user-facing queries. The query behavior below follows its current documentation snapshot, checked 2026-11-17. [Testing Library query guide](https://testing-library.com/docs/queries/about/) [React Testing Library API](https://testing-library.com/docs/react-testing-library/api/) [user-event](https://testing-library.com/docs/user-event/intro/)

# How this group fits the mental model

These tools let a component test render React into a simulated DOM, find controls in a user-relevant way, perform interactions, await state changes, and assert observable results. Query choice communicates whether an element should exist now, be absent, or appear later. Prefer semantic queries because they both express user intent and reveal accessibility gaps.

# Supplied names explained

- `React Testing Library` — The React-focused testing-library family that renders components and provides queries around the DOM they produce. Its central goal is to encourage tests of observable behavior rather than component internals.
- `@testing-library/react` — The React Testing Library package entry point. It provides rendering and hook-testing utilities; keep its installed version compatible with the project’s React and test environment.
- `render` — Renders a React element into the test DOM and returns utilities scoped to the rendered result. Prefer `screen` for queries against the document body when testing the page as a whole.
- `renderHook` — Renders a hook in a test harness and exposes its result for testing hook behavior. Use it for hook logic that cannot be meaningfully tested through a component; if a hook is UI behavior, a component-level test may better represent its use.
- `screen` — A set of query utilities pre-bound to the document body. It keeps tests readable and encourages querying the rendered page rather than a private component container.
- `within` — Binds query methods to a particular element. Use it when repeated labels exist in separate regions, such as two lists, so the test first scopes to the intended region.
- `getByRole` — Finds one element by its accessibility-tree role and optionally its accessible name/state. It is a strong default because failure often points to missing or incorrect semantics. It throws when there is no unique match.
- `getByLabelText` — Finds a form control through its associated label text. It checks the label path users rely on and is particularly appropriate for inputs.
- `getByText` — Finds content by its text. Use it for visible content, not as the first choice for an interactive control whose role and accessible name better state the intent.
- `getByPlaceholderText` — Finds a form control by placeholder text. Placeholder is supplemental hint text, not a replacement for a persistent label; query this way only when placeholder behavior itself matters or no better semantic locator fits.
- `getByDisplayValue` — Finds a form control by the value it currently displays. It is useful when the value is the assertion target, but can be less descriptive than locating the labeled control and checking its value.
- `getByAltText` — Finds an image or other supported element by alternative text. It can confirm that image content has a meaningful text alternative; decorative images should not be given misleading descriptions.
- `getByTitle` — Finds an element using its title attribute. Title text is inconsistently available to users and assistive technologies; prefer role, label, or visible text when possible.
- `getByTestId` — Finds an element by the configured test ID attribute. Use it when a user-visible or semantic query does not sensibly identify the target. Test IDs do not prove that a control has accessible semantics.
- `queryByRole` — A role query that returns `null` when no element matches and throws if multiple elements match. Use it for synchronous absence assertions, not to wait for an element to appear.
- `findByRole` — An asynchronous role query that retries until one matching element appears or the timeout is reached. Use it for role/name-based content that appears after a request or state transition.
- `queryByText` — A text query that returns `null` when absent and throws if multiple elements match. It is useful for asserting that visible text is not present now.
- `findByText` — An asynchronous text query that retries until one matching text element appears or times out. Prefer it over a fixed sleep when content is expected to appear later.
- `waitFor` — Retries its callback until it stops throwing or its timeout expires. Put assertions in the callback; do not put clicks, typing, state mutations, or other side effects there because retries can repeat them.
- `waitForElementToBeRemoved` — Waits for a currently present element to disappear. It is appropriate for a loading indicator or transient message; the target should exist at the time waiting starts.
- `user-event` — A higher-level interaction library that models user actions and associated event sequences more faithfully than dispatching one event directly. Use it for ordinary typing, clicking, tab navigation, and key interactions.
- `userEvent.setup` — Creates a user-event instance with interaction state for a test. Create it before interactions and use the returned instance consistently within that test.
- `userEvent.click` — Performs a user-like pointer click on a target. It can expose disabled or unclickable conditions that a direct callback invocation would skip.
- `userEvent.type` — Types text through user-level keyboard events. For inputs, assert the resulting value or behavior rather than only checking that a handler ran.
- `userEvent.keyboard` — Sends keyboard input described as key sequences. Use it to test keyboard interactions such as activation or shortcuts, while asserting the visible effect.
- `userEvent.tab` — Moves focus using keyboard tab navigation. It helps verify that controls are reachable in a sensible order and that focus can move through the interface.
- `fireEvent` — Dispatches a lower-level DOM event. It can be useful when the exact event is the subject or a user-event interaction cannot express it, but it skips portions of realistic interaction behavior.
- `act` — Ensures React updates related to an interaction or state change are processed before assertions. Testing Library’s common helpers already wrap many operations; use this deliberately when updates originate outside those helpers.
- `cleanup` — Unmounts rendered React trees and removes test DOM after a test. Common configurations register cleanup automatically, but know whether your setup does; leaked renders can cause cross-test contamination.
- `configure` — Configures Testing Library’s global options, including query/test behavior. Keep global configuration centralized and stable; a test-specific mutation can affect other cases.
- `reactStrictMode` — A render option controlling whether the test render is wrapped in React Strict Mode. Strict Mode can reveal side-effect assumptions by re-running certain development checks; tests should not depend on an exact incidental render count unless it is the contract.
- `wrapper render option` — A render option that wraps the tested UI in shared providers or setup components, such as a context provider. Keep the wrapper minimal and explicit so hidden global state does not obscure the test.
- `jest-dom` — A set of custom DOM matchers that make assertions read in terms of document state and accessibility. It is commonly integrated into test setup; ensure its setup runs once and its matchers are included in the test environment.
- `toBeInTheDocument` — A jest-dom matcher asserting that an element is attached to the document. It says nothing by itself about visibility, focusability, or accessibility.
- `toHaveAccessibleName` — A jest-dom matcher asserting the accessible name computed for an element. Use it to catch unnamed controls, but also test the control’s user-facing behavior.
- `toBeDisabled` — A jest-dom matcher checking the disabled state for supported form controls based on HTML disabled semantics. It does not treat `aria-disabled` alone as equivalent to the native disabled state, so test custom ARIA widgets for their actual keyboard and interaction behavior as well.
- `toHaveValue` — A jest-dom matcher checking a form element’s current value. Pair it with a semantic query to make clear which control and value are being asserted.

# Cross-item comparison

**Query behavior:** `getBy...` means “must exist now”; `queryBy...` means “may be absent now”; `findBy...` means “wait for it to appear.” Each single-element form expects one match. If duplicates are legitimate, scope with `within` or use the appropriate multiple-element query.

**Query priority:** `getByRole` and `getByLabelText` describe the control in user-facing terms. `getByText` is suitable for content. Placeholder, title, and test-ID queries rely on less user-visible implementation detail. A test-ID query can be justified, but it does not serve as an accessibility check. [Query priority](https://testing-library.com/docs/queries/about/)

**Interaction:** `user-event` models a higher-level action. `fireEvent` emits a specific DOM event. Use the first for user behavior and the second for a low-level event-specific case. No within-group comparison applies to a single item.

# Examples

This JSX test snippet uses a label, role/name query, user-level typing, and a value assertion. It assumes a test environment with React Testing Library, user-event, jest-dom, and a test runner already configured.

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

function SearchForm() {
  return (
    <label>
      Search products
      <input aria-label="Search products" />
    </label>
  );
}

test('accepts a search query', async () => {
  const user = userEvent.setup();
  render(<SearchForm />);
  const search = screen.getByRole('textbox', { name: 'Search products' });

  await user.type(search, 'coffee');

  expect(search).toHaveValue('coffee');
});
```

In a production component, avoid adding both a wrapper label and an `aria-label` unless there is a specific reason; the test fixture is intentionally compact. A stronger test can use `getByLabelText` and verify the resulting submitted state.

To assert that a loading state disappears, first establish that it is present, then await its removal:

```jsx
const loading = screen.getByText('Loading results');
await waitForElementToBeRemoved(loading);
```

The second snippet belongs after the action that starts loading and assumes the application eventually removes the message. If it never appears, use a different assertion: waiting for a non-existent node to disappear is not meaningful.

# Common mistakes

- Using `getByTestId` for every control and missing that controls have no accessible name.
- Using `queryByRole` for an element that appears asynchronously and observing a false absence.
- Using `findBy...` to wait when the test should fail immediately because content is absent.
- Putting a click inside `waitFor`, allowing repeated clicks during retries.
- Treating `toBeInTheDocument` as a visibility or accessibility assertion.
- Using a placeholder as the only label for an input.
- Testing implementation callbacks while never asserting the resulting user-visible state.
- Dispatching one event with `fireEvent` and assuming it represents the complete keyboard or pointer interaction.
- Leaving rendered trees or user-event state uncleared in custom test setup.

# Knowledge checks with answers

1. **Which query should assert that an element is absent now?** A `queryBy...` query; it returns `null` for zero matches.
2. **Which query waits for a result to appear?** `findBy...`, which asynchronously retries.
3. **Why keep `waitFor` callbacks free of interactions?** They may be invoked repeatedly while waiting.
4. **What does `toBeInTheDocument` not prove?** Visibility, accessible name, keyboard operation, or semantic role.
5. **When is `fireEvent` appropriate?** When a specific low-level event is the target or a higher-level interaction tool cannot represent the scenario; ordinary user actions should generally use user-event.

# Sources

- [React Testing Library introduction](https://testing-library.com/docs/react-testing-library/intro/)
- [React Testing Library API](https://testing-library.com/docs/react-testing-library/api/)
- [Testing Library queries](https://testing-library.com/docs/queries/about/)
- [Testing Library role queries](https://testing-library.com/docs/queries/byrole/)
- [Testing Library disappearance](https://testing-library.com/docs/guide-disappearance/)
- [user-event introduction](https://testing-library.com/docs/user-event/intro/)
- [jest-dom](https://github.com/testing-library/jest-dom)
