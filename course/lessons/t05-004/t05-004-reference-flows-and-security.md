
# OAuth 2.0 OIDC flows scopes PKCE and token storage — Reference: Authorization Code, PKCE, browser/native clients, and security boundaries

## Scope and version
This group focuses on redirect-based flow safety. [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html) (January 2025) is the OAuth 2.0 Security Best Current Practice; it updates RFCs 6749, 6750, and 6819 and consolidates recommendations. PKCE is specified in [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636.html); native-app guidance is in [RFC 8252](https://www.rfc-editor.org/rfc/rfc8252.html); browser-based application guidance was published as [RFC 10017](https://www.rfc-editor.org/rfc/rfc10017.html) in August 2026. OIDC details are in [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0-18.html). OAuth 2.1 is not called finalized in this lesson.

## How this group fits the mental model
The authorization server returns a code through the user agent, while tokens arrive over a back channel. The client must bind the response to the initiating transaction, validate the issuer and destination, and prove possession of the verifier when redeeming the code. Each safeguard addresses a different attack.

## Supplied names explained
- `Authorization Code with PKCE` — Code flow plus a per-transaction verifier/challenge pair. The authorization server associates the challenge with the code; redemption requires the verifier, limiting value of an intercepted code.
- `Code verifier` — A high-entropy cryptographic random string generated for each authorization request. RFC 7636 requires 43–128 unreserved characters and recommends 32 random octets encoded as 43 base64url characters. Keep it until redemption and never send it in the authorization request.
- `Code challenge` — Derived value sent in the authorization request. With S256, the server can later compare the verifier-derived value without learning the verifier in advance.
- `S256 code challenge method` — PKCE method that hashes the verifier with SHA-256 and base64url-encodes the result. Prefer it over a method that exposes the verifier directly; see [RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636).
- `State parameter` — Client-generated transaction value returned with the response so the client can correlate it and defend its redirect endpoint against unsolicited/cross-site responses. RFC 9700 allows clients to rely on PKCE for CSRF protection when the authorization server supports/enforces PKCE, but state remains useful for transaction correlation. If using state as the CSRF token, securely bind and compare it; do not merely check presence.
- `OIDC nonce` — Value sent in an OIDC authentication request and checked in the ID token to bind that token to the request and mitigate replay/substitution. When a nonce was sent, the RP MUST check the returned ID Token nonce against it. Nonce alone does not protect a public client's authorization code from direct redemption.
- `Exact redirect URI matching` — Requiring the authorization response destination to match a registered URI under the server's defined exact rules. Loose matching can redirect codes to attacker-controlled endpoints.
- `Authorization code interception` — Theft of the short-lived code from a redirect or app handoff. PKCE prevents redemption without the verifier, but redirect validation and safe client handling remain required.
- `PKCE required for public clients` — Public clients cannot rely on a client secret, so require PKCE to bind code redemption to the initiating client instance. Current OAuth guidance also recommends PKCE broadly for code flow.
- `Authorization response issuer parameter` — The RFC 9207 `iss` response parameter identifies the authorization server. When present, clients supporting RFC 9207 MUST compare it with the expected issuer and reject a mismatch; clients can also use distinct redirect URIs as a mix-up defense under RFC 9700.
- `Issuer mix-up defense` — Controls ensuring the client sends a code to and accepts tokens from the authorization server it intended, not an attacker-controlled or substituted issuer. Validate issuer-bound state/response and metadata.
- `Open redirector abuse` — Exploiting a client endpoint that redirects to arbitrary destinations, potentially leaking authorization codes/tokens despite a registered base URI. Remove open redirects or bind redirects to strict allowlists.
- `Refresh-token rotation` — Replacing refresh tokens on use and invalidating earlier ones. It can reveal reuse/theft when the authorization server tracks token lineage.
- `Refresh-token reuse detection` — Detecting a previously consumed refresh token being presented again and applying a defined response, often revoking the related grant. It requires state and careful concurrency handling.
- `Refresh-token binding to client` — Restricting a refresh token to the client or cryptographic key for which it was issued, reducing its usefulness if stolen elsewhere. The binding must be verifiable at refresh time.
- `Token audience restriction` — Limiting an access token to intended resource servers. Resource servers must reject tokens for other audiences.
- `Least-privilege scope` — Requesting only the narrow authorization needed for the task and accepting only granted scope. Broad scopes increase impact if a token is stolen.
- `Bearer token possession risk` — A bearer token can be used by whoever possesses it. Protect its storage, transport, logs, and lifetime.
- `Native-app external user-agent` — RFC 8252 requires native apps to use an external user agent, typically the system browser, for OAuth authorization. It is a separate security domain that does not let the app inspect or modify authorization pages or access browser cookies.
- `Loopback redirect URI` — A native-app redirect using a loopback IP literal and a dynamically selected local port. RFC 8252 requires authorization servers to allow any port for loopback IP redirects; clients should listen only on the loopback interface, open the listener for the flow, and close it afterward.
- `App-claimed HTTPS redirect URI` — A claimed HTTPS app link whose domain association allows the OS to route a redirect to the registered native app. Correct domain association and exact registration prevent another app from intercepting it.
- `Browser-based app public-client boundary` — Browser-delivered code cannot keep a static secret; treat it as public even if minified. Current [RFC 10017](https://www.rfc-editor.org/rfc/rfc10017.html) requires browser-based public clients to use PKCE. A backend-for-frontend can keep OAuth tokens server-side, but introduces server-side session and CSRF responsibilities.
- `Front-channel token delivery (implicit pattern)` — Delivering access tokens through the user-agent authorization response. RFC 9700 says clients SHOULD NOT use implicit or other responses that issue access tokens at the authorization endpoint unless injection and leakage risks are mitigated; authorization code flow is preferred.
- `Resource Owner Password Credentials grant` — Directly collecting the user's password in the client and exchanging it for a token. RFC 9700 says this grant MUST NOT be used; modern clients should use redirect-based authorization.
- `DPoP sender-constrained token` — Token whose use is bound to a client key through Demonstrating Proof of Possession. Each request includes a signed proof; validate binding, method/target, freshness, and replay controls as specified.
- `Mutual-TLS-bound access token` — Token bound to a certificate key presented through mutual TLS. Resource server verifies the certificate binding; deployment and certificate lifecycle are required.
- `OAuth 2.0 Security Best Current Practice RFC 9700` — IETF BCP published January 2025 that updates OAuth security advice, addresses modern threats, and deprecates insecure modes. It is a BCP document, not OAuth 2.1 and not a new authentication layer.

## Cross-item comparison
`Authorization Code without PKCE` lacks proof that the redeemer initiated the request; `Authorization Code with PKCE` binds redemption to the verifier. `Public client` cannot protect a secret; a `Confidential client` can protect one in its controlled environment. `Front-channel token delivery` exposes tokens in the user agent; code flow returns a short-lived code then exchanges it in the back channel. These comparisons align with [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700) and [RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636).

## Examples
For a native app: create a random verifier, compute S256 challenge, and store verifier/state/nonce for the transaction. Open the system browser to the authorization endpoint with exact redirect URI and minimal scope. On callback, validate state and expected issuer, then redeem code with verifier. For OIDC, validate nonce, issuer, audience, signature, and time before establishing a local session. Send the access token only to its intended API. Avoid implicit front-channel token delivery.

## Common mistakes
- Treating PKCE as a replacement for redirect URI, state, nonce, or issuer checks.
- Reusing a verifier or state value across transactions.
- Using an embedded browser that lets the app observe credentials.
- Allowing wildcard redirects or open redirectors.
- Requesting broad scope by default.
- Using password or implicit grant patterns despite current BCP guidance.
- Accepting a token at any API because it came from a familiar issuer.

## Knowledge checks with answers
1. What does PKCE prove? **The code redeemer possesses the verifier associated with the initiating request.** 2. Which token is exposed by implicit delivery? **An access token in the front channel.** 3. What must a client do with `state`? **Correlate and validate the returned transaction value.**
