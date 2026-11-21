# React client hydration server streaming and static rendering APIs — Reference: react-dom/server Web Stream APIs

## Scope and version

These React 19.3 server APIs produce or resume Web Streams. They are intended for environments with Web Streams such as Deno and modern edge runtimes; Node supports them for compatibility, but React recommends dedicated Node APIs there for performance. Import from `react-dom/server`. [Server APIs](https://react.dev/reference/react-dom/server)

## How this group fits the mental model

The APIs generate interactive server HTML progressively or continue a static prerender. A Web `ReadableStream` is a platform stream; it is not the same object as a Node `Readable` stream.

## Supplied names explained

- `renderToReadableStream(reactNode, options?)` expects a tree representing the full document (usually including `<html>`). It resolves to a Web `ReadableStream` once the shell is ready; shell failure rejects the promise. Options include `bootstrapScriptContent`, `bootstrapScripts`, `bootstrapModules`, `formState`, `identifierPrefix`, `importMap` (Canary only), `maxHeadersLength`, `namespaceURI`, `nonce` (string or `{script, style}`), `onBrowserBailout`, `onError`, `onHeaders`, `progressiveChunkSize`, and `signal`. Its stream has `allReady`, which resolves after all shell and boundary content; awaiting it prevents progressive delivery. Shell/error callbacks and HTTP status policy must be handled deliberately.
- `resume(reactNode, postponedState, options?)` resumes a tree previously passed to `prerender`; `reactNode` must represent the same full document and `postponedState` is the opaque serialized state from that prerender. It resolves to a Web stream after a successful shell or rejects on shell failure; the stream also has `allReady`. Its options are `nonce`, `signal`, `onBrowserBailout`, and `onError`. Bootstrap scripts/modules and `identifierPrefix` must be set during prerender, not resume. It is not a general continuation of an arbitrary stream.

## Cross-item comparison

`renderToReadableStream` begins a server render and can stream the shell plus later Suspense content. `resume` continues a previously prerendered tree. Neither is the dedicated Node stream API, and static `prerender` differs because it waits for content before producing its output.

## Examples

```jsx
import { renderToReadableStream } from 'react-dom/server';

async function handleRequest() {
  const stream = await renderToReadableStream(<App />);
  return new Response(stream, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
```

Use a supported Web Streams runtime; production code should also handle aborts, errors, and response status.

## Common mistakes

- Treating the returned promise as if it resolves to a string.
- Using it in a Node server where React recommends `renderToPipeableStream`.
- Calling `resume` without output created by the matching `prerender` flow.
- Assuming every Suspense boundary necessarily produces a useful shell.
- Forgetting that the rendered node should represent the complete document and that the server APIs inject the doctype.
- Awaiting `stream.allReady` on a latency-sensitive response and thereby giving up progressive loading.
- Passing bootstrap script or `identifierPrefix` options to `resume`; those belong to the matching prerender call.

## Knowledge checks with answers

1. What output type does `renderToReadableStream` produce? A Web `ReadableStream`.
2. Which API does `resume` continue? Output from static `prerender`.
3. Is Web `ReadableStream` the Node stream type? No.
4. What should a Node server generally use? The dedicated Node stream APIs.

## Sources

- [Server React DOM APIs](https://react.dev/reference/react-dom/server)
- [Static React DOM APIs](https://react.dev/reference/react-dom/static)
