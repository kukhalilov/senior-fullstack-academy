# React client hydration server streaming and static rendering APIs — Reference: react-dom/static Node.js Stream APIs

## Scope and version

These React 19.3 APIs from `react-dom/static` produce static HTML in Node.js stream environments. They wait for suspended content before completing output; use the dedicated Node methods in Node rather than Web Stream methods kept for compatibility. [Static APIs](https://react.dev/reference/react-dom/static)

## How this group fits the mental model

Static prerender generates complete output after suspended work is ready. The API returns a Node stream, but it does not progressively stream each pending region as it resolves. A resume call continues a compatible postponed prerender.

## Supplied names explained

- `prerenderToNodeStream(reactNode, options?)` expects a full-document tree and returns a promise for `{prelude, postponed}`. It waits for all Suspense data unless aborted; `postponed` is JSON-serializable opaque state for `resumeToPipeableStream` and is `null` if complete. Options: `bootstrapScriptContent`, `bootstrapScripts`, `bootstrapModules`, `identifierPrefix`, `importMap`, `maxHeadersLength`, `namespaceURI`, `onBrowserBailout`, `onError`, `onHeaders`, `progressiveChunkSize`, and `signal`. `nonce` is unavailable in prerender output because it must be unique per request.
- `resumeAndPrerenderToNodeStream(reactNode, postponedState, options?)` continues the same tree from `prerenderToNodeStream` or a previous resume, returning `{prelude, postponed}`. Options are `signal`, `onBrowserBailout`, and `onError`. It can be aborted and resumed again, or the partial result can be sent to `resumeToPipeableStream` for progressive completion. It is a static-generation continuation, not a generic continuation of a streaming SSR result.

Partial prerendering is an intentional workflow: the render may use React's `postpone()` mechanism, or the static call may be aborted with `signal`, yielding serializable opaque `postponed` state. Persist it with the matching app/tree and resume with the corresponding API; `null` means no resume work remains. Do not inspect or mutate this renderer-owned value.

## Cross-item comparison

`prerenderToNodeStream` begins static generation; `resumeAndPrerenderToNodeStream` completes postponed work. Compare `renderToPipeableStream`, which is the Node server API for progressive SSR with Suspense streaming. A stream-shaped result alone does not imply progressive delivery.

## Examples

```jsx
import { prerenderToNodeStream } from 'react-dom/static';

async function createStaticOutput() {
  const { prelude } = await prerenderToNodeStream(<App />);
  return prelude;
}
```

Consume or write the returned Node stream according to the static generation pipeline, and handle errors/postponed state when resumption is part of the build.

## Common mistakes

- Importing these methods from `react-dom/server` instead of `react-dom/static`.
- Expecting content to stream while suspended work is still pending.
- Using the Web Stream API in Node without considering the dedicated Node implementation.
- Calling `resumeAndPrerenderToNodeStream` without a compatible postponed tree.
- Assuming the static API has a `nonce` option; it does not, because static output could be reused across requests.
- Treating `postponed: null` as missing data; it means the prerender finished and resume is unnecessary.

## Knowledge checks with answers

1. What runtime stream type does `prerenderToNodeStream` use? Node.js Stream.
2. Does it progressively send a Suspense fallback and then reveal later content? Static prerender waits for completion.
3. Which API starts progressive Node SSR? `renderToPipeableStream`.
4. What does `resumeAndPrerenderToNodeStream` require? A postponed tree produced by the matching prerender flow.

## Sources

- [Static React DOM APIs](https://react.dev/reference/react-dom/static)
- [Server React DOM APIs](https://react.dev/reference/react-dom/server)
