# architecture patterns multi-region tenancy and reliability — Reference: OAuth 2.0 Authorization Code with PKCE

Sources: [RFC 6749 — OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749.html), [RFC 7636 — PKCE](https://www.rfc-editor.org/rfc/rfc7636.html), [RFC 9700 — OAuth 2.0 Security Best Current Practice](https://www.rfc-editor.org/rfc/rfc9700.html), [RFC 10017 — OAuth 2.0 for Browser-Based Applications (BCP 212, August 2026)](https://www.rfc-editor.org/rfc/rfc10017.html), [RFC 8252 — OAuth 2.0 for Native Apps](https://www.rfc-editor.org/rfc/rfc8252.html), [RFC 8414 — Authorization Server Metadata](https://www.rfc-editor.org/rfc/rfc8414.html), [RFC 9207 — Authorization Server Issuer Identification](https://www.rfc-editor.org/rfc/rfc9207.html), [RFC 9449 — DPoP](https://www.rfc-editor.org/rfc/rfc9449.html), [current OAuth 2.1 Internet-Draft](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/).

## Scope and version

This lesson explains the OAuth 2.0 Authorization Code grant with Proof Key for Code Exchange (PKCE). It follows RFC 9700 security BCP and the August 2026 browser-app BCP RFC 10017, checked 20 November 2026. OAuth 2.1 remains an Internet-Draft at this review date; implement the published RFCs and current BCPs rather than treating a draft as final. Provider-specific requirements can be stricter. OAuth authorizes access to resources; use OpenID Connect (OIDC) when the application also needs a standardized authentication/identity layer.

## How this group fits the mental model

The user authenticates at an **authorization server** and grants a **client** limited access to a **resource server**. The client receives a short-lived authorization code through the user-agent redirect, then redeems it directly at the token endpoint. PKCE binds that code to the initiating client instance: an intercepted or injected code cannot be redeemed without the original high-entropy verifier. Tokens are issued by the authorization server; the client never asks the user for their authorization-server password.

```text
client creates verifier + state
  → browser redirects to authorization endpoint with code_challenge
  → user authenticates and consents
  → authorization server redirects back with one-time code + state
  → client checks state/issuer and redeems code + code_verifier
  → authorization server returns access token (and possibly refresh token)
  → client calls the intended resource server
```

## Supplied names explained

- **OAuth 2.0 Authorization Code with PKCE** — Authorization Code is the grant type; PKCE is an extension that creates a per-authorization verifier/challenge binding. Public clients must use PKCE, authorization servers must support it, and confidential clients are recommended to use it too under RFC 9700.

## The PKCE values

The client generates a cryptographically random `code_verifier` for each authorization attempt. RFC 7636 requires a verifier of 43–128 unreserved characters. The client computes:

```text
code_challenge = BASE64URL(SHA256(ASCII(code_verifier)))
code_challenge_method = S256
```

The verifier remains local until the token request. The authorization request sends only the challenge. `S256` is currently the method that does not disclose the verifier in the authorization request. `plain` transmits the verifier as the challenge and should not be used when S256 is available; current security guidance recommends challenge methods that do not expose the verifier.

`state`, `nonce`, and the PKCE verifier solve related but distinct protocol problems:

- `state` correlates the authorization response to the browser/client transaction and is commonly used for CSRF defense. Generate an unpredictable value, bind it to the initiating user-agent/session, compare it exactly, and consume it once.
- PKCE binds the authorization code redemption to the initiating client instance and protects against code interception/injection. It can also contribute CSRF protection when the authorization server correctly enforces PKCE, but do not treat a missing/mismatched verifier as optional fallback.
- OIDC `nonce` binds an ID Token to the authentication request and helps prevent token replay/substitution. It is not an OAuth access token or a replacement for PKCE.

If a client supports multiple authorization servers, validate the response issuer (`iss`) or use another specified mix-up defense; bind tokens and codes to the expected issuer.

## Request and response sequence

### 1. Create a transaction

Create fresh `state`, a PKCE verifier/challenge pair, and (for OIDC) a fresh `nonce`. Store the expected issuer, redirect URI, original return destination, and values in a short-lived, one-time transaction record tied to the browser session. Do not trust a return URL supplied after the callback; validate it against local policy to prevent open redirects.

### 2. Send the authorization request

Redirect the user-agent to the authorization endpoint using TLS. Common parameters are:

- `response_type=code`
- registered `client_id`
- exact registered `redirect_uri`
- requested `scope` values (including `openid` for OIDC)
- per-transaction `state`
- PKCE `code_challenge` and `code_challenge_method=S256`
- OIDC `nonce` when the flow uses OIDC

Use issuer/endpoint metadata from a configured trust source or RFC 8414 metadata. Do not accept an arbitrary authorization endpoint from user input. Use an exact redirect URI registration; wildcard or attacker-controlled callback destinations can leak codes.

### 3. Handle the callback

The authorization server authenticates the user and obtains consent as appropriate, then redirects to the registered callback with a short-lived, one-time `code` and the original `state` (or an error). The client checks that the callback is for the outstanding transaction, compares and consumes `state`, checks the expected authorization-server issuer where available/required, and handles errors without exposing codes to logs, analytics, referrers, or third-party page resources. Authorization codes are credentials; keep them out of browser history and logs.

### 4. Redeem the code

The client sends a back-channel HTTPS POST to the token endpoint with `grant_type=authorization_code`, `code`, the exact same `redirect_uri` if it was included in the authorization request, and the original `code_verifier`. A confidential client also authenticates using its registered method (for example, a server-held secret or private-key JWT); PKCE does not replace confidential-client authentication. A public client such as browser JavaScript or a native app cannot keep a client secret and must not embed one in its package.

The authorization server verifies the code, client, redirect URI, expiration/one-time status, and that the verifier hashes to the original challenge. If a challenge was present, the server must enforce the verifier at redemption and must resist downgrade paths that allow a code to be redeemed without PKCE.

### 5. Use tokens correctly

An **access token** is presented to its intended resource server according to its token type and audience; it may be opaque or a structured token. The client should request least privilege and avoid putting bearer tokens in URLs. A **refresh token**, if issued, is sent only to the authorization server to obtain new tokens and must be protected more strongly. The authorization server must apply refresh-token protections for public clients, including rotation or sender-constraining and a lifetime/idle-expiry policy under RFC 9700.

Do not assume the client can interpret an access token, that it is a JWT, or that an ID Token is an API access token. The resource server validates its access token by its configured token profile/introspection/issuer keys and audience, then applies authorization to the requested resource.

## Client architecture choices for React and .NET

RFC 10017 describes three browser-app patterns. The browser-based app is a **public client** even when it is a sophisticated React SPA; code shipped to the browser cannot hold a confidential secret.

| Pattern | Token exposure | Main trade-off |
|---|---|---|
| **Backend for Frontend (BFF)** | Backend holds OAuth tokens; browser uses a cookie-backed application session | Strongest isolation from JavaScript token theft, but backend proxies API calls and must defend cookie endpoints against CSRF. |
| **Token-mediating backend** | Backend retains refresh token; browser receives access tokens for direct API calls | Less proxying than a BFF, but access tokens are exposed to browser code; CSRF applies to session/token endpoints. |
| **Browser-only public client** | Browser directly receives and stores tokens | Simplest deployment, but malicious same-origin JavaScript can steal/use tokens; XSS prevention and token lifetime/scope controls are crucial. |

For a React + ASP.NET Core application handling sensitive user data, evaluate a BFF first: the server is the confidential OAuth client, performs code exchange, stores tokens server-side, and issues a `Secure`, `HttpOnly`, appropriately `SameSite` session cookie. Because cookies are attached automatically, the BFF must implement CSRF defenses and strict origin/session controls. A token-mediating backend must also protect cookie-based token/session endpoints from CSRF and must not expose refresh tokens. A browser-only SPA should use Authorization Code with PKCE, not Implicit; keep token lifetime and scope minimal, and understand that in-memory storage limits persistence but does not stop malicious code already executing in the origin. Browser storage APIs cannot fully mitigate active XSS token theft.

Native apps also use Authorization Code with PKCE and the system browser/external user-agent under RFC 8252. They must use a redirect mechanism appropriate to the platform and protect the verifier in the app process. An installed app is a public client; a bundled `client_secret` is not secret.

## Current security requirements and related mechanisms

- Authorization servers **must support PKCE**. Public clients **must use it** for code flow; confidential clients are recommended to use it as well.
- Use `S256`, not `plain`, when available. Generate a new verifier/challenge per transaction; constant values defeat the binding.
- Authorization servers must enforce the verifier whenever a challenge was sent and prevent downgrade attacks. Clients must fail closed on missing/mismatched PKCE state.
- Redirect URI matching must be strict. Protect authorization responses, browser history, referrers, logs, and third-party scripts around the callback.
- Use `state` for transaction binding and CSRF as required by the client/profile; PKCE can provide CSRF protection only when correctly supported/enforced. In OIDC, validate `nonce` in the ID Token.
- Use authorization-server issuer validation for multi-issuer clients to prevent mix-up attacks (RFC 9207 or another specified countermeasure).
- TLS protects the channel. PKCE does not protect a token after issuance, stop XSS from acting as the user, or make bearer tokens proof-of-possession. DPoP (RFC 9449) or mutual TLS can sender-constrain tokens in supported architectures, but DPoP is not client authentication and does not replace TLS or XSS defenses.
- The legacy Resource Owner Password Credentials grant must not be used; the Implicit grant is not appropriate for modern browser applications.

## Examples

### Worked example

A React storefront uses an ASP.NET Core BFF. On login, the BFF creates random `state`, verifier, and S256 challenge; stores the transaction server-side with the browser session; and redirects to the configured authorization server. The user signs in there. On callback, the BFF validates one-time state and the expected issuer, then redeems the code using the stored verifier plus its server-held client authentication. It stores refresh/access tokens server-side and creates a secure session cookie. React calls same-origin BFF endpoints; the BFF adds the access token when calling the API. The BFF checks CSRF protections on state-changing cookie-authenticated requests, and the API still checks the user’s authorization for the requested resource. If direct browser-to-API calls are required, compare the token-mediating and browser-only patterns and explicitly accept their token-exposure trade-offs.

## Cross-item comparison

OAuth 2.0 answers delegated authorization: can this client obtain an access token for a resource? OIDC builds an authentication layer on OAuth with ID Tokens and identity claims. PKCE protects the authorization-code exchange; `state` correlates the response; OIDC `nonce` binds an ID Token; TLS protects the transport; DPoP/mTLS can constrain token use. These protections operate at different points and do not replace one another.

## Common mistakes

- Saying “OAuth logs the user in” without OIDC or another specified identity protocol.
- Treating a browser SPA or native app as confidential because its code contains a client secret.
- Using the Implicit grant, putting tokens in URLs, or accepting a code without verifying `state`/issuer/PKCE transaction data.
- Generating a constant, predictable, or reused verifier/challenge, or using `plain` when S256 is available.
- Sending the verifier in the authorization request; PKCE sends the challenge there and verifier only at the token endpoint.
- Treating PKCE as a replacement for client authentication on a confidential server client.
- Treating `state`, PKCE, and OIDC `nonce` as identical values or purposes.
- Trusting redirect URIs with wildcards, user-controlled callback targets, or loose normalization.
- Assuming a successful code exchange authenticates an API request; access-token validation and resource authorization remain required.
- Storing long-lived refresh tokens in browser-accessible persistent storage without understanding XSS exposure and RFC 10017 trade-offs.
- Assuming PKCE prevents theft/use of an access token after it has been issued.
- Assuming a BFF is automatically CSRF-safe because tokens are server-side; cookie-authenticated endpoints still require CSRF defenses.

## Knowledge checks with answers

1. **What does the client send through the browser: verifier or challenge?** The S256 challenge; it sends the verifier later in the token request.
2. **Does PKCE replace a confidential client’s authentication?** No. It binds code redemption to the transaction; the confidential client still authenticates.
3. **What does `state` do?** Correlates the callback with the initiating transaction and protects against CSRF when generated, bound, and checked correctly.
4. **Does OAuth alone define login identity?** No. OIDC adds authentication semantics and ID Tokens.
5. **Which current BCP is relevant to browser-based OAuth clients?** RFC 10017 (BCP 212, August 2026), which requires browser public clients to use Authorization Code with PKCE and not Implicit.
6. **Can a React SPA keep a client secret?** No. Treat browser code as a public client; a BFF can hold confidential credentials server-side.
