
# authentication versus authorization identities claims and roles — Exercises and worked solutions

## Goals
Practice locating authorization boundaries, modeling resource-specific access, and selecting correct challenge/forbid outcomes.

## Worked example
A user is logged in and requests another user's invoice by changing its numeric ID. Authentication proves the user's identity; it does not grant access to the selected invoice. Load the invoice within the caller's tenant and check ownership or an explicit reviewer permission before returning it. OWASP advises checking authorization on every request and protecting guessed identifiers in its [Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

## Exercises
1. A user is unauthenticated and requests a protected API. Which decision concept applies, and what HTTP behavior is normally expected?
2. An authenticated user lacks the `invoice:approve` permission for an invoice. Distinguish authentication and authorization outcomes.
3. A tenant ID and owner ID arrive in JSON. Explain which values must be bound to trusted server state before approving an update.
4. A cached authorization allow remains after removing a user's tenant membership. Name the missing design concern and propose two fixes.
5. A user may read a support ticket but should not see its internal-risk field. What authorization granularity is needed?

## Progressive hints
1. Ask whether the client has established identity. 2. The identity is known; permission is absent. 3. Client input can choose a target but cannot prove membership or ownership. 4. Decisions depend on changing facts. 5. Object-level access does not necessarily cover every field.

## Complete solutions
1. Authentication is missing or invalid, so the server should challenge. If the API returns HTTP 401, it must include an applicable `WWW-Authenticate` challenge; an ASP.NET Core cookie scheme may instead redirect for an interactive browser flow. See [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) and [ASP.NET Core authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-11.0).
2. Authentication succeeded, but authorization failed. The framework should forbid the action; HTTP 403 is the usual representation when valid credentials are insufficient. A scheme-specific forbid operation may have different browser behavior, such as redirecting.
3. Treat submitted IDs as requested targets only. Derive the subject from the authenticated principal, verify tenant membership from trusted server data, load the target under tenant constraints, and compare ownership/permissions against persisted state. Allow-list mutable properties.
4. Authorization decision cache invalidation is missing. Invalidate relevant entries when membership changes; alternatively use short bounded cache lifetimes with revalidation and ensure the stale-access window meets the security requirement. Cache keys must include all decision inputs.
5. Property-level authorization. Return a response projection that excludes the field unless the caller has the specific permission; similarly reject unauthorized writes to that property.

## Tests and edge cases
- No valid credential: challenge behavior; never convert absence into an anonymous allow.
- Authenticated but unauthorized: forbid; don't redirect API clients to a login page unless that is the deliberate scheme behavior.
- Correct user, wrong tenant: deny even if object ID is valid and guessed correctly.
- Missing owner record or policy data: fail closed.
- Role removed while session remains active: decide how claims are refreshed and cached authorization is invalidated.
- In ASP.NET Core, distinguish a policy's requirements (all must pass) from the registered handlers that evaluate each requirement. A resource-dependent check generally runs after the object is loaded; the endpoint's declarative check alone cannot inspect an as-yet-unloaded target. See [policy](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies?view=aspnetcore-11.0) and [resource-based](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resource-based?view=aspnetcore-11.0) authorization.

## Reflection questions
Which part of your application constructs the principal? Which operation checks resource ownership? Can every route to the same data reach the same policy? What permission changes need cache invalidation?
