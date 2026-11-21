# React DOM rendering modes hydration and host integration — Reference: Static output modes and runtime constraints

Sources: React 19.3 [React DOM static APIs](https://react.dev/reference/react-dom/static), [React DOM server APIs](https://react.dev/reference/react-dom/server), [React 19 release notes](https://react.dev/blog/2024/12/05/react-19), and [React 19.2 release notes](https://react.dev/blog/2025/10/01/react-19-2).

## Scope and version

This lesson compares static HTML generation with runtime streaming and covers host stream compatibility. Exact API signatures belong to the method inventory topic.

## How this group fits the mental model

Static rendering computes output before a user request, then a server or CDN serves the saved HTML. Streaming computes response output at request/runtime time and can deliver portions as ready. A framework may combine prerendering and later continuation for dynamic portions.

## Supplied names explained

### Static prerendering

Generate HTML ahead of request time for content that can be known during a build or prerender job. It reduces per-request rendering work and works well with CDN delivery, but content may become stale unless the framework regenerates or revalidates it. Runtime-specific user data cannot be embedded in a single shared static file without an intentional personalization strategy.

### Wait for suspended content before static output

React 19's `react-dom/static` prerender APIs wait for suspended content to resolve before returning the completed HTML output; this differs from legacy `renderToString`, which immediately returns a Suspense fallback. Prerender output may be carried in a stream interface, but it is not progressively revealed as content loads. React 19.2 also supports partial prerendering: generate the static shell plus postponed state, then resume later to produce a dynamic stream or finish a static response. This deliberate partial workflow is distinct from waiting for the complete static artifact.

### Web Streams runtime

Web Streams use standard stream primitives such as `ReadableStream`. React exposes server/static output methods suited to Web Streams in supported runtimes. Since React 19.2, those APIs are also available in Node.js, but React recommends Node Streams for Node SSR because they are faster there and Web Streams do not support compression by default. Verify that the hosting environment, adapters, compression, and response APIs accept the selected stream type.

### Node.js Streams runtime

Node.js stream output uses Node stream interfaces and lifecycle events. It can integrate with Node HTTP servers and framework adapters. It is distinct from Web Streams despite adapters existing between them; do not pass one type where the integration expects the other without conversion.

### Runtime-specific stream output

Choose the output API that matches the server runtime and framework. Node server APIs and Web Stream APIs differ in return types, error propagation, cancellation, and response writing. Test under the actual deployment adapter, not only local development.

### Static output versus streaming response

Static output prioritizes reusable complete artifacts; streaming prioritizes earlier response portions for a particular rendering run. Static output can be cached broadly but risks staleness; streaming uses runtime capacity and must handle response lifecycle and buffering.

### Resumable prerender workflow

React 19.2 supports a partial prerender workflow: prerender a shell and retain the postponed state, serve/cache the shell, and resume later to stream request-specific content; a resume-and-prerender path can instead finish static output. This combines cacheable early content with dynamic continuation. Frameworks still own request lifecycle, storage of postponed state, cache policy, and response integration; exact method signatures are in t07-021.

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
- `React 19 static APIs wait for content during prerender`
- `React 19.2 partial prerender and resume workflow`
- `Prefer Node Streams over Web Streams for Node SSR`
- `Framework-managed rendering lifecycle`
