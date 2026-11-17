# React Server Components directives resources and server functions — Big-picture orientation and mental model

## Problem and purpose

Traditional client rendering sends component code to the browser, where components fetch data and produce UI. Server Components move eligible rendering and data access into a separate server or build environment. This can keep server-only libraries out of the client module graph and avoid client-side request waterfalls. Client Components provide state, event handlers, Effects, and browser API access. A framework or bundler coordinates the boundary and transports the rendered result. [React Server Components](https://react.dev/reference/rsc/server-components)

Server Functions let client code request an asynchronous server operation through a framework-generated reference. That call crosses a network boundary. The directive describes the function’s role; it does not validate arguments, authenticate a user, or authorize a mutation. [Server Functions](https://react.dev/reference/rsc/server-functions) [The `use server` directive](https://react.dev/reference/rsc/use-server)

## Plain-language mental model

Think of two related maps:

- The **module dependency tree** answers which source modules and dependencies are shipped to and evaluated by the client. `'use client'` marks a boundary in this tree, including its transitive imports.
- The **render tree** answers which component usages are rendered in which environment. A Client Component can receive already-rendered Server Component output as JSX children; a parent-child relationship alone does not move the child’s source module into the client bundle.

The server produces React’s transport representation for the component tree. A framework can use that representation to create initial HTML and later reconcile client modules, or to update the page during navigation. “Server Component” is an execution role, not a promise that the user sees no HTML or that the browser performs no rendering. [Client module boundaries](https://react.dev/reference/rsc/use-client)

### Concept map

```text
request or build input
        │
        ▼
Server Components ── data/filesystem/server-only packages
        │ rendered elements, values, and client references
        ▼
RSC-aware framework/bundler ── transport + optional initial HTML
        │
        ├── Client Component modules shipped to browser
        └── server-rendered UI reconciled with client interactivity
```

## How the parts fit together

| Need | Server Component | Client Component |
|---|---|---|
| Read server-side data or filesystem | Yes, in the server/build environment | No direct server-only access |
| Keep a heavy rendering dependency out of the browser bundle | Often | No; its transitive module subtree is client code |
| `useState`, event handlers, Effects, browser APIs | No | Yes |
| Async component with `await` during render | Supported | Async component functions are not supported on the client; pass a promise and read it with `use` where appropriate |
| Share values into a client subtree | Pass supported serializable props or JSX | Read props/context and manage interactive state |

Do not add `'use server'` to identify a Server Component. React has no Server Component directive: unmarked modules are rendered as Server Components when reached from a server-rendered tree. `'use server'` marks an async Server Function. [Server Components](https://react.dev/reference/rsc/server-components) [Server Functions](https://react.dev/reference/rsc/server-functions)

## End-to-end walkthrough

1. A request reaches an RSC-aware framework. A request-time Server Component reads product data with server-side credentials.
2. The server renders the product description and creates a small Client Component for the save control.
3. The framework sends initial HTML/React transport and the client module reference. The browser loads the interactive module; database code stays server-side.
4. On save, the Client Component calls a Server Function reference. The server validates submitted fields, derives the user from trusted authentication, checks access to the product, and applies an idempotent mutation.
5. The function returns a minimal supported value. The UI displays a safe result; logs retain diagnostics without exposing secrets.

## When to use it and tradeoffs

Prefer Server Components for server data access, static composition, and reducing client code. Use Client Components only where state, event handlers, Effects, or browser APIs are required. This can reduce browser work and client/server waterfalls, but moves work to the server and makes framework integration, serialization, caching, streaming, and security part of the design. RSC is not automatically faster and does not replace a framework’s data/cache model.

## What later lessons cover

The concepts lesson explains the two trees and supported value boundary. References enumerate execution, serialization, directives, security, and composition items. Practice traces boundary failures and a secure mutation. The interview lesson tests architecture reasoning and current React 19.3/security caveats.

## The security boundary

A Server Function reference is a remotely callable entry point. Treat its serialized arguments like a public HTTP request: validate shape and business rules, derive identity from trusted server authentication, authorize every operation and object, and make mutations safe against duplicate or concurrent requests. Do not expose secrets in return values, thrown errors, logs, or serialized arguments. A hidden button is not authorization.

RSC transport packages have had critical security advisories. On 2026-10-14, React disclosed a critical unauthenticated RCE advisory for RSC-capable frameworks and a separate high-severity denial-of-service advisory for Server Function endpoints. Both advisories cover the `react-server-dom-webpack`, `react-server-dom-parcel`, and `react-server-dom-turbopack` packages and list patched branch versions 19.0.9, 19.1.10, 19.2.9, and 19.3.1. Their impacts and applicability conditions differ: the RCE can affect RSC support even when the app defines no Server Function; the DoS advisory concerns crafted requests to Server Function endpoints. Check the framework’s actual dependency tree and follow the framework’s patch guidance. [RCE advisory](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3) [Server Function DoS advisory](https://github.com/react/react/security/advisories/GHSA-h3gv-c5rc-p453)

## React 19.3 update

React 19.3 allows a Server Component to import a Context object from a `'use client'` module and render that Context directly as a provider. React still does not let a Server Component create Context; the Context is created in the client-marked module. This removes a pass-through provider component in that specific pattern. Framework support still matters. [React 19.3 release](https://react.dev/blog/2026/09/09/react-19-3)

## Learning sequence

The concepts lesson builds the model from execution environments, module and render trees, serialization, and remote calls. The references list each inventory item and its boundary. Practice traces a request through a secure mutation and diagnoses failures. The interview lesson asks you to explain why RSC is more than “SSR,” where directives apply, what can cross each boundary, and how to handle the security update.
