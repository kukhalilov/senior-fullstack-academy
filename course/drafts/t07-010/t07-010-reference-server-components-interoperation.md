# React Server Components directives resources and server functions — Reference: Server and client interoperation

## Scope and version

This reference covers composition and the React 19.3 Context update. React describes the RSC integration as framework/bundler supplied. [Server Components](https://react.dev/reference/rsc/server-components) [React 19.3 release](https://react.dev/blog/2026/09/09/react-19-3)

## Supplied names explained

- `Passing Server Component output to a Client Component` — Pass an already-created JSX element, commonly as `children`, from a server parent. The client wrapper can conditionally show it; it does not execute/import the server module itself.
- `Passing a Server Function to a Client Component` — Pass a generated Server Function reference as a serializable prop. The client may invoke it, but the server must validate/authenticate/authorize every call.
- `Client context provider in a server-rendered tree` — Prior to React 19.3, a common pattern was to create Context in a `'use client'` module and export a client provider wrapper; a Server Component renders that wrapper with a value and children.
- `React 19.3 context imported from a use-client module rendered by a Server Component` — React 19.3 permits the Server Component to import the Context object from the client-marked module and render it directly as `<Context value={...}>`. The Context is still created in client code; the Server Component cannot call `createContext`.
- `Server Component composition` — Compose server-rendered data/content with client UI through props and JSX elements. Prefer this over marking an entire page client-side when only a small region needs interaction.
- `Client interactivity boundary placement` — Put the boundary around the smallest stateful/browser-dependent module subtree that meets the design. Every transitive dependency becomes client code.
- `Server Component data access` — Server Components can access server-side data sources directly in their environment, avoiding a client fetch/API hop for that render. Use framework-supported loading/caching and enforce access control at the data boundary.
- `Client Component state and event handling` — Use client modules for state, event handlers, Effects, and browser APIs. Their initial UI may still be server-rendered by the framework.
- `Client Component HTML in framework SSR` — Framework SSR can include HTML from Client Components in the initial page response; those modules still require client code for hydration/interactivity.
- `Server Component payload reconciled with client bundle` — The framework/bundler combines server-rendered output with references to client modules so the browser can render/hydrate the tree. The protocol is implementation detail and may change.

## How this group fits the mental model

Composition passes rendered JSX or supported references across the server/client boundary while keeping each module in its intended environment.

## Cross-item comparison

A Client Component may control when server-produced `children` appear; importing a Server Component from client code would instead make its dependency part of the client module graph. React 19.3 changes provider composition but not Context creation ownership.

## Examples

### Context composition

```jsx
// user-context.js
'use client';
import { createContext } from 'react';
export const UserContext = createContext(null);

// Layout.jsx — Server Component in React 19.3
import { UserContext } from './user-context';

export default async function Layout({ children }) {
  const user = await getCurrentUser();
  return <UserContext value={user}>{children}</UserContext>;
}
```

This direct `<UserContext>` provider form is the React 19.3 addition. In earlier React 19 releases, render an exported client provider wrapper around the Context. Client Components below it can read the value with `useContext` or `use`; do not interpret provider context as a replacement for server-side authorization. [React 19.3 context change](https://react.dev/blog/2026/09/09/react-19-3)

## Knowledge checks with answers

1. Can a Client Component receive server-produced JSX as children? **Yes.** The client wrapper does not execute the source module that produced it.
2. What changed in React 19.3 for Context? **A Server Component may import a Context from a `'use client'` module and render it directly.**
3. Does a Context value prove a user may mutate the resource? **No; server authorization must be checked for each operation.**

## Common mistakes

- Importing a Server Component inside a Client Component and expecting its code to execute on the server through that import.
- Passing an ordinary callback instead of JSX or a Server Function reference.
- Putting a huge root layout behind `'use client'` just to support one interactive control.
- Assuming Context values authorize requests; the server must independently check each operation.
- Assuming the 19.3 direct Context pattern is supported by an older React/framework combination.
