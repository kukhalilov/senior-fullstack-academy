# React client hydration server streaming and static rendering APIs — Reference: Rendering and hydration behaviors

## Scope and version

This lesson connects React 19.3 client/server/static APIs to their runtime behavior. It focuses on rendering mode, Suspense, hydration, and progressive delivery rather than framework-specific routing. [Client APIs](https://react.dev/reference/react-dom/client) [Server APIs](https://react.dev/reference/react-dom/server) [Static APIs](https://react.dev/reference/react-dom/static)

## How this group fits the mental model

Rendering produces HTML or DOM; hydration adopts compatible server markup; streaming controls delivery timing; static prerender controls whether output waits for all suspended work. These are related dimensions but not synonyms.

## Supplied names explained

- `Streaming server rendering` sends a shell and can send later Suspense-delayed content as it becomes ready. In Node, `onShellReady` starts progressive piping and `onAllReady` waits until completion; if the shell fails, `onShellError` runs before any bytes and ready callbacks do not run. In Web Streams, `renderToReadableStream` resolves when its shell is ready and exposes `allReady`. Server API, response transport, boundaries, and browser runtime must be configured as a system. It can improve time to first bytes and content visibility, but requires error/abort handling and careful shell design.
- `Selective hydration` lets React hydrate parts of server-rendered content as their code/data are ready rather than requiring the whole tree to finish first. Suspense boundaries establish independent units; interaction with an unhydrated region can raise its priority. This is managed by React and is not a manual API call per component. The first `hydrateRoot` call begins hydration; calling `root.render` before hydration finishes clears existing server HTML and switches the entire root to client rendering.
- `Suspense boundaries during server rendering` define where a subtree can be delayed. In a streaming renderer, a fallback can be sent while content is pending and later content can replace it. In `renderToString`, Suspense has limited behavior; static `prerender` waits for suspended content instead of progressively sending it.
- `Partial prerendering` intentionally leaves selected work postponed (or aborts a render through its `signal`) and serializes opaque renderer state for a later matching `resume`/static-resume call. Keep the same React tree and required inputs; the postponed object is not a general cache or an editable application payload. A `null` postponed value means the prerender completed with no continuation required.
- `Hydration mismatch handling` covers cases where initial client markup differs from the server HTML. React expects an identical initial tree; mismatches are bugs. Development warns, but attribute differences are not guaranteed to be patched. React may recover by client-rendering an affected tree; do not rely on recovery. React 19 gives a clearer development error with a diff. Prevent mismatches by sharing initial data, matching `identifierPrefix` values (and `formState` when used), avoiding environment-specific initial branches, and using a deliberate snapshot for dates/locale-dependent output.
- `Progressive enhancement` means core content and actions remain useful before client JavaScript loads or if it fails. Native links/forms and server handling can provide a fallback; JavaScript can then enhance them. Server rendering alone does not provide this guarantee, and function Actions or custom interactions require the runtime unless paired with a fallback.
- `Web Streams runtime support` means the environment exposes Web `ReadableStream`/`Response` interfaces. React documents Web Stream APIs for browsers, Deno, and modern edge runtimes; Node compatibility exists, but dedicated Node methods are recommended there for performance.
- `Node.js Streams runtime support` means the server can consume/pipe Node's stream types. Use `renderToPipeableStream` and Node static APIs rather than treating Web streams and Node streams as interchangeable.

## Cross-item comparison

Streaming and selective hydration concern progressive delivery and activation. Static prerender concerns complete output and waits. Hydration mismatch handling is about server/client consistency; progressive enhancement is about useful behavior before or without hydration. Runtime support selects the stream API independently from whether the render is streaming or static.

## Examples

```jsx
import { Suspense } from 'react';

function Page() {
  return <main>
    <h1>News</h1>
    <Suspense fallback={<p>Loading latest story…</p>}>
      <LatestStory />
    </Suspense>
  </main>;
}
```

In streaming SSR, the shell can include the heading and fallback while the story is pending. Static prerender waits for the story before completing. A Suspense boundary does not itself choose the renderer.

## Common mistakes

- Calling every server-rendering method “SSR” without specifying string, streaming, or prerender semantics.
- Calling `root.render` during hydration without realizing it can discard all server HTML in the root.
- Assuming hydration mismatch warnings mean React safely repaired every node or attributes will be patched.
- Assuming Suspense always makes static output faster; prerender waits for it.
- Using a Web Stream API in Node without considering the dedicated Node API performance guidance.
- Assuming server HTML automatically works without JavaScript.
- Building a shell whose fallback hides the page's primary purpose indefinitely.

## Knowledge checks with answers

1. What is selective hydration? Incremental React activation of independent server-rendered regions as they become ready/needed.
2. What does a Suspense boundary do in streaming SSR? Allows fallback shell output and later content for a pending subtree.
3. Does static prerender stream pending content immediately? No; it waits.
4. How should a hydration mismatch be handled? Prevent it with consistent initial inputs; treat React recovery as a fallback, not a data synchronization strategy.
5. Does server rendering guarantee progressive enhancement? No; native fallback behavior must be designed.

## Sources

- [Client React DOM APIs](https://react.dev/reference/react-dom/client)
- [Server React DOM APIs](https://react.dev/reference/react-dom/server)
- [Static React DOM APIs](https://react.dev/reference/react-dom/static)
- [React 19](https://react.dev/blog/2024/12/05/react-19)
