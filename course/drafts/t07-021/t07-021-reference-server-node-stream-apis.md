# React client hydration server streaming and static rendering APIs — Reference: react-dom/server Node.js Stream APIs

## Scope and version

These APIs from `react-dom/server` produce or resume Node.js streams in a Node runtime. React recommends them instead of Web Stream functions in Node for better performance. [Server APIs](https://react.dev/reference/react-dom/server)

## How this group fits the mental model

Node streams let a Node HTTP server pipe rendered HTML to the response as the shell and Suspense-delayed content become available. Static prerender continuation is a separate workflow from ordinary streaming SSR.

## Supplied names explained

- `renderToPipeableStream` renders a React tree to a Node.js pipeable stream. It returns `pipe` and `abort` controls plus callbacks such as `onShellReady`, `onShellError`, and `onError`. A typical server waits for the shell callback, sets status/headers, then pipes to the response; if the shell fails before output, it can send a fallback response. Suspense boundaries allow later content to stream. The server must handle disconnects, abort, errors, script bootstrapping, and security nonces deliberately.
- `resumeToPipeableStream` continues a React tree previously prepared by `prerenderToNodeStream`, producing a Node.js pipeable stream. It is not the normal entry point for each request and is not a generic continuation of a `renderToPipeableStream` result. Use only the matching prerender/resume lifecycle.

## Cross-item comparison

`renderToPipeableStream` starts progressive SSR for a request. `resumeToPipeableStream` continues static output prepared earlier. Both return Node stream controls, but differ in whether work is a fresh stream render or continuation of prerendered work.

## Examples

```jsx
import { renderToPipeableStream } from 'react-dom/server';

function handleRequest(request, response) {
  const { pipe, abort } = renderToPipeableStream(<App />, {
    onShellReady() {
      response.statusCode = 200;
      response.setHeader('content-type', 'text/html; charset=utf-8');
      pipe(response);
    },
    onShellError(error) {
      response.statusCode = 500;
      response.end('<!doctype html><p>Unable to render page.</p>');
    },
  });
  request.on('close', abort);
}
```

This is an API shape example; real server code must also coordinate error status, abort timing, nonce/security policy, and response lifecycle.

## Common mistakes

- Calling `pipe` before deciding shell response headers/status.
- Treating `onError` after shell output as a chance to replace already-sent bytes.
- Forgetting to abort render work when a client disconnects.
- Using `resumeToPipeableStream` without `prerenderToNodeStream` output.
- Confusing Node streams with Web `ReadableStream`.

## Knowledge checks with answers

1. Which API starts a fresh Node streaming render? `renderToPipeableStream`.
2. Which callback indicates the shell can be sent? `onShellReady`.
3. What is the resume API's matching producer? `prerenderToNodeStream`.
4. What should happen if the client disconnects? Abort unneeded render work where appropriate.

## Sources

- [Server React DOM APIs](https://react.dev/reference/react-dom/server)
- [Static React DOM APIs](https://react.dev/reference/react-dom/static)
