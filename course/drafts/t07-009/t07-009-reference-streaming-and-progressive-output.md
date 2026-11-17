# React DOM rendering modes hydration and host integration — Reference: Streaming, Suspense boundaries, and progressive response

Sources: React 19.3 [React DOM server APIs](https://react.dev/reference/react-dom/server), [`renderToString`](https://react.dev/reference/react-dom/server/renderToString), [Suspense](https://react.dev/reference/react/Suspense), and [React 19.2 release notes](https://react.dev/blog/2025/10/01/react-19-2).

## Scope and version

This lesson explains incremental server output and the role of Suspense boundaries. Exact stream API names and runtime-specific method signatures are in the rendering API reference module.

## How this group fits the mental model

Streaming sends ready markup while slower parts continue. Suspense boundaries make portions of the UI independently representable with fallback content and later completion, while hydration attaches client behavior to the delivered markup.

## Supplied names explained

### Streaming server rendering

The server renderer writes HTML to a response progressively instead of waiting for the entire tree. The framework/runtime must keep the response open, handle errors and aborts, and deliver the appropriate scripts/metadata. Streaming does not imply that every data source is non-blocking or that the browser can hydrate code it has not received.

### Incremental HTML delivery

Available chunks reach the browser as the response proceeds. The browser can parse and display them before the full response finishes. Proxies, compression, buffering, and deployment infrastructure can alter when chunks become visible, so validate the deployed path.

### Suspense boundary during server rendering

A Suspense boundary divides content that may not be ready from surrounding content. The server can emit the fallback and complete the boundary later when supported by the renderer. Boundary placement affects perceived progress and UX; overly broad boundaries hide ready content, while tiny boundaries can produce noisy transitions.

In a streaming response, React can send the shell with fallbacks first, then send a boundary's completed HTML and instructions to replace its fallback. React 19.2 briefly batches some server-rendered boundary reveals so nearby content can appear together and better match client reveal behavior; this is a short heuristic, not an application-controlled fixed delay.

### Legacy `renderToString` limitation

`renderToString` returns a string immediately. It neither streams chunks nor waits for suspended data; if a child suspends, the closest Suspense fallback appears in the generated HTML. React's streaming APIs can stream resolved content as it becomes ready. Static prerender APIs instead wait for suspended content before returning the completed static result.

### Fallback content in server response

The fallback is the temporary markup for a suspended region. It should communicate what is missing without misleading users and should preserve useful page structure. A fallback must be compatible with later client rendering and accessible to assistive technology.

### Progressive content reveal

As additional boundary content completes, the browser can reveal it without waiting for all other regions. This can improve time to useful content but may shift layout; reserve space or design stable fallbacks where layout movement matters.

### Progressive enhancement before client JavaScript

Useful server HTML and native browser semantics can provide content before the client bundle loads. Forms and links should retain meaningful behavior where the application architecture permits. Hydration later adds richer client interactions. HTML alone does not guarantee every client workflow works without JavaScript.

### Streaming response completion

The server closes the stream after all work completes, the request is aborted, or an error path terminates output. Handle disconnects, timeouts, and errors through framework-supported mechanisms. Do not leave a response open indefinitely for a suspended dependency.

### Client hydration of streamed content

The client hydrates server-delivered boundaries as their markup and code become available. Hydration needs compatible component code and initial data. A streamed chunk is not automatically interactive before its boundary is hydrated.

## Cross-item comparison

| Behavior | Streaming | Whole response rendering |
|---|---|---|
| First bytes | Can arrive as parts become ready | Waits for full output before sending |
| Suspended content | Streaming can send fallback, then later boundary HTML | Depends on API: `renderToString` emits fallback immediately; static prerender waits for content |
| Infrastructure sensitivity | Buffering can erase incremental benefit | Less dependent on chunk flush behavior |

## Examples

```jsx
<main>
  <ProductSummary product={product} />
  <Suspense fallback={<ReviewsSkeleton />}>
    <Reviews productId={product.id} />
  </Suspense>
</main>
```

If reviews are slower, the summary can be made available earlier while the fallback occupies the review boundary. The framework must support the data/rendering integration; arbitrary asynchronous fetching inside a component is not made production-ready solely by adding Suspense.

## Common mistakes

- Expecting streaming benefit when a proxy buffers the whole response.
- Putting most of a page behind one boundary and hiding ready content.
- Treating a fallback as an error message or as final content.
- Assuming streamed HTML is hydrated as soon as bytes arrive.
- Ignoring abort, error, timeout, or stable-layout behavior.

## Knowledge checks with answers

1. **What controls reveal units?** Suspense boundary placement and renderer/framework behavior.
2. **Can deployment buffering hide streaming?** Yes.
3. **Is received HTML immediately interactive?** No; client hydration and code availability are still required.

### Exact terms covered

- `Streaming server rendering`
- `Incremental HTML delivery`
- `Suspense boundary during server rendering`
- `Fallback content in server response`
- `Progressive content reveal`
- `Progressive enhancement before client JavaScript`
- `Streaming response completion`
- `Client hydration of streamed content`
- `renderToString does not stream or wait for data`
- `renderToString emits Suspense fallback without waiting`
- `React 19.2 briefly batches server Suspense boundary reveals`
