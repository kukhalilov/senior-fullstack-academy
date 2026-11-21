# React client hydration server streaming and static rendering APIs — Reference: react-dom/server Node.js Stream APIs

## Scope and version

These APIs from `react-dom/server` produce or resume Node.js streams in a Node runtime. React recommends them instead of Web Stream functions in Node for better performance. [Server APIs](https://react.dev/reference/react-dom/server)

## How this group fits the mental model

Node streams let a Node HTTP server pipe rendered HTML to the response as the shell and Suspense-delayed content become available. Static prerender continuation is a separate workflow from ordinary streaming SSR.

## Supplied names explained

- `renderToPipeableStream(reactNode, options?)` expects a full-document tree (usually including `<html>`) and returns `{pipe, abort}`. Options are `bootstrapScriptContent`, `bootstrapScripts`, `bootstrapModules`, `formState`, `identifierPrefix`, Canary-only `importMap`, `maxHeadersLength`, `namespaceURI`, `nonce`, `onAllReady`, `onBrowserBailout`, `onError`, `onHeaders`, `onShellReady`, `onShellError`, and `progressiveChunkSize`. `onShellReady` is the progressive-send point; `onAllReady` waits for all content, so piping there eliminates progressive loading. `onShellError` means no bytes were emitted and the shell-ready/all-ready callbacks will not fire. `onError` also fires for recoverable errors; preserve default logging if overriding it. The Node server owns HTTP status, headers, disconnect cancellation, and fallback behavior.
- `resumeToPipeableStream(reactNode, postponedState, options?)` resumes the same document tree and opaque state produced by `prerenderToNodeStream`. It returns a promise resolving to `{pipe, abort}` after the shell is ready. Options are `nonce`, `onAllReady`, `onBrowserBailout`, `onError`, `onShellReady`, and `onShellError`. Bootstrap scripts/modules and `identifierPrefix` must be supplied during prerender, not during resume. It is not a continuation of an arbitrary `renderToPipeableStream` result.

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
- Assuming a shell error callback is followed by `onShellReady` or `onAllReady`; no bytes were emitted and those callbacks will not occur.
- Piping in `onAllReady` when progressive delivery is wanted.
- Passing bootstrap scripts or an identifier prefix only at resume time.
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
