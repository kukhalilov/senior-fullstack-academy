# React client hydration server streaming and static rendering APIs — Exercises and worked solutions

## Goals

Choose the right root and server renderer for the actual container, runtime, interactivity, and delivery goals. Diagnose mismatches and distinguish incremental streaming from complete prerendering.

## Worked example

### Choose client rendering or hydration

A page container has HTML emitted by the server from `<App initialData={data} />`, and the browser receives the same serialized data. Use `hydrateRoot(container, <App initialData={data} />)` because the existing HTML is intended to match. If the container were empty, use `createRoot(container)` followed by `root.render(...)`.

## Exercises

1. An embedded widget receives an empty `<div>` and should render a client-only React app. Choose the API and show mount/unmount.
2. A Node server should send the shell before a slow Suspense child resolves. Choose the renderer and identify response lifecycle events.
3. A Deno edge function should return a Web stream for a React page. Choose the renderer.
4. A static build must wait until all suspended content resolves before writing its HTML artifact. Choose the API.
5. A generated HTML email needs no React hydration. Choose the string renderer.
6. A date renders differently on server and client, producing a hydration mismatch. Identify prevention strategies.

## Progressive hints

1. Separate root creation from later updates; retain the root handle for teardown.
2. Distinguish Node streams from Web Streams and listen for shell readiness/errors.
3. Match API family to runtime.
4. Static prerender waits; ordinary streaming progressively emits.
5. Choose non-interactive markup.
6. Make initial data deterministic or serialize the server's chosen value for the client.

## Complete solutions

1. `const root = createRoot(container); root.render(<Widget />);` Later call `root.unmount()` before the host removes the container.
2. Use `renderToPipeableStream`. On `onShellReady`, set headers/status and call `pipe(response)`; handle `onShellError`, later errors, request disconnects, and abort.
3. Use `renderToReadableStream` from `react-dom/server` and return it in a web `Response`; handle abort/errors.
4. Use `prerender` from `react-dom/static` for Web Streams or `prerenderToNodeStream` for Node. It waits for suspended content.
5. Use `renderToStaticMarkup`; the result is non-interactive and should not be hydrated.
6. Pass the same initial snapshot to server and client; avoid `Date.now()`/randomness and differing locale/environment branches during the initial render; ensure valid identical HTML nesting.

## Tests and edge cases

- Confirm the container has matching React HTML before selecting hydration.
- Confirm first `createRoot` render replaces old children.
- Test a slow Suspense child with streaming and with static prerender; compare delivery timing.
- Simulate client disconnect and verify server rendering aborts when appropriate.
- Test mismatch caused by locale formatting and by invalid HTML nesting.
- Confirm `renderToStaticMarkup` output is not passed to `hydrateRoot`.
- In Node, ensure the selected function returns the stream type the HTTP integration expects.

## Reflection questions

- Which boundaries are worth placing around independently loadable regions?
- What user-visible content should appear in the server shell?
- Which mismatch inputs should be serialized rather than recomputed?
- Does your page still have a meaningful path before JavaScript loads?

## Sources

- [React DOM client](https://react.dev/reference/react-dom/client)
- [React DOM server](https://react.dev/reference/react-dom/server)
- [React DOM static](https://react.dev/reference/react-dom/static)
