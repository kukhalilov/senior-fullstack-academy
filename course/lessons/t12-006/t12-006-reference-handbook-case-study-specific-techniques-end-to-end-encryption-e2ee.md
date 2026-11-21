# end-to-end system design case studies — Reference: End-to-end encryption (E2EE)

Sources: [Signal Protocol specifications](https://signal.org/docs/), [PQXDH key agreement](https://signal.org/docs/specifications/pqxdh/), [Double Ratchet](https://signal.org/docs/specifications/doubleratchet/), [Signal safety numbers](https://support.signal.org/hc/en-us/articles/360007060632-What-is-a-safety-number-and-why-do-I-see-that-it-changed), [Signal automatic key verification](https://support.signal.org/hc/en-us/articles/10223569377562-Automatic-Key-Verification).

## Scope and version

This lesson teaches the supplied concept at the system-design level. Product behavior and feature availability vary by version and deployment; verify the cited official documentation for the versions and platforms you operate.


## How this group fits the mental model

End-to-end encryption (E2EE) is a protocol and key-management design in which communicating endpoint devices encrypt and decrypt message content. A relay service can route or store ciphertext without being entrusted with the content keys. That limits what a compromised or curious intermediary can read, but the claim depends on where the endpoints and keys actually live.

E2EE is not the same as TLS. TLS protects a connection between adjacent endpoints, commonly a client and a service; the service can normally read data after TLS terminates. E2EE aims to keep application content encrypted across the service so only authorized communicating devices can decrypt it. E2EE does not automatically hide traffic timing, message size, IP addresses, contact relationships, or other metadata. It does not protect a compromised endpoint, a screenshot, an unlocked device, or a backup whose keys are available to another party.

## Supplied names explained

- **Identity keys and authentication:** bind a protocol session to key material. A server can distribute public keys, but a malicious or compromised key directory may substitute keys unless clients have a verification or transparency mechanism.
- **Asynchronous key agreement:** lets a sender start a session while the recipient is offline by retrieving prepublished key material. Signal's PQXDH specification is one example; its security claims and limitations are specific to that protocol revision and its assumptions.
- **Ratchet:** advances message keys over time. Signal's Double Ratchet specification describes deriving new keys so that compromise of a current key does not automatically reveal all past and future message keys. Exact protection depends on protocol state, key deletion, and compromise timing.
- **Authenticated encryption:** protects ciphertext integrity as well as confidentiality; it detects tampering under the protocol's key and nonce rules.
- **Device and group management:** every added device, group membership change, key rotation, and history transfer changes who can decrypt which messages and when.

These components must be composed by a reviewed protocol. Do not invent a custom encryption scheme by combining library primitives ad hoc.

**Current-spec note (2026-11-17):** Signal's Double Ratchet specification revision 4 (dated 2025-11-04) includes the original Double Ratchet plus sections for the Sparse Post-Quantum Ratchet and the Triple Ratchet, which combines secure-messaging protocols for hybrid security. These are specification mechanisms, not a guarantee that every application or installed client version implements or enables them. Check the target protocol/library release and its deployment status.

## Key verification and user identity

Key verification can help detect unexpected key changes or a person-in-the-middle substitution. Signal safety numbers are a product example for comparing a conversation's cryptographic identity keys. Signal itself cautions that a safety number does not prove the contact's real-world identity: users still need a trustworthy way to associate a key with the intended person. An unverified encryption session may still encrypt end-to-end to the wrong key holder.

Key changes can be legitimate after reinstalling or changing devices, but should not be silently treated as harmless. Design for visible changes, re-verification, device revocation, and recovery from account takeover. A centralized account recovery process that can restore plaintext keys may weaken the service's E2EE guarantee; state explicitly what the recovery provider can access.

## Multi-device, history, and backups

Decide whether a sender encrypts separately to each device, whether a service distributes group keys, or whether a group protocol manages membership and epochs. Removing a device must stop it receiving future keys; it cannot erase plaintext or keys it already copied. New devices need a secure enrollment mechanism and a policy for old history.

Backups are a separate security boundary. If an unencrypted or provider-readable backup contains message keys or plaintext, the conversation may be E2EE in transit but not end-to-end protected at rest. If backups are encrypted with a user-held recovery key, loss of that key may make the backup unrecoverable. Explain this tradeoff in the product instead of claiming that all message history is protected without qualification.

## Threat model and operational costs

E2EE reduces server-side content access, but the service may still observe some routing metadata and must operate a key directory, encrypted-message queue, abuse reporting path, device lifecycle, and recovery system. Server-side search, moderation, legal discovery, and content-based analytics become limited or require client-side processing or carefully designed privacy-preserving systems. These are product and threat-model decisions; they do not justify weakening key authenticity without disclosure.

Test protocol versions, cryptographic libraries, device enrollment, key changes, offline delivery, group membership changes, backup/restore, and downgrade behavior. Use a published, independently reviewed protocol and keep cryptographic implementation details out of application code where maintained libraries exist.

## Cross-item comparison

TLS protects one transport connection and is usually terminated at a service endpoint; E2EE protects message content across the service when the service does not hold the content keys. The two can and generally should be layered: TLS protects each network hop, while E2EE protects the message body from the relay. A signed safety number or comparable key-verification mechanism addresses key authenticity; it does not replace transport encryption, endpoint security, or a trusted way to establish who a real-world contact is.

## Examples

For private direct messages, define whether the service must be unable to read message bodies, whether users verify contact keys, how users add a second phone, what happens when a phone is lost, and whether history is backed up. Then draw the plaintext boundary: sender device → ciphertext relay/storage → recipient device. Mark every exception, such as push notification previews, server-side attachment processing, crash reports, or cloud backups. A design is only as strong as its least-protected copy of the content or key.

## Common mistakes

- Treating one vendor or protocol profile as universal behavior.
- Assuming the mechanism removes the need to design for retries, failure, security, and operations.
- Choosing a tool before stating the workload and correctness requirement.

## Knowledge checks with answers

1. **Does HTTPS provide E2EE from the service operator?** Usually no: HTTPS/TLS protects the client-to-service connection, and the service can normally read request data after termination. E2EE requires the service not to hold the application content keys.
2. **Does key verification prove a person's legal identity?** No. It helps compare or authenticate cryptographic keys; identity binding depends on the verification channel and its trust assumptions.
3. **Can a service claiming E2EE still expose metadata?** Yes. Content confidentiality does not, by itself, conceal routing, timing, size, or relationship metadata.
4. **What happens when a device is removed from a group?** It should not receive future group keys, but removal cannot erase plaintext or keys the device already retained.
