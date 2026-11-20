<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# ASP.NET Core authentication handlers identity and policies — Reference: Scheme registration, cookie/bearer handlers, events, and ticket operations

## Scope and version
This lesson covers the assigned ASP.NET Core 11 authentication surface and calls out relevant recent changes. See [authentication overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-11.0), [cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie?view=aspnetcore-11.0), and [JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication?view=aspnetcore-11.0). API names are explained conceptually without inventing overload signatures.

## How this group fits the mental model
A scheme name selects a credential-processing handler and its options. Handler events expose lifecycle points; ticket operations create or remove authenticated browser state. Choose the scheme and challenge behavior for the endpoint rather than assuming all credentials behave alike.

## Supplied names explained
- `AddAuthentication` — Registers authentication services and configures defaults through an authentication builder. It does not itself add endpoint authorization requirements.
- `AuthenticationOptions` — Options describing the application's default authentication/challenge/forbid scheme choices and related behavior.
- `DefaultScheme` — General fallback scheme used when a more specific default is not set. Since ASP.NET Core 7, a single registered scheme automatically becomes the default unless the behavior is disabled; multiple schemes do not select an implicit default. Mixed applications should choose defaults deliberately. See [the .NET 7 default-scheme change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/7/default-authentication-scheme?view=aspnetcore-10.0).
- `DefaultAuthenticateScheme` — Scheme used to authenticate the current request when no policy/endpoint specifies another.
- `DefaultChallengeScheme` — Scheme used when the framework challenges an unauthenticated request. Cookie and bearer schemes commonly produce different responses.
- `DefaultForbidScheme` — Scheme used when an authenticated user is forbidden. It may differ from the challenge scheme.
- `AuthenticationScheme` — Named configuration pairing a handler type and options. Names identify a processing path and should be selected consistently.
- `IAuthenticationSchemeProvider` — Service that enumerates and resolves registered schemes and defaults. Custom replacement affects application-wide resolution and should be rare.
- `IAuthenticationHandler` — Core handler contract for authentication-related operations under a scheme. Most apps use framework-provided handlers rather than implementing this interface directly.
- `AuthenticationHandler<TOptions>` — Base class for many authentication handlers with typed options and common scheme behavior. Custom handlers should follow framework lifecycle and failure semantics.
- `AuthenticationTicket` — Authentication result containing a principal and scheme/properties context. For cookie authentication, it is protected and serialized according to handler/Data Protection configuration.
- `AddCookie` — Registers cookie authentication under a scheme. It reads the authentication cookie, restores the principal, and handles sign-in/challenge/forbid according to options.
- `CookieAuthenticationOptions` — Settings for cookie name, paths, expiration, security attributes, events, and ticket behavior. Review browser and deployment implications rather than copying defaults blindly.
- `CookieAuthenticationEvents` — Event callbacks for cookie lifecycle such as signing in, validating a principal, and redirect decisions. Keep them efficient and fail safely. Since ASP.NET Core 10, known API endpoints no longer use cookie redirects for login/access-denied challenges; they return 401/403 based on endpoint metadata, not the request Accept header. See [API endpoint behavior](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/api-endpoint-auth?view=aspnetcore-10.0).
- `ValidatePrincipal event` — Cookie lifecycle hook for revalidating the principal against changed account/permission state. The event can run on each request when configured that way, which can be expensive; use a version/change marker or suitable cache invalidation strategy.
- `OnSigningIn event` — Callback invoked during cookie sign-in before the ticket is finalized, allowing controlled customization. Avoid adding stale or overbroad claims.
- `OnValidatePrincipal event` — Cookie event property that runs during principal validation. Reject/reissue the principal when account state requires it; do not perform fragile checks that can fail open.
- `ITicketStore` — Optional server-side store for authentication tickets referenced by a smaller cookie key, enabling centralized ticket management/revocation. It adds storage availability, cleanup, and scaling responsibilities.
- `AddJwtBearer` — Registers bearer-token authentication for requests carrying tokens. It validates tokens; it does not initiate an OIDC login redirect flow.
- `JwtBearerOptions` — Options for bearer token validation, authority/audience, metadata, events, and transport behavior. Configure issuer, audience, signing keys, and HTTPS metadata requirements appropriately.
- `TokenValidationParameters` — Validation configuration passed to token handlers, including signature/key, issuer, audience, lifetime, and algorithm expectations. Do not turn off validations to make a failing token pass.
- `TokenValidated event` — Callback after a bearer token passes configured validation. It can add application-specific checks, but must not treat validation as authorization or replace core token constraints.
- `AddOpenIdConnect` — Registers a remote OIDC authentication handler that redirects to an identity provider and processes the callback to establish local sign-in.
- `OpenIdConnectOptions` — Settings for authority, client registration, scopes, callback, sign-in scheme, and protocol events. Secrets belong only in confidential server deployments.
- `CallbackPath` — Local path where the remote handler receives the identity provider response. Route/proxy configuration and exact registered redirect URI must align.
- `SignInScheme` — Scheme used by a remote handler to persist the authenticated result, commonly a cookie scheme. It separates external protocol completion from local session persistence.
- `RemoteAuthenticationHandler` — Base handler for authentication protocols involving redirects to an external provider and callbacks. It has correlation/protocol responsibilities distinct from local token validation.
- `UseAuthentication` — Adds middleware that authenticates the current request and populates the principal using selected/default schemes. Place before middleware that needs the user and before authorization.
- `ChallengeAsync` — Invokes a scheme's challenge behavior when authentication is needed. A cookie scheme commonly redirects interactive requests, but ASP.NET Core 10+ known API endpoints return 401; bearer APIs commonly return a Bearer challenge.
- `ForbidAsync` — Invokes a scheme's forbidden behavior when the authenticated user lacks access. It is distinct from asking the user to authenticate.
- `SignInAsync` — Issues an authentication result through a selected scheme, often creating a protected cookie ticket. Do not call it before establishing trusted identity.
- `SignOutAsync` — Invokes a scheme's sign-out behavior, such as expiring a cookie or initiating remote sign-out. Clearing one local cookie may not revoke independent access/refresh tokens.
- `AuthenticationProperties` — Per-authentication operation state such as persistence, expiry, redirect, and items. Do not put secrets or untrusted return targets in it without protection/validation.
- `AuthenticationProperties.IsPersistent` — Controls whether a cookie sign-in persists beyond the browser session when used by cookie auth. Persistent sign-in should reflect user intent and must still have bounded expiry.
- `AuthenticationProperties.ExpiresUtc` — Sets an explicit ticket expiration time. It should align with application policy; it is not a universal server-side revocation mechanism.
- `AuthenticationProperties.RedirectUri` — Return location associated with an authentication operation. Validate or constrain it to avoid open redirects.

## Cross-item comparison
`AddCookie` restores a browser ticket and often challenges interactive requests with a redirect; ASP.NET Core 10+ known API endpoints use 401/403 instead. `AddJwtBearer` validates an API credential and typically emits a Bearer challenge. `AddOpenIdConnect` coordinates a remote redirect/callback; it is not the same as validating a JWT already sent to an API. `ITicketStore` adds server-side ticket state/revocation but also storage dependencies. See Microsoft [authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-11.0) and [cookie](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie?view=aspnetcore-11.0) docs.

## Examples
For browser/API separation, register cookie and bearer schemes and explicitly associate each endpoint policy with the intended scheme. Configure the bearer validation parameters to constrain trusted issuer, audience, signing keys, and lifetime. For remote OIDC, set a callback path matching provider registration and a cookie sign-in scheme. The redirect URI must be validated, not copied from arbitrary query input.

## Common mistakes
- Assuming `AddAuthentication` requires authentication on every route.
- Using the OIDC remote handler where only API bearer validation is needed.
- Disabling issuer/audience/signature checks to work around configuration errors.
- Using a client secret in browser/native distributed code.
- Assuming cookie challenges always redirect; known API endpoints return 401/403 starting in ASP.NET Core 10.
- Treating cookie expiration or `SignOutAsync` as revocation of unrelated tokens.
- Trusting `RedirectUri` from user-controlled request data.

## Knowledge checks with answers
1. Which method initiates remote OIDC? **`AddOpenIdConnect`.** 2. Which handler validates API bearer tokens? **`AddJwtBearer`.** 3. Which default controls unauthenticated behavior? **`DefaultChallengeScheme`.**
