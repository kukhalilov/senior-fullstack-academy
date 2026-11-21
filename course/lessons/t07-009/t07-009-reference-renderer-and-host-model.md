# React DOM rendering modes hydration and host integration — Reference: React renderer and host tree concepts

Sources: React 19.3 [Render and Commit](https://react.dev/learn/render-and-commit), [React DOM client APIs](https://react.dev/reference/react-dom/client), and [React DOM server APIs](https://react.dev/reference/react-dom/server).

## Scope and version

This lesson covers the conceptual boundary between React's platform-independent component model and a renderer's environment-specific output. Exact DOM method signatures belong to the dedicated API reference topic.

## How this group fits the mental model

Components describe desired UI; a renderer turns that description into host-specific structures and updates. Understanding this boundary clarifies why React DOM APIs differ from server HTML APIs and why frameworks coordinate both.

## Supplied names explained

### React renderer

A renderer implements how React components and elements become output in a target environment and how updates are applied there. React DOM is the browser renderer; server and static packages produce HTML-oriented output. Renderer capabilities are not interchangeable: a browser root can manage DOM events, while server rendering produces bytes and does not attach browser behavior.

### Host environment

The target controlled by a renderer: browser DOM, server-produced HTML, or another platform with its own host primitives. APIs available to a component can depend on whether it executes on a server or in a browser. Do not assume `window`, layout, or DOM nodes exist during server rendering.

### Host tree

Environment-specific output managed by a renderer, such as DOM nodes in a browser. It is produced from React's logical component and element structure, but it does not necessarily mirror every component one-to-one. Components and fragments can have no direct DOM node; one component may produce many host nodes.

### Client renderer

Runs in the browser and creates or updates host DOM through a root. It supports event handling, state updates, effects, and browser-specific interaction. It may render a fresh client-owned interface or hydrate server markup through the hydration API. Choose one ownership path for a given root.

### Server renderer

Runs React rendering in a server environment and emits HTML. It can provide useful markup before client JavaScript, but it does not itself attach client event listeners. Effects are not run on the server. Runtime-specific APIs expose Node.js streams or Web Streams, or static output.

### React component tree versus host tree

The component tree expresses composition, state, and rendering relationships. The host tree contains native environment nodes. Fragments avoid extra DOM wrappers; portals render into another host location while remaining in the React ownership/event tree; a component may return null or multiple descendants. Debug both structures with their appropriate tools.

### Renderer-specific host primitives

Elements, attributes, event handling, layout, and stream outputs depend on the renderer. A React Native host view is not an HTML `div`; React DOM server output is a string/stream of markup, not a live DOM tree. Keep shared component logic separate from host-specific assumptions when targeting multiple environments.

## Cross-item comparison

| Output path | Host result | Client interactivity immediately? |
|---|---|---|
| Browser client render | Live browser DOM | Yes, managed by client React |
| Server render | HTML response | No React handlers until client code hydrates |
| Static render | Saved HTML output | No, unless native browser behavior or later enhancement applies |

## Examples

```jsx
function Page() {
  return <><Header /><main><ProductList /></main></>;
}
```

`Page`, `Header`, and `ProductList` belong to the component tree. The fragment adds no wrapper host element; the `main` and whatever descendants the list returns do. Server-rendering the tree creates HTML markup, whereas client rendering manages actual DOM nodes and event behavior.

## Common mistakes

- Assuming every component has a corresponding DOM node.
- Accessing browser globals during server rendering.
- Treating server output as already interactive.
- Managing the same DOM root with two independent renderers.
- Porting renderer-specific elements or props as if they were universal.

## Knowledge checks with answers

1. **Does every component create a host node?** No; it can return fragments, null, or other components.
2. **What does server rendering produce?** HTML, not a live browser-managed DOM tree.
3. **What is renderer-specific?** The host primitives and update/output mechanisms.

### Exact terms covered

- `React renderer`
- `Host environment`
- `Host tree`
- `Client renderer`
- `Server renderer`
- `React component tree versus host tree`
- `Renderer-specific host primitives`
