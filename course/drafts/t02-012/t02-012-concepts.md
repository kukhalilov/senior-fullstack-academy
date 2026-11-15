# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Core concepts and how they fit together

## Learning objectives

After this lesson, you should be able to distinguish local account management from OAuth/OIDC authorization-server behavior, choose cookie versus bearer authentication for the client type, explain OIDC code flow with PKCE, identify safe JWT validation rules, and describe what ASP.NET Core Identity passkeys do and do not provide. You should also recognize the .NET 11 Identity time and passkey-display improvements and the experimental status of device-bound sessions.

## Prerequisites

Know the difference between authentication and authorization, what an HTTP cookie and bearer header are, and basic public-key cryptography. OIDC and OAuth are related but distinct protocols: OAuth delegates access; OpenID Connect adds user authentication semantics such as an ID token.

## Core concepts

### Identity account services are not an identity provider

ASP.NET Core Identity manages local user/role data, credential workflows, claims, confirmation, lockout, two-factor tokens, and passkey credentials through managers and stores. The app controls its account rules and persistence. Built-in Identity API endpoints can register/log in users and issue a proprietary protected bearer token for simple first-party APIs, but the token is not a JWT and the endpoints are not a complete OAuth/OIDC authorization server. Do not infer interoperable OAuth scopes, consent, delegated access, or standard token validation from the word “bearer.”

### Authentication tickets, cookies, and Data Protection

The cookie handler serializes an authentication ticket and protects it with ASP.NET Core Data Protection. The browser stores/sends the cookie; it does not store the server's Data Protection keys. `ExpireTimeSpan`, `ExpiresUtc`, `IsPersistent`, and sliding renewal affect ticket lifetime and browser persistence differently. Cookie attributes control transport and browser sending: `Secure` protects transmission over HTTPS, `HttpOnly` prevents JavaScript access, and `SameSite` constrains some cross-site sending. Cookie authentication still requires antiforgery protection for state-changing browser requests where ambient credentials are sent.

Replicas must share a protected Data Protection key ring and compatible application discriminator to validate tickets created by another instance. Security stamp validation can reject tickets after important account changes, but its interval is a tradeoff between revocation latency and store work. Cookie size, chunking, and optional server-side ticket stores change where session state lives; they do not remove the need to protect and expire it.

### Access tokens and ID tokens have different audiences

An API's JWT bearer handler validates an access token: signature, trusted issuer, intended audience, and lifetime. Metadata/key rotation from a trusted issuer supports current signing keys; tokens should not be accepted merely because they parse as JWT text. A 401 means credentials are absent or invalid; a 403 means the authenticated principal is not permitted. A 401 challenge includes `WWW-Authenticate`. An OIDC ID token tells the client that a user authenticated; its audience is the client, so sending it to an API as an access token is a token-confusion vulnerability.

Opaque tokens and JWTs are not interchangeable. If an API needs standard access tokens, use a standards-compliant authorization server. `SaveTokens` and retrieving tokens from an authentication session can store sensitive access/refresh values in the authentication ticket; weigh the storage and exposure implications. Never put client secrets in public/browser code.

### OIDC web sign-in and external accounts

For a server-side interactive web app, the recommended shape is a confidential OIDC client using authorization code with PKCE. The OIDC handler issues a challenge, validates the callback, and commonly signs the local principal into a cookie. The external provider proves authentication; the app maps claims, links the external login to a local Identity account, and still authorizes local resources. `ClientSecret` or client assertion belongs on the server and in a protected secret provider. PKCE binds code redemption to the initiating client and mitigates code interception; it does not replace state/nonce, redirect URI validation, TLS, or secure client credential storage.

An external provider's subject identifier is issuer-scoped. Do not link accounts solely because email addresses match unless the provider and application have a verified, safe linking process. A signed-in external user may still be unconfirmed or lack local permissions. `GetClaimsFromUserInfoEndpoint` is provider-dependent and should be enabled only with correct scope/claim mapping.

### MFA, recovery, and passkeys

Identity supports password policy, lockout, authenticator-app/TOTP codes, email/phone token providers, and recovery codes. A recovery code is a sensitive one-time credential and must be redeemed once. Password reset or email confirmation tokens are purpose-protected workflows, not access tokens. Built-in Identity passkeys use WebAuthn for adding passkeys to accounts, passwordless account creation, and passwordless sign-in. They are scoped to Identity scenarios, require a correct relying-party ID/origin, and do not provide general WebAuthn or built-in two-factor semantics. By default, Identity does not validate attestation statements; custom attestation validation is complex and should be implemented only when authenticator properties must be constrained.

### ASP.NET Core 10 and 11 changes

ASP.NET Core 10 introduced Identity passkey support. ASP.NET Core 11 uses `TimeProvider` for Identity time-based operations, which lets tests deterministically control token expiration, lockout durations, and security-stamp validation. ASP.NET Core 11 also infers friendly passkey names from authenticator AAGUIDs using built-in mappings and a `PasskeyAuthenticators` dictionary; known authenticators get a name automatically, while unknown ones are renamed by the user. This is display metadata, not stronger authentication or proof that an authenticator is safe.

ASP.NET Core 11 adds server-side Device Bound Session Credentials support in a separate package, but the package and browser support remain experimental. DBSC binds session refresh to a device-held key; it is not a replacement for normal cookie protections, passkeys, or MFA. Keep experimental support isolated and do not imply production browser availability.

## Mechanisms and relationships

```text
Identity store and managers ── user credentials / roles / claims / recovery
             │
             ├─ password or passkey sign-in ── local cookie ticket
             └─ OIDC external provider ─────── local account link + cookie

OAuth/OIDC provider ── JWT access token ── API validates issuer/audience/signature/lifetime
        └──────────── ID token ────────── OIDC client validates it; not for API authorization
```

Scheme selection matters when an app has cookies, OIDC challenge, and JWT APIs together. Default authenticate, challenge, and sign-in schemes can differ. Set them deliberately and apply authorization policies to endpoint groups. Avoid a policy scheme that guesses between token formats without strict issuer and validation boundaries.

## Worked examples

### Browser app and API use different schemes

An interactive server-rendered app challenges OIDC and stores its session in a cookie. Its JSON API accepts only an access token from the trusted API issuer. Configure distinct schemes and endpoint authorization so the browser cookie is not mistakenly treated as the API bearer contract and an ID token is never accepted by the API.

### Deterministic lockout test in .NET 11

Register a fake `TimeProvider` in the test service collection before resolving Identity managers. Advance fake time to test lockout expiration or token lifetime without sleeping in real time. The fake clock makes time-dependent behavior deterministic; it does not replace integration tests of persistence or provider delivery.

### Passkey relying party

For `app.example.com`, configure the relying-party domain to the appropriate registrable host and ensure browser origin validation matches the real HTTPS origin. A credential registered for one RP ID cannot simply authenticate a different domain. During registration, server-generated challenge and expected origin/RP ID must be checked; the client response alone is untrusted.

## Misconceptions and edge cases

- Identity API bearer tokens are not JWTs and do not create an OAuth/OIDC server.
- An OIDC ID token is not an API access token; check intended audience and token purpose.
- A valid JWT signature alone is insufficient; issuer, audience, lifetime, and signing-key trust matter.
- 401 is an authentication problem; 403 means an authenticated caller lacks permission (subject to the API's deliberate concealment policy).
- Cookie ticket expiry and browser cookie expiration are related but distinct; a nonpersistent session cookie may still contain an expiring ticket.
- Sliding expiration renews under conditions; it does not mean an infinite absolute session.
- Shared Data Protection keys are required across replicas for tickets protected by one instance to be read by another.
- External provider authentication does not automatically authorize local resources or safely link accounts by email.
- Identity passkeys do not supply general-purpose WebAuthn or built-in Identity MFA behavior in current support.
- Default passkey attestation validation is absent; do not claim Identity establishes authenticator hardware provenance.
- ASP.NET Core 11 passkey display names are informational metadata from AAGUID mappings, not a trust rating.
- Device-bound session package/browser support remains experimental, not a stable default.

## Knowledge checks with answers

1. **Does `AddBearerToken` issue a standards-based JWT?** No. Identity API bearer tokens are proprietary protected tokens.
2. **Which token should an API validate?** An access token intended for that API, with issuer, audience, signature, and lifetime validation.
3. **Can a cookie-only app skip antiforgery because cookies are encrypted?** No. Browser cookies are ambient credentials and state-changing requests need appropriate CSRF protection.
4. **What does ASP.NET Core 11 `TimeProvider` improve?** Deterministic testing/control of Identity's time-based operations such as token expiry, lockout, and security-stamp validation.
5. **Does passkey AAGUID naming identify a trusted device?** No. It gives a friendly authenticator display name and is not attestation validation or trust certification.
6. **Is DBSC stable in ASP.NET Core 11?** No. The package and browser implementation are experimental.

## Sources

[Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) · [Identity API](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization) · [Cookies](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie) · [JWT bearer](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication) · [OIDC](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication) · [Passkeys](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/) · [.NET 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)
