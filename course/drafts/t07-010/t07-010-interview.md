# React Server Components directives resources and server functions — Interview questions and reasoning

## Core questions

1. What problem do Server Components solve, and what do they not replace?
2. Compare a Server Component with server-side rendering.
3. What does `'use client'` mark: a component, module, or entire render subtree?
4. How can a Client Component show Server Component output as children?
5. Which values can cross the server-to-client boundary?
6. What happens when a Client Component calls a Server Function?
7. What is the difference between a Server Function and a Server Action?
8. Why should Server Functions generally be mutations rather than data-loading APIs?
9. How do you secure a Server Function that updates a record?
10. What is stable about RSC in React 19, and what remains unstable?
11. What changed for Context in React 19.3?
12. How should a team respond to an RSC transport security advisory?

## Concise interview answers

1. Server Components run in a separate build/request server environment, can access server data, and keep server-only modules out of the client subtree. They do not replace client state/events or define a framework’s routing/cache/deployment behavior.
2. Server Components are an execution/module architecture. SSR produces initial HTML. Frameworks can use both; Client Components can still contribute SSR HTML.
3. It marks a module boundary and its transitive dependencies in the module graph. A component usage is client-rendered when defined/reached through that client subtree. It is not simply a directive on one JSX node.
4. A server parent creates the JSX and passes the element as a serializable prop such as `children`. The client wrapper controls display but does not import/call the server component implementation.
5. React documents primitives, global symbols, supported iterables, Date, FormData, plain objects with serializable properties, Server Functions, JSX elements, and Promises for Server Component props. Ordinary callbacks, arbitrary class instances, and local symbols are unsupported.
6. It sends a network request with serialized arguments through framework-generated references; server work runs asynchronously and a serializable result/error returns. It is not local RPC magically secured by React.
7. Server Function is the general term. It is a Server Action when used as an Action prop or called inside an Action.
8. React describes Server Functions as mutation-oriented; frameworks commonly process actions sequentially and do not cache their results. Use the framework’s server data-loading/caching path for reads.
9. Validate unknown input, authenticate from server state, authorize the user against the exact record/tenant, mutate transactionally where needed, make retries safe, limit work, and return a minimal allowed result.
10. React documents user-facing semantics as stable across React 19 minors; lower-level APIs used by bundlers/frameworks to implement RSC are not semver-stable.
11. React 19.3 permits a Server Component to render a Context imported from a `'use client'` module directly. The server component still cannot create the Context; the definition remains client-marked. [React 19.3 release](https://react.dev/blog/2026/09/09/react-19-3)
12. Inspect the actual framework and resolved/bundled `react-server-dom-*` versions, upgrade according to the framework’s supported instructions, verify the deployed artifact, and recheck current advisories. Absence of an app-authored Server Function is not sufficient to rule out RSC transport exposure. [Current React advisory](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3)

## Deep follow-up answers

### Why can a single module produce both Server and Client Component usages?

The role is assigned to a component usage based on its import/render path. A module with no client directive can be reached from a server branch and separately imported beneath a client-marked module. One usage runs on the server, another may be part of the client bundle. This is why “component definition” and “component usage” should not be conflated.

### Is a Server Function endpoint safe because its name is generated?

No. The browser can invoke exposed references and forge all arguments. Generated identifiers are routing machinery, not authorization. Validate and authorize every invocation, and rely on the framework for transport security only after keeping its implementation packages current.

### How do you decide whether code should be server or client?

Keep data access, static rendering, and server-only dependencies in Server Components. Move only stateful/browser-dependent UI into Client Components. Compose rendered server output into client wrappers through JSX children. Evaluate bundle cost and server request cost rather than treating either environment as universally faster.

### What should be returned from a Server Function?

Only supported serializable data needed by the client. A successful serialization does not establish confidentiality: return a narrow DTO, not a secret-bearing database entity. Handle errors with safe messages and retain diagnostic detail server-side.

## Scenario questions

- A developer uses `window.localStorage` during render in a module shared by server and client paths. Identify the environment violation and a safer client-only access point.
- A nested Client Component receives `children` from an async Server Component. Explain why the server data fetch does not move into the browser bundle.
- The same mutation succeeds twice after one client timeout. Explain why and propose idempotency behavior.
- A security scan reports a vulnerable RSC transport package hidden under a framework dependency. Explain why checking only direct `package.json` dependencies misses it.
- A developer says `'use server'` marks server-rendered components. Correct the terminology.

## Tradeoffs and alternatives

- Server Components reduce client module inclusion and can access server data directly; ordinary client data fetching remains useful when data is user-interaction-driven or a shared client cache is the intended abstraction.
- A narrow Client Component preserves local interactivity without moving a whole page and its dependencies into the client graph.
- Server Functions make user mutations convenient and progressive-enhancement-friendly; an explicit HTTP API may be more appropriate for non-React clients, public integration contracts, or independently versioned services.
- Framework abstractions hide RSC transport details; implementing a bundler/framework directly requires pinning the unstable integration APIs and responding to transport advisories.

## Common weak answers

- “Server Components are just SSR.” This misses module graph, render environment, and transport distinctions.
- “Everything under a Client Component must be client code.” JSX children can be produced by a server parent; module imports determine client dependencies.
- “The function cannot be called because the button is hidden.” The exposed Server Function is a server entry point.
- “The server already rendered the user ID, so it is trusted.” Client arguments can be forged.
- “React 19 is stable, so all RSC APIs are stable.” React explicitly distinguishes public semantics from framework implementation APIs.
- “No `use server` source means no RSC risk.” Vulnerable transports can affect RSC support itself.

## Sources

Current RSC semantics and directive behavior are documented in the [React Server Components](https://react.dev/reference/rsc/server-components), [Server Functions](https://react.dev/reference/rsc/server-functions), and [`use server`](https://react.dev/reference/rsc/use-server) references. The current transport security snapshot is in the [React security advisory](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3).

## Self-check rubric

You are ready when you can draw both module and render trees, explain the serialization boundary, trace a Server Function call as an RPC, produce a secure mutation checklist, and distinguish the public React contract from framework/security update responsibilities.
