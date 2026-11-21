# architecture patterns multi-region tenancy and reliability — Reference: ML-KEM

Sources: [NIST FIPS 203 — ML-KEM](https://csrc.nist.gov/pubs/fips/203/final), [NIST SP 800-227 — Recommendations for Key-Encapsulation Mechanisms](https://csrc.nist.gov/pubs/sp/800/227/final), [NIST PQC FIPS FAQ (revised 16 June 2026)](https://csrc.nist.gov/Projects/post-quantum-cryptography/faqs), [NIST FIPS 203 errata and publication materials](https://csrc.nist.gov/pubs/fips/203/final), [NIST post-quantum cryptography project](https://csrc.nist.gov/Projects/post-quantum-cryptography).

## Scope and version

This lesson covers ML-KEM as specified by FIPS 203, published 13 August 2024, and NIST’s secure-use guidance SP 800-227, finalized September 2025. NIST posted a planning note on 17 November 2025 identifying a FIPS 203 issue for a future revision; consult the linked current errata spreadsheet and NIST FAQ before implementation. This is a cryptographic protocol concept, not an implementation recipe.

## How this group fits the mental model

ML-KEM is a post-quantum **key-establishment** mechanism. One party publishes an encapsulation key. Another party uses it to produce a ciphertext and a shared secret. The recipient uses its decapsulation key and that ciphertext to recover the same shared secret. The shared secret is then fed into a suitable key-derivation/key-schedule and symmetric cryptography. ML-KEM does not directly encrypt arbitrary application files and does not authenticate which sender encapsulated a key.

## Supplied names explained

- **ML-KEM (Module-Lattice-Based Key-Encapsulation Mechanism)** — NIST’s FIPS 203 KEM based on the Module Learning With Errors problem. It was selected from the CRYSTALS-Kyber submission and standardized under the NIST name; implementations must follow FIPS 203, not assume that every earlier Kyber version or API is wire-compatible.

## The three operations

FIPS 203 specifies three external algorithms:

1. `ML-KEM.KeyGen()` generates an encapsulation key (`ek`) and a decapsulation key (`dk`) using approved random-bit generation.
2. `ML-KEM.Encaps(ek)` takes the recipient’s public encapsulation key and returns a ciphertext (`c`) plus a shared secret (`K`). The sender retains `K` and sends `c`.
3. `ML-KEM.Decaps(dk, c)` uses the private decapsulation key and received ciphertext to recover the corresponding shared secret.

The public key can be distributed openly, but it must be authenticated as belonging to the intended recipient. Otherwise an active attacker can substitute its own key and establish a secret with the sender. The KEM’s shared secret must not be used as a raw application password or directly reused across protocols. Derive context-bound keys with the protocol’s specified KDF, bind identities/transcript and algorithm choices as required, and use authenticated encryption with correct nonce handling.

### Invalid ciphertext and implicit rejection

FIPS 203’s decapsulation uses implicit rejection rather than returning a simple public “invalid ciphertext” result for the underlying malformed-ciphertext case. This is part of the design’s security behavior; implementation timing, error handling, or downstream protocol aborts must not accidentally reveal an explicit rejection oracle. Follow SP 800-227 and the protocol specification, and do not modify the decapsulation flow or add distinguishable error responses casually.

### Parameter sets

FIPS 203 defines `ML-KEM-512`, `ML-KEM-768`, and `ML-KEM-1024`. In broad terms, the suffix corresponds to increasing security strength with decreasing performance. NIST describes security categories 1, 3, and 5 respectively; choose according to the governing protocol/security profile, not from the name alone. Public keys, ciphertexts, and secret-key material are substantially larger than many classical elliptic-curve counterparts, which affects handshake size, certificates or protocol messages, MTU/fragmentation, memory, and storage. Use the exact standardized encoded sizes from FIPS 203 when sizing a protocol.

## Security properties and limits

ML-KEM is designed so a party with the recipient key can establish a shared secret over a public channel, with security tied to the assumed hardness of module-LWE and the FIPS construction. NIST considers it secure against an adversary with a large-scale quantum computer under current analysis; this is not a mathematical proof against all future cryptanalysis or implementation attacks.

ML-KEM by itself does not provide:

- sender authentication or a digital signature;
- a certificate, identity-binding, or trust-distribution mechanism;
- forward secrecy in every protocol (that depends on ephemeral key generation, erasure, and protocol design);
- protection against endpoint compromise, weak randomness, side channels, downgrade, replay, or key substitution;
- a complete hybrid classical/post-quantum protocol or rule for combining secrets.

If hybrid key establishment is required, use a standardized protocol and combiner with explicit binding and downgrade rules. Do not invent `SHA256(classicalSecret || mlkemSecret)` on your own. NIST SP 800-227 discusses KEM use and approved key combiners; the transport protocol must specify how secrets, identities, and transcript hashes are combined.

## Migration and operational requirements

Start with a cryptographic inventory: which long-lived secrets or signatures must remain secure for years; which TLS, VPN, PKI, messaging, artifact-signing, backup, and vendor systems use public-key cryptography; and what protocol versions permit migration. “Harvest now, decrypt later” matters when an attacker can record traffic today and decrypt it after a future cryptographic break, so prioritize long-lived confidential data.

Before rollout, test:

- protocol negotiation and downgrade resistance;
- exact key/ciphertext sizes through proxies, load balancers, firewalls, and MTUs;
- certificate or handshake size and fragmentation behavior;
- latency, CPU, memory, queueing, and denial-of-service limits under peak load;
- key generation, storage, rotation, backup, revocation, and destruction;
- current FIPS vectors, NIST errata, library version, side-channel resistance, and cryptographic-module validation where required;
- interoperability with the actual peer implementations and profiles.

FIPS algorithm standardization does not automatically mean a particular library/module is FIPS 140 validated or that the full application protocol is approved for a regulated use. Verify the module certificate, approved-mode configuration, and procurement requirements separately.

## Examples

### Worked example

A client and server need a post-quantum-capable handshake. The server’s authenticated certificate or protocol identity binds its ML-KEM encapsulation key to the intended endpoint. The client encapsulates to that key; both sides combine the resulting secret into the protocol’s specified transcript-bound key schedule. If the protocol also uses a classical exchange, it applies the protocol’s standardized hybrid combiner and downgrade protection. Subsequent application data uses the protocol’s symmetric authenticated encryption. The team measures handshake bytes and CPU across the real network path and tests fallback behavior without silently downgrading an attacker-controlled negotiation.

## Cross-item comparison

ML-KEM establishes shared key material; ML-DSA creates/validates signatures; JWS serializes signatures/MACs; JWE serializes encrypted messages; TLS and other protocols define how these primitives negotiate, authenticate peers, derive traffic keys, and prevent replay/downgrade. They are not interchangeable. A KEM public key authenticates neither a human nor a software publisher.

## Common mistakes

- Calling ML-KEM a public-key encryption algorithm for arbitrary data instead of a KEM.
- Treating the encapsulation key as authentic because it is public.
- Using `K` directly as an AES key without the protocol’s key schedule and context binding.
- Assuming the KEM authenticates the sender or provides application-level forward secrecy by itself.
- Combining classical and post-quantum secrets with a home-grown combiner.
- Treating pre-standardization Kyber APIs and FIPS 203 ML-KEM as automatically interoperable.
- Ignoring invalid-ciphertext behavior, timing, or downstream explicit rejection paths.
- Forgetting message-size, MTU, certificate, proxy, and denial-of-service effects.
- Assuming “NIST standard” means every library is validated or the system is quantum-proof.
- Failing to check NIST’s posted FIPS 203 errata before selecting an implementation.

## Knowledge checks with answers

1. **What does encapsulation return?** A ciphertext to send and a shared secret retained for the protocol’s key schedule.
2. **Does ML-KEM sign or authenticate the sender?** No. Authenticate the public key and peer through a certificate or protocol mechanism; use a signature when required.
3. **Can ML-KEM encrypt a large file directly?** No. Use its shared secret to derive symmetric keys, then encrypt data with an authenticated symmetric scheme.
4. **What are the standardized parameter-set names?** ML-KEM-512, ML-KEM-768, and ML-KEM-1024.
5. **Can a team define its own hybrid combiner?** It should not; use the protocol’s specified combiner and follow NIST SP 800-227 guidance.
6. **Does standardized ML-KEM imply a FIPS-validated deployment?** No. Validate the cryptographic module, approved mode, protocol, and deployment separately.
