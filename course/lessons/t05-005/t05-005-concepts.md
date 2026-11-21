
# ASP.NET Core authentication handlers identity and policies — Core concepts and how they fit together

## Learning objectives
Trace authentication and authorization middleware; choose explicit schemes; distinguish cookie, bearer, and remote OIDC handlers; compose policies; and place resource checks after loading the target.

## Prerequisites
Understand authentication versus authorization, claims principals, cookies, JWTs, and OAuth/OIDC at the conceptual level. This lesson focuses on ASP.NET Core's application model, not password stores or token protocol internals.

## Core concepts
Authentication schemes map a name to a handler and options. Authentication attempts produce a principal, no result, or failure. The middleware establishes the request identity but does not automatically require that endpoints be protected. An application must apply authorization metadata or configure a fallback policy. Microsoft documents this distinction in [ASP.NET Core authentication overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-11.0).

Cookie handlers protect an authentication ticket for browser requests. A cookie challenge commonly redirects an interactive browser to sign-in, but since ASP.NET Core 10, known API endpoints return 401/403 instead of cookie login/access-denied redirects; endpoint recognition uses metadata, not the request Accept header. See [API endpoint behavior](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/api-endpoint-auth?view=aspnetcore-10.0). Bearer handlers validate tokens presented to APIs. An OIDC handler participates in a remote redirect/callback sign-in flow; it is not interchangeable with a JWT bearer validator. If both cookie and bearer schemes exist, select the intended scheme on endpoints or policies to avoid the wrong identity or response behavior. See [cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie?view=aspnetcore-11.0).

## Mechanisms and relationships
Middleware order matters: endpoint routing must be established before endpoint-aware authorization; authentication must run before authorization so the principal is available. `WebApplication` automatically inserts routing, authentication, authorization, and endpoint middleware in common configurations when the relevant services and endpoints are detected. Custom ordering, including CORS, may require explicit calls. Register handlers/options during service configuration. Since ASP.NET Core 7, one registered scheme is automatically treated as the default unless that behavior is suppressed; multiple schemes do not get that automatic selection. Mixed browser/API apps should set defaults and endpoint scheme selection deliberately. See [middleware ordering](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-10.0) and [the .NET 7 default-scheme change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/7/default-authentication-scheme?view=aspnetcore-10.0).

Authorization combines endpoint metadata into a policy. The default policy handles bare `[Authorize]`; the fallback policy handles endpoints with no authorization metadata when configured. Every requirement in the combined policy must succeed, while multiple handlers for the same requirement can provide alternative ways to satisfy it. `context.Fail` is an explicit veto. `[AllowAnonymous]` bypasses authorization failure enforcement, although authentication may still populate the principal. A fallback policy does not protect middleware that already served files earlier in the pipeline. See [policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies?view=aspnetcore-11.0).

Resource-based authorization cannot be fully decided by endpoint metadata before the resource loads. Load the record through a tenant-constrained query, then call `IAuthorizationService` with the user, resource, and policy/requirements. Requirements describe conditions; handlers evaluate them; call `Succeed` only when a requirement is met. Missing data or an exception should not accidentally authorize. A challenge asks for authentication; forbid signals an authenticated principal lacks permission.

## Worked examples
**Mixed application:** a browser page selects cookie authentication and may redirect to sign-in; a bearer API returns a bearer challenge. A recognized API endpoint using cookies in ASP.NET Core 10 or later instead receives 401/403 rather than a login redirect; recognition follows endpoint metadata rather than Accept-header negotiation. See [API endpoint behavior](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/api-endpoint-auth?view=aspnetcore-10.0). Explicit schemes keep credential processing and challenge behavior appropriate to each endpoint.

**Resource check:** endpoint requires authenticated user, loads a document, then checks ownership/tenant policy. A bare `[Authorize]` cannot know ownership before loading the document.

**Fallback:** set a fallback policy to require authenticated users broadly; explicitly allow anonymous health/login endpoints. Verify static files are not served before the protecting middleware if they also need authorization.

## Misconceptions and edge cases
- Registering authentication is not equivalent to protecting all endpoints.
- A bearer handler validates a token; OIDC handler conducts a remote protocol flow.
- Default policy and fallback policy apply in different metadata cases.
- `[AllowAnonymous]` can bypass authorization enforcement for an endpoint; use it deliberately.
- `ChallengeAsync` and `ForbidAsync` behavior depends on the selected scheme, so cookie redirects and API statuses may differ.
- A requirement can have multiple handlers, so multiple handler paths may be alternatives; multiple requirements in a policy are conjunctive. A handler's `Fail` can veto success; `Succeed` only marks its requirement satisfied.
- Cookie challenge behavior is version/endpoint-sensitive: ASP.NET Core 10+ known API endpoints use 401/403 instead of cookie redirects.

## Knowledge checks with answers
1. Does AddAuthentication protect routes by itself? **No; authorization metadata or policy must enforce access.**
2. When is resource-based authorization called? **After loading the resource needed by the decision.**
3. Which policy applies when an endpoint has no auth metadata? **FallbackPolicy, if configured; otherwise no fallback restriction by default.**
