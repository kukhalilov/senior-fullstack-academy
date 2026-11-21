# React Server Components directives resources and server functions — Exercises and worked solutions

## Goals

Place server and client modules deliberately, preserve supported data boundaries, reason about Server Functions as network calls, and review an RSC deployment for current security risks.

## Worked example

A product page needs database access and a collapsible description. Keep the page as a Server Component that loads and renders the product. Pass the resulting description JSX into a small Client Component that owns only the open/closed state. If saving the product is interactive, call a separate Server Function that validates the input, derives identity from server authentication, authorizes access to that product, applies an idempotent update, and returns a minimal result. The framework supplies the module splitting and transport. [Server Components](https://react.dev/reference/rsc/server-components) [Server Functions](https://react.dev/reference/rsc/server-functions)

## Exercises

Try each diagnosis before reading the hints and solutions.

1. **Shrink a client boundary.** A page fetches product data in a Client Component and imports a large Markdown parser and database SDK. Only the “expand description” control needs state. Redesign the tree so server-only dependencies stay off the client.
2. **Diagnose an import boundary.** `'use client'` appears after an import in `Editor.jsx`. A transitive utility imports `node:fs`. Explain both problems and repair them.
3. **Classify values.** Can these cross from a Server Component to a Client Component: `Date`, `Map<string, number>`, `Symbol.for('status')`, `Symbol('status')`, an ORM entity instance, a plain DTO, JSX children, an ordinary callback, a Server Function reference, a Promise of comments, and `FormData`?
4. **Handle ambiguous retry.** A client imports `saveOrder()` from a module-level `'use server'` file. It retries automatically after a timeout and assumes the first call did not reach the server. Identify the failure and add safeguards.
5. **Secure tenant-scoped mutation.** A form posts `{ tenantId, documentId, newTitle }`. The action validates only that the title is a string, then updates the supplied document in the supplied tenant. Design the authorization flow.
6. **Choose the directive.** A developer adds `'use server'` to `ProductPage` because it reads the database, and labels `onClick` as a Server Component concern. Correct the design.
7. **Review a current RSC advisory.** The app uses React 19.3.0; `package.json` does not directly list `react-server-dom-webpack`, and source has no `'use server'`. Is it safe from the October 2026 critical advisory? Explain how to check.
8. **Apply the React 19.3 Context change.** An older example creates Context in a `'use client'` file, exports `UserProvider`, and imports the wrapper in a Server Component. Explain the simplification and its limit.
9. **Minimize serialized data.** A Server Component passes an entire database user record to a Client Component that only displays `displayName`. The record also includes a reset token and internal flags. What should change?

## Progressive hints

1. Separate the server render/data loader from the stateful disclosure; JSX children can cross the boundary.
2. A directive must appear before imports; all transitive imports of a client-marked module join its client subtree.
3. Use React’s documented supported-value list, not JSON serializability. “Supported” and “safe to disclose” are different tests.
4. A timeout cannot prove the mutation did not commit. Consider duplicate delivery and idempotency.
5. Browser-submitted identifiers and roles are attacker-controlled. Authorization must include the actual record/tenant relationship.
6. There is no Server Component directive; `'use server'` marks async Server Functions.
7. Inspect the framework’s resolved and possibly bundled RSC packages. Direct dependencies and source searches are insufficient.
8. The Context object still must be created in a client-marked module.
9. Build a plain, minimal DTO with only the fields the UI needs.

## Complete solutions

1. Keep the page and database/parser imports in server-reachable modules. Render/sanitize the description on the server and pass its JSX as `children` to a small `'use client'` disclosure. The client wrapper owns the interaction; it does not import the database module. Validate untrusted markup independently.
2. Move `'use client'` to the top of the module. Trace transitive dependencies and move `node:fs` usage behind server-only modules; if shared formatting code is pure, split that from the filesystem helper. Add a narrow adapter instead of marking a broad page client-side.
3. React documents `Date`, supported `Map`, `Symbol.for`, plain objects with serializable fields, JSX elements, Server Function references, and Promises as supported props. A local `Symbol()`, arbitrary ORM class instance, ordinary callback, and `FormData` are not in that Server Component prop list. `FormData` is instead supported as a Server Function argument and form Action payload. The Promise can be read with React `use` under appropriate Suspense handling. Validate size and privacy even for supported values. [Serializable props](https://react.dev/reference/rsc/use-client) [Server Function arguments](https://react.dev/reference/rsc/use-server)
4. The first request may have committed even if its response was lost. Authenticate and authorize on the server, validate arguments, and use an idempotency key, unique constraint, or naturally idempotent operation so a retry does not create a second order. Handle ambiguous network failures explicitly.
5. Validate ID formats and title length; derive the principal from trusted server authentication; verify permission for the exact document and tenant; perform the update transactionally; and return only an allowed result. Do not treat a posted tenant/user ID or prior rendered page as proof of access.
6. Remove `'use server'` from the component. An unmarked component reached through the server render tree is a Server Component. Keep the database access there and move the button into a `'use client'` module. If it mutates server state, call a distinct async Server Function and secure it as an exposed endpoint.
7. Do not infer safety from the direct dependency list or absence of authored Server Functions. Identify the RSC framework/bundler; inspect the lockfile/resolved tree and bundled copies; follow its upgrade instructions; and verify the deployed artifact. The React advisory lists vulnerable RSC package ranges through 19.3.0 and fixed branches 19.0.9, 19.1.10, 19.2.9, and 19.3.1. Recheck current advisories before deploying because these version facts can change. [Current React advisory](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3)
8. React 19.3 allows a Server Component to import a Context created in a `'use client'` module and render it directly as `<Context value={...}>`. It still cannot call `createContext`; framework compatibility is required. Context is not a substitute for server authorization. [React 19.3 release](https://react.dev/blog/2026/09/09/react-19-3)
9. Construct an explicit plain DTO containing only `displayName` and necessary display fields. Never serialize reset tokens or authorization-only flags to the browser. Serialization support does not imply confidentiality.

## Tests and edge cases

Review an actual build for the database SDK in client chunks; try a local symbol and a class instance at the boundary; forge a record ID and tenant ID; replay a successful mutation after simulating a lost response; return an error containing a secret and verify it is not serialized; check framework-resolved RSC transport versions against the advisory; and build the React 19.3 Context pattern with the project’s exact framework version. Confirm security updates in the deployed artifact, not just the source lockfile.

## Reflection questions

- Which modules and dependencies ship to the browser, and why?
- What part of the render tree is produced before a Client Component receives its children?
- Which properties of a mutation make retry safe?
- How do you prove permission for a resource when the client supplies its identifier?
- Which exact framework and RSC transport package versions are in the deployed artifact?
