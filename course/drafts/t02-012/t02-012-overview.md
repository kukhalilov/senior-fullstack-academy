# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Big-picture orientation and mental model

## Problem and purpose

An application needs to answer three different questions: **who is this caller**, **how was that identity established**, and **what may the caller do**. Authentication establishes a principal for the current request. Authorization evaluates that principal against policies and resources. Account systems such as ASP.NET Core Identity manage local users and credentials, while authentication handlers turn a credential presented on a request into a principal.

This topic connects local account management, browser sessions, API access tokens, external identity providers, and passkeys. These pieces solve related problems, but they are not interchangeable. In particular, ASP.NET Core Identity is an account and sign-in framework, not a general OAuth or OpenID Connect authorization server. [Microsoft's Identity overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) [Identity API guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization)

## Plain-language mental model

Think of a secured application as a venue with several entrances. An account database is the enrollment desk: it stores the local account record and credential-related state. A sign-in method is an entrance credential, such as a password plus a second factor, a passkey, or an identity-provider login. An authentication handler is the guard who checks the credential presented at this entrance and creates a request principal. Authorization is the rule that decides whether that principal can enter a particular room.

The credential used at one entrance should not automatically be treated as a credential for every other entrance. A browser session cookie is a protected session ticket for the application. A bearer access token is a credential an API validates. An OpenID Connect ID token tells a client about an authentication event; it is not an API access token. Built-in Identity API bearer tokens are protected Identity tokens, not JWTs and not tokens from a standards-compliant OAuth authorization server. [Cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie) [JWT bearer validation](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication) [Identity API](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization)

## How the parts fit together

| Part | Responsibility | Typical application boundary |
|---|---|---|
| ASP.NET Core Identity | Local user and optional role records, password and account workflows, security stamps, token providers, and sign-in coordination | Application's user store and account endpoints or UI |
| Authentication scheme and handler | Reads a credential, validates it under a named scheme, and produces an authenticated principal | Each incoming HTTP request |
| Cookie authentication | Carries a protected application session ticket in the browser | Server-rendered web app or backend-for-frontend (BFF) |
| JWT bearer authentication | Validates a signed access token intended for this API | Resource API that receives `Authorization: Bearer ...` |
| OpenID Connect client | Redirects a user to an identity provider and handles the authorization-code callback | Interactive server-side web app |
| Passkey | Uses a public-key credential bound to a relying party; the private key remains with the authenticator | Browser/device WebAuthn interaction with a server verifier |
| Authorization | Applies role, claim, policy, and resource rules after authentication | Endpoint, page, handler, or domain operation |

The request pipeline must include authentication before authorization so authorization can inspect the principal. Identity may create a local account and issue a cookie, but the application still needs explicit authorization rules. For an interactive server web app, the OIDC handler commonly handles the challenge and callback while the local cookie maintains the app session. For an API, the JWT bearer handler validates the presented access token and does not care how the client obtained it. [OIDC web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication) [JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication)

## Concept map

```text
local account and credential state ── Identity managers/stores ── password, MFA, or passkey sign-in
                                                                  │
                                                                  ├─ application cookie ── browser session
                                                                  └─ Identity API protected token ── simple API scenario

external identity provider ── OIDC authorization code + PKCE ── server callback ── app cookie

trusted token issuer ── signed JWT access token ── JwtBearer validation ── API principal

authenticated principal ── authorization policy/resource check ── allow or deny
```

The arrows show who creates or validates each artifact. A JWT API should trust a configured issuer and validate signature, issuer, audience, and lifetime; decoding a JWT's readable payload is not validation. A web app should keep client credentials on its server and use authorization code with PKCE. The browser should not receive a confidential client secret. [JWT bearer validation](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication) [OIDC web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication)

## End-to-end walkthrough

Suppose a server-rendered application lets a user sign in through an external OIDC provider and then access `/orders/42`.

1. The user requests the protected page without an app session. Authorization cannot yet establish permission because there is no authenticated principal.
2. The cookie scheme detects no valid session and the configured challenge scheme redirects to the OIDC provider.
3. The server-side OIDC client uses authorization code flow with PKCE. It validates the callback and exchanges the one-time code with the provider; client credentials remain server-side.
4. After validating the authentication response and mapping only trusted claims, the app signs in the principal using its cookie scheme. Data Protection protects the ticket; browser cookie attributes govern how the browser sends it.
5. On a later request, cookie authentication validates the ticket and creates `HttpContext.User`.
6. The authorization policy checks the user's claims and, if access depends on the specific order, the application checks resource ownership or another resource-specific rule. A valid login alone does not imply permission to every order.

For a separate API, the client instead presents an access token. The API validates its signature, issuer, audience, and expiration and then applies API authorization. It must not accept an ID token merely because it is also a signed JWT. [OIDC web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication) [JWT bearer validation](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication)

## When to use it and tradeoffs

- Use Identity when the application owns local account workflows such as password changes, email confirmation, lockout, roles, and two-factor settings. Use an external provider when identity is managed elsewhere; those approaches can coexist.
- Use an application cookie for browser sessions. Protect it with HTTPS and appropriate `HttpOnly`, `Secure`, and `SameSite` settings, configure expiration deliberately, and share Data Protection keys across replicas that must read the same tickets.
- Use standards-based JWT access tokens for APIs that need interoperable issuer-based access tokens. Validate them with a configured issuer and audience. Do not create a token format by hand or treat an Identity API token as JWT.
- Use OIDC authorization code with PKCE for interactive web sign-in. A browser-only client cannot keep a secret; for applications needing a secure browser session, a BFF keeps tokens on the server and exposes an application session to the browser.
- Use passkeys for phishing-resistant public-key authentication where the browser and authenticator support WebAuthn. ASP.NET Core Identity's built-in support targets Identity account scenarios and has documented limitations; it is not a complete general-purpose WebAuthn server. [Passkeys](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)

No single mechanism removes authorization design, account recovery, incident response, key rotation, or deployment concerns. A login establishes identity evidence; it does not prove that a request is safe or authorized.

## What later lessons cover

The concepts lesson traces the user, credential, principal, scheme, ticket, token, and authorization policy through a request. The reference lessons then explain the exact Identity manager/store surface, built-in account endpoints, cookie lifecycle and events, JWT/OIDC configuration boundaries, and passkey/MFA/recovery APIs. The practice lesson asks you to choose and wire appropriate flows for distinct browser, API, and passkey scenarios. The interview lesson focuses on token confusion, cookie deployment, external login, recovery, and authorization boundaries.

## Sources

- [ASP.NET Core Identity overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)
- [Use Identity to secure a web API backend for SPAs](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization)
- [Configure cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie)
- [Configure JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication)
- [Configure OpenID Connect web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication)
- [Enable passkeys in ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)
