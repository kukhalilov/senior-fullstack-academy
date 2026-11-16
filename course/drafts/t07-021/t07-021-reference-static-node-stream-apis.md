# React client hydration server streaming and static rendering APIs — Reference: react-dom/static Node.js Stream APIs

## Scope and version

These React 19.3 APIs from `react-dom/static` produce static HTML in Node.js stream environments. They wait for suspended content before completing output; use the dedicated Node methods in Node rather than Web Stream methods kept for compatibility. [Static APIs](https://react.dev/reference/react-dom/static)

## How this group fits the mental model

Static prerender generates complete output after suspended work is ready. The API returns a Node stream, but it does not progressively stream each pending region as it resolves. A resume call continues a compatible postponed prerender.

## Supplied names explained

- `prerenderToNodeStream` renders a React tree to static HTML using a Node.js stream and waits for suspended content. The returned promise resolves with the stream and possible postponed work information for a matching resume workflow. It is suited to static generation/complete output, not progressive SSR. Configure bootstrap scripts, error handling, nonce, and identifier prefix where the application needs them.
- `resumeAndPrerenderToNodeStream` continues a tree previously postponed by `prerenderToNodeStream` and returns the remaining static HTML as a Node.js stream. It is not a generic way to resume an arbitrary render or the result of `renderToPipeableStream`.

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
- Treating static generated output as automatically interactive/hydratable.

## Knowledge checks with answers

1. What runtime stream type does `prerenderToNodeStream` use? Node.js Stream.
2. Does it progressively send a Suspense fallback and then reveal later content? Static prerender waits for completion.
3. Which API starts progressive Node SSR? `renderToPipeableStream`.
4. What does `resumeAndPrerenderToNodeStream` require? A postponed tree produced by the matching prerender flow.

## Sources

- [Static React DOM APIs](https://react.dev/reference/react-dom/static)
- [Server React DOM APIs](https://react.dev/reference/react-dom/server)
