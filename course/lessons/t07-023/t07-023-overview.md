# React routing frameworks data loading server components and deployment — Big-picture orientation and mental model

## Problem and purpose

A production React application needs more than components: it must map URLs to screens, load and mutate data, show pending/error states, render for the chosen runtime, deliver assets, and deploy somewhere that matches its server and caching needs. A framework coordinates these layers. React recommends starting a new application with a framework, but the framework can still produce a client-only SPA or static output without a server. [Creating a React App](https://react.dev/learn/creating-a-react-app)

## Plain-language mental model

Think of a URL as a request for a slice of an application. The router identifies the matching route and parent layouts; data loaders gather what those routes need; actions handle mutations; the UI shows navigation/submission state; and the rendering strategy decides whether output is made in the browser, at build time, or per request. Deployment must support the selected output. A framework packages these decisions and provides conventions; it does not remove the need to understand them.

## How the parts fit together

```text
URL/request
├── route matching ── nested page and layout tree
├── data loading ── loaders, server components, cache
├── mutation ── actions / server functions
├── UI feedback ── pending, optimistic, error, not-found
├── rendering ── client, static, server, streaming, partial prerender
└── deployment ── static host, Node, edge, serverless adapter, CDN
```

Frameworks vary in where they place these responsibilities. Next.js App Router uses file conventions and Server Components by default for pages/layouts. React Router offers Declarative, Data, and Framework modes. TanStack Router is a router; TanStack Start adds full-stack rendering and server features. Vite is a build tool that can host a client-only app or participate in a framework, but does not by itself define a full application architecture. [Next.js App Router](https://nextjs.org/docs/app) [React Router routing](https://reactrouter.com/start/framework/routing) [TanStack Router](https://tanstack.com/router/latest/docs/overview) [TanStack Start](https://tanstack.com/start/latest/docs/framework/react/overview)

## Concept map

- **Routing:** URL matching, nested routes, layouts, route modules, params, search state.
- **Data:** loaders, Server Components, client loaders, request/persistent caches, revalidation.
- **Mutation:** route actions, forms, fetchers, server functions, optimistic UI.
- **Rendering:** SPA, static export/prerender, request SSR, streaming, partial prerendering.
- **Deployment:** runtime, adapters, environment variables, CDN/cache behavior, production preview.
- **Framework choice:** conventions, React feature support, portability, team skills, runtime and operational constraints.

## End-to-end walkthrough

A user visits `/projects/42`. The router matches a project layout and detail route. The route loader or Server Component reads project data. If data is pending, a route-level loading state or Suspense boundary gives feedback. The user submits a rename form; an action validates and mutates data, then the framework revalidates dependent loaders or refreshes cached data. The configured renderer returns client UI, static output, or server/streamed HTML. The deployment adapter and CDN must preserve request handling, environment variables, cache headers, and streaming behavior.

## When to use it and tradeoffs

React's current guidance recommends a framework for a new production application. Still choose deliberately: a client-only Vite app may be simpler for an internal tool; a full-stack framework can coordinate routes, data, and rendering; a router library can add navigation to an existing app. Evaluate data/cache semantics, Server Component maturity, runtime portability, hosting needs, ecosystem, and operational complexity. Framework capabilities can change, so confirm current docs for the chosen release.

## What later lessons cover

References compare framework modes, Next.js App Router conventions, React Router APIs, route data/cache/mutation lifecycles, and deployment/runtime choices. The named inventory bounds coverage; it does not attempt to catalog every framework API.

## Version context

As checked on 2026-11-20, the official React Router changelog labels 8.5.1 latest, Next.js App Router docs show 16.4.6, and TanStack Start docs label Start v1 stable. React's framework recommendation page still calls TanStack Start Beta. Treat Start's maturity label as source-page-dependent and verify the release documentation used by a project. [React Router changelog](https://reactrouter.com/changelog) [Next.js App Router](https://nextjs.org/docs/app) [TanStack Start](https://tanstack.com/start/latest/docs/framework/react/overview) [React framework guidance](https://react.dev/learn/creating-a-react-app)

## What is covered elsewhere

Detailed React Server Component semantics and React DOM rendering API signatures are in t07-010, t07-020, and t07-021. This lesson focuses on how frameworks compose those capabilities.
