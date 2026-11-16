# React DOM rendering modes hydration and host integration — Reference: Static output modes and runtime constraints

Sources: React 19.3 [React DOM static APIs](https://react.dev/reference/react-dom/static) and [React DOM server APIs](https://react.dev/reference/react-dom/server).

## Scope and version

This lesson compares static HTML generation with runtime streaming and covers host stream compatibility. Exact API signatures belong to the method inventory topic.

## How this group fits the mental model

Static rendering computes output before a user request, then a server or CDN serves the saved HTML. Streaming computes response output at request/runtime time and can deliver portions as ready. A framework may combine prerendering and later continuation for dynamic portions.

## Supplied names explained

### Static prerendering

Generate HTML ahead of request time for content that can be known during a build or prerender job. It reduces per-request rendering work and works well with CDN delivery, but content may become stale unless the framework regenerates or revalidates it. Runtime-specific user data cannot be embedded in a single shared static file without an intentional personalization strategy.

### Wait for suspended content before static output

Static generation generally needs a complete output artifact. When content suspends, the chosen static API may wait for it rather than emitting a progressive response. If the product needs incremental reveal, use a streaming-capable response path where supported.

### Web Streams runtime

Web Streams use browser-standard stream primitives such as `ReadableStream`. React exposes server/static output methods suited to Web Streams in supported runtimes. Verify that the hosting environment, adapters, compression, and response APIs accept this stream type.

### Node.js Streams runtime

Node.js stream output uses Node stream interfaces and lifecycle events. It can integrate with Node HTTP servers and framework adapters. It is distinct from Web Streams despite adapters existing between them; do not pass one type where the integration expects the other without conversion.

### Runtime-specific stream output

Choose the output API that matches the server runtime and framework. Node server APIs and Web Stream APIs differ in return types, error propagation, cancellation, and response writing. Test under the actual deployment adapter, not only local development.

### Static output versus streaming response

Static output prioritizes reusable complete artifacts; streaming prioritizes earlier response portions for a particular rendering run. Static output can be cached broadly but risks staleness; streaming uses runtime capacity and must handle response lifecycle and buffering.

### Resumable prerender workflow

Some integrations can prerender available static output and later resume the remaining work in a streaming-capable request. This can combine cacheable early content with dynamic continuation. Exact support and API names are version- and framework-sensitive; use current official integration documentation.

### Framework-managed rendering lifecycle

Frameworks commonly decide when to prerender, render per request, stream, hydrate, cache, revalidate, and handle errors. Keep low-level React rendering calls inside the framework’s supported integration rather than bypassing routing or response ownership.

## Cross-item comparison

| Decision | Static prerender | Streaming server response |
|---|---|---|
| Compute time | Build/job time | Request/runtime time |
| Cache scope | Broadly reusable | Depends on response and cache policy |
| Fresh request data | Requires dynamic strategy | Can be included per request |
| Progressive reveal | Not inherently | Possible with supported boundaries/runtime |

## Examples

Documentation pages with stable content can be generated and served from a CDN. An account dashboard containing per-user records needs request-time data and authorization; a static shared artifact cannot safely contain it. A framework may statically serve public shell content and fetch private data through a protected route.

## Common mistakes

- Publishing user-specific data into a shared static artifact.
- Assuming a static page automatically updates when its source changes.
- Confusing Node streams with Web Streams.
- Assuming local server support proves that a deployment adapter flushes chunks.
- Bypassing framework cache and request lifecycle with direct renderer calls.

## Knowledge checks with answers

1. **Where is static HTML computed?** Before request time, typically during a build or prerender job.
2. **What determines stream API choice?** The runtime and framework response integration.
3. **What risk comes with static output?** Stale or improperly shared request-specific data.

### Exact terms covered

- `Static prerendering`
- `Wait for suspended content before static output`
- `Web Streams runtime`
- `Node.js Streams runtime`
- `Runtime-specific stream output`
- `Static output versus streaming response`
- `Resumable prerender workflow`
- `Framework-managed rendering lifecycle`

### Exact terms covered

- `Static prerendering`
- `Wait for suspended content before static output`
- `Web Streams runtime`
- `Node.js Streams runtime`
- `Runtime-specific stream output`
- `Static output versus streaming response`
- `Resumable prerender workflow`
- `Framework-managed rendering lifecycle`
