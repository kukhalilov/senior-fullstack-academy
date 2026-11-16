# React routing frameworks data loading server components and deployment — Reference: Framework ecosystem and routing modes

## Scope and version

This compares the supplied ecosystem items using official React 19.3, Next.js 16.4.6, React Router 8.5.1, and TanStack v1 docs checked 2026-11-16. Framework modes and beta labels change; qualify these comparisons by their current docs. [React framework guidance](https://react.dev/learn/creating-a-react-app) [React Router modes](https://reactrouter.com/start/modes)

## How this group fits the mental model

Choose the level of application architecture you want the tool to own: URL matching only, client data routing, or a full-stack system that coordinates data, rendering, builds, and deployment.

## Supplied names explained

- `Next.js App Router` is a full-stack React framework using the `app/` file-system route convention and React Server Components by default for pages/layouts. It supports static and server route rendering, streaming, metadata, route handlers, and framework caching. Current major docs are Next.js 16; exact defaults depend on Cache Components configuration.
- `React Router Framework Mode` combines Vite, route modules, loaders/actions, rendering strategies, and deployment adapters. Its conventions include route config and `.server`/`.client` boundaries. Use this when the framework should supply build/render/deploy structure.
- `React Router Data Mode` uses data routers and route objects with loaders, actions, pending states, and error handling while the application owns more setup than Framework Mode.
- `React Router Declarative Mode` maps URLs to route elements with `<Routes>`/`<Route>` without the loader/action data-router lifecycle. It is suited to simpler client routing or incremental integration.
- `TanStack Router` is a router for React/Solid with type-safe navigation/search params, nested routes, loaders, and route prefetching. It is not by itself the full-stack Start framework.
- `TanStack Start (Beta)` is listed as Beta on React's framework recommendation page, while TanStack's own current Start v1 docs call it stable. It is a full-stack framework on TanStack Router with SSR, streaming, server functions, and Vite/Rsbuild deployment support. State which source/version label is meant; the official pages disagree on maturity wording as of this snapshot. [React guide](https://react.dev/learn/creating-a-react-app) [Start docs](https://tanstack.com/start/latest/docs/framework/react/overview)
- `Vite as a build tool rather than a full-stack framework` means Vite transforms and serves assets/modules but does not itself prescribe route matching, loaders/actions, cache policy, or deployment architecture. It can power React Router Framework Mode or a custom/client app.
- `File-based routing` derives route structure from files and naming conventions; Next App Router and React Router Framework Mode support this style.
- `Code-based routing` declares route matching in configuration/code; common in React Router Data/Declarative modes and TanStack Router, with generated route trees also possible.
- `Nested routes` compose parent layouts with child route content. The parent usually renders an outlet/slot where the matched child appears.
- `Layout routes` provide shared UI and behavior around child routes, sometimes without adding a URL segment.
- `Route module` is a framework route file that can export UI and route-level data, mutation, metadata, or headers. The exact export contract is framework-specific.
- `Route loader` reads data for a matched route before/during rendering or navigation according to the router's mode.
- `Route action` handles a route mutation, commonly submitted through a framework/router form or fetcher.
- `Deployment adapter` connects framework build output/request handler to a host runtime's entry point, asset format, and platform constraints.

## Cross-item comparison

`React Router Declarative Mode` covers UI routing; `React Router Data Mode` adds data lifecycle; `React Router Framework Mode` adds route-module/build/render/deploy conventions. `TanStack Router` is the routing layer, while `TanStack Start` supplies full-stack capabilities. `Next.js App Router` is a file-based full-stack framework. `Vite` is a build tool and can underlie multiple architectures.

## Examples

```text
Need only client navigation?       Declarative router or client SPA
Need route loaders/actions?        Data Mode or framework route modules
Need integrated SSR/server routes? Framework Mode, Next App Router, or TanStack Start
Need no server at launch?          Any choice that supports CSR/SSG and static hosting
```

## Common mistakes

- Comparing products without comparing their modes and rendering choices.
- Assuming a framework always implies server deployment.
- Calling Vite a full-stack router/data framework.
- Treating TanStack Router and TanStack Start as the same product.
- Repeating the TanStack Start Beta label without noting the current official documentation conflict.
- Assuming file-based routes and code route configs have identical nesting/loader semantics.

## Knowledge checks with answers

1. Which React Router mode owns the most integrated build/deployment conventions? Framework Mode.
2. Is Vite alone a route/data framework? No; it is a build tool.
3. Does TanStack Router imply TanStack Start? No; Start adds full-stack features.
4. Must a full-stack React framework deploy a server? No; supported CSR/SPA/SSG output can deploy statically.

## Sources

- [Creating a React App](https://react.dev/learn/creating-a-react-app)
- [React Router modes](https://reactrouter.com/start/modes)
- [React Router framework routing](https://reactrouter.com/start/framework/routing)
- [TanStack Router overview](https://tanstack.com/router/latest/docs/overview)
- [TanStack Start overview](https://tanstack.com/start/latest/docs/framework/react/overview)
