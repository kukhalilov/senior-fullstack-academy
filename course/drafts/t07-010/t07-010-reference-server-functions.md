# React Server Components directives resources and server functions — Reference: Server Function semantics and directives

## Scope and version

This covers React’s generic Server Function semantics, not the action prop signatures, `useActionState`, or `useFormStatus` in detail. Frameworks supply the transport and deployment integration. [Server Functions](https://react.dev/reference/rsc/server-functions) [`'use server'`](https://react.dev/reference/rsc/use-server)

## Supplied names explained

- `Server Function` — An async function marked for server execution and exposed through a framework/bundler reference. A client call makes a network request and serializes values.
- `Server Action (older name for a Server Function used as an Action)` — React renamed the general concept to Server Function. “Server Action” remains apt when the function is passed to an Action prop or called from an Action; not every Server Function is an Action.
- `'use server'` — Directive that marks async functions as callable from client-side code through RSC integration. It does not mark a component as a Server Component.
- `Function-level 'use server' directive` — Put it at the beginning of an async function body, before other statements. It is useful for a function defined inside a Server Component and passed as a prop.
- `Module-level 'use server' directive` — Put it at the beginning of a server-side module to mark its exports as Server Functions. React requires this form when client code imports those exports.
- `'use server' requires async function` — Network invocation is asynchronous; marked functions must be `async`. A directive does not turn a synchronous utility into safe server RPC.
- `Module-level directive exports callable from client` — A client import is transformed by the framework into a reference, not bundled server implementation code. Confirm the framework supports the import pattern.
- `Function-level directive cannot be directly imported from client` — A nested/function-level function is not a client-importable module export. Pass it as a supported Server Function prop from a Server Component or export it from a module marked at module level.
- `Async Server Function` — Function whose server work returns through the asynchronous request/response boundary. Handle rejected calls and do not assume local-call latency or semantics.
- `Server Function reference` — Opaque integration-generated value identifying the server entry point. It is not a security secret or authorization token; clients can invoke exposed endpoints.
- `Server Function call from a Client Component` — Starts a network request, sends serialized arguments, runs the function on the server, and serializes a supported return value back.
- `Serialized arguments` — React documents primitives, supported iterables, Date, FormData, plain objects, Server Functions, and Promises among supported values; ordinary functions, class instances, and local symbols are excluded. All values remain attacker-controlled when sent by a client.
- `Serialized return value` — Must satisfy the supported serialization rules. Return minimal DTOs; do not return secrets, database entities with sensitive fields, or raw internal errors.
- `Server Function serializable argument types` — The documented set includes strings, numbers, bigint, booleans, undefined/null, globally registered symbols, supported iterables, Date, FormData, plain objects, Server Function references, and Promises. Confirm framework-specific limits.
- `Server Function supported return value types` — React documents return values using the serializable-props set. A fulfilled Promise can produce a value; failures are handled through the integration’s error path.
- `Server Function as a form action` — A Server Function passed to a form action receives submitted FormData first and can progressively enhance the form. React invokes form Actions in a Transition; form-specific APIs are detailed in the React DOM forms lesson.
- `Progressive enhancement of form Server Function` — Forms can submit before the client bundle loads when integrated using React’s form Action pattern; after hydration, the framework handles the client/server call. Framework routing and deployment must support it.
- `Server Function inside a Transition` — React recommends calling Server Functions in a Transition. Form action integration does this automatically; outside a form, wrap the call in a Transition for pending/update semantics.
- `Server Function useActionState argument order` — When connected through `useActionState`, the function receives previous state first, then the action payload (for a form, FormData). This differs from a plain form action’s first-argument shape.

## Boundary sequence

```text
client event or form submit
  → generated Server Function reference
  → network request with serialized arguments
  → server validates + authenticates + authorizes
  → mutation/read operation
  → supported serialized result or framework error response
  → client updates pending/result/error UI
```

The remote boundary adds latency, network failure, duplicate requests, serialization constraints, and security checks that a normal local call does not have. React recommends Server Functions primarily for mutations, not data fetching: they are not a built-in data cache and framework implementations commonly process Actions sequentially. Use the documented Server Component/framework data-loading path for reads. [React Server Functions guidance](https://react.dev/reference/rsc/server-functions)

## How this group fits the mental model

These names describe one remote call path from client code into an async server operation and the data serialization required at that boundary.

## Cross-item comparison

A Server Function reference is an RPC-like framework value, while an ordinary local function executes in the current runtime. A Server Action is the subset used as an Action.

## Examples

### Safely shaped mutation

```js
// actions.js — in an RSC-aware framework
'use server';

export async function renameProject(formData) {
  const rawId = formData.get('projectId');
  const rawName = formData.get('name');
  if (typeof rawId !== 'string' || !isProjectId(rawId) ||
      typeof rawName !== 'string' || rawName.trim().length < 1 || rawName.length > 120) {
    return { ok: false, message: 'Invalid input' };
  }

  const user = await requireAuthenticatedUser();
  await renameProjectForUser({ userId: user.id, projectId: rawId, name: rawName.trim() });
  return { ok: true };
}
```

The helpers are application-specific. Authorization occurs on the server for the requested project; do not trust an ID merely because it was rendered by a Server Component. Add transaction/idempotency controls if retries could repeat a non-idempotent operation.

## Knowledge checks with answers

1. What does a client call do? **It sends a network request through the framework reference with serialized arguments.**
2. Can a module-level `'use server'` function be synchronous? **No; Server Functions must be async.**
3. What does `useActionState` add to the argument list? **Previous state is first, followed by the action payload.**
4. Does React authorize the mutation? **No; the server function must authenticate and authorize itself.**

## Common mistakes

- Using `'use server'` to label a Server Component.
- Importing a function-level directive from a Client Component instead of using a module-level server file or passing a reference.
- Treating an imported Server Function like a synchronous local helper.
- Using the endpoint as a cacheable read API when its framework path is intended for mutations.
- Assuming serialized values are validated, private, or authorized.
- Forgetting that form Action arguments differ when `useActionState` adds prior state.
