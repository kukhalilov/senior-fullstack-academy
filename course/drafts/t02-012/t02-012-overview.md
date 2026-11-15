# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Big-picture orientation and mental model

## Problem and purpose

Applications need to recognize users, protect sessions, accept trusted API credentials, connect to external identity providers, and recover accounts safely. ASP.NET Core Identity manages local users, passwords, claims, roles, tokens, and sign-in workflows. Cookie authentication is common for browser sessions. JWT bearer authentication validates access tokens for APIs. OpenID Connect signs users into interactive web apps through an external provider. Passkeys let supported Identity apps authenticate using public-key credentials. These mechanisms solve related but different jobs; mixing their token and trust models creates security bugs. [ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) [Cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie) [JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication) [OpenID Connect](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication) [Passkeys](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)

## Plain-language mental model

Think of identity as three linked decisions. **Authentication** establishes a principal from a credential. **Session/token protection** preserves or carries that authentication between requests. **Authorization** decides what the authenticated principal may do. Identity provides user and credential-management services; it does not become a standards-compliant OAuth authorization server simply because it can issue a protected bearer token.

For a browser UI, a protected cookie commonly carries a Data Protection-protected ticket between requests. For an API, the client presents an access token in `Authorization: Bearer`; the API validates its issuer, audience, signature, and lifetime. An OpenID Connect client redirects the user to an identity provider using authorization code with PKCE, validates the response, and normally establishes a local cookie session. Passkeys use a challenge and public-key proof bound to a relying-party domain/origin. These credentials are not interchangeable.

## How the parts fit together

| Need | Common mechanism | Trust boundary |
|---|---|---|
| Manage local account and credentials | ASP.NET Core Identity managers and stores | App/database owns local account rules |
| Keep browser sign-in across requests | Cookie handler + protected ticket | Browser sends cookie; app protects/validates it |
| Protect an API call | JWT bearer handler | Trusted issuer creates token; API validates it |
| Sign in with an external provider | OIDC authorization-code client with PKCE | Provider authenticates; app maps trusted claims |
| Passwordless Identity authentication | WebAuthn passkey integration | Browser authenticator proves possession; server validates challenge/origin |
| Extra account recovery | MFA providers and one-time recovery codes | Recovery codes are sensitive single-use credentials |

Identity's built-in API endpoints can issue proprietary protected bearer tokens for simple first-party scenarios. They are not JWT access tokens and do not implement a complete OAuth/OIDC server. If the API requires standard OAuth access tokens, use a standards-compliant identity provider and validate its tokens with the bearer handler.

## Concept map

```text
credential (password / passkey / external OIDC)
              │ authenticate
              ▼
       ClaimsPrincipal + authentication ticket/token
              │
       ┌──────┴────────┐
       ▼               ▼
 browser cookie     API bearer token
 protected ticket   JWT validated by issuer/audience/signature/lifetime
       │               │
       └──────┬────────┘
              ▼
       authorization policies + resource checks
```

The same user may sign in through multiple credentials, but the application must link them safely. A provider's claims should be mapped deliberately. A valid authentication result does not automatically grant resource access; authorization remains a separate check.

## End-to-end walkthrough

An interactive server web app challenges an unauthenticated browser through OIDC authorization code with PKCE. The server-side confidential client protects its credentials; the provider returns an authorization code, the app exchanges it, validates the ID token/response, and creates a local protected cookie. The browser sends the cookie on later requests. Cookie expiry, sliding renewal, security-stamp validation, Data Protection keys, `SameSite`, `Secure`, `HttpOnly`, and antiforgery policy affect that session.

Separately, a mobile client calls an API with an OAuth access token. The API validates signature, issuer, audience, and expiry. An ID token proves an authentication event to the OIDC client; it is not the API access token. The API returns 401 for missing/invalid authentication and 403 when a valid principal lacks permission. A passkey sign-in instead uses a fresh challenge and a relying-party-bound assertion, then creates the app's normal signed-in session.

## When to use it and tradeoffs

Use Identity for local account management, but select a dedicated identity provider when you need federation, delegated OAuth scopes, consent, interoperable access tokens, or authorization-server features. Use cookies for browser sessions where same-site protections and antiforgery are configured. Use bearer validation for APIs; do not accept opaque Identity API tokens as JWTs. Use OIDC code flow with PKCE for interactive web sign-in. Passkeys improve phishing resistance for supported scenarios, but Identity's built-in WebAuthn surface has defined limits and does not provide general-purpose WebAuthn or built-in MFA semantics.

## What later lessons cover

The references explain Identity users/stores/managers, built-in Identity API endpoints, cookie tickets/Data Protection, JWT/OIDC/external-provider flows, MFA/recovery, passkeys, and ASP.NET Core 11 updates. The version-specific lesson separates stable Identity/passkey behavior from experimental device-bound sessions. OAuth protocol design and broader application security are addressed in the security track.

### Worked end-to-end example: a browser portal and JSON API

Suppose a server-rendered portal lets employees update their own profile while a mobile client calls a separate API. The portal redirects to a trusted OIDC provider using authorization code with PKCE; its server validates the callback and signs the employee into a local protected cookie session. The profile endpoint authorizes the current user against the requested resource and uses antiforgery protection because the browser attaches its cookie automatically. The mobile client obtains an access token from a suitable authorization server, and the API validates issuer, audience, signature, and lifetime before checking the required scope or policy. The OIDC ID token stays with the client; neither the browser cookie nor Identity's proprietary first-party API token is substituted for an API access token. [OIDC web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication) [JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication) [Cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie)

The operational plan distinguishes local cookie sign-out from bearer-token revocation: a stateless access token may remain valid until expiry unless its issuer or API implements revocation/validation state. Passkeys offer another primary sign-in method, but account recovery and Identity's separate MFA flow still need design. ASP.NET Core 11's DBSC integration remains experimental and is not a replacement for CSRF defenses, authorization, cookie policy, or revocation planning. [Passkey guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/) [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

## Sources

[Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) · [Identity API endpoints](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization) · [Cookies](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie) · [JWT bearer](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication) · [OIDC](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication) · [Passkeys](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/) · [.NET 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)
