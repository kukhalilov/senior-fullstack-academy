<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# authentication versus authorization identities claims and roles — Reference: Role, policy, resource, and operation authorization

## Scope and version
This assigned group covers authorization vocabulary and common failure modes. It excludes protocol-specific identity flows and detailed framework implementation. Apply [OWASP Authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) and HTTP status semantics from [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html).

## How this group fits the mental model
An authorization decision combines a trusted principal, requested operation, resource, and policy. Coarse roles are useful inputs, but safe access often depends on resource ownership, tenant, or state. The decision must be enforced server-side at the operation boundary and remain current when permissions change.

## Supplied names explained
- `Authorization` — Deciding whether a principal may perform an operation on a resource. It is separate from proving identity.
- `Role-based authorization` — Grants access based on membership in named roles. It is easy to understand for coarse groups, but roles can proliferate and may not express object ownership or context.
- `Claim-based authorization` — Evaluates claims associated with a trusted identity. Claims can express useful facts, but issuer, freshness, and semantics must be validated.
- `Policy-based authorization` — Evaluates a named rule or set of requirements. Policies make decisions reusable and explicit; their definitions must still include every relevant resource condition.
- `Requirement-based authorization` — Expresses a condition that must be satisfied for a policy to succeed. Multiple requirements can model distinct conditions; ensure the intended combination is clear and fail-closed.
- `Authorization handler` — Evaluates whether a requirement is satisfied, often using the principal and resource context. A handler should not silently grant when data is missing or an exception occurs.
- `Resource-based authorization` — Evaluates permission in relation to a particular object. Load the resource safely, then check ownership/tenant/state before returning or mutating it.
- `Imperative authorization` — Invokes a decision in code at runtime, useful when the target resource must be loaded first. Centralize and test such checks so they are not skipped on alternate paths.
- `Declarative authorization` — Associates a requirement with an endpoint or operation so enforcement is visible in configuration/metadata. Resource-dependent rules may still need a later imperative check.
- `Permission` — A defined grant to perform an operation in a scope. Avoid ambiguous labels; specify action and resource boundary.
- `Privilege` — The effective authority a subject has. Excess privilege increases impact if an account or code path is compromised.
- `Least privilege` — Grant only the minimum permissions needed for the task and duration. Revisit grants as responsibilities change. OWASP recommends enforcing least privilege in its [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).
- `Deny by default` — The safe baseline where no explicit grant means access is refused. This reduces accidental access from missing rules.
- `Default-deny policy` — An explicit policy/configuration that implements the default-deny principle for protected resources. Verify that every route and alternate access path is covered.
- `Tenant isolation` — Ensuring one tenant cannot read or affect another tenant's data. Enforce it in resource lookup and authorization; never rely solely on a tenant ID supplied by the caller.
- `Ownership check` — Comparing the authenticated subject or a granted role with the resource's owner. Ownership must be determined from trusted server-side data, not a client-supplied owner field.
- `Function-level authorization` — Checks whether a caller may invoke a category of operation, such as deleting accounts. A valid function-level grant does not necessarily permit every object targeted by that operation.
- `Object-level authorization` — Checks whether access to this particular object is allowed. Unpredictable IDs do not replace this check.
- `Property-level authorization` — Controls which fields a caller may read or change. Object access does not automatically grant access to every sensitive property.
- `Authorization decision cache invalidation` — Removing or refreshing cached allows/denials after relevant identity, policy, resource, or ownership changes. Stale cached allows can preserve revoked access; cache keys and invalidation scope must cover every decision input.
- `401 Unauthorized` — Despite the name, HTTP uses this status for a request lacking valid authentication credentials and requires an applicable authentication challenge. It is not the status for every permission denial. See [RFC 9110 §15.5.2](https://www.rfc-editor.org/rfc/rfc9110.html).
- `403 Forbidden` — The server understood the request but refuses to fulfill it. Repeating authentication does not necessarily change the outcome. See [RFC 9110 §15.5.4](https://www.rfc-editor.org/rfc/rfc9110.html).
- `Challenge result` — A framework outcome asking the client to authenticate under an applicable scheme; it commonly maps to a login redirect for interactive browser flows or a 401 response for APIs, depending on configuration.
- `Forbid result` — A framework outcome indicating the authenticated principal is not allowed; it commonly maps to a 403 response, though scheme-specific behavior can vary.
- `Privilege escalation` — Gaining authority beyond what is intended, through a flaw such as missing checks, unsafe role assignment, or confused trust boundaries. Test both horizontal (peer account) and vertical (higher privilege) paths.
- `Confused deputy` — A privileged component is tricked into using its authority on behalf of a caller without correctly checking the caller's rights and intended target. Bind authorization to the actual subject, operation, and resource.

## Cross-item comparison
`Role-based authorization` is a model based on membership; `Policy-based authorization` can combine claims, context, and requirements. A policy may still be insufficient without `Resource-based authorization` when object ownership matters. `Function-level authorization` gates the action category; `Object-level authorization` gates its target; `Property-level authorization` gates fields. A `Challenge result` asks for authentication; a `Forbid result` rejects an authenticated request lacking permission. HTTP defines 401 and 403 in RFC 9110.

## Examples
For `GET /tenants/7/invoices/42`, first derive the tenant from the authenticated principal or a server-validated membership, then fetch invoice 42 constrained to that tenant. Evaluate whether the principal may read that invoice. Return no data if tenant/object checks fail. For `PATCH`, separately allow only properties the caller may modify. Do not fetch arbitrary data and rely on the UI to hide it.

## Common mistakes
- Checking a role on the route but forgetting the resource owner.
- Returning fields the caller may not view because object access succeeded.
- Default-allow behavior when policy data is missing or a handler fails.
- Caching an allow without invalidating it after tenant membership is removed.
- Returning 401 for every denied request or 403 when authentication is absent, without considering HTTP semantics and application scheme.

## Knowledge checks with answers
1. Can random IDs replace ownership checks? **No.**
2. A signed-in user lacks permission. Which conceptual result? **Forbid/403, depending on the app's scheme.**
3. Why constrain database lookup by tenant as well as checking afterward? **It reduces exposure paths and ensures the selected resource already respects the tenant boundary.**
