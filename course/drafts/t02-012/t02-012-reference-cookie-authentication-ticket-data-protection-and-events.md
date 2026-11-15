# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Reference: Cookie scheme ticket lifecycle, options, browser attributes, and events

## Scope and version

Cookie authentication serializes an `AuthenticationTicket`, protects it with Data Protection, and sends it to the browser. The cookie handler validates/unprotects the ticket on later requests and can renew or reject it. Cookie settings control server ticket lifetime, browser persistence, transport, cross-site behavior, and event hooks. Protect the Data Protection key ring and add antiforgery protection for state-changing requests authenticated through browser cookies. [Cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie) [Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)

## How this group fits the mental model

The browser holds a protected ticket, not the server's master key. `ExpireTimeSpan` and ticket properties control authentication validity; cookie expiration controls browser persistence. Sliding renewal can extend a session while the user remains active, so impose policy appropriate to the product. Shared replicas need compatible Data Protection configuration. Cookie events let an app validate/transform the principal and customize redirects, but should remain fast and safe under parallel requests.

## Supplied names explained

### Registration, scheme, and options

| Supplied name | Explanation |
|---|---|
| `AddCookie` | Registers cookie authentication for a scheme, optionally configuring handler options. |
| `CookieAuthenticationDefaults.AuthenticationScheme` | Conventional default cookie scheme name used by Identity and cookie authentication configuration. |
| `CookieAuthenticationOptions` | Settings for cookie name/attributes, ticket lifetime, redirect paths, events, session store, and ticket format. |
| `CookieAuthenticationOptions.Cookie` | `CookieBuilder` settings controlling browser cookie name, path, domain, secure policy, HttpOnly, and SameSite. |
| `CookieAuthenticationOptions.Cookie.Name` | Cookie name sent in the browser request; choose a stable non-sensitive name. |
| `CookieAuthenticationOptions.Cookie.Domain` | Domain scope for the cookie; broad domains increase which subdomains receive it, so prefer host-only scope unless needed. |
| `CookieAuthenticationOptions.Cookie.Path` | URL path scope sent by the browser. It is not an authorization boundary. |
| `CookieAuthenticationOptions.Cookie.HttpOnly` | Prevents JavaScript from reading the cookie, reducing direct token theft via XSS but not preventing XSS actions. |
| `CookieAuthenticationOptions.Cookie.SecurePolicy` | Controls whether the browser cookie is sent only over HTTPS; production cookies should be secure. |
| `CookieAuthenticationOptions.Cookie.SameSite` | Controls cross-site cookie sending behavior; coordinate with OIDC callbacks and CSRF protection. |
| `CookieAuthenticationOptions.ExpireTimeSpan` | Default authentication-ticket lifetime; a ticket can expire independently of persistent-cookie browser expiry. |
| `CookieAuthenticationOptions.SlidingExpiration` | Renews an eligible ticket during active use; it is not a fixed absolute session deadline. |
| `CookieAuthenticationOptions.LoginPath` | Path used for a login redirect when a browser request is unauthenticated. |
| `CookieAuthenticationOptions.LogoutPath` | Path recognized for logout redirect behavior; it does not itself implement an authorized logout endpoint. |
| `CookieAuthenticationOptions.AccessDeniedPath` | Redirect target for a browser user who is authenticated but forbidden. |
| `CookieAuthenticationOptions.ReturnUrlParameter` | Query parameter carrying the original local return path on redirects; validate destinations to avoid open redirects. |
| `CookieAuthenticationOptions.Events` | Inline event callbacks for authentication lifecycle customization. |
| `CookieAuthenticationOptions.EventsType` | DI-resolved event class alternative to inline callbacks; lifetime and dependencies must fit request processing. |
| `CookieAuthenticationOptions.SessionStore` | Optional `ITicketStore` that keeps the ticket server-side and places a session key in the browser cookie. |
| `CookieAuthenticationOptions.TicketDataFormat` | Protects/unprotects the serialized ticket, normally through the app's Data Protection system. |
| `CookieAuthenticationOptions.CookieManager` | Handles cookie read/write/chunking behavior for the handler. |

### Event lifecycle and tickets

| Supplied name | Explanation |
|---|---|
| `CookieAuthenticationEvents` | Virtual event callbacks for validation, redirects, signing in/out, and post-sign-in notification. |
| `CookieAuthenticationEvents.ValidatePrincipal` | Per-request validation hook; use it to reject a stale/revoked principal, keeping checks efficient. |
| `CookieAuthenticationEvents.RedirectToLogin` | Controls the challenge redirect to login; APIs may instead return 401 rather than HTML redirects. |
| `CookieAuthenticationEvents.RedirectToAccessDenied` | Controls redirect behavior when authenticated access is denied. |
| `CookieAuthenticationEvents.SigningIn` | Runs before issuing the cookie, allowing controlled principal/property adjustments. |
| `CookieAuthenticationEvents.SignedIn` | Runs after sign-in cookie creation; avoid making the auth response depend on slow nonessential work. |
| `CookieAuthenticationEvents.SigningOut` | Runs during sign-out so application state can be handled before the local ticket is cleared. |
| `CookieValidatePrincipalContext` | Context for principal validation, including the current principal and ability to reject/reissue it. |
| `CookieSigningInContext` | Context for ticket/principal customization during sign-in. |
| `CookieSignedInContext` | Context after the cookie has been issued. |
| `CookieSigningOutContext` | Context while the sign-out operation is being processed. |
| `CookieAuthenticationHandler` | Authentication handler that reads, validates, challenges, signs in, and signs out using a protected ticket. |
| `AuthenticationTicket` | Principal plus authentication properties serialized/protected as the cookie payload (or stored server-side when a session store is used). |
| `AuthenticationProperties.IsPersistent` | Requests a persistent browser cookie; user-facing “remember me” should be explicit and consent/policy-aware. |
| `AuthenticationProperties.ExpiresUtc` | Per-ticket absolute expiry override when provided; must be coordinated with cookie and session policy. |
| `AuthenticationProperties.AllowRefresh` | Controls whether the ticket may be refreshed by sliding-expiration behavior. |
| `AuthenticationProperties.RedirectUri` | Redirect target associated with an authentication operation; validate it as local/expected before redirecting. |
| `AuthenticationProperties.StoreTokens` | Stores provider tokens in authentication properties; can enlarge the ticket and make tokens available in the cookie/session store. |
| `AuthenticationProperties.GetTokenValue` | Retrieves a token saved in the authentication properties; protect it as a credential. |
| `HttpContext.SignInAsync` | Signs in a principal by issuing a ticket through the selected authentication scheme. |
| `HttpContext.SignOutAsync` | Signs out through the selected scheme, typically deleting the browser cookie; it does not revoke unrelated bearer tokens. |

### Expiry, protection, and cross-site concerns

| Supplied name | Explanation |
|---|---|
| `Cookie authentication ticket versus browser cookie expiration` | Ticket validity is checked by the server; persistent-cookie expiry controls browser storage/sending. Either can end the usable session. |
| `Sliding expiration renewal` | Active requests can renew the ticket when renewal rules permit; add an absolute lifetime/re-authentication policy if required. |
| `Absolute expiration with ExpiresUtc` | Sets an explicit ticket expiration for the sign-in; it bounds session age independently of ordinary renewal intent. |
| `Persistent cookie consent choice` | “Remember me” changes browser persistence and risk window; make the choice visible and follow privacy/product policy. |
| `Cookie Secure and HttpOnly attributes` | Secure limits transmission to HTTPS; HttpOnly blocks script access to the cookie value but does not prevent CSRF or XSS actions. |
| `SameSite cookie policy` | Browser cross-site sending control; OIDC cross-site redirects and embedded flows may need carefully selected values plus state/nonce and antiforgery defenses. |
| `Data Protection ticket encryption` | Protects ticket confidentiality/integrity; it relies on protected keys and does not encrypt unrelated application data. |
| `Data Protection key ring sharing across replicas` | Instances need a shared protected key ring/application identity to read each other's tickets and other protected payloads. |
| `Security stamp validation` | Compares ticket identity with current account security state so selected changes can invalidate sessions. |
| `SecurityStampValidatorOptions.ValidationInterval` | Controls how often cookie principals are checked against the current security stamp; shorter intervals improve revocation responsiveness but add store reads. |
| `ISecurityStampValidator` | Contract invoked to validate and potentially refresh a principal based on the user's security stamp. |
| `Cookie principal revalidation` | Re-checks current account state/claims and can reject or renew a ticket; do not assume all claims update automatically. |
| `Cookie chunking` | Splits an oversized cookie into multiple cookie headers/chunks; browser/proxy header limits still apply, so keep tickets small. |
| `Cookie authentication event customization` | Extension points for lifecycle behavior; keep callbacks bounded and avoid trusting request-controlled claims. |
| `Cookie versus server-side session storage` | Self-contained protected ticket avoids a lookup but increases cookie size; `SessionStore` reduces browser payload at the cost of server storage/availability. |
| `Cookie authentication cross-site request risk and antiforgery` | Browsers attach cookies automatically, so state-changing requests need CSRF defenses even when cookies are `HttpOnly` and `Secure`. |

## Cross-item comparison

`ExpireTimeSpan` supplies a default ticket lifetime; `ExpiresUtc` sets a particular ticket's absolute expiry. `IsPersistent` changes browser retention, not the server's trust model. Sliding expiration renews activity-based sessions; security-stamp validation checks current account state on an interval. A self-contained ticket and `SessionStore` trade browser size/lookup cost against server-side storage availability. None removes CSRF or Data Protection key-management requirements.

## Examples

```csharp
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "__Host-Academy.Auth";
        options.Cookie.Path = "/";
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
        options.SlidingExpiration = true;
        options.LoginPath = "/account/login";
        options.AccessDeniedPath = "/account/denied";
    });
```

Choose cookie name/path/domain/SameSite based on deployment and OIDC callback behavior. A `__Host-` prefix requires Secure, path `/`, and no Domain attribute. For unsafe browser requests, also configure antiforgery validation. Shared replicas need a protected shared Data Protection key ring; do not disable protection merely to make cookies portable.

## Common mistakes

- Treating the browser cookie expiry as the only ticket lifetime check.
- Enabling sliding expiration without a maximum session age or re-authentication policy where one is required.
- Using broad cookie domains so unrelated subdomains receive the credential.
- Assuming `HttpOnly` prevents CSRF or all consequences of XSS.
- Changing `SameSite` to `None` without Secure, callback testing, state/nonce validation, and CSRF analysis.
- Saving large provider token sets in the cookie and exceeding browser/proxy header limits.
- Using an unshared Data Protection key ring across replicas, causing random logout/decryption failures.
- Calling `SignOutAsync` and assuming it revokes stateless access tokens.
- Doing slow database/network work in cookie events on every request.
- Redirecting APIs to HTML login pages instead of returning expected 401/403 challenges.

## Knowledge checks with answers

1. **Does `IsPersistent` determine ticket validity?** It controls browser persistence; ticket expiry is separately enforced by authentication properties/options.
2. **What happens if replicas do not share keys?** A different replica may be unable to unprotect the ticket, causing authentication failures.
3. **Does `HttpOnly` stop CSRF?** No. The browser still sends the cookie automatically; use antiforgery defenses for unsafe requests.
4. **Why use a server-side ticket store?** To keep a large ticket out of browser headers, at the cost of server-side lookup/storage.

## Sources

[Cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie) · [Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)
