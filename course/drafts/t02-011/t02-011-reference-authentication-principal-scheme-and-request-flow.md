# ASP.NET Core authentication principals claims roles authorization policies and handlers — Reference: Authentication middleware, schemes, principal creation, challenges, and forbids

## Scope and version

This reference covers the ASP.NET Core authentication scheme, service, handler, principal, and request-middleware layer. A scheme identifies a handler and its options; default scheme behavior depends on the number and configuration of registered schemes. [Authentication overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/) [IAuthenticationHandler API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authentication.iauthenticationhandler)

## How this group fits the mental model

Authentication produces the principal that authorization evaluates. Scheme defaults can differ for authenticate, challenge, forbid, sign-in, and sign-out, so registering cookie, JWT, and remote OIDC handlers requires deliberate selection. The middleware invokes authentication for the current request; endpoint authorization and the selected handler later decide whether to challenge or forbid.

## Supplied names explained

### Service registration and scheme metadata

| Supplied name | Meaning and use |
|---|---|
| `AddAuthentication` | Service-registration entry point that returns an authentication builder. Use an overload to set defaults when multiple handlers or distinct browser/API behavior exist. |
| `AddAuthentication(IServiceCollection)` | No-default overload that adds core authentication services and returns the builder for handler registrations. A single registered scheme may be auto-selected as default by framework behavior. |
| `AddAuthentication(String)` | Sets the default scheme name for operations that do not specify a more specific default. It may populate several defaults, so it is not a replacement for understanding separate authenticate/challenge/sign-in needs. |
| `AddAuthentication(Action<AuthenticationOptions>)` | Configures the scheme defaults explicitly through an options callback. Prefer explicit defaults where cookie redirects and API bearer responses differ. |
| `AuthenticationBuilder` | Fluent builder used to register one or more authentication handlers and schemes in dependency injection. |
| `AuthenticationOptions` | Holds the default scheme names used by the authentication service when a call does not name a scheme. |
| `AuthenticationOptions.DefaultScheme` | Fallback default scheme used for authentication operations when a more specific default is not set. It can set the defaults for multiple operation types. |
| `AuthenticationOptions.DefaultAuthenticateScheme` | Scheme used by default to authenticate a request and produce `HttpContext.User`. |
| `AuthenticationOptions.DefaultChallengeScheme` | Scheme used to challenge a caller when authentication is needed; a web scheme may redirect while an API scheme commonly returns 401. |
| `AuthenticationOptions.DefaultForbidScheme` | Scheme used to forbid an already-authenticated principal that lacks permission. It may differ from the challenge scheme. |
| `AuthenticationOptions.DefaultSignInScheme` | Scheme used when sign-in issues a ticket and no explicit sign-in scheme is supplied, often a cookie in a remote OIDC flow. |
| `AuthenticationOptions.DefaultSignOutScheme` | Scheme used for sign-out when a call does not explicitly identify which credential/session to clear. |
| `AddScheme<TOptions,THandler>` | Registers a concrete handler under a scheme name and configures its options. Each registered name creates a separately addressable handler configuration. |
| `AuthenticationScheme` | Runtime descriptor associating a scheme name, optional display name, and handler type. |
| `AuthenticationScheme.Name` | The identifier used by policies, defaults, and authentication calls to select a scheme. |
| `AuthenticationScheme.DisplayName` | Human-readable display name, primarily for UI/provider selection rather than protocol security. |
| `AuthenticationScheme.HandlerType` | The handler class associated with the scheme. It indicates which credential protocol and operations implement that scheme. |
| `IAuthenticationSchemeProvider` | Abstraction that stores registered scheme metadata and resolves default or named schemes for authentication services. |
| `IAuthenticationSchemeProvider.GetDefaultAuthenticateSchemeAsync` | Resolves the current default authenticate scheme, including fallback to general default behavior. |
| `IAuthenticationSchemeProvider.GetDefaultChallengeSchemeAsync` | Resolves the default handler that should challenge when credentials are missing or invalid. |
| `IAuthenticationSchemeProvider.GetDefaultForbidSchemeAsync` | Resolves the default handler for an authenticated authorization failure. |
| `IAuthenticationSchemeProvider.GetSchemeAsync` | Looks up one registered scheme by name; a missing name means no handler configuration is available under that identifier. |
| `IAuthenticationSchemeProvider.GetAllSchemesAsync` | Lists all registered schemes, useful for diagnostics/provider-selection UI but not a user-controlled authorization decision. |

### Handlers and the authentication service

| Supplied name | Meaning and use |
|---|---|
| `IAuthenticationHandler` | Contract for a handler initialized for a scheme/request and asked to authenticate, challenge, or forbid. Concrete handlers own protocol-specific behavior. |
| `IAuthenticationHandler.InitializeAsync` | Initializes the handler with its scheme and current `HttpContext` before any operation. A handler is request-scoped in its operational context. |
| `IAuthenticationHandler.AuthenticateAsync` | Attempts to validate the request's credential and return an `AuthenticateResult`, possibly containing a principal/ticket. |
| `IAuthenticationHandler.ChallengeAsync` | Produces a challenge response for a caller who is not authenticated under the requested scheme. Response style is handler-specific. |
| `IAuthenticationHandler.ForbidAsync` | Produces a denial response for an authenticated principal who is not authorized. It is distinct from asking the caller to sign in. |
| `IAuthenticationService` | Higher-level service that dispatches authenticate/challenge/forbid/sign-in/sign-out operations to the named or default handler. |
| `IAuthenticationService.AuthenticateAsync` | Invokes a scheme's handler to authenticate the current request, using a default if no scheme is passed. |
| `IAuthenticationService.ChallengeAsync` | Invokes the chosen challenge handler, commonly for an unauthenticated endpoint request. |
| `IAuthenticationService.ForbidAsync` | Invokes the chosen forbid handler after authorization denies an authenticated caller. |
| `IAuthenticationService.SignInAsync` | Requests that a selected sign-in-capable scheme issue a ticket for a principal. It does not validate credentials; call it only after a trusted sign-in result. |
| `IAuthenticationService.SignOutAsync` | Requests that a selected scheme remove/clear its credential or session. It does not necessarily revoke upstream or independent tokens. |
| `AuthenticationService` | Framework implementation of `IAuthenticationService`; it resolves schemes and delegates operations to handlers. |
| `AuthenticationMiddleware` | Middleware that authenticates the current request using the default authenticate scheme and assigns the resulting principal when authentication succeeds. |
| `UseAuthentication` | Adds authentication middleware to the pipeline. It should run before authorization middleware so `HttpContext.User` is ready for policy evaluation. |
| `WebApplication automatic authentication and authorization middleware` | `WebApplication` automatically inserts authentication and authorization after routing when the corresponding services are registered and the app hasn't added them explicitly. Add the middleware explicitly when controlling order (for example, around CORS); keep authentication before authorization. [Middleware guidance](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/middleware?view=aspnetcore-11.0) |

### Results, principals, and authentication properties

| Supplied name | Meaning and use |
|---|---|
| `AuthenticateResult` | Result of an authentication attempt, representing success, failure, or no credential/result. |
| `AuthenticateResult.Success` | Factory for a successful result containing an `AuthenticationTicket`. |
| `AuthenticateResult.Fail` | Factory for a failed result with an exception or failure description. Do not turn validation failures into successful anonymous fallback without deliberate policy. |
| `AuthenticateResult.NoResult` | Indicates the handler found no credential/result to process. It is not the same as a credential that was presented and rejected. |
| `AuthenticateResult.Succeeded` | Indicates the result contains a successful authentication ticket. |
| `AuthenticateResult.None` | Boolean property that is true when the handler returned no authentication information. `AuthenticateResult.NoResult()` is the factory that produces that state; `None` is not itself a result object. [API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authentication.authenticateresult?view=aspnetcore-11.0) |
| `AuthenticateResult.Failure` | Failure exception associated with a failed result, if present. Avoid returning raw details to external callers. |
| `ClaimsPrincipal` | Container for one or more identities and their claims. Authorization evaluates this principal, but claims only carry trusted meaning when handler validation and mapping establish it. |
| `ClaimsIdentity` | Collection of claims with an authentication type and claim interpretation settings. Multiple identities can be present on one principal. |
| `HttpContext.User` | Principal assigned to the current HTTP request. It may be anonymous if no handler authenticated the request. |
| `AuthenticationTicket` | Couples a principal, authentication properties, and scheme into the unit a ticket-producing handler issues/consumes. |
| `AuthenticationProperties` | Per-authentication-operation metadata such as expiration, redirect, persistence, or saved tokens. Avoid storing secrets unnecessarily. |
| `AuthenticationProperties.Items` | String key/value state serialized with the ticket. Treat it as sensitive ticket data and keep it small. |
| `AuthenticationProperties.Parameters` | Per-operation parameters passed through authentication APIs, generally in-memory/non-persistent unless the handler uses them. Do not assume they are serialized ticket claims. |
| `AuthenticationProperties.IsPersistent` | Requests a browser-persistent cookie when a cookie handler issues a sign-in. It does not define or extend the server ticket's expiration. |
| `AuthenticationProperties.ExpiresUtc` | Explicit ticket expiration for a sign-in. Handler policy may apply defaults when it is absent. |
| `AuthenticationProperties.RedirectUri` | Return location associated with an authentication operation. Validate it before redirecting to prevent open redirects. |
| `AuthenticationProperties.AllowRefresh` | Indicates whether the handler may refresh/renew the ticket in supported flows. It is not a maximum-session-age control. |
| `AuthenticationProperties.StoreTokens` | Extension method that places named external tokens into authentication properties. Saved credentials increase ticket sensitivity and may enlarge a cookie. |
| `AuthenticationProperties.GetTokenValue` | Extension method that retrieves a named token from authentication properties. Handle the result as a secret. |
| `AuthenticationProperties.GetTokens` | Extension method returning tokens saved in authentication properties. Avoid logging or exposing the collection. |
| `Authentication failure versus no result` | Failure means a credential/attempt was processed and rejected; no result means the handler did not find a credential to authenticate. Fallback behavior should not accidentally turn invalid credentials into an accepted alternate identity. |
| `Challenge versus forbid` | Challenge asks an unauthenticated caller to authenticate; forbid reports that an authenticated caller is not permitted. The distinction commonly maps to 401 versus 403 for APIs. |
| `Single registered scheme default behavior` | Starting in ASP.NET Core 7, a single registered scheme is automatically treated as the default unless the compatibility switch suppresses it. This can affect when options validate and which handler is selected. |
| `Multiple scheme default selection` | With multiple schemes, configure defaults or specify scheme names in policies/calls. Otherwise the framework may not know which handler should authenticate or challenge. |
| `SuppressAutoDefaultScheme AppContext switch` | Compatibility switch `Microsoft.AspNetCore.Authentication.SuppressAutoDefaultScheme` disables automatic default selection when exactly one scheme is registered. Use only when intentionally preserving older selection behavior. |

## Cross-item comparison

| Operation | Meaning | Typical API response |
|---|---|---|
| Authenticate | Try to create a principal from the request credential | Success, failure, or no result |
| Challenge | Ask a caller without acceptable authentication to authenticate | API 401 or interactive redirect |
| Forbid | Reject a caller who is authenticated but unauthorized | API 403 or interactive access-denied response |
| Sign in | Issue a ticket after a trusted authentication flow | Usually writes an application cookie |
| Sign out | Clear a selected local session/credential | Does not automatically revoke every upstream or copied token |

## Examples

### Set distinct API/browser defaults

```csharp
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
});
```

This is a common interactive web setup where the cookie authenticates local requests and OIDC challenges the browser. API endpoints that accept bearer tokens should name that scheme through their policy/metadata rather than assuming this browser challenge is appropriate. [Authentication overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)

### Inspect an authentication result safely

```csharp
var result = await httpContext.AuthenticateAsync("ApiBearer");
if (result.Succeeded)
{
    var principal = result.Principal;
    // Continue to authorization; authentication does not grant every permission.
}
else if (result.Failure is not null)
{
    // Record safe diagnostics; do not return raw token or exception details.
}
```

An explicit scheme is useful when more than one handler is registered. Do not interpret `NoResult` as evidence that a different credential should automatically be trusted.

## Common mistakes

- Registering multiple schemes without defaults or policy metadata that chooses one.
- Assuming a general `DefaultScheme` always matches the distinct authenticate, challenge, forbid, sign-in, and sign-out use cases.
- Treating `NoResult` and `Fail` as interchangeable.
- Using a browser redirect challenge for API clients that expect 401.
- Returning 401 for an authenticated principal that failed authorization instead of 403.
- Calling `SignInAsync` as though it verifies a password or token.
- Treating claim existence as authorization without checking issuer/type/value/resource.
- Assuming an authentication property is safe to expose because it is not a claim.

## Knowledge checks with answers

1. **What does a scheme name identify?** A handler and its option configuration.
2. **What is the difference between `NoResult` and `Fail`?** No result means no credential/result was produced; failure means an attempt was rejected.
3. **Why might a web app use cookie authenticate and OIDC challenge schemes?** The cookie represents the local app session while OIDC redirects the user to a remote provider when authentication is required.
4. **What happens when only one scheme is registered by default?** Since ASP.NET Core 7 it is auto-selected unless the documented compatibility switch suppresses that behavior.
5. **Does sign-out revoke an external provider session?** No. It signs out the selected local scheme; remote/provider sessions and copied tokens have separate lifecycles.

## Sources

- [Overview of ASP.NET Core authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)
- [IAuthenticationHandler API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authentication.iauthenticationhandler)
