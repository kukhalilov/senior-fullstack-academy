# architecture patterns multi-region tenancy and reliability — Reference: JWE

Sources: [RFC 7516 — JSON Web Encryption](https://www.rfc-editor.org/rfc/rfc7516.html), [RFC 7518 — JSON Web Algorithms](https://www.rfc-editor.org/rfc/rfc7518.html), [RFC 9864 — Fully-Specified JOSE/COSE Algorithms](https://www.rfc-editor.org/rfc/rfc9864.html), [RFC 8725 — JWT Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725.html), [RFC 7515 — JSON Web Signature](https://www.rfc-editor.org/rfc/rfc7515.html), [RFC 7517 — JSON Web Key](https://www.rfc-editor.org/rfc/rfc7517.html), [IANA JOSE algorithms registry](https://www.iana.org/assignments/jose/jose.xhtml).

## Scope and version

This lesson covers JWE under RFC 7516 and relevant JOSE/JWT security guidance current on 20 November 2026. Algorithm identifiers, key lengths, and recommendations evolve; check the IANA registry, RFC updates, security advisories, and the exact protocol profile before deployment. JWE is a message format, not a complete key-management system or application authorization protocol.

## How this group fits the mental model

JWE encrypts a plaintext for one or more recipients and authenticates the ciphertext and protected metadata using the selected content-encryption scheme. It is an envelope: a randomly chosen content-encryption key protects the message, while a key-management algorithm makes that key usable by the intended recipient. The receiver needs the correct private/shared key and must successfully authenticate/decrypt before acting on the plaintext.

Encryption does not automatically authenticate the sender. Anyone with a recipient’s public key may be able to create a valid ciphertext for that recipient. If the recipient must know which trusted issuer created the content, use an authenticated protocol or a signed-and-encrypted nested structure with correct validation.

## Supplied names explained

- **JWE (JSON Web Encryption)** — A JOSE representation for encrypted content. It has compact and JSON serializations, key-management and content-encryption algorithm identifiers, optional authenticated additional data, and a recipient model that can support multiple recipients in JSON form.

## Components and cryptographic processing

A JWE has a protected header, encrypted-key value (which can be empty for direct key agreement or direct key use), initialization vector when required, ciphertext, and authentication tag. JSON serialization may also include shared or per-recipient unprotected headers and external authenticated additional data (AAD). The cryptographic operation authenticates the protected header and AAD; unprotected header parameters are not authenticated by the content encryption and must not control security decisions without another trusted binding.

The `alg` header identifies the **key-management algorithm or mode** that establishes/protects the content-encryption key (CEK). The `enc` header identifies the **content-encryption algorithm** that encrypts and authenticates plaintext with the CEK. They are separate choices. For example, an RSA-OAEP key-management step can protect a CEK while AES-GCM encrypts the content. `alg` is not the message cipher; `enc` does not explain how the recipient obtains the CEK.

With a key-wrapping mode, the sender generates a fresh CEK, encrypts the plaintext with `enc`, then wraps the CEK for the recipient. With direct key use (`alg: dir`), the shared symmetric key is used as the CEK and the encrypted-key segment is empty. ECDH-ES derives key material from ephemeral/static key agreement using the parameters and KDF specified by the registered algorithm; it is not the same as encrypting the plaintext with an ECDH public key. For multiple recipients, JSON serialization can carry recipient-specific protected CEK material while the content is encrypted once under the CEK.

Use an authenticated-encryption `enc` mode such as AES-GCM when supported by the required profile, and enforce nonce/IV uniqueness requirements for the same key. Legacy CBC-HMAC combinations require correct encrypt-then-authenticate processing and constant-time tag verification through a vetted library. Never implement JOSE cryptography by hand.

## Serializations

- **Compact Serialization:** five base64url-separated fields in this order: protected header, encrypted key, IV, ciphertext, authentication tag. It is URL-safe and compact, supports one recipient, and has no syntax for shared/per-recipient unprotected headers or JWE AAD.
- **JWE JSON Serialization:** a JSON object. The general form supports multiple recipients, and the flattened form is a simpler single-recipient form. It can carry protected, shared-unprotected, and per-recipient-unprotected headers, encrypted-key values, IV, ciphertext, tag, and AAD where used. It is not optimized for compactness or URL-safe transport.
- **Base64url representation:** binary values are represented in base64url because JSON has no native arbitrary-octet value. This is encoding, not additional encryption.

JWE permits registered header parameters and critical extensions. An implementation must process or reject critical parameters it does not understand. `kid` is a key-selection hint, not a trust anchor. `cty: JWT` is commonly used when the plaintext is a nested JWT; after decryption, the inner token’s signature and claims must still be validated according to its profile.

## Algorithm and key policy

The original JWA registry contains key-management families such as RSA-OAEP, AES key wrap, direct mode, ECDH-ES, and password-based modes, plus content-encryption families including AES-GCM and AES-CBC-HMAC. These names are examples, not a recommendation to accept every registered value. RFC 8725 advises avoiding RSAES-PKCS1-v1_5 encryption (`RSA1_5`) in JWT use; algorithm support and current recommendations must be reviewed against the deployed profile. RFC 9864 defines fully specified algorithm identifiers for cases where older names could be polymorphic.

Configure an allowlist for both `alg` and `enc`, bind each key to its intended purpose and allowed algorithm, and reject mismatched combinations. Enforce suitable key sizes, cryptographically secure randomness, unique nonces where required, rotation, and key separation across environments and token classes. Avoid password-based encryption for service-to-service tokens unless the protocol’s password-hardening and threat assumptions are deliberately met. Avoid compression of secrets in attacker-influenced contexts because length can leak information.

## What the recipient must validate

1. Parse only supported serialization forms and reject malformed, duplicate, conflicting, or ambiguous header parameters.
2. Choose accepted `alg` and `enc` values from local policy; never let the incoming object expand the allowlist.
3. Resolve keys from a trusted configuration/issuer context. Do not fetch arbitrary `jku` or certificate URLs from attacker-controlled headers; constrain remote key discovery to known issuers and safe endpoints.
4. Enforce the expected recipient, key purpose, key type, and recipient count/profile. For a multi-recipient JWE, assume every listed recipient may be able to read the shared plaintext.
5. Authenticate/decrypt using a vetted JOSE library. Reject on any tag, key, padding, or cryptographic failure; do not expose detailed failure differences that create an oracle.
6. If plaintext is a JWT or application object, validate its signature/issuer/audience/time/claims and authorize the action separately.
7. Protect the envelope in transit and at rest. JWE does not hide metadata that appears outside the encrypted plaintext, prevent replay, or protect already-decrypted data in memory/logs.

## Examples

### Worked example

A service sends a confidential report to a customer. It encrypts the report content under an authenticated-encryption CEK and protects that CEK for the customer’s registered public key. The recipient decrypts using the corresponding private key and checks the authentication tag before parsing the report. If the sender’s identity must be established, the service signs the report/JWE with a key that identifies the sender under the protocol, and the recipient validates that signature against a trusted issuer key. It also binds a request ID, recipient, and expiry into authenticated/signed context to address substitution or replay according to the protocol. Merely encrypting to the customer’s public key would not prove who sent the report.

## Cross-item comparison

JWE provides confidentiality plus authenticated encryption of ciphertext and protected metadata, but not sender identity by itself. JWS provides integrity/authenticity from a trusted signing key, but leaves content readable. A nested signed-then-encrypted object can provide both issuer authentication and confidentiality, but both layers and the exact nesting/profile must be validated. TLS protects a channel; JWE protects an object across storage or intermediaries, but key lifecycle, replay, and endpoint exposure remain separate concerns.

## Common mistakes

- Treating `alg` as the content cipher or `enc` as the key-wrapping method.
- Assuming encryption with a recipient’s public key proves the sender’s identity.
- Assuming JSON serialization supports more recipients in every library/profile; check actual support and limits.
- Trusting unprotected headers, `kid`, or token-supplied key URLs as authority.
- Accepting every algorithm named by an incoming JWE or mixing key types/algorithms.
- Leaking decryption distinctions through error messages, timing, or padding oracles.
- Reusing an AES-GCM nonce with the same key or generating CEKs/IVs with weak randomness.
- Assuming a JWE hides external metadata, prevents replay, or protects plaintext after decryption.
- Treating nested JWT encryption as a substitute for validating the inner signature, claims, issuer, and audience.
- Enabling compression where message length can reveal secrets correlated with attacker-controlled input.

## Knowledge checks with answers

1. **What does `alg` select?** The key-management algorithm or mode that establishes/protects the CEK.
2. **What does `enc` select?** The content-encryption algorithm used with the CEK to protect the plaintext.
3. **Does JWE prove which party created the message?** Not by itself; anyone who can encrypt to the recipient may create ciphertext. Add a trusted signature or authenticated protocol when sender identity matters.
4. **How many recipients can compact JWE represent?** One. General JWE JSON serialization can represent multiple recipients.
5. **If the plaintext is a JWT, is decryption enough?** No. Validate the inner token’s signature and claims under its intended profile, then authorize separately.
