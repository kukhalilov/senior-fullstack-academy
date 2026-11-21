
# OAuth 2.0 OIDC flows scopes PKCE and token storage — Big-picture orientation and mental model

## Problem and purpose
An application may need to access a user's data held by another service without collecting that service's password. OAuth delegates bounded authorization through an authorization server. If the client also needs a standardized login assertion, OpenID Connect adds an identity layer.

## Plain-language mental model
The user authorizes a client to obtain a limited pass. The authorization server issues an access token; the client presents it to the resource server. OAuth answers “what access was delegated?” OIDC adds “who authenticated to this client?” A token is not a login ceremony by itself, and the client must validate protocol responses rather than trust whatever returns to its redirect URL.

## How the parts fit together
The client redirects the user agent to an authorization endpoint with a registered redirect URI, requested scopes, and flow security values. After the user authenticates and grants consent, the authorization server returns a short-lived authorization code. The client redeems it at the token endpoint; PKCE binds redemption to the client instance that began the request. The client validates OIDC identity data when used, then calls the resource server with an access token. Current OAuth security recommendations are in [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700); OIDC defines its identity layer in [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html).

## Concept map
- **Actors:** resource owner, client, authorization server, resource server.
- **Artifacts:** authorization code, access token, refresh token, scope, audience.
- **Authentication layer:** OIDC adds OP/RP roles and an ID token.
- **Security:** exact redirect matching, state/nonce, issuer validation, PKCE, audience restriction, token protection.

## End-to-end walkthrough
A native app creates a random verifier and derives an S256 challenge. It opens the system browser to the authorization server with its client ID, exact redirect URI, scope, state, and challenge. After login and consent, the server redirects with a code and state. The app checks state, then redeems the code with the verifier at the token endpoint. The server issues an access token for the requested API. If the app used OIDC, it also validates the ID token's issuer, audience, signature, and nonce before establishing a local login session. The app sends the access token to the API, not the ID token.

## When to use it and tradeoffs
Use Authorization Code with PKCE for public browser and native clients; do not embed a client secret in code distributed to users. Keep redirect URIs exact and tokens out of front-channel URLs. Request narrow scopes and the intended audience. Avoid legacy front-channel token delivery patterns; the current [OAuth Security BCP RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700) consolidates security recommendations and deprecates insecure modes. OAuth 2.1 should not be presented as a finalized standard without checking its standards status.

For native apps, RFC 8252 requires using an external user agent, typically the system browser; public clients use PKCE and registered redirect mechanisms such as loopback IP or app-claimed HTTPS links. For browser-delivered apps, RFC 10017 (August 2026) requires public clients to use PKCE and explains the distinct security tradeoffs of browser-only, token-mediating, and backend-for-frontend architectures. These details do not change the OAuth versus OIDC distinction.

A decoded ID token is not enough: the relying party checks its issuer, its own client ID in `aud`, expiration and signature, and the transaction nonce when one was sent. OIDC `sub` is issuer-scoped and may be pairwise, not a global account key. The UserInfo endpoint is called with an access token, and its `sub` must match the ID token subject before claims are combined.

## What later lessons cover
The next lesson maps actors and protocol artifacts. A reference lesson walks the code/PKCE flow and security boundaries. Other topics cover token validation/storage and provider-specific SDK configuration.
