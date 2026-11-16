# React effects refs imperative handles and external systems — Reference: Exposing imperative interfaces

Sources: React 19.3 [`useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle) and [`forwardRef`](https://react.dev/reference/react/forwardRef).

## Scope and version

This reference covers exposing a custom API through a ref. Prefer declarative props; imperative handles are an escape hatch for focused commands.

## API and dependencies

`useImperativeHandle(ref, createHandle, dependencies?)` customizes the value assigned to a ref. `createHandle` returns any handle, usually an object of methods. Dependencies include reactive values referenced in the factory and are compared with `Object.is`; when a dependency changes, React recreates and assigns the handle. It returns undefined.

In React 19, a function component can receive `ref` as a prop and pass it to `useImperativeHandle`; `forwardRef` is no longer required for new function components. In React 18 and earlier, `forwardRef` passes the parent's ref into a function component. Existing code remains supported; forwardRef is planned for future deprecation. Class components have their own instance-ref behavior and are outside this API's common function-component path.

Expose a narrow imperative handle such as `focus()`, `scrollToError()`, or `resetAnimation()`, not the entire internal object graph. This keeps ownership clear and lets a child change implementation without making a parent depend on DOM structure. An exposed method should be safe when the node is absent/unmounted and should not bypass validation or security boundaries.

## Example

```jsx
function SearchInput({ ref }) {
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => ({
    focus() { inputRef.current?.focus(); },
    clear() { if (inputRef.current) inputRef.current.value = ''; },
  }), []);
  return <input ref={inputRef} />;
}
```

The parent receives only `focus`/`clear`, not the DOM node itself. If the handle uses reactive values, include them as dependencies or avoid capturing them.

## Cross-item comparison

Direct DOM ref exposes a host node's complete imperative surface. Custom imperative handle exposes only selected methods. `ref` as prop is React 19 syntax; `forwardRef` is the earlier function-component forwarding mechanism.

## Common mistakes

Exposing the whole DOM node when only a command is needed; omitting reactive dependencies; making a large imperative API that mirrors props/state; assuming React 18 ref-as-prop works; and allowing parents to mutate child-owned internal state.

## Knowledge checks with answers

1. **What does `createHandle` return?** The custom value assigned to the ref.
2. **How are dependencies compared?** With `Object.is`.
3. **How does React 19 receive a function component ref?** As a prop.
4. **When is `forwardRef` still relevant?** React 18 and earlier compatibility.

## How this group fits the mental model

An imperative handle is a controlled boundary that lets parent code issue a small command without taking over the child's render ownership.

## Supplied names explained

The exact inventory below lists the API signature, handle, React-version ref transport, forwardRef legacy role, and narrow-surface design.

## Examples

The SearchInput exposes focus/clear while retaining its input node privately.

## Exact terms covered

### Exact terms covered

- `useImperativeHandle(ref, createHandle, dependencies?)`
- `Imperative handle`
- `Custom ref handle`
- `ref as a prop in React 19`
- `forwardRef (React 18 and earlier)`
- `Narrow imperative API`
