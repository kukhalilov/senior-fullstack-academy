# React routing frameworks data loading server components and deployment — Core concepts and how they fit together

## Learning objectives

Compare routing/framework modes; explain route loaders/actions, navigation and mutation state, caching/revalidation, Server and Client Component boundaries, rendering strategies, and deployment runtime; and select an architecture from concrete requirements.

## Prerequisites

Know React components, URLs, HTTP requests/responses, promises, caches, and server/client JavaScript. A **route** maps a URL pattern to UI and behavior. A **loader** reads route data; an **action** handles a mutation. A **runtime** is the environment executing server or client code.

## Core concepts

### Router versus framework

A router matches URLs and coordinates navigation. A full-stack framework also defines conventions for server rendering, build output, data requests, mutations, assets, and deployment. A build tool such as Vite transforms and bundles code; it can support a framework but does not by itself provide route/data/deployment architecture. A client-only SPA can still be built with a framework and deployed to static hosting. [React application guidance](https://react.dev/learn/creating-a-react-app)

### Three React Router modes

Declarative Mode maps routes to UI without route data APIs. Data Mode adds data routers, loaders, actions, and pending/error state while allowing the application to own more setup. Framework Mode adds Vite integration, route modules/conventions, server rendering strategies, build output, and deployment adapters. Choose by how much architecture you want the library/framework to own; APIs in a lesson must name their mode because route modules and `routes.ts` conventions do not apply to every mode. [Picking a mode](https://reactrouter.com/start/modes)

### Next App Router: route files and component boundary

The `app/` filesystem convention creates nested route segments. `page.tsx` defines route UI; `layout.tsx` defines shared nested UI; `template.tsx` creates a new instance on navigation where state/effects need reset; `loading.tsx`, `error.tsx`, `global-error.tsx`, and `not-found.tsx` provide route/loading/error/not-found boundaries; `route.ts` defines a request handler; `proxy.ts` runs at the network boundary and in Next.js 16 replaces the `middleware.ts` file convention.

Pages and layouts are Server Components by default. Add `'use client'` at a module boundary for state, event handlers, Effects, or browser APIs; imported dependencies below that boundary join the client bundle. `'use server'` marks a Server Function, not a Server Component. `generateStaticParams()` supplies build-time route params for static generation, and `generateMetadata()` computes route metadata. [Next.js project structure](https://nextjs.org/docs/app/getting-started/project-structure) [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

### Route data lifecycle

Loaders read data for matched routes; nested loaders may run in parallel when independent. Actions process form mutations. Navigation/submission state supports pending UI; fetchers perform data work without navigation. Revalidation refreshes route data after mutations or explicit invalidation. Cache scope matters: request-scoped cache is isolated per request; persistent cache can be reused across requests and needs deliberate invalidation and user isolation. Do not treat all framework fetch caching as identical: Next.js cache components and React Router loader revalidation are different systems.

### Rendering and cache are separate decisions

Client rendering, static prerender, request-time server rendering, streaming, and partial prerendering have different freshness and infrastructure costs. Static output is cache-friendly but may need revalidation/builds. Request SSR can use fresh data but requires a runtime. Streaming improves progressive delivery when the hosting transport preserves streams. Next.js 16 Cache Components make caching opt-in through `'use cache'` and support Partial Prerendering; current defaults differ from prior implicit caching behavior. React Router supports per-route rendering strategies. [Next.js caching](https://nextjs.org/docs/app/guides/caching) [React Router rendering](https://reactrouter.com/start/framework/rendering)

### Deployment is part of architecture

Static export needs static file hosting and client fallback routing. Node server rendering needs a Node-compatible host or container. Edge runtime APIs differ from Node APIs. Serverless adapters may impose execution/streaming limits. CDN behavior depends on cache headers, cookies, and request variation. Runtime environment variables exist at execution; build-time variables are baked into artifacts and may be visible in client bundles. Test a production build and preview deployment using production-like runtime settings.

## Mechanisms and relationships

| Question | Typical mechanism |
|---|---|
| Match nested UI to a URL | route tree, file route convention, layout + outlet |
| Read data before route UI | route loader or Server Component data access |
| Mutate data | route action, form, fetcher, or framework server function |
| Show pending state | router navigation state, fetcher state, loading boundary |
| Refresh data | loader revalidation, tag/path invalidation, request/cache policy |
| Share server-only work | Server Component or server route, within framework boundary |
| Deploy without a server | client SPA or static output on static hosting/CDN |

## Worked examples

### React Router route hierarchy

```tsx
export default [
  { path: '/', Component: Root, children: [
    { index: true, Component: Home },
    { path: 'projects/:projectId', loader: projectLoader, Component: Project },
  ] },
];
```

This shape illustrates nested routes and loader association; exact route configuration depends on Data versus Framework mode. A parent renders `<Outlet />` for the matched child.

### Next client boundary

```tsx
'use client';

export function LikeButton() {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(value => !value)}>{liked ? 'Liked' : 'Like'}</button>;
}
```

The boundary belongs at the module top. Keep server-only data access above it and pass serializable props across the boundary where possible.

## Misconceptions and edge cases

- React recommends frameworks, but a full-stack framework does not require a running server for every deployment.
- A route loader is not the same as a client `useEffect` fetch: it can participate in navigation, pending state, server rendering, and revalidation.
- `'use server'` marks Server Functions, not Server Components.
- `proxy.ts` is a Next.js 16 convention; it is not a universal React middleware API.
- Cache invalidation and freshness differ across Next.js, React Router, and TanStack.
- Edge and Node runtimes do not expose identical APIs.
- A development server working locally does not prove production adapter/CDN behavior.

## Knowledge checks with answers

1. **Does choosing a framework require a server deployment?** No; CSR, SPA, and static output can deploy to CDN/static hosting.
2. **What is the Next App Router default component type?** Server Component for pages/layouts unless a client boundary applies.
3. **What does `'use server'` mean?** A Server Function directive, not a Server Component declaration.
4. **What does a loader do?** Reads data for a route and integrates with the router/framework lifecycle.
5. **Why is cache scope important?** Persistent shared caches can leak stale or user-specific data without correct keys/invalidation.
