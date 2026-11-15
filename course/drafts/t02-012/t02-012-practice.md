# ASP.NET Core Identity accounts cookies bearer tokens OpenID Connect and passkeys — Exercises and worked solutions

## Goals

Practice choosing the right authentication mechanism for the caller and application boundary, tracing the complete sign-in path, and recognizing when Identity's built-in account endpoints or passkey support are not enough. The exercises emphasize protocol purpose and trust boundaries rather than memorizing configuration syntax.

## Worked example

### Scenario

A company has three clients:

1. A server-rendered web application where employees sign in with the company's identity provider.
2. A separate inventory API that serves the web application and a mobile client.
3. A small first-party account service for a learning portal that stores its own users and needs registration, login, password reset, and optional passkey sign-in.

### Reason through the boundaries

- The server-rendered app is an OIDC confidential client. Use authorization code flow with PKCE. The OIDC handler handles redirects and the callback; an application cookie is the browser session. Store any client credential on the server.
- The inventory API should validate access tokens intended for that API. With a JWT issuer, configure `JwtBearer` against the trusted authority and audience and validate signature, issuer, audience, and lifetime. It should not receive the web app's ID token or its cookie as an API bearer token.
- The learning portal can use Identity for local users and its built-in Identity API endpoints if the proprietary token/cookie behavior fits this first-party scope. If the portal needs standard delegated scopes, many independently registered clients, or interoperable access tokens for several services, use an OAuth/OIDC provider instead.
- Passkeys may be another primary sign-in method for portal accounts. Configure the relying-party domain and accepted origins intentionally, and provide recovery. Built-in Identity passkeys do not turn into Identity's second-factor authenticator flow.
- Every application still defines authorization. “Authenticated employee” does not mean “may edit every inventory item.”

This design keeps each credential at the boundary that understands it. [OIDC web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication) [JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication) [Identity API guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization) [Passkey guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)

## Exercises

### Exercise 1: classify each credential

For each artifact below, state which component should normally consume it and one check that must be performed:

1. An application authentication cookie sent by an employee's browser.
2. A JWT access token with an audience for the inventory API.
3. An OIDC ID token whose audience is the web application's client ID.
4. An Identity API proprietary refresh token.
5. A passkey assertion from the browser.

### Exercise 2: diagnose the login/API bug

A frontend redirects to its identity provider, receives an ID token, and sends it as `Authorization: Bearer` to an API. The API decodes the payload and checks only that it contains a `role` claim. Identify at least four independent problems and propose a corrected flow.

### Exercise 3: design account linking

A user is signed into a local account and chooses “Connect provider.” The provider returns an external identity with a matching email string. Explain a safe linking sequence. What must the app not assume about the matching email?

### Exercise 4: select the built-in Identity API or a provider

Choose between built-in Identity endpoints and a standards-compliant OAuth/OIDC provider for each requirement:

1. A single first-party app needs basic local registration/login/password reset.
2. Several independently deployed services need interoperable access tokens, multiple client registrations, delegated scopes, and federation.
3. An API needs to validate access tokens from an external issuer but does not handle browser login itself.

Explain the boundary for each choice.

### Exercise 5: review the passkey deployment

A team sets `ServerDomain = "example.com"`, accepts every origin in `ValidateOrigin`, trusts incoming forwarded-host headers from every proxy, and has no recovery plan. List the risks and a safer deployment plan.

### Exercise 6: session revocation and cookie behavior

An employee's role is removed in the database, but an existing browser cookie still contains the role claim. The employee can still access a privileged endpoint for up to 30 minutes. Explain why this can happen and give two ways to reduce the stale-authorization window. State the tradeoff for each.

## Progressive hints

1. Ask what protocol each artifact belongs to and who is its intended audience. Do not infer token purpose from its encoding or signature alone.
2. Separate identity assertion, access authorization, and application session. Check signature/key, issuer, audience, expiration, and the appropriate claim/policy boundaries.
3. Account linking should begin from a local authenticated session and use the provider's stable subject identifier after a validated callback. Email equality is not automatically proof of same-person ownership.
4. The built-in Identity API's bearer token is proprietary; an API validating a JWT from a trusted provider has a different job from an interactive OIDC client.
5. RP ID and origin are security boundaries. Trust only known reverse proxies and explicitly allowed origins; never use permissive validation as a quick deployment fix.
6. A cookie is a snapshot of claims until renewed/revalidated or expired. Consider security-stamp checks, short session lifetime, or authorization that reads current resource/account state.

## Complete solutions

### Solution 1: classify each credential

1. **Application cookie:** The web application's cookie authentication scheme consumes it, unprotects the ticket with Data Protection, checks ticket validity, and creates the browser request principal. The browser's `Secure`, `HttpOnly`, and SameSite behavior controls transport; authorization still evaluates the principal.
2. **JWT access token:** The inventory API's JWT bearer handler consumes it. It validates the signature against trusted issuer keys, expected issuer, expected audience, and lifetime before authorizing the request.
3. **ID token:** The OIDC client validates it as part of the authentication response for its own registered client. The resource API should not treat it as an access token because the audience/purpose is the client.
4. **Identity API proprietary refresh token:** The built-in Identity API's matching refresh endpoint/handler consumes it. It is a protected Identity token, not an OAuth refresh token for arbitrary clients; store and transmit it as a secret.
5. **Passkey assertion:** The server-side passkey/Identity ceremony handler consumes it. It validates the fresh challenge, expected RP ID/origin, credential identifier, signature against stored public key, and ceremony state before signing in the user.

### Solution 2: diagnose the login/API bug

The design has several independent flaws:

- It sends an **ID token** to a resource API; the token's audience is the OIDC client, not the API.
- It decodes the payload but does not validate the signature against trusted keys.
- It does not validate the issuer, so a token from an unintended issuer could be accepted.
- It does not validate audience or expiration.
- It treats a role claim as authorization without establishing that the claim is trusted, mapped correctly, or sufficient for the specific resource.
- It may expose a credential through browser storage/logging/replay and confuses authentication with authorization.

Correct flow: the client obtains an **access token** intended for the inventory API through the provider's supported flow. The API validates signature/key, issuer, audience, and lifetime with `JwtBearer`, then applies endpoint and resource-specific authorization. The web app's own OIDC ID token is consumed by the OIDC client and can be used to establish the local app cookie; it is not forwarded to the API as its bearer credential. [JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication)

### Solution 3: design account linking

1. Require the user to be authenticated to the local account and, for high-risk accounts, require recent reauthentication or another step-up check.
2. Issue a provider challenge using the configured remote OIDC scheme, with protected correlation/state and a registered callback.
3. Validate the remote response and obtain the provider's stable subject/provider key from the validated external login result.
4. Show the user which provider/account will be linked and prevent the provider key from already belonging to another local user.
5. Persist the association through the Identity login store/user manager, then notify the user and audit the action without logging tokens.
6. Provide safe unlinking only when another viable sign-in/recovery method remains.

Do not assume that two identical email strings prove the same person's ownership. The provider may not verify the email, the address may have changed or been reassigned, and local confirmation may be stale. Use the stable external subject and a deliberate account-linking policy. [Identity overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity)

### Solution 4: choose the token architecture

1. **Built-in Identity API can fit** a bounded first-party local-account service if its endpoint behavior and proprietary protected-token/cookie model meet the app's needs. Add secure email delivery, rate limits, authorization, and recovery.
2. **Use a standards-compliant provider.** Multiple independent clients, delegated scopes, federation, and interoperable access tokens require authorization-server capabilities beyond the built-in Identity API. Each resource API validates access tokens for its own audience.
3. **Use `JwtBearer` at the API.** The API can validate the external issuer's access tokens without owning browser login. The client/provider handles obtaining the token; the API validates the expected issuer, audience, signature, and lifetime.

### Solution 5: fix the passkey deployment

The parent RP ID `example.com` can make credentials usable across its subdomains. If any covered subdomain serves untrusted content or is controlled by another party, the trust boundary is too broad. Accepting every origin defeats origin validation. Trusting forwarded-host values from arbitrary proxies lets an attacker influence the host/origin context. Without recovery, device loss can permanently lock users out.

Safer plan: choose the narrowest RP ID that matches the product's intended sharing boundary; configure the host allowlist and trust forwarded headers only from known proxies; validate exact HTTPS origins (or an explicit small allowlist); keep ceremony challenges fresh and short-lived; bound passkey count/display names; require recent authentication for credential removal; and provide well-protected recovery such as a second credential or carefully designed recovery flow. [Passkey guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)

### Solution 6: control stale cookie authorization

The cookie contains a principal/role claim issued at sign-in. Removing the role from the database does not rewrite an already issued self-contained ticket. The handler can continue accepting it until expiry unless the app revalidates or loads current authorization state.

Options include:

- **Shorter ticket lifetime or more frequent sliding/session reauthentication:** reduces the maximum stale window, but may increase login friction and does not provide immediate revocation by itself.
- **Security-stamp validation with a shorter interval:** detects relevant account changes and rejects/refreshes stale tickets sooner, at the cost of more store reads and a bounded delay up to the validation interval.
- **Current policy/resource check during authorization:** evaluate whether the user currently has permission for the requested resource, rather than relying solely on an old role snapshot. This is fresher but can add database/cache cost and requires correct failure behavior during dependency outages.

For sensitive operations, combine current resource authorization with a session-revocation strategy. A role claim remains useful for coarse policy selection, but it should not be the sole source for volatile, high-impact decisions. [Identity configuration](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration) [Cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie)

## Tests and edge cases

- Reject a JWT with a valid signature but the wrong audience, wrong issuer, or expired lifetime.
- Confirm the API accepts an access token for its own audience and rejects the client's ID token.
- Verify cookie authentication produces a principal before authorization and that an unauthorized authenticated principal gets 403 rather than being misreported as a failed login.
- Verify account recovery and forgot-password responses do not reveal whether a local account exists.
- Test external linking with a provider key already associated with another user and with matching but unverified email claims.
- Test passkey registration/assertion with a wrong origin, wrong RP ID, replayed challenge, and unknown credential.
- Test a role/security-stamp change while an older cookie remains active; record the configured stale-claim window.
- Test OIDC callback behavior through the actual TLS-terminating proxy and production host/path configuration.

## Reflection questions

1. Which credential will each client present, and which handler is the only component that should consume it?
2. What is the intended audience of every token in your design?
3. What is your maximum tolerated delay between account disablement and rejection of an existing cookie?
4. Which operations require current resource data instead of a role snapshot in a ticket?
5. Can any recovery or account-linking path bypass the protections of the normal sign-in path?
6. What operational secrets, keys, and metadata must be shared across replicas, and how are they rotated?

## Sources

- [Configure OpenID Connect web authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication)
- [Configure JWT bearer authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication)
- [Identity API endpoint guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization)
- [ASP.NET Core passkey guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/passkeys/)
- [Configure ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-configuration)
- [Configure cookie authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie)
