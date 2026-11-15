# React DOM components forms resource hints portals and preload APIs — Reference: React DOM forms hooks and APIs

## Scope and version

This reference covers React DOM 19.3 hooks and imperative APIs for form status/reset, portals, and synchronous integration. [React DOM](https://react.dev/reference/react-dom)

## How this group fits the mental model

These APIs are exported by `react-dom` or its client entry point, not by core `react` unless stated. Choose the narrow API that matches the integration point; several are escape hatches for cases where declarative rendering is insufficient. [React DOM](https://react.dev/reference/react-dom) [React DOM hooks](https://react.dev/reference/react-dom/hooks)

## Supplied names explained

### `useFormStatus`

`useFormStatus` is imported from `react-dom`. It reads the status of a parent form submission and is useful for a submit button or status component nested inside that form. Calling it in the component that returns the `<form>` does not observe that form, because the hook reads an ancestor. Its return value includes `useFormStatus.pending`, `useFormStatus.data`, `useFormStatus.method`, and `useFormStatus.action`: pending indicates a submission in progress; data is the submitted `FormData` or null when none; method is the parent form's method (`get` or `post`, defaulting to `get`); action is the active function Action or null for URL/no active function. It is tied to React form Actions; ordinary browser submission does not provide the same pending Action state.

### `requestFormReset`

`requestFormReset(form)` requests a reset for a form rendered by React. It is intended to be called from an Action/Transition workflow. Uncontrolled fields return to their initial values; controlled fields continue to reflect React state, which the application must update separately. The function is not a substitute for native validation or server-side data handling.

### `createPortal`

`createPortal(children, domNode, key?)` renders children into a DOM node outside the parent component's DOM location. The portal remains in the same React tree: context is preserved and React events propagate according to React ancestry, even though physical DOM ancestry differs. The destination node must exist. Changing `domNode` recreates the portal content, so state inside it may reset. Use a stable target and clean lifecycle for overlays, dialogs, and similar UI.

### `flushSync`

`flushSync(callback)` forces React to flush updates scheduled inside the callback synchronously so the DOM is updated before control returns. This is a last-resort integration tool for APIs that immediately inspect the DOM. It can also flush pending work outside the callback, run pending Effects, reveal Suspense fallbacks, and harm performance. Do not use it as a routine fix for stale state or as a substitute for correct event/Effect design.

## Common mistakes

- Importing `useFormStatus` from `react` rather than `react-dom`.
- Calling `useFormStatus` in the form owner and expecting its own form's state.
- Expecting `requestFormReset` to change controlled state.
- Assuming a portal changes React context or event ancestry.
- Treating `flushSync` as a general state update strategy.

## Cross-item comparison

`useFormStatus` observes ancestor submission state, `requestFormReset` asks React to reset a form, and `createPortal` changes physical DOM placement. `flushSync` instead forces a synchronous commit and should be chosen only for imperative integration needs.

## Examples

```jsx
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>;
}
```

Render `SubmitButton` as a descendant of the form whose Action status it should read.

## Knowledge checks with answers

1. Why must a `useFormStatus` consumer be below the form in the React tree?
2. What happens to controlled fields after `requestFormReset`?
3. Which tree determines portal context and React event propagation?
4. Name two costs of `flushSync`.

## Answers

1. It reads status from an ancestor form.
2. They keep the value supplied by React state until that state changes.
3. The React tree, even though DOM placement is elsewhere.
4. It can flush unrelated work/run Effects/show Suspense fallbacks and can hurt performance.

## Sources

- [React DOM hooks](https://react.dev/reference/react-dom/hooks)
- [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus)
- [requestFormReset](https://react.dev/reference/react-dom/requestFormReset)
- [createPortal](https://react.dev/reference/react-dom/createPortal)
- [flushSync](https://react.dev/reference/react-dom/flushSync)
