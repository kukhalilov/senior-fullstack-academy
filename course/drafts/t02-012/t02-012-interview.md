# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Interview questions and reasoning

## Core questions

1. What does ASP.NET Core Identity provide, and what is outside its responsibility?
2. Distinguish an authentication scheme, handler, principal, cookie ticket, JWT access token, OIDC ID token, and Identity API bearer token.
3. What must an API validate before trusting a JWT access token?
4. Why should an interactive web app use OIDC authorization code flow with PKCE, and where does the resulting browser session live?
5. How do Identity's `UserManager<TUser>` and `SignInManager<TUser>` differ?
6. What does Data Protection do for cookie authentication, and what must be shared across replicas?
7. What does Identity's built-in passkey implementation support, and what are its important limits?
8. How do two-factor authenticator codes and recovery codes behave?
9. How can account changes such as role removal or password reset affect already-issued cookies?
10. Why are account linking and recovery paths high-risk operations?

## Concise interview answers

1. Identity manages local account records, credential/account workflows, stores, token providers, and sign-in orchestration. It is not itself a general OAuth/OIDC authorization server, and it does not replace authorization policy or business-resource checks.
2. A scheme names a configured authentication handler. The handler consumes a credential and can produce a principal. A cookie ticket is a protected application session carried by a browser. A JWT access token is a signed token a resource API validates for itself. An ID token reports authentication to the OIDC client. Identity API bearer tokens are protected proprietary tokens for the matching built-in handler, not JWT/OAuth tokens.
3. Validate trusted signing keys/signature, issuer, audience, and lifetime. Then apply authorization; successful authentication is not permission for every operation.
4. Code flow keeps tokens off the front channel; PKCE binds the authorization request to its code redemption. A server-side confidential client keeps its credential on the server. The app commonly issues its own protected cookie for later browser requests.
5. `UserManager<TUser>` orchestrates account/store/credential operations. `SignInManager<TUser>` handles sign-in policy and scheme integration, including lockout and two-factor outcomes.
6. Data Protection protects the ticket contents against tampering and disclosure. Nodes that read the same cookies need a compatible, durable shared key ring and application discriminator.
7. Identity supports passkey registration and sign-in for common Identity scenarios. Default attestation validation is absent, the implementation is not a general WebAuthn library, and passkeys are not automatically Identity's second factor.
8. An authenticator code is validated through a configured token provider in the two-factor flow. A recovery code is a one-time substitute and is consumed on successful use; protect and regenerate the set carefully.
9. A self-contained cookie may retain old claims until ticket expiry or revalidation. Security-stamp validation, short lifetimes, refresh/reissue, or current resource authorization can reduce stale decisions, with data-store and user-experience costs.
10. Linking can bind an attacker-controlled external identity to a victim's local account; recovery can bypass primary authentication. Require a trusted local session/step-up, validate the provider callback, use stable provider identifiers, notify the user, and preserve another recovery method before unlinking.

## Deep follow-up answers

### Why is JWT validation more than signature checking?

A signature establishes that an accepted key signed the token and that signed bytes have not been altered. It does not establish that the key belongs to an issuer this API trusts, that the token is intended for this API, or that the token is still within its validity period. Therefore issuer, audience, lifetime, and signature/key validation belong together. The API also needs an authorization policy that interprets claims from that issuer. An ID token may be signed by the same provider but have a client audience and different purpose, so it must not be substituted for an API access token. [JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication)

### Why not store every OIDC token in the application cookie?

Saving tokens in authentication properties can be convenient for server-side calls, but it expands the sensitive ticket, increases request-header size, and couples token exposure to session-ticket handling. A protected cookie is not visible as plaintext to ordinary clients, but a stolen cookie can be replayed and logs or diagnostics may leak values. If downstream API tokens need independent lifetimes, refresh, or revocation, store them server-side under an explicit token-lifecycle policy instead of blindly adding them to every browser ticket. [OIDC web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication) [Cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie)

### When is a role claim too stale to authorize an operation?

A claim is a snapshot issued when the principal was created. If role membership changes in storage, a cookie may still contain the older claim. Periodic security-stamp validation bounds some stale-account behavior but is interval-based; it can also require store reads. For high-impact, resource-specific operations, evaluate current ownership/permission state in an authorization handler or domain service. Choose a freshness target, then design caching and dependency-failure behavior around it.

### What should a passkey deployment review cover?

The review should include HTTPS, the RP ID, accepted browser origins, host-header validation, trusted forwarded-header sources, challenge freshness/replay protection, credential ownership, account credential limits, attestation requirements, recovery, and safe credential removal. The `ServerDomain` affects subdomain scope. Default attestation validation is absent, and a permissive origin callback removes an important trust boundary. [Passkey guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)

## Scenario questions

### Scenario 1: one service accepts tokens from two identity providers

How would you select a validation scheme?

**Strong reasoning:** Prefer separate APIs/schemes when boundaries differ. If a single API must support both issuers, select from trusted request metadata or a tightly designed policy scheme, then validate issuer, audience, keys, and lifetime under the chosen issuer-specific configuration. Do not decode unvalidated token claims and forward to a weaker handler.

### Scenario 2: a user wants to connect a second sign-in provider

What checks prevent linking the wrong provider account?

**Strong reasoning:** Begin from an authenticated local account, require step-up/recent authentication where warranted, use a state-protected remote challenge, validate the callback, link the provider's stable subject key, detect existing links, and notify the user. An email match alone is not sufficient unless both identity systems and the account-link policy establish verified ownership.

### Scenario 3: a password reset should sign out all devices

What does the application need to do?

**Strong reasoning:** Use the manager's password-reset flow and update the security stamp according to policy. Cookie validation is periodic, so set an appropriate interval or use server-side ticket/token revocation where immediate logout is required. External provider sessions and independent bearer access tokens have their own lifecycles and are not automatically revoked by clearing a local cookie.

### Scenario 4: passkey-only sign-up

What failure mode must be designed before launch?

**Strong reasoning:** Device loss, account recovery, credential deletion, and authenticator replacement. Provide additional passkeys or a strong recovery route, rate-limit it, notify the account owner, and avoid a recovery channel that is easier to take over than passkey sign-in.

## Tradeoffs and alternatives

| Choice | Fits | Costs or boundary |
|---|---|---|
| Identity local accounts | App-owned user/password/role/account lifecycle | App owns hardening, delivery, recovery, privacy, and operational security |
| Identity built-in API endpoints | Simple first-party account API using built-in proprietary behavior | Not a general OAuth/OIDC provider; endpoint customization and interoperable token capabilities are limited |
| Cookie session | Browser app or BFF session | Requires CSRF defenses, Data Protection key management, session lifecycle, and proxy-aware HTTPS settings |
| JWT bearer resource validation | API validates access tokens from a trusted issuer | API must configure issuer/audience/key/lifetime trust and authorization; JWT format alone is not sufficient |
| External OIDC provider | Federated interactive authentication | Callback, claim mapping, client credential, account linking, provider outages, and local authorization remain app concerns |
| Built-in Identity passkeys | Common passkey registration/sign-in for Identity users | Not general WebAuthn, no default attestation verification, and no built-in Identity 2FA semantics |

## Common weak answers

- “Identity issues JWTs.” The built-in Identity API uses proprietary protected bearer tokens; JWT issuing requires an appropriate issuer/provider.
- “The token is signed, so the API can trust it.” Signature verification alone does not check issuer, audience, expiration, or intended token type.
- “The ID token proves login, so it is fine for the API.” The ID token is for the OIDC client; the API needs an access token for itself.
- “PKCE is only for public clients.” The ASP.NET Core guidance recommends code flow with PKCE for confidential interactive web clients too.
- “The cookie expires when the browser closes.” Browser persistence and ticket expiry are separate. A session cookie can hold a finite-lifetime ticket, and persistent cookies can hold expired tickets.
- “Passkeys remove MFA and recovery concerns.” Identity treats built-in passkeys as primary sign-in, and recovery remains critical.
- “Role changes take effect as soon as the database updates.” Existing principal tickets can be stale until revalidation, renewal, or expiration.
- “Matching email addresses mean the accounts belong to the same user.” Email may be unverified, mutable, or reassigned; safe linking uses validated provider subject identity and explicit policy.

## Self-check rubric

Score each item from 0 to 2: **0** = cannot explain; **1** = names the idea but misses a boundary; **2** = explains the mechanism, failure mode, and tradeoff.

- Separates account management, authentication, and authorization.
- Distinguishes cookie session, Identity API token, JWT access token, and OIDC ID token.
- Names all required JWT validation checks and explains 401 versus 403.
- Traces server-side OIDC authorization-code plus PKCE into a local app cookie.
- Explains Data Protection key sharing and cookie revocation latency.
- Describes passkey challenge, RP ID/origin, private/public-key boundary, and built-in limitations.
- Covers two-factor enrollment and one-time recovery code handling.
- Identifies safe external-account linking and recovery requirements.

Suggested interpretation: 14–16 is ready for a focused interview discussion; 10–13 needs practice on the missed boundaries; below 10, revisit the concepts and authentication references before rehearsing again.

## Sources

- [ASP.NET Core Identity overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)
- [Identity API endpoint guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization)
- [Configure cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie)
- [Configure JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication)
- [Configure OpenID Connect web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication)
- [Passkey guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)
