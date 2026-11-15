# React client hydration server streaming and static rendering APIs — Reference: react-dom/server Web Stream APIs

## Scope and version

These React 19.3 server APIs produce or resume Web Streams. They are intended for environments with Web Streams such as Deno and modern edge runtimes; Node supports them for compatibility, but React recommends dedicated Node APIs there for performance. Import from `react-dom/server`. [Server APIs](https://react.dev/reference/react-dom/server)

## How this group fits the mental model

The APIs generate interactive server HTML progressively or continue a static prerender. A Web `ReadableStream` is a platform stream; it is not the same object as a Node `Readable` stream.

## Supplied names explained

- `renderToReadableStream` renders a React tree to a Web `ReadableStream` containing HTML. The returned promise resolves with the stream when the shell is ready; the stream can be returned in a web response. Options can include bootstrap scripts, error callbacks, nonce, identifier prefix, and a `signal` to abort. Suspense boundaries can let the shell stream before all content is ready. Handle shell errors and stream errors according to the API callbacks and web runtime.
- `resume` continues output produced by the static `prerender` API, returning a Web `ReadableStream` for remaining React output. It is not a general method for resuming an arbitrary stream or a tree that was never prerendered. Use the compatible prerender/resume workflow and preserve any required serialized state/transport details supplied by the framework.

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
- Forgetting to handle aborts and errors.

## Knowledge checks with answers

1. What output type does `renderToReadableStream` produce? A Web `ReadableStream`.
2. Which API does `resume` continue? Output from static `prerender`.
3. Is Web `ReadableStream` the Node stream type? No.
4. What should a Node server generally use? The dedicated Node stream APIs.

## Sources

- [Server React DOM APIs](https://react.dev/reference/react-dom/server)
- [Static React DOM APIs](https://react.dev/reference/react-dom/static)
