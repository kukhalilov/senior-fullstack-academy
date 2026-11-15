<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# ASP.NET Core authentication handlers identity and policies — Exercises and worked solutions

## Goals
Diagnose scheme selection and middleware order, choose policy behavior, and place resource checks where the data is available.

## Worked example
A single application uses cookie sign-in for web pages and bearer tokens for an API. If the API uses the cookie challenge scheme by accident, an unauthenticated client may receive an HTML login redirect instead of an API challenge. Associate endpoints with the intended scheme and challenge behavior. Microsoft describes schemes in [authentication overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-11.0).

## Exercises
1. `AddAuthentication().AddCookie()` is configured, but all routes are assumed protected. What is missing?
2. An API validates an OIDC ID token using its bearer handler and treats its subject as API permission. Identify two problems.
3. A document authorization attribute checks ownership, but the document is loaded only inside the endpoint. Where should the check move?
4. A team sets DefaultPolicy and expects all unannotated endpoints to require login. Which policy is relevant?
5. `UseAuthorization` runs before routing and a fallback policy is configured. What should be reviewed?

## Progressive hints
1. Authentication and authorization are separate. 2. Token purpose and resource permission differ. 3. The resource must exist before inspection. 4. Bare metadata differs from no metadata. 5. Authorization needs endpoint metadata.

## Complete solutions
1. Add authorization metadata to protected endpoints or configure a FallbackPolicy; authentication registration alone does not require sign-in.
2. An ID token is intended for the OIDC client, not the resource API; and authentication identity does not itself authorize API operations. Validate an access token for the API audience and apply an authorization policy.
3. Load the resource, then call `IAuthorizationService` with principal and resource. Microsoft notes that resource authorization is imperative because attributes run before resource loading: [resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resource-based?view=aspnetcore-11.0).
4. FallbackPolicy applies when the endpoint has no authorization metadata. DefaultPolicy applies when bare authorization metadata is present. See [policy documentation](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies?view=aspnetcore-11.0).
5. Ensure routing establishes endpoint metadata before authorization evaluates it, and authentication runs before authorization. Also verify endpoints/static files served earlier are protected by the intended mechanism.

## Tests and edge cases
- Browser unauthenticated request: cookie challenge behavior is deliberate.
- API unauthenticated request: bearer challenge behavior is deliberate and not an HTML redirect.
- Authenticated but unauthorized request: forbid behavior is distinct from challenge.
- Unannotated endpoint under configured fallback: requires authenticated principal.
- Endpoint with `[AllowAnonymous]`: explicitly public despite broader policy configuration.
- Resource missing or tenant mismatch: fail closed without leaking sensitive existence information.

## Reflection questions
Which schemes can populate a principal on each endpoint? Is challenge behavior appropriate for the client? Which route groups have no metadata? Does a static file need protection? Are resource checks performed on every path?
