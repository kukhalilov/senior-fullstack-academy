# architecture patterns multi-region tenancy and reliability — Reference: ML-DSA

Sources: [NIST FIPS 204 — ML-DSA](https://csrc.nist.gov/pubs/fips/204/final), [FIPS 204 full text](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.204.pdf), [NIST PQC FIPS FAQ (revised 16 June 2026)](https://csrc.nist.gov/Projects/post-quantum-cryptography/faqs), [NIST digital-signature project](https://csrc.nist.gov/Projects/digital-signatures), [NIST FIPS 204 errata and publication materials](https://csrc.nist.gov/pubs/fips/204/final).

## Scope and version

This lesson covers ML-DSA under FIPS 204, published 13 August 2024, checked against NIST’s publication materials and FAQ on 20 November 2026. NIST posted a 31 July 2026 planning note identifying minor issues for a future revision; check the current errata spreadsheet before implementation. ML-DSA was derived from the CRYSTALS-Dilithium submission but the final standardized algorithms and encodings are the FIPS 204 versions, not any arbitrary pre-standardization library format.

## How this group fits the mental model

ML-DSA is a post-quantum digital-signature scheme. A signer uses a protected private key to sign a message; a verifier uses the corresponding public key to check whether the exact message and signature match. Verification establishes validity relative to that public key. A certificate, key-distribution system, protocol, or trusted software supply chain must bind that public key to a claimed identity and context.

## Supplied names explained

- **ML-DSA (Module-Lattice-Based Digital Signature Algorithm)** — NIST’s FIPS 204 signature standard based on the Module Learning With Errors problem. It is for signing and verification, not encryption or key encapsulation.

## Operations, context, and variants

FIPS 204 defines key generation, signing, and verification:

- `ML-DSA.KeyGen()` uses approved random-bit generation and creates public/private key encodings.
- `ML-DSA.Sign(sk, M, ctx)` signs message `M` with private key `sk` and a context string `ctx` of at most 255 bytes. The context defaults to empty; applications may use a nonempty context to separate signature uses, but both sides must agree on it.
- `ML-DSA.Verify(pk, M, signature, ctx)` returns whether the signature is valid for that message, public key, and context. Invalid lengths and malformed values must be rejected as specified.

The default **hedged** signing variant uses fresh random input in addition to the message/key, helping mitigate some side-channel and fault attacks. FIPS 204 also permits a deterministic variant by setting the signing randomizer to 32 zero bytes. NIST warns that the deterministic variant makes some side-channel/fault protections harder; where such attacks are a concern and cannot otherwise be mitigated, use the hedged default. A verifier accepts signatures from either variant, so deterministic signing is not needed for interoperability.

**HashML-DSA** is a separately specified pre-hash mode that signs a digest plus domain-separation information for use cases where processing a very large message directly is impractical or hardware hashing needs differ. Pure ML-DSA is generally preferred by FIPS 204. A signature identifier must distinguish pure ML-DSA from HashML-DSA and identify the pre-hash function; NIST recommends using separate keys for the two forms even though the standard permits a key pair to be used for both.

## Parameter sets and sizes

The standardized parameter sets are:

| Set | NIST security-strength category | Public key | Private key | Signature |
|---|---:|---:|---:|---:|
| ML-DSA-44 | 2 | 1,312 bytes | 2,560 bytes | 2,420 bytes |
| ML-DSA-65 | 3 | 1,952 bytes | 4,032 bytes | 3,309 bytes |
| ML-DSA-87 | 5 | 2,592 bytes | 4,896 bytes | 4,627 bytes |

These sizes have protocol consequences: signatures increase package metadata, certificate chains, handshake messages, firmware manifests, transparency logs, and bandwidth. Test MTU, fragmentation, maximum header/body sizes, storage, CPU, and verification throughput in the full system. FIPS 204 notes the security category for ML-DSA-44 can be reduced from category 2 to category 1 when an approved random-bit generator provides at least 128 but less than 192 bits of security; meet the standard’s RBG requirements.

NIST’s June 2026 FAQ permits a KeyGen seed as an alternative representation for a key pair or private key in the described FIPS-module context; a seed is still secret key material and must receive equivalent protection. Do not assume every API, HSM, certificate format, or third-party library accepts seed-form keys.

## Security properties and limits

ML-DSA is intended to detect message modification and authenticate the signer relative to a trusted public key. NIST considers it designed to resist adversaries with large-scale quantum computers under current cryptanalysis. That is a security assessment, not a proof against future mathematics, implementation bugs, side channels, weak randomness, stolen signing keys, malicious build systems, or incorrect trust roots.

An ML-DSA signature does not encrypt a message, establish confidentiality, prevent replay, decide whether a signer is authorized, or automatically provide legal non-repudiation. Signatures can be copied and replayed unless the protocol binds them to a nonce, version, timestamp, audience, transaction, or other freshness context. A signature over a firmware file says the matching key signed those bytes; the verifier still needs a trustworthy policy for which key and version may be installed.

## Deployment and migration

Use vetted implementations that follow the final FIPS 204 byte encodings, parameter choices, context rules, and input validation. Protect private keys in an HSM or key-management boundary where appropriate; control signing authorization, CI identities, audit logs, rotation, revocation, backup, and destruction. Test known-answer vectors, malformed keys/signatures, randomness failure, context mismatch, cross-library interoperability, and the NIST errata list. Side-channel behavior depends on implementation and platform; algorithm standardization alone does not demonstrate resistance.

For a post-quantum migration, inventory long-lived trust anchors and signed artifacts (software/firmware, certificates, identity, package repositories, code signing, backups, and update channels). Plan a transition where verifiers can validate old signatures for retained artifacts while newly produced artifacts move to the selected profile. If hybrid signatures are required, use a standardized signature container/profile and explicit policy for whether both signatures are mandatory; do not invent ambiguous concatenation or downgrade behavior.

FIPS 204 standardization is distinct from FIPS 140 module validation. For regulated deployments, verify the specific cryptographic module certificate, approved mode, algorithm validation status, and full protocol/profile requirements.

## Examples

### Worked example

A software publisher signs each release manifest with an ML-DSA private key held by a release-signing service. The manifest includes the artifact digest, product, version, channel, and release metadata. A client first verifies the manifest signature against a trusted publisher key, then enforces policy that the product/channel key is authorized and the version is not a rollback. The signed metadata includes a release sequence or other anti-rollback value. The signature does not encrypt the artifact; TLS or another delivery mechanism protects transport, and the artifact digest binds the downloaded bytes to the signed manifest.

## Cross-item comparison

ML-DSA signs/verifies; ML-KEM establishes shared secret material; JWS is a JSON/JOSE container that can carry signatures or MACs; JWE encrypts content; TLS defines a protocol that can combine algorithms, identities, key derivation, and replay/downgrade defenses. Choosing a signature algorithm does not by itself produce a secure authentication or software-update protocol.

## Common mistakes

- Confusing ML-DSA with ML-KEM because both use module-lattice cryptography.
- Treating a valid signature as proof of human identity, authorization, freshness, or confidentiality.
- Signing one byte representation and verifying a differently normalized message.
- Reusing keys across pure ML-DSA and HashML-DSA without following the profile; NIST recommends separate keys.
- Assuming deterministic signatures are always safer or that they avoid all randomness requirements; key generation still needs secure randomness.
- Ignoring the context string or pre-hash identifier, which can make valid signatures unverifiable or cross-context vulnerable.
- Underestimating multi-kilobyte signatures in certificates, manifests, protocols, and constrained links.
- Accepting pre-standardization Dilithium encodings as FIPS 204 ML-DSA without verifying interoperability.
- Assuming FIPS standardization proves a deployed implementation is side-channel resistant or FIPS 140 validated.
- Forgetting to check the errata identified by NIST in July 2026.

## Knowledge checks with answers

1. **Does ML-DSA encrypt data?** No. It signs messages and verifies signatures.
2. **What does a successful verification establish?** The signature matches the exact message and public key under the selected parameter set/context; identity and authorization still depend on trust and policy.
3. **What is the default signing style?** Hedged signing uses fresh random input; FIPS 204 also permits deterministic signing, with side-channel/fault trade-offs.
4. **What is HashML-DSA?** A specified pre-hash variant for cases needing pre-hashing; its identifier must specify the mode/hash, and NIST generally prefers pure ML-DSA.
5. **How large is the ML-DSA-65 signature?** 3,309 bytes under FIPS 204.
6. **Does standardization guarantee a validated, secure implementation?** No. Verify current errata, module validation, side-channel protections, key handling, and protocol integration.
