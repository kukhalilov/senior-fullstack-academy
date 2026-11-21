# React routing frameworks data loading server components and deployment — Reference: Next.js 16 App Router conventions and route APIs

## Scope and version

This reference covers the supplied Next.js 16 App Router file conventions and APIs against current docs checked 2026-11-20 (App Router docs 16.4.6). Next.js defaults and caching behavior changed across releases; verify the major version and whether Cache Components are enabled. [App Router](https://nextjs.org/docs/app) [Next.js 16](https://nextjs.org/blog/next-16)

## How this group fits the mental model

The `app/` tree maps URL segments to nested layouts and pages. Server Components render on the server/build where supported; client boundaries enable browser interaction. Route files define loading/error/metadata/request handlers. Cache components and revalidation APIs control freshness.

## Supplied names explained

- `app/ directory` holds App Router segments, layouts, pages, and special files. Nested folders map to URL segments; route groups/parallel/intercepting patterns exist but are outside this lesson's enumerated API group.
- `page.tsx route convention` defines the UI for a route segment and makes that segment publicly accessible when its hierarchy is complete.
- `layout.tsx convention` defines shared UI around child routes and can preserve state across navigation when reused. Root layouts define document structure.
- `template.tsx convention` behaves like a layout but is given a unique instance on navigation, so state/effects remount rather than persist.
- `loading.tsx convention` defines a route-segment loading UI, integrated with Suspense for the segment's page content.
- `error.tsx convention` defines a client error boundary for errors in a route subtree; it does not catch errors in the same segment's layout in all cases, so boundary placement matters.
- `global-error.tsx convention` is the top-level error boundary replacement for the root layout and must provide its own `<html>`/`<body>` document structure.
- `not-found.tsx convention` renders the not-found UI when `notFound()` is invoked for the relevant segment or a route cannot be matched.
- `route.ts route handler convention` defines HTTP method handlers such as GET/POST for a route endpoint. It is a request handler, distinct from a UI `page.tsx`.
- `proxy.ts convention (Middleware replacement in Next.js 16)` defines network-boundary request interception/rewrites/redirects in Next.js 16; the `middleware.ts` convention was replaced by `proxy.ts`. It is not a general React middleware API. [Proxy](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) [Next.js 16](https://nextjs.org/blog/next-16)
- `generateStaticParams()` supplies route parameter values for build-time static generation of dynamic segments. It can be combined with route rendering configuration; it is not an authorization boundary.
- `generateMetadata()` computes page metadata from route params/data. Its output may be streamed/handled according to framework rendering behavior; do not duplicate incompatible metadata.
- `Server Component page and layout` is the default for App Router pages/layouts. It can access server-only resources and does not ship its implementation as client JavaScript; it cannot use client-only state/effects/event handlers.
- `Client Component boundary with 'use client'` marks a module as client entry. Imported modules below it join the client bundle; use it for state, event handlers, Effects, and browser APIs. Props crossing the server/client boundary must satisfy serialization rules.
- `Server Action with 'use server'` marks an async Server Function. It is a callable server reference used for mutations; it does not mark a component as a Server Component. Validate authorization and input on the server.
- `use cache directive` enables caching of a page, component, or function when Next.js Cache Components are configured. In Next.js 16 this explicit cache model is opt-in via `cacheComponents: true`; cached inputs/keys and revalidation policy must avoid cross-user leakage. [Next.js 16](https://nextjs.org/blog/next-16) [Caching](https://nextjs.org/docs/app/guides/caching)
- `revalidatePath(path)` invalidates cached data/rendering associated with a path so it is refreshed on a later request/navigation, according to Next.js cache rules. It is not a direct database cache invalidation API.
- `revalidateTag(tag, profile)` revalidates tagged cached data using the named cache-life profile. In Next.js 16 the profile-based form is the current API; `updateTag()` is a separate API for immediate expiration/read-your-own-writes workflows. [Next.js 16](https://nextjs.org/blog/next-16)
- `updateTag(tag)` immediately expires data associated with a cache tag for read-your-own-writes behavior. It is available only inside a Server Action; the next read waits for fresh data, and the action response updates the current route. Use `revalidateTag` for Route Handlers or other server contexts. [updateTag](https://nextjs.org/docs/app/api-reference/functions/updateTag)
- `refresh() from a Server Action` reruns dynamic work for the current route without invalidating server-side cached data. Import it from `next/cache`; it can be called only in a Server Action. In a Client Component, `router.refresh()` is the different client API. Use `updateTag` or `revalidatePath` when a mutation must invalidate server cache entries. [refresh](https://nextjs.org/docs/app/api-reference/functions/refresh)
- `Suspense streaming boundary` lets a server-rendered subtree show a fallback while asynchronous content is pending and stream later content when ready, subject to route and deployment support.

## Cross-item comparison

`layout.tsx` persists shared UI across navigation; `template.tsx` remounts. `page.tsx` renders route UI; `route.ts` handles HTTP requests. `error.tsx` is segment-level; `global-error.tsx` replaces the root document on top-level errors. `'use client'` defines browser code; `'use server'` defines callable server functions.

## Examples

```tsx
// app/projects/[id]/page.tsx — Server Component by default
export default async function ProjectPage({ params }) {
  const { id } = await params;
  const project = await getProject(id);
  return <ProjectDetails project={project} />;
}
```

Next.js 16 APIs may make params asynchronous; use types and conventions from the target version. Keep database access in server-only modules and add a client boundary only where interactivity is needed.

## Common mistakes

- Adding `'use client'` to a root layout without considering the enlarged client bundle.
- Treating `'use server'` as a Server Component marker.
- Assuming cache defaults from Next.js 14/15 still apply to Next.js 16 Cache Components.
- Using `revalidateTag` without a profile or confusing it with `updateTag`.
- Calling `updateTag` or `refresh()` from a Route Handler; both APIs are Server Action only.
- Assuming `refresh()` invalidates server-side cached data; it reruns dynamic work without invalidating those entries.
- Calling `proxy.ts` a general-purpose edge runtime guarantee.
- Using `route.ts` and `page.tsx` for the same route segment as though both can own a response.
- Assuming a deployment platform supports streaming just because Next.js can generate it.

## Knowledge checks with answers

1. What file convention defines route UI? `page.tsx`.
2. What is the difference between `layout.tsx` and `template.tsx`? Layout may persist; template remounts on navigation.
3. What does `'use client'` mark? A client module boundary.
4. What does `'use server'` mark? A Server Function.
5. In Next.js 16 what replaced `middleware.ts`? `proxy.ts`.
6. Does `use cache` enable a cache by itself regardless of config? Cache Components must be enabled for the documented Next.js 16 model.
7. How do `updateTag(tag)` and `refresh()` differ? `updateTag` expires tagged server cache for read-your-own-writes; `refresh()` reruns current-route dynamic work without invalidating server cache.

## Sources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Project structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Layouts and pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
- [Fetching data](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Updating data](https://nextjs.org/docs/app/getting-started/updating-data)
- [Caching](https://nextjs.org/docs/app/guides/caching)
- [Proxy convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [Next.js 16](https://nextjs.org/blog/next-16)
- [updateTag](https://nextjs.org/docs/app/api-reference/functions/updateTag)
- [refresh](https://nextjs.org/docs/app/api-reference/functions/refresh)
