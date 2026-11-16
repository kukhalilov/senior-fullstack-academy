# React routing frameworks data loading server components and deployment — Exercises and worked solutions

## Goals

Choose a router/framework mode, associate routes with data and mutations, reason about cache freshness, and match rendering output to the deployment runtime.

## Worked example

### Public catalog and private account

The product catalog changes occasionally and should load quickly worldwide; the account page is personalized and changes per request. Consider static/prerendered catalog output with CDN caching and request-time or client-authenticated account data with a private cache policy. A framework may support both per route. Verify invalidation and hosting support rather than applying one rendering mode globally.

## Exercises

1. A small client-only dashboard already has a backend API and needs URL navigation. Choose among Vite, React Router Declarative Mode, Data Mode, and Framework Mode; state one reason for and against a full-stack framework.
2. A route has nested layouts, an independent data loader, pending navigation UI, and a save mutation. Identify the React Router mode and APIs.
3. A Next.js page needs a database query and a button with local state. Place server/client code and explain the boundary.
4. A Next.js 16 mutation updates cached project details by tag and must make the update visible immediately to the mutating user. Distinguish `revalidateTag` and `updateTag`.
5. A dynamic route should be generated at build time for known slugs. Name the convention and its limitation.
6. A streamed route works locally but the CDN delivers one large response at the end. Diagnose the deployment issue.
7. A user-specific response is served from a shared CDN cache to another user. List the likely policy areas to inspect.

## Progressive hints

1. Separately reason about build tool, router, and server features.
2. Data APIs and route objects use Data Mode; route exports/conventions use Framework Mode.
3. Server Component for database work; client module boundary for state/event handler.
4. `updateTag` is designed for immediate expiration/read-your-own-writes; `revalidateTag` uses a cache-life profile.
5. `generateStaticParams()`; only known parameters can be emitted at build time.
6. Check adapters, proxy, CDN buffering, response compression, and streaming support.
7. Check cache keys, `Cache-Control`, `Vary`, cookies/auth, and public/private response handling.

## Complete solutions

1. Vite plus Declarative Mode can be enough for client navigation; Data Mode adds loader/action lifecycle. A full-stack framework adds server/render/deploy conventions but may add complexity the dashboard does not need.
2. Use React Router Data Mode or Framework Mode, depending on ownership. A loader reads route data; nested layout uses `<Outlet>`; `<Form method>` submits action; `useNavigation()` shows navigation pending UI. A `useFetcher()` can save without navigation.
3. Keep the database read in a Server Component/server-only module. Isolate the interactive button in a `'use client'` module and pass serializable props. Do not import the database module into the client graph.
4. `revalidateTag(tag, profile)` revalidates tagged cached data according to the profile. `updateTag(tag)` immediately expires the tag for read-your-own-writes patterns; use the API matching the desired freshness and Next 16 cache model.
5. Use `generateStaticParams()` in a dynamic segment. Data must be known at build time; newly added slugs require a regeneration/on-demand strategy or request-time rendering.
6. One or more deployment layers are buffering or adapting streams incorrectly; verify the production adapter, proxy, CDN/compression settings, and streaming support end to end.
7. Inspect cache key variation and response directives, `Vary`, cookies/authorization handling, and whether personalized content was marked public. Purge leaked cache entries and test with distinct users.

## Tests and edge cases

- Navigate directly to a nested URL on static hosting and verify SPA fallback.
- Submit an action and verify the right loaders revalidate and pending UI appears.
- Test cache behavior for two users/tenants and after mutations.
- Build known static params, then add a new value after build and inspect expected behavior.
- Compare first byte/chunk delivery through origin and CDN.
- Confirm the client bundle does not include database credentials/server-only code.
- Run production build and preview, not only development server.

## Reflection questions

- Which routes need request-specific data and which can be static/cached?
- What does the framework own, and what does the team still own operationally?
- Which values cross the server/client boundary, and are they serializable/safe?
- What evidence will show the deployment adapter supports your rendering strategy?

## Sources

- [React creating an app](https://react.dev/learn/creating-a-react-app)
- [Next.js caching](https://nextjs.org/docs/app/guides/caching)
- [React Router modes](https://reactrouter.com/start/modes)
- [React Router deployment](https://reactrouter.com/start/framework/deploying)
