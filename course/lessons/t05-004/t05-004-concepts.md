
# OAuth 2.0 OIDC flows scopes PKCE and token storage — Core concepts and how they fit together

## Learning objectives
Explain OAuth delegation versus OIDC authentication, trace Authorization Code with PKCE, validate returned protocol context, and identify public-client and token-delivery risks.

## Prerequisites
Understand HTTP redirects, browser/client/server roles, and bearer tokens. The authorization server is separate from the client and resource server conceptually, even if one product hosts multiple roles.

## Core concepts
OAuth 2.0 is an authorization framework: a client obtains bounded access to a resource server through an authorization server on behalf of a resource owner. It does not define a general login assertion to the client. OpenID Connect adds an identity layer and ID token. The ID token is for the relying party/client; the access token is for the resource server. The `openid` scope signals OIDC usage, but actual validation requirements still apply.

A public client cannot keep a secret confidential because users can inspect its distributed code. A client ID identifies registration; it is not a secret. PKCE prevents an intercepted authorization code from being redeemed by an attacker lacking the original verifier. It does not replace TLS, redirect validation, state correlation, or token validation.

## Mechanisms and relationships
The authorization code flow keeps tokens out of the browser's front-channel redirect. The client sends an authorization request with an exact registered redirect URI, `state`, and PKCE challenge. OIDC also uses `nonce` to bind the ID token to the initiating authentication request. The authorization server returns a code; the client verifies the response context and redeems the code with the verifier. RFC 7636 defines PKCE; [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700) provides current security recommendations.

State, nonce, redirect URI, issuer, audience, and PKCE defend different boundaries. State correlates and protects the client request/response transaction, commonly mitigating CSRF/login mix-up at the client boundary. Nonce binds the OIDC ID token to the authentication request. Redirect URI matching prevents codes/tokens being delivered to attacker-controlled destinations. Issuer validation prevents mix-up between authorization servers. Audience validation ensures a token is for its recipient. PKCE binds code redemption to the initiating client instance.

Discovery metadata and JWKS endpoints automate configuration and key retrieval, but their issuer and origin must be trusted and validated. Automatically discovering endpoints from arbitrary user-controlled identifiers can become an SSRF or impersonation path. The OpenID Foundation's [Discovery specification](https://openid.net/specs/openid-connect-discovery-1_0.html) defines metadata retrieval and validation.

Public browser clients must use PKCE under RFC 10017 (August 2026); native apps must use an external user agent and PKCE under RFC 8252 and RFC 9700. For code verifiers, RFC 7636 specifies 43–128 unreserved characters, recommends 32 cryptographically random octets encoded as 43 base64url characters, and requires S256 when the client supports it.

When multiple authorization servers are possible, RFC 9700 requires a mix-up defense: use the authorization-response `iss` parameter (RFC 9207), another validated issuer value such as an OIDC ID token `iss`, or distinct redirect URIs. Do not treat arbitrary discovery URLs as trusted input. OIDC subjects are scoped to an issuer and can be pairwise per client; UserInfo `sub` must match the ID token `sub`.

## Worked examples
**Code interception:** a malicious app captures a redirect code from a native app. Without PKCE, it may redeem the code. With PKCE, it lacks the verifier. Exact redirect URI and state remain necessary.

**Token substitution:** a client receives an ID token from issuer A during a transaction started with issuer B. Validate issuer and transaction binding; never accept a token merely because its signature is valid.

**Wrong token:** a client sends an ID token to an API. The API should require an access token intended for its audience; an ID token's authentication assertion is not API authorization.

## Misconceptions and edge cases
- OAuth does not mean “sign in with.” OIDC is the identity layer.
- A public client cannot secure a static secret by obfuscating it.
- PKCE does not protect a compromised client or validate the returned identity.
- `state` and `nonce` are not interchangeable; OIDC clients need the relevant checks for their flow.
- An open redirect on the client can undermine otherwise correct redirect URI registration.
- RFC 9700 is a current Best Current Practice; OAuth 2.1 is not assumed final here.

## Knowledge checks with answers
1. Which token is presented to an API? **Access token, validated for that resource server.**
2. What does PKCE bind? **Authorization-code redemption to possession of the verifier created by the initiating client.**
3. What does OIDC add? **An identity/authentication layer on top of OAuth 2.0, including an ID token.**
