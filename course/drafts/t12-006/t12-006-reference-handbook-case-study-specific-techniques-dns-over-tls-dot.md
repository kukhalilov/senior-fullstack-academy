# end-to-end system design case studies — Reference: DNS over TLS (DoT)

Sources: [RFC 7858: DNS over TLS](https://www.rfc-editor.org/rfc/rfc7858.html), [RFC 8310: Usage Profiles for DNS over TLS and DNS over DTLS](https://www.rfc-editor.org/rfc/rfc8310.html), [RFC 9499: DNS Terminology](https://www.rfc-editor.org/rfc/rfc9499.html).

## Scope and version

DNS over TLS (DoT) transports DNS messages through TLS connections. RFC 7858 primarily describes stub-to-recursive-resolver traffic and two usage profiles; RFC 8310 updates the usage-profile guidance. A client and resolver must agree on endpoint discovery, authentication policy, and fallback behavior. DoT protects a transport hop; it does not encrypt DNS across the entire resolution chain or hide queries from the chosen resolver.

## How this group fits the mental model

Traditional stub-to-recursive DNS commonly sends messages over UDP or TCP port 53, which an on-path observer may read or alter. DoT wraps DNS in TLS over a dedicated transport, conventionally TCP port 853. When the client authenticates the resolver correctly, TLS protects query content and response integrity on that connection. The recursive resolver still sees the questions and can log them, and it separately communicates with authoritative servers unless it uses another encrypted DNS transport for those hops.

The privacy result depends on authentication. Opportunistic encryption can encrypt against passive observation but may not authenticate the intended resolver strongly enough to prevent an active attacker from substituting a resolver. Strict profiles authenticate and fail when the expected secure channel cannot be established. The application must choose whether privacy or availability takes priority when encrypted DNS is blocked.

## Supplied names explained

- **DoT**: DNS messages over TLS. It uses a dedicated DNS-over-TLS service, conventionally TCP port 853.
- **Stub resolver**: client-side DNS component that sends queries to a recursive resolver on behalf of applications.
- **Recursive resolver**: resolves names by consulting cached data and authoritative DNS infrastructure. The chosen resolver can observe and potentially log queries.
- **Opportunistic profile**: attempts encrypted DNS but may permit fallback according to policy; fallback can reveal queries in plaintext and may enable downgrade.
- **Strict profile**: requires the configured authenticated encrypted resolver; if connection/authentication fails, it does not silently use cleartext DNS.
- **Resolver authentication**: validation that the TLS server identity matches the configured resolver identity. Encryption without authenticating the intended endpoint does not prevent an active intermediary from impersonating it.
- **Connection reuse**: persistent TLS connections amortize handshake cost and support multiple DNS messages; clients and resolvers still need limits, idle cleanup, and failure recovery.

## Cross-item comparison

DoT carries DNS over TLS on a recognizable dedicated port. DoH carries DNS exchanges as HTTPS requests, which integrates with HTTP infrastructure and can share port 443. DoQ maps DNS onto QUIC streams and avoids TCP-level head-of-line blocking between independent streams. All three can encrypt the client-to-resolver hop; none makes the recursive resolver unable to observe queries, and none substitutes for DNSSEC data validation.

DoT is often simple for operating-system or network resolver policy because it remains DNS-specific and uses a dedicated endpoint. The same distinction makes it straightforward for a network operator to identify or block. Choose based on managed-device requirements, firewall behavior, performance, resolver support, and privacy policy.

## Examples

A managed laptop is configured with a strict DoT resolver hostname and trust validation. The stub establishes TLS to the resolver and sends DNS messages over the connection. If a captive portal blocks port 853, the lookup fails until the device detects the portal or policy provides a safe recovery path. Silently retrying on port 53 would improve apparent availability but violate the strict privacy policy; an explicit fallback should be designed and disclosed.

At scale, reuse connections, bound concurrent connections, rate-limit abusive clients, and monitor handshake failures, query latency, and resolver saturation. Keep TLS certificate/identity rotation, endpoint discovery, and failover configuration up to date. Do not assume TLS on this link means recursive-to-authoritative traffic is also encrypted.

## Common mistakes

- Assuming DoT hides DNS queries from the recursive resolver.
- Treating encryption as proof that DNS answers are authoritative or DNSSEC-valid.
- Using opportunistic mode while claiming queries can never fall back to plaintext.
- Failing to authenticate the resolver endpoint.
- Assuming DoT protects recursive-to-authoritative traffic automatically.
- Forgetting port 853 can be blocked or monitored by network operators.
- Creating a new TLS connection for every query without measuring handshake cost and connection limits.
- Treating DoT as interchangeable with DNSSEC; they protect different properties.

## Knowledge checks with answers

1. **What does DoT protect?** DNS messages on the TLS connection between the configured client and resolver, subject to correct authentication.
2. **Can the recursive resolver still see query names?** Yes. It must process the questions and may log them.
3. **What is the strict-profile trade-off?** It avoids silent plaintext fallback but DNS lookups can fail when the encrypted resolver is unreachable.
4. **Does DoT validate DNS data authenticity?** No. DNSSEC provides data-origin authentication and integrity for signed zones; DoT protects the transport hop.
