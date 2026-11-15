<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# OAuth 2.0 OIDC flows scopes PKCE and token storage — Reference: Actors, endpoints, scopes, and tokens

## Scope and version
This lesson explains the assigned actors and protocol artifacts. Use [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700) for current OAuth security guidance and [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html) plus [Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html) for OIDC behavior.

## How this group fits the mental model
OAuth moves a bounded grant from a resource owner through a client and authorization server to a resource server. OIDC adds a client-facing identity assertion. Endpoints and tokens have distinct recipients; correctness depends on keeping those roles separate.

## Supplied names explained
- `OAuth 2.0 resource owner` — The entity able to grant access to a protected resource, often an end user. The user authenticates to the authorization server, not by handing their password to the client.
- `OAuth 2.0 client` — The application requesting delegated access and receiving tokens. It must protect tokens and follow the flow appropriate to its ability to keep credentials confidential.
- `Authorization server` — Issues authorization decisions and tokens after authenticating the resource owner and obtaining consent/policy approval. It is the authority for its issuer and token rules.
- `Resource server` — Hosts protected resources and accepts access tokens. It validates that a presented token is intended for it and grants only the token's authorized scope.
- `Authorization endpoint` — Browser-facing endpoint where the client starts authorization and the user authenticates/consents. Requests need redirect and transaction protection.
- `Token endpoint` — Back-channel endpoint where a client redeems a code or refresh token for tokens. Client authentication rules differ by client type; a public client has no durable secret.
- `Redirect URI` — Registered client destination to which the authorization server returns a response. Match it exactly according to provider rules; wildcards or open redirectors increase code/token leakage risk.
- `Authorization code` — Short-lived, single-use intermediate credential exchanged at the token endpoint. It should not itself be treated as an access token; PKCE protects redemption.
- `Access token` — Credential for a resource server that represents granted authority. It may be opaque or structured; clients should treat it as sensitive and avoid interpreting formats unless specified.
- `Refresh token` — Credential used with the authorization server to obtain new tokens. Protect it more carefully than ordinary access and follow rotation/binding rules.
- `Scope` — A space-delimited set of requested/granted access labels as defined by the authorization server and resource. Request only what the feature needs; scopes are not universally standardized permissions.
- `Audience` — Intended recipient/resource identifier for a token. The resource server must reject tokens intended for a different audience.
- `Client identifier` — Public identifier for a registered client. It identifies the registration but does not prove the caller is confidential or secret-bearing.
- `Public client` — Client unable to keep credentials secret, such as a native application or browser code delivered to a user. Use public-client protections such as PKCE rather than embedded secrets.
- `Confidential client` — Client capable of protecting credentials in a controlled server environment. A secret can authenticate that deployment, but it does not make every request or redirect safe.
- `Client secret` — A credential for an appropriately confidential client. A secret embedded in a desktop/mobile/browser app is extractable and must not be treated as confidential.
- `Authorization Code grant` — OAuth flow returning an authorization code through the user agent and exchanging it at the token endpoint. Current practice pairs it with PKCE; see [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700).
- `OpenID Connect (OIDC)` — An identity layer on top of OAuth 2.0 that lets clients verify an end user's identity and obtain claims. It is the protocol for authentication assertion; OAuth itself is authorization delegation.
- `OpenID Provider (OP)` — The OIDC authorization server that authenticates the end user and issues OIDC responses/ID tokens.
- `Relying Party (RP)` — The OIDC client relying on the OP's authentication assertion. It validates ID tokens and establishes its own local session.
- `ID token` — OIDC token intended for the RP, carrying authentication and subject claims. Validate issuer, audience, signature, time, and request binding; do not send it as an API access token.
- `UserInfo endpoint` — OIDC protected resource returning claims about the authenticated end user when called with an access token. Validate the response subject against the ID token subject.
- `Issuer` — Identifier for the authorization server/OP. Compare it with trusted configured/discovered metadata and validate it in responses/tokens to prevent mix-up.
- `OIDC discovery metadata` — JSON configuration describing OP endpoints, supported features, and key locations, obtained through the discovery mechanism. Validate issuer and retrieval origin before using it.
- `JWKS endpoint` — Endpoint publishing a JSON Web Key Set used by clients/resource servers to obtain issuer signing keys. Fetch only from trusted metadata over secure transport, cache sensibly, and handle rotation safely.
- `OAuth authorization-server metadata` — Metadata describing OAuth server endpoints and capabilities. Treat as configuration from a trusted issuer, not arbitrary client-directed data.

## Cross-item comparison
OAuth 2.0 delegates resource access; OIDC adds authentication and an ID token. An `Access token` targets a resource server; an `ID token` targets the RP. A `Client identifier` is public; a `Client secret` is only secret for a confidential client. A `Public client` must use a flow that does not assume a hidden secret. Sources: [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700), [OIDC Core](https://openid.net/specs/openid-connect-core-1_0.html).

## Examples
An RP discovers a known OP, verifies metadata issuer, redirects a browser to its authorization endpoint with a registered redirect URI, and later redeems a code at the token endpoint. It validates the ID token for its own client ID. Separately, it sends the access token to the API whose audience/scope it is intended for. It never sends the ID token in place of the API token.

## Common mistakes
- Calling OAuth itself a login protocol.
- Embedding a client secret in a public app.
- Treating scope labels as universal or trusting client-requested scope as granted scope.
- Using an ID token to call a resource server.
- Trusting discovery/JWKS URLs from an untrusted source.
- Assuming a redirect URI is safe because its hostname is familiar; open redirect paths also matter.

## Knowledge checks with answers
1. Who consumes the access token? **The intended resource server.** 2. Who consumes the ID token? **The OIDC relying party/client.** 3. Can a public client protect an embedded secret? **No.**
