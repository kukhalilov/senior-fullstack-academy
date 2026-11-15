# React DOM components forms resource hints portals and preload APIs — Reference: React 19 removed APIs and replacements

## Scope and version

React 19 removed these legacy APIs. This lesson names migration targets; consult the corresponding current API reference for exact options and runtime support. [React DOM](https://react.dev/reference/react-dom)

## How this group fits the mental model

React 19 removed legacy APIs that were tied to older rendering behavior. Upgrade callers rather than trying to polyfill their old semantics. Select the replacement based on whether the app hydrates server HTML, creates a client root, or renders on a server. [React 19 upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) [React DOM](https://react.dev/reference/react-dom)

## Supplied names explained

### Removed client APIs

- `findDOMNode (removed; use refs)`: `findDOMNode` is removed. Attach a ref directly to the DOM element, or forward/pass a ref through the component API. This avoids ambiguous “first child” lookup and supports Strict Mode/concurrent rendering.
- `render (removed; use createRoot)`: `render` is removed. For a new client-rendered root, call `createRoot(container)` from `react-dom/client`, then `root.render(node)`. Rendering into server-generated HTML is hydration, not `createRoot`.
- `hydrate (removed; use hydrateRoot)`: `hydrate` is removed. Use `hydrateRoot(container, node)` from `react-dom/client` for server-rendered markup and handle recoverable errors/identifier prefixes as required.
- `unmountComponentAtNode (removed; use root.unmount())`: retain the root returned by `createRoot` or `hydrateRoot` and call `root.unmount()` when the integration host removes the container.

### Removed Node.js stream APIs

- `renderToNodeStream (removed; use current server APIs)`: use a current server renderer chosen for the runtime. `renderToPipeableStream` is the Node.js streaming API; `renderToReadableStream` is for Web Streams runtimes; `renderToString` is a non-streaming compatibility option with different streaming/suspense behavior.
- `renderToStaticNodeStream (removed; use current server APIs)`: choose a current static renderer for the environment, such as `renderToStaticMarkup`; do not assume a static export has hydration markers or interactive behavior.

Server rendering APIs are imported from `react-dom/server` and must not be confused with client root APIs. Environment matters: Node streams and Web Streams have different interfaces. The “current server APIs” phrase is a family of alternatives, not one universal replacement.

## Cross-item comparison

`render (removed; use createRoot)` creates a client root; `hydrate (removed; use hydrateRoot)` adopts server-rendered markup. `unmountComponentAtNode` becomes a method on the retained root. Node stream rendering APIs are separate from all client root APIs.

## Examples

```jsx
import { createRoot, hydrateRoot } from 'react-dom/client';

const container = document.getElementById('root');
if (container.hasChildNodes()) {
  hydrateRoot(container, <App />);
} else {
  const root = createRoot(container);
  root.render(<App />);
}
```

In real applications choose based on whether markup is known to be server-rendered, not merely whether the element has children.

## Migration checks

Search dependencies and application code for every removed API; a dependency may still call them. Determine whether the existing container contains server-rendered HTML before choosing `createRoot` versus `hydrateRoot`. Keep root handles for later unmounting. Replace DOM lookup with refs at the component boundary. For server output, choose streaming/static behavior based on runtime and whether hydration is expected.

## Common mistakes

- Calling `createRoot` on server-rendered HTML and discarding markup that should be hydrated.
- Using `hydrateRoot` for an empty client-only container.
- Importing server rendering functions from `react-dom/client`.
- Choosing a Node stream API for a runtime that only supports Web Streams.
- Treating `renderToStaticMarkup` as an interactive hydrated page.

## Knowledge checks with answers

1. Which root API is for existing server markup?
2. Why does ref-based lookup improve on `findDOMNode`?
3. Name the current Node streaming and Web Streams server renderers.
4. What kind of output is appropriate when no hydration is intended?

## Answers

1. `hydrateRoot`.
2. It explicitly identifies the intended DOM node and fits component ownership/concurrent rendering.
3. `renderToPipeableStream` and `renderToReadableStream`.
4. Static markup, such as `renderToStaticMarkup`, selected for the intended environment.

## Sources

- [React 19 upgrade guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [React DOM reference](https://react.dev/reference/react-dom)
- [React DOM client reference](https://react.dev/reference/react-dom/client)
- [React DOM server reference](https://react.dev/reference/react-dom/server)
