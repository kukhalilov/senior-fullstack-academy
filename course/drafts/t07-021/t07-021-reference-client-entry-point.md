# React client hydration server streaming and static rendering APIs — Reference: react-dom/client APIs

## Scope and version

This reference covers React 19.3 browser root APIs exported from `react-dom/client`. Frameworks commonly manage roots for applications, but embedding integrations may need the APIs directly. [Client APIs](https://react.dev/reference/react-dom/client)

## How this group fits the mental model

A root connects React's update lifecycle to one browser DOM container. Create a client root for client-owned content; hydrate a root only when the container already holds matching React-generated server HTML.

## Supplied names explained

- `createRoot` from `react-dom/client` creates a new client root for a DOM container. Calling `root.render(node)` initially clears existing children in that container. Optional root options include error callbacks and identifier-prefix support for advanced multi-root/hydration setups. Do not use it to attach to server output.
- `hydrateRoot` from `react-dom/client` attaches React to existing server-rendered HTML and returns a root. Its second argument is the React tree expected to match that HTML. Root options include recoverable error reporting and identifier prefixes. Initial server/client mismatch can cause React to regenerate content; avoid depending on patching arbitrary mismatch details.
- `root.render` updates the React tree owned by a root returned from `createRoot` or `hydrateRoot`. Keep the same root and call this for later top-level updates; do not create a new root per update. For a hydrated root, its initial tree is supplied to `hydrateRoot`.
- `root.unmount` stops React rendering into the container and runs cleanup for the tree. Call it when a third-party host removes the container or when an embedded root's lifetime ends. An unmounted root cannot be reused; create a new root if mounting again.

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

- Calling `root.render` immediately after `hydrateRoot` with a different tree and assuming mismatch is repaired harmlessly.
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
