<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# ASP.NET Core authentication handlers identity and policies — Big-picture orientation and mental model

## Problem and purpose
ASP.NET Core applications need to turn credentials into a request principal, then decide whether that principal may use an endpoint or resource. Registration, middleware order, and endpoint policy are separate parts of the pipeline; configuring a handler alone does not protect routes.

## Plain-language mental model
An authentication **scheme** is a named recipe: it pairs a handler with options and defines how authentication, challenges, and forbids work. Authentication middleware runs the selected scheme and populates `HttpContext.User`. Authorization middleware combines endpoint metadata into requirements and evaluates them. A policy is the rule; a requirement is a condition; a handler evaluates that condition.

## How the parts fit together
At startup, register schemes and policies. In the request pipeline, routing identifies endpoint metadata; authentication builds the principal; authorization applies the endpoint's policy; the endpoint runs only if permitted. Resource-dependent decisions happen after loading the resource. `WebApplication` inserts standard routing/authentication/authorization middleware in common configurations. Since ASP.NET Core 10, cookie challenges to recognized API endpoints return 401/403 instead of redirects; see [API endpoint behavior](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/api-endpoint-auth?view=aspnetcore-10.0). Microsoft documents the current model in [ASP.NET Core authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-11.0) and [authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction?view=aspnetcore-11.0).

## Concept map
- **Schemes and handlers:** cookies restore browser sign-in; JWT bearer handlers validate API tokens; OIDC remote handlers conduct redirects and callbacks.
- **Middleware:** `UseAuthentication` establishes the principal; `UseAuthorization` enforces endpoint rules.
- **Policy:** requirements compose; handlers evaluate; a policy succeeds only when its requirements are satisfied.
- **Outcome:** unauthenticated requests are challenged; authenticated but unauthorized requests are forbidden.

## End-to-end walkthrough
Register a cookie scheme for browser sessions and a bearer scheme for API calls. Route a browser endpoint to the cookie scheme and an API endpoint to bearer validation, avoiding ambiguous defaults. Authentication middleware reads the credential and sets the principal. Authorization evaluates the endpoint's policy. A user's invoice endpoint loads the invoice and calls resource authorization to check tenant and owner. If no valid identity exists, challenge; if an authenticated identity lacks access, forbid. Microsoft describes resource authorization as imperative because endpoint attributes run before the resource is loaded ([resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resource-based?view=aspnetcore-11.0)).

## When to use it and tradeoffs
Use cookie authentication for browser sessions, bearer validation for APIs, and remote OIDC when delegating interactive sign-in. These handlers have different redirects and credential properties. A JWT bearer handler validates already issued tokens; it is not the OIDC browser sign-in protocol. Configure explicit schemes when multiple identity sources exist. Use a fallback policy for broad secure-by-default endpoint coverage and explicitly mark intended public endpoints; verify static-file middleware placement separately.

## What later lessons cover
The next lesson explains the frozen scheme/handler APIs and their events. A reference covers policies and resource checks. Practice traces challenges, forbids, and policy selection in representative request paths.
