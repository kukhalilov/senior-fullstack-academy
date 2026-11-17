# React function and class components JSX props and events — Reference: React event handler behavior and propagation

Sources: React 19.3 [Responding to Events](https://react.dev/learn/responding-to-events) and [Common React DOM components and events](https://react.dev/reference/react-dom/components/common).

## Scope and version

This lesson covers React handler functions and common propagation semantics. The complete DOM event/property reference and form Actions are in t07-020.

## Passing a handler

An event handler is a function that React calls after a matching interaction. Define a named function and pass its reference (`onClick={handleClick}`), use an inline arrow (`onClick={() => save(id)}`), or pass a custom callback prop to a child. Calling the handler during render (`onClick={handleClick()}`) runs it immediately and passes its return value; this is almost always a bug. Custom callback props are just functions; a component contract decides when to call them.

Common props include `onClick`, `onSubmit`, `onChange`, and `onPointerEnter`. Exact event/property availability and typing depend on the host element and renderer; consult DOM-specific reference for the full surface. React passes a synthetic event object with familiar event properties. `currentTarget` is the element whose handler is currently executing; `target` is the originating event target and may be a descendant. Do not retain event/currentTarget as durable state; copy needed values in the handler.

## Default actions and propagation

React events generally propagate through the React tree; bubbling handlers run from target outward. React's `onScroll` is an exception: it only fires on the JSX element where it is attached and does not bubble through the React tree. Capture handlers use the event name with a `Capture` suffix and run on the capture path before the target/bubble path. `event.stopPropagation()` stops further propagation through ancestors; `event.preventDefault()` prevents a browser default action such as form navigation. They are independent. Use `preventDefault` for native behavior, not as a way to stop parent handlers. For nested click targets, stop propagation only when parent behavior should not run.

A handler can call a custom callback prop to notify its parent. This keeps a presentational child reusable while the parent owns workflow. Event handlers are outside render and are appropriate for work caused by the interaction; asynchronous work should handle errors/cancellation according to app needs.

## Example

```jsx
function SaveButton({ recordId, onSave }) {
  return <button onClick={() => onSave(recordId)}>Save</button>;
}

function Form({ onSubmit }) {
  return <form onSubmit={event => {
    event.preventDefault();
    onSubmit();
  }}><SaveButton recordId="r-7" onSave={saveRecord} /></form>;
}
```

The arrow closes over `recordId` and passes it later. The form prevents browser navigation, then invokes its callback. A save button inside a form defaults to submit unless its `type` is set; form semantics deserve a deliberate choice.

## Cross-item comparison

| Pattern | When invoked | Purpose |
|---|---|---|
| `onClick={handler}` | On click | Pass existing function |
| `onClick={() => handler(id)}` | On click | Adapt arguments/closure |
| `onClick={handler()}` | During render | Usually accidental immediate call |
| `preventDefault` | During event | Cancel browser default |
| `stopPropagation` | During event | Stop ancestor event propagation |

## Common mistakes

Calling the handler instead of passing it; using `stopPropagation` to prevent form navigation; reading `target` when `currentTarget` is intended; forgetting form button submit defaults; and stopping propagation in reusable components without a documented reason.

## Knowledge checks with answers

1. **What does React receive for `onClick={handle}`?** A function reference to invoke later.
2. **What is `currentTarget`?** The element whose listener is currently executing.
3. **Capture naming convention?** Append `Capture`, such as `onClickCapture`.
4. **Difference between default prevention and propagation stop?** Cancel browser action versus stop further ancestor handlers.
5. **Does every React event bubble?** No. For example, `onScroll` only works on the JSX element to which it is attached.

## How this group fits the mental model

The event prop carries a function out of render; React invokes that function later in response to an interaction.

## Supplied names explained

The index below includes handler forms, callback props, event names, synthetic event details, propagation/default controls, capture phase, the `onScroll` exception, and render-time call distinction.

## Examples

The SaveButton/Form code shows an inline adapter, custom callback, current form default prevention, and callback flow.

## Exact terms covered

### Exact terms covered

- `Event handler function`
- `Passing a handler reference`
- `Inline arrow-function handler`
- `Event handler prop`
- `Custom callback prop`
- `onClick`
- `onSubmit`
- `onChange`
- `onPointerEnter`
- `Synthetic event object`
- `Event bubbling`
- `React onScroll bubbling exception`
- `stopPropagation()`
- `preventDefault()`
- `Event capture handler naming with Capture suffix`
- `Event object currentTarget`
- `Event handler is not called during render`
