# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Reference: Built-in Identity API endpoints, endpoint behavior, and proprietary token distinction

## Scope and version

This is the ASP.NET Core Identity API endpoint surface for the current ASP.NET Core 11 curriculum. The built-in endpoints provide a practical account API for an application using Identity; they do not turn the application into a general OAuth 2.0/OpenID Connect authorization server. Confirm supported endpoint behavior against the target runtime because defaults and templates evolve. [Identity API guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization) [Identity overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)

## How this group fits the mental model

`AddIdentityApiEndpoints<TUser>` composes Identity API authentication support and `MapIdentityApi<TUser>` maps account endpoints. The endpoints operate on the configured Identity user/store and selected authentication schemes. Depending on the request and options, clients use an application cookie or an Identity-proprietary protected bearer token. Neither mode removes the need for authorization, HTTPS, safe account recovery, or email-delivery implementation.

## Supplied names explained

| Supplied name | Purpose and behavior |
|---|---|
| `AddIdentityApiEndpoints<TUser>` | Registers Identity services and authentication support intended for the built-in API endpoint set. It is a convenience composition; the app must still configure its persistence, authorization, delivery services, and hosting security. |
| `IdentityBuilder.AddApiEndpoints` | Adds services required by the Identity API endpoint implementation to an existing Identity registration. Use it when composing Identity manually rather than selecting the higher-level helper. |
| `IdentityBuilderExtensions.AddBearerToken` | Registers the built-in bearer-token authentication handler used by Identity API scenarios. It issues/validates Identity-protected tokens, not general JWT/OAuth access tokens. |
| `IdentityBuilderExtensions.AddIdentityCookies` | Adds the cookie schemes expected by Identity account/sign-in workflows. Cookies are browser session credentials and require appropriate cookie and antiforgery controls. |
| `MapIdentityApi<TUser>` | Maps the built-in registration, login, logout, confirmation, reset, and related account endpoints for the configured user type. It returns an endpoint group that can be composed with the app's routing and authorization policy. |
| `MapIdentityApi endpoint group` | The group of mapped account endpoints. Apply route grouping, metadata, rate limits, and authorization deliberately; do not assume every endpoint should be public or that the group has the application's complete business policy. |
| `Identity API register endpoint` | Creates a local account from submitted registration information and may initiate confirmation behavior according to configuration. Registration does not automatically send email unless the app supplies and invokes a delivery implementation. |
| `Identity API login endpoint` | Checks account credentials and returns the configured cookie or protected-token behavior, including sign-in restrictions. The caller must handle confirmation and two-factor outcomes as defined by the endpoint contract. |
| `Identity API refresh endpoint` | Renews the built-in bearer credential using the matching protected refresh token. It is part of the proprietary Identity token flow, not OAuth refresh-token semantics for arbitrary clients. Protect refresh credentials as bearer secrets. |
| `Identity API logout endpoint` | Ends the relevant cookie or built-in token sign-in flow. Clearing the caller's current credential does not revoke a copied token everywhere unless the implementation has server-side revocation state for that token. |
| `Identity API confirm-email endpoint` | Completes email confirmation from the user identity and purpose-bound token supplied to the endpoint. Use a verified delivery channel and avoid leaking tokens in logs, referrers, or analytics. |
| `Identity API resend-confirmation-email endpoint` | Requests another confirmation message. Apply rate limits and non-enumerating responses so attackers cannot use it to probe or spam account addresses. |
| `Identity API forgot-password endpoint` | Starts the password-reset process for an account. Use a generic response that does not reveal whether the account exists, rate-limit requests, and deliver the reset link securely. |
| `Identity API reset-password endpoint` | Applies a new password when the submitted reset token validates for the intended account. Tokens are sensitive, short-lived capabilities; validate input and do not log them. |
| `Identity API manage-two-factor endpoint` | Provides the built-in Identity endpoint for managing two-factor configuration under its defined account flow. Protect enrollment, disablement, and recovery operations as high-risk account changes. |
| `Identity API proprietary bearer token` | A protected token format used by the built-in Identity API bearer handler. It is not a JWT, not self-describing for arbitrary resource servers, and not an OAuth access token issued by a general authorization server. |
| `Identity API token protection purpose` | The Data Protection purpose string scopes protection to the handler's token use so protected payloads are not interchangeable with unrelated protected data. It is an implementation boundary, not an OAuth audience/issuer model. |
| `Identity API bearer token versus JWT access token` | The Identity API token is validated by its corresponding Identity bearer handler; a JWT access token is validated using issuer metadata/keys and token-validation rules. Select the protocol expected by the API and clients rather than swapping formats. |
| `Identity API cookie authentication option` | Allows the built-in endpoint flow to use cookie sign-in behavior when configured/requested. When using cookies, browser credentials are sent automatically and state-changing calls need CSRF protections. |
| `useCookies query parameter` | A login query parameter that requests cookie-oriented behavior in the built-in endpoint flow. Treat it as a mode selector, not proof that a caller is a browser or that CSRF defenses can be omitted. |
| `useSessionCookies query parameter` | Selects a session-cookie behavior in the built-in login flow rather than a persistent browser cookie. A session cookie's browser persistence and the server-side ticket expiration remain separate concepts. |
| `Identity API endpoint customization boundary` | The mapped endpoints offer a defined baseline, not every product-specific workflow. For custom registration fields, anti-abuse rules, different response contracts, or domain approval, implement explicit app endpoints while using Identity managers/services safely. |
| `AddEntityFrameworkStores<TContext>` | Connects Identity's user/role store abstractions to EF Core persistence for the given context. The context and key types must match the configured user and role types. |
| `Identity API endpoint authorization` | Authorization metadata and policies still govern access to endpoints. Registration/login/reset may have anonymous stages by design; account-management endpoints should be bound to the correct authenticated user and protected from cross-account access. |
| `Identity API account confirmation requirement` | Identity options can require a confirmed account/email before sign-in. The app must configure token providers and implement confirmation delivery; enabling the requirement without delivery can lock out legitimate signups. |
| `Identity API tokens are not OAuth server tokens` | Explicit boundary: these tokens do not supply OAuth client registration, authorization grants, standards-based scopes/consent, discovery, or interoperable JWT validation. Use a standards-compliant provider when those are required. |

## Cross-item comparison

Registration, confirmation, forgot-password, and reset-password operate on **account lifecycle**. Login and refresh establish or renew **authentication credentials**. Authorization remains a separate policy decision. Cookie mode is browser-oriented; built-in bearer-token mode is a proprietary first-party option; standards-based OAuth access tokens require an authorization server and API validation configured for that issuer. A built-in endpoint is useful for a bounded first-party account API, but its existence should not be mistaken for a complete identity-provider product.

## Examples

### Map built-in endpoints with deliberate application policy

```csharp
var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

var accountApi = app.MapGroup("/account").MapIdentityApi<ApplicationUser>();
accountApi.RequireRateLimiting("account");

app.Run();
```

This example shows composition only. The rate-limit policy named `account` must be registered; the account API still needs secure transport, a configured store, safe email delivery, and endpoint-specific authorization decisions. Do not apply a blanket authorization requirement that prevents intended anonymous registration or login. [Identity API guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization)

### Choose the token architecture before wiring a client

If the app and its first-party client only need a simple built-in Identity account flow, the proprietary token mode may be sufficient. If other services need to validate interoperable access tokens, or the system needs registered clients, delegated scopes, federation, or standards-defined refresh behavior, use a proper OAuth/OIDC provider and configure each API to validate that provider's tokens. Never send an OIDC ID token to a resource API as though it were an access token. [JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication)

## Common mistakes

- Assuming Identity API endpoints send confirmation or reset email automatically. The app owns delivery and anti-abuse controls.
- Calling Identity bearer tokens JWTs or trying to validate them with `JwtBearer`.
- Treating `useCookies` as proof of browser origin. Cookie-authenticated mutations still need CSRF protection.
- Returning different forgot-password responses for existing and nonexistent accounts, enabling account enumeration.
- Applying one blanket authorization rule that unintentionally blocks signup/login or leaves account-specific endpoints cross-user accessible.
- Assuming logout revokes every copy of a stateless/protected bearer credential.
- Exposing reset, confirmation, or refresh tokens through logs, telemetry, URLs, or referrer headers.

## Knowledge checks with answers

1. **What kind of token does the built-in Identity API bearer handler issue?** An Identity-proprietary protected token for its corresponding handler, not a JWT/OAuth token.
2. **Who sends a confirmation email?** The application must implement or call an email delivery service; Identity can generate/validate the token but does not deliver messages by itself.
3. **Why can cookie login need antiforgery protection?** Browsers attach cookies automatically, so a malicious site may induce a victim's browser to send an authenticated state-changing request.
4. **When should a team use a separate OAuth/OIDC provider?** When it needs standard authorization-server behavior, interoperable access tokens, client/grant management, scopes/consent, federation, or multi-service token validation.
5. **Does a successful login guarantee permission to change account email?** No. The change operation must be authenticated and authorized for the target user, typically with a purpose-bound confirmation token for the new address.

## Sources

- [Use Identity to secure a Web API backend for SPAs](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization)
- [ASP.NET Core Identity overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)
- [Configure JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication)
- [Configure cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie)
