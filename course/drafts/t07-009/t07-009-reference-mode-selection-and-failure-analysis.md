# React DOM rendering modes hydration and host integration — Reference: Rendering-mode selection and diagnosis

Sources: React 19.3 [React DOM client APIs](https://react.dev/reference/react-dom/client), [React DOM server APIs](https://react.dev/reference/react-dom/server), [React DOM static APIs](https://react.dev/reference/react-dom/static), and [Suspense](https://react.dev/reference/react/Suspense).

## Scope and version

This lesson selects among high-level rendering modes and diagnoses mismatches. Framework routing, cache, API names, and deployment configuration are separate concerns.

## How this group fits the mental model

Choose the renderer according to when content is known, when users need it, whether a request-specific runtime exists, and whether client interaction is needed. Then preserve output agreement and validate the complete deployed response path.

## Supplied names explained

### Choose client rendering for client-owned rendering needs

Use a client-owned root when the browser is the natural owner of a highly interactive view, or when server HTML is not required. It is direct, but meaningful React output may wait for JavaScript and data. Ensure loading states, route fallback, and accessibility remain coherent.

### Choose server rendering for early HTML delivery

Use server rendering when the request can produce useful markup before the client bundle executes and the server can safely access required data. Plan for hydration-compatible output, server capacity, streaming/error behavior, and response caching. Server-rendering sensitive user content requires per-user authorization and appropriate cache controls.

### Choose static prerendering for build-time stable output

Choose static output for pages that are known ahead of requests and can be shared safely. Define regeneration/revalidation and cache invalidation so updates appear when expected. Keep user secrets and private data out of shared artifacts.

### Choose streaming for progressive server response

Choose a streaming integration when a request can provide valuable output before all regions complete and the target runtime, framework, proxies, and CDN preserve chunk delivery. Design Suspense boundaries and fallbacks around useful content, not implementation convenience.

### Debug hydration mismatch from unstable render inputs

Read the first mismatch warning and inspect the element/text around it. Compare server and initial client inputs. Check time, randomness, locale/timezone, browser feature checks, invalid nesting, data snapshots, and order. Fix determinism or render browser-specific differences after hydration; avoid broad warning suppression.

### Keep server-only and client-only environment assumptions separate

Server modules can access server resources but not browser globals. Client code can access DOM after it exists, subject to effect timing. Shared rendering functions should avoid environment-dependent output on their first render. Separate server-only secrets and data access from client bundles using the framework’s supported boundaries.

### API reference for exact rendering method names is t07-021

The current module teaches modes and behavior. Consult t07-021 for exact React DOM client, server, and static API names and signatures. Consult framework topics for router and deployment integrations.

## Cross-item comparison

| Product need | Candidate mode | Key check |
|---|---|---|
| Private, interactive workspace | Client or request server rendering | Auth and server/client data boundaries |
| Public stable documentation | Static prerender | Freshness and shared-cache correctness |
| Useful first response plus slower regions | Streaming SSR | Runtime flushing and boundary UX |
| No useful HTML before browser app | Client rendering | Startup and failure/loading experience |

## Examples

For a public marketing page, static prerendering may give fast, reusable HTML if content freshness is acceptable. A logged-in billing page may need request-time authorization and private caching, whether it is rendered on a server or fetched by a client. A live dashboard may prefer client ownership after a secure shell arrives. Select based on measured requirements, not a blanket “SSR is always faster” rule.

## Common mistakes

- Picking SSR without considering server capacity and cache isolation.
- Using static output for request-specific private information.
- Assuming a streaming API alone guarantees early display through deployed proxies.
- Hiding hydration errors without fixing nondeterministic inputs.
- Mixing server-only secrets into client imports.
- Confusing React renderer primitives with framework routing behavior.

## Knowledge checks with answers

1. **What is a key SSR safety concern?** Per-user data must be authorized and never shared by an incorrect cache key.
2. **What should a hydration mismatch investigation compare?** The exact server and initial client inputs/output.
3. **What decides whether streaming is useful?** Progressive user value plus runtime and infrastructure support.

### Exact terms covered

- `Choose client rendering for client-owned rendering needs`
- `Choose server rendering for early HTML delivery`
- `Choose static prerendering for build-time stable output`
- `Choose streaming for progressive server response`
- `Debug hydration mismatch from unstable render inputs`
- `Keep server-only and client-only environment assumptions separate`
- `API reference for exact rendering method names is t07-021`

### Exact terms covered

- `Choose client rendering for client-owned rendering needs`
- `Choose server rendering for early HTML delivery`
- `Choose static prerendering for build-time stable output`
- `Choose streaming for progressive server response`
- `Debug hydration mismatch from unstable render inputs`
- `Keep server-only and client-only environment assumptions separate`
- `API reference for exact rendering method names is t07-021`
