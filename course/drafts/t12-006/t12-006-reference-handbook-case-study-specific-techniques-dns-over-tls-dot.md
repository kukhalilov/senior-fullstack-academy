# end-to-end system design case studies — Reference: DNS over TLS (DoT)

Sources: [HLD Handbook](https://hld.handbook.academy/), [RFC 7858: DNS over TLS](https://www.rfc-editor.org/rfc/rfc7858.html), [RFC 8310: Usage Profiles for DNS over TLS and DNS over DTLS](https://www.rfc-editor.org/rfc/rfc8310.html), [RFC 8932: Recommendations for DNS Privacy Service Operators](https://www.rfc-editor.org/rfc/rfc8932.html), [RFC 4033: DNSSEC introduction and requirements](https://www.rfc-editor.org/rfc/rfc4033.html).

## Scope and version

This reference explains DNS over TLS between a DNS client/stub and a recursive resolver. It is not a guide to encrypting traffic between every DNS server or protecting the resolver’s upstream queries. Port and TLS behavior below follows RFC 7858; resolver authentication profiles and implementation support should be checked against current RFC 8310 and the chosen software.

## How this group fits the mental model

Ordinary DNS on the local network is often visible to an on-path observer and can be modified if the path is not otherwise protected. DoT carries the DNS message over a TLS connection to a resolver, protecting that transport from passive observation and tampering between those endpoints when TLS is correctly authenticated. The resolver can still see the query and may log, retain, or disclose it; DoT changes which network parties can observe the client’s DNS traffic and which resolver the client trusts.

By default, RFC 7858 uses TCP port 853 and requires the connection to begin with TLS; cleartext DNS must not be mixed on the configured DoT port. DoT is a stub-to-recursive-resolver protocol, and network firewalls that only allow classic DNS may block it. It does not by itself prove that the DNS answer is authentic from the authoritative zone.

## Supplied names explained

- **Stub/client:** the device or local resolver that sends the query to a recursive resolver.
- **Recursive resolver:** obtains or serves cached DNS answers and sees the client’s query names.
- **TLS server authentication:** verifies the resolver endpoint identity according to the selected profile (such as a configured authentication name and certificate validation). Encryption without correct authentication can leave a client connected securely to the wrong endpoint.
- **TCP port 853:** RFC 7858’s default DoT port; clients and servers may use another mutually configured port under the RFC’s rules.
- **DNSSEC:** validates signed DNS data through a trust chain. It complements encrypted transport rather than being replaced by it.

## Cross-item comparison

| Property | DoT provides when correctly configured | DoT does not provide by itself |
| --- | --- | --- |
| Client-to-resolver confidentiality | Encrypts DNS messages on that TLS connection | Hiding query names from the chosen resolver, endpoint, all network metadata, or all later DNS hops |
| Transport integrity and server identity | TLS protects the connection and authenticates the endpoint under correct certificate/profile validation | Authenticating that a DNS record was published by the legitimate zone owner; that is DNSSEC’s role |
| Availability | A protected resolver connection | Guaranteed bypass of network blocks, resolver uptime, or correct failover; clients need fallback policy consistent with the privacy promise |
| Privacy policy | Provides a mechanism for transport privacy | Preventing the resolver from logging or using data; evaluate resolver policy and jurisdiction |

DoT and DoH both use TLS-based protection for the client-to-resolver path but have different application transports and network deployment characteristics. DoQ maps DNS to QUIC. These protocols do not make DNSSEC redundant, and DNSSEC does not encrypt queries.

## Examples

An employee’s laptop is configured to use a managed DoT resolver. On a public Wi-Fi network, a local observer can no longer read the DNS message contents from that TLS connection, assuming certificate validation succeeds. The managed resolver still learns that the user looked up the requested domain. If the laptop silently falls back to plaintext DNS when port 853 is blocked, the user’s privacy expectation is weakened; the client’s failure/fallback behavior must match policy and be tested.

For a reliable deployment, configure the resolver’s authentication name and trust anchors correctly, ensure certificate renewal and monitoring, decide whether failures fail closed or use a documented secure alternative, observe connection and query error rates without logging unnecessary query content, and ensure local network/firewall support. If validating DNSSEC at the resolver, separately monitor signature validity, trust-anchor updates, and validation failures.

## Common mistakes

- Saying “DoT secures DNS” without specifying the client-to-resolver segment and the resolver’s trust/privacy policy.
- Confusing encryption in transit with DNSSEC data-origin validation.
- Encrypting to a resolver without validating that it is the intended resolver.
- Assuming the resolver cannot see or log queries because the client used TLS.
- Silently downgrading to cleartext after a connection failure when the product promised encrypted DNS.
- Forgetting TCP port 853 can be blocked, requiring explicit network and operational policy.
- Assuming DoT encrypts resolver-to-authoritative traffic or all DNS hops; scope each connection separately.
- Treating availability fallback and privacy enforcement as the same policy without deciding the user-facing trade-off.

## Knowledge checks with answers

1. **Can the Wi-Fi operator read the query name on a correctly authenticated DoT connection?** The TLS-protected query contents are encrypted on that client-to-resolver connection, though the operator may still observe metadata such as connection timing/address and the resolver itself sees the query.
2. **Can the resolver see the query name?** Yes. It must process the query; resolver retention/use is a separate policy question.
3. **Does DoT prove an answer is signed by the domain owner?** No. DNSSEC validation addresses authenticity and integrity of DNS data.
4. **What is a dangerous fallback?** Quietly using plaintext DNS after a DoT failure while continuing to claim the request remained private.

## Review status

The port, TLS transport, and no-cleartext-mixing requirements are checked against RFC 7858; DNS privacy operator cautions and DNSSEC distinction are checked against RFC 8932/RFC 4033. This lesson remains pending full claim-by-claim audit and manifest omission check.
