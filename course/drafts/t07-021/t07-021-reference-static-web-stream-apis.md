# React client hydration server streaming and static rendering APIs — Reference: react-dom/static Web Stream APIs

## Scope and version

These React 19.3 APIs from `react-dom/static` produce static HTML in Web Stream environments such as Deno and modern edge runtimes. They wait for suspended content before completing output; Node supports them for compatibility, but React recommends dedicated Node APIs there. [Static APIs](https://react.dev/reference/react-dom/static)

## How this group fits the mental model

Static prerender is for a complete snapshot. It may return a stream object, but it waits for content rather than delivering content progressively as it becomes ready. A resume operation continues the same prepared render in the static mode.

## Supplied names explained

- `prerender` renders a React tree to static HTML in a Web `ReadableStream` and waits for suspended content. It returns a promise with a `prelude` stream and `postponed` state for supported resumption workflows. Options align with server rendering concerns such as bootstrap scripts, error handling, nonce, and identifier prefix. It does not offer progressive streaming during data loading.
- `resumeAndPrerender` continues a tree previously postponed by `prerender`, producing the remaining static output as a Web stream. It is for completing that compatible static rendering workflow; it is not a general way to resume a live server stream or arbitrary React tree.

## Cross-item comparison

`prerender` starts a complete-output workflow. `resumeAndPrerender` continues a postponed prerender. Compare `renderToReadableStream`: that server API supports progressive streaming through Suspense rather than waiting for the whole tree.

## Examples

```jsx
import { prerender } from 'react-dom/static';

async function handleRequest() {
  const { prelude } = await prerender(<App />);
  return new Response(prelude, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
```

The prerender promise resolves when static output is ready; handle errors and any postponed continuation information according to the deployment workflow.

## Common mistakes

- Expecting progressive chunks as Suspense content resolves.
- Importing static APIs from `react-dom/server` rather than `react-dom/static`.
- Using Web Stream methods in Node when the dedicated Node static API is recommended.
- Treating `resumeAndPrerender` as a stateless repeat render.
- Forgetting static HTML itself does not attach browser interactivity.

## Knowledge checks with answers

1. Does `prerender` progressively stream Suspense content? No; it waits for completion.
2. What output shape does it return? A promise resolving with a `prelude` Web stream and related state.
3. Which runtime-specific static API should Node use? The dedicated Node stream API.
4. What does `resumeAndPrerender` continue? A compatible postponed prerender.

## Sources

- [Static React DOM APIs](https://react.dev/reference/react-dom/static)
