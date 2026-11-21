
# React application architecture security and deployment — Reference: Server action authorization and input trust

# Scope and version

React 19.3 documents Server Functions as server-side functions callable from client code over the network. This lesson covers frontend-side trust and endpoint responsibilities; implementation details vary by framework. See [React use server](https://react.dev/reference/rsc/use-server), [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), and [OWASP Mass Assignment](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html).

# How this group fits the mental model

A Server Function is a network endpoint even when declared alongside React code. Its input is client-controlled, its invocation can be forged/replayed, and its response can reveal data. The server must perform the same trust checks it would perform for any API request.

# Supplied names explained

- `Server Function as network entry point` — React's term for an async server-side function referenced by client code. Calling it sends a network request with serialized arguments; any returned value is serialized back to the caller. Framework tooling handles transport, but application authorization remains necessary. Calls outside a form should be made in a Transition; form `action` and `formAction` calls are wrapped automatically. React documents these functions primarily for mutations, not cached data fetching.
- `Server Function async network call` and `Server Function serializable arguments and returns` — A Server Function is asynchronous because its client call is a network operation. The request and return value must use React's supported serialization types; do not pass browser event objects, class instances, arbitrary functions, or React elements as arguments.
- `Server Function call in Transition` and `Form action automatic Transition` — Call a Server Function from client event code inside `startTransition`; when passed to a form's `action` or a submitter's `formAction`, React wraps the call in a Transition.
- `Client-controlled Server Function arguments` — Serialized values provided by the caller. A caller can alter IDs, roles, quantities, and fields regardless of what the UI normally sends.
- `Authentication` — Establishing the identity or session associated with the request. Authentication alone does not imply access to every record or operation.
- `Authorization for each mutation` — Checking on the server that this identity may perform this specific action on this specific resource now. Recheck on every call; do not rely on hidden controls or a prior page load.
- `Server-side schema validation` — Validating types, bounds, formats, and allowed fields at the trust boundary. Client validation is useful for feedback but is bypassable.
- `Mass-assignment risk` — Binding arbitrary client-supplied fields directly onto a model can let callers set privileged properties such as `role`, `ownerId`, or `isAdmin`. Use narrow input schemas and explicit field mapping.
- `CSRF defense at framework boundary` — Protection against a victim's browser being tricked into making authenticated cross-site requests. React's `'use server'` directive does not itself specify a general CSRF defense; understand and verify the framework's built-in origin/token/cookie protections and do not disable them casually. Still enforce authentication, authorization, and input validation because CSRF defenses do not stop direct or malicious authenticated calls.
- `React does not prescribe generic CSRF defense` — The React Server Function documentation requires input validation and authorization but does not define a framework-independent CSRF mechanism; verify the chosen framework's exact request-origin and token protections.
- `Server Functions are mutation-oriented and typically uncached` — React describes Server Functions primarily as mutations. Framework implementations commonly process one action at a time and do not cache returned values, so use ordinary framework data-fetching/caching mechanisms for reads.
- `Rate limiting` — Limiting request frequency/volume by identity, resource, or risk to reduce abuse, brute force, and resource exhaustion. It complements, not replaces, authorization.
- `Sensitive data exposure` — Returning or logging data beyond what the caller needs can leak secrets or personal information. Minimize response fields, redact logs, and account for serialized return values reaching the client.
- `Audit logging for privileged operations` — Recording security-relevant who/what/when/outcome details for investigation and compliance, while excluding credentials and unnecessary sensitive payloads. Protect log integrity and access.

# Cross-item comparison

Authentication answers who is calling; authorization answers whether that caller may perform the requested action on the target resource. Schema validation controls input shape; authorization controls permission. Both are required. CSRF defenses address the browser's ambient credentials and cross-site request behavior, not malicious authenticated users or direct calls.

# Examples

Unsafe pattern:

```ts
'use server'
async function updateUser(input: any) {
  await database.user.update({ where: { id: input.id }, data: input })
}
```

Safer shape: derive the user identity from the authenticated server session, parse a narrow schema such as `{ displayName }`, load the target record, authorize this user against it, map only permitted fields, apply rate limits as appropriate, and return a minimized view. Use framework-provided CSRF protections and audit privileged changes without logging tokens.

# Common mistakes

- Assuming a Server Function is private because it is not listed in a visible route table.
- Trusting client-supplied `userId`, `role`, ownership, or hidden form fields.
- Using a broad object spread to update a database model.
- Validating only in a React form.
- Treating CSRF protection as a replacement for authorization.
- Returning full database records when the UI needs only a few fields.
- Logging cookies, credentials, or full sensitive request bodies.

# Knowledge checks with answers

1. Are Server Function arguments trusted because React serializes them? **No; they are fully client-controlled.**
2. What check determines permission on a mutation? **Server-side authorization for that user, action, and resource.**
3. What is a mass-assignment defense? **Validate a narrow schema and explicitly map permitted fields.**
4. Does authentication grant authorization? **No.**
5. Why keep Server Function responses small? **Serialized return values reach the client and can expose sensitive fields.**

Sources: [React use server](https://react.dev/reference/rsc/use-server), [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [OWASP Mass Assignment](https://cheatsheetseries.owasp.org/cheatsheets/Mass_Assignment_Cheat_Sheet.html).
