# React effects refs imperative handles and external systems — Reference: Mutable refs and host-node access

Sources: React 19.3 [`useRef`](https://react.dev/reference/react/useRef) and [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects).

## Scope and version

Refs store values outside render output or provide DOM access. `useImperativeHandle` narrowing is in the next reference.

## Ref object and `.current`

`useRef(initialValue)` returns a stable object with one mutable property, `.current`. The argument is used for initial value and ignored after initial render. React returns the same object on subsequent renders. Updating `.current` does not trigger a re-render; unlike state, it is not a reactive dependency. Use it for interval IDs, a previous external handle, or imperative values not needed to calculate JSX.

## Host DOM refs

Pass a ref object to a supported JSX host node; React sets `.current` to the node when attached and resets it on detach. Use this for focus, scrolling, measurement, or integration with a non-React widget. Prefer declarative props when possible. A callback ref receives the node (or null on detach) and can return a cleanup function in React 19; callback identity changes can cause detach/reattach, so stabilize only if that matters. Strict Mode development may stress callback ref cleanup.

Read/write refs in event handlers and Effects, not while rendering, except predictable initialization. Reading mutable ref state during render makes output depend on hidden state and can become inconsistent. A ref that contains data used for visible output should usually be state. Do not mutate objects in `.current` if they are also shared render data.

## Example

```jsx
function SearchBox() {
  const inputRef = useRef(null);
  return <>
    <input ref={inputRef} />
    <button onClick={() => inputRef.current?.focus()}>Focus</button>
  </>;
}
```

React attaches the input after commit; click handler uses the ref imperatively. For initial focus or synchronization, timing should be chosen deliberately; a ref is not a guarantee that the node exists during render.

## Common mistakes

Expecting `current` mutation to rerender; reading DOM ref during render; using ref for data that determines JSX; retaining a detached node; and assuming a ref object itself is a reactive dependency.

## Knowledge checks with answers

1. **Is the ref object stable?** Yes, across renders for that component identity.
2. **Does `.current` change rerender?** No.
3. **When does React attach host ref?** During commit/attachment, not during render.
4. **What can callback ref return in React 19?** A cleanup function.

## How this group fits the mental model

Refs hold imperative state that does not participate in React's render snapshot/update queue.

## Supplied names explained

The complete index below lists the ref hook, object/current semantics, stable identity, host/callback attachment, cleanup, and read/write discipline.

## Cross-item comparison

State changes schedule render; ref changes do not. A DOM node ref is a special host attachment; a plain ref can hold any value.

## Exact terms covered

### Exact terms covered

- `useRef(initialValue)`
- `Ref object`
- `ref.current`
- `Stable ref object across renders`
- `Changing ref.current does not trigger a re-render`
- `DOM node ref`
- `Callback ref`
- `Callback ref cleanup function`
- `Reading ref.current outside rendering`
- `Do not read or write ref.current during render`

## Examples

The SearchBox example focuses an input imperatively after React attaches its DOM node.
