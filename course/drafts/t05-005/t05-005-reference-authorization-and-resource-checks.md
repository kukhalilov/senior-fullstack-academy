<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# ASP.NET Core authentication handlers identity and policies — Reference: Policy composition, requirements, handlers, and endpoint application

## Scope and version
This lesson explains the ASP.NET Core 11 authorization terms in the manifest. See Microsoft's [policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies?view=aspnetcore-11.0), [resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resource-based?view=aspnetcore-11.0), and [authorization introduction](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction?view=aspnetcore-11.0).

## How this group fits the mental model
Endpoint metadata selects/composes policy; requirements state what must be true; handlers evaluate conditions; resource authorization supplies the loaded object to the decision. Middleware turns the result into an allow, challenge, or forbid outcome.

## Supplied names explained
- `AddAuthorization` — Registers authorization services and allows policy configuration. It does not authenticate users; pair it with authentication middleware and endpoint protection.
- `AuthorizationOptions` — Container for named policies and default/fallback policy behavior.
- `AuthorizationPolicy` — A set of authentication schemes and requirements that must be satisfied for access.
- `AuthorizationPolicyBuilder` — Fluent builder for creating a policy by adding schemes and requirements.
- `DefaultPolicy` — Policy applied by bare authorization metadata such as `[Authorize]` without a named policy. By default it requires an authenticated user.
- `FallbackPolicy` — Policy used when an endpoint has no authorization metadata, if configured. It differs from the default policy; middleware ordering can leave earlier-served static files outside its reach. See [Microsoft policy docs](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies?view=aspnetcore-11.0).
- `IAuthorizationService` — Service that evaluates a named policy or requirements for a principal, optionally against a resource. Use it for imperative/resource decisions after loading data.
- `IAuthorizationRequirement` — Marker/contract for a condition a policy requires. Keep requirements focused and define composition clearly.
- `AuthorizationHandler<TRequirement>` — Base handler for evaluating a requirement. It can inspect the user and supplied resource and call success only when conditions hold.
- `AuthorizationHandlerContext` — Context containing the user, pending requirements, resource, and success/failure state for evaluation.
- `AuthorizationHandlerContext.Resource` — Object supplied to resource-aware authorization. Its concrete type may depend on invocation path; avoid assumptions without checking the endpoint/framework path.
- `AuthorizationHandlerContext.Succeed` — Marks a particular requirement as satisfied. A policy with multiple requirements still needs all required conditions met.
- `AuthorizationHandlerContext.Fail` — Marks authorization as failed, potentially overriding otherwise satisfied requirements. Use deliberately for explicit hard denial; do not confuse missing success with a successful grant.
- `RequireAuthenticatedUser` — Adds a requirement that the principal be authenticated.
- `RequireClaim` — Adds a requirement for one or more claim types/values. Claim issuer and freshness may need additional checks.
- `RequireRole` — Adds a role membership requirement. Roles are coarse and do not prove ownership of a particular object.
- `RequireAssertion` — Adds a delegate-based authorization condition. Keep complex logic testable; avoid duplicating hidden business rules across endpoints.
- `AddPolicy` — Registers a named policy for later selection by attributes, conventions, or authorization service calls.
- `[Authorize] attribute` — Applies authorization metadata to a controller/action/page or endpoint. It uses the default policy when no policy name/role is specified, subject to policy composition rules.
- `[AllowAnonymous] attribute` — Marks an endpoint as intentionally anonymous so authorization middleware does not enforce its normal failure there. Treat it as an explicit exception and review nested/combined metadata carefully.
- `[Authorize(AuthenticationSchemes=...)]` — Selects specified authentication scheme(s) for the authorization request. Combining schemes can combine identities and should be intentional.
- `RequireAuthorization endpoint convention` — Adds authorization metadata to endpoint routes through conventions. It can apply a named or built policy to a route group/endpoints.
- `IAuthorizationFilter` — MVC filter interface for authorization-stage behavior. Prefer framework authorization middleware/policies for ordinary authorization; custom filters can bypass consistent pipeline semantics.
- `IAsyncAuthorizationFilter` — Asynchronous MVC authorization filter interface. Avoid using it as an ad hoc substitute for policy/resource authorization.
- `IAuthorizationMiddlewareResultHandler` — Extension point that customizes how authorization middleware handles challenge/forbid results. Ensure custom responses preserve correct security semantics.
- `UseAuthorization` — Adds authorization middleware that evaluates endpoint authorization metadata. It must run after routing has selected endpoint metadata and after authentication has established the principal.
- `Resource-based authorization` — Decision using a loaded resource's state, such as owner or tenant. Attribute evaluation precedes resource loading, so call authorization imperatively when the object is available. See [Microsoft resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resource-based?view=aspnetcore-11.0).
- `AuthorizationResult` — Outcome of an authorization service evaluation, indicating success or failure and potentially failure details. Avoid exposing sensitive policy diagnostics to callers.
- `401 challenge result` — Authentication challenge outcome commonly mapped to HTTP 401 for APIs, although the selected cookie scheme can redirect interactive clients. HTTP semantics require a challenge as appropriate.
- `403 forbid result` — Forbidden outcome for a known principal lacking authorization, commonly mapped to HTTP 403. It should not prompt reauthentication as if identity were absent.

## Cross-item comparison
`DefaultPolicy` applies when authorization is requested without a named rule; `FallbackPolicy` applies when no authorization metadata exists and a fallback is configured. `RequireRole` checks a coarse membership; resource-based authorization evaluates a particular object's owner, tenant, or state. A challenge asks for identity; a forbid denies an authenticated principal. See [Microsoft policy](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies?view=aspnetcore-11.0) and [resource authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resource-based?view=aspnetcore-11.0).

## Examples
Require authentication for a document endpoint, load the document within the caller's tenant, then call `IAuthorizationService` with the user, document, and policy. The handler checks owner or reviewer grant. Keep a broad `FallbackPolicy` for endpoints with no metadata and explicitly mark intended public routes. Ensure static files or middleware before authorization are handled according to their own protection requirements.

## Common mistakes
- Treating `DefaultPolicy` and `FallbackPolicy` as synonyms.
- Assuming a fallback protects static files already served earlier in the pipeline.
- Using `[Authorize]` for owner checks before the resource exists.
- Letting a role requirement stand in for tenant/object validation.
- Calling `Succeed` without checking all needed conditions.
- Using `[AllowAnonymous]` as a broad workaround without reviewing endpoint exposure.

## Knowledge checks with answers
1. Which policy handles endpoints with no auth metadata? **Configured `FallbackPolicy`.** 2. Why imperative authorization for a loaded object? **The object is unavailable when endpoint metadata is first evaluated.** 3. Does a role guarantee resource ownership? **No.**
