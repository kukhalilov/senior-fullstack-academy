# architecture patterns multi-region tenancy and reliability — Reference: OpenID Connect (OIDC)

Sources: [OpenID Connect Core 1.0 incorporating Errata Set 2](https://openid.net/specs/openid-connect-core-1_0.html), [OpenID Connect Discovery 1.0 incorporating Errata Set 2](https://openid.net/specs/openid-connect-discovery-1_0.html), [OpenID Connect specs index](https://openid.net/developers/specs/), [RFC 9700 — OAuth 2.0 Security Best Current Practice](https://www.rfc-editor.org/rfc/rfc9700.html), [RFC 10017 — OAuth 2.0 for Browser-Based Applications](https://www.rfc-editor.org/rfc/rfc10017.html), [RFC 9207 — Authorization Server Issuer Identification](https://www.rfc-editor.org/rfc/rfc9207.html), [RFC 7519 — JSON Web Token](https://www.rfc-editor.org/rfc/rfc7519.html), [RFC 7515 — JSON Web Signature](https://www.rfc-editor.org/rfc/rfc7515.html), [IANA JOSE algorithms registry](https://www.iana.org/assignments/jose/jose.xhtml).

## Scope and version

This lesson covers OpenID Connect (OIDC) Core 1.0 and Discovery 1.0, each incorporating Errata Set 2, checked 20 November 2026. It follows current OAuth security guidance, including RFC 9700 and the August 2026 browser-app BCP RFC 10017. Provider behavior and supported claims vary; validate against the provider’s metadata and the OIDC profile used by the application. OIDC is an authentication/identity layer over OAuth 2.0, not a replacement for API authorization.

## How this group fits the mental model

OAuth answers “may this client access a resource?” OIDC adds an interoperable way for a client (the **Relying Party**, RP) to verify an end-user’s authentication performed by an **OpenID Provider** (OP, an OAuth authorization server) and optionally obtain user claims. The client requests OIDC by including the `openid` scope. The OP returns an **ID Token**, a JWT whose audience is the client. An OAuth access token is a separate credential intended for a resource server.

```text
RP → OP authorization endpoint (scope includes openid, state, nonce, PKCE)
  → user authenticates / OP returns code
  → RP redeems code at token endpoint
  → RP validates ID Token for its issuer and client_id
  → optional UserInfo call with access token; subject must match ID Token
```

## Supplied names explained

- **OpenID Connect (OIDC)** — An identity layer on OAuth 2.0. It defines authentication requests/responses, ID Tokens, standard claims/scopes, UserInfo, discovery metadata, and related security/privacy considerations.

## Discovery and trust configuration

OIDC Discovery lets an RP obtain provider configuration and endpoint locations. The provider metadata includes an exact `issuer`, `authorization_endpoint`, `token_endpoint`, `jwks_uri`, and optional endpoints/capabilities such as `userinfo_endpoint`, supported response types, scopes, and signing algorithms. A client should start from a configured/allowed issuer or a carefully designed identifier-discovery process, fetch metadata over TLS, and verify that metadata’s `issuer` exactly matches the expected issuer. Do not accept an arbitrary issuer from a request and blindly fetch its metadata or `jwks_uri`; that can turn login into an SSRF or trust-substitution path.

The issuer is an identifier, not merely a domain to normalize. The ID Token’s `iss`, discovery metadata’s `issuer`, and expected configured issuer must match as the applicable spec/profile requires. Key rotation is handled through the issuer’s JWKS; cache keys carefully and refresh on a legitimate unknown `kid` without allowing token-controlled URLs or unbounded refresh traffic.

## Authentication request and flows

An OIDC Authentication Request is an OAuth authorization request that asks the OP to authenticate an end-user. Common parameters include:

- OAuth `client_id`, `redirect_uri`, and `state`;
- `response_type` selecting the flow;
- `scope` containing required `openid` plus optional standard scopes;
- `nonce` to bind an ID Token to this authentication request;
- optional `prompt` (`none`, `login`, `consent`, or `select_account`), `max_age`, `login_hint`, `ui_locales`, `acr_values`, and requested `claims`, subject to support and security profile.

OIDC Core defines the **Authorization Code Flow**, **Implicit Flow**, and **Hybrid Flow**. Current deployments should generally use Authorization Code with PKCE; RFC 9700 and RFC 10017 make Authorization Code with PKCE the modern security baseline for browser clients and discourage front-channel token delivery. Implicit and hybrid response types remain in the historical/core specification for compatibility but should only be used when a concrete profile requires them and their additional exposure is understood. OIDC login methods (password, passkey, MFA, federation) are chosen by the OP and are outside the core wire protocol.

`state` correlates the callback and mitigates CSRF; PKCE binds code redemption; `nonce` binds the ID Token to the request. Generate them uniquely and transactionally. In Authorization Code Flow, the RP receives a code, redeems it at the token endpoint, and receives an ID Token plus an access token (and sometimes refresh token). PKCE is defined by RFC 7636 and is required for public clients under current OAuth BCP. Do not rely on `nonce` instead of PKCE for a browser SPA or native app.

## ID Token: meaning and validation

An ID Token is an authentication assertion for the client, usually represented as a signed JWT and optionally encrypted. Its required claims include:

- `iss`: the OP issuer identifier;
- `sub`: subject identifier for the end-user at that issuer;
- `aud`: intended audience, which must include this RP’s `client_id`;
- `exp`: expiration time;
- `iat`: issue time.

Other claims include `auth_time` (authentication time), `nonce` (if sent by the RP), `acr`/`amr` (authentication context/method information when provided), `azp` (authorized party in relevant multi-audience cases), `at_hash` and `c_hash` in flow-specific responses, and standard profile claims when requested/released. Claims have different guarantees: for example, an `email` value is not automatically verified unless the corresponding `email_verified` claim and provider/profile trust rules establish that status.

The RP must validate the ID Token before using it:

1. Verify the JWT signature with a key from the trusted issuer’s JWKS and an algorithm allowed by local policy and provider metadata. If using an encrypted ID Token, decrypt and validate the required integrity/signature properties as specified by the profile.
2. Compare `iss` exactly with the configured/discovered issuer.
3. Require `aud` to contain this client’s `client_id`; validate `azp` when required or present, especially with multiple audiences.
4. Validate `exp`, `iat`, and any relevant `nbf`/clock-skew policy. If `max_age` was requested, validate `auth_time` against it.
5. If the RP sent `nonce`, require and compare the returned claim exactly to the one-time transaction value.
6. Validate flow-specific hashes (`c_hash`, `at_hash`) where required, plus `state` and any issuer/mix-up defenses on the authorization response.
7. Bind the local application session to the validated `(iss, sub)` pair and then apply the application’s account-linking and authorization rules.

The stable OIDC user key is the issuer/subject pair. `sub` can be pairwise and differ across clients/sectors; email, username, display name, and phone can change and should not silently become authorization keys. Account linking needs an explicit verified process to avoid takeover through matching unverified email addresses.

## UserInfo and standard scopes/claims

The `openid` scope is mandatory for an OIDC request. Standard optional scopes include:

- `profile`: profile claims such as name, preferred username, picture, locale, and time zone;
- `email`: `email` and `email_verified` claims;
- `address`: structured address claim;
- `phone`: phone number and verification status;
- `offline_access`: requests offline access and may lead to a refresh token when the OP’s policy and consent requirements allow it.

Claim release is subject to provider policy, user consent, and the client’s registration. Request only what the application needs. The `claims` request parameter can ask for specific claims and essential/voluntary behavior when supported.

The RP can call the UserInfo endpoint using an OAuth access token. The response is a JSON claims object; its `sub` **must** match the validated ID Token’s `sub`. If they differ, the RP must not use the UserInfo claims. UserInfo is not a replacement for ID Token validation and the access token’s audience/resource policy still applies.

## Sessions, logout, and adjacent specifications

OIDC Core defines authentication and identity exchange, but complete logout/session behavior is specified in separate specifications such as RP-Initiated Logout, Front-Channel Logout, and Back-Channel Logout. Ending the local application session does not necessarily end the OP’s SSO session; logging out at the OP does not automatically clear every relying party unless the relevant logout protocol is deployed and handled. Treat session cookies, refresh tokens, local sessions, and OP sessions as separate lifecycles.

Discovery and Dynamic Client Registration are separate OIDC specifications. Request Objects, signed/encrypted authorization requests, and pushed authorization requests (PAR) are additional protocols/extensions, not mandatory behavior for every basic OIDC RP. Use supported profiles and explicit configuration rather than implementing optional parameters speculatively.

## Examples

### Worked example

A React application uses an ASP.NET Core BFF as the OIDC RP. The BFF discovers a configured issuer, validates metadata, starts Authorization Code with PKCE, stores one-time `state` and `nonce`, and redirects the browser to the OP. On callback it checks state and issuer, redeems the code, validates the ID Token signature, exact issuer, audience, expiry, and nonce, and then uses `(iss, sub)` to resolve the local account. It stores OAuth tokens server-side and creates a secure application session cookie. A UserInfo call, if needed, uses the access token and verifies that UserInfo `sub` equals the ID Token `sub`. API authorization remains a separate policy decision based on local roles/permissions and the intended access token.

## Cross-item comparison

OIDC builds user authentication and ID Token claims on OAuth’s delegated authorization framework. An ID Token says what the OP authenticated for an RP; an access token authorizes a resource request and may be opaque. JWS/JWE provide token protection formats, but their crypto does not establish trust in the issuer by itself. A local app session is the RP’s state and can outlive/expire independently from access tokens and the OP’s browser session.

## Common mistakes

- Treating OAuth access tokens as login assertions or sending an ID Token to an API as its access token.
- Accepting an ID Token based only on decoded JWT claims without verifying its signature, issuer, audience, time, and request binding.
- Using `email` as the permanent user key instead of `(iss, sub)` and a controlled account-linking workflow.
- Treating `nonce`, `state`, and PKCE as interchangeable or reusing their values across transactions.
- Assuming all OPs release profile claims or that `email_verified` is implied by an email claim.
- Allowing a token’s `jku` or `kid` to control arbitrary key fetching.
- Accepting a valid ID Token from the wrong client, provider, tenant, or token class.
- Assuming UserInfo claims are trustworthy without checking its `sub` against the ID Token.
- Treating local logout as global SSO logout or relying on core OIDC to define a complete logout protocol.
- Treating the Implicit/Hybrid flows as the default for new browser applications.

## Knowledge checks with answers

1. **What requests OIDC behavior?** The OAuth authorization request includes the `openid` scope.
2. **What is the ID Token for?** It communicates the OP’s authentication assertion and claims to its intended client; it is not the API access token.
3. **What key should identify an OIDC subject locally?** The pair `(iss, sub)`, with explicit account-linking rules.
4. **What must happen if UserInfo `sub` differs from the ID Token `sub`?** Reject/ignore the UserInfo response’s claims; do not associate them with that login.
5. **Does a valid JWT signature prove the token is for this RP?** No. Validate exact issuer, audience/client ID, expiration, nonce if sent, and flow-specific requirements.
6. **Does OIDC Core define every logout behavior?** No. Logout/session-management behavior is covered by separate OIDC specifications and deployment policy.
