# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Interview questions and reasoning

## Core questions

### 1. What does ASP.NET Core Identity provide, and what does it not provide?

Identity provides account/user management, credential workflows, stores, roles/claims integration, sign-in management, token providers, and supported account endpoints. Its built-in API bearer tokens are proprietary protected tokens. Identity alone is not a standards-compliant OAuth/OIDC authorization server.

### 2. When would you use cookie authentication versus bearer authentication?

Cookies commonly carry an authentication ticket for browser sessions and are sent ambiently by browsers, which makes antiforgery relevant. Bearer credentials are explicitly sent by clients to APIs; the API validates issuer, audience, signature, and lifetime when using JWTs. Do not assume that “bearer” means JWT or that a cookie and access token have the same lifecycle.

### 3. Why is an OIDC ID token not an API access token?

The ID token communicates authentication to the OIDC client and is issued for that client audience. An API expects an access token issued for its resource audience and authorization semantics. Accepting ID tokens can create token-substitution/confusion vulnerabilities.

### 4. How should a server-rendered web app sign in through an identity provider?

Use the authorization-code flow with PKCE through a confidential server-side client. Validate the OIDC response, map only claims the app trusts, and commonly establish a local cookie. Keep client credentials on the server, and protect state-changing cookie-authenticated operations from CSRF.

### 5. What does a valid JWT signature prove?

It proves the token bytes were signed by the key corresponding to the verified signing key, assuming the key is trusted and the algorithm is correctly constrained. It does not prove the token is for this API or currently valid. Also validate issuer, audience, and lifetime, then enforce authorization requirements.

### 6. Do Identity passkeys automatically count as its built-in second factor?

No. The built-in passkey integration is a primary Identity sign-in method. Identity authenticator-app codes and recovery codes belong to a separate two-factor workflow. User verification on a device should not be confused with proof that Identity's configured 2FA step ran.

### 7. What does Identity do with WebAuthn attestation by default?

The documented default does not validate attestation statements. Assertion verification and attestation trust are separate: the app can verify that the credential signed the ceremony while not asserting that a specific authenticator vendor/model was validated. Custom attestation policy requires a maintained trust source and clear requirement.

### 8. Why can a passkey signature counter fail as clone detection?

Some synced or multi-device credentials do not provide a simple monotonic counter. A non-increasing value may be a risk signal, but rejecting every such assertion can lock out legitimate users. Use a broader risk and recovery policy.

## Concise interview answers

- **What invalidates a cookie ticket?** Expiry, protection/key incompatibility, explicit sign-out, or server-side principal/session validation; a role/password change is not necessarily immediate unless revocation/stamp validation is designed for it.
- **Does logging out invalidate every token?** No. It signs out the relevant scheme/session; independent stateless bearer tokens follow their issuer's expiry/revocation semantics.
- **What is the difference between 401 and 403?** 401 is missing/invalid authentication and triggers an applicable challenge; 403 is an authenticated principal denied access.
- **What is PKCE for?** It binds authorization-code redemption to the client instance that initiated the flow, mitigating interception, and is used with authorization code by public clients and recommended for web flows.
- **Should an API redirect an unauthenticated caller to an OIDC login page?** An API normally issues the appropriate bearer challenge (401); redirecting a programmatic client is usually the wrong contract.
- **How do Identity lockout settings stop distributed guessing?** They do not alone; account lockout is not an IP/device/global rate limiter. Combine appropriate throttling and abuse monitoring while preventing lockout denial of service.
- **What is stored for a passkey?** Public credential material and metadata, not the authenticator's private key.
- **Why validate a passkey origin and relying-party ID?** They bind the signed ceremony to the intended web origin/domain and make phishing/replay across sites harder.
- **What is the significance of ASP.NET Core 11 `TimeProvider` support?** It lets Identity time-dependent behavior be tested deterministically by injecting/advancing a clock; it is not a new credential protocol.
- **What is DBSC's ASP.NET Core 11 status?** Experimental support and experimental browser implementations; verify compatibility, fallback, and failure/revocation behavior before deployment.

## Deep follow-up answers

### How do you distinguish Identity API tokens from JWTs?

Inspect the documented scheme and token handler rather than inferring from the `Bearer` header. Identity API tokens are protected opaque/proprietary framework tokens, not standards-compliant JWT access tokens. They do not provide arbitrary OAuth delegation/interoperability. If multiple APIs or independent clients need scopes, consent, federation, and interoperable access tokens, select a proper authorization server and configure APIs to validate its tokens.

### How do you reason about cookie lifetime across replicas?

The browser cookie carries a protected ticket. Replicas need compatible shared Data Protection keys and application discriminator to unprotect it. Ticket expiry and browser persistence are related but distinct. Sliding expiration can renew a ticket; it is not the same as an absolute session age cap. Security-stamp/principal revalidation trades revocation delay against database work. Keep claims compact and choose explicit absolute and idle-session policy.

### How do you safely link external identities?

Use the stable provider subject, not email alone, as the external identity key. Require proof of control over the existing local account and a fresh successful provider callback. Check the provider's email verification guarantees, notify/audit the change, prevent CSRF/account swapping, and define unlinking and recovery. Never automatically merge accounts solely because email strings match.

### What passkey properties must the server verify?

The expected challenge and ceremony state, origin, relying-party ID, credential ID/ownership, authenticator response flags relevant to policy, and signature against the stored public key. The private key stays with the authenticator. Challenge uniqueness/expiry and one-time consumption prevent replay. Account management separately authorizes enrollment, listing, rename, and removal.

### How does recovery affect MFA strength?

Attackers target the weakest recovery path. Recovery codes are bearer secrets and should be one-time, regenerated on replacement, shown once, and redacted from logs. Email or SMS recovery can have lower phishing/interception resistance than passkeys or authenticator apps. Design support-assisted recovery with identity proofing, notice, audit, delays/step-up where appropriate, and a policy against silently removing all strong credentials.

### What is the right way to use Identity `TimeProvider`?

Register one test provider before building the Identity service provider and use the same instance to advance the clock. Test expiry/lockout/security-stamp intervals before, at, and after boundaries. This keeps tests fast and deterministic. Also verify production uses the intended system time source and monitor clock skew where tokens cross systems.

### How should a team evaluate DBSC?

Treat ASP.NET Core 11 support and browser implementation as experimental. Verify package/API state for the target build and test the intended browser matrix. Model registration, device key loss/rotation, refresh cookie theft, logout and server-side revocation, multiple devices, account recovery, and conventional fallback. It layers session-refresh protection over authentication; it does not replace cookie flags, CSRF protection, authorization, or passkeys.

## Scenario questions

1. A mobile client sends an OIDC ID token to your API. What should the API do, and how should the client obtain the right credential?
2. An attacker steals a browser cookie. Which cookie controls, revalidation, lifetime choices, and incident response bound exposure? What risks remain if DBSC is enabled experimentally?
3. A user changes a local password but an old cookie remains active. Which Identity/Data Protection/security-stamp policies would you inspect?
4. A passkey registration response comes from the wrong origin but has a valid-looking signature. Why must the server reject it?
5. A provider login has the same email as a local administrator. What proof is required before account linking?
6. The authenticator code expires at the boundary in a flaky test. How do you make the test deterministic and clarify the boundary semantics?

## Tradeoffs and alternatives

| Need | Suitable mechanism | Key tradeoff |
|---|---|---|
| Local accounts with first-party needs | ASP.NET Core Identity | App owns lifecycle, delivery, recovery, authorization policy |
| Browser session | Protected cookie ticket | Ambient credential means CSRF controls and ticket lifecycle matter |
| API access across interoperable services | Standards-compliant OAuth/OIDC issuer + JWT bearer validation | Requires issuer configuration, key rotation, audience/scope design |
| User sign-in delegated to provider | OIDC authorization code with PKCE | External claims need careful mapping and local account-link policy |
| Phishing-resistant primary credential | Passkey | Browser/authenticator coverage and account recovery need planning |
| Second factor / fallback | Authenticator code plus single-use recovery codes | Enrollment/recovery can become the weakest path |
| Experimental session refresh binding | DBSC evaluation | Version/browser maturity and fallback are unresolved risks |

## Common weak answers

- “A JWT is secure because it is signed.” Signature alone does not validate issuer, audience, lifetime, algorithm policy, or authorization.
- “Identity is an OAuth server.” The built-in Identity API endpoints and protected tokens are not a complete OAuth/OIDC provider.
- “The browser cookie is safe because JavaScript cannot read it.” `HttpOnly` does not prevent CSRF because browsers attach eligible cookies automatically.
- “A valid ID token is fine for the API.” It has the wrong purpose/audience; use an access token for that resource.
- “A passkey always means two factors.” Identity's built-in passkey and second-factor flows are distinct; authenticator/provider behavior varies.
- “Email matching proves the accounts belong together.” Require control of both the local account and provider identity.
- “DBSC removes the need for session controls.” It is experimental and does not remove CSRF, authorization, expiry, revocation, or recovery concerns.

## Self-check rubric

Score each dimension 0–2: **0** omitted/incorrect, **1** partly correct, **2** precise with a consequence/tradeoff.

1. Separates local Identity services from an OAuth/OIDC authorization server.
2. Separates browser cookies, Identity proprietary tokens, JWT access tokens, and OIDC ID tokens by purpose.
3. Describes issuer, audience, signature, lifetime, and authorization checks.
4. Explains CSRF and cookie/session lifecycle controls.
5. Describes passkey ceremony and origin/RP/challenge validation without overclaiming attestation or 2FA.
6. Includes safe external linking, MFA/recovery, and time-dependent testing.
7. Calls ASP.NET Core 11 DBSC experimental and names fallback/revocation concerns.

**Interpretation:** 12–14 is interview-ready; 8–11 needs targeted review; below 8 revisit the overview and the relevant reference unit, then retry the scenarios without notes.

## Sources

- [ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)
- [Identity API authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization)
- [Cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie)
- [JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication)
- [OIDC web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication)
- [ASP.NET Core passkeys](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)
- [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)
