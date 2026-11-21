# React client hydration server streaming and static rendering APIs — Reference: react-dom/static Web Stream APIs

## Scope and version

These React 19.3 APIs from `react-dom/static` produce static HTML in Web Stream environments such as Deno and modern edge runtimes. They wait for suspended content before completing output; Node supports them for compatibility, but React recommends dedicated Node APIs there. [Static APIs](https://react.dev/reference/react-dom/static)

## How this group fits the mental model

Static prerender is for a complete snapshot. It may return a stream object, but it waits for content rather than delivering content progressively as it becomes ready. A resume operation continues the same prepared render in the static mode.

## Supplied names explained

- `prerender(reactNode, options?)` expects a full-document tree and returns a promise for `{prelude, postponed}`. It waits for all Suspense data unless aborted; `postponed` is opaque, JSON-serializable state for `resume` or `resumeAndPrerender`, and is `null` when complete. Options: `bootstrapScriptContent`, `bootstrapScripts`, `bootstrapModules`, `identifierPrefix`, `importMap`, `maxHeadersLength`, `namespaceURI`, `onBrowserBailout`, `onError`, `onHeaders`, `progressiveChunkSize`, `signal`. It does not accept `nonce`, because a nonce must be unique per request. This static generation API waits rather than progressively revealing pending content.
- `resumeAndPrerender(reactNode, postponedState, options?)` continues the exact tree supplied to `prerender` or a previous resume, and returns `{prelude, postponed}`; if aborted it may be resumed again. Options are `signal`, `onBrowserBailout`, and `onError`. It does not accept `nonce`, bootstrap script options, or `identifierPrefix`; nonce is intentionally unavailable in prerendered output and bootstrap/prefix values belong to the initial matching prerender. It is not a continuation of a live streaming SSR response.

Partial prerendering is an intentional workflow: a render may call React's `postpone()` mechanism, or a prerender may be aborted with `signal`, yielding serializable opaque `postponed` state. Persist that state with the matching application inputs/tree, then resume it using the corresponding API. When no work remains, `postponed` is `null`. It is state for React's renderer, not application data to inspect or edit.

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
- Trying to bake a per-request CSP nonce into static prerender output; React explicitly disallows nonce on this API because it cannot be safely reused.
- Treating `resumeAndPrerender` as a stateless repeat render.
- Forgetting static HTML itself does not attach browser interactivity.

## Knowledge checks with answers

1. Does `prerender` progressively stream Suspense content? No; it waits for completion.
2. What output shape does it return? A promise resolving with a `prelude` Web stream and related state.
3. Which runtime-specific static API should Node use? The dedicated Node stream API.
4. What does `resumeAndPrerender` continue? A compatible postponed prerender.

## Sources

- [Static React DOM APIs](https://react.dev/reference/react-dom/static)
