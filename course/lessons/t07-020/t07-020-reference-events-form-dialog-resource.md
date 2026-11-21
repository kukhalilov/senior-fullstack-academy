# React DOM components forms resource hints portals and preload APIs — Reference: React DOM form dialog detail and resource event props

## Scope and version

This is the React DOM 19.3 form, dialog, disclosure, and resource event group. Browser cancelability and event payloads still apply. [Common DOM props](https://react.dev/reference/react-dom/components/common)

## How this group fits the mental model

This inventory covers React callbacks for form submission/reset, dialog/detail state, and resource loading. The `Capture` suffix selects the capture phase. React's event delegation and bubbling model applies, but browser event cancelability and native bubbling still depend on the event. [Common DOM props](https://react.dev/reference/react-dom/components/common)

## Supplied names explained

### Forms

`onSubmit`, `onSubmitCapture`, `onReset`, and `onResetCapture` observe form submission and reset. A submit event is associated with the form even when a submit button initiated it; inspect `event.nativeEvent.submitter` when the initiating control matters. `preventDefault()` suppresses native navigation/submission. React function-valued Actions are integrated with forms, but preventing the submit default prevents the normal form Action path; see the forms reference lesson.

### Dialog and disclosure elements

`onCancel`, `onCancelCapture`, `onClose`, and `onCloseCapture` are used with dialog close/cancel behavior. `onToggle` and `onToggleCapture` observe disclosure state changes such as `<details>`; inspect the element's current `open` state rather than assuming the event means a particular direction. Native dialog methods, modal focus handling, and browser close requests remain browser features.

### Resource events

`onLoad`, `onLoadCapture`, `onError`, and `onErrorCapture` observe success/failure for loadable resources. React's event behavior can make these callbacks useful on React elements where native resource events do not bubble in the same way; attach them to the element whose resource matters when possible. A load event does not prove that an application-level resource is valid or safe, and error details are intentionally limited by browser security.

## Common mistakes

- Forgetting to prevent default when a native form navigation should be replaced.
- Treating `onReset` as a reset of controlled React state; controlled values remain governed by props/state.
- Assuming `onToggle` includes a reliable old-state value; inspect the current element state.
- Assuming resource errors expose detailed cross-origin diagnostics.

## Cross-item comparison

Submit/reset events belong to form workflows, cancel/close/toggle events reflect dialog or disclosure state, and load/error events report resource outcomes. Prevent defaults selectively because each family has different native behavior.

## Examples

```jsx
function SubmissionForm() {
  return <form onSubmit={event => {
    event.preventDefault();
    const form = event.currentTarget;
    console.log(new FormData(form).get('email'));
  }}><input name="email" /><button>Send</button></form>;
}
```

## Knowledge checks with answers

1. Where can you find which submit control initiated a submit?
2. What determines a controlled field's value after reset?
3. Does a resource `onError` necessarily disclose the detailed network failure?

## Answers

1. The native submit event's `submitter` property.
2. The React state/props that supply `value` or `checked`.
3. No. Browser security limits error details, especially cross-origin.

## Sources

- [React common DOM props and events](https://react.dev/reference/react-dom/components/common)
- [React form component](https://react.dev/reference/react-dom/components/form)
- [React DOM components](https://react.dev/reference/react-dom/components)
