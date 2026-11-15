# React Server Components directives resources and server functions — Reference: Server Component execution model

## Scope and version

This reference covers the supplied server-render execution concepts. React’s public RSC behavior is documented as stable for React 19; the framework/bundler integration APIs remain unstable across minor releases. [React Server Components](https://react.dev/reference/rsc/server-components)

## Supplied names explained

- `React Server Component` — A component usage rendered in a separate server/build environment. Its implementation does not become browser code merely because its rendered output is composed near a Client Component.
- `Server Component` — A usage rendered on the server side of the RSC boundary. It can read server-side data and await during render; it does not persist as an interactive component instance in the browser.
- `Client Component` — A usage in the client module subtree, able to use state, event handlers, Effects, and browser APIs. A framework can still render its initial markup to HTML.
- `Server Component render environment` — The separate environment where RSC rendering executes; it can be a CI/build process or a request-time web server, depending on the application architecture.
- `Build-time Server Component rendering` — Rendering during a build, useful for static data/content. Request-specific identity and data are unavailable unless explicitly supplied by the build environment.
- `Request-time Server Component rendering` — Rendering on a server for a page request or update, allowing request-aware data access. It adds server workload and requires deliberate caching/authorization policy from the framework and application.
- `Async Server Component` — An async component function supported in Server Component rendering. Awaited dependencies suspend that render until available; nested dependencies are not automatically parallel.
- `await during Server Component render` — Starts/awaits asynchronous work as part of rendering. Await critical data; start independent lower-priority promises early and use supported Suspense integration to avoid blocking unrelated UI.
- `React Server Component Payload (RSC Payload)` — Informal name for React’s server-rendered transport representation used by an RSC-aware integration to describe rendered output and client references. The wire format is an implementation detail; do not parse or handcraft it in app code.
- `Server Component output versus final HTML` — Server-rendered component output is not synonymous with a complete HTML document. A framework may combine RSC output with HTML for the initial response and client module loading.
- `Server-only dependency` — A package that can access server resources or should remain out of browser code. Keep it in modules only reachable on the server side; do not re-export it through a client-marked module.
- `Server Component versus server-side rendering` — RSC is a component execution/module-boundary model; SSR means producing HTML on a server. They can be combined, and Client Components may participate in SSR.
- `Server Component limitations on client Hooks` — Server Components cannot own client state or run Effects/event handlers. React’s `'use client'` reference identifies `use` and `useId` as exceptions among React Hooks, while libraries using `createContext`, other Hooks, `forwardRef`, `memo`, `startTransition`, or browser APIs need client execution.
- `Component definition versus component usage` — The definition is source code; a usage is an instance in a render tree. React classifies Server/Client Components by usage and import path, so one definition may be used in both environments.
- `Module dependency tree versus render tree` — The module tree determines client bundling/evaluation; the render tree describes nested UI. `'use client'` acts on the module graph, while a Client Component can receive a Server Component’s rendered JSX as `children`.

## How this group fits the mental model

These names describe where component usages execute, when rendering happens, and why the module graph is distinct from HTML output.

## Cross-item comparison

A Server Component is an execution role; SSR is a way to emit initial HTML. A component definition can be used in either environment, but an individual usage follows its import/render path.

## Examples

### Request-time server data and a client island

```jsx
import Toggle from './Toggle'; // Client Component

export default async function ProductPage({ id }) {
  const product = await database.products.get(id);
  return <Toggle><article>{product.description}</article></Toggle>;
}
```

The server component reads data and creates the description element. `Toggle` can open/close that supplied element in the browser. Do not import `database` into `Toggle`; that would move the dependency into a client-marked subtree or violate the framework’s boundary checks.

## Knowledge checks with answers

1. Can a Server Component run at build time? **Yes.** It can also run at request time when the framework is configured for that model.
2. Is RSC the same as SSR? **No.** RSC defines an execution/module architecture; SSR emits initial HTML and can be combined with RSC.
3. Does a Client Component child necessarily cause a Server Component’s source to ship to the browser? **No.** A server parent can pass its rendered JSX as a prop.

## Common mistakes

- Calling every server-rendered component a Server Component; Client Components can have initial HTML.
- Assuming a parent’s client status changes how its already-composed `children` were produced.
- Assuming the RSC transport format is a stable JSON API.
- Assuming build-time rendering can safely read request-specific user state.
- Awaiting a chain of independent data sources serially and creating avoidable latency.
- Importing a server-only package through a client module’s transitive dependency graph.

## Quick check

If the same function component is imported directly by a Server Component in one place and by a `'use client'` module in another, the definition can be evaluated in both environments; the two usages have different execution roles.
