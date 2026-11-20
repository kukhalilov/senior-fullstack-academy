<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# authentication versus authorization identities claims and roles — Reference: Role, policy, resource, and operation authorization

## Scope and version
This assigned group covers authorization vocabulary and common failure modes. It excludes protocol-specific identity flows and detailed framework implementation. Apply [OWASP Authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) and HTTP status semantics from [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html).

## How this group fits the mental model
An authorization decision combines a trusted principal, requested operation, resource, and policy. Coarse roles are useful inputs, but safe access often depends on resource ownership, tenant, or state. The decision must be enforced server-side at the operation boundary and remain current when permissions change.

## .NET policy evaluation details
In ASP.NET Core, a policy is a set of requirements evaluated against a principal (and, for resource-based authorization, a resource). All requirements in a policy must succeed for authorization to succeed; handlers can run for requirements, and satisfying one does not implicitly satisfy unrelated requirements. A requirement may be handled by one or more handlers, so rule design should make its intended AND/OR composition explicit. For resource-based rules, endpoint metadata alone cannot inspect an object that is loaded later: perform an imperative check after safely loading it. See [policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies?view=aspnetcore-11.0) and [resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resource-based?view=aspnetcore-11.0).

## Supplied names explained
- `Authorization` — Deciding whether a principal may perform an operation on a resource. It is separate from proving identity.
- `Role-based authorization` — Grants access based on membership in named roles. In .NET, role membership is evaluated through the relevant identity's configured `RoleClaimType`; provider claim mapping can therefore affect `IsInRole` and role checks. It is easy to understand for coarse groups, but roles can proliferate and may not express object ownership or context.
- `Claim-based authorization` — Evaluates claims associated with a trusted identity. Claims can express useful facts, but issuer, freshness, and semantics must be validated.
- `Policy-based authorization` — Evaluates a named rule or set of requirements. Policies make decisions reusable and explicit; their definitions must still include every relevant resource condition.
- `Requirement-based authorization` — Expresses a condition that must be satisfied for a policy to succeed. In ASP.NET Core, all requirements in one policy must succeed; multiple handlers may be registered for a requirement, and any handler can mark it succeeded. Ensure the intended combination is clear and fail-closed.
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
- `401 Unauthorized` — Despite the name, HTTP uses this status when a request lacks valid authentication credentials. A server generating 401 MUST include `WWW-Authenticate` with at least one applicable challenge; a request with valid but insufficient credentials is generally answered 403. It is not the status for every permission denial. See [RFC 9110 §§11.6.1 and 15.5.2](https://www.rfc-editor.org/rfc/rfc9110.html).
- `403 Forbidden` — The server understood the request but refuses to fulfill it. Repeating authentication does not necessarily change the outcome. See [RFC 9110 §15.5.4](https://www.rfc-editor.org/rfc/rfc9110.html).
- `Challenge result` — An ASP.NET Core authentication-handler operation invoked when authorization requires authentication but the request is unauthenticated. Its configured scheme determines the response: for example, a cookie handler can redirect to sign-in while a bearer handler can return 401 with a Bearer challenge. These framework behaviors must still produce responses consistent with the protocol being used.
- `Forbid result` — An ASP.NET Core authentication-handler operation used when an authenticated principal is not permitted. Handler configuration determines the response; a bearer handler commonly returns 403, while cookie behavior can redirect. Do not assume the framework result name itself is an HTTP status.
- `Privilege escalation` — Gaining authority beyond what is intended, through a flaw such as missing checks, unsafe role assignment, or confused trust boundaries. Test both horizontal (peer account) and vertical (higher privilege) paths.
- `Confused deputy` — A privileged component is tricked into using its authority on behalf of a caller without correctly checking the caller's rights and intended target. Bind authorization to the actual subject, operation, and resource.

## Cross-item comparison
`Role-based authorization` is a model based on membership; `Policy-based authorization` can combine claims, context, and requirements. A policy may still be insufficient without `Resource-based authorization` when object ownership matters. `Function-level authorization` gates the action category; `Object-level authorization` gates its target; `Property-level authorization` gates fields. A `Challenge result` asks for authentication; a `Forbid result` rejects an authenticated request lacking permission. HTTP defines 401 and 403 in RFC 9110.

HTTP 401 and ASP.NET Core challenge are related but not identical concepts: a handler may implement challenge using a redirect for an interactive flow. HTTP status semantics still apply to the actual response. A server may use 404 instead of disclosing a protected resource's existence when that is an intentional confidentiality policy, but it must avoid inconsistent side channels and still enforce access control.

## Examples
For `GET /tenants/7/invoices/42`, first derive the tenant from the authenticated principal or a server-validated membership, then fetch invoice 42 constrained to that tenant. Evaluate whether the principal may read that invoice. Return no data if tenant/object checks fail. For `PATCH`, separately allow only properties the caller may modify. Do not fetch arbitrary data and rely on the UI to hide it.

## Common mistakes
- Checking a role on the route but forgetting the resource owner.
- Returning fields the caller may not view because object access succeeded.
- Default-allow behavior when policy data is missing or a handler fails.
- Caching an allow without invalidating it after tenant membership is removed.
- Returning 401 for every denied request or 403 when authentication is absent, without considering HTTP semantics and application scheme.
- Assuming a policy with multiple requirements means “any one”; ASP.NET Core requires all requirements in a policy to succeed.
- Assuming all handlers registered for a requirement must succeed; a handler may mark its requirement succeeded, so model AND conditions as separate requirements or explicit logic.

## Knowledge checks with answers
1. Can random IDs replace ownership checks? **No.**
2. A signed-in user lacks permission. Which conceptual result? **Forbid/403, depending on the app's scheme.**
3. Why constrain database lookup by tenant as well as checking afterward? **It reduces exposure paths and ensures the selected resource already respects the tenant boundary.**
