<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# ASP.NET Core authentication handlers identity and policies — Interview questions and reasoning

## Core questions
1. What is an ASP.NET Core authentication scheme?
2. Distinguish default and fallback authorization policies.
3. Why does resource authorization often require imperative checks?

## Concise interview answers
1. A named mapping of handler and options that determines how a credential is processed and how authenticate/challenge/forbid operations behave. See [Microsoft authentication overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-11.0) and [API endpoint behavior](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/api-endpoint-auth?view=aspnetcore-10.0).
2. DefaultPolicy is used for authorization metadata such as bare `[Authorize]`; FallbackPolicy is used for endpoints with no authorization metadata when configured. They are not interchangeable.
3. Endpoint attributes are evaluated before the endpoint loads the resource, so an ownership or tenant decision needs the actual object. Load it, then call the authorization service. See [resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resource-based?view=aspnetcore-11.0).

## Deep follow-up answers
**Why separate cookie and bearer schemes?** Cookies are automatically sent by browsers; cookie challenge behavior depends on endpoint type and framework version. Since ASP.NET Core 10, recognized API endpoints using cookies return 401/403, while web pages commonly redirect. Bearer handlers validate explicitly presented tokens and produce bearer challenges. Explicit scheme selection prevents response and identity confusion.

**What is the OIDC handler's role?** It performs a remote redirect/callback protocol interaction and can sign the resulting principal into a local scheme. A JWT bearer handler validates a token already presented to an endpoint; it does not conduct browser sign-in.

**What does a fallback policy miss?** It applies through authorization middleware when endpoint metadata is absent. Static-file middleware earlier in the pipeline may serve content before that middleware; secure such assets separately or order the pipeline appropriately. See [Microsoft policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies?view=aspnetcore-11.0).

## Scenario questions
- A logged-in user can access another tenant's document: require resource authorization after tenant-constrained loading.
- API clients receive login HTML: inspect challenge scheme and endpoint scheme selection.
- A user is authenticated but lacks a requirement: return forbid semantics, not challenge.
- A JWT validation fails on issuer: correct trusted authority/configuration rather than disabling validation.

## Tradeoffs and alternatives
Cookie auth suits browser sessions; bearer validation suits APIs; remote OIDC supports federated sign-in. Combining schemes is useful but requires explicit identity and challenge selection. Declarative policies aid coverage and visibility; resource checks need imperative evaluation after loading. Use custom handlers/filters only when built-in policies and handlers do not express the required rule.

## Common weak answers
- “AddAuthentication protects all routes.” It configures authentication, not universal authorization.
- “Fallback is the default policy.” They apply under different metadata conditions.
- “JWT bearer is OIDC.” One validates a presented token; the other participates in a remote sign-in flow.
- “The attribute can check ownership.” Not before the resource is loaded.

## Self-check rubric
You can trace scheme selection, middleware order, endpoint policy composition, resource loading, and challenge/forbid outcomes. You distinguish public exceptions and explain how to cover unannotated endpoints without overlooking earlier middleware.
