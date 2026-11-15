# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Core concepts and how they fit together

## Learning objectives

After this lesson, you should be able to distinguish account management from request authentication, explain how an authentication scheme creates a principal, select the appropriate browser or API credential, describe a secure OIDC server-side sign-in, and identify the boundaries of built-in Identity passkey support.

## Prerequisites

You should know basic HTTP requests, middleware ordering, dependency injection, claims, and the difference between authentication and authorization. This lesson uses ASP.NET Core's authentication handlers and the Identity framework. The exact APIs and recent-version notes are covered in the references.

## Core concepts

### Account, credential, principal, and authorization decision

An **account** is an application's stored representation of a user. Identity's user manager coordinates user operations through store interfaces, which can be implemented by EF Core or another persistence system. A **credential** is evidence presented during sign-in: for example, a password, an external provider result, a one-time authenticator code, or a passkey assertion. A **principal** is the identity and claims the application makes available for the current request after a configured handler validates a credential. An **authorization decision** asks whether that principal may perform a particular operation.

These are separate stages. A user row does not authenticate a request by itself. A successfully authenticated principal does not automatically satisfy a policy. A role claim is useful only if it came from a trusted issuance path and the application's authorization policy interprets it as intended. For resource-specific actions, the application often needs to check the resource after authentication rather than relying only on a broad role.

### Schemes select credential protocols

ASP.NET Core authentication schemes name handlers and their options. The default authenticate scheme handles ordinary authentication attempts; the challenge scheme decides how to ask an unauthenticated caller to authenticate; the forbid scheme handles an authenticated caller who lacks permission. Applications may register several schemes, but defaults and policy selection must be explicit enough that a cookie handler is not accidentally used where an API expects bearer validation.

The middleware order matters: `UseAuthentication` populates the request principal before `UseAuthorization` evaluates policies. The handler validates its own credential format. Cookie authentication validates a protected ticket; `JwtBearer` validates a bearer token; the OIDC handler participates in browser redirects and callback processing. Choosing a scheme is choosing a protocol boundary, not just a label. [Cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie)

### Browser cookies are application sessions

After a browser sign-in, the application typically issues a cookie holding a protected authentication ticket. Data Protection protects the ticket against reading and tampering. The browser returns the cookie automatically according to its domain, path, secure, and same-site rules. The app must therefore handle cross-site request forgery for state-changing cookie-authenticated requests; `SameSite` is a useful browser control, not a universal substitute for antiforgery design.

Ticket expiration and browser persistence are distinct concerns. A persistent browser cookie can survive browser restarts, but the server ticket can still expire. Sliding expiration can renew a ticket during use; it does not guarantee immediate revocation. Identity's security-stamp validation can invalidate sessions after certain account-security changes, but the validation interval and shared Data Protection key deployment matter. If replicas cannot share the appropriate key ring and application discriminator, a ticket issued by one instance may be unreadable by another. [Cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie)

### Bearer tokens are validated by the resource API

An API receiving a JWT access token must validate its signature, issuer, audience, and lifetime using trusted metadata or signing keys from the intended token issuer. Decoding base64url text only displays claims; it does not prove the token is authentic. The API then maps claims into a principal and runs authorization. API authentication validates the token; it generally does not need to know which interactive method the client used to obtain it.

The built-in ASP.NET Core Identity API can issue a proprietary protected bearer token for simple scenarios. That token is not a JWT and is not an OAuth access token from a general authorization server. If consumers require standards-based delegated access, federation, or interoperable scopes, use a purpose-built identity provider and validate its access tokens with `JwtBearer`. Never treat an OIDC ID token as an API access token: an ID token's audience and purpose are the client application, not the resource API. [Identity API guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization) [JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication)

### OIDC connects an interactive application to an identity provider

OpenID Connect builds an authentication layer on OAuth 2.0. For a server-rendered interactive web application, the ASP.NET Core OIDC handler redirects the browser to the provider and handles the callback; the application commonly signs the resulting principal into a local cookie. Use authorization code flow with PKCE. The server can protect its client credential; code plus PKCE binds the authorization response to the initiating client instance and limits the usefulness of an intercepted code.

The app must validate the provider response, use registered callback URIs, protect state/correlation and nonce checks, and map only claims it trusts. The provider authenticates the user; the local app still decides which claims it accepts and what those claims authorize. Modern deployments may use pushed authorization requests when the provider supports them; this is a protocol negotiation detail, not a replacement for the authorization-code model. Never embed a confidential client secret in JavaScript delivered to a browser. [OIDC web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication)

### Passkeys authenticate through public-key challenges

A passkey is a WebAuthn public-key credential. The authenticator holds the private key and signs a fresh server challenge; the server stores the public-key credential and verifies the assertion against the relying-party identity and expected origin. A challenge must be unpredictable, bound to the in-progress operation, and accepted only once. The relying-party ID and allowed origins must match the real deployment; permissive custom origin validation can erase important phishing defenses.

ASP.NET Core Identity's built-in passkey support covers Identity registration and sign-in flows. Its documented scope is narrower than a general WebAuthn implementation: default attestation validation is not performed, passkeys act as a primary sign-in method rather than built-in second-factor support, and templates do not all have the same support. If a product needs more complete protocol control, evaluate a WebAuthn library and its operational requirements. A passkey also does not remove the need for recovery paths, account linking policy, session management, or authorization. [Passkeys](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)

## Mechanisms and relationships

| Stage | Example mechanism | What it produces or checks | Mistake to avoid |
|---|---|---|---|
| Provision account | Identity user/store and manager operations | Local user record and credential state | Treating account existence as proof of current authentication |
| Authenticate browser | Password/passkey/external sign-in, then app cookie | Protected session ticket and request principal | Assuming a cookie is an API access token |
| Authenticate API | `JwtBearer` | Principal after token validation | Checking only a decoded token payload or accepting any issuer |
| Federate login | OIDC authorization code with PKCE | External identity result for the server-side app | Treating ID token as API credential or shipping client secret to browser |
| Authorize action | Policy, role, claim, or resource handler | Allow/deny result for this request and resource | Assuming successful authentication grants every action |
| Recover account | Email/reset/recovery/second-factor workflow | Controlled credential or authenticator recovery | Letting recovery become a weaker takeover path than sign-in |

## Worked examples

### Example 1: server-rendered web application

1. Configure a cookie as the normal session scheme and OIDC as the challenge scheme.
2. An unauthenticated browser request to a protected page triggers an OIDC challenge.
3. The provider authenticates the user and returns an authorization code to a registered server callback.
4. The handler validates the response, redeems the code with PKCE, and issues the app's protected cookie.
5. Future requests send that cookie; authentication creates the principal, then authorization checks the requested operation.

This uses OIDC for the cross-organization sign-in protocol and a cookie for the application's session. The tokens used between server and provider need not be exposed to the browser. [OIDC web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication)

### Example 2: API accepting a JWT access token

The API registers the JWT bearer handler against the expected authority and audience. A caller sends the token in the `Authorization` header. The handler validates signature, issuer, audience, and lifetime. If validation fails, authentication fails; if validation succeeds, authorization still evaluates scopes, roles, claims, and resource rules. Signature validation alone is insufficient if the token is intended for a different issuer or API. [JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication)

### Example 3: simple API using Identity endpoints

An application may map Identity API endpoints to provide account registration and login with a protected proprietary token or cookie behavior. This can be convenient when the app owns its user store and needs a bounded first-party scenario. It does not create a standards-based OAuth authorization server, supply arbitrary scopes/clients, or make the resulting token a JWT. The client and API must agree on the built-in scheme and operational limits. [Identity API guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization)

## Misconceptions and edge cases

- **“A signed token is safe for every API.”** A valid signature says an approved key signed it. Issuer, audience, expiry, algorithm/key policy, and intended token purpose still matter.
- **“JWT means encrypted.”** JWTs are commonly signed, not encrypted. Their claims are typically readable by the bearer; do not put secrets in them.
- **“Identity's bearer token is a JWT.”** Built-in Identity API bearer tokens are proprietary protected tokens. Use `JwtBearer` for JWT access-token validation from a trusted issuer.
- **“The ID token is the API token.”** The ID token is addressed to the OIDC client. A resource API needs an access token intended for that API.
- **“A successful login implies authorization.”** Authentication establishes a principal. Authorization must still check the requested action and often the target resource.
- **“A cookie is automatically revoked when a password changes.”** Cookie tickets can remain valid until expiration or validation/revocation mechanisms detect a change. Configure security-stamp validation and session lifetime deliberately.
- **“Passkeys make account recovery unnecessary.”** Users lose devices, authenticators become unavailable, and accounts may be compromised through recovery. Recovery must be designed with security comparable to primary authentication.
- **“`SameSite` alone prevents every CSRF attack.”** Browser behavior and cross-origin workflows vary; use the application's antiforgery protections for cookie-authenticated mutations.
- **“Development HTTPS behavior proves production cookie security.”** Confirm external TLS termination, trusted forwarded headers, secure cookie policy, callback URI registration, and shared Data Protection keys in the deployed topology.

## Knowledge checks with answers

1. **Why should an API not accept an ID token just because it is signed?** Its intended audience and protocol purpose are the OIDC client, not necessarily the API. The API should validate an access token issued for its own audience.
2. **What does a cookie handler validate?** A protected authentication ticket presented by the browser under the configured cookie scheme; it then creates the request principal.
3. **Does `MapIdentityApi<TUser>` provide a general OAuth server?** No. It maps built-in Identity account endpoints and may issue proprietary protected tokens for simple scenarios.
4. **What does PKCE add to authorization code flow?** A per-authorization verifier/challenge binding that helps prevent an intercepted code from being redeemed by an attacker.
5. **After JWT validation succeeds, what security step remains?** Authorization against the endpoint policy and any resource-specific rules.
6. **What is the passkey verifier proving?** That the credential's private key holder signed the expected fresh challenge for the correct relying-party context and origin, under the server's registered public credential.

## Recent version changes

ASP.NET Core 10 added built-in ASP.NET Core Identity passkey support. ASP.NET Core 11 retains it and exposes configuration through `IdentityPasskeyOptions`, including domain, challenge, authenticator, origin-validation, algorithm, and attestation-verification behavior. Verify the exact properties against the target framework's documentation because Identity's built-in implementation has a narrower scope than general WebAuthn. [ASP.NET Core 10 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-10.0) [Passkeys](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)
