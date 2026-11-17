# end-to-end system design case studies — Reference: DNS over QUIC (DoQ)

Sources: [HLD Handbook](https://hld.handbook.academy/), [RFC 9250: DNS over Dedicated QUIC Connections](https://www.rfc-editor.org/rfc/rfc9250.html), [RFC 9000: QUIC transport](https://www.rfc-editor.org/rfc/rfc9000.html), [RFC 8932: Recommendations for DNS Privacy Service Operators](https://www.rfc-editor.org/rfc/rfc8932.html), [RFC 4033: DNSSEC introduction and requirements](https://www.rfc-editor.org/rfc/rfc4033.html).

## Scope and version

This lesson covers the standardized DNS-over-QUIC mapping in RFC 9250 for client/stub-to-recursive-resolver use. It does not describe generic DNS carried over arbitrary QUIC streams. Check current resolver/client support, QUIC version negotiation, network policy, and operational behavior before deployment.

## How this group fits the mental model

DoQ carries DNS messages over QUIC, which uses UDP as its underlying transport and provides encrypted connections via TLS 1.3 as part of QUIC. It gives a privacy-protected channel from the client to the selected resolver and multiplexes independent streams without TCP’s transport-level head-of-line blocking across those streams. It cannot prevent all packet loss effects within one stream, hide the query from the resolver, or guarantee that UDP traffic will pass through every network.

RFC 9250 specifies UDP port 853 by default and says DoQ must not use UDP port 53, avoiding confusion with classic DNS over UDP. Client and resolver support are both required. As with DoT and DoH, the resolver is a trust choice, and DNSSEC remains a separate mechanism for validating DNS data origin/integrity.

## Supplied names explained

- **QUIC connection:** secure transport over UDP with connection establishment, loss recovery, congestion control, and stream multiplexing as defined by QUIC specifications.
- **DoQ:** DNS message mapping over dedicated QUIC connections with the `doq` ALPN identifier and protocol-specific stream/message rules defined by RFC 9250.
- **UDP port 853:** default destination port for DoQ in RFC 9250; use of port 53 is prohibited by the specification.
- **Connection migration:** QUIC’s ability to maintain a connection across some network path/address changes, subject to protocol validation and implementation/network behavior; it does not guarantee continuity through all address changes or outages.
- **DNSSEC:** validates signed DNS data; separate from encryption of the client-resolver path.

## Cross-item comparison

| Protocol | Client transport | Practical deployment considerations |
| --- | --- | --- |
| DoT | TLS over TCP, default port 853 | Familiar TCP firewall behavior; persistent connections can be reused; TCP handshake and transport behavior apply |
| DoH | DNS messages over HTTPS | Can use HTTP infrastructure and ports; shares web transport paths but requires endpoint discovery/policy and may complicate network-level DNS visibility/control |
| DoQ | QUIC over UDP, default port 853 | Stream multiplexing and QUIC connection behavior can help latency and network migration, but UDP reachability, client/server support, and QUIC-aware operations matter |
| Classic DNS | Usually UDP or TCP port 53 | Broad compatibility, but transport is not encrypted by itself; use other security mechanisms as needed |

No protocol is automatically “fastest” or “most private” in every network. Measure connection setup, reuse, loss, resolver latency, battery/resource use, fallback behavior, and network blocking for the target clients.

## Examples

A mobile device moves from Wi-Fi to cellular during a session with its recursive resolver. QUIC may be able to migrate the connection after validating the new path, avoiding a full connection restart in some conditions. If UDP 853 is blocked, DoQ cannot be assumed to work; the client needs a documented alternative such as another supported encrypted DNS transport or a policy-defined error. Silent fallback to plaintext can violate the privacy contract.

At the service, monitor connection establishment failures, handshake/ALPN errors, UDP reachability, stream resets, packet loss, query latency, resolver error rates, and traffic by client/network type. Do not assume a successful QUIC handshake proves the DNS service can answer correctly; correlate DNS-layer results and DNSSEC validation separately.

## Common mistakes

- Confusing DoQ with DNS sent over any QUIC-capable HTTP service; RFC 9250 specifies a dedicated DNS mapping.
- Using UDP port 53 for DoQ despite RFC 9250’s explicit port rule.
- Assuming QUIC migration always works or preserves a connection across any network disruption.
- Assuming UDP 853 is universally reachable or that every client/resolver supports DoQ.
- Claiming DoQ conceals query names from the resolver or makes DNSSEC unnecessary.
- Treating lower transport setup time as proof that end-to-end DNS resolution is faster in a particular deployment.
- Silently downgrading to unencrypted DNS when QUIC is blocked without accounting for the privacy promise.
- Monitoring only QUIC connection success and ignoring resolver correctness, DNSSEC state, and answer latency.

## Knowledge checks with answers

1. **What transport and default port does RFC 9250 specify?** DoQ uses QUIC over UDP and defaults to UDP port 853; it must not use UDP port 53.
2. **Does DoQ prevent the resolver from seeing a domain lookup?** No. It protects the transport to the resolver; that resolver processes the query.
3. **If a client changes networks, is the existing DoQ connection guaranteed to survive?** No. QUIC supports migration under its protocol conditions, but path validation, network changes, peer behavior, and implementation determine the outcome.
4. **Why might an operator offer DoT or DoH as well?** Client support and network reachability differ. The fallback policy should preserve the stated privacy level and be measured rather than silently downgrading.

## Review status

The dedicated mapping, ALPN, transport, and port rules are checked against RFC 9250; QUIC transport behavior against RFC 9000. Privacy and DNSSEC distinctions are checked against RFC 8932 and RFC 4033. This lesson remains pending full claim-by-claim audit and manifest omission check.
