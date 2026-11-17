# end-to-end system design case studies — Reference: DNSSEC validation

Sources: [HLD Handbook](https://hld.handbook.academy/), [RFC 4033: DNSSEC introduction and requirements](https://www.rfc-editor.org/rfc/rfc4033.html), [RFC 4034: DNSSEC resource records](https://www.rfc-editor.org/rfc/rfc4034.html), [RFC 4035: DNSSEC protocol modifications](https://www.rfc-editor.org/rfc/rfc4035.html), [RFC 9364: DNSSEC](https://www.rfc-editor.org/rfc/rfc9364.html), [RFC 8932: DNS Privacy Service Operator Recommendations](https://www.rfc-editor.org/rfc/rfc8932.html).

## Scope and version

This lesson explains validation of DNSSEC-signed DNS data by a security-aware resolver. RFC 9364 summarizes the DNSSEC specification set; deployment algorithms, key sizes, rollover procedures, and resolver behavior must be checked against current standards and operational guidance. DNSSEC authenticates DNS data origin and integrity; it does not provide query confidentiality.

## How this group fits the mental model

DNS traditionally returns data without cryptographic proof that the response came from the authorized DNS zone. DNSSEC adds signatures and authenticated public keys so a validating resolver can determine whether signed data matches a chain rooted in configured trust. The resolver can then distinguish authenticated data, authenticated proof that data is absent, insecure delegations, and validation failures according to DNSSEC’s status model.

This prevents certain forged or modified DNS answers from being accepted as valid when validation succeeds. It does not say the record’s content is wise, current, or safe; it authenticates what the zone published. It also does not encrypt the request, hide query names, provide access control, or automatically protect every DNS operation such as zone transfer and dynamic update.

## Supplied names explained

- **Trust anchor:** configured authenticated starting key/data used by a validating resolver to begin building a chain of trust, commonly associated with the DNS root.
- **DNSKEY:** public-key material published in a zone and used in DNSSEC validation/signing relationships.
- **DS (Delegation Signer):** parent-zone record that authenticates a child zone’s DNSKEY relationship, linking the chain across a delegation.
- **RRSIG:** digital signature covering a DNS RRset, with metadata such as signer and validity interval.
- **RRset:** records with the same owner name, class, and type, validated as a set.
- **NSEC/NSEC3:** authenticated denial-of-existence mechanisms. They can prove that a name or record does not exist, with different privacy and operational characteristics; they are not simply ordinary negative-cache answers.
- **Secure / insecure / bogus / indeterminate:** high-level validation outcomes. Secure means a valid chain supports the signed data; insecure means the chain reaches a delegation intentionally without DNSSEC; bogus means data should be signed but validation fails; indeterminate means the resolver cannot determine status. Exact client-facing behavior depends on resolver and DNS state.
- **Key rollover:** controlled transition between signing keys. Parent DS data, child DNSKEY/RRSIG data, TTLs, caches, and timing must align or valid names can become bogus during transition.

## Cross-item comparison

| Mechanism | Protects | Does not protect |
| --- | --- | --- |
| DNSSEC validation | Origin authentication and integrity of signed DNS RRsets and authenticated denial proofs through a chain of trust | Confidentiality, hiding queries, truthfulness of published records, or all DNS operations |
| DoT / DoH / DoQ | Confidentiality/integrity of the client-to-recursive-resolver transport when endpoint authentication is correct | Authenticity of the DNS zone data from the authoritative source |
| TLS to a website | The client-to-website transport and server endpoint identity under certificate validation | That the DNS answer was authentic before the connection, or that the website content itself is trustworthy |

Use DNSSEC and encrypted DNS together when both data validation and transport privacy are required. Encryption does not remove the need for DNSSEC; DNSSEC does not remove the resolver’s ability to see the query.

## Examples

A validating recursive resolver receives a signed answer for `shop.example`. It obtains the relevant RRSIG and DNSKEY records, validates the child key using the parent’s DS, and continues toward its trust anchor. If the chain and signature checks succeed and validity periods are acceptable, it can mark the RRset secure. If a signed zone’s DS was changed incorrectly during key rollover, validation can fail even though the authoritative server is otherwise reachable; a validating resolver may return a failure such as SERVFAIL rather than silently accept data it cannot validate.

When debugging, compare validating and non-validating resolver behavior, inspect DS/DNSKEY/RRSIG/denial records and TTLs, verify the delegation chain and signature times, check clock correctness and rollover state, and distinguish an intentionally unsigned delegation from a broken signed chain. Do not “fix” the outage by globally disabling validation without understanding who is affected and how to restore secure operation.

## Common mistakes

- Calling DNSSEC encryption or query privacy.
- Treating a valid signature as proof that a record is factually correct or benign; it proves authorization/integrity relative to the key chain.
- Assuming every domain must be signed; an authenticated insecure delegation is distinct from bogus signed data.
- Ignoring DS/DNSKEY linkage, signature validity periods, caching, TTLs, and key rollover timing.
- Publishing a DS before the child’s corresponding key is safely deployed, or removing an old key/DS before cached data and the rollover plan permit it.
- Forgetting authenticated denial-of-existence records and negative answers in debugging.
- Assuming DNSSEC authenticates zone transfers, dynamic updates, or client-resolver transport; those require their own protections.
- Disabling validation broadly as a permanent workaround for a broken delegation.
- Confusing transport “secure” indicators with DNSSEC validation status.

## Knowledge checks with answers

1. **A DNSSEC-valid answer says a host points to a malicious server. Is DNSSEC broken?** Not necessarily; DNSSEC authenticates that the data was authorized by the zone’s keys, not that the owner made a good or safe choice.
2. **What does the DS record connect?** The parent zone’s authenticated delegation information to the child zone’s DNSKEY, helping construct the chain of trust.
3. **What is the difference between insecure and bogus?** Insecure means the chain establishes that the delegation is not DNSSEC-secured; bogus means validation was expected but failed. A resolver’s exact status mapping follows the DNSSEC rules and implementation.
4. **Why might a key rollover cause valid users to see resolution failure?** Cached DS/DNSKEY/signature data and publication timing can temporarily create a broken chain; rollover must coordinate parent, child, TTL, and validity windows.
5. **Which layer hides the query from a local network observer?** An authenticated encrypted DNS transport such as DoT, DoH, or DoQ; DNSSEC alone does not.

## Review status

Validation chain and security-status claims are checked against RFCs 4033/4035, with RFC 9364 for the DNSSEC specification set. This lesson remains pending full claim-by-claim audit and manifest omission check.
