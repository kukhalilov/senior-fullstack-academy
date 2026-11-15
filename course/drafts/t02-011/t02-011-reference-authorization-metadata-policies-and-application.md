# ASP.NET Core authentication principals claims roles authorization policies and handlers — Reference: Authorize metadata, policy selection, defaults, fallback, and endpoint application

## Scope and version

This reference covers policy registration, endpoint metadata, policy selection, middleware, and results. The behavior of default, fallback, and combined endpoint policies is easy to misremember, so use the framework's versioned policy guide when changing pipeline conventions. [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)

## How this group fits the mental model

Authorization metadata describes which policy applies to an endpoint. `AuthorizationMiddleware` resolves the endpoint metadata, builds/combines the policy, then evaluates its requirements against the request principal. A default policy serves bare authorization metadata; a fallback policy applies only when no policy is produced. These mechanisms are not automatically layered together.

## Supplied names explained

### Register policies and build requirements

| Supplied name | Meaning and use |
|---|---|
| `AddAuthorization` | Registers authorization services and optionally configures policies/options. |
| `AddAuthorization(IServiceCollection)` | Adds the authorization service set without a custom configuration callback. |
| `AddAuthorization(Action<AuthorizationOptions>)` | Adds authorization services and configures the options object for defaults, fallback, and named policies. |
| `AddAuthorizationBuilder` | Returns a fluent builder for registering authorization policies without writing one large options callback. |
| `AuthorizationBuilder` | Fluent service-registration builder used to add named policies and authorization services. |
| `AuthorizationOptions` | Holds named, default, and fallback policy configuration and evaluation behavior. |
| `AuthorizationOptions.DefaultPolicy` | Policy used by bare authorization metadata such as `[Authorize]` or `RequireAuthorization()` when policy selection rules call for the default. By default it requires an authenticated user. |
| `AuthorizationOptions.FallbackPolicy` | Policy used when authorization middleware processes an endpoint with no metadata producing another policy. It is not combined with named/default policies and does not cover earlier middleware responses. |
| `AuthorizationOptions.InvokeHandlersAfterFailure` | Controls whether requirement handlers continue to run after authorization has explicitly failed. Do not rely on side-effect ordering; a failure should be intentional and handlers should be safe to invoke according to configuration. |
| `AuthorizationOptions.AddPolicy` | Registers a named policy or a callback that constructs it. Policy names should be stable application constants or carefully validated dynamic identifiers. |
| `AuthorizationOptions.GetPolicy` | Retrieves a registered policy by name, returning no policy when the name is not registered. |
| `AuthorizationPolicy` | Immutable policy containing requirements and optional authentication schemes to run. |
| `AuthorizationPolicy.Requirements` | Requirements that policy evaluation must satisfy. Distinct requirements combine with AND semantics. |
| `AuthorizationPolicy.AuthenticationSchemes` | Scheme names used to authenticate a principal for the policy. Selecting schemes can create identities from those handlers; choose only the credential protocols intended for that endpoint. |
| `AuthorizationPolicyBuilder` | Builder for composing requirements and authentication schemes into a policy. |
| `AuthorizationPolicyBuilder.AddAuthenticationSchemes` | Adds explicit scheme names to the policy. Useful for selecting bearer versus cookie credentials, but avoid mixing handlers that produce ambiguous identities. |
| `AuthorizationPolicyBuilder.RequireAuthenticatedUser` | Adds a requirement that the principal contain an authenticated identity. This does not imply role/claim/resource permission. |
| `AuthorizationPolicyBuilder.RequireAssertion` | Adds an inline assertion requirement. Keep logic small and testable; complex domain checks belong in named requirements/handlers. |
| `AuthorizationPolicyBuilder.Build` | Builds the policy from accumulated requirements and schemes. |

### Apply metadata to endpoints and policies

| Supplied name | Meaning and use |
|---|---|
| `IAuthorizeData` | Metadata contract implemented by authorization attributes, carrying policy, role, and scheme declarations for policy construction. |
| `AuthorizeAttribute` | Declarative authorization metadata for controllers, pages, or actions. It runs before a resource-loading method can inspect an object. |
| `AuthorizeAttribute.Policy` | Names a registered or dynamically provided policy. |
| `AuthorizeAttribute.Roles` | Declares acceptable role names for a policy. Multiple comma-separated roles in one roles declaration are alternatives; separate authorization metadata declarations combine and can impose additional requirements. |
| `AuthorizeAttribute.AuthenticationSchemes` | Specifies schemes used to authenticate for the protected resource. It selects credential handlers; it does not itself assert an application role or permission. |
| `AllowAnonymousAttribute` | Declarative metadata that allows anonymous access to an endpoint despite authorization metadata. Keep exceptions narrow and intentional. |
| `IAllowAnonymous` | Marker contract recognized by authorization middleware for anonymous endpoint metadata. |
| `AllowAnonymous endpoint metadata` | Endpoint-level marker causing the middleware to skip authorization failure enforcement for that endpoint. Authentication may still run and populate the principal. |
| `RequireAuthorization` | Endpoint convention that requires authorization using the default policy or supplied policy metadata. |
| `RequireAuthorization(String)` | Adds authorization using a named policy. |
| `RequireAuthorization(AuthorizationPolicy)` | Adds a concrete policy instance to endpoint metadata. Explicit policy metadata affects whether bare authorization metadata adds the default policy. |
| `RequireAuthorization(Action<AuthorizationPolicyBuilder>)` | Builds and attaches an endpoint-specific policy from a callback. Prefer reusable named policies where the same rule applies in several places. |
| `RequireAuthorization on route groups` | Applies authorization metadata to endpoints mapped under a route group. Child endpoint metadata can add requirements or anonymous exceptions; test the resulting policy combination. |
| `AllowAnonymous endpoint convention` | Endpoint mapping convention to mark an endpoint anonymous. Use it only for deliberately public routes. |
| `Default policy selection` | Bare `[Authorize]` or `RequireAuthorization()` normally selects the default policy, unless explicit policy metadata changes the combination rules. |
| `Fallback policy selection` | The fallback is selected only if authorization middleware has no policy-producing endpoint metadata. It does not layer onto an existing named/default/role policy. |
| `Named policy selection` | A policy name is resolved through the registered policy set or custom policy provider and its requirements are evaluated. Unknown names should fail safely. |
| `Multiple authorization metadata combination` | Selected named policies, roles, schemes, and explicit policies can combine for one endpoint. The exact policy-building rules matter; a second attribute is not generally an override. |
| `Combined policy requirements use AND semantics` | Each distinct requirement in the combined policy must succeed. Multiple handlers may cooperate on one requirement, but one successful requirement does not satisfy the rest. |
| `Role list within Roles metadata semantics` | A comma-separated list inside one roles field means the user may match any listed role. Separate authorization declarations can still add independent AND requirements. |
| `Explicit policy versus default policy` | A concrete `AuthorizationPolicy` attached to an endpoint affects whether bare authorization data adds `DefaultPolicy`. Do not assume every bare declaration always adds the default policy when explicit policy metadata exists. |
| `Fallback policy does not combine with named policy` | When named/default/explicit metadata produces a policy, fallback is not automatically merged into it. Include required baseline authentication in the named policies where necessary. |
| `Fallback policy does not protect earlier static file middleware` | Static files served before `UseAuthorization` never reach authorization middleware. Put protected content behind authorization-aware endpoints/storage rather than relying on a fallback policy. |

### Middleware and evaluation result hooks

| Supplied name | Meaning and use |
|---|---|
| `AuthorizationMiddleware` | Resolves endpoint metadata into a policy, runs authorization, then invokes the next middleware or a challenge/forbid result. |
| `UseAuthorization` | Adds authorization middleware. In endpoint-routing apps, place it after routing and after authentication; ensure endpoint execution occurs after it. |
| `Authorization middleware endpoint routing order` | Endpoint routing must select endpoint metadata before authorization can evaluate it. Authentication must run before authorization; endpoint execution follows authorization. Middleware that serves a response earlier is outside these checks. |
| `IAuthorizationMiddlewareResultHandler` | Service contract that handles authorization success/failure results from authorization middleware. |
| `AuthorizationMiddlewareResultHandler` | Default handler that delegates success, challenge, or forbid behavior based on the authorization result and current authentication state. |
| `AuthorizationFailure` | Represents an authorization failure and its failed requirements/reasons. Use it for diagnostics without disclosing protected resource data. |
| `AuthorizationFailureReason` | Structured reason produced by a handler to explain an authorization failure for diagnostics. Avoid putting secrets or sensitive user/resource data in the description. |

## Cross-item comparison

| Metadata case | Policy used | Consequence |
|---|---|---|
| No authorization metadata | Fallback policy, if configured | Otherwise authorization is not required by this middleware decision |
| Bare `[Authorize]` / `RequireAuthorization()` | Default policy, subject to explicit-policy combination rules | By default requires an authenticated user |
| Named policy | Named policy | Evaluate the named requirements; fallback is not added automatically |
| Roles metadata | Role requirement(s) | A role list in one declaration is alternatives; separate declarations can add AND rules |
| Anonymous metadata | Skip authorization failure enforcement | Authentication can still populate the principal |

This matrix describes policy selection, not authorization outcome. After selection, all composed requirements must succeed.

## Examples

### Configure a fallback and a named policy

```csharp
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    options.AddPolicy("Inventory.Read", policy =>
        policy.RequireAuthenticatedUser()
              .RequireClaim("permission", "inventory.read"));
});
```

The named policy includes authentication explicitly because the fallback is not automatically combined with it. Mark health/login/other truly public endpoints explicitly, and verify that static files are not accidentally assumed protected. [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)

### Apply a policy to a route group and expose one public route

```csharp
var api = app.MapGroup("/api").RequireAuthorization("Inventory.Read");
api.MapGet("/items", GetItems);
api.MapGet("/status", GetPublicStatus).AllowAnonymous();
```

The group applies metadata to its mapped endpoints. The anonymous endpoint is an explicit exception, and any authentication middleware can still set its principal. Review all child routes when composing groups. [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)

## Common mistakes

- Assuming the fallback policy is added to a named policy.
- Assuming one `[Authorize]` declaration replaces another rather than combining metadata.
- Confusing comma-separated roles in one declaration with multiple authorization declarations.
- Forgetting that explicit policy instances change bare/default policy combination behavior.
- Believing `FallbackPolicy` protects static files returned before `UseAuthorization`.
- Applying `AllowAnonymous` broadly to a group that contains sensitive endpoints.
- Placing `UseAuthorization` before routing or before authentication.
- Putting resource ownership in an attribute when the resource is loaded later.
- Requiring authentication in the fallback but not in named policies while assuming the fallback still applies.

## Knowledge checks with answers

1. **When does the fallback policy apply?** When authorization middleware handles a request with no endpoint metadata that produces another policy.
2. **Does a named policy automatically include the fallback?** No. Include the baseline requirements in named policies where needed.
3. **What does a comma-separated role list mean?** Any listed role can satisfy that role requirement; additional authorization metadata can impose other requirements.
4. **Why is static file middleware relevant?** It may return the file before the request reaches authorization middleware.
5. **What must all combined requirements do?** Succeed for authorization to pass.

## Sources

- [Policy-based authorization in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)
- [Overview of ASP.NET Core authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)
