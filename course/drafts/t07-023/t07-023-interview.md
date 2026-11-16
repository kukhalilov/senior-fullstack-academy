# React routing frameworks data loading server components and deployment — Interview questions and reasoning

Refer to the [React application guidance](https://react.dev/learn/creating-a-react-app), [Next.js App Router docs](https://nextjs.org/docs/app), and [React Router mode guide](https://reactrouter.com/start/modes) for version-specific details.

## Core questions

1. What is the difference between a router, a build tool, and a full-stack framework?
2. Compare React Router Declarative, Data, and Framework Modes.
3. Explain the Next.js App Router Server/Client Component boundary.
4. What are loaders, actions, fetchers, and revalidation?
5. Compare static rendering, request SSR, streaming, and partial prerendering.
6. What changes between Node, Edge, and static hosting deployments?

## Concise interview answers

1. Router matches URLs; build tool transforms/bundles code; framework coordinates routing, data, rendering, build, and deployment conventions.
2. Declarative does UI routes; Data adds loaders/actions; Framework adds route modules, build/render strategies, and deploy integration.
3. App Router pages/layouts are Server Components by default; `'use client'` marks a client module graph for browser state/events; `'use server'` marks Server Functions.
4. Loaders read route data; actions mutate; fetchers perform data work without navigation; revalidation refreshes affected loader data by framework rules.
5. Static is build-time/cacheable; SSR is request-time/fresh; streaming sends chunks progressively; partial prerender combines static shell and dynamic parts.
6. Node APIs and streams differ from Edge Web APIs; static hosting has no request runtime; adapters/CDNs can change streaming, cache, and environment behavior.

## Deep follow-up answers

1. A Vite-only SPA is a valid architecture when server features are unnecessary. A framework can still deploy statically, but introduces conventions and potentially platform coupling.
2. APIs should be labeled by mode: Data route objects use loader/action properties; Framework route modules export them. Mislabeling creates code that will not run in the expected setup.
3. `'use client'` is transitive for imported modules below the boundary; keep it low to reduce browser bundle. Server-only secrets stay outside the client graph.
4. Loader lifecycle integrates with navigation/pending state; an Effect fetch starts after commit and requires custom race, pending, and error handling. Cache invalidation differs by framework.
5. `prerender` may wait even if it returns a stream; streaming is incremental. A CDN/adapter that buffers defeats streaming delivery.
6. Test runtime APIs, adapter limits, env variables, request handler, CDN cache headers, and stream pass-through in a production preview.

## Scenario questions

1. A public documentation site must serve instantly and updates weekly. What rendering/deployment mode fits?
2. A personalized route leaks one user's data to another after caching. What systems need review?
3. A Next.js 16 page unexpectedly renders dynamic code per request after upgrading. What cache model/configuration should be checked?
4. A React Router form mutation updates data but the screen remains stale. What route lifecycle or override would you inspect?
5. The app works in Node but fails in Edge. What assumptions might be wrong?

## Tradeoffs and alternatives

- Framework versus custom SPA: integration/conventions versus control/simplicity.
- Server Component versus Client Component: server access and smaller client graph versus browser interaction.
- Loader versus Effect fetch: route coordination and pre-render lifecycle versus local post-commit work.
- Static versus request rendering: caching and latency versus freshness/personalization.
- Framework adapter versus custom server: platform fit and built-in optimizations versus specialized control/maintenance.

## Common weak answers

- “React apps need a server.” CSR/SPA/SSG can be hosted statically.
- “Vite is the React framework.” It is a build tool unless combined with routing/server architecture.
- “`'use server'` makes a Server Component.” It marks a Server Function.
- “A loader is just an Effect.” It participates in route navigation/data lifecycle.
- “Cache means memoization.” Framework caches have scope, persistence, invalidation, and privacy implications.
- “Streaming works if the renderer streams.” Every host/proxy/CDN layer must preserve chunks.

## Self-check rubric

Score 0–2 for: (a) clear router/build/framework distinction; (b) accurate mode/API boundaries; (c) Server/Client Component rules; (d) loader/action/revalidation lifecycle; (e) rendering/cache tradeoffs; (f) runtime/deployment reasoning. A strong answer scores 10–12 and names a failure mode for each deployment strategy.
