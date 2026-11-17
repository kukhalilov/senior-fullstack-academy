# React Server Components directives resources and server functions — Reference: Client module boundaries and serialization

## Scope and version

React 19.3 documentation defines the module boundary, render behavior, and supported serialized prop values described here. Use framework tooling to validate the actual RSC integration. [The `'use client'` directive](https://react.dev/reference/rsc/use-client)

## Supplied names explained

- `'use client'` — String directive at the top of a module that marks it and its transitive dependencies as client code in an RSC-aware build.
- `'use client' directive placement` — Place it before imports and executable code at the very beginning of the file; comments may precede it. It is ignored as a boundary when the module is already imported only within client code.
- `Client module boundary` — The point at which the bundler switches from server-evaluated modules to client-evaluated modules and creates client references. It is about module imports, not simply parent/child JSX nesting.
- `Transitive client module dependency` — An imported dependency beneath a client-marked module is part of the client subtree even if that dependency has no directive itself. Server-only packages must not leak into this graph.
- `Server-to-client component boundary` — The serialization/reference boundary through which a Server Component provides supported props or rendered elements to a Client Component. Treat it as a real transport boundary.
- `Serializable props across the boundary` — Values must be representable by the React/framework RSC transport. Nested values also need to be supported; TypeScript types do not enforce runtime serializability.
- `Supported serializable value` — For Server Component props to Client Components, React documents primitives, globally registered symbols, serializable iterables, Date, plain objects, Server Functions, JSX elements, and Promises. `FormData` is documented for Server Function arguments, not in this prop list. Verify framework support and do not rely on private transport behavior.
- `Primitive serializable props` — `string`, `number`, `bigint`, `boolean`, `undefined`, and `null` are supported values; validate their business meaning separately.
- `Global Symbol.for serializable value` — A symbol created through the global symbol registry can cross this boundary. A local `Symbol()` cannot because the receiving environment has no shared identity for it.
- `Array Map Set and iterable props` — Arrays, Maps, Sets, and strings/iterables of supported values are listed as serializable. Their contained values still must satisfy the transport rules.
- `TypedArray and ArrayBuffer props` — Typed arrays and ArrayBuffer are supported binary-value shapes. Large payloads still have bandwidth and memory costs.
- `Date and Promise props` — These values are supported in Server Component props to Client Components. A Promise can be passed and read with React `use` under Suspense. `FormData` has a different role: React documents it as a Server Function argument and a form Action payload, not as a value in the Server Component prop list.
- `Plain object props` — Object literals with serializable properties are supported. Avoid class instances, custom prototypes, and objects with null prototypes.
- `JSX element props across boundary` — Client or Server Component elements can cross as JSX. This enables a client wrapper to control when server-rendered children appear without importing the server component source.
- `Server Function prop` — A framework-generated reference to an async server function is serializable. It represents a remote call, not a copied closure.
- `Unsupported class instance props` — Arbitrary class instances and objects with custom/null prototypes are not supported by the documented serializable prop set; pass a plain DTO instead.
- `Unsupported local symbol props` — `Symbol('x')` is not supported; only symbols registered with `Symbol.for` are documented.
- `Unsupported ordinary function prop` — Ordinary closures/functions cannot cross as data. Special cases are references exported by client-marked modules or Server Functions, subject to integration semantics.
- `Server Component rendered as a Client Component child` — A server parent can create JSX and pass it as `children` to a Client Component. The client wrapper receives the rendered element; it does not import/call the server source module.
- `Module shared by server and client usage` — A module without a client boundary can be evaluated in either environment depending on its import path. Avoid top-level browser-only or secret-bearing behavior in code that may be shared.
- `Browser-only API in a Client Component` — `window`, DOM, storage, media, and device APIs require client execution and often must be accessed after mount or inside an event/effect to avoid SSR assumptions.
- `Client Component can be server-rendered to HTML` — Framework SSR may emit initial markup for a Client Component; it still hydrates/runs in the client and is not thereby a Server Component.

## How this group fits the mental model

These names define what code enters the browser module graph and what values can cross from server-produced output into client code.

## Cross-item comparison

Compare the module boundary with the render boundary: imports determine client code, while parent/child JSX does not necessarily determine where the child was produced. Serializable values are a separate transport rule.

## Examples

```jsx
// Server Component
import Toggle from './Toggle';
export default async function Page() {
  const item = await loadItem();
  return <Toggle><article>{item.description}</article></Toggle>;
}

// Toggle.jsx
'use client';
import { useState } from 'react';
export default function Toggle({ children }) {
  const [open, setOpen] = useState(false);
  return <><button onClick={() => setOpen(value => !value)}>Toggle</button>{open && children}</>;
}
```

`loadItem` and server-only dependencies stay in the server module; `Toggle` receives rendered JSX.

## Placement strategy

```text
Server page (fetches data, imports database)
├── static/server-rendered content
└── 'use client' interactive shell
    ├── React state and events
    └── server-produced JSX children
```

Mark the smallest module that needs client capabilities. A boundary in a low-level utility can unexpectedly pull a large dependency subtree into the browser. For an unadapted library that uses client Hooks, add a small client wrapper instead of marking the whole page client-side. [Third-party library guidance](https://react.dev/reference/rsc/use-client)

## Knowledge checks with answers

1. What code becomes client code after a boundary? **The marked module and its transitive dependencies.**
2. Can a local `Symbol()` cross as a supported prop? **No; only globally registered symbols are documented.**
3. Can a Client Component receive server-produced `children`? **Yes, as JSX output passed by a server parent.**
4. Does a supported `Date` prop imply the data is safe to disclose? **No; serialization and confidentiality are separate concerns.**
5. Is `FormData` listed among Server Component props passed to Client Components? **No; it is supported as a Server Function argument instead.**

## Common mistakes

- Putting `'use client'` below imports, where it is not a directive.
- Believing all descendants in JSX become client modules when nested under a Client Component.
- Passing an event handler closure as a normal prop to a Client Component.
- Treating `Date` or a Server Function as trusted data merely because React can serialize it, or assuming `FormData` is part of the Server Component prop set.
- Passing an ORM model instance or class DTO instead of a plain transport object.
- Widening the client boundary until server-only imports enter the client build.
