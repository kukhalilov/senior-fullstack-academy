# React routing frameworks data loading server components and deployment — Reference: Rendering runtime and deployment choices

## Scope and version

This lesson covers the supplied rendering/runtime/deployment choices across current Next.js, React Router, and React guidance. A framework's capability is useful only if its output and request model fit the deployment host. [React Router rendering](https://reactrouter.com/start/framework/rendering) [React Router deploying](https://reactrouter.com/start/framework/deploying) [Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)

## How this group fits the mental model

Build output, request execution, cache policy, and host behavior form one deployment contract. Decide where each route renders and what runtime handles it before choosing hosting infrastructure.

## Supplied names explained

- `Static export` emits deployable files without a request-time React server. Dynamic request features are unavailable or constrained; verify framework static export limitations, route support, and rewrites.
- `Client-side SPA hosting` serves the client bundle and usually routes unknown application paths back to the entry HTML. Configure fallback routing and cache static assets correctly.
- `Node.js server runtime` runs the framework request handler using Node APIs. It supports Node stream features but requires a maintained server/container/managed Node host.
- `Edge runtime` executes near users in an edge environment with Web APIs and platform-specific limits. Node APIs may be unavailable; confirm package compatibility, database connectivity, duration, and streaming behavior.
- `Serverless deployment adapter` packages a framework request handler for a serverless platform. Adapter behavior, filesystem access, cold starts, maximum execution time, and stream support vary by host.
- `Static prerendered routes` are generated at build time and can be served/cached as files. Freshness depends on rebuild/revalidation strategy; routes may not access request-only information during generation.
- `Server-rendered routes` render in response to a request, allowing request-specific data but requiring a runtime and careful caching.
- `Streaming response deployment` sends response chunks progressively. Every layer—application, adapter, proxy, CDN, and client—must avoid buffering if progressive delivery is required.
- `CDN cache behavior` depends on status, `Cache-Control`, `Vary`, cookies, authorization, and host configuration. A CDN may cache public HTML/assets but must not accidentally share personalized responses.
- `Runtime environment variables` are read by server code when the deployed process/request runs. Protect secrets and don't expose them in client output.
- `Build-time environment variables` are consumed while building and may be embedded into generated client assets. Never put secrets in public build-time variables.
- `Framework request handler` is the adapter/server entry that translates host requests into framework rendering/data handling and sends the response. It must be wired according to the platform's request/response API.
- `Production preview deployment` is a deployment of the production build in a representative environment to verify routing, assets, environment variables, cache headers, error pages, and streaming before release.
- `React Router framework adapter` connects Framework Mode output to a runtime/platform. Choose one that matches the target; verify its current support and whether the app uses server rendering, SPA mode, or prerendering.
- `Next.js custom server and platform deployment` may use the default Next server or a custom server/platform adapter. A custom server can reduce built-in optimizations and should be introduced only for a real requirement; static export has different constraints.

## Cross-item comparison

Static routes shift work to build and CDN; server-rendered routes shift work to request runtime. Client SPA hosting is static delivery plus browser rendering. Node and Edge have different APIs. Streaming is an end-to-end transport property, not simply a renderer option.

## Examples

```text
Mostly public docs with rare updates: static prerender + CDN
Personalized dashboard: request runtime or client data, private cache policy
Interactive internal tool: SPA hosting may be enough
Slow uncached region with useful shell: server streaming, if every host layer streams
```

## Common mistakes

- Assuming static export supports request-time headers, cookies, or Server Functions.
- Reading secrets in client-visible or build-time public variables.
- Assuming Edge is “Node but closer” and importing Node-only packages.
- Testing streaming only against the local dev server while production CDN buffers.
- Caching personalized HTML as public at the CDN.
- Treating an adapter as proof the platform supports every framework feature.
- Skipping a production build preview.

## Knowledge checks with answers

1. What does static export remove? A request-time framework server for exported routes.
2. What determines whether streaming reaches the browser? Every transport/deployment layer must preserve chunks.
3. Where can build-time variables end up? In generated client assets if referenced by client code.
4. Why verify CDN cache keys and headers? To preserve freshness and avoid sharing private responses.
5. What should a production preview test? Runtime, routes, assets, environment, caches, errors, and streaming behavior.

## Sources

- [React Router rendering strategies](https://reactrouter.com/start/framework/rendering)
- [React Router deployment](https://reactrouter.com/start/framework/deploying)
- [Next.js production checklist](https://nextjs.org/docs/app/guides/production-checklist)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React creating an app](https://react.dev/learn/creating-a-react-app)
