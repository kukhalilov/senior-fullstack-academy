# Frontend component testing unit integration end-to-end and accessibility — Reference: User event simulation and async behavior

## Scope and version

These interaction APIs follow Testing Library `user-event` v14 and DOM Testing Library. `user-event` methods are asynchronous and should be awaited. [user-event introduction](https://testing-library.com/docs/user-event/intro/) [user-event convenience](https://testing-library.com/docs/user-event/convenience/)

## How this group fits the mental model

Use interaction-level simulation for common user actions. Use lower-level event dispatch when the DOM event itself is the contract under test.

## Supplied names explained

- `userEvent.setup(options?)` creates a user session whose methods share input-device state (such as keyboard/pointer state). Create it before rendering/interacting in a test; configure options only for a deliberate environment need.
- `user.click(element)` simulates a user click, including relevant pointer/mouse events and interactability checks. Await its Promise.
- `user.type(element, text)` simulates typing text into an editable control; it can include focus/keyboard/input behavior. Await it and query through labels/roles.
- `user.keyboard(text)` simulates keyboard input described with user-event syntax, useful for shortcut/navigation/key behavior. It is not a replacement for testing actual browser layout/focus across platforms.
- `user.clear(element)` simulates selecting/removing existing editable text and leaves the field empty. Await it.
- `user.tab()` simulates keyboard tab navigation to the next focusable element. It helps verify focus movement, but manual keyboard testing remains valuable.
- `user.upload(element, file)` simulates selecting/uploading file(s) into a file input, respecting its accept/multiple constraints as modeled by user-event.
- `userEvent versus fireEvent`: user-event models a higher-level interaction with multiple events/checks; fireEvent dispatches a specific DOM event. Prefer user-event for normal flows.
- `fireEvent.click(element)` dispatches a click event directly. It does not reproduce the full physical interaction sequence.
- `fireEvent.change(element, eventProperties)` dispatches a change event with supplied properties, useful for testing an exact low-level event contract or cases user-event cannot represent.
- `Asynchronous user-event interaction` means interaction methods return Promises; state updates can be scheduled/async. Await actions before checking results.
- `Await user interaction before assertions` avoids asserting before the modeled interaction and React updates have completed; follow with `findBy`/`waitFor` when the UI response is also asynchronous.

## Cross-item comparison

`user.click` models a user action; `fireEvent.click` dispatches one event. `user.type` is a sequence of keyboard/input behavior; `fireEvent.change` directly sets up a change event. Choose the smallest abstraction that tests the relevant contract.

## Examples

```tsx
const user = userEvent.setup();
render(<Search />);
await user.type(screen.getByRole('searchbox', { name: /search/i }), 'react');
await user.keyboard('{Enter}');
expect(await screen.findByRole('heading', { name: /results/i })).toBeVisible();
```

## Common mistakes

- Forgetting to await user-event calls.
- Using `fireEvent.change` as a shortcut for a whole typing workflow.
- Assuming jsdom simulates browser layout, native dialogs, or every device behavior.
- Creating a new user session for each key and losing shared input-device state.
- Using `user.tab()` alone as proof of complete keyboard accessibility.
- Changing fake timers without coordinating user-event timer behavior.

## Knowledge checks with answers

1. Which should ordinary user flows use? `user-event`.
2. What does `fireEvent` model? A lower-level DOM event dispatch.
3. Why await `user.type`? The interaction and React updates are asynchronous.
4. What does `user.tab` help test? Keyboard focus movement.
5. Does user-event replace real browser tests? No.

## Sources

- [user-event introduction](https://testing-library.com/docs/user-event/intro/)
- [user-event setup](https://testing-library.com/docs/user-event/setup/)
- [user-event convenience APIs](https://testing-library.com/docs/user-event/convenience/)
- [Testing Library firing events](https://testing-library.com/docs/dom-testing-library/api-events/)
