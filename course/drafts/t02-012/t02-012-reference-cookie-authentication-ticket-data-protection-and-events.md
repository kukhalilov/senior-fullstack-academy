# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Reference: Cookie scheme ticket lifecycle, options, browser attributes, and events

## Scope and version

This lesson covers ASP.NET Core cookie authentication and the cookie ticket lifecycle. A browser cookie transports a protected ticket; it is not a database session by default and does not automatically imply server-side session storage. Use the current framework API reference and test behavior behind the production proxy/browser topology. [Cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie) [Identity configuration](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration)

## How this group fits the mental model

The handler reads the named cookie, unprotects and validates its ticket with Data Protection, then creates an authenticated principal. On sign-in, it serializes a ticket and writes a browser cookie. The browser decides when to return it based on cookie attributes; the handler separately checks ticket validity and expiration. Events let an app customize specific lifecycle points. Cookie authentication's automatic browser attachment also makes CSRF protection relevant for state-changing requests.

## Supplied names explained

### Registration and cookie settings

| Supplied name | Meaning and use |
|---|---|
| `AddCookie` | Registers a cookie authentication handler for a named scheme and configures its options. Pair it with explicit default authenticate/challenge schemes when multiple handlers exist. |
| `CookieAuthenticationDefaults.AuthenticationScheme` | The framework's default cookie scheme name. The scheme name selects a handler configuration; it is not an encryption key or browser cookie name. |
| `CookieAuthenticationOptions` | All handler settings for ticket protection, cookie attributes, expiration, redirect paths, session storage, and lifecycle events. Configure options for the exact scheme being used. |
| `CookieAuthenticationOptions.Cookie` | `CookieBuilder` settings for the transport cookie, including name, scope, and security attributes. This controls browser transport, not the contents or validity of the ticket. |
| `CookieAuthenticationOptions.Cookie.Name` | Browser-visible cookie name. Use a deliberate, collision-resistant name when multiple apps share a host; secrecy of the name is not a security control. |
| `CookieAuthenticationOptions.Cookie.Domain` | Optional domain scope for the browser cookie. A broader domain sends the cookie to more subdomains and increases exposure; omit it unless cross-subdomain sharing is intentional. |
| `CookieAuthenticationOptions.Cookie.Path` | Path scope sent by the browser. It is routing scope, not an authorization boundary; applications on a host should not rely on path scoping to isolate secrets from compromised sibling apps. |
| `CookieAuthenticationOptions.Cookie.HttpOnly` | Prevents ordinary page JavaScript from reading the cookie. It reduces credential theft through script access but does not stop XSS from issuing authenticated requests. |
| `CookieAuthenticationOptions.Cookie.SecurePolicy` | Controls whether the cookie is marked `Secure` and sent only over HTTPS. Production authentication cookies should be protected in transit; correctly configure forwarded scheme information behind TLS termination. |
| `CookieAuthenticationOptions.Cookie.SameSite` | Sets the browser's SameSite behavior, which constrains certain cross-site cookie sends. OIDC cross-site callbacks and other federation flows need compatible settings; SameSite is not a full antiforgery strategy. |
| `CookieAuthenticationOptions.ExpireTimeSpan` | Default lifetime assigned to an authentication ticket created by the handler when no explicit expiration overrides it. It is a server-ticket lifetime, not simply the browser cookie's persistence setting. |
| `CookieAuthenticationOptions.SlidingExpiration` | Allows ticket renewal as an authenticated request occurs after a configured portion of the ticket lifetime has elapsed. Renewal is conditional and does not create a fixed absolute maximum by itself. |
| `CookieAuthenticationOptions.LoginPath` | Redirect target for a challenge when cookie authentication is configured for interactive login. API callers often need a 401 response instead of an HTML redirect. |
| `CookieAuthenticationOptions.LogoutPath` | Path used by the cookie handler's redirect behavior for logout-related flows. It does not implement a secure logout endpoint or revoke other credentials by itself. |
| `CookieAuthenticationOptions.AccessDeniedPath` | Redirect target when an authenticated principal is forbidden. Keep this distinct from the unauthenticated login path and avoid turning API 403 responses into misleading redirects. |
| `CookieAuthenticationOptions.ReturnUrlParameter` | Query parameter name used to carry a return URL in redirect flows. Validate redirects as local/safe destinations to prevent open redirect vulnerabilities. |
| `CookieAuthenticationOptions.Events` | Per-options event callbacks for customizing cookie authentication lifecycle events. Keep event logic short, deterministic, and careful not to leak ticket or personal data. |
| `CookieAuthenticationOptions.EventsType` | Resolves a custom event-handler type from dependency injection rather than storing callbacks in the options instance. Useful when event logic needs injected services. |
| `CookieAuthenticationOptions.SessionStore` | Optional `ITicketStore` that stores authentication tickets server-side and puts a protected session key in the browser cookie. It changes revocation/storage behavior and requires a shared, durable deployment store. |
| `CookieAuthenticationOptions.TicketDataFormat` | Protects/unprotects the serialized authentication ticket using the configured protection purpose/Data Protection setup. Custom formats must preserve confidentiality/integrity and be compatible across app instances. |
| `CookieAuthenticationOptions.CookieManager` | Reads and writes cookie headers, including chunking behavior. Customization must correctly handle proxy/header limits and chunk reconstruction. |

### Events and ticket operations

| Supplied name | Meaning and use |
|---|---|
| `CookieAuthenticationEvents` | Base event callbacks for cookie sign-in, validation, redirects, and sign-out. Override only the events needed and preserve the handler's expected context/result behavior. |
| `CookieAuthenticationEvents.ValidatePrincipal` | Runs when the handler validates a ticket and may reject it or replace the principal. Use it for revalidation when necessary, but understand its request cost and revocation interval. |
| `CookieAuthenticationEvents.RedirectToLogin` | Customizes challenge redirect behavior. API endpoints can return an appropriate 401 rather than redirecting a JSON client to an HTML login page. |
| `CookieAuthenticationEvents.RedirectToAccessDenied` | Customizes forbid redirect behavior. For APIs, preserve a 403 response with an appropriate challenge/response contract. |
| `CookieAuthenticationEvents.SigningIn` | Runs before the sign-in ticket is written, allowing controlled ticket/principal adjustments. Avoid adding untrusted claims or performing slow remote work here. |
| `CookieAuthenticationEvents.SignedIn` | Runs after sign-in has been completed. Use for noncritical audit/telemetry without recording secrets; failures here should not create confusing half-completed behavior. |
| `CookieAuthenticationEvents.SigningOut` | Runs during cookie sign-out. It can support cleanup/audit but clearing this cookie is not the same as revoking an external provider session or every bearer token. |
| `CookieValidatePrincipalContext` | Carries the current principal, ticket, and reject/replace operations during `ValidatePrincipal`. Rejecting a principal causes the handler to treat the cookie as unauthenticated. |
| `CookieSigningInContext` | Context for pre-issue sign-in customization, including the principal and authentication properties. Changes become part of the resulting ticket and must be trusted. |
| `CookieSignedInContext` | Context after a cookie sign-in has been issued. It provides sign-in details for events but should not be treated as a place to expose ticket contents. |
| `CookieSigningOutContext` | Context for sign-out event logic. It identifies the scheme and request context, but the app remains responsible for any broader session revocation policy. |
| `CookieAuthenticationHandler` | Implements the scheme's authenticate, challenge, forbid, sign-in, and sign-out operations. Middleware and endpoint helpers invoke it through the authentication service. |
| `AuthenticationTicket` | Couples a `ClaimsPrincipal` with authentication properties and a scheme. The serialized ticket is what the cookie handler protects; it can become stale as the user changes. |
| `AuthenticationProperties.IsPersistent` | Requests browser persistence for the cookie when the handler writes it. Persistence controls browser retention; it does not extend the server ticket beyond its valid expiration. |
| `AuthenticationProperties.ExpiresUtc` | Sets an explicit ticket expiration for a sign-in operation. It can override the default ticket lifetime; use a deliberate policy and do not accidentally issue long-lived credentials. |
| `AuthenticationProperties.AllowRefresh` | Indicates whether ticket refresh is allowed for that sign-in. It affects sliding renewal behavior but should not be mistaken for a server-enforced absolute session cap. |
| `AuthenticationProperties.RedirectUri` | Carries a return destination associated with an authentication operation. Validate it as a local/trusted target before redirecting after login/logout. |
| `AuthenticationProperties.StoreTokens` | Stores named authentication tokens in the authentication properties for later retrieval when configured. Saving provider tokens in a cookie ticket increases sensitivity and may enlarge the cookie; prefer server-side storage when appropriate. |
| `AuthenticationProperties.GetTokenValue` | Reads a named token previously stored in authentication properties. Handle the value as a credential: do not log or expose it to browser code without a strong design reason. |
| `HttpContext.SignInAsync` | Asks a selected authentication scheme to issue a sign-in ticket for a principal and properties. It does not validate credentials; call it only after a trusted authentication step. |
| `HttpContext.SignOutAsync` | Asks a selected scheme to sign out, commonly by expiring/removing the cookie or clearing server-side ticket state. Specify the correct scheme when multiple schemes are registered. |

### Expiration, protection, and deployment concepts

| Supplied name | Meaning and use |
|---|---|
| `Cookie authentication ticket versus browser cookie expiration` | The browser cookie's persistence controls whether the browser retains it; the protected ticket's expiration controls whether the server accepts it. A session cookie may carry a ticket with a finite lifetime, and a persistent cookie can still contain an expired ticket. |
| `Sliding expiration renewal` | A ticket is renewed after activity crosses the handler's renewal threshold, extending the ticket from the renewal time. Use a separate absolute lifetime or reauthentication policy when the session must end after a hard maximum. |
| `Absolute expiration with ExpiresUtc` | An explicit per-ticket expiration can establish a fixed expiry for that sign-in. If renewal is allowed, design how a true absolute deadline is preserved rather than assuming sliding expiration provides one. |
| `Persistent cookie consent choice` | Whether to persist a cookie across browser restarts is a user-experience/privacy choice distinct from ticket validity. Honor applicable consent requirements and make persistent sign-in behavior understandable to the user. |
| `Cookie Secure and HttpOnly attributes` | `Secure` restricts transport to HTTPS; `HttpOnly` blocks normal script reads. Both reduce exposure but neither makes XSS, CSRF, weak session policy, or insecure TLS harmless. |
| `SameSite cookie policy` | Browser controls that limit cross-site cookie attachment. `Lax`, `Strict`, and `None` have distinct cross-site behavior; `None` requires secure transport in modern browsers, and federated callbacks may need deliberate configuration. |
| `Data Protection ticket encryption` | ASP.NET Core protects cookie tickets for confidentiality and integrity with Data Protection. Applications should rely on the framework's protected format and secure key management, not hand-roll cookie encryption. |
| `Data Protection key ring sharing across replicas` | App instances that must read each other's cookies need compatible shared Data Protection keys and application discriminator. Persist and protect keys durably; ephemeral per-process keys cause sign-in loss across restarts or nodes. |
| `Security stamp validation` | Identity can periodically compare a principal's security-stamp claim with current account state and reject stale tickets after certain changes. It is periodic, so invalidation latency depends on validation configuration and deployment consistency. |
| `SecurityStampValidatorOptions.ValidationInterval` | Sets the interval after which a cookie principal is eligible for security-stamp validation. Short intervals improve responsiveness to changes but increase store traffic; this is not an immediate revocation switch. |
| `ISecurityStampValidator` | Abstraction that validates a principal against the user's current security stamp and can refresh or reject the session. It must be registered/invoked through the Identity cookie integration. |
| `Cookie principal revalidation` | Rechecks whether claims/account state in a ticket should still be trusted. The app can use stamp validation or custom validation; balance freshness, availability, and per-request cost. |
| `Cookie chunking` | Splits a large cookie across multiple cookie headers when it exceeds a size threshold and reassembles chunks on read. Large tickets still increase request headers and can exceed proxy/browser limits; keep claims concise. |
| `Cookie authentication event customization` | Hooks into defined handler lifecycle events for principal validation, redirects, and sign-in/out. Event code is security-sensitive because it can alter the principal or response behavior. |
| `Cookie versus server-side session storage` | A protected self-contained ticket travels in the cookie by default; `ITicketStore` can keep ticket contents server-side and send a session key. Server-side storage enables centralized invalidation but adds state, availability, and scaling requirements. |
| `Cookie authentication cross-site request risk and antiforgery` | Since browsers automatically attach cookies, an attacker may induce a victim's browser to send a state-changing request. Use antiforgery tokens/origin defenses appropriate to the app; SameSite is defense-in-depth, not a universal replacement. |

## Cross-item comparison

`ExpireTimeSpan` sets the default ticket lifetime; `IsPersistent` controls browser persistence; `ExpiresUtc` supplies an explicit ticket expiry; and sliding expiration may renew an eligible ticket. These are related but not synonyms. The default cookie ticket is protected and travels in the browser, while `SessionStore` retains it server-side. `HttpOnly`, `Secure`, and `SameSite` control browser behavior but do not replace authorization, antiforgery, or key management.

## Examples

### Configure a cookie for an interactive application

```csharp
builder.Services.AddAuthentication(options =>
    {
        options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    })
    .AddCookie(options =>
    {
        options.Cookie.Name = "Academy.Auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
        options.SlidingExpiration = true;
        options.Events.OnRedirectToLogin = context =>
        {
            if (context.Request.Path.StartsWithSegments("/api"))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            }
            context.Response.Redirect(context.RedirectUri);
            return Task.CompletedTask;
        };
    });
```

The cookie is explicitly secured for HTTPS. The example returns 401 for API paths while preserving redirect behavior for browser pages; a real application should use endpoint-aware metadata rather than relying only on a path prefix. When OIDC is also used, callback and SameSite behavior must match the provider flow. [Cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie)

### Share Data Protection keys in a multi-instance deployment

All instances that accept the same authentication cookie need access to the same protected key ring and application name. Persist keys in a protected durable store appropriate for the hosting platform, restrict access to the application identity, and define key rotation/backup. Do not use a shared cookie domain as a substitute for shared cryptographic keys.

## Common mistakes

- Confusing `IsPersistent` with a long server-side ticket lifetime.
- Setting `SlidingExpiration = true` and assuming the session has a hard maximum age.
- Setting a broad cookie `Domain` to make load balancing work; cryptographic key sharing is the real ticket compatibility requirement.
- Marking a cookie `SameSite=None` without secure HTTPS behavior.
- Adding excessive role/claim data and creating oversized cookies that break across proxies.
- Logging the cookie, ticket, or saved provider tokens.
- Assuming `HttpOnly` stops XSS from making same-origin authenticated requests.
- Treating security-stamp validation as instant revocation.
- Redirecting API clients to HTML login or access-denied pages without considering 401/403 semantics.
- Relying on `SameSite` alone instead of protecting cookie-authenticated state changes with antiforgery controls.

## Knowledge checks with answers

1. **Does `IsPersistent` change ticket validation expiry?** No. It controls whether the browser retains the cookie beyond the session; the ticket still has its own server-checked expiration.
2. **What is needed for cookies to work across app replicas?** Compatible Data Protection keys and application configuration, plus consistent authentication scheme/options.
3. **Why can sliding expiration be insufficient for a hard maximum session age?** Active requests may keep renewing the ticket; the app needs a separate absolute deadline or reauthentication policy.
4. **What problem does `ITicketStore` solve, and what does it cost?** It keeps ticket state server-side and can make centralized invalidation practical, but it introduces shared state and availability/scaling requirements.
5. **Why is `HttpOnly` not a CSRF defense?** It prevents normal script access to the cookie value, but browsers still attach the cookie to requests initiated by the page/user.

## Sources

- [Configure cookie authentication in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie)
- [Configure ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration)
