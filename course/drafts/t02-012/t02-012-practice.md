# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Exercises and worked solutions

## Goals

Practice choosing an authentication mechanism for the caller and application boundary, tracing sign-in and recovery, and detecting token or session confusion. The exercises focus on security properties, not on memorizing configuration syntax. [Identity overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) [Identity API guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization) [JWT bearer guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication) [Passkey guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)

## Worked example

A company has a server-rendered staff portal, a JSON API, and a mobile client. Local accounts are stored with Identity. The portal needs a familiar redirect-based sign-in. The API needs standard access tokens and delegates authorization to resource scopes. The mobile app is a public client and cannot keep a client secret.

**Design:** The portal uses OIDC authorization-code flow with PKCE through a confidential server-side client, then creates a local cookie session. The API validates access tokens from a trusted authorization server, checking signature, issuer, audience, lifetime, and required permissions. The mobile app uses the provider's supported public-client authorization-code-with-PKCE flow. Identity remains useful for local user management if that matches the account model, but it does not become the OAuth server. Each service stores secrets in protected server configuration, and state-changing cookie-authenticated portal requests use antiforgery defenses.

**Why this design:** It respects each credential's intended audience and holder. The cookie is for the browser session, an access token is for the API, and the OIDC ID token is for the client. A single token should not be accepted by every endpoint just because it is syntactically valid.

## Exercises

### Exercise 1: choose the token validator

An API receives a compact three-segment token signed by a known identity provider. Which checks are essential, and should the API accept an ID token whose signature is valid?

### Exercise 2: diagnose a logout report

A user logs out from an application using a cookie in one browser, but their already-issued proprietary Identity API bearer token still works until later. Explain why and give two ways the design can bound the exposure.

### Exercise 3: prevent cross-site account changes

A cookie-authenticated browser app has a `POST /profile/email` endpoint. The cookie is `HttpOnly` and `Secure`. Is that enough to prevent a malicious website from causing the browser to submit the request? Specify the missing control and explain why.

### Exercise 4: choose built-in Identity API or an authorization server

Decide whether built-in Identity endpoints or a standards-compliant provider fit these cases:

1. A first-party prototype with local accounts and one API, where the application can accept Identity's proprietary protected tokens.
2. Multiple independent clients require delegated scopes, consent, federation, and interoperable access tokens.
3. A public SPA would embed a client secret to use a confidential-client flow.

### Exercise 5: design safe external account linking

A new external provider returns a user with the same email address as an existing local user. Should the app automatically merge the accounts? State a safer linking workflow.

### Exercise 6: plan passkey enrollment and recovery

Design a passkey enrollment flow for an existing local account. Name the ceremony data that must be validated, account controls around credential management, and at least two recovery considerations. Clarify the relationship to Identity MFA.

### Exercise 7: test Identity time boundaries

Identity lockout lasts 15 minutes. Propose a deterministic test using `TimeProvider` that checks the moment before expiry and after expiry. Why is a sleep-based test inferior?

### Exercise 8: assess DBSC claims

A product owner says, “ASP.NET Core 11 DBSC means we can remove SameSite, antiforgery, and server-side revocation because stolen cookies cannot be reused.” Identify the false assumptions and a safer rollout approach.

## Progressive hints

1. Token syntax is not token purpose; ask who issued it, who it is for, and what type the API expects.
2. Consider whether logout can invalidate a stateless credential without server-side state.
3. `HttpOnly` limits JavaScript access; ask whether browsers still attach cookies automatically.
4. Compare first-party simplicity with standardized delegation and multiple-client requirements.
5. Equal email strings do not prove that the same person controls both identities now.
6. Treat passkey registration as a server-validated ceremony and plan account recovery separately.
7. Use the same fake clock instance for Identity and assertions; test boundary conditions.
8. Check whether DBSC is stable and universally implemented, and identify protections at distinct layers.

## Complete solutions

### Solution 1

Validate a trusted signature/key, exact trusted issuer, intended API audience, and token lifetime. Enforce required scopes/roles/policies after authentication. Do not accept a validly signed ID token as an API access token: its audience and purpose are the OIDC client, so accepting it creates token confusion. Configure the bearer handler for the expected authority and audience, and test issuer/key rollover behavior.

### Solution 2

Cookie logout clears the browser's cookie, but a stateless protected bearer token is not necessarily recorded in a revocation list. It can remain usable until its configured expiration. Bound risk by using short access-token lifetimes with protected refresh-token rotation/revocation, or add server-side revocation/security-stamp validation where the framework flow supports it. The exact mechanism depends on the token issuer; do not assume cookie sign-out revokes unrelated API tokens.

### Solution 3

No. Browsers attach eligible cookies automatically, which is the ambient-authority property behind CSRF. `HttpOnly` prevents script reads and `Secure` restricts transport to HTTPS; neither proves the user intended the cross-site state change. Add antiforgery token validation and an appropriate SameSite policy as defense in depth; validate origin/referer where suitable and avoid state-changing GETs.

### Solution 4

1. Built-in Identity API endpoints may fit a tightly scoped first-party application if its proprietary protected-token/cookie behavior is sufficient and the app supplies delivery, rate-limiting, recovery, and authorization controls.
2. Use a standards-compliant OAuth/OIDC authorization server. The built-in Identity API is not a full authorization server and does not supply the requested standardized delegation model.
3. A SPA is a public client and cannot protect an embedded secret. Use a supported public-client authorization-code-with-PKCE flow; keep secrets only in confidential server-side applications.

### Solution 5

Do not merge only because email strings match. Require an authenticated local session or a deliberate reauthentication step, then complete a fresh provider authentication and verify its stable subject. Ensure the provider's email-verification semantics meet policy, notify the user, protect against CSRF/account swapping, audit the link, and offer a safe unlink/recovery path. Persist the external provider key through Identity's login store.

### Solution 6

Require an authenticated account-management session and recent reauthentication for a sensitive account. Generate fresh server-side challenge/state bound to the user and registration ceremony. Validate challenge, origin, relying-party ID, credential identifier, public-key response, and ceremony type before persisting through the passkey-capable store. Do not collect/store the private key. Limit credential count and authorize list/rename/remove operations for the owner. Offer another enrolled credential, verified recovery process, and support escalation; removing the last credential must not lock out the owner. Identity passkeys are a primary sign-in path and do not automatically satisfy its separate authenticator-code 2FA step.

### Solution 7

Register a controllable fake `TimeProvider` before building Identity services and inject the same instance into the test. Trigger the configured failed sign-ins until lockout occurs; assert a sign-in remains locked just before the 15-minute boundary, advance beyond the boundary, and assert the expected behavior. Also test exact-boundary semantics according to the framework implementation. A sleep makes tests slow and susceptible to scheduler jitter; a fake clock is fast and repeatable.

### Solution 8

The claim overstates DBSC: ASP.NET Core 11 support and browser implementations are experimental; support is not universal. DBSC does not eliminate CSRF (a browser may still make authenticated requests), nor XSS, authorization flaws, or the need for server-side session revocation and account recovery. Retain secure cookie attributes, antiforgery and authorization checks. Evaluate DBSC behind an opt-in/feature flag with a browser matrix, test registration/refresh/logout/revocation/device loss, and provide a safe conventional-session fallback.

## Tests and edge cases

- JWT with valid signature but wrong audience: authentication must fail.
- Expired access token and a token from an untrusted issuer: authentication must fail.
- Authenticated user lacking a resource permission: authorization returns 403 rather than treating it as invalid authentication.
- Cookie sign-out followed by replay of a separate bearer token: expected behavior follows that token's own expiration/revocation design.
- Cross-site POST with ambient cookie but no valid antiforgery token: request is rejected.
- Passkey assertion with wrong origin, stale challenge, wrong account, or unknown credential: sign-in fails without leaking account-existence detail.
- External login with a matching but unverified email: no automatic account merge.
- Unknown AAGUID: user-editable display label remains safely encoded and cannot affect policy.
- DBSC unavailable browser: fallback retains a secure cookie session and does not silently weaken authentication.

## Reflection questions

1. Which credentials in your design are intended for a browser session, an API, or an OIDC client, and how does each validator enforce that purpose?
2. What server-side state or expiration policy bounds the lifetime of a stolen session or token?
3. Which recovery path is weakest, and could it bypass the strongest sign-in factor?
4. Which assumptions depend on a specific ASP.NET Core version or experimental browser capability?

## Sources

- [Identity API authorization and token behavior](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization)
- [JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication)
- [OpenID Connect web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication)
- [Cookie authentication and antiforgery context](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie)
- [Passkeys in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)
- [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)
