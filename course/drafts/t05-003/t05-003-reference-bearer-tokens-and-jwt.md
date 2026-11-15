<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# cookies sessions token and JWT lifecycle tradeoffs — Reference: Token types, JWT claims, validation, and revocation

## Scope and version
JWT structure is specified by [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519); implementation best practices are in [RFC 8725](https://datatracker.ietf.org/doc/html/rfc8725). Token lifecycle and OAuth security recommendations are in [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700). This lesson teaches validation boundaries, not a specific library API.

## How this group fits the mental model
Tokens package authority or identity claims for another component. First establish the intended token type and recipient, then validate its cryptographic protection, issuer, audience, time window, and key according to that type. Parsing only reveals data; it does not establish trust.

## Supplied names explained
- `Bearer access token` — A credential presented to a resource server; whoever possesses it can use its authority subject to validation and policy. Protect it as a secret.
- `Opaque access token` — A token whose meaning is not self-contained to the client; the resource server may look it up or introspect it. It supports central control at the cost of state/network dependency.
- `Refresh token` — A credential used at an authorization server to obtain new tokens. It is usually more sensitive and longer-lived than an access token; protect, rotate, and detect reuse according to the issuer's design.
- `ID token` — An OIDC assertion for a client about an authentication event and subject. It is intended for the OIDC client, not as an API access token.
- `JSON Web Token (JWT)` — A compact URL-safe representation of claims carried in JWS or JWE structures. It may be signed, encrypted, or both through defined composition; encoded text is not automatically secret.
- `JWS signed JWT` — A JWT protected with a signature or MAC for integrity/authenticity. A normal signed payload remains readable to anyone who obtains it.
- `JWE encrypted JWT` — A JWT encrypted for confidentiality, with integrity protections defined by JWE. Encryption does not remove the need to validate recipient, issuer, purpose, and applicable claims.
- `JWT header` — The JOSE header that declares processing metadata such as algorithm and key identifier. Treat it as attacker-controlled until cryptographically validated; use trusted configuration to decide allowed processing.
- `JWT claims set` — The JSON object of claims carried by a JWT. Claims have meaning only under the validating application's rules and expected token type.
- `iss claim` — The issuer identifier. Compare it exactly against the trusted expected issuer for this token and context.
- `sub claim` — The subject identifier. Interpret within issuer/tenant context; do not assume global uniqueness unless the issuer contract guarantees it.
- `aud claim` — The intended audience. A recipient must reject tokens not meant for it, even when the signature is valid.
- `exp claim` — Expiration time after which a token must not be accepted, allowing only carefully bounded clock tolerance where necessary.
- `nbf claim` — Not-before time before which a token must not be accepted, subject to bounded clock tolerance.
- `iat claim` — Issued-at time. It records issuance time but does not itself prove freshness or validity.
- `jti claim` — A token identifier that can support replay tracking or revocation when the application maintains corresponding state; uniqueness alone does not revoke anything.
- `JWT signature verification` — Verifying the signature/MAC over the correct representation with a trusted key and expected algorithm. Failure means the token is not trusted.
- `Allowed-algorithm validation` — Restricting accepted algorithms using trusted configuration, not blindly following the token header. This blocks confusion between cryptographic modes.
- `Issuer validation` — Ensuring the issuer matches the configured authority expected for this token type and endpoint.
- `Audience validation` — Ensuring this resource/client is an intended recipient. Do not accept a token solely because it is signed by a known issuer.
- `Expiration validation` — Enforcing the token's permitted time interval; account for only small, documented clock skew.
- `Key rotation with kid` — Using a key identifier to select among keys from a trusted issuer key set during rotation. Do not let `kid` cause untrusted file/network lookup or arbitrary key acceptance.
- `JWT algorithm confusion` — A class of validation failures where an implementation accepts an unintended algorithm/key interpretation. Pin allowed algorithms and use a library with safe validation defaults.
- `JWT alg=none rejection` — Rejecting an unsigned JWT when the protocol expects integrity protection. Never turn a header value into permission to skip verification.
- `Nested JWT handling` — Processing a JWT wrapped/signed/encrypted inside another JOSE object. Define and validate each layer and expected order/type; avoid ambiguous fallback parsing.
- `Token revocation strategy` — A plan to stop acceptance before natural expiry, such as state lookup/introspection, denylist, key rotation in limited circumstances, short expiry, or sender constraints. Each has different latency and blast radius.
- `Access-token lifetime` — Duration for which a resource server may accept an access token. Shorter limits exposure but increases refresh traffic and availability dependence.
- `Refresh-token rotation` — Issuing a new refresh token when used and invalidating the prior one. Proper family tracking can detect reuse; simple replacement without reuse handling is incomplete.
- `Sender-constrained token` — A token bound to proof from a particular client key so possession alone is insufficient. It reduces replay value but adds key lifecycle and client support requirements.
- `DPoP-bound access token` — An access token bound to a client-held key using the DPoP proof mechanism. The resource server validates both token binding and per-request proof; it is not equivalent to a bearer token.
- `Mutual-TLS-bound access token` — A token whose use is bound to a client certificate presented over mutual TLS. It can reduce stolen-token replay but requires certificate provisioning and binding validation.

## Cross-item comparison
An `ID token` tells an OIDC client about authentication; an `access token` is for a resource server. A `JWS signed JWT` is integrity protected but readable; a `JWE encrypted JWT` is confidential to its intended recipient. A short access token limits stolen-token lifetime; a refresh token extends the ability to obtain new access and needs stronger protection. Stateless validation avoids central lookup but weakens immediate revocation; a central lookup restores control at operational cost. Sources: [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519), [RFC 8725](https://datatracker.ietf.org/doc/html/rfc8725), [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700).

## Examples
An API receives a signed token. It selects keys only from the configured issuer's trusted key set, permits only configured algorithms, verifies the signature, checks `iss`, `aud`, `exp`, `nbf`, and token purpose, then maps `sub` into the application subject space. A valid ID token with the wrong audience is rejected by the API. When a refresh token is used, rotate it and retain enough family state to detect reuse if that policy is selected.

## Common mistakes
- Decoding and trusting claims without verification.
- Accepting any signed token from any known key without issuer/audience checks.
- Using an ID token as an API credential.
- Assuming `jti` alone gives revocation.
- Assuming short access lifetime protects a compromised refresh token.
- Trusting `kid` as a URL or file path.

## Knowledge checks with answers
1. Does signature success imply intended audience? **No.** 2. Is a signed JWT confidential? **No, not unless encrypted.** 3. What does rotation need to detect reuse? **Server-side token-family/reuse state.**
