<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# ASP.NET Core authentication handlers identity and policies — Core concepts and how they fit together

## Learning objectives
Trace authentication and authorization middleware; choose explicit schemes; distinguish cookie, bearer, and remote OIDC handlers; compose policies; and place resource checks after loading the target.

## Prerequisites
Understand authentication versus authorization, claims principals, cookies, JWTs, and OAuth/OIDC at the conceptual level. This lesson focuses on ASP.NET Core's application model, not password stores or token protocol internals.

## Core concepts
Authentication schemes map a name to a handler and options. Authentication attempts produce a principal, no result, or failure. The middleware establishes the request identity but does not automatically require that endpoints be protected. An application must apply authorization metadata or configure a fallback policy. Microsoft documents this distinction in [ASP.NET Core authentication overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-11.0).

Cookie handlers protect an authentication ticket for browser requests and commonly challenge with a login redirect. Bearer handlers validate tokens presented to APIs and commonly challenge with HTTP authentication semantics. An OIDC handler participates in a remote redirect/callback sign-in flow. It is not interchangeable with a JWT bearer validator. If both cookie and bearer schemes exist, select the intended scheme on endpoints or policies to avoid the wrong challenge/identity behavior.

## Mechanisms and relationships
Middleware order matters: endpoint routing must be established before endpoint-aware authorization; authentication must run before authorization so the principal is available. In a minimal-host pipeline, configure `UseAuthentication` and `UseAuthorization` before endpoint execution. Register handlers/options during service configuration. If a single scheme is registered ASP.NET Core may treat it as default; multiple schemes require clear selection. Avoid depending on implicit defaults in mixed browser/API applications.

Authorization combines requirements from selected metadata into a policy. Default policy is used for authorization metadata such as bare `[Authorize]`; fallback policy applies when an endpoint has no authorization metadata and a fallback is configured. These are distinct and default fallback behavior does not cover middleware that already served files earlier in the pipeline. Microsoft describes these rules in [policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies?view=aspnetcore-11.0).

Resource-based authorization cannot be fully decided by endpoint metadata before the resource loads. Load the record through a tenant-constrained query, then call `IAuthorizationService` with the user, resource, and policy/requirements. Requirements describe conditions; handlers evaluate them; call `Succeed` only when a requirement is met. Missing data or an exception should not accidentally authorize. A challenge asks for authentication; forbid signals an authenticated principal lacks permission.

## Worked examples
**Mixed application:** a browser page selects cookie authentication and may redirect to sign-in; an API endpoint selects bearer authentication and returns an API challenge. Separate schemes avoid accidental redirect behavior for API clients.

**Resource check:** endpoint requires authenticated user, loads a document, then checks ownership/tenant policy. A bare `[Authorize]` cannot know ownership before loading the document.

**Fallback:** set a fallback policy to require authenticated users broadly; explicitly allow anonymous health/login endpoints. Verify static files are not served before the protecting middleware if they also need authorization.

## Misconceptions and edge cases
- Registering authentication is not equivalent to protecting all endpoints.
- A bearer handler validates a token; OIDC handler conducts a remote protocol flow.
- Default policy and fallback policy apply in different metadata cases.
- `[AllowAnonymous]` can bypass authorization enforcement for an endpoint; use it deliberately.
- `ChallengeAsync` and `ForbidAsync` behavior depends on the selected scheme, so cookie redirects and API statuses may differ.
- A handler's `Fail` and `Succeed` affect the authorization context; design requirements so every required condition is satisfied explicitly.

## Knowledge checks with answers
1. Does AddAuthentication protect routes by itself? **No; authorization metadata or policy must enforce access.**
2. When is resource-based authorization called? **After loading the resource needed by the decision.**
3. Which policy applies when an endpoint has no auth metadata? **FallbackPolicy, if configured; otherwise no fallback restriction by default.**
