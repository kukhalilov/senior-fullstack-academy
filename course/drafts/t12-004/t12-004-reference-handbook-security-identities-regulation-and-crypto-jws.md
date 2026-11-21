# architecture patterns multi-region tenancy and reliability — Reference: JWS

Sources: [RFC 7515 — JSON Web Signature](https://www.rfc-editor.org/rfc/rfc7515.html), [RFC 7797 — JWS Unencoded Payload Option](https://www.rfc-editor.org/rfc/rfc7797.html), [RFC 7518 — JSON Web Algorithms](https://www.rfc-editor.org/rfc/rfc7518.html), [RFC 9864 — Fully-Specified JOSE/COSE Algorithms](https://www.rfc-editor.org/rfc/rfc9864.html), [RFC 8725 — JWT Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725.html), [RFC 7517 — JSON Web Key](https://www.rfc-editor.org/rfc/rfc7517.html), [IANA JOSE algorithms registry](https://www.iana.org/assignments/jose/jose.xhtml).

## Scope and version

This lesson covers JWS as standardized by RFC 7515 and relevant extensions and security guidance current on 20 November 2026. Algorithm registrations and recommended cryptographic strength change; check the IANA registry, applicable profile, RFC updates, and library support when deploying. A JWT is commonly carried in JWS, but JWS is a general integrity/authentication representation and does not itself define application authorization policy.

## How this group fits the mental model

JWS packages a payload with a cryptographic signature or MAC so a verifier can detect modification and establish that a holder of a trusted key produced the protected representation. It does **not** encrypt the payload, prove the claimed human identity by itself, prevent replay, or decide what a verified claim is allowed to do. Those properties come from key trust, protocol context, claims validation, freshness rules, and authorization.

## Supplied names explained

- **JWS (JSON Web Signature)** — A JOSE representation that integrity-protects a payload using a digital signature or MAC. It supports compact and JSON serializations, protected headers, optional detached payloads, and (in JSON form) multiple signatures/MACs.

## JWS components and signing input

A JWS carries a payload, a protected header, and one or more signature values. Protected header parameters are included in the signature input. JSON serialization can also carry unprotected header parameters; these are not covered by the JWS signature, so do not use them for security decisions unless another trusted mechanism protects them.

For the standard base64url payload mode, the signing input is the ASCII bytes of:

```text
BASE64URL(UTF8(protected-header)) + "." + BASE64URL(payload)
```

The signer computes a signature or MAC over these exact bytes according to the selected `alg`. The verifier must reproduce the exact signing input, resolve a key from trusted configuration, check the algorithm and key type, and verify before trusting protected claims. JSON objects are not freely reserialized before verification: whitespace, member order, encodings, and payload bytes can affect the protected representation.

### Algorithm categories

JWA defines algorithm identifiers for JWS. Common families include HMAC (`HS*`) which uses a shared secret, RSA signatures (`RS*`, `PS*`), elliptic-curve ECDSA (`ES*`), and EdDSA registrations. The exact registered set evolves. RFC 9864 adds fully specified identifiers for cases where older algorithm names required external curve/hash details; follow the current profile and registry rather than allowing a polymorphic identifier without binding its parameters. `alg` is an untrusted input until checked against an application allowlist.

An HMAC verifier also has the ability to create valid MACs, so it cannot independently prove which party among all shared-key holders generated a token. Asymmetric signature verification can use a public key that cannot sign. Key rotation, private-key protection, allowed algorithm/key combinations, issuer trust, and emergency revocation are application responsibilities.

## Serializations

- **Compact Serialization:** three base64url-separated parts: protected header, payload, signature. It is URL-safe and compact, commonly shown as `header.payload.signature`. It has one signature and no syntax for an unprotected header.
- **JWS JSON Serialization:** a JSON object supporting a general form with a `signatures` array, or a flattened form with one `signature`. It can carry protected/unprotected header members and can associate multiple signatures with one payload, useful for multi-party signing or transitions where a profile requires them.
- **Detached payload:** the payload representation is omitted from the transmitted object (empty middle compact segment or absent JSON `payload`). The verifier must have the exact original payload bytes and reconstruct the JWS signing input. Detached form does not mean the content is unsigned.
- **Unencoded payload option (`b64=false`, RFC 7797):** changes the signing-input construction so the payload is not base64url encoded. The `b64` header must be protected and named in `crit`; content restrictions depend on serialization. Use only when a protocol explicitly needs it and both endpoints implement the extension correctly.

Base64url is not encryption. The protected header and payload of an ordinary JWS are readable to anyone who receives the token.

## Protected headers and critical parameters

The protected header commonly includes `alg`; may include `kid` (a key-selection hint), `typ` (a media/type hint), or `cty` (content type, often used for nested JWTs); and may contain extension parameters. `kid` is not itself trusted key material: use it only to select among keys already trusted for the issuer/context. `crit` lists extension header parameters that must be understood and processed; a verifier must reject an object with a critical parameter it does not understand or cannot process. Do not silently ignore security-relevant extensions.

The header `typ: JWT` may help distinguish token kinds but does not prove the token is an access token, ID token, or intended for this API. Use mutually exclusive validation rules for token classes, explicit issuer/audience, and the requirements of the protocol profile.

## JWT validation and security boundary

A valid JWS signature is one step in token validation. A JWT-consuming service should:

1. Select the expected token type and allowed algorithms from trusted application configuration, not from the token.
2. Select a key only from the expected issuer’s trusted key set; treat remote key URLs and `kid` as untrusted until constrained.
3. Verify the signature over the original compact/JSON representation, reject unsupported critical parameters and invalid key/algorithm combinations, and reject malformed or ambiguous representations.
4. Validate claims such as `iss`, `aud`, `exp`, `nbf`, and any required subject/scope using the correct clock and application-specific policy. `iat` alone does not make a token fresh.
5. Apply authorization separately: a valid token is not automatically permission for every endpoint or resource.
6. Consider replay controls for one-time actions, and bound token lifetime and key-cache staleness to the threat model.

Do not accept the unsecured `alg: none` form unless a protocol explicitly requires it and another trusted channel provides the needed integrity protections. Reject algorithm confusion, cross-JWT confusion, token substitution, `kid` path/URL injection, and keys of the wrong purpose/type. Do not reuse one key across unrelated algorithms or token classes. RFC 8725 is the main JWT best-current-practice reference and should be checked for errata or successor guidance.

JWS alone does not prevent replay: a copied bearer token can usually be replayed until expiry or revocation. TLS protects transport but does not make the token confidential at endpoints, logs, browser storage, or queue boundaries. Keep sensitive claims out of JWS unless disclosure is intended; if confidentiality is needed, choose an appropriate JWE profile or another secure storage/transport design.

## Examples

### Worked example

An authorization server signs a short-lived access token with a private asymmetric key and publishes the corresponding public key through a configured issuer key set. An API pins the issuer, selects only an allowed signature algorithm, verifies using that issuer’s public key, checks exact issuer and audience, enforces expiration and not-before, and then checks scope and resource ownership for the requested operation. During key rotation, the issuer publishes a new public key before signing with the matching private key, overlaps old verification keys long enough for existing tokens, and removes the retired key after expiry and cache propagation. A token’s `kid` helps identify the candidate key but does not establish trust by itself.

## Cross-item comparison

JWS provides integrity/authenticity for a protected representation; JWE provides confidentiality plus authenticated encryption of the protected header/AAD and plaintext under its selected algorithms. A signed JWT remains readable; an encrypted JWT may hide claims but still needs issuer/authentication validation if recipients must know who created it. Signing then encrypting is a common nested arrangement when both issuer authentication and confidentiality are required. Neither format substitutes for TLS, key management, audience/issuer validation, replay protection, or authorization.

## Common mistakes

- Treating a signed JWT as encrypted or secret.
- Trusting `alg`, `kid`, `jku`, `x5u`, or other token-controlled key hints without strict profile rules.
- Letting a library choose any algorithm accepted by the token rather than an application allowlist.
- Verifying a different reserialized payload than the bytes that were signed.
- Treating a successful signature check as validation of issuer, audience, expiry, token purpose, or user permissions.
- Using shared HMAC keys across many services while assuming a verifier cannot mint tokens.
- Assuming `kid` is a key, or that key rotation instantly reaches every verifier.
- Ignoring detached payload reconstruction or enabling `b64=false` without correct critical-header processing.
- Treating `crit` as informational instead of rejecting unsupported critical extensions.
- Assuming signature protection prevents bearer-token replay.

## Knowledge checks with answers

1. **Does JWS hide a payload?** No. It protects integrity/authenticity; the payload is normally readable after base64url decoding.
2. **What is signed in compact JWS?** The encoded protected-header segment, a period, and the encoded payload segment (or the RFC 7797 form when explicitly enabled).
3. **Is `kid` proof that a key is trusted?** No. It is a selector; trust comes from the configured issuer/key-management context.
4. **What does `crit` require?** The verifier must understand and process every listed critical extension or reject the JWS.
5. **Does a valid JWS mean the caller may access a resource?** No. Validate issuer/audience/time/token type and enforce authorization separately.
