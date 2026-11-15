# React Server Components directives resources and server functions — Core concepts and how they fit together

## Learning objectives

By the end, explain the server/build render environment; distinguish module boundaries from render-tree composition and ordinary SSR; place `'use client'`; decide which props may cross into a Client Component; describe the network and serialization behavior of a Server Function; secure a mutation; and identify the React integration/security stability caveats current in React 19.3.

## Prerequisites

Know basic React components, JSX, module imports, async/await, and that browser/server code execute in different runtimes. A framework or bundler must support RSC for these directive semantics.

## Core concepts

### 1. Two execution environments and two trees

React Server Components render in an environment separate from the client application or SSR server. They may run at build time, such as when producing static content, or at request time on a web server. They can use server-side data access and dependencies that should not enter the browser bundle. An async Server Component can `await` data during render. The component does not persist on the client and cannot own client state or register browser event handlers. [Server Components](https://react.dev/reference/rsc/server-components)

The vocabulary is easiest to understand when you keep **definitions**, **module imports**, and **component usages** separate:

1. A component definition is a function or other component value in a module.
2. The module dependency tree determines which modules are evaluated and included on the client. `'use client'` at the very beginning of a module marks that module and transitive dependencies as client code.
3. A component usage belongs to the server or client render tree according to how it is reached. A definition without `'use client'` can be used once as a Server Component and elsewhere as a Client Component if it is imported into a client-marked subtree.

This explains two common surprises. First, “Server Component” does not mean “HTML never exists”; a framework can also server-render Client Components for the initial page. Second, a Client Component can accept `children` that were produced by a Server Component. The client component controls whether to show that already-produced output, but it does not import and execute the server component’s source. [The `'use client'` reference](https://react.dev/reference/rsc/use-client)

### Build-time versus request-time work

Build-time rendering is appropriate for content that can be read and rendered during a build; the result can be deployed as static output. Request-time rendering can use request-specific data and a live data layer. Neither mode automatically defines cache behavior, invalidation, or authorization. Those are framework/application concerns and are outside React’s generic RSC semantics.

Server rendering is not free: request-time database calls add server latency and load; a slow awaited dependency delays the dependent UI. Start independent promises early and place Suspense boundaries around lower-priority work when the framework’s streaming integration supports it. Do not assume that making a component `async` automatically parallelizes nested data access.

### 2. The RSC transport and HTML are related outputs

React’s server renderer and the framework/bundler exchange a representation of the component tree and references to client modules. The framework can turn that representation into initial HTML and can use it during client navigation or updates. The browser downloads and evaluates Client Component modules; it does not receive the implementation of a Server Component simply because its output is rendered inside a Client Component.

Keep these terms distinct:

- **RSC payload/transport representation:** data that lets the React-aware client understand the server-rendered tree, client-module references, and boundary props. The exact wire format is an implementation detail, not an application API to handcraft.
- **HTML:** a browser-readable initial document that a framework may produce from the tree.
- **Hydration/reconciliation:** client-side work that attaches behavior and coordinates client modules with server output. Frameworks manage the exact protocol.

Never write a hand-rolled parser for the internal RSC wire protocol or depend on private `react-server-dom-*` implementation APIs unless you are implementing a framework and pinning versions as React instructs. [React’s stability note](https://react.dev/reference/rsc/server-components)

### 3. Client module boundaries

Put `'use client'` at the start of a module (comments may precede it; imports and executable code may not). Use it for state, event handlers, browser APIs, and libraries that require client-only Hooks. The directive is not needed on every child component: one boundary makes the imported subtree client code. Keep the boundary as narrow as the design permits because every transitive dependency may add browser JavaScript.

Not every component that lacks a directive is guaranteed to run only on the server. A library-agnostic component can be evaluated on both sides depending on its import/usage paths. Conversely, a Client Component in a framework may contribute HTML to the initial response and still hydrate for interaction. Avoid browser globals at module initialization if a module might run in a server rendering path.

Server Components cannot use most Hooks. React’s RSC docs call out `use` and `useId` as exceptions among the `react`/`react-dom` Hooks; `createContext`, `forwardRef`, `memo`, and client APIs require client execution when used by a library. A library lacking client boundaries may need a small Client Component adapter. [Using client APIs and libraries](https://react.dev/reference/rsc/use-client)

### 4. Values crossing the boundary

Props from a Server Component to a Client Component must be supported by the RSC serializer. React 19 docs list primitives (`string`, `number`, `bigint`, `boolean`, `undefined`, `null`), globally registered symbols (`Symbol.for`), serializable iterables (`Array`, `Map`, `Set`, typed arrays, `ArrayBuffer`), `Date`, `FormData`, plain objects with serializable properties, Server Functions, JSX elements, and Promises. Nested values must themselves be serializable.

Do not pass ordinary closures, event objects, arbitrary class instances, objects with null prototypes, or local symbols. A Server Function is a special framework reference, not a serialized copy of its closure. A Date is supported but still needs correct timezone/business interpretation. A Promise can be passed and read by a Client Component with React `use`; this is not a license to serialize arbitrary live resources. React and the framework must agree on the supported transport. [Serializable props](https://react.dev/reference/rsc/use-client)

## Worked examples

Composition is often better than moving an entire tree to the client:

```jsx
// Server Component: fetch and render the expensive/static content here.
export default async function Page() {
  const item = await loadItem();
  return <Disclosure><article>{item.description}</article></Disclosure>;
}

// Disclosure.js
'use client';
import { useState } from 'react';
export function Disclosure({ children }) {
  const [open, setOpen] = useState(false);
  return <section><button onClick={() => setOpen(value => !value)}>Toggle</button>
    {open && children}</section>;
}
```

The server component produces `children`; the client wrapper receives the JSX as a supported element prop. The client wrapper does not call `loadItem` or import a server-only database module.

### 5. Server Functions are remote calls

`'use server'` marks an asynchronous function as callable through a framework/bundler integration. A client call sends serialized arguments in a network request; a returned value is serialized back. The function may be passed as a prop from a Server Component. To import it from client code, React docs require a module-level `'use server'` directive so the framework can create references to exported functions. A function-level directive is useful for a function defined inside a Server Component, but it is not a directly importable client module export. There is no Server Component `'use server'` marker. [Server Functions](https://react.dev/reference/rsc/server-functions) [`'use server'`](https://react.dev/reference/rsc/use-server)

React says Server Functions are designed primarily for mutations, not reads/data fetching: implementations commonly process actions one at a time and do not provide cached return values. Use the framework’s documented data-loading/cache mechanism for reads. Pass calls through an Action/Transition; form `action` integration automatically uses a Transition. With `useActionState`, the function receives previous state before `FormData`. Full form props and `useFormStatus` are covered in the React DOM forms lesson.

The function call is asynchronous even when it looks like a local import. Handle network failure, validation errors, pending state, duplicate submission, and retry semantics. A retry can repeat the mutation; use idempotency or deduplication where the operation requires it.

### 6. Security at the remote boundary

Every Server Function is an exposed server entry point, not a private function just because its reference is obscure or generated. The browser controls arguments. For each call:

1. Parse and validate shape, length, enums, and cross-field rules.
2. Derive the principal from trusted server authentication; never accept a user ID as proof of identity.
3. Authorize the operation and the specific resource on the server, including tenant ownership and current state.
4. Protect against CSRF according to framework and deployment behavior; do not assume a React directive supplies CSRF defenses.
5. Apply rate/resource limits, safe transaction semantics, and idempotency for retryable mutations.
6. Return only data the caller is allowed to see; avoid leaking secrets through error strings or serialized objects.

This app-level discipline does not replace prompt framework/runtime security updates. React’s October 2026 advisory affected RSC transport packages through 19.3.0 and lists patched releases by maintained branch. Frameworks can bundle or constrain those packages, so inspect the resolved dependency graph and use the framework’s upgrade instructions. Earlier React advisories also documented RCE, DoS, and source exposure in RSC transports; do not infer that a currently patched build is permanently safe. [Current React advisory](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3) [Earlier advisory summary](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components)

### 7. Stability and React 19.3

React documents public Server Components and Server Functions behavior as stable across React 19 minor releases. The lower-level APIs used by frameworks and bundlers to implement RSC do not follow semver and may break across those minors. Framework authors should pin React or use the recommended Canary strategy; app developers should use a framework-supported version combination rather than importing private transport APIs.

React 19.3 adds direct rendering of a Context imported from a `'use client'` module by a Server Component. The Context itself is still created in client-marked code; the Server Component can render it with a value and children. This is a React 19.3 change, not a general rule that Server Components can call `createContext`. [React 19.3 release notes](https://react.dev/blog/2026/09/09/react-19-3)

## Mechanisms and relationships

| Mechanism | Boundary it solves | What it does not solve |
|---|---|---|
| Server Component render | Runs component logic/data access in a build/request server environment | Client interactivity, cache policy, or access control by itself |
| `'use client'` | Marks a client module subtree for interactivity/browser features | Does not turn server-produced child JSX into client-imported source |
| RSC serialization | Carries supported values/elements/references across environments | Does not make data private, validate it, or allow arbitrary objects |
| Server Function reference | Lets client initiate a supported async server call | Does not authenticate, authorize, prevent duplicate requests, or guarantee success |
| Framework/bundler | Implements module splitting, references, and transport | Its private RSC APIs are not React’s stable application-level API |

Use the module dependency tree to reason about shipped code, the render tree to reason about where each usage runs, and the network boundary to reason about Server Function security.

## Decision guide

| If the code needs… | Boundary choice | Why |
|---|---|---|
| Database/filesystem access for rendered content | Server Component | Keeps data access and dependencies on server/build side |
| Browser state, Effects, or event handlers | Client Component | These APIs require client execution |
| Server data plus local toggle UI | Server parent + small Client wrapper | Pass rendered JSX as children instead of sending server logic to client |
| A mutation initiated by a user | Server Function via framework | It is an RPC/action boundary; validate, authorize, and handle retries |
| RSC framework internals | Framework/bundler implementation | Private wire APIs are not stable app-level contracts |

## Misconceptions and edge cases

- An unmarked component is not guaranteed to execute only once or only on the server; different usages can follow different import paths.
- A Client Component can contribute HTML to initial framework SSR and still need client JavaScript for interactivity.
- A supported serializable value can still leak a secret or be attacker-controlled.
- A framework-generated Server Function reference is not an authorization credential.
- A Promise passed to a Client Component can suspend; it does not make the client component an async component.
- React 19.3 lets a Server Component render an imported Context; it still cannot create Context there.
- Stable public semantics do not mean private framework/bundler protocols are semver-stable or free of vulnerabilities.

## Knowledge checks with answers

1. Does `'use server'` declare a Server Component? **No.** It marks Server Functions.
2. Does a Client Component always mean no initial server-rendered HTML? **No.** Framework SSR may emit initial HTML for Client Components.
3. If a Client Component receives JSX from a Server Component, does it execute the server component’s module? **No.** It receives the already-rendered element output through the integration.
4. Is a Server Function a local function call? **No.** It is a serialized network request through framework machinery.
5. Does React’s public-feature stability make framework RSC internals semver-stable? **No.** React distinguishes the public semantics from implementation APIs.
6. Does a RSC-enabled app need to inspect transport dependencies if it defines no Server Function? **Yes.** Current React advisories can apply to RSC support itself.
