# ASP.NET Core authentication principals claims roles authorization policies and handlers — Core concepts and how they fit together

## Learning objectives

By the end, you should be able to explain how a scheme selects a handler, distinguish authenticate/challenge/forbid, reason about named/default/fallback policies, explain requirement-handler composition, and choose between declarative endpoint authorization and imperative resource-based checks.

## Prerequisites

You should know basic HTTP, middleware order, dependency injection, endpoints, claims, and the authentication mechanisms described in the preceding Identity topic. This lesson treats an authentication handler as the producer of a principal and authorization as the consumer of that principal.

## Core concepts

### Schemes, handlers, and principals

An authentication **scheme** is a name tied to one handler and its options. The handler knows how to authenticate with a specific credential protocol. A cookie handler reads and validates a protected application ticket; a JWT bearer handler validates a token under a configured issuer/audience trust boundary; a remote OIDC handler redirects a browser and processes its callback. Registering multiple handlers is normal, but the app must select the right one through defaults, endpoint metadata, policy schemes, or explicit calls.

Authentication can perform different operations. **Authenticate** attempts to produce a principal from a request credential. **Challenge** asks an unauthenticated caller to authenticate; browser schemes often redirect while API schemes return 401. **Forbid** means authentication succeeded but authorization denied the request, commonly 403. Schemes may have separate default authenticate, challenge, and forbid handlers, so “the default scheme” is not always the whole configuration. [Authentication overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)

A `ClaimsPrincipal` contains one or more identities, each with claims. The handler's validation and claim mapping define what the app can trust. Claims are statements, not magic permissions: validate the issuer, normalize mapping, and ensure that the code consuming a claim uses the expected claim type and issuer. `IsAuthenticated` means an identity is marked authenticated; it does not mean a particular role, policy, or resource check succeeded.

### Policies select requirements

An authorization policy is a set of requirements and optionally authentication scheme names. In ordinary policy evaluation, **every requirement must be satisfied**. Multiple handlers can attempt the same requirement; one handler may succeed it while another remains silent. Explicitly calling `Fail` marks the authorization context failed and can prevent another handler from later satisfying the policy. This makes `Fail` stronger than simply not handling a requirement and should be reserved for an intentional denial.

Policy selection happens before the requirements are evaluated. A named policy applies when an endpoint names it. The default policy is used for bare authorization metadata such as `[Authorize]`/`RequireAuthorization()` when no explicit policy instance changes selection. A fallback policy applies only when the endpoint has no authorization metadata that produces a policy. It is not automatically added on top of every named or default policy. Multiple authorization metadata entries can combine, so inspect the combination behavior rather than assuming one attribute replaces another. [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)

### Middleware ordering and fallback coverage

`UseAuthentication` should run before `UseAuthorization`, because authorization needs the request principal. Authorization middleware acts on selected endpoints. A fallback policy protects requests that flow through that middleware and have no more specific authorization metadata; it does not reach a static file already served by earlier static-file middleware. A catch-all claim that “fallback secures the whole site” is therefore false unless the actual pipeline and all resource-serving paths are included in the design.

`[AllowAnonymous]` or endpoint `AllowAnonymous()` opts a route out of authorization failure handling. Authentication may still run and populate the principal, which can be useful for a public page that personalizes content. Public exceptions should be deliberate and narrow. [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)

### Requirements and handlers

A requirement expresses a rule, such as “must be older than a threshold” or “must own this document.” A handler evaluates a requirement using the principal and possibly a resource or injected service. If multiple requirements exist, all need success. If multiple handlers target one requirement, any can succeed it unless the context is explicitly failed. Handler invocation order should not be used as a business guarantee; each handler should be safe under the framework's evaluation model.

Some decisions depend on a database object that is loaded only after the route handler starts. Attribute-based authorization happens before that resource-loading method. The correct pattern is to load the resource, call `IAuthorizationService.AuthorizeAsync` with the principal and resource, then return a denial if the result fails. This is **imperative resource-based authorization**. Do not trust a route parameter or client-supplied owner field in place of the persisted resource. [Resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased)

### Dynamic policies and observability

A custom policy provider can construct policies from names at runtime, for example a carefully parsed `Permission:Invoices.Read` pattern. Validate the whole name grammar, define behavior for unknown names, and preserve fallback/default behavior where appropriate. A provider is not a license to parse arbitrary client input into authorization rules.

Authorization result diagnostics help identify which requirements failed or remain unmet, but logs should not reveal sensitive claims or resource details. Build diagnostics around stable requirement names and safe identifiers. For APIs, preserve the distinction between 401 (authentication challenge) and 403 (forbid after authentication), unless a documented protocol contract requires different handling.

## Mechanisms and relationships

| Mechanism | Input | Output | Key limitation |
|---|---|---|---|
| Authentication handler | Credential + scheme configuration | Principal or no result/failure | It authenticates only according to its scheme; it does not decide domain permission |
| Authorization policy | Endpoint metadata + principal | Requirement set to evaluate | Does not see a resource that has not yet been loaded |
| Requirement handler | Requirement + principal + optional resource | Succeeds, leaves pending, or explicitly fails | Must not treat missing/untrusted data as permission |
| Fallback policy | Endpoint with no policy-producing metadata | Baseline policy for middleware-covered requests | Does not protect resources served before authorization middleware |
| Resource authorization | Principal + loaded resource + named policy/requirements | Allow/deny result | Must be invoked on every relevant code path after resource loading |
| Policy provider | Policy name | Policy object | Must parse names strictly and define unknown-policy behavior |

## Worked examples

### Example 1: policy composition

Suppose an endpoint uses two policies: one requires the `employee` role and another requires a trusted `department` claim. The composed policy requires both conditions. A role claim alone does not satisfy the claim requirement, and an employee with the claim still cannot read a specific document unless its resource rule also succeeds. [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)

### Example 2: check an actual document

```csharp
var document = await repository.FindAsync(id);
if (document is null)
    return Results.NotFound();

var result = await authorization.AuthorizeAsync(
    httpContext.User, document, "CanReadDocument");

if (!result.Succeeded)
    return Results.Forbid();

return Results.Ok(document);
```

The policy is evaluated against the persisted document after it is loaded. Whether a missing document returns 404 or 403 is an application information-disclosure choice; use consistent behavior so the endpoint does not reveal protected resource existence inadvertently. [Resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased)

### Example 3: fallback policy and public route

An app can set a fallback policy requiring an authenticated principal, then mark intended public endpoints anonymous. But the middleware must run for the endpoint, and static-file middleware that serves a file earlier is not covered. A pipeline review must therefore include assets, health endpoints, callback routes, and other middleware-served resources. [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)

## Misconceptions and edge cases

- **“Authenticate, challenge, and forbid are the same.”** Authenticate creates a principal, challenge asks for credentials, and forbid rejects an authenticated but unauthorized request.
- **“A claim means a permission.”** A claim is input to a rule. Its issuer, type, value, freshness, and resource context determine how it should be trusted.
- **“Fallback policy is added to every policy.”** It is selected when no authorization policy is produced from endpoint metadata; it is not automatically layered on named/default policies.
- **“Fallback policy secures static files.”** Files served before authorization middleware are outside that policy path.
- **“Two handlers for a policy means either whole policy may pass.”** Requirements inside one policy are ANDed. Multiple handlers can cooperate on a requirement, but every distinct requirement must succeed.
- **“A handler returning without success is always a denial.”** It may leave the requirement pending for another handler. Explicit `Fail` records a hard failure.
- **“`[Authorize]` can decide ownership.”** It runs before the resource is loaded; invoke resource authorization after loading the object.
- **“The route's user ID proves ownership.”** Route/query/body values are caller input. Compare the authenticated principal with authoritative persisted ownership data.
- **“401 and 403 can be interchanged.”** Clients interpret them differently: 401 calls for authentication; 403 indicates authenticated denial.

## Knowledge checks with answers

1. **What is the scheme's role?** It selects a named handler and its options for a credential protocol and its authenticate/challenge/forbid behavior.
2. **How are two requirements in one policy combined?** All requirements must succeed; handlers may cooperate to satisfy a requirement.
3. **When is a fallback policy selected?** When authorization middleware processes a request and its endpoint metadata did not produce another authorization policy.
4. **Why doesn't a fallback policy protect a static file served earlier?** That response never reaches authorization middleware.
5. **When should `IAuthorizationService` be invoked with a resource?** After the app loads the actual resource, before returning or mutating it.
6. **What distinguishes challenge from forbid?** Challenge is for a caller not authenticated under the selected scheme; forbid is for an authenticated caller denied by policy.

## Sources

- [Overview of ASP.NET Core authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)
- [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)
- [Resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased)
