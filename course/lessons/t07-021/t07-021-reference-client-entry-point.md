# React client hydration server streaming and static rendering APIs — Reference: react-dom/client APIs

## Scope and version

This reference covers React 19.3 browser root APIs exported from `react-dom/client`. Frameworks commonly manage roots for applications, but embedding integrations may need the APIs directly. [Client APIs](https://react.dev/reference/react-dom/client)

## How this group fits the mental model

A root connects React's update lifecycle to one browser DOM container. Create a client root for client-owned content; hydrate a root only when the container already holds matching React-generated server HTML.

## Supplied names explained

- `createRoot(domNode, options?)` creates a client root and returns `{render, unmount}`. `options` may include `onCaughtError(error, errorInfo)`, `onUncaughtError(error, errorInfo)`, `onRecoverableError(error, errorInfo)`, and `identifierPrefix`. Each `errorInfo` includes `componentStack`; a recoverable error may carry its original cause in `error.cause`. Its first `root.render(node)` clears existing container HTML. Use `hydrateRoot` for React server/build HTML and `createPortal` for content elsewhere in the DOM tree.
- `hydrateRoot(domNode, reactNode, options?)` attaches React to existing React-generated HTML and returns `{render, unmount}`. In addition to the three error callbacks and `identifierPrefix`, options include `formState` for the matching server-function submission state used with `useActionState` and a permalink. The `identifierPrefix` and `formState` must match the server values. The initial client tree must match the server output; mismatches are bugs, may not be patched, and React can recover by client-rendering content.
- `root.render(reactNode)` accepts a React node and returns `undefined`. Repeated calls update the same root. It is not a promise that effects have fired when it returns; use `flushSync` only for rare cases that require synchronous DOM/effect timing. Calling it before hydration finishes clears the server HTML and switches the entire root to client rendering.
- `root.unmount()` takes no arguments, returns `undefined`, unmounts the entire tree, removes handlers/state and lets effects clean up subscriptions. It is mainly needed when other code can remove the root container or an ancestor. That root cannot be rendered again; a new root is required.

## Cross-item comparison

`createRoot` expects a client-owned container; `hydrateRoot` expects matching existing HTML. Both return a root with `render` and `unmount`, but hydration establishes behavior on server markup while client rendering starts by replacing container contents.

## Examples

```jsx
import { createRoot, hydrateRoot } from 'react-dom/client';

const container = document.getElementById('root');
// Choose one mode based on how the HTML was produced.
const root = container.dataset.serverRendered === 'true'
  ? hydrateRoot(container, <App />)
  : createRoot(container);

if (container.dataset.serverRendered !== 'true') {
  root.render(<App />);
}
```

The marker is illustrative: production code should have an explicit, trusted rendering-mode contract rather than infer it from arbitrary DOM contents.

## Common mistakes

- Calling `root.render` before hydration completes, which can discard all server markup and switch the root to client rendering.
- Using mismatched `identifierPrefix` values between server rendering and hydration, which can produce inconsistent `useId` values.
- Calling `createRoot` on server HTML.
- Creating multiple roots for repeated updates in one container.
- Calling `root.render` after `root.unmount`.
- Forgetting to unmount roots owned by a host integration.

## Knowledge checks with answers

1. Which API expects existing React server HTML? `hydrateRoot`.
2. What does the first client render from `createRoot` do to existing children? Replaces them.
3. Can a root be reused after `root.unmount`? No; create a new root.
4. Why keep the root object? It provides the top-level update and teardown methods.

## Sources

- [Client React DOM APIs](https://react.dev/reference/react-dom/client)
