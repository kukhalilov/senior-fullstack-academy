# React DOM rendering modes hydration and host integration — Reference: Client rendering, server rendering, and hydration modes

Sources: React 19.3 [React DOM client APIs](https://react.dev/reference/react-dom/client), [`hydrateRoot`](https://react.dev/reference/react-dom/client/hydrateRoot), [React DOM server APIs](https://react.dev/reference/react-dom/server), and [React 19](https://react.dev/blog/2024/12/05/react-19).

## Scope and version

This lesson describes the behavior of rendering modes. Exact entry-point signatures and method names are listed in the API reference module.

## How this group fits the mental model

Server rendering provides an initial HTML snapshot. Hydration associates client behavior with that snapshot when it matches the initial client output. Client rendering instead creates the host tree in the browser.

## Supplied names explained

### Client rendering

React executes in the browser and creates DOM output from the application component tree. The browser receives the app shell/bundle and whatever data strategy the app uses. Client rendering suits experiences where browser ownership and interactivity dominate, but users may wait for JavaScript before meaningful React content appears unless the page includes other HTML.

### Server rendering

React executes on the server to produce HTML for a request or framework-managed route. The browser can parse and display that markup before the client bundle loads. Server rendering may improve early content presentation, but it requires server-compatible code, data coordination, response handling, and typically client hydration for React interactivity.

### Server-rendered HTML

Markup produced by rendering components on the server. The browser can display it and native HTML behaviors can work, but React event handlers and client state are not active until hydration. Keep serialized data safe and ensure the client can reproduce the same initial UI.

### Hydration

The client attaches React’s management and event behavior to server-generated markup. It expects matching tree structure and text. Hydration allows the server response to be displayed while the browser app initializes without replacing the whole tree. Frameworks generally coordinate when and where it occurs.

### Hydration attaches behavior to existing markup

Hydration reuses existing DOM nodes when markup matches, then React manages future updates. It is conceptually distinct from mounting into an empty container. Do not manually mutate the server DOM before hydration unless an integration explicitly supports it.

### Initial server-client output agreement

The first client render must produce the same output as the server markup for hydrated content. Use shared data snapshots, deterministic IDs and ordering, and environment-independent initial values. Browser-only differences should be isolated to a later client update rather than leaking into the first render.

### Hydration mismatch

The client and server produced different initial structure, text, or attributes. Treat this as a bug and compare the initial inputs. Development React warns, but it does not guarantee that mismatched attributes will be patched; recovery behavior should not be relied on to repair inconsistent markup.

### `suppressHydrationWarning` limitations

For one unavoidable text or attribute difference on a specific element, `suppressHydrationWarning={true}` is a narrow escape hatch. It only works one level deep, and React does not attempt to patch mismatched text content. It silences a warning; it does not make the markup agree or fix downstream behavior. Prefer deterministic initial output or a deliberate post-hydration client pass.

### Hydration mismatch root causes

Typical causes include current time/random values, locale or timezone differences, invalid HTML nesting that browsers repair, different data snapshots, feature detection during render, non-deterministic iteration, and reading browser state on the server. Check the exact differing node and make initial inputs deterministic.

### Selective hydration

React can prioritize hydration work for boundaries needed by user interaction rather than requiring the entire page to hydrate in one blocking sequence. Suspense boundaries and framework integration influence the behavior. Treat this as a capability of the rendering pipeline, not an application API to manually schedule arbitrary DOM nodes.

### Hydration boundary priority

Boundaries that a user interacts with can receive priority, helping a page become usable progressively. A boundary still needs matching markup and loaded client code. Avoid assumptions about exact timing; test with the framework’s supported rendering behavior.

## Cross-item comparison

| Mode | Initial markup source | How client behavior begins |
|---|---|---|
| Client render | Created by browser React | As the root renders |
| Server render without hydration | Server HTML | No React client behavior |
| Server render with hydration | Server HTML reused | Client attaches to matching markup |

## Examples

```jsx
function Greeting({ name }) {
  return <p>Hello, {name}</p>;
}
```

If server and client both receive the same `name`, the output agrees. If the server renders “Hello, Ada” but the client reads a different local value and renders “Hello, Grace” before hydration, the markup does not match. Pass the same initial snapshot and apply later changes through normal state updates.

## Common mistakes

- Calling any server-generated HTML “hydrated.”
- Using local time/randomness independently in initial server and client rendering.
- Assuming hydration warnings are harmless in all cases.
- Depending on hydration for native browser behavior that HTML already provides.
- Assuming selective hydration bypasses the need for matching content.

## Knowledge checks with answers

1. **What does the client need to hydrate?** A compatible server-produced initial tree.
2. **Why is time formatting risky?** Locale/timezone can differ between server and browser.
3. **What does selective hydration prioritize?** Boundaries needed for interaction, within the supported integration.

### Exact terms covered

- `Client rendering`
- `Server rendering`
- `Server-rendered HTML`
- `Hydration`
- `Hydration attaches behavior to existing markup`
- `Initial server-client output agreement`
- `Hydration mismatch`
- `Hydration mismatch root causes`
- `Attribute mismatch is not guaranteed to be patched`
- `suppressHydrationWarning is a one-level escape hatch`
- `suppressHydrationWarning does not patch mismatched text`
- `Selective hydration`
- `Hydration boundary priority`
